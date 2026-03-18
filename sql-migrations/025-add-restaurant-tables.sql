-- =============================================================================
-- RESTAURANT INDUSTRY ENGINE — DATABASE SCHEMA
-- =============================================================================
-- 8 tables · ~110 data points · 18 cross-references
-- Run against Supabase / PostgreSQL
-- =============================================================================

-- 1. DAILY SALES — revenue, covers, checks, RevPASH per day
CREATE TABLE IF NOT EXISTS rest_daily_sales (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id   TEXT NOT NULL REFERENCES businesses(id),
  sale_date     DATE NOT NULL,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  food_revenue  NUMERIC(12,2) DEFAULT 0,
  beverage_revenue NUMERIC(12,2) DEFAULT 0,
  alcohol_revenue  NUMERIC(12,2) DEFAULT 0,
  total_covers  INT DEFAULT 0,
  dine_in_covers INT DEFAULT 0,
  takeout_covers INT DEFAULT 0,
  delivery_covers INT DEFAULT 0,
  avg_check     NUMERIC(8,2) DEFAULT 0,
  avg_check_dine_in NUMERIC(8,2) DEFAULT 0,
  avg_check_takeout NUMERIC(8,2) DEFAULT 0,
  avg_check_delivery NUMERIC(8,2) DEFAULT 0,
  table_turns   NUMERIC(4,2) DEFAULT 0,
  rev_pash      NUMERIC(8,2) DEFAULT 0,       -- Revenue Per Available Seat Hour
  seats_available INT DEFAULT 0,
  hours_open    NUMERIC(4,1) DEFAULT 0,
  peak_hour_revenue NUMERIC(10,2) DEFAULT 0,
  discount_total NUMERIC(10,2) DEFAULT 0,
  comp_total    NUMERIC(10,2) DEFAULT 0,
  void_total    NUMERIC(10,2) DEFAULT 0,
  refund_total  NUMERIC(10,2) DEFAULT 0,
  day_of_week   TEXT,                          -- MON, TUE, etc.
  is_holiday    BOOLEAN DEFAULT FALSE,
  weather       TEXT,                          -- sunny, rainy, snowy
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, sale_date)
);

-- 2. MENU ITEMS — dish-level profitability & engineering
CREATE TABLE IF NOT EXISTS rest_menu_items (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,               -- appetizer, entree, dessert, beverage, side
  subcategory     TEXT,                        -- chicken, beef, seafood, pasta, etc.
  menu_price      NUMERIC(8,2) NOT NULL,
  food_cost       NUMERIC(8,2) NOT NULL,
  food_cost_pct   NUMERIC(5,2),               -- food_cost / menu_price * 100
  contribution_margin NUMERIC(8,2),           -- menu_price - food_cost
  units_sold_30d  INT DEFAULT 0,
  revenue_30d     NUMERIC(10,2) DEFAULT 0,
  popularity_rank INT,                         -- rank within category
  profitability_rank INT,                      -- rank by margin
  menu_mix_pct    NUMERIC(5,2),               -- % of total sales
  is_signature    BOOLEAN DEFAULT FALSE,
  is_seasonal     BOOLEAN DEFAULT FALSE,
  last_price_update DATE,
  recipe_portions  INT DEFAULT 1,             -- servings per recipe
  prep_time_min   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, name)
);

-- 3. LABOR — payroll, scheduling, turnover, productivity
CREATE TABLE IF NOT EXISTS rest_labor (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  salary_cost     NUMERIC(10,2) DEFAULT 0,
  hourly_cost     NUMERIC(10,2) DEFAULT 0,
  overtime_cost   NUMERIC(10,2) DEFAULT 0,
  benefits_cost   NUMERIC(10,2) DEFAULT 0,
  total_hours     NUMERIC(10,1) DEFAULT 0,
  overtime_hours  NUMERIC(8,1) DEFAULT 0,
  foh_hours       NUMERIC(8,1) DEFAULT 0,     -- Front of House
  boh_hours       NUMERIC(8,1) DEFAULT 0,     -- Back of House
  labor_cost_pct  NUMERIC(5,2),               -- labor / revenue * 100
  sales_per_labor_hour NUMERIC(8,2),          -- revenue / total hours
  covers_per_labor_hour NUMERIC(6,2),
  headcount_avg   INT DEFAULT 0,
  headcount_foh   INT DEFAULT 0,
  headcount_boh   INT DEFAULT 0,
  new_hires       INT DEFAULT 0,
  terminations    INT DEFAULT 0,
  turnover_rate   NUMERIC(5,2),
  training_cost   NUMERIC(8,2) DEFAULT 0,
  est_turnover_cost NUMERIC(10,2) DEFAULT 0,  -- $5,864 avg per lost worker
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, period_start, period_end)
);

-- 4. FOOD COSTS — COGS tracking, waste, variance, theft
CREATE TABLE IF NOT EXISTS rest_food_costs (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_food_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  beg_inventory   NUMERIC(10,2) DEFAULT 0,
  purchases       NUMERIC(10,2) DEFAULT 0,
  end_inventory   NUMERIC(10,2) DEFAULT 0,
  actual_cogs     NUMERIC(10,2),              -- beg + purchases - end
  theoretical_cogs NUMERIC(10,2),             -- what COGS should be based on POS
  variance_amount NUMERIC(10,2),              -- actual - theoretical (TvA gap)
  variance_pct    NUMERIC(5,2),               -- variance / theoretical * 100
  food_cost_pct   NUMERIC(5,2),               -- actual_cogs / food_revenue * 100
  waste_amount    NUMERIC(10,2) DEFAULT 0,
  waste_pct       NUMERIC(5,2),
  spoilage_amount NUMERIC(10,2) DEFAULT 0,
  theft_estimated NUMERIC(10,2) DEFAULT 0,
  over_portioning_est NUMERIC(10,2) DEFAULT 0,
  food_revenue    NUMERIC(12,2) DEFAULT 0,
  beverage_cost   NUMERIC(10,2) DEFAULT 0,
  beverage_cost_pct NUMERIC(5,2),
  pour_cost_pct   NUMERIC(5,2),               -- alcohol cost / alcohol revenue
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, period_start, period_end)
);

-- 5. INVENTORY — item-level tracking, par levels, spoilage
CREATE TABLE IF NOT EXISTS rest_inventory (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  item_name       TEXT NOT NULL,
  category        TEXT NOT NULL,               -- protein, produce, dairy, dry_goods, beverages, supplies
  unit            TEXT NOT NULL,               -- lb, oz, each, case, gallon
  par_level       NUMERIC(10,2),              -- target quantity to have on hand
  on_hand_qty     NUMERIC(10,2) DEFAULT 0,
  unit_cost       NUMERIC(8,2) DEFAULT 0,
  total_value     NUMERIC(10,2) DEFAULT 0,    -- on_hand * unit_cost
  weekly_usage    NUMERIC(10,2) DEFAULT 0,
  days_on_hand    NUMERIC(6,1) DEFAULT 0,
  last_order_date DATE,
  last_count_date DATE,
  count_variance  NUMERIC(10,2) DEFAULT 0,    -- expected vs actual count
  spoilage_this_month NUMERIC(8,2) DEFAULT 0,
  is_perishable   BOOLEAN DEFAULT TRUE,
  shelf_life_days INT,
  vendor_name     TEXT,
  vendor_price_trend NUMERIC(5,2),            -- % change vs 3 months ago
  snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, item_name, snapshot_date)
);

-- 6. DELIVERY & THIRD-PARTY — platform fees, order data
CREATE TABLE IF NOT EXISTS rest_delivery (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  platform        TEXT NOT NULL,               -- doordash, uber_eats, grubhub, direct, catering
  total_orders    INT DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,
  commission_pct  NUMERIC(5,2),
  commission_amount NUMERIC(10,2) DEFAULT 0,
  delivery_fees_charged NUMERIC(10,2) DEFAULT 0,
  net_revenue     NUMERIC(10,2) DEFAULT 0,    -- revenue - commissions
  avg_order_value NUMERIC(8,2) DEFAULT 0,
  refund_count    INT DEFAULT 0,
  refund_amount   NUMERIC(10,2) DEFAULT 0,
  cancelled_orders INT DEFAULT 0,
  avg_prep_time_min NUMERIC(6,1) DEFAULT 0,
  avg_delivery_time_min NUMERIC(6,1) DEFAULT 0,
  rating          NUMERIC(3,1),
  order_accuracy_pct NUMERIC(5,2),
  new_customers   INT DEFAULT 0,
  repeat_customers INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, platform, period_start, period_end)
);

-- 7. CUSTOMERS — guest data, retention, reviews, loyalty
CREATE TABLE IF NOT EXISTS rest_customers (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_guests    INT DEFAULT 0,
  new_guests      INT DEFAULT 0,
  returning_guests INT DEFAULT 0,
  retention_rate  NUMERIC(5,2),
  avg_visit_frequency NUMERIC(6,2),           -- visits per month
  avg_spend_per_visit NUMERIC(8,2) DEFAULT 0,
  loyalty_members INT DEFAULT 0,
  loyalty_redemptions INT DEFAULT 0,
  loyalty_revenue NUMERIC(10,2) DEFAULT 0,
  google_rating   NUMERIC(3,1),
  google_review_count INT DEFAULT 0,
  yelp_rating     NUMERIC(3,1),
  yelp_review_count INT DEFAULT 0,
  tripadvisor_rating NUMERIC(3,1),
  complaints      INT DEFAULT 0,
  complaint_types TEXT,                        -- JSON: { "food_quality": 3, "service": 2, ... }
  reservation_no_shows INT DEFAULT 0,
  no_show_rate    NUMERIC(5,2),
  wait_time_avg_min NUMERIC(6,1) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, period_start, period_end)
);

-- 8. OVERHEAD — rent, utilities, insurance, equipment, compliance
CREATE TABLE IF NOT EXISTS rest_overhead (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id     TEXT NOT NULL REFERENCES businesses(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  rent            NUMERIC(10,2) DEFAULT 0,
  utilities       NUMERIC(10,2) DEFAULT 0,
  insurance       NUMERIC(10,2) DEFAULT 0,
  equipment_lease NUMERIC(10,2) DEFAULT 0,
  maintenance     NUMERIC(10,2) DEFAULT 0,
  marketing_spend NUMERIC(10,2) DEFAULT 0,
  technology_cost NUMERIC(10,2) DEFAULT 0,    -- POS, reservation system, etc.
  cc_processing_fees NUMERIC(10,2) DEFAULT 0,
  cc_processing_pct NUMERIC(5,2),
  trash_recycling NUMERIC(8,2) DEFAULT 0,
  pest_control    NUMERIC(8,2) DEFAULT 0,
  linen_service   NUMERIC(8,2) DEFAULT 0,
  licenses_permits NUMERIC(8,2) DEFAULT 0,
  total_overhead  NUMERIC(12,2) DEFAULT 0,
  overhead_pct_revenue NUMERIC(5,2),          -- total_overhead / revenue * 100
  occupancy_cost  NUMERIC(10,2) DEFAULT 0,    -- rent + utilities + insurance
  occupancy_pct   NUMERIC(5,2),               -- occupancy / revenue * 100
  health_inspection_score INT,                -- 0-100
  health_violations INT DEFAULT 0,
  total_revenue   NUMERIC(12,2) DEFAULT 0,    -- for % calculations
  net_profit      NUMERIC(12,2) DEFAULT 0,
  net_profit_margin NUMERIC(5,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, period_start, period_end)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_rest_daily_sales_biz ON rest_daily_sales(business_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_rest_menu_items_biz ON rest_menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_rest_labor_biz ON rest_labor(business_id, period_start);
CREATE INDEX IF NOT EXISTS idx_rest_food_costs_biz ON rest_food_costs(business_id, period_start);
CREATE INDEX IF NOT EXISTS idx_rest_inventory_biz ON rest_inventory(business_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_rest_delivery_biz ON rest_delivery(business_id, platform);
CREATE INDEX IF NOT EXISTS idx_rest_customers_biz ON rest_customers(business_id, period_start);
CREATE INDEX IF NOT EXISTS idx_rest_overhead_biz ON rest_overhead(business_id, period_start);
