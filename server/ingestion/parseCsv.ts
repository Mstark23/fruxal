/**
 * Smart CSV Parser for Fruxal
 * Handles bank statements, QuickBooks exports, Wave exports, generic CSVs
 * Auto-detects date, description, and amount columns
 */

import crypto from "crypto";

export interface ParsedTransaction {
  transaction_date: string;   // YYYY-MM-DD
  description: string;
  amount: number;             // positive = inflow, negative = outflow
  raw_data: Record<string, string>;
  hash: string;
}

export interface ColumnMapping {
  date_col: string;
  description_col: string;
  amount_col: string;
  debit_col?: string;        // if separate debit/credit columns
  credit_col?: string;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  columns: string[];
  mapping: ColumnMapping;
  warnings: string[];
  skipped: number;
}

/* ═══════════════════════════════════════════════════════════════════
   PARSE CSV TEXT → ROWS
   ═══════════════════════════════════════════════════════════════════ */
function csvToRows(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row.");

  // Parse respecting quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

/* ═══════════════════════════════════════════════════════════════════
   AUTO-DETECT COLUMN MAPPING
   ═══════════════════════════════════════════════════════════════════ */
const DATE_PATTERNS = /^(date|transaction.?date|posting.?date|trans.?date|value.?date|dated?)/i;
const DESC_PATTERNS = /^(description|desc|memo|details?|narration|payee|merchant|transaction.?desc|name)/i;
const AMOUNT_PATTERNS = /^(amount|total|sum|net|value|montant)/i;
const DEBIT_PATTERNS = /^(debit|withdrawal|expense|out|sortie|débit)/i;
const CREDIT_PATTERNS = /^(credit|deposit|income|in|entrée|crédit)/i;

function detectMapping(headers: string[], sampleRows: string[][]): ColumnMapping {
  let date_col = "";
  let description_col = "";
  let amount_col = "";
  let debit_col = "";
  let credit_col = "";

  const lower = headers.map(h => h.toLowerCase());

  // Pattern matching
  for (let i = 0; i < headers.length; i++) {
    const h = lower[i];
    if (!date_col && DATE_PATTERNS.test(h)) date_col = headers[i];
    if (!description_col && DESC_PATTERNS.test(h)) description_col = headers[i];
    if (!amount_col && AMOUNT_PATTERNS.test(h)) amount_col = headers[i];
    if (!debit_col && DEBIT_PATTERNS.test(h)) debit_col = headers[i];
    if (!credit_col && CREDIT_PATTERNS.test(h)) credit_col = headers[i];
  }

  // Fallback: heuristic on sample data if pattern didn't match
  if (!date_col) {
    for (let i = 0; i < headers.length; i++) {
      const sample = sampleRows[0]?.[i] || "";
      if (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(sample) || /^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(sample)) {
        date_col = headers[i];
        break;
      }
    }
  }

  if (!description_col) {
    // Longest text column is likely description
    let maxLen = 0;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === date_col || headers[i] === amount_col) continue;
      const avgLen = sampleRows.slice(0, 5).reduce((s, r) => s + (r[i]?.length || 0), 0) / Math.min(5, sampleRows.length);
      if (avgLen > maxLen) {
        maxLen = avgLen;
        description_col = headers[i];
      }
    }
  }

  if (!amount_col && !debit_col) {
    // Find numeric column
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === date_col || headers[i] === description_col) continue;
      const sample = sampleRows[0]?.[i]?.replace(/[$,\s]/g, "") || "";
      if (/^-?\d+\.?\d*$/.test(sample)) {
        amount_col = headers[i];
        break;
      }
    }
  }

  if (!date_col) throw new Error("Could not detect a date column. Please ensure your CSV has a column named 'Date' or 'Transaction Date'.");
  if (!description_col) throw new Error("Could not detect a description column.");
  if (!amount_col && !debit_col) throw new Error("Could not detect an amount column. Need 'Amount' or 'Debit'/'Credit' columns.");

  return { date_col, description_col, amount_col, debit_col, credit_col };
}

/* ═══════════════════════════════════════════════════════════════════
   PARSE DATE
   ═══════════════════════════════════════════════════════════════════ */
function parseDate(val: string): string | null {
  const cleaned = val.trim();

  // YYYY-MM-DD
  let m = cleaned.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // DD/MM/YYYY or MM/DD/YYYY — assume DD/MM for Canadian banks
  m = cleaned.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (m) {
    const a = parseInt(m[1]), b = parseInt(m[2]);
    // If first number > 12, it's day
    if (a > 12) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    // Default: MM/DD/YYYY
    return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }

  // Try JS Date
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   PARSE AMOUNT
   ═══════════════════════════════════════════════════════════════════ */
function parseAmount(val: string): number | null {
  const cleaned = val.replace(/[$€£,\s]/g, "").replace(/\((.+)\)/, "-$1").trim();
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN: PARSE CSV
   ═══════════════════════════════════════════════════════════════════ */
export function parseCsv(
  csvText: string,
  customMapping?: Partial<ColumnMapping>
): ParseResult {
  const { headers, rows } = csvToRows(csvText);
  const mapping = customMapping
    ? { ...detectMapping(headers, rows), ...customMapping }
    : detectMapping(headers, rows);

  const transactions: ParsedTransaction[] = [];
  const warnings: string[] = [];
  let skipped = 0;

  const dateIdx = headers.indexOf(mapping.date_col);
  const descIdx = headers.indexOf(mapping.description_col);
  const amountIdx = mapping.amount_col ? headers.indexOf(mapping.amount_col) : -1;
  const debitIdx = mapping.debit_col ? headers.indexOf(mapping.debit_col) : -1;
  const creditIdx = mapping.credit_col ? headers.indexOf(mapping.credit_col) : -1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(c => !c.trim())) { skipped++; continue; } // empty row

    // Date
    const dateStr = parseDate(row[dateIdx] || "");
    if (!dateStr) {
      warnings.push(`Row ${i + 2}: Invalid date "${row[dateIdx]}"`);
      skipped++;
      continue;
    }

    // Description
    const description = (row[descIdx] || "").trim() || "No description";

    // Amount
    let amount: number | null = null;
    if (amountIdx >= 0) {
      amount = parseAmount(row[amountIdx] || "");
    } else if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = debitIdx >= 0 ? parseAmount(row[debitIdx] || "") : null;
      const credit = creditIdx >= 0 ? parseAmount(row[creditIdx] || "") : null;
      if (debit && debit > 0) amount = -Math.abs(debit);
      else if (credit && credit > 0) amount = Math.abs(credit);
      else if (debit === 0 && credit) amount = Math.abs(credit);
      else if (credit === 0 && debit) amount = -Math.abs(debit);
    }

    if (amount === null) {
      warnings.push(`Row ${i + 2}: Could not parse amount`);
      skipped++;
      continue;
    }

    // Build raw_data
    const raw_data: Record<string, string> = {};
    headers.forEach((h, j) => { raw_data[h] = row[j] || ""; });

    // Hash for dedup
    const hash = crypto
      .createHash("sha256")
      .update(`${dateStr}|${description}|${amount.toFixed(2)}`)
      .digest("hex")
      .slice(0, 32);

    transactions.push({ transaction_date: dateStr, description, amount, raw_data, hash });
  }

  return { transactions, columns: headers, mapping, warnings, skipped };
}
