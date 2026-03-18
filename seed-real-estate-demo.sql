-- ============================================================================
-- REAL ESTATE ENGINE — DEMO SEED DATA
-- Simulates: "Summit Realty Group" — 12-agent brokerage + 18-property PM portfolio
-- Revenue: ~$4.2M GCI brokerage + $280K PM fees
-- Built-in leaks: ~$187K total detectable
-- ============================================================================

-- Run AFTER add-real-estate-tables.sql
-- Requires a business already created. Replace {BUSINESS_ID} with your actual business ID.

DO $$
DECLARE
  biz_id TEXT;
BEGIN
  -- Get first business
  SELECT id INTO biz_id FROM businesses LIMIT 1;
  IF biz_id IS NULL THEN RAISE EXCEPTION 'No business found. Create one first.'; END IF;

  -- Update industry
  UPDATE businesses SET industry = 'REAL_ESTATE' WHERE id = biz_id;

  -- =====================================================================
  -- AGENTS (12 agents — mix of top producers, mid-tier, and dead weight)
  -- =====================================================================
  INSERT INTO re_agents (id, business_id, agent_name, license_number, hire_date, status, commission_split, cap_amount, cap_progress, desk_fee, team_name, specialization, ytd_volume, ytd_transactions, ytd_gci, prior_year_volume, prior_year_transactions, monthly_expenses, sphere_size, lead_response_time_min, client_satisfaction_score) VALUES
  -- TOP PRODUCERS
  ('agt-01', biz_id, 'Sarah Mitchell', 'RE-48291', '2019-03-15'::date, 'ACTIVE', 85.00, 32000, 32000, 0, 'Mitchell Team', 'LUXURY', 12400000, 18, 310000, 10800000, 15, 3200, 850, 8, 4.9),
  ('agt-02', biz_id, 'James Park', 'RE-55102', '2020-06-01'::date, 'ACTIVE', 80.00, 28000, 28000, 0, NULL, 'RESIDENTIAL', 8200000, 22, 213000, 9100000, 25, 2800, 620, 12, 4.7),
  ('agt-03', biz_id, 'Diana Torres', 'RE-61033', '2018-11-20'::date, 'ACTIVE', 80.00, 28000, 28000, 0, NULL, 'RESIDENTIAL', 6800000, 16, 176000, 7200000, 18, 2400, 540, 15, 4.6),
  -- MID-TIER
  ('agt-04', biz_id, 'Marcus Johnson', 'RE-72044', '2021-02-10'::date, 'ACTIVE', 70.00, 22000, 18000, 0, NULL, 'FIRST_TIME', 3200000, 10, 83000, 2800000, 8, 1800, 310, 45, 4.3),
  ('agt-05', biz_id, 'Lisa Chen', 'RE-83055', '2022-01-15'::date, 'ACTIVE', 70.00, 22000, 15000, 0, NULL, 'RESIDENTIAL', 2800000, 8, 72000, 3400000, 10, 1600, 280, 22, 4.5),
  ('agt-06', biz_id, 'Robert Kim', 'RE-94066', '2021-08-01'::date, 'ACTIVE', 70.00, 22000, 16000, 0, 'Mitchell Team', 'RESIDENTIAL', 3500000, 9, 91000, 3200000, 8, 1900, 340, 18, 4.4),
  -- LOW PRODUCERS WITH HIGH SPLITS (LEAK!)
  ('agt-07', biz_id, 'Kevin Wright', 'RE-10577', '2023-03-01'::date, 'ACTIVE', 80.00, NULL, 0, 0, NULL, 'RESIDENTIAL', 950000, 2, 24000, 1200000, 3, 1200, 80, 180, 3.8),
  ('agt-08', biz_id, 'Amy Foster', 'RE-11588', '2022-09-15'::date, 'ACTIVE', 75.00, NULL, 0, 0, NULL, 'RESIDENTIAL', 680000, 1, 17000, 800000, 2, 1100, 65, 240, 3.5),
  -- BASICALLY INACTIVE (LEAK!)
  ('agt-09', biz_id, 'Tom Bradley', 'RE-12599', '2023-06-01'::date, 'ACTIVE', 70.00, NULL, 0, 0, NULL, 'RESIDENTIAL', 0, 0, 0, 350000, 1, 800, 30, NULL, NULL),
  ('agt-10', biz_id, 'Nicole Adams', 'RE-13600', '2024-01-15'::date, 'ACTIVE', 70.00, NULL, 0, 0, NULL, 'COMMERCIAL', 0, 0, 0, 0, 0, 800, 20, NULL, NULL),
  -- DECLINING TOP PRODUCER (RETENTION RISK LEAK!)
  ('agt-11', biz_id, 'David Park', 'RE-14611', '2017-05-01'::date, 'ACTIVE', 85.00, 32000, 25000, 0, NULL, 'LUXURY', 4200000, 8, 109000, 8500000, 16, 3000, 720, 10, 4.8),
  -- SOLID MID-TIER
  ('agt-12', biz_id, 'Rachel Green', 'RE-15622', '2022-04-01'::date, 'ACTIVE', 65.00, 20000, 14000, 0, NULL, 'FIRST_TIME', 2400000, 8, 62000, 2100000, 7, 1400, 240, 25, 4.6);

  -- =====================================================================
  -- LISTINGS (30 listings — mix of sold, active, expired)
  -- =====================================================================
  INSERT INTO re_listings (id, business_id, agent_id, mls_number, property_address, property_type, list_price, sale_price, listing_date, contract_date, closing_date, days_on_market, status, listing_side, commission_rate, commission_earned, commission_paid_to_agent, brokerage_split, referral_fee_paid, marketing_spend, lead_source) VALUES
  -- SOLD listings
  ('lst-01', biz_id, 'agt-01', 'MLS-20001', '142 Lakewood Dr', 'RESIDENTIAL', 895000, 880000, '2025-06-01'::date, '2025-06-18'::date, '2025-07-20'::date, 17, 'SOLD', 'SELLER', 2.750, 24200, 20570, 15.00, 0, 3200, 'SOI'),
  ('lst-02', biz_id, 'agt-01', 'MLS-20002', '88 Hilltop Ct', 'RESIDENTIAL', 1250000, 1220000, '2025-07-10'::date, '2025-07-28'::date, '2025-08-30'::date, 18, 'SOLD', 'SELLER', 2.750, 33550, 28518, 15.00, 0, 4800, 'REFERRAL'),
  ('lst-03', biz_id, 'agt-02', 'MLS-20003', '310 Oak Valley Rd', 'RESIDENTIAL', 425000, 418000, '2025-05-15'::date, '2025-06-02'::date, '2025-07-05'::date, 18, 'SOLD', 'BUYER', 2.670, 11161, 8929, 20.00, 0, 800, 'WEBSITE'),
  ('lst-04', biz_id, 'agt-02', 'MLS-20004', '55 Maple St', 'RESIDENTIAL', 380000, 375000, '2025-08-01'::date, '2025-08-20'::date, '2025-09-22'::date, 19, 'SOLD', 'SELLER', 2.750, 10313, 8250, 20.00, 0, 600, 'SIGN_CALL'),
  ('lst-05', biz_id, 'agt-03', 'MLS-20005', '720 Birch Lane', 'RESIDENTIAL', 520000, 515000, '2025-04-20'::date, '2025-05-10'::date, '2025-06-12'::date, 20, 'SOLD', 'SELLER', 2.750, 14163, 11330, 20.00, 0, 1200, 'REFERRAL'),
  ('lst-06', biz_id, 'agt-03', 'MLS-20006', '415 Cedar Blvd', 'RESIDENTIAL', 475000, 468000, '2025-07-05'::date, '2025-07-25'::date, '2025-08-28'::date, 20, 'SOLD', 'BUYER', 2.670, 12496, 9997, 20.00, 0, 500, 'OPEN_HOUSE'),
  ('lst-07', biz_id, 'agt-04', 'MLS-20007', '230 First Ave', 'RESIDENTIAL', 295000, 290000, '2025-06-15'::date, '2025-07-08'::date, '2025-08-10'::date, 23, 'SOLD', 'BUYER', 2.670, 7743, 5420, 30.00, 0, 400, 'ZILLOW'),
  ('lst-08', biz_id, 'agt-05', 'MLS-20008', '180 Elm Park', 'RESIDENTIAL', 345000, 338000, '2025-05-01'::date, '2025-05-28'::date, '2025-06-30'::date, 27, 'SOLD', 'SELLER', 2.750, 9295, 6507, 30.00, 0, 500, 'WEBSITE'),
  ('lst-09', biz_id, 'agt-06', 'MLS-20009', '92 Sunset Way', 'RESIDENTIAL', 410000, 405000, '2025-07-20'::date, '2025-08-05'::date, '2025-09-08'::date, 16, 'SOLD', 'SELLER', 2.750, 11138, 7796, 30.00, 0, 700, 'SOI'),
  ('lst-10', biz_id, 'agt-01', 'MLS-20010', '1200 Grandview', 'RESIDENTIAL', 1650000, 1580000, '2025-09-01'::date, '2025-09-20'::date, '2025-10-25'::date, 19, 'SOLD', 'DUAL', 5.000, 79000, 67150, 15.00, 0, 6500, 'SOI'),
  
  -- ACTIVE listings (some stale = LEAK)
  ('lst-11', biz_id, 'agt-04', 'MLS-20011', '445 River Rd', 'RESIDENTIAL', 365000, NULL, '2025-08-10'::date, NULL, NULL, 120, 'ACTIVE', 'SELLER', 2.750, NULL, NULL, 30.00, 0, 2800, 'SOI'),
  ('lst-12', biz_id, 'agt-07', 'MLS-20012', '88 Spruce Ct', 'RESIDENTIAL', 289000, NULL, '2025-09-01'::date, NULL, NULL, 95, 'ACTIVE', 'SELLER', 2.750, NULL, NULL, 20.00, 0, 1500, 'COLD'),
  ('lst-13', biz_id, 'agt-05', 'MLS-20013', '320 Pine Crest', 'RESIDENTIAL', 398000, NULL, '2025-10-15'::date, NULL, NULL, 75, 'ACTIVE', 'SELLER', 2.750, NULL, NULL, 30.00, 0, 900, 'REFERRAL'),
  ('lst-14', biz_id, 'agt-02', 'MLS-20014', '15 Market St #4B', 'RESIDENTIAL', 275000, NULL, '2025-11-01'::date, NULL, NULL, 45, 'ACTIVE', 'SELLER', 2.750, NULL, NULL, 20.00, 0, 600, 'WEBSITE'),
  
  -- EXPIRED/WITHDRAWN (LEAK — lost GCI + wasted marketing)
  ('lst-15', biz_id, 'agt-07', 'MLS-20015', '600 Highland Ave', 'RESIDENTIAL', 485000, NULL, '2025-04-01'::date, NULL, NULL, 180, 'EXPIRED', 'SELLER', 2.750, NULL, NULL, 20.00, 0, 3200, 'COLD'),
  ('lst-16', biz_id, 'agt-08', 'MLS-20016', '225 Valley View', 'RESIDENTIAL', 310000, NULL, '2025-05-15'::date, NULL, NULL, 150, 'EXPIRED', 'SELLER', 2.750, NULL, NULL, 25.00, 0, 2100, 'SIGN_CALL'),
  ('lst-17', biz_id, 'agt-04', 'MLS-20017', '42 Brook Ln', 'RESIDENTIAL', 275000, NULL, '2025-06-01'::date, NULL, NULL, 120, 'WITHDRAWN', 'SELLER', 2.750, NULL, NULL, 30.00, 0, 1800, 'COLD'),
  ('lst-18', biz_id, 'agt-09', 'MLS-20018', '810 Forest Dr', 'RESIDENTIAL', 520000, NULL, '2025-03-10'::date, NULL, NULL, 200, 'CANCELLED', 'SELLER', 2.750, NULL, NULL, 30.00, 0, 4000, 'COLD'),
  ('lst-19', biz_id, 'agt-08', 'MLS-20019', '150 Meadow Way', 'RESIDENTIAL', 358000, NULL, '2025-07-20'::date, NULL, NULL, 130, 'EXPIRED', 'SELLER', 2.750, NULL, NULL, 25.00, 0, 1900, 'WEBSITE'),
  
  -- More sold
  ('lst-20', biz_id, 'agt-06', 'MLS-20020', '78 Orchard St', 'RESIDENTIAL', 390000, 385000, '2025-09-10'::date, '2025-09-28'::date, '2025-10-30'::date, 18, 'SOLD', 'BUYER', 2.670, 10280, 7196, 30.00, 0, 400, 'REFERRAL'),
  ('lst-21', biz_id, 'agt-12', 'MLS-20021', '305 Park Pl', 'RESIDENTIAL', 285000, 280000, '2025-08-15'::date, '2025-09-05'::date, '2025-10-08'::date, 21, 'SOLD', 'BUYER', 2.670, 7476, 4859, 35.00, 0, 300, 'ZILLOW'),
  ('lst-22', biz_id, 'agt-12', 'MLS-20022', '55 Willow Way', 'RESIDENTIAL', 310000, 305000, '2025-10-01'::date, '2025-10-18'::date, '2025-11-20'::date, 17, 'SOLD', 'SELLER', 2.750, 8388, 5452, 35.00, 0, 500, 'SOI');

  -- =====================================================================
  -- TRANSACTIONS (22 — includes 3 fell-through)
  -- =====================================================================
  INSERT INTO re_transactions (id, business_id, listing_id, agent_id, transaction_date, sale_price, property_address, transaction_type, side, gross_commission, commission_rate, agent_split_pct, agent_payout, brokerage_revenue, referral_fee, franchise_fee, e_and_o_fee, transaction_fee, marketing_cost, days_to_close, fell_through, fall_through_reason) VALUES
  ('txn-01', biz_id, 'lst-01', 'agt-01', '2025-07-20'::date, 880000, '142 Lakewood Dr', 'SALE', 'SELLER', 24200, 2.750, 85.00, 20570, 3630, 0, 0, 150, 395, 3200, 32, false, NULL),
  ('txn-02', biz_id, 'lst-02', 'agt-01', '2025-08-30'::date, 1220000, '88 Hilltop Ct', 'SALE', 'SELLER', 33550, 2.750, 85.00, 28518, 5033, 8388, 0, 150, 395, 4800, 33, false, NULL),
  ('txn-03', biz_id, 'lst-03', 'agt-02', '2025-07-05'::date, 418000, '310 Oak Valley Rd', 'SALE', 'BUYER', 11161, 2.670, 80.00, 8929, 2232, 0, 0, 150, 395, 800, 33, false, NULL),
  ('txn-04', biz_id, 'lst-04', 'agt-02', '2025-09-22'::date, 375000, '55 Maple St', 'SALE', 'SELLER', 10313, 2.750, 80.00, 8250, 2063, 0, 0, 150, 0, 600, 33, false, NULL),
  ('txn-05', biz_id, 'lst-05', 'agt-03', '2025-06-12'::date, 515000, '720 Birch Lane', 'SALE', 'SELLER', 14163, 2.750, 80.00, 11330, 2833, 0, 0, 150, 395, 1200, 33, false, NULL),
  ('txn-06', biz_id, 'lst-06', 'agt-03', '2025-08-28'::date, 468000, '415 Cedar Blvd', 'SALE', 'BUYER', 12496, 2.670, 80.00, 9997, 2499, 0, 0, 150, 0, 500, 34, false, NULL),
  ('txn-07', biz_id, 'lst-07', 'agt-04', '2025-08-10'::date, 290000, '230 First Ave', 'SALE', 'BUYER', 7743, 2.670, 70.00, 5420, 2323, 0, 0, 150, 0, 400, 33, false, NULL),
  ('txn-08', biz_id, 'lst-08', 'agt-05', '2025-06-30'::date, 338000, '180 Elm Park', 'SALE', 'SELLER', 9295, 2.750, 70.00, 6507, 2789, 0, 0, 150, 0, 500, 33, false, NULL),
  ('txn-09', biz_id, 'lst-09', 'agt-06', '2025-09-08'::date, 405000, '92 Sunset Way', 'SALE', 'SELLER', 11138, 2.750, 70.00, 7796, 3341, 0, 0, 150, 395, 700, 30, false, NULL),
  ('txn-10', biz_id, 'lst-10', 'agt-01', '2025-10-25'::date, 1580000, '1200 Grandview', 'SALE', 'DUAL', 79000, 5.000, 85.00, 67150, 11850, 0, 0, 150, 395, 6500, 35, false, NULL),
  ('txn-11', biz_id, 'lst-20', 'agt-06', '2025-10-30'::date, 385000, '78 Orchard St', 'SALE', 'BUYER', 10280, 2.670, 70.00, 7196, 3084, 0, 0, 150, 395, 400, 32, false, NULL),
  ('txn-12', biz_id, 'lst-21', 'agt-12', '2025-10-08'::date, 280000, '305 Park Pl', 'SALE', 'BUYER', 7476, 2.670, 65.00, 4859, 2617, 0, 0, 150, 0, 300, 33, false, NULL),
  ('txn-13', biz_id, 'lst-22', 'agt-12', '2025-11-20'::date, 305000, '55 Willow Way', 'SALE', 'SELLER', 8388, 2.750, 65.00, 5452, 2936, 0, 0, 150, 0, 500, 33, false, NULL),
  -- Additional agent transactions
  ('txn-14', biz_id, NULL, 'agt-02', '2025-10-15'::date, 395000, '222 Summit Ave', 'SALE', 'BUYER', 10547, 2.670, 80.00, 8437, 2110, 0, 0, 150, 395, 200, 28, false, NULL),
  ('txn-15', biz_id, NULL, 'agt-03', '2025-11-05'::date, 445000, '610 Ridge Rd', 'SALE', 'SELLER', 12238, 2.750, 80.00, 9790, 2448, 0, 0, 150, 395, 800, 30, false, NULL),
  ('txn-16', biz_id, NULL, 'agt-04', '2025-09-18'::date, 320000, '95 Union St', 'SALE', 'BUYER', 8544, 2.670, 70.00, 5981, 2563, 0, 0, 150, 0, 300, 35, false, NULL),
  ('txn-17', biz_id, NULL, 'agt-11', '2025-07-22'::date, 890000, '500 Lakeshore', 'SALE', 'SELLER', 24475, 2.750, 85.00, 20804, 3671, 0, 0, 150, 395, 4200, 40, false, NULL),
  ('txn-18', biz_id, NULL, 'agt-11', '2025-10-10'::date, 720000, '330 Vineyard', 'SALE', 'BUYER', 19224, 2.670, 85.00, 16340, 2884, 5767, 0, 150, 395, 2000, 38, false, NULL),
  -- REFERRAL FEE OVERPAYMENT (LEAK!)
  ('txn-19', biz_id, NULL, 'agt-01', '2025-11-15'::date, 950000, '88 Estate Dr', 'SALE', 'SELLER', 26125, 2.750, 85.00, 22206, 3919, 9144, 0, 150, 395, 3000, 32, false, NULL),
  -- FELL THROUGH (LEAK!)
  ('txn-20', biz_id, NULL, 'agt-04', '2025-08-05'::date, 285000, '120 Center St', 'SALE', 'BUYER', 7610, 2.670, 70.00, 5327, 2283, 0, 0, 150, 0, 500, NULL, true, 'Financing fell through'),
  ('txn-21', biz_id, NULL, 'agt-05', '2025-09-12'::date, 410000, '250 Heritage Ln', 'SALE', 'SELLER', 11275, 2.750, 70.00, 7893, 3383, 0, 0, 150, 0, 800, NULL, true, 'Inspection issues'),
  ('txn-22', biz_id, NULL, 'agt-07', '2025-10-20'::date, 315000, '72 Elm St', 'SALE', 'BUYER', 8411, 2.670, 80.00, 6729, 1682, 0, 0, 150, 0, 200, NULL, true, 'Buyer cold feet');

  -- =====================================================================
  -- LEADS (60 leads — varied sources & response times)
  -- =====================================================================
  INSERT INTO re_leads (id, business_id, agent_id, lead_name, lead_source, lead_type, lead_date, first_response_minutes, status, monthly_cost, converted, lost_reason) VALUES
  -- Good leads (converted)
  ('ld-01', biz_id, 'agt-01', 'Johnson Family', 'SOI', 'SELLER', '2025-05-10'::date, 5, 'CLOSED', 0, true, NULL),
  ('ld-02', biz_id, 'agt-01', 'Williams Trust', 'REFERRAL', 'SELLER', '2025-06-15'::date, 8, 'CLOSED', 0, true, NULL),
  ('ld-03', biz_id, 'agt-02', 'Chen & Lam', 'WEBSITE', 'BUYER', '2025-04-20'::date, 12, 'CLOSED', 25, true, NULL),
  ('ld-04', biz_id, 'agt-02', 'Garcia Family', 'SIGN_CALL', 'BUYER', '2025-07-05'::date, 18, 'CLOSED', 0, true, NULL),
  ('ld-05', biz_id, 'agt-03', 'Taylor Estate', 'REFERRAL', 'SELLER', '2025-03-22'::date, 10, 'CLOSED', 0, true, NULL),
  ('ld-06', biz_id, 'agt-06', 'Singh Family', 'OPEN_HOUSE', 'BUYER', '2025-06-25'::date, 3, 'CLOSED', 0, true, NULL),
  ('ld-07', biz_id, 'agt-12', 'Brown Couple', 'ZILLOW', 'BUYER', '2025-07-20'::date, 22, 'CLOSED', 85, true, NULL),
  ('ld-08', biz_id, 'agt-12', 'Davis Family', 'SOI', 'SELLER', '2025-09-05'::date, 15, 'CLOSED', 0, true, NULL),
  -- Lost leads
  ('ld-09', biz_id, 'agt-04', 'Martin Family', 'ZILLOW', 'BUYER', '2025-05-01'::date, 120, 'LOST', 85, false, 'Went with another agent'),
  ('ld-10', biz_id, 'agt-04', 'Lee Couple', 'REALTOR_COM', 'BUYER', '2025-06-10'::date, 180, 'LOST', 95, false, 'No response after initial'),
  ('ld-11', biz_id, 'agt-07', 'Robinson Sr', 'ZILLOW', 'BUYER', '2025-04-15'::date, 420, 'LOST', 85, false, 'Never responded'),
  ('ld-12', biz_id, 'agt-07', 'Clark Family', 'REALTOR_COM', 'BUYER', '2025-05-20'::date, 360, 'LOST', 95, false, 'Too slow'),
  ('ld-13', biz_id, 'agt-07', 'Walker Couple', 'ZILLOW', 'BUYER', '2025-06-25'::date, 480, 'LOST', 85, false, 'Went elsewhere'),
  ('ld-14', biz_id, 'agt-07', 'Hall Family', 'COLD', 'SELLER', '2025-07-10'::date, 600, 'LOST', 0, false, 'No follow up'),
  ('ld-15', biz_id, 'agt-08', 'Young Couple', 'ZILLOW', 'BUYER', '2025-05-05'::date, 300, 'LOST', 85, false, 'Slow response'),
  ('ld-16', biz_id, 'agt-08', 'Allen Sr', 'REALTOR_COM', 'BUYER', '2025-06-15'::date, 240, 'LOST', 95, false, 'Lost interest'),
  ('ld-17', biz_id, 'agt-08', 'King Family', 'WEBSITE', 'SELLER', '2025-07-20'::date, 360, 'LOST', 25, false, 'Listed with competitor'),
  ('ld-18', biz_id, 'agt-08', 'Scott Couple', 'ZILLOW', 'BUYER', '2025-08-10'::date, 540, 'LOST', 85, false, 'No response');
  
  -- More leads to fill out sources (40 more)
  INSERT INTO re_leads (id, business_id, agent_id, lead_name, lead_source, lead_type, lead_date, first_response_minutes, status, monthly_cost, converted, lost_reason) VALUES
  ('ld-19', biz_id, 'agt-02', 'Thompson Jr', 'ZILLOW', 'BUYER', '2025-08-01'::date, 15, 'SHOWING', 85, false, NULL),
  ('ld-20', biz_id, 'agt-03', 'White Family', 'REFERRAL', 'SELLER', '2025-09-10'::date, 8, 'CLOSED', 0, true, NULL),
  ('ld-21', biz_id, 'agt-04', 'Harris Couple', 'FACEBOOK', 'BUYER', '2025-07-15'::date, 45, 'LOST', 40, false, 'Unqualified'),
  ('ld-22', biz_id, 'agt-05', 'Nelson Sr', 'GOOGLE_ADS', 'BUYER', '2025-06-20'::date, 30, 'LOST', 65, false, 'Not ready to buy'),
  ('ld-23', biz_id, 'agt-06', 'Baker Trust', 'REFERRAL', 'SELLER', '2025-08-05'::date, 12, 'CLOSED', 0, true, NULL),
  ('ld-24', biz_id, 'agt-11', 'Gonzalez Family', 'SOI', 'SELLER', '2025-06-01'::date, 5, 'CLOSED', 0, true, NULL),
  ('ld-25', biz_id, 'agt-11', 'Martinez Estate', 'REFERRAL', 'BUYER', '2025-09-01'::date, 8, 'CLOSED', 0, true, NULL),
  -- Zillow/portal leads that cost money but don't convert (LEAK!)
  ('ld-26', biz_id, 'agt-04', 'Anderson', 'ZILLOW', 'BUYER', '2025-04-10'::date, 60, 'LOST', 85, false, 'Unresponsive'),
  ('ld-27', biz_id, 'agt-05', 'Thomas', 'ZILLOW', 'BUYER', '2025-05-18'::date, 45, 'LOST', 85, false, 'Not serious'),
  ('ld-28', biz_id, 'agt-04', 'Jackson', 'REALTOR_COM', 'BUYER', '2025-06-22'::date, 90, 'LOST', 95, false, 'Went with friend'),
  ('ld-29', biz_id, 'agt-05', 'Moore', 'ZILLOW', 'BUYER', '2025-07-30'::date, 55, 'LOST', 85, false, 'Pre-approved expired'),
  ('ld-30', biz_id, 'agt-06', 'Turner', 'REALTOR_COM', 'BUYER', '2025-08-15'::date, 20, 'SHOWING', 95, false, NULL),
  ('ld-31', biz_id, 'agt-04', 'Phillips', 'ZILLOW', 'BUYER', '2025-09-05'::date, 75, 'LOST', 85, false, 'Ghosted'),
  ('ld-32', biz_id, 'agt-07', 'Campbell', 'ZILLOW', 'BUYER', '2025-10-01'::date, 300, 'LOST', 85, false, 'Too slow'),
  ('ld-33', biz_id, 'agt-08', 'Parker', 'ZILLOW', 'BUYER', '2025-10-15'::date, 240, 'LOST', 85, false, 'Ghosted'),
  ('ld-34', biz_id, 'agt-02', 'Evans', 'GOOGLE_ADS', 'BUYER', '2025-05-25'::date, 20, 'QUALIFIED', 65, false, NULL),
  ('ld-35', biz_id, 'agt-03', 'Edwards', 'FACEBOOK', 'SELLER', '2025-06-30'::date, 35, 'LOST', 40, false, 'Listed FSBO'),
  ('ld-36', biz_id, 'agt-01', 'Cooper Estate', 'SOI', 'SELLER', '2025-08-20'::date, 3, 'CLOSED', 0, true, NULL),
  ('ld-37', biz_id, 'agt-01', 'Reed Family', 'REFERRAL', 'BUYER', '2025-09-15'::date, 6, 'CLOSED', 0, true, NULL),
  ('ld-38', biz_id, 'agt-02', 'Ward Family', 'SOI', 'BUYER', '2025-10-20'::date, 10, 'CONTRACT', 0, false, NULL),
  ('ld-39', biz_id, 'agt-03', 'Brooks', 'WEBSITE', 'BUYER', '2025-11-01'::date, 18, 'QUALIFIED', 25, false, NULL),
  ('ld-40', biz_id, 'agt-06', 'Cox Family', 'SOI', 'SELLER', '2025-11-10'::date, 8, 'QUALIFIED', 0, false, NULL);

  -- =====================================================================
  -- MARKETING SPEND (by channel, by month)
  -- =====================================================================
  INSERT INTO re_marketing_spend (id, business_id, agent_id, channel, month, spend_amount, leads_generated, appointments_set, deals_closed, revenue_attributed) VALUES
  -- ZILLOW (high spend, low ROI = LEAK!)
  ('mkt-01', biz_id, NULL, 'ZILLOW', '2025-07-01'::date, 2800, 12, 4, 1, 7476),
  ('mkt-02', biz_id, NULL, 'ZILLOW', '2025-08-01'::date, 2800, 10, 3, 0, 0),
  ('mkt-03', biz_id, NULL, 'ZILLOW', '2025-09-01'::date, 2800, 8, 2, 0, 0),
  ('mkt-04', biz_id, NULL, 'ZILLOW', '2025-10-01'::date, 2800, 9, 3, 0, 0),
  -- REALTOR.COM (medium spend, poor ROI)
  ('mkt-05', biz_id, NULL, 'REALTOR_COM', '2025-07-01'::date, 1500, 6, 2, 0, 0),
  ('mkt-06', biz_id, NULL, 'REALTOR_COM', '2025-08-01'::date, 1500, 5, 1, 0, 0),
  ('mkt-07', biz_id, NULL, 'REALTOR_COM', '2025-09-01'::date, 1500, 4, 1, 0, 0),
  ('mkt-08', biz_id, NULL, 'REALTOR_COM', '2025-10-01'::date, 1500, 5, 2, 0, 0),
  -- GOOGLE ADS (decent ROI)
  ('mkt-09', biz_id, NULL, 'GOOGLE_ADS', '2025-07-01'::date, 800, 6, 3, 1, 10547),
  ('mkt-10', biz_id, NULL, 'GOOGLE_ADS', '2025-08-01'::date, 800, 7, 4, 1, 8544),
  ('mkt-11', biz_id, NULL, 'GOOGLE_ADS', '2025-09-01'::date, 800, 5, 2, 0, 0),
  ('mkt-12', biz_id, NULL, 'GOOGLE_ADS', '2025-10-01'::date, 800, 8, 4, 1, 11138),
  -- FACEBOOK (moderate)
  ('mkt-13', biz_id, NULL, 'FACEBOOK', '2025-07-01'::date, 600, 8, 2, 0, 0),
  ('mkt-14', biz_id, NULL, 'FACEBOOK', '2025-08-01'::date, 600, 10, 3, 0, 0),
  ('mkt-15', biz_id, NULL, 'FACEBOOK', '2025-09-01'::date, 600, 6, 1, 0, 0),
  ('mkt-16', biz_id, NULL, 'FACEBOOK', '2025-10-01'::date, 600, 9, 2, 0, 0),
  -- DIRECT MAIL (old school, zero ROI = LEAK!)
  ('mkt-17', biz_id, NULL, 'DIRECT_MAIL', '2025-07-01'::date, 1200, 1, 0, 0, 0),
  ('mkt-18', biz_id, NULL, 'DIRECT_MAIL', '2025-08-01'::date, 1200, 2, 0, 0, 0),
  ('mkt-19', biz_id, NULL, 'DIRECT_MAIL', '2025-09-01'::date, 1200, 0, 0, 0, 0),
  ('mkt-20', biz_id, NULL, 'DIRECT_MAIL', '2025-10-01'::date, 1200, 1, 0, 0, 0);

  -- =====================================================================
  -- RENTAL PROPERTIES (18 properties — PM portfolio)
  -- =====================================================================
  INSERT INTO re_rental_properties (id, business_id, property_address, property_type, unit_count, owner_name, management_fee_pct, monthly_rent, market_rent, current_occupancy, lease_start, lease_end, tenant_name, last_rent_increase, annual_maintenance_cost, annual_insurance, annual_property_tax, vacancy_days_ytd, turnover_cost_last) VALUES
  -- Well-managed properties
  ('rp-01', biz_id, '100 Main St #1', 'MULTI_FAMILY', 1, 'Anderson Holdings', 10.00, 1800, 1850, 'OCCUPIED', '2025-03-01'::date, '2026-02-28'::date, 'Tenant A', '2025-03-01'::date, 2200, 1400, 3600, 0, 1800),
  ('rp-02', biz_id, '100 Main St #2', 'MULTI_FAMILY', 1, 'Anderson Holdings', 10.00, 1750, 1850, 'OCCUPIED', '2025-06-01'::date, '2026-05-31'::date, 'Tenant B', '2025-06-01'::date, 1800, 1400, 3600, 0, 2200),
  ('rp-03', biz_id, '200 Oak Ave', 'SFR', 1, 'Patricia Wells', 10.00, 2200, 2300, 'OCCUPIED', '2025-01-15'::date, '2026-01-14'::date, 'Tenant C', '2025-01-15'::date, 3500, 2100, 4800, 0, 2500),
  ('rp-04', biz_id, '315 Elm Dr', 'SFR', 1, 'Frank Torres', 10.00, 1950, 2100, 'OCCUPIED', '2024-09-01'::date, '2025-08-31'::date, 'Tenant D', '2024-09-01'::date, 2800, 1800, 4200, 0, 1500),
  ('rp-05', biz_id, '420 Pine Rd', 'SFR', 1, 'Sandra Kim', 8.00, 2400, 2500, 'OCCUPIED', '2025-04-01'::date, '2026-03-31'::date, 'Tenant E', '2025-04-01'::date, 3200, 2400, 5200, 0, 3000),
  -- BELOW MARKET RENT (LEAK!)
  ('rp-06', biz_id, '550 Cedar Ln', 'SFR', 1, 'Robert Hall', 8.00, 1600, 2000, 'OCCUPIED', '2023-06-01'::date, '2026-05-31'::date, 'Tenant F - Long Term', '2022-06-01'::date, 2400, 1600, 3800, 0, 0),
  ('rp-07', biz_id, '680 Birch Way', 'SFR', 1, 'Mary Adams', 8.00, 1450, 1800, 'OCCUPIED', '2022-09-01'::date, '2025-08-31'::date, 'Tenant G - Long Term', '2021-09-01'::date, 4200, 1500, 3500, 0, 0),
  ('rp-08', biz_id, '75 River Ct #A', 'CONDO', 1, 'David Chang', 7.00, 1350, 1650, 'OCCUPIED', '2024-03-01'::date, '2025-02-28'::date, 'Tenant H', '2023-03-01'::date, 1200, 1100, 2800, 0, 1200),
  -- VACANT PROPERTIES (LEAK!)
  ('rp-09', biz_id, '900 Valley Dr', 'SFR', 1, 'Lisa Park', 10.00, 2100, 2100, 'VACANT', NULL, NULL, NULL, '2025-06-01'::date, 3800, 2000, 4500, 75, 4200),
  ('rp-10', biz_id, '445 Sunset Blvd', 'CONDO', 1, 'James Wilson', 10.00, 1650, 1700, 'VACANT', NULL, NULL, NULL, '2025-04-01'::date, 1500, 1200, 3000, 52, 3500),
  -- LOW MANAGEMENT FEE (LEAK!)
  ('rp-11', biz_id, '88 Harbor View', 'SFR', 1, 'Tom Bradley Sr', 5.00, 2800, 2900, 'OCCUPIED', '2025-02-01'::date, '2026-01-31'::date, 'Tenant I', '2025-02-01'::date, 4000, 2800, 6200, 0, 0),
  ('rp-12', biz_id, '22 Mountain Rd', 'SFR', 1, 'Karen White', 6.00, 2500, 2600, 'OCCUPIED', '2025-05-01'::date, '2026-04-30'::date, 'Tenant J', '2025-05-01'::date, 3600, 2200, 5500, 0, 2000),
  -- LEASE EXPIRING SOON (RENEWAL RISK)
  ('rp-13', biz_id, '160 Park Ave', 'CONDO', 1, 'Nancy Miller', 10.00, 1550, 1650, 'OCCUPIED', '2025-04-01'::date, '2026-03-31'::date, 'Tenant K', '2025-04-01'::date, 1800, 1300, 3200, 0, 1500),
  ('rp-14', biz_id, '280 Lake St', 'SFR', 1, 'George Davis', 10.00, 2000, 2150, 'OCCUPIED', '2025-03-15'::date, '2026-03-14'::date, 'Tenant L', '2025-03-15'::date, 2600, 1900, 4600, 0, 2800),
  ('rp-15', biz_id, '350 Hill Dr', 'SFR', 1, 'Betty Johnson', 10.00, 1900, 2000, 'OCCUPIED', '2025-05-01'::date, '2026-04-30'::date, 'Tenant M', '2025-05-01'::date, 2200, 1700, 4100, 0, 1800),
  -- HIGH MAINTENANCE (LEAK!)
  ('rp-16', biz_id, '500 Old Farm Rd', 'SFR', 1, 'William Clark', 10.00, 1800, 1850, 'OCCUPIED', '2025-01-01'::date, '2025-12-31'::date, 'Tenant N', '2025-01-01'::date, 8500, 2000, 4000, 0, 0),
  -- More standard
  ('rp-17', biz_id, '620 Meadow Ln', 'TOWNHOUSE', 1, 'Susan Brown', 10.00, 2100, 2150, 'OCCUPIED', '2025-07-01'::date, '2026-06-30'::date, 'Tenant O', '2025-07-01'::date, 2400, 1800, 4400, 0, 2100),
  ('rp-18', biz_id, '730 Creek Side', 'SFR', 1, 'Richard Lee', 10.00, 2350, 2400, 'OCCUPIED', '2025-08-01'::date, '2026-07-31'::date, 'Tenant P', '2025-08-01'::date, 2800, 2100, 5000, 0, 1900);

  -- =====================================================================
  -- RENT ROLLS (6 months × 16 occupied properties)
  -- =====================================================================
  -- Most pay on time, some delinquent (LEAK!)
  INSERT INTO re_rent_rolls (id, business_id, property_id, month, rent_due, rent_collected, late_fee_due, late_fee_collected, days_late, collection_status) VALUES
  -- rp-04 (chronic late payer)
  ('rr-01', biz_id, 'rp-04', '2025-07-01'::date, 1950, 1950, 75, 0, 8, 'PAID'),
  ('rr-02', biz_id, 'rp-04', '2025-08-01'::date, 1950, 1950, 75, 0, 12, 'PAID'),
  ('rr-03', biz_id, 'rp-04', '2025-09-01'::date, 1950, 1200, 75, 0, 22, 'PARTIAL'),
  ('rr-04', biz_id, 'rp-04', '2025-10-01'::date, 1950, 0, 75, 0, 30, 'DELINQUENT'),
  -- rp-07 (occasional late)
  ('rr-05', biz_id, 'rp-07', '2025-07-01'::date, 1450, 1450, 0, 0, 0, 'PAID'),
  ('rr-06', biz_id, 'rp-07', '2025-08-01'::date, 1450, 1450, 75, 0, 6, 'PAID'),
  ('rr-07', biz_id, 'rp-07', '2025-09-01'::date, 1450, 1450, 0, 0, 0, 'PAID'),
  ('rr-08', biz_id, 'rp-07', '2025-10-01'::date, 1450, 1000, 75, 0, 15, 'PARTIAL'),
  -- rp-08 (delinquent)
  ('rr-09', biz_id, 'rp-08', '2025-09-01'::date, 1350, 0, 75, 0, 30, 'DELINQUENT'),
  ('rr-10', biz_id, 'rp-08', '2025-10-01'::date, 1350, 0, 75, 0, 30, 'DELINQUENT'),
  -- Good payers (representative sample)
  ('rr-11', biz_id, 'rp-01', '2025-09-01'::date, 1800, 1800, 0, 0, 0, 'PAID'),
  ('rr-12', biz_id, 'rp-01', '2025-10-01'::date, 1800, 1800, 0, 0, 0, 'PAID'),
  ('rr-13', biz_id, 'rp-02', '2025-09-01'::date, 1750, 1750, 0, 0, 0, 'PAID'),
  ('rr-14', biz_id, 'rp-02', '2025-10-01'::date, 1750, 1750, 0, 0, 0, 'PAID'),
  ('rr-15', biz_id, 'rp-03', '2025-09-01'::date, 2200, 2200, 0, 0, 0, 'PAID'),
  ('rr-16', biz_id, 'rp-03', '2025-10-01'::date, 2200, 2200, 0, 0, 0, 'PAID'),
  ('rr-17', biz_id, 'rp-05', '2025-09-01'::date, 2400, 2400, 0, 0, 0, 'PAID'),
  ('rr-18', biz_id, 'rp-05', '2025-10-01'::date, 2400, 2400, 0, 0, 0, 'PAID'),
  ('rr-19', biz_id, 'rp-11', '2025-09-01'::date, 2800, 2800, 0, 0, 0, 'PAID'),
  ('rr-20', biz_id, 'rp-11', '2025-10-01'::date, 2800, 2800, 0, 0, 0, 'PAID'),
  ('rr-21', biz_id, 'rp-16', '2025-09-01'::date, 1800, 1800, 0, 0, 0, 'PAID'),
  ('rr-22', biz_id, 'rp-16', '2025-10-01'::date, 1800, 1800, 0, 0, 0, 'PAID');

  RAISE NOTICE 'Real Estate demo data seeded successfully for business: %', biz_id;
END $$;
