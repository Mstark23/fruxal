// =============================================================================
// services/v2/qb-aggregator.ts
// Pulls financial data from QuickBooks Online and writes real numbers into
// business_profiles so the diagnostic prompt gets actuals, not estimates.
//
// Data pulled:
//   P&L summary (trailing 12 months) → revenue, COGS, gross profit, expenses, net income
//   AR aging report                  → overdue buckets 30/60/90+ days
//   Payroll expense total             → from expense accounts tagged "Payroll"
//   Top 10 expense categories         → for operational leak detection
//   Company info                      → employee count, fiscal year end
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const QBO_BASE = process.env.QUICKBOOKS_ENVIRONMENT === "sandbox"
  ? "https://sandbox-quickbooks.api.intuit.com"
  : "https://quickbooks.api.intuit.com";

const INTUIT_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const ENC_KEY = Buffer.from(process.env.QB_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || "", "hex");

// ── Encryption helpers ────────────────────────────────────────────────────────
export function encryptToken(plain: string): string {
  const iv  = randomBytes(16);
  const key = ENC_KEY.length === 32 ? ENC_KEY : Buffer.alloc(32, ENC_KEY);
  const c   = createCipheriv("aes-256-cbc", key, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return iv.toString("hex") + ":" + enc.toString("hex");
}

export function decryptToken(cipher: string): string {
  const [ivHex, encHex] = cipher.split(":");
  const key = ENC_KEY.length === 32 ? ENC_KEY : Buffer.alloc(32, ENC_KEY);
  const d   = createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
  return Buffer.concat([d.update(Buffer.from(encHex, "hex")), d.final()]).toString("utf8");
}

// ── Token refresh ─────────────────────────────────────────────────────────────
async function refreshTokens(conn: any): Promise<string> {
  const creds = Buffer.from(
    `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(INTUIT_TOKEN_URL, {.catch(() => { throw new Error("Network request failed"); });
    method: "POST",
    headers: {
      Authorization:  `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept:         "application/json",
    },
    body: new URLSearchParams({
      grant_type:    "refresh_token",
      refresh_token: decryptToken(conn.refresh_token_enc),
    }),
  });

  if (!res.ok) {
    await supabaseAdmin.from("quickbooks_connections")
      .update({ status: "error", last_error: "Token refresh failed — please reconnect" })
      .eq("id", conn.id);
    throw new Error("QB token refresh failed");
  }

  const tokens = await res.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // NOTE: Multi-step write — not atomic. Partial failure leaves inconsistent state.
    await supabaseAdmin.from("quickbooks_connections").update({
    access_token_enc:  encryptToken(tokens.access_token),
    refresh_token_enc: encryptToken(tokens.refresh_token),
    token_expires_at:  expiresAt,
  }).eq("id", conn.id);

  return tokens.access_token;
}

// ── Get valid access token ────────────────────────────────────────────────────
async function getAccessToken(conn: any): Promise<string> {
  const expiresAt = new Date(conn.token_expires_at).getTime();
  // Refresh if expires within 5 minutes
  if (Date.now() > expiresAt - 5 * 60 * 1000) {
    return refreshTokens(conn);
  }
  return decryptToken(conn.access_token_enc);
}

// ── QBO API helpers ───────────────────────────────────────────────────────────
async function qboGet(realmId: string, token: string, path: string) {
  const url = `${QBO_BASE}/v3/company/${realmId}/${path}`;
  const res = await fetch(url, {.catch(() => { throw new Error("Network request failed"); });
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (res.status === 401) throw new Error("QB_TOKEN_EXPIRED");
  if (!res.ok) throw new Error(`QBO ${path} failed: ${res.status}`);
  return res.json();
}

async function qboReport(realmId: string, token: string, report: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ minorversion: "65", ...params }).toString();
  return qboGet(realmId, token, `reports/${report}?${qs}`);
}

// ── Parse P&L report rows ─────────────────────────────────────────────────────
function parseReportValue(row: any, colIndex = 1): number {
  try {
    const val = row?.ColData?.[colIndex]?.value;
    return val ? parseFloat(val.replace(/,/g, "")) || 0 : 0;
  } catch { return 0; }
}

function findReportRow(rows: any[], label: string): number {
  if (!rows) return 0;
  for (const row of rows) {
    if (row?.type === "Section") {
      const found = findReportRow(row?.Rows?.Row || [], label);
      if (found !== 0) return found;
    }
    const name = row?.ColData?.[0]?.value || "";
    if (name.toLowerCase().includes(label.toLowerCase())) {
      return parseReportValue(row);
    }
    if (row?.Summary?.ColData?.[0]?.value?.toLowerCase().includes(label.toLowerCase())) {
      return parseReportValue(row.Summary);
    }
  }
  return 0;
}

// ── Main sync function ────────────────────────────────────────────────────────
export async function syncQuickBooksFinancials(businessId: string): Promise<void> {
  // 1. Load connection
  const { data: conn, error } = await supabaseAdmin
    .from("quickbooks_connections")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "connected")
    .single();

  if (error || !conn) throw new Error("QuickBooks not connected for this business");

  // Mark syncing
  await supabaseAdmin.from("quickbooks_connections")
    .update({ status: "syncing" }).eq("id", conn.id);

  const realmId = conn.realm_id;
  const token   = await getAccessToken(conn);

  // Date range: trailing 12 months
  const now       = new Date();
  const endDate   = now.toISOString().slice(0, 10);
  const startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().slice(0, 10);

  const results: Record<string, any> = {};

  // ── 2. P&L Summary ───────────────────────────────────────────────────────
  try {
    const pl = await qboReport(realmId, token, "ProfitAndLoss", {
      start_date: startDate, end_date: endDate, summarize_column_by: "Total",
    });

    const rows = pl?.Rows?.Row || [];

    // Total Income / Revenue
    const revenue     = findReportRow(rows, "Total Income") || findReportRow(rows, "Total Revenue");
    const cogs        = findReportRow(rows, "Total Cost of Goods") || findReportRow(rows, "Cost of Goods Sold");
    const grossProfit = findReportRow(rows, "Gross Profit");
    const totalExp    = findReportRow(rows, "Total Expenses");
    const netIncome   = findReportRow(rows, "Net Income");

    results.revenue_ttm      = revenue;
    results.cogs_ttm         = cogs;
    results.gross_profit_ttm = grossProfit || (revenue - cogs);
    results.total_expenses   = totalExp;
    results.net_income_ttm   = netIncome;

    // Extract top expense categories
    const expenseSection = rows.find((r: any) =>
      r?.type === "Section" &&
      (r?.group === "Expenses" || r?.Header?.ColData?.[0]?.value?.includes("Expense"))
    );
    const expRows = expenseSection?.Rows?.Row || [];
    const topExpenses = expRows
      .filter((r: any) => r?.type === "Data")
      .map((r: any) => ({
        name:   r?.ColData?.[0]?.value || "Unknown",
        amount: parseReportValue(r),
      }))
      .filter((e: any) => e.amount > 0)
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 10);

    results.top_expense_cats = topExpenses;

    // Payroll from expense categories
    const payrollCats = topExpenses.filter((e: any) =>
      e.name.toLowerCase().match(/payroll|salary|salaries|wages|compensation|benefits/)
    );
    results.payroll_ttm = payrollCats.reduce((s: number, e: any) => s + e.amount, 0);

  } catch (err: any) {
    console.error("[QB] P&L sync failed:", err.message);
  }

  // ── 3. AR Aging ──────────────────────────────────────────────────────────
  try {
    const ar = await qboReport(realmId, token, "AgedReceivableDetail", {
      report_date: endDate, aging_period: "30", num_periods: "4",
    });

    const arRows = ar?.Rows?.Row || [];
    let ar_total = 0, ar_30 = 0, ar_60 = 0, ar_90 = 0;

    // Columns: Customer | Due Date | Past Due | 1-30 | 31-60 | 61-90 | 91+ | Total
    for (const row of arRows) {
      if (row?.type !== "Data") continue;
      const cols = row?.ColData || [];
      ar_30   += parseFloat(cols[3]?.value?.replace(/,/g, "") || "0") || 0;
      ar_60   += parseFloat(cols[4]?.value?.replace(/,/g, "") || "0") || 0;
      ar_90   += parseFloat(cols[5]?.value?.replace(/,/g, "") || "0") || 0;
      const over90 = parseFloat(cols[6]?.value?.replace(/,/g, "") || "0") || 0;
      ar_total += parseFloat(cols[7]?.value?.replace(/,/g, "") || "0") || 0;
      ar_90   += over90;
    }

    results.ar_total      = ar_total;
    results.ar_overdue_30 = ar_30;
    results.ar_overdue_60 = ar_60;
    results.ar_overdue_90 = ar_90;

  } catch (err: any) {
    console.error("[QB] AR aging sync failed:", err.message);
  }

  // ── 4. Balance sheet for bank balance ────────────────────────────────────
  try {
    const bs = await qboReport(realmId, token, "BalanceSheet", {
      start_date: endDate, end_date: endDate,
    });
    const bsRows = bs?.Rows?.Row || [];
    results.bank_balance = findReportRow(bsRows, "Total Bank");
  } catch { /* non-fatal */ }

  // ── 5. Company info for employee count ───────────────────────────────────
  try {
    const info = await qboGet(realmId, token, "companyinfo/" + realmId);
    const emp  = info?.CompanyInfo?.EmployeeCount;
    if (emp) results.employee_count = Number(emp);
  } catch { /* non-fatal */ }

  // ── 6. Owner draws (if sole prop / partnership) ───────────────────────────
  try {
    const draws = await qboReport(realmId, token, "ProfitAndLoss", {
      start_date: startDate, end_date: endDate, summarize_column_by: "Total",
    });
    results.owner_draws_ttm = findReportRow(draws?.Rows?.Row || [], "Owner Draw") ||
                              findReportRow(draws?.Rows?.Row || [], "Owner Contribution");
  } catch { /* non-fatal */ }

  // ── 7. Write to business_profiles ────────────────────────────────────────
  const grossMarginPct = results.revenue_ttm > 0
    ? Math.round((results.gross_profit_ttm / results.revenue_ttm) * 100)
    : undefined;

  const profileUpdate: Record<string, any> = {
    qb_connected:          true,
    qb_last_sync_at:       new Date().toISOString(),
    qb_revenue_ttm:        results.revenue_ttm        || null,
    qb_gross_profit_ttm:   results.gross_profit_ttm   || null,
    qb_total_expenses_ttm: results.total_expenses      || null,
    qb_net_income_ttm:     results.net_income_ttm     || null,
    qb_ar_total:           results.ar_total           || null,
    qb_ar_overdue_30:      results.ar_overdue_30      || null,
    qb_ar_overdue_60:      results.ar_overdue_60      || null,
    qb_ar_overdue_90:      results.ar_overdue_90      || null,
    qb_payroll_ttm:        results.payroll_ttm        || null,
    qb_top_expense_cats:   results.top_expense_cats   || null,
    qb_cogs_ttm:           results.cogs_ttm           || null,
    qb_owner_draws_ttm:    results.owner_draws_ttm    || null,
    qb_bank_balance:       results.bank_balance       || null,
    updated_at:            new Date().toISOString(),
  };

  // Overwrite revenue/margin estimates with actuals
  if (results.revenue_ttm > 0) {
    profileUpdate.exact_annual_revenue = results.revenue_ttm;
  }
  if (grossMarginPct !== undefined) {
    profileUpdate.gross_margin_pct = grossMarginPct;
  }
  if (results.net_income_ttm) {
    profileUpdate.net_income_last_year = results.net_income_ttm;
  }
  if (results.payroll_ttm > 0) {
    profileUpdate.exact_payroll_total = results.payroll_ttm;
  }
  if (results.employee_count) {
    profileUpdate.employee_count = results.employee_count;
  }

  await supabaseAdmin.from("business_profiles")
    .update(profileUpdate)
    .eq("business_id", businessId);

  // ── 8. Update connection status ───────────────────────────────────────────
  await supabaseAdmin.from("quickbooks_connections").update({
    status:       "connected",
    last_sync_at: new Date().toISOString(),
    last_error:   null,
    sync_summary: {
      revenue_ttm:    results.revenue_ttm ?? 0,
      ar_overdue_90:  results.ar_overdue_90 ?? 0,
      ar_overdue_60:  results.ar_overdue_60 ?? 0,
      payroll_ttm:    results.payroll_ttm ?? 0,
      net_income_ttm: results.net_income_ttm ?? 0,
      synced_at:      new Date().toISOString(),
    },
  }).eq("id", conn.id);
}
