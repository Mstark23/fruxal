// =============================================================================
// lib/solutions/leak-map.ts
// Maps leak categories → solution categories used by the matcher.
// Extracted from app/api/tools/route.ts for shared use.
// =============================================================================

export const LEAK_TO_SOLUTION: Record<string, string[]> = {
  // Scan orchestrator categories
  "vendor-costs":           ["Inventory", "ERP", "Manufacturing", "POS"],
  "collections":            ["Invoicing", "Accounting", "CRM", "Payments"],
  "insurance":              ["Insurance", "Insurance AMS", "Compliance"],
  "payroll-labor":          ["Payroll", "Scheduling", "Time Tracking"],
  "software-subscriptions": ["Analytics", "PM Software", "Project Management"],
  "processing-fees":        ["Payments", "POS", "Invoicing"],
  "contracts":              ["Legal PM", "Documents", "CRM"],
  "compliance-tax":         ["Tax PM", "Accounting", "Bookkeeping", "Compliance", "Government"],
  "pricing-margins":        ["POS", "Invoicing", "Accounting", "Analytics"],
  "operations":             ["Scheduling", "Inventory", "ERP", "Field Service"],
  // Diagnostic task categories
  "payment_processing":     ["Payments", "POS", "Invoicing"],
  "accounting":             ["Accounting", "Bookkeeping", "Tax PM"],
  "payroll":                ["Payroll", "Scheduling", "Time Tracking"],
  "tax":                    ["Tax PM", "Accounting", "Government", "Compliance"],
  "cash_flow":              ["Invoicing", "Payments", "Accounting"],
  "marketing":              ["SEO", "Email", "Analytics", "CRM", "Platform"],
  "hr":                     ["Payroll", "Scheduling", "Time Tracking", "LMS"],
  "insurance_costs":        ["Insurance", "Insurance AMS"],
  "inventory":              ["Inventory", "ERP", "POS"],
  // Prescan leak categories
  "Revenue":      ["POS", "CRM", "Booking", "E-commerce", "Invoicing", "Payments"],
  "Cost":         ["Accounting", "Inventory", "ERP", "Payroll", "Insurance"],
  "Marketing":    ["SEO", "Email", "Analytics", "CRM", "Platform"],
  "Operational":  ["Scheduling", "Inventory", "Field Service", "Dispatch", "Time Tracking"],
  "Cash Flow":    ["Invoicing", "Payments", "Accounting", "Bookkeeping"],
  "Tax":          ["Tax PM", "Accounting", "Government", "Compliance", "Bookkeeping"],
  "Compliance":   ["Compliance", "Safety", "Documents", "Insurance"],
  "Pricing":      ["POS", "Analytics", "Invoicing", "CRM"],
  "People":       ["Payroll", "Scheduling", "Time Tracking", "LMS"],
  "Technology":   ["Dev Tools", "Hosting", "Security", "MSP", "Analytics"],
  "Vendor":       ["Inventory", "ERP", "Logistics", "WMS"],
  "Growth":       ["CRM", "Email", "SEO", "Analytics", "E-commerce", "Platform", "Government"],
};

// Convenience: get top solution categories for a leak category
export function getSolutionCategories(leakCategory: string): string[] {
  return LEAK_TO_SOLUTION[leakCategory] ?? ["Accounting"];
}
