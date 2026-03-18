-- =============================================================================
-- CONSTRUCTION INDUSTRY ENGINE — 8 Tables
-- =============================================================================
-- Benchmarks: CFMA 2024, JMCO 2025, NAHB 2025, Bridgit 2025
-- =============================================================================

-- 1. Projects & Profitability
CREATE TABLE IF NOT EXISTS construction_projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL, -- residential, commercial, industrial, infrastructure
  contract_type TEXT NOT NULL, -- lump_sum, cost_plus, time_material, design_build
  contract_value NUMERIC NOT NULL,
  estimated_cost NUMERIC NOT NULL,
  actual_cost NUMERIC DEFAULT 0,
  gross_profit NUMERIC DEFAULT 0,
  gross_margin_pct NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  net_margin_pct NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, on_hold, cancelled
  start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  schedule_variance_days INTEGER DEFAULT 0,
  pct_complete NUMERIC DEFAULT 0,
  cpi NUMERIC DEFAULT 1.0, -- cost performance index
  spi NUMERIC DEFAULT 1.0, -- schedule performance index
  client_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, project_name)
);

-- 2. Estimates & Bidding
CREATE TABLE IF NOT EXISTS construction_estimates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  project_id TEXT REFERENCES construction_projects(id),
  bid_date DATE,
  estimated_labor NUMERIC NOT NULL,
  estimated_materials NUMERIC NOT NULL,
  estimated_equipment NUMERIC NOT NULL,
  estimated_subcontractor NUMERIC NOT NULL,
  estimated_overhead NUMERIC NOT NULL,
  estimated_profit NUMERIC NOT NULL,
  total_bid NUMERIC NOT NULL,
  actual_labor NUMERIC DEFAULT 0,
  actual_materials NUMERIC DEFAULT 0,
  actual_equipment NUMERIC DEFAULT 0,
  actual_subcontractor NUMERIC DEFAULT 0,
  labor_variance_pct NUMERIC DEFAULT 0,
  material_variance_pct NUMERIC DEFAULT 0,
  equipment_variance_pct NUMERIC DEFAULT 0,
  sub_variance_pct NUMERIC DEFAULT 0,
  bid_hit_rate NUMERIC DEFAULT 0, -- company overall win rate
  markup_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, project_id)
);

-- 3. Change Orders
CREATE TABLE IF NOT EXISTS construction_change_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  project_id TEXT REFERENCES construction_projects(id),
  change_order_num INTEGER NOT NULL,
  description TEXT,
  requested_by TEXT, -- client, field, design, unforeseen
  original_value NUMERIC NOT NULL,
  approved_value NUMERIC DEFAULT 0,
  cost_to_execute NUMERIC DEFAULT 0,
  markup_pct NUMERIC DEFAULT 0,
  schedule_impact_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, executed
  submitted_date DATE,
  approved_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, project_id, change_order_num)
);

-- 4. Labor & Workforce
CREATE TABLE IF NOT EXISTS construction_labor (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_labor_cost NUMERIC NOT NULL,
  total_hours NUMERIC NOT NULL,
  regular_hours NUMERIC NOT NULL,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_cost NUMERIC DEFAULT 0,
  overtime_pct NUMERIC DEFAULT 0,
  avg_hourly_rate NUMERIC DEFAULT 0,
  labor_productivity NUMERIC DEFAULT 0, -- revenue per labor hour
  rework_hours NUMERIC DEFAULT 0,
  rework_cost NUMERIC DEFAULT 0,
  rework_pct NUMERIC DEFAULT 0,
  headcount INTEGER DEFAULT 0,
  turnover_rate NUMERIC DEFAULT 0,
  open_positions INTEGER DEFAULT 0,
  workers_comp_cost NUMERIC DEFAULT 0,
  training_cost NUMERIC DEFAULT 0,
  labor_burden_pct NUMERIC DEFAULT 0, -- benefits + tax + insurance as % of wages
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 5. Materials & Procurement
CREATE TABLE IF NOT EXISTS construction_materials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_material_cost NUMERIC NOT NULL,
  budgeted_material_cost NUMERIC NOT NULL,
  material_variance_pct NUMERIC DEFAULT 0,
  waste_amount NUMERIC DEFAULT 0,
  waste_pct NUMERIC DEFAULT 0,
  theft_shrinkage NUMERIC DEFAULT 0,
  theft_pct NUMERIC DEFAULT 0,
  rush_order_count INTEGER DEFAULT 0,
  rush_order_premium NUMERIC DEFAULT 0,
  supplier_count INTEGER DEFAULT 0,
  on_time_delivery_pct NUMERIC DEFAULT 0,
  bulk_discount_savings NUMERIC DEFAULT 0,
  price_escalation_pct NUMERIC DEFAULT 0,
  inventory_carrying_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- 6. Equipment & Assets
CREATE TABLE IF NOT EXISTS construction_equipment (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  equipment_name TEXT NOT NULL,
  equipment_type TEXT, -- heavy, light, vehicle, tool
  owned_or_rented TEXT DEFAULT 'owned', -- owned, rented, leased
  monthly_cost NUMERIC DEFAULT 0, -- payment/rental
  maintenance_cost_ytd NUMERIC DEFAULT 0,
  fuel_cost_ytd NUMERIC DEFAULT 0,
  utilization_pct NUMERIC DEFAULT 0, -- hours used / hours available
  downtime_pct NUMERIC DEFAULT 0,
  hours_used_ytd NUMERIC DEFAULT 0,
  hours_available_ytd NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  cost_per_hour NUMERIC DEFAULT 0,
  age_years NUMERIC DEFAULT 0,
  replacement_value NUMERIC DEFAULT 0,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, equipment_name, snapshot_date)
);

-- 7. Subcontractors
CREATE TABLE IF NOT EXISTS construction_subcontractors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  sub_name TEXT NOT NULL,
  trade TEXT NOT NULL, -- electrical, plumbing, hvac, concrete, framing, etc.
  total_contract_value NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  retainage_held NUMERIC DEFAULT 0,
  retainage_pct NUMERIC DEFAULT 5,
  back_charges NUMERIC DEFAULT 0,
  on_time_pct NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0, -- 1-10
  defect_count INTEGER DEFAULT 0,
  change_order_count INTEGER DEFAULT 0,
  warranty_claims INTEGER DEFAULT 0,
  insurance_verified BOOLEAN DEFAULT true,
  license_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, sub_name, trade)
);

-- 8. Overhead & Cash Flow
CREATE TABLE IF NOT EXISTS construction_overhead (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL,
  total_direct_cost NUMERIC NOT NULL,
  gross_profit NUMERIC NOT NULL,
  gross_margin_pct NUMERIC DEFAULT 0,
  total_overhead NUMERIC NOT NULL,
  overhead_pct NUMERIC DEFAULT 0,
  office_rent NUMERIC DEFAULT 0,
  office_salaries NUMERIC DEFAULT 0,
  insurance_general NUMERIC DEFAULT 0,
  insurance_bonding NUMERIC DEFAULT 0,
  vehicle_fleet NUMERIC DEFAULT 0,
  marketing NUMERIC DEFAULT 0,
  technology NUMERIC DEFAULT 0,
  accounting_legal NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  net_margin_pct NUMERIC DEFAULT 0,
  accounts_receivable NUMERIC DEFAULT 0,
  dso_days NUMERIC DEFAULT 0, -- days sales outstanding
  accounts_payable NUMERIC DEFAULT 0,
  dpo_days NUMERIC DEFAULT 0, -- days payable outstanding
  retainage_receivable NUMERIC DEFAULT 0,
  wip_over_under NUMERIC DEFAULT 0, -- work-in-progress over/under billing
  cash_on_hand NUMERIC DEFAULT 0,
  current_ratio NUMERIC DEFAULT 0,
  debt_to_equity NUMERIC DEFAULT 0,
  backlog_value NUMERIC DEFAULT 0,
  backlog_months NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, period_start, period_end)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_const_proj_biz ON construction_projects(business_id);
CREATE INDEX IF NOT EXISTS idx_const_est_biz ON construction_estimates(business_id);
CREATE INDEX IF NOT EXISTS idx_const_co_biz ON construction_change_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_const_labor_biz ON construction_labor(business_id);
CREATE INDEX IF NOT EXISTS idx_const_mat_biz ON construction_materials(business_id);
CREATE INDEX IF NOT EXISTS idx_const_equip_biz ON construction_equipment(business_id);
CREATE INDEX IF NOT EXISTS idx_const_sub_biz ON construction_subcontractors(business_id);
CREATE INDEX IF NOT EXISTS idx_const_oh_biz ON construction_overhead(business_id);

-- Disable RLS for service role access
ALTER TABLE construction_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_estimates DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_change_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_labor DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_subcontractors DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_overhead DISABLE ROW LEVEL SECURITY;
