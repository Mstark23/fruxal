// services/fmp/fmp-aggregator.ts
// Fetches and normalizes Financial Modeling Prep data for TSX public companies.
// Requires paid FMP plan — uses all 5 endpoints: profile, income, balance, cashflow, ratios.

const FMP_BASE = "https://financialmodelingprep.com/api/v3";

export interface FMPCompanyData {
  symbol: string; name: string; exchange: string; industry: string; sector: string;
  country: string; province: string; description: string; website: string;
  ceo: string; employees: number; ipoDate: string;
  revenue: number; revenueGrowthYoY: number | null;
  costOfRevenue: number; grossProfit: number; grossMarginPct: number;
  operatingExpenses: number; operatingIncome: number; operatingMarginPct: number;
  ebitda: number; ebitdaMarginPct: number;
  netIncome: number; netMarginPct: number; eps: number;
  incomeTaxExpense: number; effectiveTaxRatePct: number;
  interestExpense: number; depreciationAmortization: number; rd_expense: number;
  totalAssets: number; totalLiabilities: number; totalEquity: number;
  cashAndEquivalents: number; totalDebt: number; netDebt: number;
  currentRatio: number | null; debtToEquity: number | null;
  accountsReceivable: number; inventory: number; workingCapital: number;
  operatingCashFlow: number; capex: number; freeCashFlow: number; dividendsPaid: number;
  history: { year: string; revenue: number; grossMarginPct: number; ebitdaMarginPct: number; netMarginPct: number; netIncome: number }[];
  peRatio: number | null; pbRatio: number | null;
  roe: number | null; roa: number | null; roic: number | null;
  payrollEstimate: number; reportingCurrency: string; latestFiscalYear: string;
}

async function fmpFetch(endpoint: string): Promise<any> {
  const FMP_KEY = process.env.FMP_API_KEY || "";
  if (!FMP_KEY) throw new Error("FMP_API_KEY not configured");
  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${FMP_BASE}${endpoint}${sep}apikey=${FMP_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit).catch(() => { throw new Error("Network request failed"); });
  if (!res.ok) throw new Error(`FMP ${endpoint}: ${res.status}`);
  return res.json();
}

function inferProvince(address: string, city: string): string {
  const text = `${address} ${city}`.toUpperCase();
  if (text.includes("TORONTO") || text.includes("ONTARIO")            || text.includes(", ON")) return "ON";
  if (text.includes("MONTREAL") || text.includes("QUÉBEC")            || text.includes("QUEBEC") || text.includes(", QC")) return "QC";
  if (text.includes("VANCOUVER") || text.includes("BRITISH COLUMBIA") || text.includes(", BC")) return "BC";
  if (text.includes("CALGARY") || text.includes("EDMONTON")           || text.includes("ALBERTA") || text.includes(", AB")) return "AB";
  if (text.includes("WINNIPEG") || text.includes("MANITOBA")          || text.includes(", MB")) return "MB";
  if (text.includes("REGINA") || text.includes("SASKATOON")           || text.includes("SASKATCHEWAN") || text.includes(", SK")) return "SK";
  if (text.includes("HALIFAX") || text.includes("NOVA SCOTIA")        || text.includes(", NS")) return "NS";
  if (text.includes("FREDERICTON") || text.includes("MONCTON")        || text.includes("NEW BRUNSWICK") || text.includes(", NB")) return "NB";
  if (text.includes("ST. JOHN") || text.includes("NEWFOUNDLAND")      || text.includes(", NL")) return "NL";
  return "ON";
}

function estimatePayroll(employees: number, industry: string, revenue: number): number {
  const salaries: Record<string, number> = {
    Technology: 95000, "Financial Services": 85000, Banking: 80000,
    Insurance: 75000, "Real Estate": 65000, Construction: 62000,
    Manufacturing: 58000, Retail: 42000, Energy: 90000,
    Healthcare: 72000, Utilities: 78000, Mining: 85000, Transportation: 60000,
  };
  const avg = salaries[industry] || 65000;
  return employees > 0 ? employees * avg : revenue * 0.30;
}

export async function aggregateFMPData(symbol: string): Promise<FMPCompanyData> {
  const ticker = symbol.toUpperCase().includes(".") ? symbol.toUpperCase() : `${symbol.toUpperCase()}.TO`;

  const [profileArr, incomeArr, balanceArr, cashflowArr, ratiosArr] = await Promise.all([
    fmpFetch(`/profile/${ticker}`),
    fmpFetch(`/income-statement/${ticker}?limit=3`),
    fmpFetch(`/balance-sheet-statement/${ticker}?limit=2`),
    fmpFetch(`/cash-flow-statement/${ticker}?limit=1`),
    fmpFetch(`/ratios/${ticker}?limit=1`),
  ]);

  if (!profileArr?.length) throw new Error(`Company not found: ${ticker}`);

  const p  = profileArr[0];
  const i0 = incomeArr?.[0]    || {};
  const i1 = incomeArr?.[1]    || {};
  const i2 = incomeArr?.[2]    || {};
  const b0 = balanceArr?.[0]   || {};
  const b1 = balanceArr?.[1]   || {};
  const cf = cashflowArr?.[0]  || {};
  const r  = ratiosArr?.[0]    || {};

  const revenue          = i0.revenue ?? 0;
  const grossProfit      = i0.grossProfit ?? 0;
  const ebitda           = i0.ebitda ?? 0;
  const netIncome        = i0.netIncome ?? 0;
  const incomeTax        = i0.incomeTaxExpense ?? 0;
  const operatingIncome  = i0.operatingIncome ?? 0;
  const totalEquity      = b0.totalStockholdersEquity || b0.totalEquity ?? 0;
  const currentAssets    = b0.totalCurrentAssets ?? 0;
  const currentLiabilities = b0.totalCurrentLiabilities ?? 0;
  const totalDebt        = b0.totalDebt ?? 0;
  const cash             = b0.cashAndCashEquivalents ?? 0;
  const totalAssets      = b0.totalAssets ?? 0;
  const prevAssets       = b1.totalAssets         || totalAssets;
  const province         = inferProvince(p.address || "", p.city || "");

  return {
    symbol: ticker,
    name:     p.companyName      || ticker,
    exchange: p.exchangeShortName || "TSX",
    industry: p.industry          || "Unknown",
    sector:   p.sector            || "Unknown",
    country:  p.country           || "CA",
    province,
    description: (p.description || "").substring(0, 500),
    website:  p.website || "",
    ceo:      p.ceo     || "Unknown",
    employees: p.fullTimeEmployees ?? 0,
    ipoDate:  p.ipoDate || "",

    revenue,
    revenueGrowthYoY: i1.revenue
      ? Number((((revenue - i1.revenue) / i1.revenue) * 100).toFixed(1))
      : null,
    costOfRevenue:      i0.costOfRevenue ?? 0,
    grossProfit,
    grossMarginPct:     revenue ? Number(((grossProfit    / revenue) * 100).toFixed(1)) : 0,
    operatingExpenses:  i0.operatingExpenses ?? 0,
    operatingIncome,
    operatingMarginPct: revenue ? Number(((operatingIncome / revenue) * 100).toFixed(1)) : 0,
    ebitda,
    ebitdaMarginPct:    revenue ? Number(((ebitda          / revenue) * 100).toFixed(1)) : 0,
    netIncome,
    netMarginPct:       revenue ? Number(((netIncome        / revenue) * 100).toFixed(1)) : 0,
    eps: i0.eps ?? 0,
    incomeTaxExpense: incomeTax,
    effectiveTaxRatePct: (netIncome + incomeTax) > 0
      ? Number(((incomeTax / (netIncome + incomeTax)) * 100).toFixed(1))
      : 0,
    interestExpense:         Math.abs(i0.interestExpense ?? 0),
    depreciationAmortization: cf.depreciationAndAmortization ?? 0,
    rd_expense: i0.researchAndDevelopmentExpenses ?? 0,

    totalAssets,
    totalLiabilities: b0.totalLiabilities ?? 0,
    totalEquity,
    cashAndEquivalents: cash,
    totalDebt,
    netDebt:      totalDebt - cash,
    currentRatio: currentLiabilities ? Number((currentAssets / currentLiabilities).toFixed(2)) : null,
    debtToEquity: totalEquity         ? Number((totalDebt / totalEquity).toFixed(2))            : null,
    accountsReceivable: b0.netReceivables ?? 0,
    inventory:          b0.inventory ?? 0,
    workingCapital:     currentAssets - currentLiabilities,

    operatingCashFlow: cf.operatingCashFlow ?? 0,
    capex:             Math.abs(cf.capitalExpenditure ?? 0),
    freeCashFlow:      cf.freeCashFlow ?? 0,
    dividendsPaid:     Math.abs(cf.dividendsPaid || 0),

    history: [i0, i1, i2].filter((x) => x.date).map((x) => ({
      year:            x.date?.substring(0, 4) || "",
      revenue:         x.revenue ?? 0,
      grossMarginPct:  x.revenue ? Number(((x.grossProfit / x.revenue) * 100).toFixed(1)) : 0,
      ebitdaMarginPct: x.revenue ? Number(((x.ebitda      / x.revenue) * 100).toFixed(1)) : 0,
      netMarginPct:    x.revenue ? Number(((x.netIncome   / x.revenue) * 100).toFixed(1)) : 0,
      netIncome:       x.netIncome ?? 0,
    })),

    peRatio:  r.priceEarningsRatio || null,
    pbRatio:  r.priceToBookRatio   || null,
    roe:  r.returnOnEquity            ? Number((r.returnOnEquity            * 100).toFixed(1)) : null,
    roa:  r.returnOnAssets            ? Number((r.returnOnAssets            * 100).toFixed(1)) : null,
    roic: r.returnOnCapitalEmployed   ? Number((r.returnOnCapitalEmployed   * 100).toFixed(1)) : null,

    payrollEstimate:   estimatePayroll(p.fullTimeEmployees ?? 0, p.industry || "", revenue),
    reportingCurrency: i0.reportedCurrency || "CAD",
    latestFiscalYear:  i0.date?.substring(0, 4) || "",
  };
}
