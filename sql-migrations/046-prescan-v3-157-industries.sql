-- Fix: Make affiliate_category nullable for new patterns that don't include it
ALTER TABLE industry_leak_patterns ALTER COLUMN affiliate_category DROP NOT NULL;
ALTER TABLE industry_leak_patterns ALTER COLUMN affiliate_category SET DEFAULT 'General';
ALTER TABLE industry_leak_patterns ALTER COLUMN evidence_line DROP NOT NULL;

-- ============================================================
-- LEAK & GROW: PRE-SCAN v3 COMPLETE SEED DATA
-- 156 Industries | 673 Leak Patterns | 671 Quiz Questions
-- Generated from Deep Leak Database - February 2026
-- ============================================================

-- NOTE: Run this AFTER creating tables from the schema migration.


-- ========== ACCOUNTING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3aae29f4-4db4-5f59-8b50-b45b9e20736a', 'accounting', 'Revenue Leak', 'accounting.leak_01',
   'Realization rate below 85%', 'Compare billed amount to standard rate × hours worked',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Realization rate >85%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare billed amount to standard rate × hours worked', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c7e58dfc-f63b-5ef8-a72c-10ffc9467a1f', 'accounting', 'Revenue Leak', 'accounting.leak_02',
   'Utilization below 60%', 'Track billable hours / available hours per staff',
   75.00, 'critical', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Utilization >60%. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours per staff', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2d3450e6-b74d-519a-b5ef-43a3ff0e8844', 'accounting', 'Cash Flow Leak', 'accounting.leak_03',
   'AR days above 45', 'Track average collection period by client',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: AR days <45. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track average collection period by client', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('894ff19f-94f6-510a-b645-36842bc57dcc', 'accounting', 'Cost Leak', 'accounting.leak_04',
   'Staff leverage ratio suboptimal', 'Track revenue per partner and staff leverage',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Partner:staff ratio 1:5+. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track revenue per partner and staff leverage', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for accounting
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting', 'Does your realization rate meet the target of Realization rate >85%?', 1, '3aae29f4-4db4-5f59-8b50-b45b9e20736a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting', 'Does your utilization meet the target of Utilization >60%?', 2, 'c7e58dfc-f63b-5ef8-a72c-10ffc9467a1f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting', 'Do you regularly track revenue per partner and staff leverage?', 3, '894ff19f-94f6-510a-b645-36842bc57dcc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting', 'Is your ar days within target (AR days <45)?', 4, '2d3450e6-b74d-519a-b5ef-43a3ff0e8844')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ADDICTION-TREATMENT (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('df5911cc-9e36-5cc0-841b-5ff4ecb501ba', 'addiction-treatment', 'Revenue Leak', 'addiction-treatment.leak_01',
   'Bed occupancy below 85%', 'Track occupied beds vs licensed capacity',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Occupancy >85%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track occupied beds vs licensed capacity', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('71efbc42-8cdb-5372-943c-107b67476cc0', 'addiction-treatment', 'Revenue Leak', 'addiction-treatment.leak_02',
   'Insurance reimbursement below allowed', 'Compare paid vs allowed by payer and service',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Audit underpayments monthly. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare paid vs allowed by payer and service', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b0c01457-5875-58c8-90f5-1006dc5e1803', 'addiction-treatment', 'Cost Leak', 'addiction-treatment.leak_03',
   'Staff cost above 55% of revenue', 'Track all staff costs as % of revenue',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Staff <55% revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track all staff costs as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for addiction-treatment
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('addiction-treatment', 'Does your bed occupancy meet the target of Occupancy >85%?', 1, 'df5911cc-9e36-5cc0-841b-5ff4ecb501ba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('addiction-treatment', 'Does your insurance reimbursement meet the target of Audit underpayments monthly?', 2, '71efbc42-8cdb-5372-943c-107b67476cc0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('addiction-treatment', 'Is your staff cost within target (Staff <55% revenue)?', 3, 'b0c01457-5875-58c8-90f5-1006dc5e1803')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== AGENCY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('100620dc-3cc0-5a2c-b40e-82375d082954', 'agency', 'Revenue Leak', 'agency.leak_01',
   'Billable utilization below 60%', 'Track billable hours per team member',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Utilization >60%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track billable hours per team member', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('263f5d64-35e7-5713-8441-c5570c3ad1a0', 'agency', 'Revenue Leak', 'agency.leak_02',
   'Client retention below 80%', 'Track client departures and revenue lost',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Client retention >80%/yr. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8db345c0-4a5c-5978-b9b4-4e762f3665a2', 'agency', 'Revenue Leak', 'agency.leak_03',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Change orders billed 100%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('53397cbc-45b8-5f7a-8fa8-a6cd41543f2a', 'agency', 'Cost Leak', 'agency.leak_04',
   'Software subscription bloat', 'Audit active tool subscriptions and usage',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Tool spend <5% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Audit active tool subscriptions and usage', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for agency
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('agency', 'Does your client retention meet the target of Client retention >80%/yr?', 1, '263f5d64-35e7-5713-8441-c5570c3ad1a0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('agency', 'Does your billable utilization meet the target of Utilization >60%?', 2, '100620dc-3cc0-5a2c-b40e-82375d082954')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('agency', 'Is your scope creep being billed?', 3, '8db345c0-4a5c-5978-b9b4-4e762f3665a2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('agency', 'Do you regularly audit active tool subscriptions and usage?', 4, '53397cbc-45b8-5f7a-8fa8-a6cd41543f2a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== AMUSEMENT-RECREATION (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6042785b-191d-5cb9-94b6-4e688ce7e8f1', 'amusement-recreation', 'Revenue Leak', 'amusement-recreation.leak_01',
   'Revenue per visit below benchmark', 'Compare avg ticket to market benchmark',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Track and improve revenue/visit. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare avg ticket to market benchmark', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d6253c06-456e-5075-8ec2-550bdd4965ce', 'amusement-recreation', 'Revenue Leak', 'amusement-recreation.leak_02',
   'F&B margin below 60%', 'Track food/beverage cost as % of F&B sales',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: F&B margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track food/beverage cost as % of F&B sales', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('07337ce7-493b-5068-b65b-0ed74e79f23d', 'amusement-recreation', 'Cost Leak', 'amusement-recreation.leak_03',
   'Staffing cost above 35% of revenue', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Staffing <35% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for amusement-recreation
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('amusement-recreation', 'Does your revenue per visit meet the target of Track and improve revenue/visit?', 1, '6042785b-191d-5cb9-94b6-4e688ce7e8f1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('amusement-recreation', 'Does your f&b margin meet the target of F&B margin >60%?', 2, 'd6253c06-456e-5075-8ec2-550bdd4965ce')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('amusement-recreation', 'Is your staffing cost within target (Staffing <35% revenue)?', 3, '07337ce7-493b-5068-b65b-0ed74e79f23d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== APP-DEVELOPMENT (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('460b0e80-9266-591e-8541-203135813c84', 'app-development', 'Cost Leak', 'app-development.leak_01',
   'Project overrun above 20% of estimate', 'Compare actual hours to estimated hours per project',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Budget overrun <20%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare actual hours to estimated hours per project', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('888354e0-4561-5a8f-942e-ad978d2cae13', 'app-development', 'Revenue Leak', 'app-development.leak_02',
   'Developer billable utilization below 65%', 'Track billable vs non-billable hours per developer',
   75.00, 'critical', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Utilization >65%. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Track billable vs non-billable hours per developer', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fd18ce65-2f06-5ecb-ac53-5de311530027', 'app-development', 'Cost Leak', 'app-development.leak_03',
   'QA/testing cost above 25% of dev cost', 'Compare testing hours to development hours per project',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: QA cost <25% of dev cost. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare testing hours to development hours per project', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('01ff31b4-8f2d-5270-a46a-876b1e3ae05d', 'app-development', 'Revenue Leak', 'app-development.leak_04',
   'Client retention below 60% for follow-on work', 'Track clients with repeat engagements',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Repeat client rate >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track clients with repeat engagements', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for app-development
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('app-development', 'Is your project overrun within target (Budget overrun <20%)?', 1, '460b0e80-9266-591e-8541-203135813c84')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('app-development', 'Does your developer billable utilization meet the target of Utilization >65%?', 2, '888354e0-4561-5a8f-942e-ad978d2cae13')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('app-development', 'Does your client retention meet the target of Repeat client rate >60%?', 3, '01ff31b4-8f2d-5270-a46a-876b1e3ae05d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('app-development', 'Is your qa/testing cost within target (QA cost <25% of dev cost)?', 4, 'fd18ce65-2f06-5ecb-ac53-5de311530027')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== APPLIANCE-REPAIR (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9aa50ee2-ef08-5e7e-95e9-c2f27e4677a5', 'appliance-repair', 'Revenue Leak', 'appliance-repair.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c3ee824-f4a8-5c5d-add6-a4e732b25f03', 'appliance-repair', 'Cost Leak', 'appliance-repair.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('549154ef-8823-5044-bbb0-187f02fcd0a6', 'appliance-repair', 'Cost Leak', 'appliance-repair.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for appliance-repair
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('appliance-repair', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, '9aa50ee2-ef08-5e7e-95e9-c2f27e4677a5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('appliance-repair', 'Is your labor/operator cost within target (Labor <45% revenue)?', 2, '6c3ee824-f4a8-5c5d-add6-a4e732b25f03')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('appliance-repair', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 3, '549154ef-8823-5044-bbb0-187f02fcd0a6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ARCHITECTURE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('729e7b9d-8f56-5b1d-817e-852c011657b1', 'architecture', 'Revenue Leak', 'architecture.leak_01',
   'Utilization rate below 60%', 'Track billable hours / total available hours',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Utilization >60%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track billable hours / total available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4c76e786-977a-5474-95c1-663e6f9852c0', 'architecture', 'Cost Leak', 'architecture.leak_02',
   'Project overrun above 15%', 'Compare actual project hours to proposal estimate',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Budget overrun <15%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare actual project hours to proposal estimate', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6082a7f9-c76c-559c-b253-342712dc9bb1', 'architecture', 'Revenue Leak', 'architecture.leak_03',
   'Realization rate below 80%', 'Compare billed amount to standard rate × hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Realization >80%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare billed amount to standard rate × hours', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('55333154-b904-59b9-a147-e9d8ab5d6a5b', 'architecture', 'Revenue Leak', 'architecture.leak_04',
   'Change order revenue not captured', 'Track scope changes and additional billing',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Change orders billed 100%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track scope changes and additional billing', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c2b1d878-1171-5681-814b-2e5323fa9ff0', 'architecture', 'Cost Leak', 'architecture.leak_05',
   'E&O insurance above peers', 'Compare E&O premium to peer firms',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: E&O benchmarked annually. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare E&O premium to peer firms', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for architecture
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('architecture', 'Does your utilization rate meet the target of Utilization >60%?', 1, '729e7b9d-8f56-5b1d-817e-852c011657b1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('architecture', 'Is your project overrun within target (Budget overrun <15%)?', 2, '4c76e786-977a-5474-95c1-663e6f9852c0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('architecture', 'Does your realization rate meet the target of Realization >80%?', 3, '6082a7f9-c76c-559c-b253-342712dc9bb1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('architecture', 'Is your change order revenue being captured?', 4, '55333154-b904-59b9-a147-e9d8ab5d6a5b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('architecture', 'Is your e&o insurance within target (E&O benchmarked annually)?', 5, 'c2b1d878-1171-5681-814b-2e5323fa9ff0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== AUTO-BODY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6d75da98-22dd-5848-9bbb-0aa7d31448e0', 'auto-body', 'Revenue Leak', 'auto-body.leak_01',
   'Supplement rate above 30%', 'Compare initial estimate to final billed amount',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Track supplement recovery rate. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare initial estimate to final billed amount', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d76d49bc-641b-5e04-bd25-3a25782266be', 'auto-body', 'Operational Leak', 'auto-body.leak_02',
   'Cycle time above 5 days for standard repair', 'Track keys-to-keys time per repair',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Cycle time <5 days standard. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track keys-to-keys time per repair', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('54de3bab-8ed9-5777-bd09-c1863c7762b2', 'auto-body', 'Cost Leak', 'auto-body.leak_03',
   'Paint material cost above $400/job', 'Track paint/material cost per repair order',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Paint cost <$400/avg job. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track paint/material cost per repair order', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('216f53e9-878c-54e0-b695-6b47c565b978', 'auto-body', 'Revenue Leak', 'auto-body.leak_04',
   'Customer pay ratio below 20%', 'Track customer pay vs insurance pay mix',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Customer pay >20% of total revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track customer pay vs insurance pay mix', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for auto-body
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-body', 'Is your supplement rate within target (Track supplement recovery rate)?', 1, '6d75da98-22dd-5848-9bbb-0aa7d31448e0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-body', 'Is your cycle time within target (Cycle time <5 days standard)?', 2, 'd76d49bc-641b-5e04-bd25-3a25782266be')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-body', 'Is your paint material cost within target (Paint cost <$400/avg job)?', 3, '54de3bab-8ed9-5777-bd09-c1863c7762b2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-body', 'Does your customer pay ratio meet the target of Customer pay >20% of total revenue?', 4, '216f53e9-878c-54e0-b695-6b47c565b978')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== AUTO-DETAILING (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('921a525d-b64a-555f-9d68-809fd9127ad1', 'auto-detailing', 'Revenue Leak', 'auto-detailing.leak_01',
   'Revenue per vehicle below $150', 'Track average ticket per vehicle',
   75.00, 'critical', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Rev/vehicle >$150 avg. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track average ticket per vehicle', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7111d2c8-c7f1-5c54-9063-05c8cbdc1f17', 'auto-detailing', 'Cost Leak', 'auto-detailing.leak_02',
   'Product cost above 10% of revenue', 'Track product cost per detail job',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Product <10% revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track product cost per detail job', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9562f56f-7f5e-5c4b-bd88-c0602f2591c1', 'auto-detailing', 'Revenue Leak', 'auto-detailing.leak_03',
   'Membership conversion below 15%', 'Track one-time to recurring customer conversion',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Membership conversion >15%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track one-time to recurring customer conversion', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for auto-detailing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-detailing', 'Does your revenue per vehicle meet the target of Rev/vehicle >$150 avg?', 1, '921a525d-b64a-555f-9d68-809fd9127ad1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-detailing', 'Does your membership conversion meet the target of Membership conversion >15%?', 2, '9562f56f-7f5e-5c4b-bd88-c0602f2591c1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-detailing', 'Is your product cost within target (Product <10% revenue)?', 3, '7111d2c8-c7f1-5c54-9063-05c8cbdc1f17')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== AUTO-PARTS (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d629d6c8-c771-5ad8-9b09-cf275c96ed02', 'auto-parts', 'Cost Leak', 'auto-parts.leak_01',
   'Inventory obsolescence above 5%', 'Track slow-moving SKUs >12 months age',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Obsolescence <5% of inventory. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track slow-moving SKUs >12 months age', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2c978403-0fa7-5755-bba3-e820e40b2817', 'auto-parts', 'Revenue Leak', 'auto-parts.leak_02',
   'Core return revenue uncaptured', 'Track core deposits collected vs cores returned to supplier',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Core return rate >80%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track core deposits collected vs cores returned to supplier', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d4531052-a3bc-5b56-80c3-f13d6d486029', 'auto-parts', 'Cost Leak', 'auto-parts.leak_03',
   'Delivery cost per order above norm', 'Track delivery cost per order for commercial customers',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Delivery cost <$8/order. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track delivery cost per order for commercial customers', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9dc8566e-9ffd-557d-9fd8-1b174870e2dc', 'auto-parts', 'Cash Flow Leak', 'auto-parts.leak_04',
   'Warranty claim processing slow', 'Track days from claim to credit received',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Warranty claims processed <14 days. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track days from claim to credit received', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for auto-parts
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-parts', 'Is your inventory obsolescence within target (Obsolescence <5% of inventory)?', 1, 'd629d6c8-c771-5ad8-9b09-cf275c96ed02')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-parts', 'Do you regularly track core deposits collected vs cores returned to supplier?', 2, '2c978403-0fa7-5755-bba3-e820e40b2817')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-parts', 'Is your delivery cost per order within target (Delivery cost <$8/order)?', 3, 'd4531052-a3bc-5b56-80c3-f13d6d486029')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-parts', 'Do you regularly track days from claim to credit received?', 4, '9dc8566e-9ffd-557d-9fd8-1b174870e2dc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== AUTO-REPAIR (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('47d9e84d-e052-585d-8bf6-3c4a411bce70', 'auto-repair', 'Revenue Leak', 'auto-repair.leak_01',
   'Effective labor rate below $100/hr', 'Compare revenue from labor to hours billed',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: ELR >$100/hr. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare revenue from labor to hours billed', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5cec6f0f-5e0b-53b1-ba58-ddbee247795d', 'auto-repair', 'Revenue Leak', 'auto-repair.leak_02',
   'Parts markup below 40%', 'Compare parts cost to customer billed price',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Parts markup >40%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare parts cost to customer billed price', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e3d56dc7-eead-5acc-ae27-64111c5b6e2b', 'auto-repair', 'Operational Leak', 'auto-repair.leak_03',
   'Bay utilization below 75%', 'Track productive hours per bay per day',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Bay utilization >75%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track productive hours per bay per day', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b73091de-ec0f-5788-95d5-0d3f408b40f8', 'auto-repair', 'Cost Leak', 'auto-repair.leak_04',
   'Comeback rate above 3%', 'Track vehicles returning for same issue within 30 days',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Comeback rate <3%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track vehicles returning for same issue within 30 days', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for auto-repair
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-repair', 'Does your effective labor rate meet the target of ELR >$100/hr?', 1, '47d9e84d-e052-585d-8bf6-3c4a411bce70')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-repair', 'Does your parts markup meet the target of Parts markup >40%?', 2, '5cec6f0f-5e0b-53b1-ba58-ddbee247795d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-repair', 'Does your bay utilization meet the target of Bay utilization >75%?', 3, 'e3d56dc7-eead-5acc-ae27-64111c5b6e2b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto-repair', 'Is your comeback rate within target (Comeback rate <3%)?', 4, 'b73091de-ec0f-5788-95d5-0d3f408b40f8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BAKERY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('121eb183-1b56-5cdc-9b5d-d9ed2c39362c', 'bakery', 'Cost Leak', 'bakery.leak_01',
   'Ingredient cost above 30%', 'Track ingredient cost per product vs selling price',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Ingredient cost <30%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track ingredient cost per product vs selling price', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('82fc3f06-f9cb-5307-879f-e59a7f8a9aec', 'bakery', 'Cost Leak', 'bakery.leak_02',
   'Waste/unsold above 8%', 'Track product produced vs product sold daily',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Unsold product <8%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track product produced vs product sold daily', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('863f3cce-cd1e-59db-8605-e65ad0279652', 'bakery', 'Operational Leak', 'bakery.leak_03',
   'Production yield below 95%', 'Compare finished goods output to input ingredients',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Yield >95%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare finished goods output to input ingredients', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2d73e267-eec4-51d6-ae83-b5c6e62a1b77', 'bakery', 'Revenue Leak', 'bakery.leak_04',
   'Wholesale margin below retail', 'Compare wholesale pricing to COGS + overhead allocation',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Wholesale priced for min 20% margin. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare wholesale pricing to COGS + overhead allocation', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d008b41d-edf4-5415-aabb-0e00e1dc895a', 'bakery', 'Cost Leak', 'bakery.leak_05',
   'Labor scheduling inefficiency', 'Compare baking staff hours to production output',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Early AM labor optimized to production. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare baking staff hours to production output', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for bakery
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery', 'Is your ingredient cost within target (Ingredient cost <30%)?', 1, '121eb183-1b56-5cdc-9b5d-d9ed2c39362c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery', 'Is your waste/unsold within target (Unsold product <8%)?', 2, '82fc3f06-f9cb-5307-879f-e59a7f8a9aec')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery', 'Does your wholesale margin meet the target of Wholesale priced for min 20% margin?', 3, '2d73e267-eec4-51d6-ae83-b5c6e62a1b77')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery', 'Is your labor scheduling inefficiency at target (Early AM labor optimized to production)?', 4, 'd008b41d-edf4-5415-aabb-0e00e1dc895a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery', 'Does your production yield meet the target of Yield >95%?', 5, '863f3cce-cd1e-59db-8605-e65ad0279652')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BAR-NIGHTCLUB (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('33131bb1-9bc2-56ce-9fb0-ec936c80b30b', 'bar-nightclub', 'Cost Leak', 'bar-nightclub.leak_01',
   'Pour cost above 22%', 'Compare ounces poured to ounces sold by product',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Pour cost <22% (spirits), <25% (beer). Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare ounces poured to ounces sold by product', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6ab024d5-9111-50e9-bf53-cd86821ff849', 'bar-nightclub', 'Revenue Leak', 'bar-nightclub.leak_02',
   'Inventory shrinkage above 3%', 'Compare inventory counts to POS sales weekly',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Shrinkage <3%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare inventory counts to POS sales weekly', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('21d98f41-825f-50f3-b4bf-84ab2f0ad80b', 'bar-nightclub', 'Cost Leak', 'bar-nightclub.leak_03',
   'Entertainment cost above 10% of revenue', 'Track DJ/band/entertainment cost vs event night revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Entertainment <10% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track DJ/band/entertainment cost vs event night revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2be81e9a-e498-593d-accd-f1a43ef86a1a', 'bar-nightclub', 'Cost Leak', 'bar-nightclub.leak_04',
   'Liability insurance above 3% of revenue', 'Benchmark liquor liability premium to peers',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Liability insurance <3% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Benchmark liquor liability premium to peers', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('70b31fa1-fd9f-541f-8c66-c54fc279e2fe', 'bar-nightclub', 'Revenue Leak', 'bar-nightclub.leak_05',
   'Staff theft/overpouring', 'Compare theoretical vs actual pour counts by shift',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Camera monitoring + inventory reconciliation. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare theoretical vs actual pour counts by shift', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for bar-nightclub
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bar-nightclub', 'Is your pour cost within target (Pour cost <22% (spirits), <25% (beer))?', 1, '33131bb1-9bc2-56ce-9fb0-ec936c80b30b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bar-nightclub', 'Is your inventory shrinkage within target (Shrinkage <3%)?', 2, '6ab024d5-9111-50e9-bf53-cd86821ff849')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bar-nightclub', 'Do you regularly compare theoretical vs actual pour counts by shift?', 3, '70b31fa1-fd9f-541f-8c66-c54fc279e2fe')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bar-nightclub', 'Is your entertainment cost within target (Entertainment <10% revenue)?', 4, '21d98f41-825f-50f3-b4bf-84ab2f0ad80b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bar-nightclub', 'Is your liability insurance within target (Liability insurance <3% revenue)?', 5, '2be81e9a-e498-593d-accd-f1a43ef86a1a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BARBER-SHOP (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6be50c19-06ab-53b9-9748-89f384df2b52', 'barber-shop', 'Revenue Leak', 'barber-shop.leak_01',
   'Revenue per chair below $400/day', 'Track daily revenue per active chair',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Revenue >$400/chair/day. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track daily revenue per active chair', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cb20dabc-16cf-59b0-90a2-90140b077d7f', 'barber-shop', 'Revenue Leak', 'barber-shop.leak_02',
   'Product/retail revenue below 5%', 'Track retail product sales as % of total',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Product sales >5% of revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track retail product sales as % of total', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a522b5fe-40a5-54db-86ac-b917f264c3f9', 'barber-shop', 'Revenue Leak', 'barber-shop.leak_03',
   'Walk-in wait time causing walk-aways', 'Track customers who leave without service due to wait',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Track walk-away rate. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track customers who leave without service due to wait', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1233d2a9-6652-5821-874e-e243f5aa7665', 'barber-shop', 'Revenue Leak', 'barber-shop.leak_04',
   'Chair rental income below market', 'Compare chair rent to local barber shop market',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Chair rent at or above local market rate. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare chair rent to local barber shop market', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for barber-shop
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('barber-shop', 'Does your revenue per chair meet the target of Revenue >$400/chair/day?', 1, '6be50c19-06ab-53b9-9748-89f384df2b52')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('barber-shop', 'Do you regularly track customers who leave without service due to wait?', 2, 'a522b5fe-40a5-54db-86ac-b917f264c3f9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('barber-shop', 'Does your chair rental income meet the target of Chair rent at or above local market rate?', 3, '1233d2a9-6652-5821-874e-e243f5aa7665')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('barber-shop', 'Does your product/retail revenue meet the target of Product sales >5% of revenue?', 4, 'cb20dabc-16cf-59b0-90a2-90140b077d7f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BEAUTY-SALON (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c89512a5-357a-58cc-b0ac-ee6588a025d8', 'beauty-salon', 'Cost Leak', 'beauty-salon.leak_01',
   'Product cost above 10% of service revenue', 'Track product usage cost per service performed',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Product cost <10% service revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track product usage cost per service performed', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ca684075-defa-576f-9a9d-d4d9645d8978', 'beauty-salon', 'Revenue Leak', 'beauty-salon.leak_02',
   'Retail revenue below 10% of total', 'Track product sales as % of total revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Retail sales >10% of total. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track product sales as % of total revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e36e91e4-6c47-5516-9256-3f286a61d933', 'beauty-salon', 'Revenue Leak', 'beauty-salon.leak_03',
   'No-show rate above 10%', 'Track no-shows and late cancellations with revenue lost',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: No-show rate <10%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track no-shows and late cancellations with revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('74bc36f2-5b85-59f8-9877-2bdd485e2600', 'beauty-salon', 'Operational Leak', 'beauty-salon.leak_04',
   'Chair/station utilization below 70%', 'Track occupied hours per station per day',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Station utilization >70%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track occupied hours per station per day', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for beauty-salon
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beauty-salon', 'Is your product cost within target (Product cost <10% service revenue)?', 1, 'c89512a5-357a-58cc-b0ac-ee6588a025d8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beauty-salon', 'Does your chair/station utilization meet the target of Station utilization >70%?', 2, '74bc36f2-5b85-59f8-9877-2bdd485e2600')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beauty-salon', 'Does your retail revenue meet the target of Retail sales >10% of total?', 3, 'ca684075-defa-576f-9a9d-d4d9645d8978')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beauty-salon', 'Is your no-show rate within target (No-show rate <10%)?', 4, 'e36e91e4-6c47-5516-9256-3f286a61d933')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BED-BREAKFAST (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d25376ed-57b9-5ffa-8148-adfbe3796504', 'bed-breakfast', 'Revenue Leak', 'bed-breakfast.leak_01',
   'Occupancy below 55%', 'Track occupied room-nights vs total available',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Occupancy >55% annual avg. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track occupied room-nights vs total available', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('92d4e375-c9e6-5131-a8bc-1c44bae28987', 'bed-breakfast', 'Revenue Leak', 'bed-breakfast.leak_02',
   'ADR below market', 'Compare ADR to competing B&Bs and nearby hotels',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: ADR at or above local B&B average. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare ADR to competing B&Bs and nearby hotels', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('07e9fb3e-bbf0-53bb-87fe-7e4097daa8dd', 'bed-breakfast', 'Cost Leak', 'bed-breakfast.leak_03',
   'Food cost per guest above $12', 'Track breakfast cost per guest',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Food cost <$12/guest/night. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track breakfast cost per guest', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('24fd3b83-178c-5c62-8dc4-0b2ae5dcbb16', 'bed-breakfast', 'Cost Leak', 'bed-breakfast.leak_04',
   'Direct booking rate below 50%', 'Track booking source and OTA commission avoidance',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Direct bookings >50%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track booking source and OTA commission avoidance', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for bed-breakfast
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bed-breakfast', 'Does your occupancy meet the target of Occupancy >55% annual avg?', 1, 'd25376ed-57b9-5ffa-8148-adfbe3796504')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bed-breakfast', 'Does your adr meet the target of ADR at or above local B&B average?', 2, '92d4e375-c9e6-5131-a8bc-1c44bae28987')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bed-breakfast', 'Is your food cost per guest within target (Food cost <$12/guest/night)?', 3, '07e9fb3e-bbf0-53bb-87fe-7e4097daa8dd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bed-breakfast', 'Does your direct booking rate meet the target of Direct bookings >50%?', 4, '24fd3b83-178c-5c62-8dc4-0b2ae5dcbb16')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BEVERAGE-MANUFACTURING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ccf76759-a194-54de-bd6d-a988773053e8', 'beverage-manufacturing', 'Cost Leak', 'beverage-manufacturing.leak_01',
   'Ingredient yield below spec', 'Compare actual ingredient usage to recipe spec',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Extraction yield >95% of spec. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare actual ingredient usage to recipe spec', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c532d53-c576-5ebc-bbee-fff78fbf7d96', 'beverage-manufacturing', 'Cost Leak', 'beverage-manufacturing.leak_02',
   'Packaging cost above industry', 'Benchmark bottle/can/label cost per unit',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Packaging <10% of COGS. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Benchmark bottle/can/label cost per unit', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4b4f3d09-5693-5e08-9ba7-da2d3bb10708', 'beverage-manufacturing', 'Compliance Leak', 'beverage-manufacturing.leak_03',
   'Excise tax compliance errors', 'Reconcile excise tax paid vs production volumes',
   75.00, 'critical', 'fixed_range', 2000.00, 50000.00,
   'Benchmark: Zero excise tax miscalculations. Impact: $2,000–$50,000/year.',
   'Industry benchmark data', 'Reconcile excise tax paid vs production volumes', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7cfac5f4-4e77-51e1-bdde-0172d98d44ac', 'beverage-manufacturing', 'Cost Leak', 'beverage-manufacturing.leak_04',
   'Distribution cost per unit too high', 'Compare shipping cost per case to distance benchmarks',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Distribution <12% of revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare shipping cost per case to distance benchmarks', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0e53cea5-50e5-5395-ae0e-543d36dba616', 'beverage-manufacturing', 'Operational Leak', 'beverage-manufacturing.leak_05',
   'Production line downtime', 'Track changeover time and unplanned stops',
   75.00, 'high', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Line efficiency >90%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track changeover time and unplanned stops', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for beverage-manufacturing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beverage-manufacturing', 'Have you reviewed and optimized your excise tax compliance errors with a tax professional?', 1, '4b4f3d09-5693-5e08-9ba7-da2d3bb10708')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beverage-manufacturing', 'Does your ingredient yield meet the target of Extraction yield >95% of spec?', 2, 'ccf76759-a194-54de-bd6d-a988773053e8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beverage-manufacturing', 'Is your production line downtime at target (Line efficiency >90%)?', 3, '0e53cea5-50e5-5395-ae0e-543d36dba616')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beverage-manufacturing', 'Do you regularly compare shipping cost per case to distance benchmarks?', 4, '7cfac5f4-4e77-51e1-bdde-0172d98d44ac')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('beverage-manufacturing', 'Is your packaging cost within target (Packaging <10% of COGS)?', 5, '6c532d53-c576-5ebc-bbee-fff78fbf7d96')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BOOKKEEPING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('607a50c8-7072-5f4c-b3c8-4a43470ab8ab', 'bookkeeping', 'Revenue Leak', 'bookkeeping.leak_01',
   'Revenue per client below $400/mo', 'Compare average monthly fee per client to market',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Revenue/client >$400/mo. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare average monthly fee per client to market', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f0f91a85-b388-52aa-b20a-2b9ed063c233', 'bookkeeping', 'Revenue Leak', 'bookkeeping.leak_02',
   'Client capacity underutilized', 'Track active clients per bookkeeper',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Clients per bookkeeper: 15-25. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track active clients per bookkeeper', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('077e1e82-aeb1-5726-9a2c-a08f35cb69bc', 'bookkeeping', 'Cost Leak', 'bookkeeping.leak_03',
   'Software cost above 8% of revenue', 'Audit QBO/Xero/receipt tool subscriptions per client',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Software cost <8% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Audit QBO/Xero/receipt tool subscriptions per client', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fd4f7f22-dcd8-53bc-b617-6bbea878f067', 'bookkeeping', 'Revenue Leak', 'bookkeeping.leak_04',
   'Client churn above 15%/yr', 'Track client departures and reasons',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client churn <15%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and reasons', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8c1a83d9-de3a-5a79-aed0-f9eb5423c2c4', 'bookkeeping', 'Operational Leak', 'bookkeeping.leak_05',
   'Error/correction rate above 2%', 'Track journal entry corrections and amendments',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Error rate <2% of entries. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track journal entry corrections and amendments', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for bookkeeping
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookkeeping', 'Does your revenue per client meet the target of Revenue/client >$400/mo?', 1, '607a50c8-7072-5f4c-b3c8-4a43470ab8ab')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookkeeping', 'Is your client churn within target (Client churn <15%/yr)?', 2, 'fd4f7f22-dcd8-53bc-b617-6bbea878f067')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookkeeping', 'Is your client capacity underutilized at target (Clients per bookkeeper: 15-25)?', 3, 'f0f91a85-b388-52aa-b20a-2b9ed063c233')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookkeeping', 'Is your software cost within target (Software cost <8% revenue)?', 4, '077e1e82-aeb1-5726-9a2c-a08f35cb69bc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookkeeping', 'Is your error/correction rate within target (Error rate <2% of entries)?', 5, '8c1a83d9-de3a-5a79-aed0-f9eb5423c2c4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BOOKSTORE (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7426d235-176b-5d95-b497-deac650fe649', 'bookstore', 'Cost Leak', 'bookstore.leak_01',
   'Return rate above 20%', 'Track unsold returns to publisher vs purchases',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Return rate <20%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track unsold returns to publisher vs purchases', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('301262f4-3906-58eb-814e-40bc06f371a0', 'bookstore', 'Cost Leak', 'bookstore.leak_02',
   'Inventory turns below 3x', 'Calculate annual COGS / average inventory',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Turns >3x/yr. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Calculate annual COGS / average inventory', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1c6c7c71-4a4c-55bf-94f2-ace24a63fbac', 'bookstore', 'Revenue Leak', 'bookstore.leak_03',
   'Event/community revenue untapped', 'Track revenue from events, author signings, memberships',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Event revenue >5% of total. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track revenue from events, author signings, memberships', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for bookstore
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookstore', 'Is your return rate within target (Return rate <20%)?', 1, '7426d235-176b-5d95-b497-deac650fe649')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookstore', 'Does your inventory turns meet the target of Turns >3x/yr?', 2, '301262f4-3906-58eb-814e-40bc06f371a0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bookstore', 'Do you regularly track revenue from events, author signings, memberships?', 3, '1c6c7c71-4a4c-55bf-94f2-ace24a63fbac')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== BOWLING-ALLEY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0d95b3a1-0482-5b82-a3f9-f1141c3dd834', 'bowling-alley', 'Revenue Leak', 'bowling-alley.leak_01',
   'Revenue per visit below benchmark', 'Compare avg ticket to market benchmark',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Track and improve revenue/visit. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare avg ticket to market benchmark', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bd6827e4-81c5-5bbd-86cb-2ede846ed7a9', 'bowling-alley', 'Revenue Leak', 'bowling-alley.leak_02',
   'F&B margin below 60%', 'Track food/beverage cost as % of F&B sales',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: F&B margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track food/beverage cost as % of F&B sales', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ca8eee49-8fe5-591e-a0d0-da3a0f3515da', 'bowling-alley', 'Cost Leak', 'bowling-alley.leak_03',
   'Staffing cost above 35% of revenue', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Staffing <35% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dcd5095f-d63e-59dc-8264-2fa3182ac1cc', 'bowling-alley', 'Operational Leak', 'bowling-alley.leak_04',
   'Lane utilization below 60%', 'Track lane-hours booked vs available',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Lane utilization >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track lane-hours booked vs available', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for bowling-alley
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bowling-alley', 'Does your revenue per visit meet the target of Track and improve revenue/visit?', 1, '0d95b3a1-0482-5b82-a3f9-f1141c3dd834')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bowling-alley', 'Does your lane utilization meet the target of Lane utilization >60%?', 2, 'dcd5095f-d63e-59dc-8264-2fa3182ac1cc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bowling-alley', 'Does your f&b margin meet the target of F&B margin >60%?', 3, 'bd6827e4-81c5-5bbd-86cb-2ede846ed7a9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bowling-alley', 'Is your staffing cost within target (Staffing <35% revenue)?', 4, 'ca8eee49-8fe5-591e-a0d0-da3a0f3515da')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CAFE-COFFEE-SHOP (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e2efe198-5c18-54c0-8584-09b8b064cbae', 'cafe-coffee-shop', 'Cost Leak', 'cafe-coffee-shop.leak_01',
   'COGS above 30%', 'Track coffee/food cost vs sales',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: COGS <30%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track coffee/food cost vs sales', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4d288335-8b8b-54dc-bcff-73053724f70f', 'cafe-coffee-shop', 'Cost Leak', 'cafe-coffee-shop.leak_02',
   'Labor cost above 35%', 'Compare staffing hours to transaction volume by hour',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Labor <35% revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare staffing hours to transaction volume by hour', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c7520f7-1bc0-52b2-97f7-8a4b88422aca', 'cafe-coffee-shop', 'Revenue Leak', 'cafe-coffee-shop.leak_03',
   'Revenue per sqft below $300/yr', 'Compare annual revenue to occupied square footage',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue >$300/sqft/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare annual revenue to occupied square footage', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3f9b11df-a624-5f06-bfda-7a607eb269d2', 'cafe-coffee-shop', 'Cost Leak', 'cafe-coffee-shop.leak_04',
   'Waste rate above 5%', 'Track expired food/coffee discarded daily',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Waste <5% of product purchased. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track expired food/coffee discarded daily', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c7884096-126d-5b81-86fb-1ce522f1a197', 'cafe-coffee-shop', 'Revenue Leak', 'cafe-coffee-shop.leak_05',
   'Loyalty program conversion below 20%', 'Track loyalty enrollment vs total unique customers',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Loyalty conversion >20% of customers. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track loyalty enrollment vs total unique customers', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for cafe-coffee-shop
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cafe-coffee-shop', 'Is your cogs within target (COGS <30%)?', 1, 'e2efe198-5c18-54c0-8584-09b8b064cbae')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cafe-coffee-shop', 'Is your labor cost within target (Labor <35% revenue)?', 2, '4d288335-8b8b-54dc-bcff-73053724f70f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cafe-coffee-shop', 'Does your revenue per sqft meet the target of Revenue >$300/sqft/yr?', 3, '6c7520f7-1bc0-52b2-97f7-8a4b88422aca')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cafe-coffee-shop', 'Is your waste rate within target (Waste <5% of product purchased)?', 4, '3f9b11df-a624-5f06-bfda-7a607eb269d2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cafe-coffee-shop', 'Does your loyalty program conversion meet the target of Loyalty conversion >20% of customers?', 5, 'c7884096-126d-5b81-86fb-1ce522f1a197')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CANNABIS (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a6f91324-d23a-582c-bce3-f7b088302bc6', 'cannabis', 'Revenue Leak', 'cannabis.leak_01',
   'Yield per sqft below benchmark', 'Compare harvest weight per sqft to strain potential',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Yield >50g/sqft per cycle. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare harvest weight per sqft to strain potential', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8d7f1834-e463-5038-b96c-ea893f984840', 'cannabis', 'Cost Leak', 'cannabis.leak_02',
   'Energy cost per gram excessive', 'Track kWh per gram of dried flower produced',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Energy cost <$0.50/gram. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track kWh per gram of dried flower produced', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1da77890-4f42-5f47-9b29-f19571a52b63', 'cannabis', 'Compliance Leak', 'cannabis.leak_03',
   'Compliance cost bloat', 'Audit regulatory costs vs minimum compliance requirements',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Compliance <8% revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Audit regulatory costs vs minimum compliance requirements', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7bc6f443-99da-57d7-ad1f-eddf023ed37c', 'cannabis', 'Tax Leak', 'cannabis.leak_04',
   'Excise tax optimization missed', 'Compare excise tax paid to lowest legally permissible amount',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Review stamping/pricing for lowest tax basis. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare excise tax paid to lowest legally permissible amount', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('24d485a7-6c0b-5e84-be4d-47495944eb71', 'cannabis', 'Revenue Leak', 'cannabis.leak_05',
   'Trim/waste not monetized', 'Track trim weight vs extract/edible output value',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Monetize >80% of trim for extracts. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track trim weight vs extract/edible output value', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a2af5919-d6cc-558b-9dbb-d6be8e8b4962', 'cannabis', 'Compliance Leak', 'cannabis.leak_06',
   'Inventory tracking gap (seed-to-sale)', 'Audit seed-to-sale platform vs physical inventory count',
   75.00, 'critical', 'fixed_range', 5000.00, 75000.00,
   'Benchmark: 100% seed-to-sale tracked. Impact: $5,000–$75,000/year.',
   'Industry benchmark data', 'Audit seed-to-sale platform vs physical inventory count', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for cannabis
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis', 'Do you regularly audit seed-to-sale platform vs physical inventory count?', 1, 'a2af5919-d6cc-558b-9dbb-d6be8e8b4962')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis', 'Does your yield per sqft meet the target of Yield >50g/sqft per cycle?', 2, 'a6f91324-d23a-582c-bce3-f7b088302bc6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis', 'Do you regularly track kwh per gram of dried flower produced?', 3, '8d7f1834-e463-5038-b96c-ea893f984840')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis', 'Have you reviewed and optimized your excise tax optimization with a tax professional?', 4, '7bc6f443-99da-57d7-ad1f-eddf023ed37c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis', 'Are you fully up to date on all compliance requirements?', 5, '1da77890-4f42-5f47-9b29-f19571a52b63')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis', 'Is your trim/waste being monetized?', 6, '24d485a7-6c0b-5e84-be4d-47495944eb71')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CANNABIS-RETAIL (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('047cc534-c4f6-5e02-8d3e-5df2f4b0b2dc', 'cannabis-retail', 'Revenue Leak', 'cannabis-retail.leak_01',
   'Gross margin below 35%', 'Compare purchase cost to selling price by category',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Gross margin >35%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare purchase cost to selling price by category', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('90bb4766-11bf-54e5-9c66-d00283b10c60', 'cannabis-retail', 'Compliance Leak', 'cannabis-retail.leak_02',
   'Compliance cost above 8% of revenue', 'Audit regulatory, security, and tracking costs',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Compliance <8% revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Audit regulatory, security, and tracking costs', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('afd1e800-b1aa-555e-ae28-7a61cb029440', 'cannabis-retail', 'Tax Leak', 'cannabis-retail.leak_03',
   'Excise tax overpayment', 'Reconcile excise tax paid to applicable rates',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Verify excise calculations monthly. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Reconcile excise tax paid to applicable rates', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7297fe08-18fe-5acf-add6-abd8adc4bbfb', 'cannabis-retail', 'Revenue Leak', 'cannabis-retail.leak_04',
   'Shrinkage above 1%', 'Compare physical inventory to seed-to-sale system',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Shrinkage <1%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare physical inventory to seed-to-sale system', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('28b9cc3c-670d-5f8b-897d-a0b0438752d0', 'cannabis-retail', 'Cost Leak', 'cannabis-retail.leak_05',
   'Inventory turns below 12x/yr', 'Track inventory age and turnover by category',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Turns >12x/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track inventory age and turnover by category', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for cannabis-retail
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis-retail', 'Does your gross margin meet the target of Gross margin >35%?', 1, '047cc534-c4f6-5e02-8d3e-5df2f4b0b2dc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis-retail', 'Is your shrinkage within target (Shrinkage <1%)?', 2, '7297fe08-18fe-5acf-add6-abd8adc4bbfb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis-retail', 'Have you reviewed and optimized your excise tax overpayment with a tax professional?', 3, 'afd1e800-b1aa-555e-ae28-7a61cb029440')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis-retail', 'Is your compliance cost within target (Compliance <8% revenue)?', 4, '90bb4766-11bf-54e5-9c66-d00283b10c60')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cannabis-retail', 'Does your inventory turns meet the target of Turns >12x/yr?', 5, '28b9cc3c-670d-5f8b-897d-a0b0438752d0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CAR-DEALERSHIP (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6f7e1307-8f15-5fb5-b44b-a8a6b46a52c1', 'car-dealership', 'Revenue Leak', 'car-dealership.leak_01',
   'F&I revenue per deal below $1500', 'Track finance and insurance products per vehicle sold',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: F&I >$1500/deal. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track finance and insurance products per vehicle sold', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('777907ac-89cc-5b70-a936-c154b779805e', 'car-dealership', 'Revenue Leak', 'car-dealership.leak_02',
   'Service absorption below 80%', 'Calculate service dept gross profit / total dealership overhead',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Service absorption >80%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Calculate service dept gross profit / total dealership overhead', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('63c3aaa5-4e10-558a-9784-884d446af3ba', 'car-dealership', 'Cost Leak', 'car-dealership.leak_03',
   'Floor plan cost above 1% of inventory/mo', 'Track floor plan interest cost vs inventory value',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Floor plan <1% inventory/mo. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track floor plan interest cost vs inventory value', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('acb4ce4f-1ce3-5b8c-a677-6633535d0910', 'car-dealership', 'Cost Leak', 'car-dealership.leak_04',
   'Inventory age above 60 days', 'Track days-to-turn per vehicle',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Avg vehicle age <60 days. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track days-to-turn per vehicle', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for car-dealership
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-dealership', 'Does your f&i revenue per deal meet the target of F&I >$1500/deal?', 1, '6f7e1307-8f15-5fb5-b44b-a8a6b46a52c1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-dealership', 'Does your service absorption meet the target of Service absorption >80%?', 2, '777907ac-89cc-5b70-a936-c154b779805e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-dealership', 'Is your floor plan cost within target (Floor plan <1% inventory/mo)?', 3, '63c3aaa5-4e10-558a-9784-884d446af3ba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-dealership', 'Is your inventory age within target (Avg vehicle age <60 days)?', 4, 'acb4ce4f-1ce3-5b8c-a677-6633535d0910')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CAR-WASH (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0bb3d992-4e4c-522f-a31b-51783fe31aec', 'car-wash', 'Revenue Leak', 'car-wash.leak_01',
   'Revenue per wash below $12', 'Track average revenue per vehicle washed',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue/wash >$12 avg. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track average revenue per vehicle washed', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('36103e9f-d4a8-5805-8535-22af26e3d01f', 'car-wash', 'Revenue Leak', 'car-wash.leak_02',
   'Membership conversion below 15%', 'Track single-wash to membership conversion rate',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Membership conversion >15%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track single-wash to membership conversion rate', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('45b5a41d-079d-52ac-8546-e4fc12b7b688', 'car-wash', 'Cost Leak', 'car-wash.leak_03',
   'Water cost above $0.50/wash', 'Track water usage per wash vs reclaim rate',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Water cost <$0.50/wash. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track water usage per wash vs reclaim rate', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2ecf5846-decb-5388-b16d-18c9303474d7', 'car-wash', 'Operational Leak', 'car-wash.leak_04',
   'Equipment downtime above 5%', 'Track equipment downtime hours vs operating hours',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Equipment uptime >95%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track equipment downtime hours vs operating hours', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for car-wash
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-wash', 'Does your revenue per wash meet the target of Revenue/wash >$12 avg?', 1, '0bb3d992-4e4c-522f-a31b-51783fe31aec')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-wash', 'Does your membership conversion meet the target of Membership conversion >15%?', 2, '36103e9f-d4a8-5805-8535-22af26e3d01f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-wash', 'Is your equipment downtime within target (Equipment uptime >95%)?', 3, '2ecf5846-decb-5388-b16d-18c9303474d7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car-wash', 'Is your water cost within target (Water cost <$0.50/wash)?', 4, '45b5a41d-079d-52ac-8546-e4fc12b7b688')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CATERING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cf98f71f-fc65-52ff-babf-579399706d22', 'catering', 'Cost Leak', 'catering.leak_01',
   'Food cost per event above 30%', 'Track ingredient cost vs event revenue',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Food cost <30% per event. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track ingredient cost vs event revenue', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('45dd35c0-5bfd-53e8-840f-5645515568f9', 'catering', 'Revenue Leak', 'catering.leak_02',
   'Quote accuracy below 85%', 'Compare quoted price to actual event cost',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Quote accuracy >85%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare quoted price to actual event cost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8094e5cd-93ba-5269-82d3-e6bed4aaa529', 'catering', 'Cost Leak', 'catering.leak_03',
   'Waste above 10% per event', 'Track food prepared vs food consumed per event',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Event waste <10% of food prepared. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track food prepared vs food consumed per event', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e596a5b3-4e54-5831-8efd-46fcbf39a22a', 'catering', 'Cash Flow Leak', 'catering.leak_04',
   'Seasonal demand gap not bridged', 'Compare monthly revenue distribution',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Off-season revenue >40% of peak. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare monthly revenue distribution', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5b4514f5-bc31-5deb-bb52-efe1fe36c391', 'catering', 'Cost Leak', 'catering.leak_05',
   'Transportation cost above 5% of revenue', 'Track per-event delivery and pickup costs',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Transport <5% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track per-event delivery and pickup costs', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for catering
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('catering', 'Is your food cost per event within target (Food cost <30% per event)?', 1, 'cf98f71f-fc65-52ff-babf-579399706d22')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('catering', 'Does your quote accuracy meet the target of Quote accuracy >85%?', 2, '45dd35c0-5bfd-53e8-840f-5645515568f9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('catering', 'Is your waste within target (Event waste <10% of food prepared)?', 3, '8094e5cd-93ba-5269-82d3-e6bed4aaa529')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('catering', 'Is your seasonal demand gap being bridged?', 4, 'e596a5b3-4e54-5831-8efd-46fcbf39a22a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('catering', 'Is your transportation cost within target (Transport <5% revenue)?', 5, '5b4514f5-bc31-5deb-bb52-efe1fe36c391')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CHILDCARE-HOME (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('98d0bb5e-1ca9-59fb-b070-8e76958327bc', 'childcare-home', 'Revenue Leak', 'childcare-home.leak_01',
   'Revenue per child below $1000/mo', 'Compare rates to local market',
   75.00, 'critical', 'fixed_range', 3000.00, 15000.00,
   'Benchmark: Revenue/child >$1000/mo. Impact: $3,000–$15,000/year.',
   'Industry benchmark data', 'Compare rates to local market', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('778c676f-b62b-50e6-ad37-dbc80a638988', 'childcare-home', 'Cost Leak', 'childcare-home.leak_02',
   'Food cost per child above $6/day', 'Track per-child daily food cost',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Food <$6/child/day. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track per-child daily food cost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('425b2980-dfaf-5330-9cdf-a799216ae8d4', 'childcare-home', 'Cost Leak', 'childcare-home.leak_03',
   'Insurance above 5% of revenue', 'Benchmark home daycare insurance costs',
   75.00, 'high', 'fixed_range', 500.00, 3000.00,
   'Benchmark: Insurance <5% revenue. Impact: $500–$3,000/year.',
   'Industry benchmark data', 'Benchmark home daycare insurance costs', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('78604860-5ea2-5287-bcbc-50c7c94be4bb', 'childcare-home', 'Tax Leak', 'childcare-home.leak_04',
   'Home office/space deduction missed', 'Calculate eligible space deduction for CRA',
   75.00, 'critical', 'fixed_range', 500.00, 3000.00,
   'Benchmark: Claim T2125 home use deduction. Impact: $500–$3,000/year.',
   'Industry benchmark data', 'Calculate eligible space deduction for CRA', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for childcare-home
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('childcare-home', 'Does your revenue per child meet the target of Revenue/child >$1000/mo?', 1, '98d0bb5e-1ca9-59fb-b070-8e76958327bc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('childcare-home', 'Have you reviewed and optimized your home office/space deduction with a tax professional?', 2, '78604860-5ea2-5287-bcbc-50c7c94be4bb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('childcare-home', 'Is your food cost per child within target (Food <$6/child/day)?', 3, '778c676f-b62b-50e6-ad37-dbc80a638988')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('childcare-home', 'Is your insurance within target (Insurance <5% revenue)?', 4, '425b2980-dfaf-5330-9cdf-a799216ae8d4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CHIROPRACTIC (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2eebb3b3-06ee-5090-8abd-75a966e5f505', 'chiropractic', 'Revenue Leak', 'chiropractic.leak_01',
   'Visit volume below 120/wk', 'Track weekly patient visit volume',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Visits >120/wk per chiropractor. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track weekly patient visit volume', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5f8ac785-a8d8-5e6d-95a3-94287075752b', 'chiropractic', 'Revenue Leak', 'chiropractic.leak_02',
   'Collection rate below 95%', 'Compare collected to allowed amounts',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Collection rate >95%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare collected to allowed amounts', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('118f0fac-2114-52f3-a8f7-7876b720d37c', 'chiropractic', 'Revenue Leak', 'chiropractic.leak_03',
   'Patient retention below 60% to care plan', 'Track patients completing recommended care plans',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Care plan completion >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track patients completing recommended care plans', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4ccbea68-6864-5b6e-b8bb-2e396515a814', 'chiropractic', 'Cost Leak', 'chiropractic.leak_04',
   'Overhead above 55%', 'Track all costs except doctor compensation as % of collections',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Overhead <55%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track all costs except doctor compensation as % of collections', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('42002ce5-c4aa-5345-a998-1ff4257e20f5', 'chiropractic', 'Revenue Leak', 'chiropractic.leak_05',
   'Insurance reimbursement below allowed', 'Compare paid vs allowed amounts by CPT code and payer',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Audit underpayments quarterly. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare paid vs allowed amounts by CPT code and payer', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for chiropractic
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Does your visit volume meet the target of Visits >120/wk per chiropractor?', 1, '2eebb3b3-06ee-5090-8abd-75a966e5f505')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Does your collection rate meet the target of Collection rate >95%?', 2, '5f8ac785-a8d8-5e6d-95a3-94287075752b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Does your patient retention meet the target of Care plan completion >60%?', 3, '118f0fac-2114-52f3-a8f7-7876b720d37c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Is your overhead within target (Overhead <55%)?', 4, '4ccbea68-6864-5b6e-b8bb-2e396515a814')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Does your insurance reimbursement meet the target of Audit underpayments quarterly?', 5, '42002ce5-c4aa-5345-a998-1ff4257e20f5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CHURCH-RELIGIOUS (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('57b7eb9c-131e-581b-a4c3-243dfae311db', 'church-religious', 'Cost Leak', 'church-religious.leak_01',
   'Admin cost above 20% of donations', 'Track admin costs as % of total donations received',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Admin <20% donations. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track admin costs as % of total donations received', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5adfb832-2ba6-5019-9cb7-79d9557814f5', 'church-religious', 'Cost Leak', 'church-religious.leak_02',
   'Facility cost above 30% of budget', 'Track building costs as % of total budget',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Facility <30% budget. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track building costs as % of total budget', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('71f4c3c9-ce40-53bc-9f63-7f914c7952bc', 'church-religious', 'Compliance Leak', 'church-religious.leak_03',
   'Donation receipting non-compliant', 'Audit charitable receipt compliance with CRA rules',
   75.00, 'critical', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: 100% CRA-compliant receipts issued. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Audit charitable receipt compliance with CRA rules', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for church-religious
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('church-religious', 'Do you regularly audit charitable receipt compliance with cra rules?', 1, '71f4c3c9-ce40-53bc-9f63-7f914c7952bc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('church-religious', 'Is your admin cost within target (Admin <20% donations)?', 2, '57b7eb9c-131e-581b-a4c3-243dfae311db')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('church-religious', 'Is your facility cost within target (Facility <30% budget)?', 3, '5adfb832-2ba6-5019-9cb7-79d9557814f5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CLEANING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d46c02d1-fc6d-5284-be1a-18041d4a80a3', 'cleaning', 'Cost Leak', 'cleaning.leak_01',
   'Labor cost above 50% of revenue', 'Track labor cost / revenue per contract',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Labor <50% revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track labor cost / revenue per contract', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cc342841-d260-5040-9732-1b6468f47c52', 'cleaning', 'Cost Leak', 'cleaning.leak_02',
   'Supply cost above 5% of revenue', 'Track supply spend per job/sqft',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies <5% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track supply spend per job/sqft', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d552fa9d-0d63-5533-99c7-5bcb7d8721c3', 'cleaning', 'Revenue Leak', 'cleaning.leak_03',
   'Client churn above 20%', 'Track client departures and replacement cost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >80%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and replacement cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4327abeb-8871-5329-8841-a14e507207d5', 'cleaning', 'Cost Leak', 'cleaning.leak_04',
   'Vehicle cost per job too high', 'Track fuel+maintenance per vehicle per month',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Vehicle cost tracked per job. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track fuel+maintenance per vehicle per month', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for cleaning
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning', 'Is your labor cost within target (Labor <50% revenue)?', 1, 'd46c02d1-fc6d-5284-be1a-18041d4a80a3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning', 'Is your client churn within target (Client retention >80%/yr)?', 2, 'd552fa9d-0d63-5533-99c7-5bcb7d8721c3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning', 'Is your supply cost within target (Supplies <5% revenue)?', 3, 'cc342841-d260-5040-9732-1b6468f47c52')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning', 'Do you regularly track fuel+maintenance per vehicle per month?', 4, '4327abeb-8871-5329-8841-a14e507207d5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CLOTHING-BOUTIQUE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('785315b6-efac-5165-b19f-fd5f47d83476', 'clothing-boutique', 'Revenue Leak', 'clothing-boutique.leak_01',
   'Sell-through rate below 65%', 'Track % of inventory sold at full price vs markdown',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Sell-through >65% at full price. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track % of inventory sold at full price vs markdown', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5c5b92a1-22c8-5a74-ac35-dff9c6347512', 'clothing-boutique', 'Revenue Leak', 'clothing-boutique.leak_02',
   'Markdown rate too high', 'Track markdown dollars as % of total revenue',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Markdowns <20% of revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track markdown dollars as % of total revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a9f048c3-f646-5331-8a3e-c7f194c926e9', 'clothing-boutique', 'Cost Leak', 'clothing-boutique.leak_03',
   'Inventory age above 90 days', 'Track age distribution of current inventory',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Avg inventory age <90 days. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track age distribution of current inventory', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c02b330-9394-5f67-8c00-fc6177df134d', 'clothing-boutique', 'Revenue Leak', 'clothing-boutique.leak_04',
   'Return rate above 10%', 'Track return rate by category and reason code',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Return rate <10%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track return rate by category and reason code', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('42c1852a-012a-5ed6-8063-b64fc18e24cd', 'clothing-boutique', 'Cost Leak', 'clothing-boutique.leak_05',
   'Rent per sqft above sales per sqft ratio', 'Compare rent/sqft to sales/sqft',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Rent <10% of revenue. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare rent/sqft to sales/sqft', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for clothing-boutique
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('clothing-boutique', 'Does your sell-through rate meet the target of Sell-through >65% at full price?', 1, '785315b6-efac-5165-b19f-fd5f47d83476')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('clothing-boutique', 'Do you regularly track markdown dollars as % of total revenue?', 2, '5c5b92a1-22c8-5a74-ac35-dff9c6347512')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('clothing-boutique', 'Is your rent per sqft within target (Rent <10% of revenue)?', 3, '42c1852a-012a-5ed6-8063-b64fc18e24cd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('clothing-boutique', 'Is your inventory age within target (Avg inventory age <90 days)?', 4, 'a9f048c3-f646-5331-8a3e-c7f194c926e9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('clothing-boutique', 'Is your return rate within target (Return rate <10%)?', 5, '6c02b330-9394-5f67-8c00-fc6177df134d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== COLLECTIONS-AGENCY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4f611983-f216-569f-8f41-bf7bdda782f4', 'collections-agency', 'Revenue Leak', 'collections-agency.leak_01',
   'Recovery rate below 20%', 'Compare dollars collected to total placed amount',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Recovery rate >20% of placed value. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare dollars collected to total placed amount', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1de2bcd0-c711-5e67-92b3-1615283b9331', 'collections-agency', 'Cost Leak', 'collections-agency.leak_02',
   'Cost per dollar collected above $0.15', 'Calculate total operating cost / total collected',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Cost/dollar collected <$0.15. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Calculate total operating cost / total collected', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9ce37cee-9514-57d3-a8b0-741dc355f8a8', 'collections-agency', 'Compliance Leak', 'collections-agency.leak_03',
   'Compliance violation risk', 'Audit call scripts and practices against FDCPA rules',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Zero FDCPA/CFPB violations. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Audit call scripts and practices against FDCPA rules', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6b106626-6a65-574e-bce9-6bbc12067cf5', 'collections-agency', 'Revenue Leak', 'collections-agency.leak_04',
   'Client retention below 80%', 'Track client churn and placed volume trends',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Client retention >80%/yr. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track client churn and placed volume trends', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for collections-agency
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('collections-agency', 'Are you fully up to date on all compliance requirements?', 1, '9ce37cee-9514-57d3-a8b0-741dc355f8a8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('collections-agency', 'Does your recovery rate meet the target of Recovery rate >20% of placed value?', 2, '4f611983-f216-569f-8f41-bf7bdda782f4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('collections-agency', 'Is your cost per dollar collected within target (Cost/dollar collected <$0.15)?', 3, '1de2bcd0-c711-5e67-92b3-1615283b9331')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('collections-agency', 'Does your client retention meet the target of Client retention >80%/yr?', 4, '6b106626-6a65-574e-bce9-6bbc12067cf5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== COMPUTER-REPAIR (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('88c1445b-ceae-598c-a1f3-514246747704', 'computer-repair', 'Revenue Leak', 'computer-repair.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('26597035-0742-5872-864f-9dd11b9cf806', 'computer-repair', 'Cost Leak', 'computer-repair.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ac89f4fe-23b8-5f79-8155-ccbb0500b34d', 'computer-repair', 'Cost Leak', 'computer-repair.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('353c9d6e-e928-5f42-9e6a-e3bf0d906283', 'computer-repair', 'Revenue Leak', 'computer-repair.leak_04',
   'Parts markup below 40%', 'Compare parts cost to billed price',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Parts markup >40%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare parts cost to billed price', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('515a5e55-9ea7-5efc-8710-1a1aeab867da', 'computer-repair', 'Revenue Leak', 'computer-repair.leak_05',
   'Data recovery revenue untapped', 'Track data recovery services as % of total',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Data recovery >10% of revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track data recovery services as % of total', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for computer-repair
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('computer-repair', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, '88c1445b-ceae-598c-a1f3-514246747704')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('computer-repair', 'Is your labor/operator cost within target (Labor <45% revenue)?', 2, '26597035-0742-5872-864f-9dd11b9cf806')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('computer-repair', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 3, 'ac89f4fe-23b8-5f79-8155-ccbb0500b34d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('computer-repair', 'Does your parts markup meet the target of Parts markup >40%?', 4, '353c9d6e-e928-5f42-9e6a-e3bf0d906283')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('computer-repair', 'Do you regularly track data recovery services as % of total?', 5, '515a5e55-9ea7-5efc-8710-1a1aeab867da')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CONSTRUCTION (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('01bdc102-16e9-5f25-9862-2ec8725155fe', 'construction', 'Revenue Leak', 'construction.leak_01',
   'Change order revenue leakage', 'Track approved change orders vs billed amounts',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Change orders captured >95%. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Track approved change orders vs billed amounts', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('641a238d-feed-5922-8455-e45cec4f00a6', 'construction', 'Cost Leak', 'construction.leak_02',
   'Material waste above 5%', 'Compare material ordered vs material installed + returns',
   75.00, 'critical', 'fixed_range', 3000.00, 50000.00,
   'Benchmark: Material waste <5%. Impact: $3,000–$50,000/year.',
   'Industry benchmark data', 'Compare material ordered vs material installed + returns', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4b4ae959-b33b-5f57-8bfe-b3605a864923', 'construction', 'Revenue Leak', 'construction.leak_03',
   'Subcontractor markup too low', 'Compare sub invoices to client billing for same work',
   75.00, 'high', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Sub markup 10-15%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare sub invoices to client billing for same work', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('00671c77-f2b8-5b88-b00e-de8a737d0347', 'construction', 'Cost Leak', 'construction.leak_04',
   'Labour overtime uncontrolled', 'Track OT hours by project vs budgeted',
   75.00, 'critical', 'fixed_range', 5000.00, 60000.00,
   'Benchmark: OT <10% of total labor hours. Impact: $5,000–$60,000/year.',
   'Industry benchmark data', 'Track OT hours by project vs budgeted', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3e0c9b82-3cd7-58b3-ba42-e772024f0043', 'construction', 'Cash Flow Leak', 'construction.leak_05',
   'AR aging beyond 45 days', 'Track AR aging and collection rate by client',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: AR days <45. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track AR aging and collection rate by client', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cedb33f4-0fe9-59c5-8942-de6f5e24070a', 'construction', 'Cost Leak', 'construction.leak_06',
   'Insurance cost above industry', 'Benchmark GL/WC rates against industry averages',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Insurance <3.5% revenue. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Benchmark GL/WC rates against industry averages', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for construction
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you regularly track approved change orders vs billed amounts?', 1, '01bdc102-16e9-5f25-9862-2ec8725155fe')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you regularly track ot hours by project vs budgeted?', 2, '00671c77-f2b8-5b88-b00e-de8a737d0347')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Is your material waste within target (Material waste <5%)?', 3, '641a238d-feed-5922-8455-e45cec4f00a6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you regularly compare sub invoices to client billing for same work?', 4, '4b4ae959-b33b-5f57-8bfe-b3605a864923')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you regularly track ar aging and collection rate by client?', 5, '3e0c9b82-3cd7-58b3-ba42-e772024f0043')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Is your insurance cost within target (Insurance <3.5% revenue)?', 6, 'cedb33f4-0fe9-59c5-8942-de6f5e24070a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CONSULTING (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dd999baf-785d-5677-aa95-afb85fc31294', 'consulting', 'Revenue Leak', 'consulting.leak_01',
   'Utilization below 65%', 'Track billable hours / available hours per consultant',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Utilization >65%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours per consultant', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c6d9a6c5-01b7-578e-a5d5-416b77b99604', 'consulting', 'Cost Leak', 'consulting.leak_02',
   'Project overrun above 15%', 'Compare actual hours to estimated hours per engagement',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Budget overrun <15%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare actual hours to estimated hours per engagement', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c7de28e0-8bcf-50c6-a7c2-a7afc2d044e6', 'consulting', 'Revenue Leak', 'consulting.leak_03',
   'Client concentration risk', 'Track revenue concentration by client',
   75.00, 'high', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: No single client >20% revenue. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track revenue concentration by client', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for consulting
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('consulting', 'Does your utilization meet the target of Utilization >65%?', 1, 'dd999baf-785d-5677-aa95-afb85fc31294')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('consulting', 'Is your project overrun within target (Budget overrun <15%)?', 2, 'c6d9a6c5-01b7-578e-a5d5-416b77b99604')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('consulting', 'Do you regularly track revenue concentration by client?', 3, 'c7de28e0-8bcf-50c6-a7c2-a7afc2d044e6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CONVENIENCE-STORE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d1a16526-590c-525a-987d-cbaf8aef2e9e', 'convenience-store', 'Revenue Leak', 'convenience-store.leak_01',
   'Tobacco/lottery margin below benchmark', 'Track margin by product category vs state/industry norm',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Tobacco >18%, Lottery commission tracked. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track margin by product category vs state/industry norm', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c975ebe8-987a-5ca8-87dc-e219299793fd', 'convenience-store', 'Revenue Leak', 'convenience-store.leak_02',
   'Theft/shrinkage above 2%', 'Compare inventory variance to POS sales monthly',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Shrinkage <2%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare inventory variance to POS sales monthly', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('82315ac2-e717-59a1-91b1-eede8329c0bf', 'convenience-store', 'Revenue Leak', 'convenience-store.leak_03',
   'Fuel margin below market', 'Compare posted price minus delivered cost to market margin',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Fuel margin >$0.10/gallon after delivery. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare posted price minus delivered cost to market margin', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f1ce6431-b7f4-59bd-8672-ee574e111a92', 'convenience-store', 'Revenue Leak', 'convenience-store.leak_04',
   'Impulse/snack margin not optimized', 'Audit planogram for high-margin items at eye level',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Snack/beverage margin >45%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Audit planogram for high-margin items at eye level', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0100be5a-02fe-5db4-bda3-763b7ee295e7', 'convenience-store', 'Cost Leak', 'convenience-store.leak_05',
   'Labor cost above norm', 'Track labor hours per $1000 in sales vs peers',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Labor <14% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track labor hours per $1000 in sales vs peers', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for convenience-store
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('convenience-store', 'Does your fuel margin meet the target of Fuel margin >$0.10/gallon after delivery?', 1, '82315ac2-e717-59a1-91b1-eede8329c0bf')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('convenience-store', 'Is your theft/shrinkage within target (Shrinkage <2%)?', 2, 'c975ebe8-987a-5ca8-87dc-e219299793fd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('convenience-store', 'Does your tobacco/lottery margin meet the target of Tobacco >18%, Lottery commission tracked?', 3, 'd1a16526-590c-525a-987d-cbaf8aef2e9e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('convenience-store', 'Is your labor cost within target (Labor <14% of revenue)?', 4, '0100be5a-02fe-5db4-bda3-763b7ee295e7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('convenience-store', 'Is your impulse/snack margin being optimized?', 5, 'f1ce6431-b7f4-59bd-8672-ee574e111a92')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== COURIER-DELIVERY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('07c9401a-a7ae-5cad-b3d8-c5fffa6a3242', 'courier-delivery', 'Cost Leak', 'courier-delivery.leak_01',
   'Cost per delivery above benchmark', 'Calculate total cost divided by total deliveries',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Cost/delivery <$8 urban. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Calculate total cost divided by total deliveries', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9b9d42dd-263a-5911-8a2c-2a03bbc9cf77', 'courier-delivery', 'Operational Leak', 'courier-delivery.leak_02',
   'Failed delivery rate above 5%', 'Track failed/re-attempted deliveries per 100',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Failed delivery rate <5%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track failed/re-attempted deliveries per 100', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9e986d9e-5fef-5e29-8c43-e05db208a4aa', 'courier-delivery', 'Cost Leak', 'courier-delivery.leak_03',
   'Route density below optimal', 'Calculate stops per hour per route',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Stops/hour >6 urban. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Calculate stops per hour per route', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a059e9ba-2021-598b-af24-50cbf0ea5cc0', 'courier-delivery', 'Operational Leak', 'courier-delivery.leak_04',
   'Vehicle utilization below 80%', 'Compare hours in use vs hours available per vehicle',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Vehicle utilization >80%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare hours in use vs hours available per vehicle', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('862edeb2-e450-5ea7-b7c6-f684c443f2d1', 'courier-delivery', 'Cost Leak', 'courier-delivery.leak_05',
   'Fuel cost per delivery above norm', 'Track fuel spend per delivery completed',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Fuel <15% of delivery revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track fuel spend per delivery completed', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for courier-delivery
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('courier-delivery', 'Is your cost per delivery within target (Cost/delivery <$8 urban)?', 1, '07c9401a-a7ae-5cad-b3d8-c5fffa6a3242')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('courier-delivery', 'Is your failed delivery rate within target (Failed delivery rate <5%)?', 2, '9b9d42dd-263a-5911-8a2c-2a03bbc9cf77')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('courier-delivery', 'Does your route density meet the target of Stops/hour >6 urban?', 3, '9e986d9e-5fef-5e29-8c43-e05db208a4aa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('courier-delivery', 'Does your vehicle utilization meet the target of Vehicle utilization >80%?', 4, 'a059e9ba-2021-598b-af24-50cbf0ea5cc0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('courier-delivery', 'Is your fuel cost per delivery within target (Fuel <15% of delivery revenue)?', 5, '862edeb2-e450-5ea7-b7c6-f684c443f2d1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== CYBERSECURITY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('114cd27e-3342-5a02-b548-a2d217282ac7', 'cybersecurity', 'Revenue Leak', 'cybersecurity.leak_01',
   'Assessment revenue below market', 'Compare assessment pricing to market rates',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Pen test avg >$10K, audit >$15K. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare assessment pricing to market rates', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3e2ff106-7ee7-558f-a971-14650634c035', 'cybersecurity', 'Revenue Leak', 'cybersecurity.leak_02',
   'Retainer margin below 50%', 'Compare retainer revenue to fully loaded service cost',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Retainer margin >50%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare retainer revenue to fully loaded service cost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('550f87d0-326c-5f2c-beb2-faadcb31db63', 'cybersecurity', 'Cost Leak', 'cybersecurity.leak_03',
   'Certification maintenance cost untracked', 'Track certification renewal and training costs per person',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Cert costs budgeted annually. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track certification renewal and training costs per person', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f50713a2-ca43-5f9a-94cb-7e8c42487b1b', 'cybersecurity', 'Cost Leak', 'cybersecurity.leak_04',
   'Tool licensing cost above 15% of revenue', 'Audit security tool subscriptions and utilization',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Tool cost <15% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Audit security tool subscriptions and utilization', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for cybersecurity
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cybersecurity', 'Does your assessment revenue meet the target of Pen test avg >$10K, audit >$15K?', 1, '114cd27e-3342-5a02-b548-a2d217282ac7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cybersecurity', 'Does your retainer margin meet the target of Retainer margin >50%?', 2, '3e2ff106-7ee7-558f-a971-14650634c035')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cybersecurity', 'Is your tool licensing cost within target (Tool cost <15% revenue)?', 3, 'f50713a2-ca43-5f9a-94cb-7e8c42487b1b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cybersecurity', 'Do you regularly track certification renewal and training costs per person?', 4, '550f87d0-326c-5f2c-beb2-faadcb31db63')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DANCE-STUDIO (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('15c4b4e1-360c-5b3d-aadc-8ef6786b0ecc', 'dance-studio', 'Revenue Leak', 'dance-studio.leak_01',
   'Student retention below 75%', 'Track student re-enrollment rate',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Student retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track student re-enrollment rate', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b1b4c6e6-f9ad-5900-8d7c-20840bb39ff5', 'dance-studio', 'Operational Leak', 'dance-studio.leak_02',
   'Class/room utilization below 70%', 'Compare scheduled classes to available room-hours',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Room utilization >70%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare scheduled classes to available room-hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d476559f-51b6-5539-b17b-e8bb6be3a1de', 'dance-studio', 'Cost Leak', 'dance-studio.leak_03',
   'Teacher cost above 45% of revenue', 'Track instructor pay as % of tuition revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Teacher cost <45% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track instructor pay as % of tuition revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for dance-studio
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dance-studio', 'Does your student retention meet the target of Student retention >75%/yr?', 1, '15c4b4e1-360c-5b3d-aadc-8ef6786b0ecc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dance-studio', 'Is your teacher cost within target (Teacher cost <45% revenue)?', 2, 'd476559f-51b6-5539-b17b-e8bb6be3a1de')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dance-studio', 'Does your class/room utilization meet the target of Room utilization >70%?', 3, 'b1b4c6e6-f9ad-5900-8d7c-20840bb39ff5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DATA-ANALYTICS (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d673c3c1-4add-55b5-a6cf-2f7e8c385a50', 'data-analytics', 'Revenue Leak', 'data-analytics.leak_01',
   'Billable utilization below 65%', 'Track billable hours per analyst',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >65%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours per analyst', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3f1baf47-a164-5e17-8478-cab124f7204b', 'data-analytics', 'Cost Leak', 'data-analytics.leak_02',
   'Tool/platform licensing above 10% revenue', 'Audit platform and tool subscription costs',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Tool cost <10% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Audit platform and tool subscription costs', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('200a402e-ffe0-548b-89be-a3917f6ad10f', 'data-analytics', 'Revenue Leak', 'data-analytics.leak_03',
   'Project scope creep uncompensated', 'Track hours over estimate and billing recovery',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for data-analytics
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('data-analytics', 'Does your billable utilization meet the target of Utilization >65%?', 1, 'd673c3c1-4add-55b5-a6cf-2f7e8c385a50')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('data-analytics', 'Do you regularly track hours over estimate and billing recovery?', 2, '200a402e-ffe0-548b-89be-a3917f6ad10f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('data-analytics', 'Is your tool/platform licensing within target (Tool cost <10% revenue)?', 3, '3f1baf47-a164-5e17-8478-cab124f7204b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DAYCARE (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b019e8bf-888e-5d47-8c03-6b9b03afe52d', 'daycare', 'Revenue Leak', 'daycare.leak_01',
   'Occupancy rate below 85%', 'Track enrolled children vs licensed capacity',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Occupancy >85%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track enrolled children vs licensed capacity', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('28b50691-b35d-5305-b6e6-a4e0c41508b9', 'daycare', 'Cost Leak', 'daycare.leak_02',
   'Staff-to-child ratio cost above required', 'Compare actual staffing to required ratio',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Ratio at regulatory minimum. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare actual staffing to required ratio', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('17604105-6ee9-51ab-9e2d-566732424874', 'daycare', 'Cost Leak', 'daycare.leak_03',
   'Food cost per child above $5/day', 'Track per-child daily food cost',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Food cost <$5/child/day. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track per-child daily food cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('468ba3f0-2db9-5c32-af41-2cde21b17567', 'daycare', 'Cost Leak', 'daycare.leak_04',
   'Insurance cost above 3% of revenue', 'Benchmark daycare insurance premiums',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Insurance <3% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Benchmark daycare insurance premiums', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4f940e3c-b625-5320-b2aa-5393fcf10ce3', 'daycare', 'Revenue Leak', 'daycare.leak_05',
   'Late pickup fee not enforced', 'Track late pickups vs fees collected',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Late fees collected >80% of incidents. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track late pickups vs fees collected', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6ff0fd46-9f53-51d8-ba66-0bbf7304f06c', 'daycare', 'Revenue Leak', 'daycare.leak_06',
   'Parent churn above 25%/yr', 'Track enrollment departures mid-term',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Parent retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track enrollment departures mid-term', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for daycare
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare', 'Does your occupancy rate meet the target of Occupancy >85%?', 1, 'b019e8bf-888e-5d47-8c03-6b9b03afe52d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare', 'Is your staff-to-child ratio cost within target (Ratio at regulatory minimum)?', 2, '28b50691-b35d-5305-b6e6-a4e0c41508b9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare', 'Is your parent churn within target (Parent retention >75%/yr)?', 3, '6ff0fd46-9f53-51d8-ba66-0bbf7304f06c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare', 'Is your food cost per child within target (Food cost <$5/child/day)?', 4, '17604105-6ee9-51ab-9e2d-566732424874')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare', 'Is your insurance cost within target (Insurance <3% revenue)?', 5, '468ba3f0-2db9-5c32-af41-2cde21b17567')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare', 'Is your late pickup fee being enforced?', 6, '4f940e3c-b625-5320-b2aa-5393fcf10ce3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DEMOLITION (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('40542675-6d25-5762-a260-01eb0de41382', 'demolition', 'Cost Leak', 'demolition.leak_01',
   'Disposal cost above contract', 'Audit dump fees per job vs volume-contracted rates',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Negotiate volume-based dump rates. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Audit dump fees per job vs volume-contracted rates', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6724a285-9893-5558-81cd-6dccf004d795', 'demolition', 'Operational Leak', 'demolition.leak_02',
   'Equipment utilization below 70%', 'Track equipment hours per week vs available hours',
   75.00, 'critical', 'fixed_range', 5000.00, 30000.00,
   'Benchmark: Equipment days utilized >70%. Impact: $5,000–$30,000/year.',
   'Industry benchmark data', 'Track equipment hours per week vs available hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0916fd90-657e-5624-a3d7-05458a2861b8', 'demolition', 'Compliance Leak', 'demolition.leak_03',
   'Safety incident cost overrun', 'Track incident rate and workers comp claims',
   75.00, 'critical', 'fixed_range', 5000.00, 75000.00,
   'Benchmark: Zero lost-time incidents. Impact: $5,000–$75,000/year.',
   'Industry benchmark data', 'Track incident rate and workers comp claims', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7ae4e2d0-2680-55a3-9719-ab433d312a42', 'demolition', 'Revenue Leak', 'demolition.leak_04',
   'Salvage material revenue not captured', 'Track salvageable materials recovered and sold',
   75.00, 'high', 'fixed_range', 1000.00, 15000.00,
   'Benchmark: Capture scrap metal/lumber value. Impact: $1,000–$15,000/year.',
   'Industry benchmark data', 'Track salvageable materials recovered and sold', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for demolition
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('demolition', 'Do you track your safety incident cost weekly and keep it within target (Zero lost-time incidents)?', 1, '0916fd90-657e-5624-a3d7-05458a2861b8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('demolition', 'Does your equipment utilization meet the target of Equipment days utilized >70%?', 2, '6724a285-9893-5558-81cd-6dccf004d795')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('demolition', 'Is your disposal cost within target (Negotiate volume-based dump rates)?', 3, '40542675-6d25-5762-a260-01eb0de41382')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('demolition', 'Is your salvage material revenue being captured?', 4, '7ae4e2d0-2680-55a3-9719-ab433d312a42')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DENTAL (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('65368e8b-ee37-5609-8da4-83b6d3ea5163', 'dental', 'Revenue Leak', 'dental.leak_01',
   'Collection rate below 98%', 'Compare collected to billed amount',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Collection rate >98%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare collected to billed amount', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cae3634a-a349-5275-aa22-f53944db7522', 'dental', 'Revenue Leak', 'dental.leak_02',
   'Hygiene production below $250/hr', 'Track hygiene revenue per hour scheduled',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Hygiene production >$250/hr. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track hygiene revenue per hour scheduled', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('20d444e5-9479-55fa-bbf9-3d121eb090eb', 'dental', 'Cost Leak', 'dental.leak_03',
   'Overhead above 65%', 'Track all non-dentist costs as % of collections',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Overhead <65%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track all non-dentist costs as % of collections', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('97de19f5-a971-505f-be16-56bb2633b6ae', 'dental', 'Revenue Leak', 'dental.leak_04',
   'No-show rate above 10%', 'Track missed appointments and last-minute cancellations',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: No-show rate <10%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track missed appointments and last-minute cancellations', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for dental
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Does your collection rate meet the target of Collection rate >98%?', 1, '65368e8b-ee37-5609-8da4-83b6d3ea5163')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Does your hygiene production meet the target of Hygiene production >$250/hr?', 2, 'cae3634a-a349-5275-aa22-f53944db7522')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Is your overhead within target (Overhead <65%)?', 3, '20d444e5-9479-55fa-bbf9-3d121eb090eb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Is your no-show rate within target (No-show rate <10%)?', 4, '97de19f5-a971-505f-be16-56bb2633b6ae')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DRIVING-SCHOOL (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d5b48c5b-4f97-5eec-bff8-e3ea88047510', 'driving-school', 'Revenue Leak', 'driving-school.leak_01',
   'Revenue per student below $600', 'Compare package pricing to market',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue/student >$600 (package). Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare package pricing to market', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a7576f9b-a3bf-5014-89c5-338109a694d9', 'driving-school', 'Cost Leak', 'driving-school.leak_02',
   'Vehicle cost above 15% of revenue', 'Track per-vehicle insurance+maintenance+fuel',
   75.00, 'high', 'fixed_range', 2000.00, 12000.00,
   'Benchmark: Vehicle cost <15% revenue. Impact: $2,000–$12,000/year.',
   'Industry benchmark data', 'Track per-vehicle insurance+maintenance+fuel', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('73301393-8624-5c12-8c99-98282b9a7877', 'driving-school', 'Operational Leak', 'driving-school.leak_03',
   'Pass rate below 80%', 'Track first-attempt pass rates',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Student pass rate >80%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track first-attempt pass rates', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8b06fe9c-c1af-5347-819f-77aa73a55f79', 'driving-school', 'Operational Leak', 'driving-school.leak_04',
   'Scheduling utilization below 80%', 'Compare booked lessons to available slots',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Scheduling >80% filled. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare booked lessons to available slots', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for driving-school
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('driving-school', 'Does your revenue per student meet the target of Revenue/student >$600 (package)?', 1, 'd5b48c5b-4f97-5eec-bff8-e3ea88047510')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('driving-school', 'Is your vehicle cost within target (Vehicle cost <15% revenue)?', 2, 'a7576f9b-a3bf-5014-89c5-338109a694d9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('driving-school', 'Does your pass rate meet the target of Student pass rate >80%?', 3, '73301393-8624-5c12-8c99-98282b9a7877')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('driving-school', 'Does your scheduling utilization meet the target of Scheduling >80% filled?', 4, '8b06fe9c-c1af-5347-819f-77aa73a55f79')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== DRY-CLEANING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b1cb9531-74db-50fd-88c7-eaa896cfbd3d', 'dry-cleaning', 'Revenue Leak', 'dry-cleaning.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('203f531c-ecb7-534a-9201-2727b11a808f', 'dry-cleaning', 'Cost Leak', 'dry-cleaning.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('52823dc8-3fbc-51d9-b6a1-8d20680324ba', 'dry-cleaning', 'Cost Leak', 'dry-cleaning.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bdeb7500-482f-5e1d-b6ca-3be9b276c39d', 'dry-cleaning', 'Cost Leak', 'dry-cleaning.leak_04',
   'Damage claim rate above 1%', 'Track damage claims as % of garments processed',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Damage claims <1%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track damage claims as % of garments processed', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for dry-cleaning
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dry-cleaning', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, 'b1cb9531-74db-50fd-88c7-eaa896cfbd3d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dry-cleaning', 'Is your labor/operator cost within target (Labor <45% revenue)?', 2, '203f531c-ecb7-534a-9201-2727b11a808f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dry-cleaning', 'Is your damage claim rate within target (Damage claims <1%)?', 3, 'bdeb7500-482f-5e1d-b6ca-3be9b276c39d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dry-cleaning', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 4, '52823dc8-3fbc-51d9-b6a1-8d20680324ba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ECOMMERCE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f4728877-ad76-56f8-9981-a69d6e604f60', 'ecommerce', 'Revenue Leak', 'ecommerce.leak_01',
   'Cart abandonment above 70%', 'Track cart completion rate and recovery email effectiveness',
   75.00, 'critical', 'fixed_range', 5000.00, 75000.00,
   'Benchmark: Cart abandonment <70%. Impact: $5,000–$75,000/year.',
   'Industry benchmark data', 'Track cart completion rate and recovery email effectiveness', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('edfd10f7-f1e2-5162-a819-bc7e9a5ea509', 'ecommerce', 'Cost Leak', 'ecommerce.leak_02',
   'Return rate above 15%', 'Track return rate by category and reason code',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Return rate <15%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track return rate by category and reason code', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5067016f-51d2-5f65-9074-163ac7bda165', 'ecommerce', 'Cost Leak', 'ecommerce.leak_03',
   'Shipping cost as % of revenue above 12%', 'Compare shipping spend to revenue by channel',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Shipping <12% of revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare shipping spend to revenue by channel', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2a1d890f-5b73-57cd-953b-7174f3e250a4', 'ecommerce', 'Cost Leak', 'ecommerce.leak_04',
   'Ad spend ROAS below 3x', 'Track return on ad spend by channel and campaign',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: ROAS >3x blended. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track return on ad spend by channel and campaign', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('82d4ed3c-2ccb-5782-8e7b-b7f6ad706129', 'ecommerce', 'Cost Leak', 'ecommerce.leak_05',
   'CC processing fees above 2.5%', 'Compare effective processing rate to available rates',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Processing fees <2.5%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare effective processing rate to available rates', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for ecommerce
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Is your cart abandonment within target (Cart abandonment <70%)?', 1, 'f4728877-ad76-56f8-9981-a69d6e604f60')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Does your ad spend roas meet the target of ROAS >3x blended?', 2, '2a1d890f-5b73-57cd-953b-7174f3e250a4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Is your return rate within target (Return rate <15%)?', 3, 'edfd10f7-f1e2-5162-a819-bc7e9a5ea509')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Is your shipping cost as % of revenue within target (Shipping <12% of revenue)?', 4, '5067016f-51d2-5f65-9074-163ac7bda165')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Is your cc processing fees within target (Processing fees <2.5%)?', 5, '82d4ed3c-2ccb-5782-8e7b-b7f6ad706129')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ELECTRICAL (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('50beda30-585e-548d-94d4-871533c1bb78', 'electrical', 'Revenue Leak', 'electrical.leak_01',
   'Billable hour rate below true cost', 'Compare hourly bill rate to fully loaded labor cost',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Billable rate >2.5x tech wage. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare hourly bill rate to fully loaded labor cost', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9c2fb606-688d-567e-aa8a-651ec86b9bd9', 'electrical', 'Revenue Leak', 'electrical.leak_02',
   'Material markup insufficient', 'Compare supplier cost vs client billed price',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Markup 25-35% on materials. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare supplier cost vs client billed price', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1dd3f5e5-1f2a-5096-b793-3de401d6ce33', 'electrical', 'Cost Leak', 'electrical.leak_03',
   'Callback/rework rate high', 'Track rework frequency and cost per callback event',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Callbacks <2% of jobs. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track rework frequency and cost per callback event', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b4638d7a-a095-56b3-843b-c57fa0fc9b63', 'electrical', 'Revenue Leak', 'electrical.leak_04',
   'Permit compliance cost not passed through', 'Compare permit fees paid vs billed to clients',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: 100% permit costs billed to client. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare permit fees paid vs billed to clients', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5debfd00-61d9-587b-ae03-c942780fcb45', 'electrical', 'Cost Leak', 'electrical.leak_05',
   'Vehicle/tool cost overrun', 'Track per-tech daily equipment and vehicle cost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Vehicle+tool <$200/tech/day. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track per-tech daily equipment and vehicle cost', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b68a7b83-a337-56f4-882c-c195da09fa43', 'electrical', 'Revenue Leak', 'electrical.leak_06',
   'Unbilled travel time', 'Compare paid travel hours to billed travel charges',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Travel time billed or built into rate. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare paid travel hours to billed travel charges', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for electrical
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('electrical', 'Does your billable hour rate meet the target of Billable rate >2.5x tech wage?', 1, '50beda30-585e-548d-94d4-871533c1bb78')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('electrical', 'Do you regularly compare supplier cost vs client billed price?', 2, '9c2fb606-688d-567e-aa8a-651ec86b9bd9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('electrical', 'Do you regularly compare paid travel hours to billed travel charges?', 3, 'b68a7b83-a337-56f4-882c-c195da09fa43')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('electrical', 'Do you track callback/rework rate and keep it within target (Callbacks <2% of jobs)?', 4, '1dd3f5e5-1f2a-5096-b793-3de401d6ce33')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('electrical', 'Do you track your vehicle/tool cost weekly and keep it within target (Vehicle+tool <$200/tech/day)?', 5, '5debfd00-61d9-587b-ae03-c942780fcb45')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('electrical', 'Is your permit compliance cost being passed through?', 6, 'b4638d7a-a095-56b3-843b-c57fa0fc9b63')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ENGINEERING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b9d6f98c-fcf2-59d4-80ad-5c07a9e7409b', 'engineering', 'Revenue Leak', 'engineering.leak_01',
   'Billable utilization below 65%', 'Track billable hours per engineer',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Utilization >65%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track billable hours per engineer', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c83ea68a-34da-576e-bc4b-17d8524a90f9', 'engineering', 'Revenue Leak', 'engineering.leak_02',
   'Multiplier below 2.5x', 'Calculate revenue per dollar of direct labor',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Net multiplier >2.5x. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Calculate revenue per dollar of direct labor', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2cd6b022-5a6a-55ad-8d04-ce36fbb75304', 'engineering', 'Cost Leak', 'engineering.leak_03',
   'Project overrun above 10%', 'Compare actual to estimated hours per project',
   75.00, 'critical', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Budget overrun <10%. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Compare actual to estimated hours per project', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dc0b4c39-a580-5b7b-a4e8-18a4b358c39f', 'engineering', 'Cash Flow Leak', 'engineering.leak_04',
   'AR days above 60', 'Track collection period by project and client',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: AR days <60. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track collection period by project and client', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for engineering
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('engineering', 'Does your billable utilization meet the target of Utilization >65%?', 1, 'b9d6f98c-fcf2-59d4-80ad-5c07a9e7409b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('engineering', 'Does your multiplier meet the target of Net multiplier >2.5x?', 2, 'c83ea68a-34da-576e-bc4b-17d8524a90f9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('engineering', 'Is your project overrun within target (Budget overrun <10%)?', 3, '2cd6b022-5a6a-55ad-8d04-ce36fbb75304')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('engineering', 'Is your ar days within target (AR days <60)?', 4, 'dc0b4c39-a580-5b7b-a4e8-18a4b358c39f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ENVIRONMENTAL-CONSULTING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('615b245e-65b8-535c-9dcd-ce074b49bdb8', 'environmental-consulting', 'Revenue Leak', 'environmental-consulting.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('979c89be-9aee-54cc-96ea-4d9f18524af2', 'environmental-consulting', 'Revenue Leak', 'environmental-consulting.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7a084c0a-4a15-5dfd-aa71-56088e9deaad', 'environmental-consulting', 'Revenue Leak', 'environmental-consulting.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fe9d5de7-cda7-5a9c-b23f-09043e0530c3', 'environmental-consulting', 'Cost Leak', 'environmental-consulting.leak_04',
   'Lab cost above 15% of project revenue', 'Track lab testing costs per project',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Lab cost <15% project revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track lab testing costs per project', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for environmental-consulting
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('environmental-consulting', 'Does your billable utilization meet the target of Utilization >60%?', 1, '615b245e-65b8-535c-9dcd-ce074b49bdb8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('environmental-consulting', 'Is your scope creep being billed?', 2, '979c89be-9aee-54cc-96ea-4d9f18524af2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('environmental-consulting', 'Does your client retention meet the target of Client retention >75%/yr?', 3, '7a084c0a-4a15-5dfd-aa71-56088e9deaad')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('environmental-consulting', 'Is your lab cost within target (Lab cost <15% project revenue)?', 4, 'fe9d5de7-cda7-5a9c-b23f-09043e0530c3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ESCAPE-ROOM (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('310d8726-c471-59df-8849-427a7baf0bbd', 'escape-room', 'Revenue Leak', 'escape-room.leak_01',
   'Revenue per visit below benchmark', 'Compare avg ticket to market benchmark',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Track and improve revenue/visit. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare avg ticket to market benchmark', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2d8df87f-0379-5bdb-9733-1d50507cd79c', 'escape-room', 'Revenue Leak', 'escape-room.leak_02',
   'F&B margin below 60%', 'Track food/beverage cost as % of F&B sales',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: F&B margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track food/beverage cost as % of F&B sales', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('36b2a0e5-e7b8-508c-b5d8-dba7a84f1185', 'escape-room', 'Cost Leak', 'escape-room.leak_03',
   'Staffing cost above 35% of revenue', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Staffing <35% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1a56aaea-48db-5fee-8e9f-95e26e273850', 'escape-room', 'Operational Leak', 'escape-room.leak_04',
   'Room utilization below 50%', 'Track bookings per room per day vs available slots',
   75.00, 'critical', 'fixed_range', 2000.00, 12000.00,
   'Benchmark: Room utilization >50%. Impact: $2,000–$12,000/year.',
   'Industry benchmark data', 'Track bookings per room per day vs available slots', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for escape-room
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('escape-room', 'Does your revenue per visit meet the target of Track and improve revenue/visit?', 1, '310d8726-c471-59df-8849-427a7baf0bbd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('escape-room', 'Does your room utilization meet the target of Room utilization >50%?', 2, '1a56aaea-48db-5fee-8e9f-95e26e273850')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('escape-room', 'Does your f&b margin meet the target of F&B margin >60%?', 3, '2d8df87f-0379-5bdb-9733-1d50507cd79c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('escape-room', 'Is your staffing cost within target (Staffing <35% revenue)?', 4, '36b2a0e5-e7b8-508c-b5d8-dba7a84f1185')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== EVENT-PLANNING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bb7af7da-dd30-5e28-83e8-db1c04802de1', 'event-planning', 'Revenue Leak', 'event-planning.leak_01',
   'Vendor markup below 15%', 'Compare vendor invoices to client billing',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Vendor markup >15%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare vendor invoices to client billing', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d17d33fa-5c16-5ce9-b029-79c06d40351a', 'event-planning', 'Revenue Leak', 'event-planning.leak_02',
   'Cancellation loss not covered', 'Review contracts for cancellation/deposit terms',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Cancellation clause in 100% of contracts. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Review contracts for cancellation/deposit terms', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7d02e3ff-e75a-520f-a785-4a35e332fa2d', 'event-planning', 'Revenue Leak', 'event-planning.leak_03',
   'Revenue per event below target', 'Track revenue per event by type',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue/event >$3000. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track revenue per event by type', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0b071f8a-ae07-5419-ae24-fd38b8b31aa9', 'event-planning', 'Cash Flow Leak', 'event-planning.leak_04',
   'Seasonal demand gap', 'Compare monthly revenue distribution',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Off-season revenue >40% of peak. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare monthly revenue distribution', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for event-planning
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('event-planning', 'Is your cancellation loss being covered?', 1, 'd17d33fa-5c16-5ce9-b029-79c06d40351a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('event-planning', 'Does your vendor markup meet the target of Vendor markup >15%?', 2, 'bb7af7da-dd30-5e28-83e8-db1c04802de1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('event-planning', 'Does your revenue per event meet the target of Revenue/event >$3000?', 3, '7d02e3ff-e75a-520f-a785-4a35e332fa2d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('event-planning', 'Do you regularly compare monthly revenue distribution?', 4, '0b071f8a-ae07-5419-ae24-fd38b8b31aa9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FARMING (8 patterns, 7 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('01d80eed-8001-56ea-976e-0ad102680ba3', 'farming', 'Cost Leak', 'farming.leak_01',
   'Input cost overrun', 'Compare input costs to yield output per acre',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Seed/fertilizer <25% revenue. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare input costs to yield output per acre', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('85b9832f-e268-5b05-a793-7202c259b60c', 'farming', 'Revenue Leak', 'farming.leak_02',
   'Crop insurance gap', 'Compare insured value vs actual crop value at risk',
   75.00, 'critical', 'fixed_range', 10000.00, 100000.00,
   'Benchmark: Coverage ≥80% of expected yield. Impact: $10,000–$100,000/year.',
   'Industry benchmark data', 'Compare insured value vs actual crop value at risk', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2d9fa71e-4f27-5b2d-86b0-3e0dab5d3ba2', 'farming', 'Cost Leak', 'farming.leak_03',
   'Equipment underutilization', 'Track hours operated vs hours available per asset',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Equipment use >200 days/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track hours operated vs hours available per asset', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c6b5384-47ad-5a29-b5b3-fba068917a60', 'farming', 'Revenue Leak', 'farming.leak_04',
   'Yield per acre below benchmark', 'Compare actual yield to county/regional averages',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Corn: 180bu/acre, Soy: 50bu/acre. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare actual yield to county/regional averages', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dcf9bdb1-0a64-5b70-977a-ce5e57e02f08', 'farming', 'Cost Leak', 'farming.leak_05',
   'Fuel cost inefficiency', 'Track gallons per acre worked vs benchmark',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Fuel <5% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track gallons per acre worked vs benchmark', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('191ac570-dfe9-5001-8d26-a5fd0c5ac335', 'farming', 'Cost Leak', 'farming.leak_06',
   'Labour seasonal overspend', 'Compare seasonal headcount to actual harvest workload',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Seasonal labor <20% revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare seasonal headcount to actual harvest workload', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('30abe0ec-5028-54a6-a3c6-80accf725d4e', 'farming', 'Tax Leak', 'farming.leak_07',
   'CCA depreciation missed', 'Check if farm equipment uses accelerated CCA',
   75.00, 'critical', 'fixed_range', 2000.00, 30000.00,
   'Benchmark: Claim immediate expensing on equipment. Impact: $2,000–$30,000/year.',
   'Industry benchmark data', 'Check if farm equipment uses accelerated CCA', 7)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a40670a7-d7c7-5b4a-b8b4-60f13d3912a2', 'farming', 'Cost Leak', 'farming.leak_08',
   'Grain drying cost excess', 'Compare energy cost per bushel dried to regional avg',
   75.00, 'medium', 'fixed_range', 1000.00, 15000.00,
   'Benchmark: Drying cost <$0.04/bu/point. Impact: $1,000–$15,000/year.',
   'Industry benchmark data', 'Compare energy cost per bushel dried to regional avg', 8)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for farming
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Do you have adequate insurance coverage (Coverage ≥80% of expected yield)?', 1, '85b9832f-e268-5b05-a793-7202c259b60c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Does your yield per acre meet the target of Corn: 180bu/acre, Soy: 50bu/acre?', 2, '6c6b5384-47ad-5a29-b5b3-fba068917a60')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Do you track your input cost weekly and keep it within target (Seed/fertilizer <25% revenue)?', 3, '01d80eed-8001-56ea-976e-0ad102680ba3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Have you reviewed and optimized your cca depreciation with a tax professional?', 4, '30abe0ec-5028-54a6-a3c6-80accf725d4e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Is your equipment underutilization at target (Equipment use >200 days/yr)?', 5, '2d9fa71e-4f27-5b2d-86b0-3e0dab5d3ba2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Do you track your labour seasonal weekly and keep it within target (Seasonal labor <20% revenue)?', 6, '191ac570-dfe9-5001-8d26-a5fd0c5ac335')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('farming', 'Is your fuel cost inefficiency at target (Fuel <5% of revenue)?', 7, 'dcf9bdb1-0a64-5b70-977a-ce5e57e02f08')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FAST-FOOD-FRANCHISE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d0e39026-5761-59b2-9b93-50a85c6555d9', 'fast-food-franchise', 'Cost Leak', 'fast-food-franchise.leak_01',
   'Food cost above 30%', 'Track actual COGS vs franchisor target',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Food cost <30%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track actual COGS vs franchisor target', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b740239b-7f3c-5aec-9720-9a34191b68d0', 'fast-food-franchise', 'Cost Leak', 'fast-food-franchise.leak_02',
   'Labor cost above 28%', 'Compare labor scheduling to POS transaction volume by hour',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Labor <28% revenue. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare labor scheduling to POS transaction volume by hour', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5d2700e0-7240-520d-8943-6dd7c91a5cfa', 'fast-food-franchise', 'Cost Leak', 'fast-food-franchise.leak_03',
   'Royalty/marketing fund above contracted rate', 'Reconcile royalty payments to franchise agreement terms',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Verify royalty calculations monthly. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Reconcile royalty payments to franchise agreement terms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('48a4a040-fe2b-5af6-a1cf-baf18da07e34', 'fast-food-franchise', 'Operational Leak', 'fast-food-franchise.leak_04',
   'Drive-through time above 180 seconds', 'Track average service time from order to handoff',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Drive-through <180 sec avg. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track average service time from order to handoff', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9b87a0ad-f5d8-5e07-87ae-d387d54f19b0', 'fast-food-franchise', 'Cost Leak', 'fast-food-franchise.leak_05',
   'Waste above 3%', 'Track food waste daily vs production forecasts',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Waste <3% of purchases. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track food waste daily vs production forecasts', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for fast-food-franchise
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fast-food-franchise', 'Is your food cost within target (Food cost <30%)?', 1, 'd0e39026-5761-59b2-9b93-50a85c6555d9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fast-food-franchise', 'Is your labor cost within target (Labor <28% revenue)?', 2, 'b740239b-7f3c-5aec-9720-9a34191b68d0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fast-food-franchise', 'Is your drive-through time within target (Drive-through <180 sec avg)?', 3, '48a4a040-fe2b-5af6-a1cf-baf18da07e34')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fast-food-franchise', 'Is your royalty/marketing fund within target (Verify royalty calculations monthly)?', 4, '5d2700e0-7240-520d-8943-6dd7c91a5cfa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fast-food-franchise', 'Is your waste within target (Waste <3% of purchases)?', 5, '9b87a0ad-f5d8-5e07-87ae-d387d54f19b0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FINANCIAL-ADVISOR (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6f4fde22-49b5-5e24-9f55-294b92e12725', 'financial-advisor', 'Revenue Leak', 'financial-advisor.leak_01',
   'Client retention below 95%', 'Track AUM lost from departing clients',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Client retention >95%/yr. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track AUM lost from departing clients', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('38844605-0ae8-518b-a5f7-c4526bc0ebea', 'financial-advisor', 'Cost Leak', 'financial-advisor.leak_02',
   'Overhead above 35% of revenue', 'Track rent, tech, admin as % of fee revenue',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Overhead <35%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track rent, tech, admin as % of fee revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('295b0656-2184-5425-9a26-fe0330c5073f', 'financial-advisor', 'Cost Leak', 'financial-advisor.leak_03',
   'Tech spend above 5% without ROI', 'Audit tech subscriptions and utilization',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Tech ROI: each tool justifies cost. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Audit tech subscriptions and utilization', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for financial-advisor
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('financial-advisor', 'Does your client retention meet the target of Client retention >95%/yr?', 1, '6f4fde22-49b5-5e24-9f55-294b92e12725')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('financial-advisor', 'Is your overhead within target (Overhead <35%)?', 2, '38844605-0ae8-518b-a5f7-c4526bc0ebea')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('financial-advisor', 'Is your tech spend within target (Tech ROI: each tool justifies cost)?', 3, '295b0656-2184-5425-9a26-fe0330c5073f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FISHING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('17a8c92d-095f-5ae7-a250-ab93593ef40e', 'fishing', 'Cost Leak', 'fishing.leak_01',
   'Fuel cost per lb caught too high', 'Track fuel spend per pound of catch landed',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Fuel <15% of landing value. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track fuel spend per pound of catch landed', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('48629ab2-7702-5cad-ad2a-cdc949de1f82', 'fishing', 'Revenue Leak', 'fishing.leak_02',
   'Quota underutilization', 'Compare actual catch to allocated quota',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Quota utilization >90%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare actual catch to allocated quota', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('aa5cf5cc-1eec-5bf1-92b6-61ebe9facadc', 'fishing', 'Revenue Leak', 'fishing.leak_03',
   'Cold chain spoilage', 'Track product lost between catch and market delivery',
   75.00, 'high', 'fixed_range', 2000.00, 25000.00,
   'Benchmark: Spoilage <3% of catch. Impact: $2,000–$25,000/year.',
   'Industry benchmark data', 'Track product lost between catch and market delivery', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3262b27e-f741-5f49-82a4-5b3ae66fe564', 'fishing', 'Cost Leak', 'fishing.leak_04',
   'Vessel maintenance cost overrun', 'Compare annual maintenance vs scheduled plan',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Maintenance <10% vessel value/yr. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare annual maintenance vs scheduled plan', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for fishing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fishing', 'Is your quota underutilization at target (Quota utilization >90%)?', 1, '48629ab2-7702-5cad-ad2a-cdc949de1f82')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fishing', 'Do you regularly track fuel spend per pound of catch landed?', 2, '17a8c92d-095f-5ae7-a250-ab93593ef40e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fishing', 'Do you track cold chain spoilage and keep it within target (Spoilage <3% of catch)?', 3, 'aa5cf5cc-1eec-5bf1-92b6-61ebe9facadc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fishing', 'Do you track your vessel maintenance cost weekly and keep it within target (Maintenance <10% vessel value/yr)?', 4, '3262b27e-f741-5f49-82a4-5b3ae66fe564')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FITNESS (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a6e86bf7-cdcb-51e1-bc7d-8c47057a2c3c', 'fitness', 'Revenue Leak', 'fitness.leak_01',
   'Member retention below 70%', 'Track monthly cancellations and member tenure',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Member retention >70%/yr. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track monthly cancellations and member tenure', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3ca7bc34-39d5-52ce-923f-06976ae1a397', 'fitness', 'Revenue Leak', 'fitness.leak_02',
   'Revenue per member below $50/mo', 'Track total revenue / active members',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue/member >$50/mo. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track total revenue / active members', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('09d1145c-5459-5f39-abc4-36037800532c', 'fitness', 'Cost Leak', 'fitness.leak_03',
   'Payroll above 40% of revenue', 'Track all compensation as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Payroll <40% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track all compensation as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for fitness
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Does your member retention meet the target of Member retention >70%/yr?', 1, 'a6e86bf7-cdcb-51e1-bc7d-8c47057a2c3c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Does your revenue per member meet the target of Revenue/member >$50/mo?', 2, '3ca7bc34-39d5-52ce-923f-06976ae1a397')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Is your payroll within target (Payroll <40% revenue)?', 3, '09d1145c-5459-5f39-abc4-36037800532c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FLORIST (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fec2f6d1-d260-545b-b207-0c2fdcae08a1', 'florist', 'Cost Leak', 'florist.leak_01',
   'Spoilage rate above 20%', 'Track flowers purchased vs flowers sold/used',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Flower spoilage <20%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track flowers purchased vs flowers sold/used', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('20a8a849-0f74-5c29-ab86-34da2135e045', 'florist', 'Cost Leak', 'florist.leak_02',
   'Delivery cost above 12% of revenue', 'Track delivery cost per order',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Delivery cost <12% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track delivery cost per order', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cd5b0660-a9e3-57ae-b00e-9f4c01a58a3b', 'florist', 'Revenue Leak', 'florist.leak_03',
   'Event vs walk-in ratio suboptimal', 'Compare event booking revenue to walk-in sales',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Event revenue >40% of total. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare event booking revenue to walk-in sales', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('882b5793-e612-5eb1-be35-f0c7ff5ba610', 'florist', 'Cost Leak', 'florist.leak_04',
   'Wire service fees excessive', 'Audit wire service commissions and fees',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Wire service fees <15% of wire orders. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Audit wire service commissions and fees', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for florist
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Is your spoilage rate within target (Flower spoilage <20%)?', 1, 'fec2f6d1-d260-545b-b207-0c2fdcae08a1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Do you regularly compare event booking revenue to walk-in sales?', 2, 'cd5b0660-a9e3-57ae-b00e-9f4c01a58a3b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Is your delivery cost within target (Delivery cost <12% revenue)?', 3, '20a8a849-0f74-5c29-ab86-34da2135e045')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Do you regularly audit wire service commissions and fees?', 4, '882b5793-e612-5eb1-be35-f0c7ff5ba610')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FOOD-DELIVERY (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b5903897-a628-56ae-9cfd-d099ecf67d6c', 'food-delivery', 'Revenue Leak', 'food-delivery.leak_01',
   'Revenue per delivery below $8', 'Track average revenue per completed delivery',
   75.00, 'critical', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Revenue/delivery >$8. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track average revenue per completed delivery', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('403e5ea3-63fc-5441-b0e8-d3e57c5e2cb2', 'food-delivery', 'Cost Leak', 'food-delivery.leak_02',
   'Platform commission above 25%', 'Compare commission across platforms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Track effective commission rate. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare commission across platforms', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b0c18aee-13e2-539f-9c63-8a5958f32211', 'food-delivery', 'Cost Leak', 'food-delivery.leak_03',
   'Vehicle cost per delivery above $2', 'Track fuel+depreciation per delivery',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Vehicle cost <$2/delivery. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track fuel+depreciation per delivery', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for food-delivery
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-delivery', 'Does your revenue per delivery meet the target of Revenue/delivery >$8?', 1, 'b5903897-a628-56ae-9cfd-d099ecf67d6c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-delivery', 'Is your platform commission within target (Track effective commission rate)?', 2, '403e5ea3-63fc-5441-b0e8-d3e57c5e2cb2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-delivery', 'Is your vehicle cost per delivery within target (Vehicle cost <$2/delivery)?', 3, 'b0c18aee-13e2-539f-9c63-8a5958f32211')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FOOD-PROCESSING (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fb387ad2-ed0d-56cf-8be1-4bccddb1db5a', 'food-processing', 'Revenue Leak', 'food-processing.leak_01',
   'Yield rate below target', 'Compare finished product output to raw material input weight',
   75.00, 'critical', 'fixed_range', 5000.00, 75000.00,
   'Benchmark: Product yield >92% of raw input. Impact: $5,000–$75,000/year.',
   'Industry benchmark data', 'Compare finished product output to raw material input weight', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0ff9e89e-d7b8-5629-b024-c63770a72686', 'food-processing', 'Cost Leak', 'food-processing.leak_02',
   'Spoilage/waste above 3%', 'Track product discarded due to quality, expiry, damage',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Spoilage <3% of production. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track product discarded due to quality, expiry, damage', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b9277b8f-6e0c-5499-990a-1c9359527847', 'food-processing', 'Compliance Leak', 'food-processing.leak_03',
   'HACCP non-compliance risk', 'Audit critical control points and corrective action frequency',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Zero critical HACCP violations. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Audit critical control points and corrective action frequency', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d193719e-ad93-5d8b-8148-420602b65121', 'food-processing', 'Cost Leak', 'food-processing.leak_04',
   'Packaging cost per unit above benchmark', 'Compare packaging material cost per SKU to peers',
   75.00, 'high', 'fixed_range', 2000.00, 25000.00,
   'Benchmark: Packaging <8% of COGS. Impact: $2,000–$25,000/year.',
   'Industry benchmark data', 'Compare packaging material cost per SKU to peers', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('87f41ec4-eacf-5ea4-92cc-5a1d44608d36', 'food-processing', 'Revenue Leak', 'food-processing.leak_05',
   'Cold chain temperature excursion', 'Track temperature monitoring alerts during storage/transport',
   75.00, 'high', 'fixed_range', 3000.00, 40000.00,
   'Benchmark: Zero temperature excursions in transit. Impact: $3,000–$40,000/year.',
   'Industry benchmark data', 'Track temperature monitoring alerts during storage/transport', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('24175ea2-9a9e-5268-963c-a435365c9ebe', 'food-processing', 'Cost Leak', 'food-processing.leak_06',
   'Labor scheduling inefficiency', 'Compare scheduled vs actual labor hours by shift',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: OT <8% of total labor hours. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare scheduled vs actual labor hours by shift', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for food-processing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-processing', 'Are you fully up to date on all compliance requirements?', 1, 'b9277b8f-6e0c-5499-990a-1c9359527847')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-processing', 'Does your yield rate meet the target of Product yield >92% of raw input?', 2, 'fb387ad2-ed0d-56cf-8be1-4bccddb1db5a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-processing', 'Is your spoilage/waste within target (Spoilage <3% of production)?', 3, '0ff9e89e-d7b8-5629-b024-c63770a72686')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-processing', 'Do you regularly track temperature monitoring alerts during storage/transport?', 4, '87f41ec4-eacf-5ea4-92cc-5a1d44608d36')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-processing', 'Is your labor scheduling inefficiency at target (OT <8% of total labor hours)?', 5, '24175ea2-9a9e-5268-963c-a435365c9ebe')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-processing', 'Is your packaging cost per unit within target (Packaging <8% of COGS)?', 6, 'd193719e-ad93-5d8b-8148-420602b65121')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FOOD-TRUCK (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('371963bc-9593-5dce-9b68-eb6087384219', 'food-truck', 'Cost Leak', 'food-truck.leak_01',
   'Food cost above 30%', 'Track ingredient cost vs daily sales',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Food cost <30%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track ingredient cost vs daily sales', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('74aac0bf-d055-5929-9036-390a9b13c7aa', 'food-truck', 'Revenue Leak', 'food-truck.leak_02',
   'Location revenue variance above 40%', 'Compare daily revenue by location',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Best locations identified and prioritized. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare daily revenue by location', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c438c683-1cc5-5d7d-a0ea-fc3aaf976edb', 'food-truck', 'Cost Leak', 'food-truck.leak_03',
   'Fuel cost above 5% of revenue', 'Track fuel cost per operating day',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Fuel <5% revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track fuel cost per operating day', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e7577367-dd05-5ea0-b7f5-c3c642dec547', 'food-truck', 'Compliance Leak', 'food-truck.leak_04',
   'Permit cost above 3% of revenue', 'Audit permit costs and compare to revenue',
   75.00, 'medium', 'fixed_range', 500.00, 3000.00,
   'Benchmark: Permits <3% revenue. Impact: $500–$3,000/year.',
   'Industry benchmark data', 'Audit permit costs and compare to revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for food-truck
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-truck', 'Is your food cost within target (Food cost <30%)?', 1, '371963bc-9593-5dce-9b68-eb6087384219')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-truck', 'Is your location revenue variance within target (Best locations identified and prioritized)?', 2, '74aac0bf-d055-5929-9036-390a9b13c7aa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-truck', 'Is your fuel cost within target (Fuel <5% revenue)?', 3, 'c438c683-1cc5-5d7d-a0ea-fc3aaf976edb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food-truck', 'Is your permit cost within target (Permits <3% revenue)?', 4, 'e7577367-dd05-5ea0-b7f5-c3c642dec547')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FORESTRY-LOGGING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('643a2303-d574-53fd-86ff-901921ec5de2', 'forestry-logging', 'Revenue Leak', 'forestry-logging.leak_01',
   'Board-feet yield below potential', 'Compare actual harvest to timber cruise estimate',
   75.00, 'high', 'fixed_range', 5000.00, 30000.00,
   'Benchmark: Yield >85% of cruiser estimate. Impact: $5,000–$30,000/year.',
   'Industry benchmark data', 'Compare actual harvest to timber cruise estimate', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('de7f7f58-5cfa-53f6-b824-acb681c80887', 'forestry-logging', 'Cost Leak', 'forestry-logging.leak_02',
   'Equipment maintenance cost high', 'Track maintenance spend vs equipment age and hours',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Maintenance <12% equipment value/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track maintenance spend vs equipment age and hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b6d915a2-e11c-5b41-910e-cac168579610', 'forestry-logging', 'Compliance Leak', 'forestry-logging.leak_03',
   'Reforestation compliance gap', 'Verify replanting obligations are met within required timeframe',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: 100% replant requirement met. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Verify replanting obligations are met within required timeframe', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('998bbc46-8e20-574b-a083-ae7c666b1fc7', 'forestry-logging', 'Cost Leak', 'forestry-logging.leak_04',
   'Fuel cost per MBF excessive', 'Track fuel consumption per thousand board feet',
   75.00, 'medium', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Fuel <$25/MBF harvested. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track fuel consumption per thousand board feet', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for forestry-logging
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('forestry-logging', 'Are you fully up to date on all compliance requirements?', 1, 'b6d915a2-e11c-5b41-910e-cac168579610')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('forestry-logging', 'Does your board-feet yield meet the target of Yield >85% of cruiser estimate?', 2, '643a2303-d574-53fd-86ff-901921ec5de2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('forestry-logging', 'Do you regularly track maintenance spend vs equipment age and hours?', 3, 'de7f7f58-5cfa-53f6-b824-acb681c80887')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('forestry-logging', 'Do you regularly track fuel consumption per thousand board feet?', 4, '998bbc46-8e20-574b-a083-ae7c666b1fc7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FREELANCER-GIG (6 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fe0f405f-abd0-5dad-a92b-91dbae1add7e', 'freelancer-gig', 'Revenue Leak', 'freelancer-gig.leak_01',
   'Effective hourly rate below $50', 'Calculate total revenue / total hours worked (including admin)',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Effective rate >$50/hr. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Calculate total revenue / total hours worked (including admin)', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1dc34e87-42e7-5e24-8817-fcc3d35e92ec', 'freelancer-gig', 'Revenue Leak', 'freelancer-gig.leak_02',
   'Utilization below 65%', 'Track billable hours vs total working hours',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Billable utilization >65%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track billable hours vs total working hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('138ba2bf-5dbf-5f61-ad92-c73a865753bd', 'freelancer-gig', 'Cost Leak', 'freelancer-gig.leak_03',
   'Platform fees above 20%', 'Track effective commission rate by platform',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Platform fees <20% or go direct. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track effective commission rate by platform', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('68956f0e-ac65-58d8-aa15-4aa120c481b8', 'freelancer-gig', 'Tax Leak', 'freelancer-gig.leak_04',
   'Self-employment tax not optimized', 'Compare tax burden as sole prop vs incorporation',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Incorporate if income >$60K. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare tax burden as sole prop vs incorporation', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4c8ac1ae-c564-5c92-bc3b-7f9879cdf26d', 'freelancer-gig', 'Tax Leak', 'freelancer-gig.leak_05',
   'Home office deduction missed', 'Calculate eligible home office deduction',
   75.00, 'high', 'fixed_range', 500.00, 3000.00,
   'Benchmark: Claim home office deduction. Impact: $500–$3,000/year.',
   'Industry benchmark data', 'Calculate eligible home office deduction', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('64287e6d-5b9a-5e71-95b0-74f5b3dfe290', 'freelancer-gig', 'Tax Leak', 'freelancer-gig.leak_06',
   'Health insurance deduction missed', 'Verify health premiums deducted properly',
   75.00, 'high', 'fixed_range', 1000.00, 5000.00,
   'Benchmark: Self-employed health insurance deduction. Impact: $1,000–$5,000/year.',
   'Industry benchmark data', 'Verify health premiums deducted properly', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for freelancer-gig
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freelancer-gig', 'Does your effective hourly rate meet the target of Effective rate >$50/hr?', 1, 'fe0f405f-abd0-5dad-a92b-91dbae1add7e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freelancer-gig', 'Does your utilization meet the target of Billable utilization >65%?', 2, '1dc34e87-42e7-5e24-8817-fcc3d35e92ec')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freelancer-gig', 'Is your self-employment tax being optimized?', 3, '68956f0e-ac65-58d8-aa15-4aa120c481b8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freelancer-gig', 'Is your platform fees within target (Platform fees <20% or go direct)?', 4, '138ba2bf-5dbf-5f61-ad92-c73a865753bd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freelancer-gig', 'Have you reviewed and optimized your health insurance deduction with a tax professional?', 5, '64287e6d-5b9a-5e71-95b0-74f5b3dfe290')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FREIGHT-BROKER (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a4cc94d5-e755-52f2-8003-06fa3a6fc702', 'freight-broker', 'Revenue Leak', 'freight-broker.leak_01',
   'Margin per load below 15%', 'Compare customer invoice to carrier payment per load',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Gross margin >15% per load. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare customer invoice to carrier payment per load', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0b27510e-9b2b-5486-a168-4900ae32064e', 'freight-broker', 'Cash Flow Leak', 'freight-broker.leak_02',
   'AR days above 35', 'Track customer payment speed vs carrier payment due date',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: AR days <35. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track customer payment speed vs carrier payment due date', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a15d6bb4-ebce-5e93-8fe0-027c85875d79', 'freight-broker', 'Operational Leak', 'freight-broker.leak_03',
   'Carrier reliability issue rate', 'Track late pickups, missed deliveries, claims by carrier',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: On-time delivery >95%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track late pickups, missed deliveries, claims by carrier', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('769afd84-c75a-5e83-8d05-025bb517fdda', 'freight-broker', 'Cost Leak', 'freight-broker.leak_04',
   'Claim rate above 1%', 'Track claims filed as % of total loads brokered',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Freight claims <1% of loads. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track claims filed as % of total loads brokered', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for freight-broker
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freight-broker', 'Does your margin per load meet the target of Gross margin >15% per load?', 1, 'a4cc94d5-e755-52f2-8003-06fa3a6fc702')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freight-broker', 'Is your ar days within target (AR days <35)?', 2, '0b27510e-9b2b-5486-a168-4900ae32064e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freight-broker', 'Do you regularly track late pickups, missed deliveries, claims by carrier?', 3, 'a15d6bb4-ebce-5e93-8fe0-027c85875d79')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('freight-broker', 'Is your claim rate within target (Freight claims <1% of loads)?', 4, '769afd84-c75a-5e83-8d05-025bb517fdda')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FUNERAL-HOME (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('57b20eb2-70b4-5f3e-bbd1-6c11c7a4cddf', 'funeral-home', 'Revenue Leak', 'funeral-home.leak_01',
   'Revenue per service below market', 'Compare average service revenue to regional benchmark',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue/service at market average. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare average service revenue to regional benchmark', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dd468d67-27d0-5d2a-8216-4ca0cd73f985', 'funeral-home', 'Cost Leak', 'funeral-home.leak_02',
   'Overhead above 55%', 'Track facility, vehicle, admin costs as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Overhead <55% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track facility, vehicle, admin costs as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('90d6846b-fb02-54c2-9a06-4e1058818b26', 'funeral-home', 'Revenue Leak', 'funeral-home.leak_03',
   'Prepaid plan utilization rate low', 'Track prepaid plan sales and conversion',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Prepaid plans >20% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track prepaid plan sales and conversion', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('48ca2e77-9cd2-56de-945a-2b9e0f12ccc3', 'funeral-home', 'Revenue Leak', 'funeral-home.leak_04',
   'Merchandise margin below 50%', 'Compare merchandise cost to retail price',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Casket/urn margin >50%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare merchandise cost to retail price', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for funeral-home
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('funeral-home', 'Does your revenue per service meet the target of Revenue/service at market average?', 1, '57b20eb2-70b4-5f3e-bbd1-6c11c7a4cddf')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('funeral-home', 'Is your overhead within target (Overhead <55% revenue)?', 2, 'dd468d67-27d0-5d2a-8216-4ca0cd73f985')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('funeral-home', 'Is your prepaid plan utilization rate at target (Prepaid plans >20% of revenue)?', 3, '90d6846b-fb02-54c2-9a06-4e1058818b26')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('funeral-home', 'Does your merchandise margin meet the target of Casket/urn margin >50%?', 4, '48ca2e77-9cd2-56de-945a-2b9e0f12ccc3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== FURNITURE-STORE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('28e506fd-f012-5e7c-b17f-b4dec7f687aa', 'furniture-store', 'Cost Leak', 'furniture-store.leak_01',
   'Delivery cost above 8% of revenue', 'Track delivery cost per order including fuel, labor, vehicle',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Delivery cost <8% revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track delivery cost per order including fuel, labor, vehicle', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5b9397bf-bbd7-5762-b877-755321f042b4', 'furniture-store', 'Revenue Leak', 'furniture-store.leak_02',
   'Return/damage rate above 5%', 'Track returns and damage claims as % of deliveries',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Returns+damages <5%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track returns and damage claims as % of deliveries', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5315431a-33a8-5b4b-a617-f7ed49d1e612', 'furniture-store', 'Revenue Leak', 'furniture-store.leak_03',
   'Floor space productivity low', 'Compare revenue per sqft to industry benchmark',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue >$200/sqft/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare revenue per sqft to industry benchmark', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('84d4e7e5-0c9c-5dcf-a691-9b9403d2ae21', 'furniture-store', 'Cash Flow Leak', 'furniture-store.leak_04',
   'Financing default rate untracked', 'Track customer financing defaults and recovery rate',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Default rate <3%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track customer financing defaults and recovery rate', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for furniture-store
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('furniture-store', 'Is your delivery cost within target (Delivery cost <8% revenue)?', 1, '28e506fd-f012-5e7c-b17f-b4dec7f687aa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('furniture-store', 'Do you regularly compare revenue per sqft to industry benchmark?', 2, '5315431a-33a8-5b4b-a617-f7ed49d1e612')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('furniture-store', 'Is your return/damage rate within target (Returns+damages <5%)?', 3, '5b9397bf-bbd7-5762-b877-755321f042b4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('furniture-store', 'Do you regularly track customer financing defaults and recovery rate?', 4, '84d4e7e5-0c9c-5dcf-a691-9b9403d2ae21')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== GOLF-COURSE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a130ad5b-ade0-59c4-91d6-5f3608dfbef2', 'golf-course', 'Revenue Leak', 'golf-course.leak_01',
   'Revenue per visit below benchmark', 'Compare avg ticket to market benchmark',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Track and improve revenue/visit. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare avg ticket to market benchmark', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a58db740-43be-5279-a0fb-014b4e5a6b42', 'golf-course', 'Revenue Leak', 'golf-course.leak_02',
   'F&B margin below 60%', 'Track food/beverage cost as % of F&B sales',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: F&B margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track food/beverage cost as % of F&B sales', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0d587792-7c00-5c1d-8a97-097f8194d423', 'golf-course', 'Cost Leak', 'golf-course.leak_03',
   'Staffing cost above 35% of revenue', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Staffing <35% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('02487f54-1615-58f0-9a95-72e084cc6b26', 'golf-course', 'Cost Leak', 'golf-course.leak_04',
   'Maintenance cost per acre above $15K', 'Track per-acre maintenance cost',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Maintenance <$15K/acre/yr. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track per-acre maintenance cost', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e0ca4aba-bf8b-54da-a20a-f138f08af2f2', 'golf-course', 'Revenue Leak', 'golf-course.leak_05',
   'Membership retention below 80%', 'Track annual membership renewal rate',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Retention >80%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track annual membership renewal rate', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for golf-course
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('golf-course', 'Is your maintenance cost per acre within target (Maintenance <$15K/acre/yr)?', 1, '02487f54-1615-58f0-9a95-72e084cc6b26')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('golf-course', 'Does your revenue per visit meet the target of Track and improve revenue/visit?', 2, 'a130ad5b-ade0-59c4-91d6-5f3608dfbef2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('golf-course', 'Does your membership retention meet the target of Retention >80%?', 3, 'e0ca4aba-bf8b-54da-a20a-f138f08af2f2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('golf-course', 'Does your f&b margin meet the target of F&B margin >60%?', 4, 'a58db740-43be-5279-a0fb-014b4e5a6b42')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('golf-course', 'Is your staffing cost within target (Staffing <35% revenue)?', 5, '0d587792-7c00-5c1d-8a97-097f8194d423')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== GRAPHIC-DESIGN (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('35c84b54-830c-51bc-8335-2257692201d2', 'graphic-design', 'Revenue Leak', 'graphic-design.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1eec7c07-4566-5da8-802f-65d23ba144cd', 'graphic-design', 'Revenue Leak', 'graphic-design.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('17088f3d-ec0b-551d-b6cc-c02fcdb82ffb', 'graphic-design', 'Revenue Leak', 'graphic-design.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c82d4e57-df7f-562c-ab17-71b390578379', 'graphic-design', 'Cost Leak', 'graphic-design.leak_04',
   'Software subscription cost above 8%', 'Audit Adobe/design tool subscriptions',
   75.00, 'medium', 'fixed_range', 1000.00, 5000.00,
   'Benchmark: Software <8% revenue. Impact: $1,000–$5,000/year.',
   'Industry benchmark data', 'Audit Adobe/design tool subscriptions', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('470b03a1-fea0-52c7-b82c-d3ae3b8b2bf0', 'graphic-design', 'Cost Leak', 'graphic-design.leak_05',
   'Revision cycles exceeding contract', 'Track revision rounds vs contracted limit',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Revisions capped at 2-3 per project. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track revision rounds vs contracted limit', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for graphic-design
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('graphic-design', 'Does your billable utilization meet the target of Utilization >60%?', 1, '35c84b54-830c-51bc-8335-2257692201d2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('graphic-design', 'Is your scope creep being billed?', 2, '1eec7c07-4566-5da8-802f-65d23ba144cd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('graphic-design', 'Does your client retention meet the target of Client retention >75%/yr?', 3, '17088f3d-ec0b-551d-b6cc-c02fcdb82ffb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('graphic-design', 'Do you regularly track revision rounds vs contracted limit?', 4, '470b03a1-fea0-52c7-b82c-d3ae3b8b2bf0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('graphic-design', 'Is your software subscription cost within target (Software <8% revenue)?', 5, 'c82d4e57-df7f-562c-ab17-71b390578379')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== GREENHOUSE-NURSERY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('96e7116e-b114-5853-a594-25bec5b92457', 'greenhouse-nursery', 'Revenue Leak', 'greenhouse-nursery.leak_01',
   'Plant loss/shrinkage rate high', 'Track plant death rate from propagation to sale',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Shrinkage <8% of inventory. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track plant death rate from propagation to sale', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f202aab2-2bf9-55a5-b5fa-a60fd9590432', 'greenhouse-nursery', 'Cost Leak', 'greenhouse-nursery.leak_02',
   'Heating cost per sqft excessive', 'Compare energy cost per growing sqft to benchmark',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Heating <$2.50/sqft/yr. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare energy cost per growing sqft to benchmark', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('69a221bb-5113-5404-bb42-dfa2c82960d7', 'greenhouse-nursery', 'Cost Leak', 'greenhouse-nursery.leak_03',
   'Labor cost per sqft above norm', 'Track labor hours per unit area of production',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Labor <$4/sqft/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track labor hours per unit area of production', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1f31d43c-1c6e-5c88-a174-4178b416d2b3', 'greenhouse-nursery', 'Cash Flow Leak', 'greenhouse-nursery.leak_04',
   'Seasonal revenue gap not managed', 'Compare monthly revenue distribution to 12-month ideal',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Off-season revenue >25% of peak. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare monthly revenue distribution to 12-month ideal', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8e371be8-aaeb-57a0-900a-94742cc7872b', 'greenhouse-nursery', 'Revenue Leak', 'greenhouse-nursery.leak_05',
   'Inventory turnover low', 'Track days-to-sell from potting to customer purchase',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Turnover >4x/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track days-to-sell from potting to customer purchase', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for greenhouse-nursery
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('greenhouse-nursery', 'Do you track plant loss/shrinkage rate and keep it within target (Shrinkage <8% of inventory)?', 1, '96e7116e-b114-5853-a594-25bec5b92457')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('greenhouse-nursery', 'Do you regularly compare energy cost per growing sqft to benchmark?', 2, 'f202aab2-2bf9-55a5-b5fa-a60fd9590432')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('greenhouse-nursery', 'Is your seasonal revenue gap being managed?', 3, '1f31d43c-1c6e-5c88-a174-4178b416d2b3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('greenhouse-nursery', 'Is your labor cost per sqft within target (Labor <$4/sqft/yr)?', 4, '69a221bb-5113-5404-bb42-dfa2c82960d7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('greenhouse-nursery', 'Is your inventory turnover low within target (Turnover >4x/yr)?', 5, '8e371be8-aaeb-57a0-900a-94742cc7872b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== GROCERY (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c04581aa-7c7b-505b-8498-8448c903fb9c', 'grocery', 'Revenue Leak', 'grocery.leak_01',
   'Spoilage/shrinkage above 3%', 'Track product loss by department (produce, dairy, meat, bakery)',
   75.00, 'critical', 'fixed_range', 5000.00, 60000.00,
   'Benchmark: Shrinkage <2%, Spoilage <1.5%. Impact: $5,000–$60,000/year.',
   'Industry benchmark data', 'Track product loss by department (produce, dairy, meat, bakery)', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6cc76f29-cbec-5b88-bf22-41255da0cac5', 'grocery', 'Revenue Leak', 'grocery.leak_02',
   'Department margin below benchmark', 'Compare gross margin by department to industry benchmarks',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Produce >40%, Meat >28%, Dairy >30%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare gross margin by department to industry benchmarks', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2110e0ad-fbfc-5b0f-941e-3dc57c6574ba', 'grocery', 'Cost Leak', 'grocery.leak_03',
   'Labor scheduling vs traffic mismatch', 'Compare hourly staffing to POS transaction volume by hour',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Labor <12% of revenue. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare hourly staffing to POS transaction volume by hour', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('577688bc-a24c-5445-9cc0-78f0e0374434', 'grocery', 'Cost Leak', 'grocery.leak_04',
   'Inventory turns too low by department', 'Track turns by department vs industry benchmark',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Overall turns >14x/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track turns by department vs industry benchmark', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3e8396ac-0e2d-55db-a0d5-34071ae64f43', 'grocery', 'Revenue Leak', 'grocery.leak_05',
   'Loss leader strategy not measured', 'Compare average ticket with and without promoted items',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Track basket size lift from promotions. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare average ticket with and without promoted items', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f6878edd-b98b-5485-9239-fb18505ef036', 'grocery', 'Cost Leak', 'grocery.leak_06',
   'Energy cost per sqft above norm', 'Benchmark energy cost per sqft to similar-sized stores',
   75.00, 'medium', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Energy <$5/sqft/yr (refrigeration heavy). Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Benchmark energy cost per sqft to similar-sized stores', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for grocery
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('grocery', 'Is your spoilage/shrinkage within target (Shrinkage <2%, Spoilage <1.5%)?', 1, 'c04581aa-7c7b-505b-8498-8448c903fb9c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('grocery', 'Does your department margin meet the target of Produce >40%, Meat >28%, Dairy >30%?', 2, '6cc76f29-cbec-5b88-bf22-41255da0cac5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('grocery', 'Do you regularly compare hourly staffing to pos transaction volume by hour?', 3, '2110e0ad-fbfc-5b0f-941e-3dc57c6574ba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('grocery', 'Do you regularly track turns by department vs industry benchmark?', 4, '577688bc-a24c-5445-9cc0-78f0e0374434')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('grocery', 'Is your loss leader strategy being measured?', 5, '3e8396ac-0e2d-55db-a0d5-34071ae64f43')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('grocery', 'Is your energy cost per sqft within target (Energy <$5/sqft/yr (refrigeration heavy))?', 6, 'f6878edd-b98b-5485-9239-fb18505ef036')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== GYM-CROSSFIT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('35c5d42c-7dde-544f-8634-b3e5d8bbaa2f', 'gym-crossfit', 'Revenue Leak', 'gym-crossfit.leak_01',
   'Member retention below 75%', 'Track monthly cancellations and member tenure',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Retention >75%/yr. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track monthly cancellations and member tenure', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f65ed9a8-3822-5c9c-953c-7cfa2b2f6c9c', 'gym-crossfit', 'Revenue Leak', 'gym-crossfit.leak_02',
   'Revenue per member below $150/mo', 'Track total revenue / active members',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue/member >$150/mo CrossFit. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track total revenue / active members', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ef3ec595-b59e-51e2-8071-64db861bf1b7', 'gym-crossfit', 'Operational Leak', 'gym-crossfit.leak_03',
   'Class capacity utilization below 70%', 'Compare attendees per class to max capacity',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Class fill rate >70%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare attendees per class to max capacity', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bd171a57-4470-5aa8-a5b2-e6824a1703bd', 'gym-crossfit', 'Cost Leak', 'gym-crossfit.leak_04',
   'Equipment cost above 8% of revenue', 'Track equipment maintenance+replacement cost',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Equipment <8% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track equipment maintenance+replacement cost', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5857921f-67d7-51ce-b052-021f862aa191', 'gym-crossfit', 'Cost Leak', 'gym-crossfit.leak_05',
   'Trainer utilization below 70%', 'Track trainer hours coaching vs hours paid',
   75.00, 'high', 'fixed_range', 2000.00, 12000.00,
   'Benchmark: Trainer utilization >70%. Impact: $2,000–$12,000/year.',
   'Industry benchmark data', 'Track trainer hours coaching vs hours paid', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for gym-crossfit
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym-crossfit', 'Does your member retention meet the target of Retention >75%/yr?', 1, '35c5d42c-7dde-544f-8634-b3e5d8bbaa2f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym-crossfit', 'Does your revenue per member meet the target of Revenue/member >$150/mo CrossFit?', 2, 'f65ed9a8-3822-5c9c-953c-7cfa2b2f6c9c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym-crossfit', 'Does your class capacity utilization meet the target of Class fill rate >70%?', 3, 'ef3ec595-b59e-51e2-8071-64db861bf1b7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym-crossfit', 'Does your trainer utilization meet the target of Trainer utilization >70%?', 4, '5857921f-67d7-51ce-b052-021f862aa191')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym-crossfit', 'Is your equipment cost within target (Equipment <8% revenue)?', 5, 'bd171a57-4470-5aa8-a5b2-e6824a1703bd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HARDWARE-STORE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('567fa9ef-3b95-5233-af73-49d573aeb803', 'hardware-store', 'Cost Leak', 'hardware-store.leak_01',
   'Inventory turns below industry', 'Track turnover by department and flag dead stock',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Turns >3x/yr. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track turnover by department and flag dead stock', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2d9a75a1-14a0-51be-864a-e8772aa01431', 'hardware-store', 'Cost Leak', 'hardware-store.leak_02',
   'Seasonal inventory overstock', 'Compare end-of-season inventory to total seasonal purchase',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: End-of-season inventory <15% of peak buy. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare end-of-season inventory to total seasonal purchase', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('99988a8c-0329-5ad9-bbf6-8f9428fc0b40', 'hardware-store', 'Revenue Leak', 'hardware-store.leak_03',
   'Delivery cost not recovered', 'Compare delivery cost incurred vs delivery fees collected',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Charge delivery or build into price. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare delivery cost incurred vs delivery fees collected', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1e659d41-abed-5f32-8968-4a0ccb30b682', 'hardware-store', 'Revenue Leak', 'hardware-store.leak_04',
   'Special order margin below standard', 'Track special order margin vs standard inventory margin',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Special orders at >30% margin. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track special order margin vs standard inventory margin', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for hardware-store
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hardware-store', 'Does your inventory turns meet the target of Turns >3x/yr?', 1, '567fa9ef-3b95-5233-af73-49d573aeb803')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hardware-store', 'Do you regularly compare end-of-season inventory to total seasonal purchase?', 2, '2d9a75a1-14a0-51be-864a-e8772aa01431')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hardware-store', 'Does your special order margin meet the target of Special orders at >30% margin?', 3, '1e659d41-abed-5f32-8968-4a0ccb30b682')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hardware-store', 'Is your delivery cost being recovered?', 4, '99988a8c-0329-5ad9-bbf6-8f9428fc0b40')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HEALTHCARE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a6c3912e-765d-597f-b1a1-75879f3cac91', 'healthcare', 'Revenue Leak', 'healthcare.leak_01',
   'Claim denial rate above 5%', 'Track denials by payer, reason code, and appeal success',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Denial rate <5%. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Track denials by payer, reason code, and appeal success', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('981d9528-63a1-5d0a-ba7c-013927119a16', 'healthcare', 'Revenue Leak', 'healthcare.leak_02',
   'Collection rate below 95%', 'Compare collected amount to allowed amount',
   75.00, 'critical', 'fixed_range', 5000.00, 75000.00,
   'Benchmark: Net collection >95%. Impact: $5,000–$75,000/year.',
   'Industry benchmark data', 'Compare collected amount to allowed amount', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b85d7965-70c8-5e47-ba4e-1f57f5eebb91', 'healthcare', 'Cash Flow Leak', 'healthcare.leak_03',
   'AR days above 40', 'Track average days to payment by payer',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: AR days <40. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track average days to payment by payer', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('878d4bb8-e3d8-528a-bef8-cd87dfcec671', 'healthcare', 'Revenue Leak', 'healthcare.leak_04',
   'No-show rate above 8%', 'Track no-shows and cancellations with revenue impact',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: No-show rate <8%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track no-shows and cancellations with revenue impact', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for healthcare
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Is your claim denial rate within target (Denial rate <5%)?', 1, 'a6c3912e-765d-597f-b1a1-75879f3cac91')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Does your collection rate meet the target of Net collection >95%?', 2, '981d9528-63a1-5d0a-ba7c-013927119a16')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Is your ar days within target (AR days <40)?', 3, 'b85d7965-70c8-5e47-ba4e-1f57f5eebb91')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Is your no-show rate within target (No-show rate <8%)?', 4, '878d4bb8-e3d8-528a-bef8-cd87dfcec671')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HOME-CARE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3f81cc80-e735-52ab-bbfe-0167c31fbc8b', 'home-care', 'Cost Leak', 'home-care.leak_01',
   'Caregiver turnover above 60%', 'Track caregiver departures and replacement costs',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Turnover <60%/yr. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track caregiver departures and replacement costs', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('129ee15b-161f-5e85-87a8-442efecd35f6', 'home-care', 'Revenue Leak', 'home-care.leak_02',
   'Scheduling fill rate below 90%', 'Compare scheduled hours to available caregiver hours',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Schedule fill rate >90%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare scheduled hours to available caregiver hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9c9049ff-45ad-5b1b-b27e-73e45206df22', 'home-care', 'Cost Leak', 'home-care.leak_03',
   'Travel time above 15% of shift', 'Track drive time between clients as % of shift',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Travel time <15% of paid hours. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track drive time between clients as % of shift', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('71cd1a14-fa47-5217-a342-1f6f1c200b55', 'home-care', 'Cost Leak', 'home-care.leak_04',
   'Overtime cost above 10% of labor', 'Track overtime hours and associated premium cost',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: OT <10% of total labor. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track overtime hours and associated premium cost', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('83882e41-addf-589e-9aff-25d4fecb0e04', 'home-care', 'Revenue Leak', 'home-care.leak_05',
   'Revenue per hour below $28', 'Compare hourly rate to market and payer reimbursements',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue/hr >$28. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare hourly rate to market and payer reimbursements', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for home-care
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-care', 'Is your caregiver turnover within target (Turnover <60%/yr)?', 1, '3f81cc80-e735-52ab-bbfe-0167c31fbc8b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-care', 'Does your scheduling fill rate meet the target of Schedule fill rate >90%?', 2, '129ee15b-161f-5e85-87a8-442efecd35f6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-care', 'Does your revenue per hour meet the target of Revenue/hr >$28?', 3, '83882e41-addf-589e-9aff-25d4fecb0e04')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-care', 'Is your overtime cost within target (OT <10% of total labor)?', 4, '71cd1a14-fa47-5217-a342-1f6f1c200b55')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-care', 'Is your travel time within target (Travel time <15% of paid hours)?', 5, '9c9049ff-45ad-5b1b-b27e-73e45206df22')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HOME-INSPECTION (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3ae0e675-a2e3-5489-8d83-4692787eaf5a', 'home-inspection', 'Revenue Leak', 'home-inspection.leak_01',
   'Inspections per day below 2', 'Track inspections completed per working day',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Inspections >2/day. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track inspections completed per working day', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c51b2113-ce1f-5500-be09-4cb8afcfb11d', 'home-inspection', 'Operational Leak', 'home-inspection.leak_02',
   'Report turnaround above 24hrs', 'Track time from inspection to report delivery',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Report delivery <24hrs. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track time from inspection to report delivery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4ae7fc6e-9863-5881-80be-547a34b89124', 'home-inspection', 'Cost Leak', 'home-inspection.leak_03',
   'E&O premium above peers', 'Compare E&O premium to industry average',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: E&O premium benchmarked annually. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Compare E&O premium to industry average', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('df6e3627-65fd-5552-ae6e-aa5bf2897d7b', 'home-inspection', 'Revenue Leak', 'home-inspection.leak_04',
   'Referral rate below 30%', 'Track job source and referral agent relationships',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Referral rate >30% of jobs. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track job source and referral agent relationships', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for home-inspection
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-inspection', 'Does your inspections per day meet the target of Inspections >2/day?', 1, '3ae0e675-a2e3-5489-8d83-4692787eaf5a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-inspection', 'Is your report turnaround within target (Report delivery <24hrs)?', 2, 'c51b2113-ce1f-5500-be09-4cb8afcfb11d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-inspection', 'Does your referral rate meet the target of Referral rate >30% of jobs?', 3, 'df6e3627-65fd-5552-ae6e-aa5bf2897d7b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-inspection', 'Is your e&o premium within target (E&O premium benchmarked annually)?', 4, '4ae7fc6e-9863-5881-80be-547a34b89124')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HOME-STAGING (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5504e7d0-79d6-5b3a-a9dd-d1aeecbe1c35', 'home-staging', 'Cost Leak', 'home-staging.leak_01',
   'Inventory utilization below 70%', 'Track items in use vs total inventory at cost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Furniture utilization >70%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track items in use vs total inventory at cost', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9005aa92-2c03-580e-8c10-2af25c0dfda8', 'home-staging', 'Cost Leak', 'home-staging.leak_02',
   'Damage rate above 5% per job', 'Track damage claims per job',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Damage/loss <5% per staging. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track damage claims per job', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7dfd820e-8bdd-542b-aaef-b607ca91efed', 'home-staging', 'Cost Leak', 'home-staging.leak_03',
   'Transport cost above 10% of revenue', 'Track delivery/pickup cost per staging job',
   75.00, 'medium', 'fixed_range', 1000.00, 5000.00,
   'Benchmark: Transport <10% revenue. Impact: $1,000–$5,000/year.',
   'Industry benchmark data', 'Track delivery/pickup cost per staging job', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for home-staging
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-staging', 'Does your inventory utilization meet the target of Furniture utilization >70%?', 1, '5504e7d0-79d6-5b3a-a9dd-d1aeecbe1c35')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-staging', 'Is your damage rate within target (Damage/loss <5% per staging)?', 2, '9005aa92-2c03-580e-8c10-2af25c0dfda8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home-staging', 'Is your transport cost within target (Transport <10% revenue)?', 3, '7dfd820e-8bdd-542b-aaef-b607ca91efed')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HOTEL-MOTEL (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a269be09-004b-5843-9f77-bbde8dc86059', 'hotel-motel', 'Revenue Leak', 'hotel-motel.leak_01',
   'Occupancy rate below 65%', 'Track occupied rooms vs total available room-nights',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Occupancy >65%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track occupied rooms vs total available room-nights', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d83b3fa1-01f4-504b-bc35-9989ef9b604f', 'hotel-motel', 'Revenue Leak', 'hotel-motel.leak_02',
   'ADR below market', 'Compare average daily rate to competitive set',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: ADR at or above comp set average. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare average daily rate to competitive set', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('02ad3fff-8cb9-533a-857b-07b7a62ea837', 'hotel-motel', 'Revenue Leak', 'hotel-motel.leak_03',
   'RevPAR below market', 'Track revenue per available room vs competitors',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: RevPAR at or above comp set. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track revenue per available room vs competitors', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3c245206-ed3b-525f-a8f8-b24abbb70353', 'hotel-motel', 'Cost Leak', 'hotel-motel.leak_04',
   'Labor cost per occupied room above $35', 'Track housekeeping+front desk labor per room sold',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Labor <$35/occupied room. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track housekeeping+front desk labor per room sold', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a217def1-863a-513c-94b3-81bcd17afb52', 'hotel-motel', 'Cost Leak', 'hotel-motel.leak_05',
   'OTA commission above 18%', 'Track booking channel mix and commission rates',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: OTA commission <18%, direct bookings >40%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track booking channel mix and commission rates', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for hotel-motel
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel-motel', 'Does your occupancy rate meet the target of Occupancy >65%?', 1, 'a269be09-004b-5843-9f77-bbde8dc86059')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel-motel', 'Does your revpar meet the target of RevPAR at or above comp set?', 2, '02ad3fff-8cb9-533a-857b-07b7a62ea837')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel-motel', 'Does your adr meet the target of ADR at or above comp set average?', 3, 'd83b3fa1-01f4-504b-bc35-9989ef9b604f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel-motel', 'Is your ota commission within target (OTA commission <18%, direct bookings >40%)?', 4, 'a217def1-863a-513c-94b3-81bcd17afb52')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel-motel', 'Is your labor cost per occupied room within target (Labor <$35/occupied room)?', 5, '3c245206-ed3b-525f-a8f8-b24abbb70353')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HR-CONSULTING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9fdd7750-e24b-52c6-adf6-4f27c7527ca6', 'hr-consulting', 'Revenue Leak', 'hr-consulting.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('67f3b6ba-4f82-5a0c-8d34-034495f39de0', 'hr-consulting', 'Revenue Leak', 'hr-consulting.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9f470e08-7b11-5a02-bbe9-aa29e287ddda', 'hr-consulting', 'Revenue Leak', 'hr-consulting.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('669e8666-0511-5689-b7c7-570b1a34d20b', 'hr-consulting', 'Compliance Leak', 'hr-consulting.leak_04',
   'Compliance accuracy below 98%', 'Track compliance audit results and corrections',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Compliance accuracy >98%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track compliance audit results and corrections', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for hr-consulting
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hr-consulting', 'Does your billable utilization meet the target of Utilization >60%?', 1, '9fdd7750-e24b-52c6-adf6-4f27c7527ca6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hr-consulting', 'Does your compliance accuracy meet the target of Compliance accuracy >98%?', 2, '669e8666-0511-5689-b7c7-570b1a34d20b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hr-consulting', 'Is your scope creep being billed?', 3, '67f3b6ba-4f82-5a0c-8d34-034495f39de0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hr-consulting', 'Does your client retention meet the target of Client retention >75%/yr?', 4, '9f470e08-7b11-5a02-bbe9-aa29e287ddda')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== HVAC (7 patterns, 7 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b1711cbc-6dfa-56ca-9ac6-88caa198d056', 'hvac', 'Revenue Leak', 'hvac.leak_01',
   'Service call priced below loaded cost', 'Compare service call revenue to fully loaded labor+vehicle+overhead',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Service call: fully loaded tech cost x 2.5. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare service call revenue to fully loaded labor+vehicle+overhead', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('971a03ef-9232-5b03-875f-a0ce6dd3211e', 'hvac', 'Revenue Leak', 'hvac.leak_02',
   'Maintenance agreement penetration low', 'Track % of active customers with maintenance contracts',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: 30%+ of customer base on agreement. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track % of active customers with maintenance contracts', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d7efaa38-0bb7-5585-97cf-08c1dd7d314d', 'hvac', 'Revenue Leak', 'hvac.leak_03',
   'Parts markup below 30%', 'Compare supplier cost vs billed price per part',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Parts markup 30-50%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare supplier cost vs billed price per part', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('86a31376-256a-55e1-b597-cf9a5489a0a2', 'hvac', 'Operational Leak', 'hvac.leak_04',
   'Seasonal capacity waste', 'Compare monthly revenue distribution across 12 months',
   75.00, 'high', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Off-season revenue >40% of peak. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Compare monthly revenue distribution across 12 months', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('124a3325-25b8-5f90-a999-143b8687d9c9', 'hvac', 'Operational Leak', 'hvac.leak_05',
   'Tech truck stock-out rate', 'Track jobs requiring return trip for parts',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: First-trip completion >80%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track jobs requiring return trip for parts', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('90bd821b-e42a-506a-831f-936fac064407', 'hvac', 'Revenue Leak', 'hvac.leak_06',
   'Flat rate book outdated', 'Compare flat rate prices to current cost + margin targets',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Update flat rate pricing annually. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare flat rate prices to current cost + margin targets', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1ef79b80-11c7-5f9f-8502-621893db810a', 'hvac', 'Revenue Leak', 'hvac.leak_07',
   'Equipment warranty recovery missed', 'Track warranty-eligible repairs vs claims filed',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Claim 100% of manufacturer warranties. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track warranty-eligible repairs vs claims filed', 7)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for hvac
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Do you regularly track % of active customers with maintenance contracts?', 1, '971a03ef-9232-5b03-875f-a0ce6dd3211e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Does your service call priced meet the target of Service call: fully loaded tech cost x 2.5?', 2, 'b1711cbc-6dfa-56ca-9ac6-88caa198d056')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Does your parts markup meet the target of Parts markup 30-50%?', 3, 'd7efaa38-0bb7-5585-97cf-08c1dd7d314d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Do you track seasonal capacity waste and keep it within target (Off-season revenue >40% of peak)?', 4, '86a31376-256a-55e1-b597-cf9a5489a0a2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Do you regularly compare flat rate prices to current cost + margin targets?', 5, '90bd821b-e42a-506a-831f-936fac064407')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Do you regularly track warranty-eligible repairs vs claims filed?', 6, '1ef79b80-11c7-5f9f-8502-621893db810a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac', 'Do you regularly track jobs requiring return trip for parts?', 7, '124a3325-25b8-5f90-a999-143b8687d9c9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== IMPORT-EXPORT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7e91caf7-49f6-5d30-b67e-351beaa5ae64', 'import-export', 'Cost Leak', 'import-export.leak_01',
   'Customs duty overpaid', 'Compare duty paid to lowest legally applicable tariff rate',
   75.00, 'critical', 'fixed_range', 3000.00, 50000.00,
   'Benchmark: Audit HS codes for lowest classification. Impact: $3,000–$50,000/year.',
   'Industry benchmark data', 'Compare duty paid to lowest legally applicable tariff rate', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('320667ff-c82f-505f-a7ea-a2853f5e2cf1', 'import-export', 'Cost Leak', 'import-export.leak_02',
   'Freight cost above market', 'Benchmark freight rates against 3+ carriers quarterly',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Freight <8% of landed cost. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Benchmark freight rates against 3+ carriers quarterly', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('28aa7fe6-bb9c-52c2-9141-a67e55c53e65', 'import-export', 'Cash Flow Leak', 'import-export.leak_03',
   'Currency hedging gap', 'Compare unhedged FX exposure to revenue at risk',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Hedge >70% of FX exposure. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Compare unhedged FX exposure to revenue at risk', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d325130e-3016-550c-b3e8-2eb94b6144e2', 'import-export', 'Cost Leak', 'import-export.leak_04',
   'Customs broker overcharging', 'Compare broker fees per entry to market rates',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Broker fees <$150/entry. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare broker fees per entry to market rates', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3b5e55cf-031f-53e2-b552-0684ac6183b2', 'import-export', 'Revenue Leak', 'import-export.leak_05',
   'Lead time causing stockouts', 'Track lost sales from inventory unavailability',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Stockout rate <5%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track lost sales from inventory unavailability', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for import-export
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('import-export', 'Do you regularly compare unhedged fx exposure to revenue at risk?', 1, '28aa7fe6-bb9c-52c2-9141-a67e55c53e65')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('import-export', 'Do you regularly compare duty paid to lowest legally applicable tariff rate?', 2, '7e91caf7-49f6-5d30-b67e-351beaa5ae64')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('import-export', 'Do you regularly track lost sales from inventory unavailability?', 3, '3b5e55cf-031f-53e2-b552-0684ac6183b2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('import-export', 'Is your freight cost within target (Freight <8% of landed cost)?', 4, '320667ff-c82f-505f-a7ea-a2853f5e2cf1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('import-export', 'Do you regularly compare broker fees per entry to market rates?', 5, 'd325130e-3016-550c-b3e8-2eb94b6144e2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== INFLUENCER-CREATOR (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('843e71a3-9e24-5e75-add4-a5d621dd031f', 'influencer-creator', 'Revenue Leak', 'influencer-creator.leak_01',
   'Revenue per post below market', 'Compare per-post rate to follower-count benchmarks',
   75.00, 'critical', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Rate card at market CPM. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare per-post rate to follower-count benchmarks', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bf2712e3-f123-582a-8565-d220f581bfdf', 'influencer-creator', 'Revenue Leak', 'influencer-creator.leak_02',
   'Platform ad share below expectation', 'Compare expected vs actual platform ad revenue',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Audit platform revenue share. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare expected vs actual platform ad revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fe3b2476-61eb-5de2-ab7c-029d4c4856f1', 'influencer-creator', 'Cost Leak', 'influencer-creator.leak_03',
   'Content production cost above 20% of revenue', 'Track equipment, editing, props cost per content piece',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Production cost <20% revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track equipment, editing, props cost per content piece', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for influencer-creator
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('influencer-creator', 'Does your revenue per post meet the target of Rate card at market CPM?', 1, '843e71a3-9e24-5e75-add4-a5d621dd031f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('influencer-creator', 'Does your platform ad share meet the target of Audit platform revenue share?', 2, 'bf2712e3-f123-582a-8565-d220f581bfdf')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('influencer-creator', 'Is your content production cost within target (Production cost <20% revenue)?', 3, 'fe3b2476-61eb-5de2-ab7c-029d4c4856f1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== INSURANCE-BROKER (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('911d7c1b-a94a-56ce-82fc-6cdfacae4f8f', 'insurance-broker', 'Revenue Leak', 'insurance-broker.leak_01',
   'Renewal rate below 85%', 'Track policy renewal rate by line and producer',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Renewal rate >85%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track policy renewal rate by line and producer', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('09de5545-8f23-575f-81b3-721cb3967e51', 'insurance-broker', 'Revenue Leak', 'insurance-broker.leak_02',
   'Commission rate below market', 'Compare commission rates received to market benchmarks',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Commission rate at market avg by line. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare commission rates received to market benchmarks', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8acc4b63-0af6-5f65-a008-86b91c829203', 'insurance-broker', 'Revenue Leak', 'insurance-broker.leak_03',
   'Client retention below 90%', 'Track client departures and premium lost',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Client retention >90%/yr. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track client departures and premium lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f84e43b6-da7a-5e87-b504-c3c0c93ea2fa', 'insurance-broker', 'Cost Leak', 'insurance-broker.leak_04',
   'E&O premium above peers', 'Compare E&O premium to peer group',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: E&O premium benchmarked annually. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare E&O premium to peer group', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('39d70545-aa09-5c5e-b2f2-3657f5f5cdee', 'insurance-broker', 'Revenue Leak', 'insurance-broker.leak_05',
   'Policies per client below 1.5', 'Track average policies per client household',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Cross-sell ratio >1.5 policies/client. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track average policies per client household', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for insurance-broker
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance-broker', 'Does your renewal rate meet the target of Renewal rate >85%?', 1, '911d7c1b-a94a-56ce-82fc-6cdfacae4f8f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance-broker', 'Does your client retention meet the target of Client retention >90%/yr?', 2, '8acc4b63-0af6-5f65-a008-86b91c829203')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance-broker', 'Does your commission rate meet the target of Commission rate at market avg by line?', 3, '09de5545-8f23-575f-81b3-721cb3967e51')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance-broker', 'Does your policies per client meet the target of Cross-sell ratio >1.5 policies/client?', 4, '39d70545-aa09-5c5e-b2f2-3657f5f5cdee')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance-broker', 'Is your e&o premium within target (E&O premium benchmarked annually)?', 5, 'f84e43b6-da7a-5e87-b504-c3c0c93ea2fa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== INTERIOR-DESIGN (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ed121e29-39f7-50ef-a36b-5547984cd477', 'interior-design', 'Revenue Leak', 'interior-design.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e6c1b2c3-7170-571d-bf14-0aeebf41578e', 'interior-design', 'Revenue Leak', 'interior-design.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cc0a5993-15a5-5c4f-91c1-c550ce3324b2', 'interior-design', 'Revenue Leak', 'interior-design.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5bbcfdad-c05e-5779-b694-e365bcf7b43d', 'interior-design', 'Revenue Leak', 'interior-design.leak_04',
   'Furnishing markup below 20%', 'Compare wholesale cost to client billed price',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Furnishing markup >20%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare wholesale cost to client billed price', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2c5533f3-9a2c-564e-b888-a9604ec5d120', 'interior-design', 'Revenue Leak', 'interior-design.leak_05',
   'Project profitability below 30%', 'Track all-in project cost vs total client billing',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Project margin >30%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track all-in project cost vs total client billing', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for interior-design
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('interior-design', 'Does your billable utilization meet the target of Utilization >60%?', 1, 'ed121e29-39f7-50ef-a36b-5547984cd477')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('interior-design', 'Is your scope creep being billed?', 2, 'e6c1b2c3-7170-571d-bf14-0aeebf41578e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('interior-design', 'Does your furnishing markup meet the target of Furnishing markup >20%?', 3, '5bbcfdad-c05e-5779-b694-e365bcf7b43d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('interior-design', 'Does your client retention meet the target of Client retention >75%/yr?', 4, 'cc0a5993-15a5-5c4f-91c1-c550ce3324b2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('interior-design', 'Does your project profitability meet the target of Project margin >30%?', 5, '2c5533f3-9a2c-564e-b888-a9604ec5d120')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== IT-SERVICES (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('312d1f59-a26e-51cb-a236-0c82b453fc08', 'it-services', 'Revenue Leak', 'it-services.leak_01',
   'Billable utilization below 65%', 'Track billable hours per tech',
   75.00, 'critical', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Utilization >65%. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Track billable hours per tech', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f9c49c47-b8f3-5f56-ab74-2eee088238ca', 'it-services', 'Operational Leak', 'it-services.leak_02',
   'Ticket resolution time above SLA', 'Track ticket response and resolution times vs SLA',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: First response <1hr, resolution <4hr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track ticket response and resolution times vs SLA', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('56e1d7ab-13c7-58c4-8f28-a0098bf5fc84', 'it-services', 'Revenue Leak', 'it-services.leak_03',
   'Managed service margin below 50%', 'Compare contract revenue to fully loaded service cost',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: MSP contracts >50% margin. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare contract revenue to fully loaded service cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2ab4ea66-62f3-501e-9d02-00af4f7541f8', 'it-services', 'Cost Leak', 'it-services.leak_04',
   'Tool/license cost above 12% of revenue', 'Audit IT tool and license subscriptions',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Tool cost <12% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Audit IT tool and license subscriptions', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('31b18667-d331-516b-896e-e056636adf3c', 'it-services', 'Revenue Leak', 'it-services.leak_05',
   'Client churn above 15%/yr', 'Track client departures and contract non-renewals',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Client churn <15%/yr. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track client departures and contract non-renewals', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for it-services
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('it-services', 'Does your billable utilization meet the target of Utilization >65%?', 1, '312d1f59-a26e-51cb-a236-0c82b453fc08')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('it-services', 'Does your managed service margin meet the target of MSP contracts >50% margin?', 2, '56e1d7ab-13c7-58c4-8f28-a0098bf5fc84')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('it-services', 'Is your ticket resolution time within target (First response <1hr, resolution <4hr)?', 3, 'f9c49c47-b8f3-5f56-ab74-2eee088238ca')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('it-services', 'Is your client churn within target (Client churn <15%/yr)?', 4, '31b18667-d331-516b-896e-e056636adf3c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('it-services', 'Is your tool/license cost within target (Tool cost <12% revenue)?', 5, '2ab4ea66-62f3-501e-9d02-00af4f7541f8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== JANITORIAL-COMMERCIAL (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8627c76c-6823-540b-87be-f933c98e2c5c', 'janitorial-commercial', 'Revenue Leak', 'janitorial-commercial.leak_01',
   'Revenue per sqft below market', 'Compare pricing per sqft to local market rates',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue >$0.15/sqft/month. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare pricing per sqft to local market rates', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('909ddd7f-22df-5620-a618-672560191fa3', 'janitorial-commercial', 'Cost Leak', 'janitorial-commercial.leak_02',
   'Labor cost above 55% of revenue', 'Track labor cost per contract',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Labor <55% revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track labor cost per contract', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('25269cf9-9702-55aa-a8fa-6e58ce98ad2b', 'janitorial-commercial', 'Revenue Leak', 'janitorial-commercial.leak_03',
   'Contract retention below 85%', 'Track contract renewals and cancellations',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Contract retention >85%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track contract renewals and cancellations', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0689a1a1-a5a3-551c-93d7-319805bd1ece', 'janitorial-commercial', 'Cost Leak', 'janitorial-commercial.leak_04',
   'Supply cost above 5% of revenue', 'Track supply spend per sqft serviced',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supply cost <5% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track supply spend per sqft serviced', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for janitorial-commercial
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('janitorial-commercial', 'Does your revenue per sqft meet the target of Revenue >$0.15/sqft/month?', 1, '8627c76c-6823-540b-87be-f933c98e2c5c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('janitorial-commercial', 'Is your labor cost within target (Labor <55% revenue)?', 2, '909ddd7f-22df-5620-a618-672560191fa3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('janitorial-commercial', 'Does your contract retention meet the target of Contract retention >85%/yr?', 3, '25269cf9-9702-55aa-a8fa-6e58ce98ad2b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('janitorial-commercial', 'Is your supply cost within target (Supply cost <5% revenue)?', 4, '0689a1a1-a5a3-551c-93d7-319805bd1ece')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== JEWELRY-STORE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('21afc002-675a-5f73-817b-b22abf358904', 'jewelry-store', 'Cost Leak', 'jewelry-store.leak_01',
   'Inventory age above 12 months', 'Track age of unsold pieces',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Avg inventory age <12 months. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track age of unsold pieces', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9bc19d57-b161-5a94-a40f-1b9df8d505e0', 'jewelry-store', 'Cost Leak', 'jewelry-store.leak_02',
   'Insurance cost above 2% of inventory value', 'Compare insurance premium to appraised inventory value',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Insurance <2% inventory value. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare insurance premium to appraised inventory value', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8b66b32b-3098-5851-a35a-5c10131ecd3e', 'jewelry-store', 'Revenue Leak', 'jewelry-store.leak_03',
   'Custom design margin below 50%', 'Track custom job revenue vs labor+material cost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Custom work margin >50%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track custom job revenue vs labor+material cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9ccc3e84-505e-520e-b3cc-de96366ff07e', 'jewelry-store', 'Revenue Leak', 'jewelry-store.leak_04',
   'Loss/theft rate above 0.5%', 'Compare inventory count to records monthly',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Shrinkage <0.5%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare inventory count to records monthly', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for jewelry-store
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('jewelry-store', 'Is your inventory age within target (Avg inventory age <12 months)?', 1, '21afc002-675a-5f73-817b-b22abf358904')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('jewelry-store', 'Is your loss/theft rate within target (Shrinkage <0.5%)?', 2, '9ccc3e84-505e-520e-b3cc-de96366ff07e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('jewelry-store', 'Does your custom design margin meet the target of Custom work margin >50%?', 3, '8b66b32b-3098-5851-a35a-5c10131ecd3e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('jewelry-store', 'Is your insurance cost within target (Insurance <2% inventory value)?', 4, '9bc19d57-b161-5a94-a40f-1b9df8d505e0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== LANDSCAPING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('89541bfc-b741-57c6-9fed-fe1a6118085a', 'landscaping', 'Cost Leak', 'landscaping.leak_01',
   'Labor cost above 45% of revenue', 'Track labor cost / revenue per job',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Labor <45% revenue. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track labor cost / revenue per job', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b2474f60-0540-5a2e-8f54-92b42fdf7982', 'landscaping', 'Cost Leak', 'landscaping.leak_02',
   'Equipment cost above 10% of revenue', 'Track equipment depreciation+maintenance vs revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Equipment <10% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track equipment depreciation+maintenance vs revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('020429e1-66e2-5125-8ac5-59c4c4b51244', 'landscaping', 'Cash Flow Leak', 'landscaping.leak_03',
   'Seasonal revenue gap not bridged', 'Compare monthly revenue to annual average',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Off-season revenue >30% of peak. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare monthly revenue to annual average', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('05ac19e5-1326-50a2-9bea-edf9c8eb8938', 'landscaping', 'Revenue Leak', 'landscaping.leak_04',
   'Material markup below 20%', 'Compare supplier cost to client billing for materials',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Material markup >20%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare supplier cost to client billing for materials', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for landscaping
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Is your labor cost within target (Labor <45% revenue)?', 1, '89541bfc-b741-57c6-9fed-fe1a6118085a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Is your seasonal revenue gap being bridged?', 2, '020429e1-66e2-5125-8ac5-59c4c4b51244')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Is your equipment cost within target (Equipment <10% revenue)?', 3, 'b2474f60-0540-5a2e-8f54-92b42fdf7982')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Does your material markup meet the target of Material markup >20%?', 4, '05ac19e5-1326-50a2-9bea-edf9c8eb8938')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== LAUNDROMAT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f64d101f-659d-5f55-8881-4981acbb5e19', 'laundromat', 'Revenue Leak', 'laundromat.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3c542d68-fa8b-5834-ad8c-7bd1b30bb4e5', 'laundromat', 'Cost Leak', 'laundromat.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bce025fb-def4-5c86-823b-4c6e47f7d813', 'laundromat', 'Cost Leak', 'laundromat.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9ce83676-98c5-5076-a4e3-51cdca78c7a8', 'laundromat', 'Operational Leak', 'laundromat.leak_04',
   'Machine uptime below 90%', 'Track machine downtime vs operating hours',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Machine uptime >90%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track machine downtime vs operating hours', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('21b776cf-e49e-5913-aa5d-e2f84ae982ec', 'laundromat', 'Cost Leak', 'laundromat.leak_05',
   'Utility cost above $1/wash', 'Track water+power cost per wash cycle',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Utility cost <$1/wash. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track water+power cost per wash cycle', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for laundromat
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('laundromat', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, 'f64d101f-659d-5f55-8881-4981acbb5e19')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('laundromat', 'Does your machine uptime meet the target of Machine uptime >90%?', 2, '9ce83676-98c5-5076-a4e3-51cdca78c7a8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('laundromat', 'Is your labor/operator cost within target (Labor <45% revenue)?', 3, '3c542d68-fa8b-5834-ad8c-7bd1b30bb4e5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('laundromat', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 4, 'bce025fb-def4-5c86-823b-4c6e47f7d813')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('laundromat', 'Is your utility cost within target (Utility cost <$1/wash)?', 5, '21b776cf-e49e-5913-aa5d-e2f84ae982ec')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== LAW-FIRM (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fd9ab80a-b6df-54a3-bf89-2ccc9af4d2fa', 'law-firm', 'Revenue Leak', 'law-firm.leak_01',
   'Realization rate below 85%', 'Compare billed amount to standard rate × hours',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Realization >85%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare billed amount to standard rate × hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('12e906eb-1592-567b-bd2d-7683976b7711', 'law-firm', 'Cash Flow Leak', 'law-firm.leak_02',
   'Collection rate below 90%', 'Track collected amount vs billed amount',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Collection rate >90%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track collected amount vs billed amount', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fa83fe1c-1397-5b9c-a36a-81076ae99961', 'law-firm', 'Cost Leak', 'law-firm.leak_03',
   'Overhead above 40%', 'Track rent, tech, admin, library as % of revenue',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Overhead <40% of revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track rent, tech, admin, library as % of revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('db1f8465-40a4-53d0-b3ce-bb42250a7fef', 'law-firm', 'Revenue Leak', 'law-firm.leak_04',
   'Leverage ratio suboptimal', 'Track revenue per partner and associate leverage',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Partner:associate ratio 1:3+. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track revenue per partner and associate leverage', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for law-firm
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law-firm', 'Does your realization rate meet the target of Realization >85%?', 1, 'fd9ab80a-b6df-54a3-bf89-2ccc9af4d2fa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law-firm', 'Does your collection rate meet the target of Collection rate >90%?', 2, '12e906eb-1592-567b-bd2d-7683976b7711')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law-firm', 'Is your overhead within target (Overhead <40% of revenue)?', 3, 'fa83fe1c-1397-5b9c-a36a-81076ae99961')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law-firm', 'Do you regularly track revenue per partner and associate leverage?', 4, 'db1f8465-40a4-53d0-b3ce-bb42250a7fef')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== LIQUOR-STORE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c33884bc-adb2-5ef5-9689-ecc0237c3b2a', 'liquor-store', 'Revenue Leak', 'liquor-store.leak_01',
   'Margin by category below benchmark', 'Compare margin by category to industry benchmarks',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Spirits >25%, Wine >30%, Beer >22%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare margin by category to industry benchmarks', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ea8a0b46-6f25-5683-9d81-11f1a8765ca4', 'liquor-store', 'Revenue Leak', 'liquor-store.leak_02',
   'Shrinkage/theft above 2%', 'Compare inventory counts to POS sales monthly',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Shrinkage <1.5%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare inventory counts to POS sales monthly', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f53cefab-bf4a-5208-8de8-493233b18205', 'liquor-store', 'Cost Leak', 'liquor-store.leak_03',
   'Inventory turnover below norm', 'Track inventory age by category and flag slow movers',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Turns >8x/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track inventory age by category and flag slow movers', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3c6a0fa0-0033-5dca-9bb3-5e42ddd1b362', 'liquor-store', 'Compliance Leak', 'liquor-store.leak_04',
   'Compliance cost not minimized', 'Audit license fees and compliance costs vs requirements',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: License/compliance <2% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Audit license fees and compliance costs vs requirements', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for liquor-store
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('liquor-store', 'Does your margin by category meet the target of Spirits >25%, Wine >30%, Beer >22%?', 1, 'c33884bc-adb2-5ef5-9689-ecc0237c3b2a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('liquor-store', 'Is your shrinkage/theft within target (Shrinkage <1.5%)?', 2, 'ea8a0b46-6f25-5683-9d81-11f1a8765ca4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('liquor-store', 'Does your inventory turnover meet the target of Turns >8x/yr?', 3, 'f53cefab-bf4a-5208-8de8-493233b18205')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('liquor-store', 'Is your compliance cost being minimized?', 4, '3c6a0fa0-0033-5dca-9bb3-5e42ddd1b362')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== LOCKSMITH (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('56fd6e4c-6824-5f13-87b7-7380b9845929', 'locksmith', 'Revenue Leak', 'locksmith.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1a28302f-db88-5bb3-9e85-154f5a2c3259', 'locksmith', 'Cost Leak', 'locksmith.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6b7b2c48-23c9-571a-9111-ddf7b36e01a7', 'locksmith', 'Cost Leak', 'locksmith.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for locksmith
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('locksmith', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, '56fd6e4c-6824-5f13-87b7-7380b9845929')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('locksmith', 'Is your labor/operator cost within target (Labor <45% revenue)?', 2, '1a28302f-db88-5bb3-9e85-154f5a2c3259')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('locksmith', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 3, '6b7b2c48-23c9-571a-9111-ddf7b36e01a7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MANAGED-SERVICE-PROVIDER (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b6ab11cd-ef7a-5dca-84ce-1349d3343826', 'managed-service-provider', 'Revenue Leak', 'managed-service-provider.leak_01',
   'Recurring revenue margin below 50%', 'Compare MSP contract revenue to fully loaded service cost',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: MSP margin >50%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare MSP contract revenue to fully loaded service cost', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('17f940c7-0b30-5912-bd5a-bc86e849757a', 'managed-service-provider', 'Cost Leak', 'managed-service-provider.leak_02',
   'Ticket volume per client above SLA', 'Track support tickets per client vs contract scope',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Tickets/client/month tracked. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track support tickets per client vs contract scope', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e748a669-528d-5c22-bdaf-a803e91eaba3', 'managed-service-provider', 'Cost Leak', 'managed-service-provider.leak_03',
   'Tool stack cost above 15% of MRR', 'Audit RMM/PSA/security tool costs per endpoint',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Tool cost <15% MRR. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Audit RMM/PSA/security tool costs per endpoint', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b8eb886d-1a00-503a-8eaf-88d531da3161', 'managed-service-provider', 'Revenue Leak', 'managed-service-provider.leak_04',
   'Client churn above 10%/yr', 'Track MRR churn and expansion revenue',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Client churn <10%/yr. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track MRR churn and expansion revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('41d078cb-b8b4-57d0-a198-cd40b349602a', 'managed-service-provider', 'Cost Leak', 'managed-service-provider.leak_05',
   'SLA breach penalty cost', 'Track SLA breaches and associated credits/penalties',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: SLA compliance >99%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track SLA breaches and associated credits/penalties', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for managed-service-provider
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('managed-service-provider', 'Does your recurring revenue margin meet the target of MSP margin >50%?', 1, 'b6ab11cd-ef7a-5dca-84ce-1349d3343826')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('managed-service-provider', 'Is your client churn within target (Client churn <10%/yr)?', 2, 'b8eb886d-1a00-503a-8eaf-88d531da3161')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('managed-service-provider', 'Is your ticket volume per client within target (Tickets/client/month tracked)?', 3, '17f940c7-0b30-5912-bd5a-bc86e849757a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('managed-service-provider', 'Are you fully up to date on all compliance requirements?', 4, '41d078cb-b8b4-57d0-a198-cd40b349602a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('managed-service-provider', 'Is your tool stack cost within target (Tool cost <15% MRR)?', 5, 'e748a669-528d-5c22-bdaf-a803e91eaba3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MANUFACTURING (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('25675dbc-07cc-56da-9bef-8e32ce624302', 'manufacturing', 'Cost Leak', 'manufacturing.leak_01',
   'Scrap/rework rate above 3%', 'Track defective units / total units produced',
   75.00, 'critical', 'fixed_range', 5000.00, 75000.00,
   'Benchmark: Scrap rate <3%. Impact: $5,000–$75,000/year.',
   'Industry benchmark data', 'Track defective units / total units produced', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('73a4189b-6f01-5552-abaa-887630782419', 'manufacturing', 'Operational Leak', 'manufacturing.leak_02',
   'Machine downtime unplanned', 'Track unplanned downtime hours vs total available hours',
   75.00, 'critical', 'fixed_range', 10000.00, 100000.00,
   'Benchmark: OEE >85%. Impact: $10,000–$100,000/year.',
   'Industry benchmark data', 'Track unplanned downtime hours vs total available hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3dbee44b-d80f-5b03-8280-712932cc137a', 'manufacturing', 'Cost Leak', 'manufacturing.leak_03',
   'Inventory carrying cost excessive', 'Calculate storage, insurance, obsolescence cost per unit',
   75.00, 'high', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Carrying cost <25% of inventory value. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Calculate storage, insurance, obsolescence cost per unit', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9d1848a3-14c0-5681-b9ee-0bc0dae48bf5', 'manufacturing', 'Cost Leak', 'manufacturing.leak_04',
   'Energy cost per unit above benchmark', 'Compare kWh per unit produced to industry benchmark',
   75.00, 'high', 'fixed_range', 3000.00, 40000.00,
   'Benchmark: Energy <5% of COGS. Impact: $3,000–$40,000/year.',
   'Industry benchmark data', 'Compare kWh per unit produced to industry benchmark', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('abe891e7-c731-5dca-a791-208f7eeb3ff7', 'manufacturing', 'Cash Flow Leak', 'manufacturing.leak_05',
   'AR days above 45', 'Track average collection period by customer',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: AR days <45. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track average collection period by customer', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9e60657c-7c98-5aa4-919f-0cfbfd630b18', 'manufacturing', 'Cost Leak', 'manufacturing.leak_06',
   'Raw material price premium', 'Compare actual purchase price vs market/index price',
   75.00, 'high', 'fixed_range', 3000.00, 40000.00,
   'Benchmark: Competitive bid 3+ suppliers quarterly. Impact: $3,000–$40,000/year.',
   'Industry benchmark data', 'Compare actual purchase price vs market/index price', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for manufacturing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Is your machine downtime unplanned at target (OEE >85%)?', 1, '73a4189b-6f01-5552-abaa-887630782419')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Is your scrap/rework rate within target (Scrap rate <3%)?', 2, '25675dbc-07cc-56da-9bef-8e32ce624302')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Do you calculate storage, insurance, obsolescence cost per unit?', 3, '3dbee44b-d80f-5b03-8280-712932cc137a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Is your energy cost per unit within target (Energy <5% of COGS)?', 4, '9d1848a3-14c0-5681-b9ee-0bc0dae48bf5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Do you regularly compare actual purchase price vs market/index price?', 5, '9e60657c-7c98-5aa4-919f-0cfbfd630b18')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Is your ar days within target (AR days <45)?', 6, 'abe891e7-c731-5dca-a791-208f7eeb3ff7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MARKETING-CONSULTANT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('72b592fc-2e17-55ca-b0f2-ea14d1f69f8b', 'marketing-consultant', 'Revenue Leak', 'marketing-consultant.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c4c4ab76-4e4d-510c-98b2-8395c0bf6174', 'marketing-consultant', 'Revenue Leak', 'marketing-consultant.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('292591fd-1c61-538a-a8e8-63428947502d', 'marketing-consultant', 'Revenue Leak', 'marketing-consultant.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bdb5945c-73e8-5d09-b920-b1cda2bb24b2', 'marketing-consultant', 'Cost Leak', 'marketing-consultant.leak_04',
   'Tool cost above 8% of revenue', 'Audit marketing tool subscriptions',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Tool cost <8% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Audit marketing tool subscriptions', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d62b1e1e-9153-5f61-b0f8-8adca793a22b', 'marketing-consultant', 'Revenue Leak', 'marketing-consultant.leak_05',
   'Campaign results not driving retention', 'Track client tenure vs reported campaign ROI',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Link results to client retention. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client tenure vs reported campaign ROI', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for marketing-consultant
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('marketing-consultant', 'Does your billable utilization meet the target of Utilization >60%?', 1, '72b592fc-2e17-55ca-b0f2-ea14d1f69f8b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('marketing-consultant', 'Is your scope creep being billed?', 2, 'c4c4ab76-4e4d-510c-98b2-8395c0bf6174')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('marketing-consultant', 'Does your client retention meet the target of Client retention >75%/yr?', 3, '292591fd-1c61-538a-a8e8-63428947502d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('marketing-consultant', 'Is your campaign results being driving retention?', 4, 'd62b1e1e-9153-5f61-b0f8-8adca793a22b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('marketing-consultant', 'Is your tool cost within target (Tool cost <8% revenue)?', 5, 'bdb5945c-73e8-5d09-b920-b1cda2bb24b2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MARTIAL-ARTS (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0ced3efe-6122-56d0-85e5-93b52aff3fb8', 'martial-arts', 'Revenue Leak', 'martial-arts.leak_01',
   'Student retention below 70%', 'Track student tenure and belt progression',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Student retention >70%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track student tenure and belt progression', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1a269d90-72dd-5987-ae15-c59db571c605', 'martial-arts', 'Operational Leak', 'martial-arts.leak_02',
   'Class fill rate below 60%', 'Track attendees per class vs capacity',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Class fill rate >60%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track attendees per class vs capacity', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('02f72201-860f-59a6-96b0-0a3bc9e3042d', 'martial-arts', 'Revenue Leak', 'martial-arts.leak_03',
   'Equipment/uniform revenue below 10%', 'Track uniform, gear, test fees as % of total',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Equipment sales >10% revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track uniform, gear, test fees as % of total', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for martial-arts
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('martial-arts', 'Does your student retention meet the target of Student retention >70%/yr?', 1, '0ced3efe-6122-56d0-85e5-93b52aff3fb8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('martial-arts', 'Does your class fill rate meet the target of Class fill rate >60%?', 2, '1a269d90-72dd-5987-ae15-c59db571c605')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('martial-arts', 'Does your equipment/uniform revenue meet the target of Equipment sales >10% revenue?', 3, '02f72201-860f-59a6-96b0-0a3bc9e3042d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MASSAGE-THERAPY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('89272437-b2ba-5cb9-8a8d-ba4d58b841fb', 'massage-therapy', 'Revenue Leak', 'massage-therapy.leak_01',
   'Therapist utilization below 75%', 'Track booked hours vs available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Utilization >75%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track booked hours vs available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4c16acb9-e9a8-5f26-84c2-a48736699922', 'massage-therapy', 'Revenue Leak', 'massage-therapy.leak_02',
   'No-show rate above 10%', 'Track no-shows and late cancellations',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: No-show rate <10%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track no-shows and late cancellations', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5c1f6c9a-b2e0-5f01-b005-708bbf02d8da', 'massage-therapy', 'Revenue Leak', 'massage-therapy.leak_03',
   'Rebooking rate below 50%', 'Track clients who rebook at checkout',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Rebooking rate >50%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track clients who rebook at checkout', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7c9bfb74-b980-5764-8870-ecffa85e6e73', 'massage-therapy', 'Revenue Leak', 'massage-therapy.leak_04',
   'Product retail revenue below 5%', 'Track product sales as % of total',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Retail >5% of revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track product sales as % of total', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for massage-therapy
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('massage-therapy', 'Does your therapist utilization meet the target of Utilization >75%?', 1, '89272437-b2ba-5cb9-8a8d-ba4d58b841fb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('massage-therapy', 'Does your rebooking rate meet the target of Rebooking rate >50%?', 2, '5c1f6c9a-b2e0-5f01-b005-708bbf02d8da')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('massage-therapy', 'Is your no-show rate within target (No-show rate <10%)?', 3, '4c16acb9-e9a8-5f26-84c2-a48736699922')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('massage-therapy', 'Does your product retail revenue meet the target of Retail >5% of revenue?', 4, '7c9bfb74-b980-5764-8870-ecffa85e6e73')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MEDIA-PRODUCTION (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('665b6e81-b724-59c7-8c7e-afeb2c19a87c', 'media-production', 'Revenue Leak', 'media-production.leak_01',
   'Project profitability below target', 'Compare project revenue to all-in cost per project',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Project margin >30%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare project revenue to all-in cost per project', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bca935d4-0faa-51e3-9fa2-dd297683aad1', 'media-production', 'Cost Leak', 'media-production.leak_02',
   'Equipment utilization below 60%', 'Track equipment booking days vs available days',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Equipment utilization >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track equipment booking days vs available days', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('244e85d2-b2db-5f42-a262-0d2d8a717734', 'media-production', 'Cost Leak', 'media-production.leak_03',
   'Revision cycles exceeding scope', 'Track revision rounds vs contracted allowance',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revisions within contract scope. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track revision rounds vs contracted allowance', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for media-production
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('media-production', 'Does your project profitability meet the target of Project margin >30%?', 1, '665b6e81-b724-59c7-8c7e-afeb2c19a87c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('media-production', 'Does your equipment utilization meet the target of Equipment utilization >60%?', 2, 'bca935d4-0faa-51e3-9fa2-dd297683aad1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('media-production', 'Do you regularly track revision rounds vs contracted allowance?', 3, '244e85d2-b2db-5f42-a262-0d2d8a717734')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MEDICAL-LAB (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d0fc5c1a-100a-5e40-8761-b5178e08c448', 'medical-lab', 'Revenue Leak', 'medical-lab.leak_01',
   'Revenue per test below benchmark', 'Compare average revenue per test to fee schedule',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue/test at market rate. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare average revenue per test to fee schedule', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('556efd5a-953c-5b92-98c1-b11cfbb5df65', 'medical-lab', 'Operational Leak', 'medical-lab.leak_02',
   'Turnaround time above SLA', 'Track % of tests meeting turnaround targets',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: TAT within contracted SLA. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track % of tests meeting turnaround targets', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('65383e2d-a0a6-5737-9933-6597795e7280', 'medical-lab', 'Cost Leak', 'medical-lab.leak_03',
   'Reagent cost above benchmark', 'Track reagent cost per test vs manufacturer spec',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Reagent cost <25% of test revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track reagent cost per test vs manufacturer spec', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for medical-lab
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-lab', 'Does your revenue per test meet the target of Revenue/test at market rate?', 1, 'd0fc5c1a-100a-5e40-8761-b5178e08c448')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-lab', 'Is your turnaround time within target (TAT within contracted SLA)?', 2, '556efd5a-953c-5b92-98c1-b11cfbb5df65')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-lab', 'Is your reagent cost within target (Reagent cost <25% of test revenue)?', 3, '65383e2d-a0a6-5737-9933-6597795e7280')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MEDICAL-SPA (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('60df0282-ad25-584a-b412-1570a5a950f0', 'medical-spa', 'Revenue Leak', 'medical-spa.leak_01',
   'Provider utilization below 75%', 'Track treatment hours vs available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Provider utilization >75%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track treatment hours vs available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e732b6ce-e11b-5143-9968-ccda4aa7e001', 'medical-spa', 'Revenue Leak', 'medical-spa.leak_02',
   'Product margin below 60%', 'Compare product/injectible cost to patient billing',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Product margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare product/injectible cost to patient billing', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f9f182d1-ba88-506f-a037-b2dc4e397e16', 'medical-spa', 'Revenue Leak', 'medical-spa.leak_03',
   'Rebooking rate below 50%', 'Track clients rebooking at checkout',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Rebooking rate >50%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track clients rebooking at checkout', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d32bd8b2-ab7b-53aa-9499-3fe0cc24e98d', 'medical-spa', 'Cost Leak', 'medical-spa.leak_04',
   'Consumable cost above 20% of revenue', 'Track consumable cost per treatment vs billing',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Consumables <20% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track consumable cost per treatment vs billing', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for medical-spa
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-spa', 'Does your provider utilization meet the target of Provider utilization >75%?', 1, '60df0282-ad25-584a-b412-1570a5a950f0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-spa', 'Does your product margin meet the target of Product margin >60%?', 2, 'e732b6ce-e11b-5143-9968-ccda4aa7e001')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-spa', 'Does your rebooking rate meet the target of Rebooking rate >50%?', 3, 'f9f182d1-ba88-506f-a037-b2dc4e397e16')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical-spa', 'Is your consumable cost within target (Consumables <20% revenue)?', 4, 'd32bd8b2-ab7b-53aa-9499-3fe0cc24e98d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MENTAL-HEALTH (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f8d312f0-f2a6-56c3-89e2-24e60846743e', 'mental-health', 'Revenue Leak', 'mental-health.leak_01',
   'No-show rate above 15%', 'Track no-shows and late cancellations with revenue lost',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: No-show rate <15%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track no-shows and late cancellations with revenue lost', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2ac99383-1efe-53cf-ad3f-9fa01a6df831', 'mental-health', 'Revenue Leak', 'mental-health.leak_02',
   'Insurance reimbursement below allowed', 'Compare paid vs allowed by CPT/payer',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Audit underpayments monthly. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare paid vs allowed by CPT/payer', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b471ef89-7ff4-5ee8-a6b2-268f2a50dbb9', 'mental-health', 'Revenue Leak', 'mental-health.leak_03',
   'Session volume below capacity', 'Track sessions per clinician per week',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Sessions >25/wk per therapist. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track sessions per clinician per week', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e04d0bfc-4f00-5d82-91ab-4911993931d6', 'mental-health', 'Cost Leak', 'mental-health.leak_04',
   'Admin cost above 20% of revenue', 'Track admin staff and billing costs as % of revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Admin <20% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track admin staff and billing costs as % of revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b6118e15-c9c1-5d82-bf17-0aa9a06b5913', 'mental-health', 'Revenue Leak', 'mental-health.leak_05',
   'Patient retention below 8 sessions', 'Track average sessions per patient before dropout',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Avg patient tenure >8 sessions. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track average sessions per patient before dropout', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for mental-health
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mental-health', 'Is your no-show rate within target (No-show rate <15%)?', 1, 'f8d312f0-f2a6-56c3-89e2-24e60846743e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mental-health', 'Does your insurance reimbursement meet the target of Audit underpayments monthly?', 2, '2ac99383-1efe-53cf-ad3f-9fa01a6df831')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mental-health', 'Does your session volume meet the target of Sessions >25/wk per therapist?', 3, 'b471ef89-7ff4-5ee8-a6b2-268f2a50dbb9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mental-health', 'Is your admin cost within target (Admin <20% revenue)?', 4, 'e04d0bfc-4f00-5d82-91ab-4911993931d6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mental-health', 'Does your patient retention meet the target of Avg patient tenure >8 sessions?', 5, 'b6118e15-c9c1-5d82-bf17-0aa9a06b5913')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== METAL-FABRICATION (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1689ae86-d504-55d8-aa8a-6524d58d418c', 'metal-fabrication', 'Cost Leak', 'metal-fabrication.leak_01',
   'Material yield below 85%', 'Compare raw material weight to finished part weight',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Material yield >85%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare raw material weight to finished part weight', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c15f3a68-f8a6-5317-afc8-cdcd2b4aa94d', 'metal-fabrication', 'Cost Leak', 'metal-fabrication.leak_02',
   'Welding rework rate above 3%', 'Track weld inspection failures and rework hours',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Weld reject rate <3%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track weld inspection failures and rework hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('61145f69-f8aa-5921-a83e-28e8c5814a40', 'metal-fabrication', 'Operational Leak', 'metal-fabrication.leak_03',
   'Machine utilization below benchmark', 'Track spindle time vs available machine hours',
   75.00, 'high', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: CNC utilization >75%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track spindle time vs available machine hours', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9b979738-e197-5c8e-a4bd-8e16ca770f69', 'metal-fabrication', 'Revenue Leak', 'metal-fabrication.leak_04',
   'Scrap metal revenue uncaptured', 'Compare scrap volume sold to scrap generated',
   75.00, 'medium', 'fixed_range', 1000.00, 15000.00,
   'Benchmark: Sell scrap at market rate. Impact: $1,000–$15,000/year.',
   'Industry benchmark data', 'Compare scrap volume sold to scrap generated', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('952d6700-b3dc-54c6-93ea-93eb3727923c', 'metal-fabrication', 'Cost Leak', 'metal-fabrication.leak_05',
   'Tooling cost per part above norm', 'Track tool life and replacement cost per part run',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Tooling <5% of part cost. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track tool life and replacement cost per part run', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for metal-fabrication
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('metal-fabrication', 'Does your material yield meet the target of Material yield >85%?', 1, '1689ae86-d504-55d8-aa8a-6524d58d418c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('metal-fabrication', 'Does your machine utilization meet the target of CNC utilization >75%?', 2, '61145f69-f8aa-5921-a83e-28e8c5814a40')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('metal-fabrication', 'Is your welding rework rate within target (Weld reject rate <3%)?', 3, 'c15f3a68-f8a6-5317-afc8-cdcd2b4aa94d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('metal-fabrication', 'Is your tooling cost per part within target (Tooling <5% of part cost)?', 4, '952d6700-b3dc-54c6-93ea-93eb3727923c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('metal-fabrication', 'Do you track scrap metal revenue uncaptured and keep it within target (Sell scrap at market rate)?', 5, '9b979738-e197-5c8e-a4bd-8e16ca770f69')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MINING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e039b95d-bc8b-50dc-9551-5c092ad03812', 'mining', 'Cost Leak', 'mining.leak_01',
   'Extraction cost per ton above benchmark', 'Compare all-in sustaining cost per ton to peers',
   75.00, 'high', 'fixed_range', 10000.00, 100000.00,
   'Benchmark: Varies by mineral. Impact: $10,000–$100,000/year.',
   'Industry benchmark data', 'Compare all-in sustaining cost per ton to peers', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c819854e-9cdf-543d-b501-55d63641d71a', 'mining', 'Operational Leak', 'mining.leak_02',
   'Equipment downtime excessive', 'Track planned vs unplanned downtime per asset',
   75.00, 'critical', 'fixed_range', 10000.00, 75000.00,
   'Benchmark: Availability >85%. Impact: $10,000–$75,000/year.',
   'Industry benchmark data', 'Track planned vs unplanned downtime per asset', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('298985ab-1ec2-5da7-963b-2e19ecd30552', 'mining', 'Compliance Leak', 'mining.leak_03',
   'Safety incident cost', 'Compare total recordable incident rate to industry avg',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: TRIR <2.0. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Compare total recordable incident rate to industry avg', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('961bb773-7029-5223-bd9f-d01c03b32f61', 'mining', 'Compliance Leak', 'mining.leak_04',
   'Permit/compliance cost bloat', 'Audit permit costs vs regulatory minimums',
   75.00, 'high', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Compliance <5% revenue. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Audit permit costs vs regulatory minimums', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for mining
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mining', 'Do you regularly compare total recordable incident rate to industry avg?', 1, '298985ab-1ec2-5da7-963b-2e19ecd30552')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mining', 'Is your equipment downtime excessive at target (Availability >85%)?', 2, 'c819854e-9cdf-543d-b501-55d63641d71a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mining', 'Is your extraction cost per ton within target (Varies by mineral)?', 3, 'e039b95d-bc8b-50dc-9551-5c092ad03812')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mining', 'Are you fully up to date on all compliance requirements?', 4, '961bb773-7029-5223-bd9f-d01c03b32f61')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MORTGAGE-BROKER (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d4899900-c221-5521-8fb1-3920606228ef', 'mortgage-broker', 'Revenue Leak', 'mortgage-broker.leak_01',
   'Close rate below 40%', 'Track applications submitted vs closed and funded',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Close rate >40%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track applications submitted vs closed and funded', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('782c1b9a-d3a7-589a-9a36-4b3d8ec677d7', 'mortgage-broker', 'Revenue Leak', 'mortgage-broker.leak_02',
   'Revenue per file below market', 'Compare revenue per funded deal to market average',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue/file >$3,000. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare revenue per funded deal to market average', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5ac04d90-3d60-5969-86ed-18498140872e', 'mortgage-broker', 'Compliance Leak', 'mortgage-broker.leak_03',
   'Compliance cost above 5% of revenue', 'Audit licensing, audit, and compliance tool costs',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Compliance <5% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Audit licensing, audit, and compliance tool costs', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e53bf865-c6ab-5980-9841-53460410ebda', 'mortgage-broker', 'Operational Leak', 'mortgage-broker.leak_04',
   'Processing time above 30 days', 'Track days from app to funding by product type',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Application to close <30 days. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track days from app to funding by product type', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for mortgage-broker
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mortgage-broker', 'Does your close rate meet the target of Close rate >40%?', 1, 'd4899900-c221-5521-8fb1-3920606228ef')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mortgage-broker', 'Does your revenue per file meet the target of Revenue/file >$3,000?', 2, '782c1b9a-d3a7-589a-9a36-4b3d8ec677d7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mortgage-broker', 'Is your compliance cost within target (Compliance <5% revenue)?', 3, '5ac04d90-3d60-5969-86ed-18498140872e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('mortgage-broker', 'Is your processing time within target (Application to close <30 days)?', 4, 'e53bf865-c6ab-5980-9841-53460410ebda')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MOVING-COMPANY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('854376c7-93ca-5733-8346-4e9000766e05', 'moving-company', 'Revenue Leak', 'moving-company.leak_01',
   'Revenue per truck per day below target', 'Track daily revenue per truck in service',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue >$1500/truck/day. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track daily revenue per truck in service', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('aa549685-ef8b-5fc3-b680-3e20671c854c', 'moving-company', 'Cost Leak', 'moving-company.leak_02',
   'Damage claim rate above 2%', 'Track damage claims as % of total moves completed',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Damage claims <2% of moves. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track damage claims as % of total moves completed', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4bb66c50-8414-564b-aba0-9f5cc850e771', 'moving-company', 'Revenue Leak', 'moving-company.leak_03',
   'Quote accuracy below 85%', 'Compare quoted price to actual billed amount per job',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Quote accuracy >85%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare quoted price to actual billed amount per job', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cbbc48cf-9dc7-531e-86c5-268c3b317651', 'moving-company', 'Operational Leak', 'moving-company.leak_04',
   'Seasonal underutilization', 'Compare monthly revenue distribution',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Off-season revenue >50% of peak. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare monthly revenue distribution', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for moving-company
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving-company', 'Does your revenue per truck per day meet the target of Revenue >$1500/truck/day?', 1, '854376c7-93ca-5733-8346-4e9000766e05')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving-company', 'Is your damage claim rate within target (Damage claims <2% of moves)?', 2, 'aa549685-ef8b-5fc3-b680-3e20671c854c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving-company', 'Is your seasonal underutilization at target (Off-season revenue >50% of peak)?', 3, 'cbbc48cf-9dc7-531e-86c5-268c3b317651')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving-company', 'Does your quote accuracy meet the target of Quote accuracy >85%?', 4, '4bb66c50-8414-564b-aba0-9f5cc850e771')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== MUSIC-SCHOOL (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('595d8380-e60c-5368-8a0a-b45ffd85be8e', 'music-school', 'Revenue Leak', 'music-school.leak_01',
   'Student retention below 75%', 'Track student re-enrollment rate',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Student retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track student re-enrollment rate', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('76c8d7f7-fcc3-5aef-a0fa-bd6e20726c32', 'music-school', 'Operational Leak', 'music-school.leak_02',
   'Class/room utilization below 70%', 'Compare scheduled classes to available room-hours',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Room utilization >70%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare scheduled classes to available room-hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c1c13524-1f3f-5c9c-98ed-2cd8ca5c5962', 'music-school', 'Cost Leak', 'music-school.leak_03',
   'Teacher cost above 45% of revenue', 'Track instructor pay as % of tuition revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Teacher cost <45% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track instructor pay as % of tuition revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for music-school
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('music-school', 'Does your student retention meet the target of Student retention >75%/yr?', 1, '595d8380-e60c-5368-8a0a-b45ffd85be8e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('music-school', 'Is your teacher cost within target (Teacher cost <45% revenue)?', 2, 'c1c13524-1f3f-5c9c-98ed-2cd8ca5c5962')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('music-school', 'Does your class/room utilization meet the target of Room utilization >70%?', 3, '76c8d7f7-fcc3-5aef-a0fa-bd6e20726c32')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== NAIL-SALON (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f32adb25-9ecb-5cbb-b7ca-dafc86873e2c', 'nail-salon', 'Revenue Leak', 'nail-salon.leak_01',
   'Revenue per station below $250/day', 'Track daily revenue per active station',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Revenue >$250/station/day. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track daily revenue per active station', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('87eb398e-f830-598d-8c9e-bd9d1117062f', 'nail-salon', 'Cost Leak', 'nail-salon.leak_02',
   'Product/supply waste above 10%', 'Track product usage per service vs purchased volume',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Supply waste <10%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track product usage per service vs purchased volume', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c77463c3-72d4-5047-aea6-80f907e56b6c', 'nail-salon', 'Compliance Leak', 'nail-salon.leak_03',
   'Health compliance cost above 3%', 'Audit sanitation/health compliance costs',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Compliance <3% revenue. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Audit sanitation/health compliance costs', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9475f043-8222-5f29-aabb-90ab11ebfb0e', 'nail-salon', 'Cost Leak', 'nail-salon.leak_04',
   'Technician cost above 50% of revenue', 'Track technician compensation as % of their service revenue',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Tech cost <50% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track technician compensation as % of their service revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for nail-salon
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nail-salon', 'Does your revenue per station meet the target of Revenue >$250/station/day?', 1, 'f32adb25-9ecb-5cbb-b7ca-dafc86873e2c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nail-salon', 'Is your technician cost within target (Tech cost <50% revenue)?', 2, '9475f043-8222-5f29-aabb-90ab11ebfb0e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nail-salon', 'Is your product/supply waste within target (Supply waste <10%)?', 3, '87eb398e-f830-598d-8c9e-bd9d1117062f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nail-salon', 'Is your health compliance cost within target (Compliance <3% revenue)?', 4, 'c77463c3-72d4-5047-aea6-80f907e56b6c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== NONPROFIT (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4cf1db83-0109-520d-ba61-fc72fdd4bfb0', 'nonprofit', 'Cost Leak', 'nonprofit.leak_01',
   'Admin cost above 25%', 'Track admin costs as % of total spending',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Admin <25% of total expenses. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track admin costs as % of total spending', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('58778f41-91a9-5fe3-ad4a-3f14d899db35', 'nonprofit', 'Cost Leak', 'nonprofit.leak_02',
   'Fundraising cost above 20%', 'Track fundraising expense / dollars raised',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Fundraising cost <20% of donations. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track fundraising expense / dollars raised', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('26392601-50ad-576a-943d-3943c9a30729', 'nonprofit', 'Revenue Leak', 'nonprofit.leak_03',
   'Donor retention below 45%', 'Track year-over-year donor retention rate',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Donor retention >45%/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track year-over-year donor retention rate', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for nonprofit
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Is your admin cost within target (Admin <25% of total expenses)?', 1, '4cf1db83-0109-520d-ba61-fc72fdd4bfb0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Does your donor retention meet the target of Donor retention >45%/yr?', 2, '26392601-50ad-576a-943d-3943c9a30729')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Is your fundraising cost within target (Fundraising cost <20% of donations)?', 3, '58778f41-91a9-5fe3-ad4a-3f14d899db35')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== OIL-GAS (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c2fbcec-52c2-5314-aab8-9e5e397350c9', 'oil-gas', 'Cost Leak', 'oil-gas.leak_01',
   'Lifting cost per barrel above peers', 'Compare operating cost per BOE to basin average',
   75.00, 'critical', 'fixed_range', 10000.00, 200000.00,
   'Benchmark: Varies by basin. Impact: $10,000–$200,000/year.',
   'Industry benchmark data', 'Compare operating cost per BOE to basin average', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f622f023-c1fb-51e5-adb6-3747c8bbc42f', 'oil-gas', 'Revenue Leak', 'oil-gas.leak_02',
   'Well productivity decline unmanaged', 'Compare production decline to expected type curve',
   75.00, 'critical', 'fixed_range', 20000.00, 300000.00,
   'Benchmark: Decline rate within type curve. Impact: $20,000–$300,000/year.',
   'Industry benchmark data', 'Compare production decline to expected type curve', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5c1cbdd4-40a1-56de-b6b6-73b8a88f0204', 'oil-gas', 'Compliance Leak', 'oil-gas.leak_03',
   'Royalty calculation errors', 'Reconcile royalty payments vs production volumes and prices',
   75.00, 'high', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Audit royalty deductions quarterly. Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Reconcile royalty payments vs production volumes and prices', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('66e07981-0c50-593d-81f3-5efd904ecb75', 'oil-gas', 'Cost Leak', 'oil-gas.leak_04',
   'Pipeline/transportation cost premium', 'Compare transport cost to midstream contract benchmarks',
   75.00, 'high', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Transport <$5/BOE. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare transport cost to midstream contract benchmarks', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for oil-gas
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('oil-gas', 'Do you regularly compare production decline to expected type curve?', 1, 'f622f023-c1fb-51e5-adb6-3747c8bbc42f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('oil-gas', 'Is your lifting cost per barrel within target (Varies by basin)?', 2, '6c2fbcec-52c2-5314-aab8-9e5e397350c9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('oil-gas', 'Do you reconcile royalty payments vs production volumes and prices?', 3, '5c1cbdd4-40a1-56de-b6b6-73b8a88f0204')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('oil-gas', 'Do you regularly compare transport cost to midstream contract benchmarks?', 4, '66e07981-0c50-593d-81f3-5efd904ecb75')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== OPTOMETRY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('31a8fd17-35d9-5767-8fe9-85d18ec34dfc', 'optometry', 'Revenue Leak', 'optometry.leak_01',
   'Optical capture rate below 60%', 'Track % of exam patients who buy glasses/contacts in-house',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Optical capture >60%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track % of exam patients who buy glasses/contacts in-house', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b353f2fc-b522-5cbd-bd80-ded3f6f41fa5', 'optometry', 'Revenue Leak', 'optometry.leak_02',
   'Frame/lens margin below 60%', 'Compare frame/lens cost to patient-billed price',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Frame margin >60%, Lens >70%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare frame/lens cost to patient-billed price', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('eb213297-dfc7-5635-b00c-2163eac65edd', 'optometry', 'Revenue Leak', 'optometry.leak_03',
   'Insurance reimbursement below allowed', 'Compare paid vs allowed by payer',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Audit underpayments quarterly. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare paid vs allowed by payer', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c07fda8a-0057-5a52-9eb3-64bdf0d69313', 'optometry', 'Revenue Leak', 'optometry.leak_04',
   'No-show rate above 10%', 'Track missed appointments',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: No-show rate <10%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track missed appointments', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for optometry
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('optometry', 'Does your optical capture rate meet the target of Optical capture >60%?', 1, '31a8fd17-35d9-5767-8fe9-85d18ec34dfc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('optometry', 'Does your frame/lens margin meet the target of Frame margin >60%, Lens >70%?', 2, 'b353f2fc-b522-5cbd-bd80-ded3f6f41fa5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('optometry', 'Does your insurance reimbursement meet the target of Audit underpayments quarterly?', 3, 'eb213297-dfc7-5635-b00c-2163eac65edd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('optometry', 'Is your no-show rate within target (No-show rate <10%)?', 4, 'c07fda8a-0057-5a52-9eb3-64bdf0d69313')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PAINTING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b4f833d3-6ac3-542b-a358-2c974dc90831', 'painting', 'Cost Leak', 'painting.leak_01',
   'Material waste above 15%', 'Compare gallons purchased vs sqft covered at rated coverage',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Paint waste <15%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare gallons purchased vs sqft covered at rated coverage', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('53d8f143-c5de-5171-810a-86ff453edff0', 'painting', 'Cost Leak', 'painting.leak_02',
   'Labor cost per sqft above benchmark', 'Track crew hours and area painted per job',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Interior: <$0.50/sqft labor. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track crew hours and area painted per job', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('591b59fa-0758-5f9f-bd99-d6f6dfa2fb95', 'painting', 'Cost Leak', 'painting.leak_03',
   'Callback/touch-up rate high', 'Track return visits within 30 days of job completion',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Touch-ups <5% of jobs. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track return visits within 30 days of job completion', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d6d44d2d-25c4-5bff-b048-afcb8ba1e486', 'painting', 'Cost Leak', 'painting.leak_04',
   'Equipment depreciation untracked', 'Amortize equipment cost across jobs and verify rates',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Sprayer/scaffold life: 3-5yrs. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Amortize equipment cost across jobs and verify rates', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0eb5d071-515c-5772-a8ed-d90b7c645377', 'painting', 'Operational Leak', 'painting.leak_05',
   'Crew utilization gap between jobs', 'Track idle days per crew per month',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Crew utilization >85%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track idle days per crew per month', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for painting
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('painting', 'Is your labor cost per sqft within target (Interior: <$0.50/sqft labor)?', 1, '53d8f143-c5de-5171-810a-86ff453edff0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('painting', 'Is your crew utilization gap between jobs at target (Crew utilization >85%)?', 2, '0eb5d071-515c-5772-a8ed-d90b7c645377')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('painting', 'Is your material waste within target (Paint waste <15%)?', 3, 'b4f833d3-6ac3-542b-a358-2c974dc90831')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('painting', 'Do you regularly track return visits within 30 days of job completion?', 4, '591b59fa-0758-5f9f-bd99-d6f6dfa2fb95')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('painting', 'Have you reviewed and optimized your equipment depreciation untracked with a tax professional?', 5, 'd6d44d2d-25c4-5bff-b048-afcb8ba1e486')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PEST-CONTROL (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4de3a8ba-e335-58a9-90ba-ae29dc6dc88e', 'pest-control', 'Revenue Leak', 'pest-control.leak_01',
   'Revenue per route per day below $1500', 'Track daily revenue per tech route',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Revenue >$1500/route/day. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track daily revenue per tech route', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a881949e-5cfa-51c7-b3dc-963c4285d98d', 'pest-control', 'Revenue Leak', 'pest-control.leak_02',
   'Customer retention below 80%', 'Track subscription renewal rate',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Customer retention >80%/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track subscription renewal rate', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c8515fab-ec1e-55b9-8109-5b51732c13d9', 'pest-control', 'Cost Leak', 'pest-control.leak_03',
   'Chemical cost above 8% of revenue', 'Track chemical/product cost per service',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Chemical cost <8% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track chemical/product cost per service', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a63d7097-398d-510c-af87-e8b5dbd0c1ce', 'pest-control', 'Cash Flow Leak', 'pest-control.leak_04',
   'Seasonal demand not smoothed', 'Compare recurring vs one-time revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Year-round contracts >60% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare recurring vs one-time revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d80dd0a8-2289-58e3-8fd8-f0b879d559ab', 'pest-control', 'Cost Leak', 'pest-control.leak_05',
   'Vehicle cost per route above $100/day', 'Track per-vehicle daily cost',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Vehicle cost <$100/route/day. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track per-vehicle daily cost', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for pest-control
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest-control', 'Does your revenue per route per day meet the target of Revenue >$1500/route/day?', 1, '4de3a8ba-e335-58a9-90ba-ae29dc6dc88e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest-control', 'Does your customer retention meet the target of Customer retention >80%/yr?', 2, 'a881949e-5cfa-51c7-b3dc-963c4285d98d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest-control', 'Is your seasonal demand being smoothed?', 3, 'a63d7097-398d-510c-af87-e8b5dbd0c1ce')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest-control', 'Is your chemical cost within target (Chemical cost <8% revenue)?', 4, 'c8515fab-ec1e-55b9-8109-5b51732c13d9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest-control', 'Is your vehicle cost per route within target (Vehicle cost <$100/route/day)?', 5, 'd80dd0a8-2289-58e3-8fd8-f0b879d559ab')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PET-STORE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1be30dbe-9c9f-5459-8471-a8e190693c50', 'pet-store', 'Revenue Leak', 'pet-store.leak_01',
   'Product margin below benchmark by category', 'Compare margin by category vs industry',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Food >25%, Supplies >40%, Live animals varies. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare margin by category vs industry', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6cc69243-4221-5bba-ace5-c50c1b44833d', 'pet-store', 'Revenue Leak', 'pet-store.leak_02',
   'Grooming revenue per visit low', 'Track average grooming ticket and upsell rate',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Grooming avg ticket >$50. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track average grooming ticket and upsell rate', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1df6ed13-a2a1-58da-92e7-06d696235e2e', 'pet-store', 'Cost Leak', 'pet-store.leak_03',
   'Inventory turns below norm', 'Track inventory turnover by category',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Turns >6x/yr. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track inventory turnover by category', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8ec85241-d8a3-58c9-ba5b-eace134c5264', 'pet-store', 'Revenue Leak', 'pet-store.leak_04',
   'Customer visit frequency not tracked', 'Track purchase frequency per customer',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Avg customer visits >12x/yr. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track purchase frequency per customer', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for pet-store
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet-store', 'Does your product margin meet the target of Food >25%, Supplies >40%, Live animals varies?', 1, '1be30dbe-9c9f-5459-8471-a8e190693c50')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet-store', 'Do you regularly track average grooming ticket and upsell rate?', 2, '6cc69243-4221-5bba-ace5-c50c1b44833d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet-store', 'Does your inventory turns meet the target of Turns >6x/yr?', 3, '1df6ed13-a2a1-58da-92e7-06d696235e2e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet-store', 'Is your customer visit frequency being tracked?', 4, '8ec85241-d8a3-58c9-ba5b-eace134c5264')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PHARMACY (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d242dd4f-7d2e-51a6-b5a6-235ddab2c1c8', 'pharmacy', 'Revenue Leak', 'pharmacy.leak_01',
   'Gross margin below 22%', 'Compare gross margin to industry benchmark by payer mix',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Gross margin >22%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare gross margin to industry benchmark by payer mix', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2d987da7-18bc-5b62-ab53-a22773df291f', 'pharmacy', 'Revenue Leak', 'pharmacy.leak_02',
   'Front store revenue below 15% of total', 'Track OTC/front store sales as % of total',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Front store >15% of total revenue. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track OTC/front store sales as % of total', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4b333d84-cb29-5dc5-94f2-c5a7d2ed6f44', 'pharmacy', 'Revenue Leak', 'pharmacy.leak_03',
   'Shrinkage above 1%', 'Compare physical inventory to book inventory',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Shrinkage <1%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare physical inventory to book inventory', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for pharmacy
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Does your gross margin meet the target of Gross margin >22%?', 1, 'd242dd4f-7d2e-51a6-b5a6-235ddab2c1c8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Does your front store revenue meet the target of Front store >15% of total revenue?', 2, '2d987da7-18bc-5b62-ab53-a22773df291f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Is your shrinkage within target (Shrinkage <1%)?', 3, '4b333d84-cb29-5dc5-94f2-c5a7d2ed6f44')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PHONE-REPAIR (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('52d4f436-a2e6-54fd-a0aa-b8c1c29077f2', 'phone-repair', 'Revenue Leak', 'phone-repair.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('970cf8b0-d3c7-5496-9dba-1330d90d690e', 'phone-repair', 'Cost Leak', 'phone-repair.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('305167b2-a074-5d21-830e-1ff4392ac9db', 'phone-repair', 'Cost Leak', 'phone-repair.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a758ea79-4e62-5c76-b81c-66b7ee6aeba1', 'phone-repair', 'Cost Leak', 'phone-repair.leak_04',
   'Parts cost above 35% of repair price', 'Compare parts cost to charged price per repair type',
   75.00, 'critical', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Parts <35% of repair price. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare parts cost to charged price per repair type', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('63c52bc1-12a7-59a1-9b0e-d2c3ebe32b9b', 'phone-repair', 'Operational Leak', 'phone-repair.leak_05',
   'Turnaround time above 2hrs for common repairs', 'Track repair time by type',
   75.00, 'high', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Screen repair <2hrs. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track repair time by type', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for phone-repair
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('phone-repair', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, '52d4f436-a2e6-54fd-a0aa-b8c1c29077f2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('phone-repair', 'Is your parts cost within target (Parts <35% of repair price)?', 2, 'a758ea79-4e62-5c76-b81c-66b7ee6aeba1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('phone-repair', 'Is your labor/operator cost within target (Labor <45% revenue)?', 3, '970cf8b0-d3c7-5496-9dba-1330d90d690e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('phone-repair', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 4, '305167b2-a074-5d21-830e-1ff4392ac9db')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('phone-repair', 'Is your turnaround time within target (Screen repair <2hrs)?', 5, '63c52bc1-12a7-59a1-9b0e-d2c3ebe32b9b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PHOTOGRAPHY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3aea9829-f2f9-5725-a44f-5cd7f044e347', 'photography', 'Revenue Leak', 'photography.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a5996b39-9307-51cb-966d-7521613f27cb', 'photography', 'Revenue Leak', 'photography.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fe1815e3-00e9-58d2-add6-8c6e9073508e', 'photography', 'Revenue Leak', 'photography.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a9ee49ff-2b9f-5890-a756-6a6b2b69bc9c', 'photography', 'Cost Leak', 'photography.leak_04',
   'Equipment depreciation untracked', 'Track equipment cost per shoot',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Amortize equipment over 3-5yr. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track equipment cost per shoot', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('57607f75-22d6-5206-9904-ecb92bd4d561', 'photography', 'Revenue Leak', 'photography.leak_05',
   'Print/product margin below 50%', 'Compare print/album cost to client pricing',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Print margin >50%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare print/album cost to client pricing', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for photography
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Does your billable utilization meet the target of Utilization >60%?', 1, '3aea9829-f2f9-5725-a44f-5cd7f044e347')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Is your scope creep being billed?', 2, 'a5996b39-9307-51cb-966d-7521613f27cb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Does your client retention meet the target of Client retention >75%/yr?', 3, 'fe1815e3-00e9-58d2-add6-8c6e9073508e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Does your print/product margin meet the target of Print margin >50%?', 4, '57607f75-22d6-5206-9904-ecb92bd4d561')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Have you reviewed and optimized your equipment depreciation untracked with a tax professional?', 5, 'a9ee49ff-2b9f-5890-a756-6a6b2b69bc9c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PHYSIOTHERAPY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('14f40c87-724c-5daa-941a-5899a9eadbbe', 'physiotherapy', 'Revenue Leak', 'physiotherapy.leak_01',
   'Therapist utilization below 80%', 'Track billable treatment hours vs available hours',
   75.00, 'critical', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Utilization >80%. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Track billable treatment hours vs available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('77498a44-af4a-582a-a53a-61a410bd4068', 'physiotherapy', 'Revenue Leak', 'physiotherapy.leak_02',
   'No-show rate above 12%', 'Track no-shows and cancellations with lost revenue',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: No-show rate <12%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track no-shows and cancellations with lost revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3358ee7a-be70-5121-b27e-cddd78394865', 'physiotherapy', 'Revenue Leak', 'physiotherapy.leak_03',
   'Insurance reimbursement below allowed', 'Compare paid to allowed by CPT code',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Audit underpayments monthly. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare paid to allowed by CPT code', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7d792f52-dcf3-5193-b942-c87eb68cc1ef', 'physiotherapy', 'Cost Leak', 'physiotherapy.leak_04',
   'Equipment utilization low', 'Track usage frequency per equipment item',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Equipment utilization tracked. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track usage frequency per equipment item', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('380bef3d-eae5-50a9-904f-69942af93ed7', 'physiotherapy', 'Revenue Leak', 'physiotherapy.leak_05',
   'Patient drop-off before plan completion', 'Track patients completing prescribed sessions',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Plan completion >65%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track patients completing prescribed sessions', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for physiotherapy
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('physiotherapy', 'Does your therapist utilization meet the target of Utilization >80%?', 1, '14f40c87-724c-5daa-941a-5899a9eadbbe')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('physiotherapy', 'Is your no-show rate within target (No-show rate <12%)?', 2, '77498a44-af4a-582a-a53a-61a410bd4068')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('physiotherapy', 'Does your insurance reimbursement meet the target of Audit underpayments monthly?', 3, '3358ee7a-be70-5121-b27e-cddd78394865')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('physiotherapy', 'Do you regularly track patients completing prescribed sessions?', 4, '380bef3d-eae5-50a9-904f-69942af93ed7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('physiotherapy', 'Is your equipment utilization at target (Equipment utilization tracked)?', 5, '7d792f52-dcf3-5193-b942-c87eb68cc1ef')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PLASTICS-RUBBER (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3081ee1b-97fb-59e1-adc3-c08614479b9e', 'plastics-rubber', 'Cost Leak', 'plastics-rubber.leak_01',
   'Material yield below 95%', 'Compare resin input to finished part output + regrind credit',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Resin yield >95% after regrind. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare resin input to finished part output + regrind credit', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ee7aad44-a7a1-503a-95d3-cced045215d7', 'plastics-rubber', 'Operational Leak', 'plastics-rubber.leak_02',
   'Cycle time above optimum', 'Compare actual cycle time to mold design spec',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Cycle time within 5% of optimum. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare actual cycle time to mold design spec', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c2af1dbe-224e-57e1-a5c6-8959c3d2fb93', 'plastics-rubber', 'Cost Leak', 'plastics-rubber.leak_03',
   'Mold maintenance cost overrun', 'Track mold shots between maintenance vs recommended PM interval',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Mold maintenance per 100K cycles. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track mold shots between maintenance vs recommended PM interval', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f48cd0e7-234f-5dab-b2fa-9fda84df5668', 'plastics-rubber', 'Cost Leak', 'plastics-rubber.leak_04',
   'Defect rate above 2%', 'Track scrap/reject rate by mold and machine',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Part reject rate <2%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track scrap/reject rate by mold and machine', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for plastics-rubber
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plastics-rubber', 'Is your defect rate within target (Part reject rate <2%)?', 1, 'f48cd0e7-234f-5dab-b2fa-9fda84df5668')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plastics-rubber', 'Does your material yield meet the target of Resin yield >95% after regrind?', 2, '3081ee1b-97fb-59e1-adc3-c08614479b9e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plastics-rubber', 'Is your cycle time within target (Cycle time within 5% of optimum)?', 3, 'ee7aad44-a7a1-503a-95d3-cced045215d7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plastics-rubber', 'Do you track your mold maintenance cost weekly and keep it within target (Mold maintenance per 100K cycles)?', 4, 'c2af1dbe-224e-57e1-a5c6-8959c3d2fb93')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PLUMBING (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e2679fb6-12a9-586f-874c-f2dafa16e4f8', 'plumbing', 'Revenue Leak', 'plumbing.leak_01',
   'Service call price below break-even', 'Compare service call revenue to fully loaded tech cost per hour',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Min charge >$150 + travel. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare service call revenue to fully loaded tech cost per hour', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('12dfd8ff-9e3d-55c4-89fa-dc8263e7d83e', 'plumbing', 'Revenue Leak', 'plumbing.leak_02',
   'Parts markup below 25%', 'Compare supplier invoice to customer-billed parts price',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Parts markup 25-40%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare supplier invoice to customer-billed parts price', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('824d6dc5-46df-5c96-8725-ae00366b7ddb', 'plumbing', 'Revenue Leak', 'plumbing.leak_03',
   'Emergency surcharge not captured', 'Track after-hours calls and verify premium billing applied',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: After-hours premium 1.5-2x standard. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track after-hours calls and verify premium billing applied', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bde70923-2abb-5ace-8d7d-e38b58ee5551', 'plumbing', 'Revenue Leak', 'plumbing.leak_04',
   'Flat rate not optimized', 'Compare T&M revenue vs what flat rate would yield per job',
   75.00, 'critical', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Flat rate covers 70% of jobs. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Compare T&M revenue vs what flat rate would yield per job', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ac718b84-290f-5c2b-949b-334f88faeed1', 'plumbing', 'Revenue Leak', 'plumbing.leak_05',
   'Maintenance agreement underpriced', 'Compare agreement revenue to cost of visits provided',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Maint agreements at 70-80% margin. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare agreement revenue to cost of visits provided', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4985aa4c-8f14-5d1a-a293-2e142e9a7ccb', 'plumbing', 'Cost Leak', 'plumbing.leak_06',
   'Warranty claim cost above normal', 'Track manufacturer warranty recovery vs rework cost',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Warranty costs <2% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track manufacturer warranty recovery vs rework cost', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for plumbing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plumbing', 'Is your flat rate being optimized?', 1, 'bde70923-2abb-5ace-8d7d-e38b58ee5551')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plumbing', 'Does your service call price meet the target of Min charge >$150 + travel?', 2, 'e2679fb6-12a9-586f-874c-f2dafa16e4f8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plumbing', 'Does your parts markup meet the target of Parts markup 25-40%?', 3, '12dfd8ff-9e3d-55c4-89fa-dc8263e7d83e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plumbing', 'Is your emergency surcharge being captured?', 4, '824d6dc5-46df-5c96-8725-ae00366b7ddb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plumbing', 'Have you benchmarked your pricing recently (Maint agreements at 70-80% margin)?', 5, 'ac718b84-290f-5c2b-949b-334f88faeed1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('plumbing', 'Is your warranty claim cost within target (Warranty costs <2% revenue)?', 6, '4985aa4c-8f14-5d1a-a293-2e142e9a7ccb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PRINTING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4133006c-8289-5257-8bbe-e4e1996d0c1e', 'printing', 'Cost Leak', 'printing.leak_01',
   'Paper waste above 10%', 'Track paper purchased vs paper in finished products + samples',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Paper waste <10% including setup. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track paper purchased vs paper in finished products + samples', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b1803119-5d84-513e-abc5-3d05a46aade2', 'printing', 'Operational Leak', 'printing.leak_02',
   'Press utilization below 70%', 'Track press hours running vs hours available',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Press utilization >70%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track press hours running vs hours available', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b927489e-277e-5f68-83bb-c26910b66a54', 'printing', 'Cost Leak', 'printing.leak_03',
   'Make-ready time above industry', 'Compare setup time per job to equipment capability',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Make-ready <15 min/job offset. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare setup time per job to equipment capability', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('778db96f-f838-57f1-a7d3-7bf5ccc7af1e', 'printing', 'Cost Leak', 'printing.leak_04',
   'Ink cost per impression above norm', 'Compare ink usage per 1000 impressions to manufacturer spec',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Ink cost <5% of job revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare ink usage per 1000 impressions to manufacturer spec', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for printing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing', 'Is your paper waste within target (Paper waste <10% including setup)?', 1, '4133006c-8289-5257-8bbe-e4e1996d0c1e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing', 'Does your press utilization meet the target of Press utilization >70%?', 2, 'b1803119-5d84-513e-abc5-3d05a46aade2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing', 'Is your make-ready time within target (Make-ready <15 min/job offset)?', 3, 'b927489e-277e-5f68-83bb-c26910b66a54')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing', 'Is your ink cost per impression within target (Ink cost <5% of job revenue)?', 4, '778db96f-f838-57f1-a7d3-7bf5ccc7af1e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PRIVATE-SCHOOL (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ef619a31-254b-5201-8690-c4a2a379cf3e', 'private-school', 'Revenue Leak', 'private-school.leak_01',
   'Student retention below 75%', 'Track student re-enrollment rate',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Student retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track student re-enrollment rate', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b11f7d43-53fb-5b51-9aab-543a0d0693b5', 'private-school', 'Operational Leak', 'private-school.leak_02',
   'Class/room utilization below 70%', 'Compare scheduled classes to available room-hours',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Room utilization >70%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare scheduled classes to available room-hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ea025a0b-0919-5ced-9369-f2497ddcd211', 'private-school', 'Cost Leak', 'private-school.leak_03',
   'Teacher cost above 45% of revenue', 'Track instructor pay as % of tuition revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Teacher cost <45% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track instructor pay as % of tuition revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dc7514f0-ca50-5040-a1ad-5de8ae168909', 'private-school', 'Revenue Leak', 'private-school.leak_04',
   'Enrollment below capacity', 'Compare enrolled students to facility capacity',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Enrollment >90% of capacity. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare enrolled students to facility capacity', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5735180e-cc77-5db5-8fdc-f97c046cca03', 'private-school', 'Cost Leak', 'private-school.leak_05',
   'Financial aid above 20% of tuition revenue', 'Track total aid as % of gross tuition',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Financial aid <20% tuition. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track total aid as % of gross tuition', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for private-school
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('private-school', 'Does your enrollment meet the target of Enrollment >90% of capacity?', 1, 'dc7514f0-ca50-5040-a1ad-5de8ae168909')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('private-school', 'Does your student retention meet the target of Student retention >75%/yr?', 2, 'ef619a31-254b-5201-8690-c4a2a379cf3e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('private-school', 'Is your financial aid within target (Financial aid <20% tuition)?', 3, '5735180e-cc77-5db5-8fdc-f97c046cca03')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('private-school', 'Is your teacher cost within target (Teacher cost <45% revenue)?', 4, 'ea025a0b-0919-5ced-9369-f2497ddcd211')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('private-school', 'Does your class/room utilization meet the target of Room utilization >70%?', 5, 'b11f7d43-53fb-5b51-9aab-543a0d0693b5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PROPERTY-MANAGEMENT (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('eac8ae2a-2b91-5cdb-90a8-744062636df0', 'property-management', 'Revenue Leak', 'property-management.leak_01',
   'Vacancy rate above market', 'Compare portfolio vacancy to local market rate',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Vacancy rate <5% or market avg. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare portfolio vacancy to local market rate', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('18c7871e-6890-5b7e-bb3e-001cbb27e3fd', 'property-management', 'Cost Leak', 'property-management.leak_02',
   'Maintenance cost per unit above benchmark', 'Track per-unit maintenance spend vs peer benchmark',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Maintenance <$1200/unit/yr. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track per-unit maintenance spend vs peer benchmark', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7faaa7b2-2e42-5601-b03b-c913cb1d22ba', 'property-management', 'Cash Flow Leak', 'property-management.leak_03',
   'Rent collection rate below 97%', 'Track on-time rent payment rate monthly',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Rent collection >97%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track on-time rent payment rate monthly', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f5c7f5e7-e6be-52a1-b155-a621d7519c95', 'property-management', 'Cost Leak', 'property-management.leak_04',
   'Tenant turnover above 40%', 'Track tenant departures and turnover costs (make-ready, vacancy)',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Tenant turnover <40%/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track tenant departures and turnover costs (make-ready, vacancy)', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d44a973c-f349-59fc-b996-8401da76272f', 'property-management', 'Revenue Leak', 'property-management.leak_05',
   'Late fees uncollected', 'Track late fees assessed vs late fees collected',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Late fee collection >80%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track late fees assessed vs late fees collected', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('316885b0-f0c8-5698-a9b9-b68d5027ba88', 'property-management', 'Cost Leak', 'property-management.leak_06',
   'Insurance cost above $600/unit', 'Benchmark insurance per unit to peer group',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Insurance <$600/unit/yr. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Benchmark insurance per unit to peer group', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for property-management
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property-management', 'Is your vacancy rate within target (Vacancy rate <5% or market avg)?', 1, 'eac8ae2a-2b91-5cdb-90a8-744062636df0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property-management', 'Is your maintenance cost per unit within target (Maintenance <$1200/unit/yr)?', 2, '18c7871e-6890-5b7e-bb3e-001cbb27e3fd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property-management', 'Does your rent collection rate meet the target of Rent collection >97%?', 3, '7faaa7b2-2e42-5601-b03b-c913cb1d22ba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property-management', 'Is your tenant turnover within target (Tenant turnover <40%/yr)?', 4, 'f5c7f5e7-e6be-52a1-b155-a621d7519c95')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property-management', 'Do you regularly track late fees assessed vs late fees collected?', 5, 'd44a973c-f349-59fc-b996-8401da76272f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property-management', 'Is your insurance cost within target (Insurance <$600/unit/yr)?', 6, '316885b0-f0c8-5698-a9b9-b68d5027ba88')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== PUBLISHING (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('006a87e2-a1d3-56db-bb42-cea31a9a2793', 'publishing', 'Cost Leak', 'publishing.leak_01',
   'Content production cost above benchmark', 'Compare per-article/per-issue cost to revenue yield',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Content cost <40% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare per-article/per-issue cost to revenue yield', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0eb908a0-4ee8-5252-8cdc-6eb6cbd7c018', 'publishing', 'Revenue Leak', 'publishing.leak_02',
   'Subscriber churn above 8%/month', 'Track monthly subscriber losses and reasons',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Subscriber churn <8%/mo. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track monthly subscriber losses and reasons', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0219db31-04c2-5c60-b4a3-a9a54aac3155', 'publishing', 'Revenue Leak', 'publishing.leak_03',
   'Ad revenue yield declining', 'Track CPM/RPM trends by ad placement',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: CPM stable or growing YoY. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track CPM/RPM trends by ad placement', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for publishing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('publishing', 'Is your subscriber churn within target (Subscriber churn <8%/mo)?', 1, '0eb908a0-4ee8-5252-8cdc-6eb6cbd7c018')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('publishing', 'Is your content production cost within target (Content cost <40% revenue)?', 2, '006a87e2-a1d3-56db-bb42-cea31a9a2793')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('publishing', 'Do you regularly track cpm/rpm trends by ad placement?', 3, '0219db31-04c2-5c60-b4a3-a9a54aac3155')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== RANCHING (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('017de3cc-a64d-59f6-889f-4117c3ad4cee', 'ranching', 'Cost Leak', 'ranching.leak_01',
   'Feed cost per head above benchmark', 'Compare feed cost per animal unit to regional averages',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Feed cost <$3.50/day/head. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare feed cost per animal unit to regional averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('885a6aff-bec5-5648-add6-1040230c1935', 'ranching', 'Revenue Leak', 'ranching.leak_02',
   'Mortality rate above normal', 'Track death loss % against industry standard',
   75.00, 'critical', 'fixed_range', 3000.00, 50000.00,
   'Benchmark: Cattle mortality <2%, Poultry <5%. Impact: $3,000–$50,000/year.',
   'Industry benchmark data', 'Track death loss % against industry standard', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('66fd2099-5d88-5c38-85cf-7cc69c20f4cd', 'ranching', 'Cost Leak', 'ranching.leak_03',
   'Vet cost unmanaged', 'Compare per-head vet expense to preventive care benchmarks',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Vet cost <3% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare per-head vet expense to preventive care benchmarks', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6fc6b7de-6038-538a-a4a8-3b6b965129d1', 'ranching', 'Revenue Leak', 'ranching.leak_04',
   'Weight gain rate below target', 'Track average daily gain vs feed conversion ratio',
   75.00, 'high', 'fixed_range', 5000.00, 30000.00,
   'Benchmark: ADG >2.5lb/day beef cattle. Impact: $5,000–$30,000/year.',
   'Industry benchmark data', 'Track average daily gain vs feed conversion ratio', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2afaa4c5-b772-52f4-8f8b-1eb743b50456', 'ranching', 'Operational Leak', 'ranching.leak_05',
   'Breeding inefficiency', 'Track bred/exposed ratio and calving interval',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Conception rate >90%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track bred/exposed ratio and calving interval', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('95413bd1-f85a-5317-8b5e-2576ed9562b5', 'ranching', 'Cost Leak', 'ranching.leak_06',
   'Grazing rotation suboptimal', 'Compare pasture rest days to recommended rotation schedule',
   75.00, 'medium', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Forage utilization >65%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare pasture rest days to recommended rotation schedule', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for ranching
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ranching', 'Is your mortality rate within target (Cattle mortality <2%, Poultry <5%)?', 1, '885a6aff-bec5-5648-add6-1040230c1935')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ranching', 'Is your feed cost per head within target (Feed cost <$3.50/day/head)?', 2, '017de3cc-a64d-59f6-889f-4117c3ad4cee')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ranching', 'Does your weight gain rate meet the target of ADG >2.5lb/day beef cattle?', 3, '6fc6b7de-6038-538a-a4a8-3b6b965129d1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ranching', 'Is your breeding inefficiency at target (Conception rate >90%)?', 4, '2afaa4c5-b772-52f4-8f8b-1eb743b50456')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ranching', 'Do you regularly compare per-head vet expense to preventive care benchmarks?', 5, '66fd2099-5d88-5c38-85cf-7cc69c20f4cd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ranching', 'Do you regularly compare pasture rest days to recommended rotation schedule?', 6, '95413bd1-f85a-5317-8b5e-2576ed9562b5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== REAL-ESTATE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('20688fb4-d89b-59b9-b539-666b2a5139b4', 'real-estate', 'Revenue Leak', 'real-estate.leak_01',
   'Lead conversion rate below 2%', 'Track leads to showing to offer to close funnel',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Lead-to-close >2%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track leads to showing to offer to close funnel', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3375c040-f369-5623-a526-61d6cc5bc847', 'real-estate', 'Revenue Leak', 'real-estate.leak_02',
   'Agent retention below 80%', 'Track agent departures and production lost',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Agent retention >80%/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track agent departures and production lost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6c2e8c4d-e8f8-5fdd-b346-a0abfea76c5e', 'real-estate', 'Revenue Leak', 'real-estate.leak_03',
   'Days on market above area average', 'Compare listing DOM to MLS area average',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: DOM at or below market average. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare listing DOM to MLS area average', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7b733b0d-f9a8-59fe-a234-0cfe0c9d7034', 'real-estate', 'Cost Leak', 'real-estate.leak_04',
   'Marketing cost per transaction above $1500', 'Track all marketing spend / transactions closed',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Marketing cost <$1500/deal. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track all marketing spend / transactions closed', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for real-estate
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real-estate', 'Does your lead conversion rate meet the target of Lead-to-close >2%?', 1, '20688fb4-d89b-59b9-b539-666b2a5139b4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real-estate', 'Does your agent retention meet the target of Agent retention >80%/yr?', 2, '3375c040-f369-5623-a526-61d6cc5bc847')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real-estate', 'Is your days on market within target (DOM at or below market average)?', 3, '6c2e8c4d-e8f8-5fdd-b346-a0abfea76c5e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real-estate', 'Is your marketing cost per transaction within target (Marketing cost <$1500/deal)?', 4, '7b733b0d-f9a8-59fe-a234-0cfe0c9d7034')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== RESTAURANT (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('06cafda7-c00d-5b3b-af5d-3c134b534ae3', 'restaurant', 'Cost Leak', 'restaurant.leak_01',
   'Food cost above 33%', 'Track actual food cost vs menu price for top 20 items',
   75.00, 'critical', 'fixed_range', 5000.00, 60000.00,
   'Benchmark: Food cost <33%. Impact: $5,000–$60,000/year.',
   'Industry benchmark data', 'Track actual food cost vs menu price for top 20 items', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a2dde5d4-3a75-54fe-ab45-8fc281515383', 'restaurant', 'Cost Leak', 'restaurant.leak_02',
   'Labor cost above 33%', 'Compare labor hours to sales by daypart',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Labor cost <33%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare labor hours to sales by daypart', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('628732cb-531f-5a4c-8e6d-74e1eca08e04', 'restaurant', 'Cost Leak', 'restaurant.leak_03',
   'Waste/spoilage untracked', 'Track food disposed daily and compare to purchases',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Waste tracked and <3% of purchases. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track food disposed daily and compare to purchases', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1ea12737-f0ff-5cbe-bba9-7bcc5f5f7561', 'restaurant', 'Cost Leak', 'restaurant.leak_04',
   'Employee turnover above industry avg', 'Calculate rehiring/training cost per departed employee',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Turnover <100% annually. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Calculate rehiring/training cost per departed employee', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a1f0263c-1def-5870-96ed-fa63dfaf504c', 'restaurant', 'Cost Leak', 'restaurant.leak_05',
   'CC processing fees above 2.5%', 'Compare effective CC rate to available processors',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: CC processing <2.5%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare effective CC rate to available processors', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f051bc27-24d1-5eb2-ac8e-2604d97d14da', 'restaurant', 'Revenue Leak', 'restaurant.leak_06',
   'Menu pricing below food cost targets', 'Calculate actual plate cost vs menu price per item',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Each item priced at <30% food cost. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Calculate actual plate cost vs menu price per item', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for restaurant
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Is your food cost within target (Food cost <33%)?', 1, '06cafda7-c00d-5b3b-af5d-3c134b534ae3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Is your labor cost within target (Labor cost <33%)?', 2, 'a2dde5d4-3a75-54fe-ab45-8fc281515383')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Do you track waste/spoilage untracked and keep it within target (Waste tracked and <3% of purchases)?', 3, '628732cb-531f-5a4c-8e6d-74e1eca08e04')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Does your menu pricing meet the target of Each item priced at <30% food cost?', 4, 'f051bc27-24d1-5eb2-ac8e-2604d97d14da')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Is your employee turnover within target (Turnover <100% annually)?', 5, '1ea12737-f0ff-5cbe-bba9-7bcc5f5f7561')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Is your cc processing fees within target (CC processing <2.5%)?', 6, 'a1f0263c-1def-5870-96ed-fa63dfaf504c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== RETAIL (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d60ec879-ec7d-5434-a67b-ef7ce0651da2', 'retail', 'Revenue Leak', 'retail.leak_01',
   'Shrinkage above 1.5%', 'Compare physical inventory to book inventory',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Shrinkage <1.5%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare physical inventory to book inventory', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2744c1c4-93f3-501c-8dbc-2c37b2d88324', 'retail', 'Cost Leak', 'retail.leak_02',
   'Inventory turnover below industry', 'Calculate annual COGS / average inventory',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Turns >4x/yr retail average. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Calculate annual COGS / average inventory', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('23555fbe-11d0-5e1a-9cd6-56270c7012b0', 'retail', 'Cost Leak', 'retail.leak_03',
   'Credit card processing above 2.5%', 'Compare effective CC rate to available processor rates',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: CC fees <2.5% of card revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare effective CC rate to available processor rates', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('00ecf69d-2275-594f-980f-413a43e550c9', 'retail', 'Cost Leak', 'retail.leak_04',
   'Labor scheduling inefficiency', 'Compare staffing levels to foot traffic patterns',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Sales per labor hour tracked daily. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare staffing levels to foot traffic patterns', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3381db50-648e-539e-aabe-744c955f616d', 'retail', 'Cost Leak', 'retail.leak_05',
   'Rent as % of revenue too high', 'Compare rent per sqft to sales per sqft ratio',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Rent <10% of revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare rent per sqft to sales per sqft ratio', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for retail
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Is your shrinkage within target (Shrinkage <1.5%)?', 1, 'd60ec879-ec7d-5434-a67b-ef7ce0651da2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Does your inventory turnover meet the target of Turns >4x/yr retail average?', 2, '2744c1c4-93f3-501c-8dbc-2c37b2d88324')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you regularly compare rent per sqft to sales per sqft ratio?', 3, '3381db50-648e-539e-aabe-744c955f616d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Is your labor scheduling inefficiency at target (Sales per labor hour tracked daily)?', 4, '00ecf69d-2275-594f-980f-413a43e550c9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Is your credit card processing within target (CC fees <2.5% of card revenue)?', 5, '23555fbe-11d0-5e1a-9cd6-56270c7012b0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== ROOFING (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e5d6aced-a5e4-5b84-893f-82b9f75d6808', 'roofing', 'Cost Leak', 'roofing.leak_01',
   'Material waste factor above 12%', 'Compare material ordered vs roof area measured + expected waste',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Waste factor <12% for shingles. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare material ordered vs roof area measured + expected waste', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b51f5ab6-86a6-5632-abf2-49b33578d94d', 'roofing', 'Cost Leak', 'roofing.leak_02',
   'Labor efficiency below benchmark', 'Track squares installed per crew per day',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Crew installs >3 squares/day. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track squares installed per crew per day', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0cc9dda2-c70d-5bfa-81df-dc905ae3e6cf', 'roofing', 'Cost Leak', 'roofing.leak_03',
   'Warranty callback rate high', 'Track warranty claims frequency and cost',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Callbacks <2% within 1 year. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track warranty claims frequency and cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9e39ba73-1550-5d82-b26f-c8b12794f6a3', 'roofing', 'Revenue Leak', 'roofing.leak_04',
   'Weather delay cost not captured', 'Review contracts for weather delay provisions',
   75.00, 'high', 'fixed_range', 2000.00, 25000.00,
   'Benchmark: Delay clauses in 100% of contracts. Impact: $2,000–$25,000/year.',
   'Industry benchmark data', 'Review contracts for weather delay provisions', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1c3d7223-1c00-533f-b882-b1eb8cf5b25d', 'roofing', 'Cost Leak', 'roofing.leak_05',
   'Dump fee overspend', 'Audit disposal costs per job vs contracted rates',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Dump fees <$40/ton. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Audit disposal costs per job vs contracted rates', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4feecb9c-f482-52c4-a757-c3e8dd917932', 'roofing', 'Cost Leak', 'roofing.leak_06',
   'Insurance cost above peers', 'Benchmark insurance premiums against similar-sized roofers',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: GL+WC <5% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Benchmark insurance premiums against similar-sized roofers', 6)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for roofing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Is your material waste factor within target (Waste factor <12% for shingles)?', 1, 'e5d6aced-a5e4-5b84-893f-82b9f75d6808')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Does your labor efficiency meet the target of Crew installs >3 squares/day?', 2, 'b51f5ab6-86a6-5632-abf2-49b33578d94d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Is your weather delay cost being captured?', 3, '9e39ba73-1550-5d82-b26f-c8b12794f6a3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Do you regularly track warranty claims frequency and cost?', 4, '0cc9dda2-c70d-5bfa-81df-dc905ae3e6cf')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Is your insurance cost within target (GL+WC <5% revenue)?', 5, '4feecb9c-f482-52c4-a757-c3e8dd917932')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Do you track your dump fee weekly and keep it within target (Dump fees <$40/ton)?', 6, '1c3d7223-1c00-533f-b882-b1eb8cf5b25d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SAAS (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e4fbddaf-ee88-56a0-9460-b4d760b19107', 'saas', 'Revenue Leak', 'saas.leak_01',
   'Churn rate above 5% monthly', 'Track monthly customer/revenue churn',
   75.00, 'critical', 'fixed_range', 5000.00, 100000.00,
   'Benchmark: Monthly churn <5% (SMB), <2% (Enterprise). Impact: $5,000–$100,000/year.',
   'Industry benchmark data', 'Track monthly customer/revenue churn', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d4eac358-fe3f-56d2-9a98-bf9a6e02c201', 'saas', 'Growth Leak', 'saas.leak_02',
   'CAC payback above 12 months', 'Calculate CAC / (ARPU × gross margin)',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: CAC payback <12 months. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Calculate CAC / (ARPU × gross margin)', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4998a2c9-4ec9-5ac2-a890-11fcf66b8e93', 'saas', 'Cost Leak', 'saas.leak_03',
   'Hosting cost above 15% of revenue', 'Track infrastructure spend as % of MRR',
   75.00, 'high', 'fixed_range', 2000.00, 30000.00,
   'Benchmark: Hosting <15% of revenue. Impact: $2,000–$30,000/year.',
   'Industry benchmark data', 'Track infrastructure spend as % of MRR', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b7f6b6b1-91b4-5c94-8f37-65293a5927e8', 'saas', 'Revenue Leak', 'saas.leak_04',
   'Feature adoption rate below 40%', 'Track feature usage analytics for expansion triggers',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Core feature adoption >40%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track feature usage analytics for expansion triggers', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for saas
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Is your churn rate within target (Monthly churn <5% (SMB), <2% (Enterprise))?', 1, 'e4fbddaf-ee88-56a0-9460-b4d760b19107')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Is your cac payback within target (CAC payback <12 months)?', 2, 'd4eac358-fe3f-56d2-9a98-bf9a6e02c201')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Is your hosting cost within target (Hosting <15% of revenue)?', 3, '4998a2c9-4ec9-5ac2-a890-11fcf66b8e93')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Does your feature adoption rate meet the target of Core feature adoption >40%?', 4, 'b7f6b6b1-91b4-5c94-8f37-65293a5927e8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SECURITY-GUARD (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1fa880f9-3030-50be-a138-5e1ffe27d53a', 'security-guard', 'Revenue Leak', 'security-guard.leak_01',
   'Bill rate below 1.5x pay rate', 'Compare client billing rate to guard total cost',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Bill rate >1.5x fully loaded pay. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare client billing rate to guard total cost', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7303b583-431d-5879-a81c-745b981c2358', 'security-guard', 'Cost Leak', 'security-guard.leak_02',
   'Guard turnover above 100%', 'Track hiring/termination frequency and costs',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Annual turnover <100%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track hiring/termination frequency and costs', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dd1e4109-0eb3-58e0-9fbd-4f3ce1b3f06a', 'security-guard', 'Cost Leak', 'security-guard.leak_03',
   'Overtime cost above 10% of labor', 'Track overtime hours vs regular hours',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: OT <10% of total labor cost. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track overtime hours vs regular hours', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5ef4c8d9-3a84-5472-adc1-714001d6194e', 'security-guard', 'Cost Leak', 'security-guard.leak_04',
   'Training cost per guard above $1000', 'Track per-guard training and certification costs',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Training cost <$1000/guard. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track per-guard training and certification costs', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for security-guard
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('security-guard', 'Does your bill rate meet the target of Bill rate >1.5x fully loaded pay?', 1, '1fa880f9-3030-50be-a138-5e1ffe27d53a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('security-guard', 'Is your guard turnover within target (Annual turnover <100%)?', 2, '7303b583-431d-5879-a81c-745b981c2358')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('security-guard', 'Is your overtime cost within target (OT <10% of total labor cost)?', 3, 'dd1e4109-0eb3-58e0-9fbd-4f3ce1b3f06a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('security-guard', 'Is your training cost per guard within target (Training cost <$1000/guard)?', 4, '5ef4c8d9-3a84-5472-adc1-714001d6194e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SENIOR-CARE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3b93c764-d175-55e9-9a61-b93bb64e2394', 'senior-care', 'Revenue Leak', 'senior-care.leak_01',
   'Occupancy rate below 90%', 'Track occupied beds vs total capacity',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Occupancy >90%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Track occupied beds vs total capacity', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cd0b04db-18a7-5724-a176-52131496dff4', 'senior-care', 'Cost Leak', 'senior-care.leak_02',
   'Staff-to-resident ratio cost overrun', 'Compare actual staffing to required ratios',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Staffing at regulatory minimum + 10%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare actual staffing to required ratios', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('279c31f5-7c9b-5212-9431-b53bc4fbbff4', 'senior-care', 'Cost Leak', 'senior-care.leak_03',
   'Food cost per resident above $15/day', 'Track per-resident daily food cost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Food cost <$15/resident/day. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track per-resident daily food cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('64f66a23-73d7-598d-874d-1e13b724ad2d', 'senior-care', 'Cost Leak', 'senior-care.leak_04',
   'Medication cost above benchmark', 'Track per-resident medication costs',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Compare med cost to formulary benchmarks. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track per-resident medication costs', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for senior-care
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('senior-care', 'Does your occupancy rate meet the target of Occupancy >90%?', 1, '3b93c764-d175-55e9-9a61-b93bb64e2394')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('senior-care', 'Do you track your staff-to-resident ratio cost weekly and keep it within target (Staffing at regulatory minimum + 10%)?', 2, 'cd0b04db-18a7-5724-a176-52131496dff4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('senior-care', 'Is your medication cost within target (Compare med cost to formulary benchmarks)?', 3, '64f66a23-73d7-598d-874d-1e13b724ad2d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('senior-care', 'Is your food cost per resident within target (Food cost <$15/resident/day)?', 4, '279c31f5-7c9b-5212-9431-b53bc4fbbff4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SOLAR-ENERGY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('3b488994-1735-54a2-9d28-8c3d5de11000', 'solar-energy', 'Revenue Leak', 'solar-energy.leak_01',
   'Panel efficiency degradation above normal', 'Compare actual output decline to manufacturer specs',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Degradation <0.5%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare actual output decline to manufacturer specs', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('80e9a467-c96b-59bd-9f0b-6cf8ae233dba', 'solar-energy', 'Revenue Leak', 'solar-energy.leak_02',
   'Inverter downtime revenue loss', 'Track inverter uptime vs expected generation hours',
   75.00, 'critical', 'fixed_range', 1000.00, 20000.00,
   'Benchmark: Inverter uptime >99%. Impact: $1,000–$20,000/year.',
   'Industry benchmark data', 'Track inverter uptime vs expected generation hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('859be003-9bf0-5f3c-b767-c92827abc2a3', 'solar-energy', 'Cost Leak', 'solar-energy.leak_03',
   'Maintenance cost per kW above benchmark', 'Compare O&M spend per installed kW to industry norm',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: O&M <$15/kW/yr. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare O&M spend per installed kW to industry norm', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8f0045e6-a502-5b48-85b1-02cb77c104da', 'solar-energy', 'Cost Leak', 'solar-energy.leak_04',
   'Grid connection fees overpaid', 'Review tariff schedules vs actual billed amounts',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Audit utility interconnection charges. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Review tariff schedules vs actual billed amounts', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for solar-energy
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('solar-energy', 'Is your inverter downtime revenue loss at target (Inverter uptime >99%)?', 1, '80e9a467-c96b-59bd-9f0b-6cf8ae233dba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('solar-energy', 'Is your panel efficiency degradation within target (Degradation <0.5%/yr)?', 2, '3b488994-1735-54a2-9d28-8c3d5de11000')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('solar-energy', 'Is your maintenance cost per kw within target (O&M <$15/kW/yr)?', 3, '859be003-9bf0-5f3c-b767-c92827abc2a3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('solar-energy', 'Do you regularly review tariff schedules vs actual billed amounts?', 4, '8f0045e6-a502-5b48-85b1-02cb77c104da')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SPA (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f50fd52b-9bb5-5ac9-bc33-b2e05a3d62a8', 'spa', 'Revenue Leak', 'spa.leak_01',
   'Therapist utilization below 70%', 'Track treatment hours vs available hours per therapist',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Utilization >70%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track treatment hours vs available hours per therapist', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('276be26e-a6bd-5891-a401-a02bdd3d85c3', 'spa', 'Revenue Leak', 'spa.leak_02',
   'Product margin below 60%', 'Compare product cost to retail pricing',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Product margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare product cost to retail pricing', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5d7f16ca-3683-55d1-864f-edcc427848e7', 'spa', 'Revenue Leak', 'spa.leak_03',
   'Retail attach rate below 15%', 'Track % of service clients who buy retail',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Retail attach >15% of service clients. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track % of service clients who buy retail', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fc006a36-3060-527e-88a0-e40405cc7aa2', 'spa', 'Revenue Leak', 'spa.leak_04',
   'Rebooking rate below 45%', 'Track clients who rebook at checkout',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Rebooking rate >45%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track clients who rebook at checkout', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for spa
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('spa', 'Does your therapist utilization meet the target of Utilization >70%?', 1, 'f50fd52b-9bb5-5ac9-bc33-b2e05a3d62a8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('spa', 'Does your product margin meet the target of Product margin >60%?', 2, '276be26e-a6bd-5891-a401-a02bdd3d85c3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('spa', 'Does your retail attach rate meet the target of Retail attach >15% of service clients?', 3, '5d7f16ca-3683-55d1-864f-edcc427848e7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('spa', 'Does your rebooking rate meet the target of Rebooking rate >45%?', 4, 'fc006a36-3060-527e-88a0-e40405cc7aa2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SPORTING-GOODS (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a52aec20-5a1b-56b8-a421-150dd452ebbe', 'sporting-goods', 'Cost Leak', 'sporting-goods.leak_01',
   'Seasonal overstock markdown', 'Track seasonal inventory remaining vs total purchased',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: End-of-season markdown <15%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track seasonal inventory remaining vs total purchased', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fcc6fe9f-8fbc-58c4-ab23-ed39ca27b5fa', 'sporting-goods', 'Revenue Leak', 'sporting-goods.leak_02',
   'Service/rental revenue untapped', 'Track repair/rental revenue as % of total',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Service+rental >10% of revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track repair/rental revenue as % of total', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('10215faf-9cd6-5f67-9e6f-1261ac8def99', 'sporting-goods', 'Cost Leak', 'sporting-goods.leak_03',
   'Inventory turns below 3x', 'Track turnover by department',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Turns >3x/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track turnover by department', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for sporting-goods
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('sporting-goods', 'Do you regularly track seasonal inventory remaining vs total purchased?', 1, 'a52aec20-5a1b-56b8-a421-150dd452ebbe')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('sporting-goods', 'Does your inventory turns meet the target of Turns >3x/yr?', 2, '10215faf-9cd6-5f67-9e6f-1261ac8def99')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('sporting-goods', 'Do you regularly track repair/rental revenue as % of total?', 3, 'fcc6fe9f-8fbc-58c4-ab23-ed39ca27b5fa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== STAFFING-AGENCY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7fa53869-99bf-5478-9cc7-5129e480c7f0', 'staffing-agency', 'Revenue Leak', 'staffing-agency.leak_01',
   'Bill rate margin below 25%', 'Compare client bill rate to worker pay rate + burden',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Bill margin >25%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare client bill rate to worker pay rate + burden', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('22f27e1c-a6e3-5b88-aa0b-aa28fa11834a', 'staffing-agency', 'Revenue Leak', 'staffing-agency.leak_02',
   'Fill rate below 85%', 'Track orders filled vs total orders received',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Fill rate >85%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track orders filled vs total orders received', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b0c59dad-9ee0-5a72-83d0-3c5031d1d3c4', 'staffing-agency', 'Operational Leak', 'staffing-agency.leak_03',
   'Time-to-fill above 5 days', 'Track days from order to placement',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Time-to-fill <5 days. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track days from order to placement', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f2977792-c2a9-5ef1-8e51-032c2bf0bbc3', 'staffing-agency', 'Cost Leak', 'staffing-agency.leak_04',
   'Worker turnover above 50%', 'Track worker departures and replacement costs',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Worker retention >50%/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track worker departures and replacement costs', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('43d0ee77-406f-5e92-ad24-830abb26c7d6', 'staffing-agency', 'Cash Flow Leak', 'staffing-agency.leak_05',
   'Bad debt rate above 2%', 'Track uncollectable invoices as % of revenue',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Bad debt <2% of revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track uncollectable invoices as % of revenue', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for staffing-agency
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing-agency', 'Does your bill rate margin meet the target of Bill margin >25%?', 1, '7fa53869-99bf-5478-9cc7-5129e480c7f0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing-agency', 'Does your fill rate meet the target of Fill rate >85%?', 2, '22f27e1c-a6e3-5b88-aa0b-aa28fa11834a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing-agency', 'Is your worker turnover within target (Worker retention >50%/yr)?', 3, 'f2977792-c2a9-5ef1-8e51-032c2bf0bbc3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing-agency', 'Is your bad debt rate within target (Bad debt <2% of revenue)?', 4, '43d0ee77-406f-5e92-ad24-830abb26c7d6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing-agency', 'Is your time-to-fill within target (Time-to-fill <5 days)?', 5, 'b0c59dad-9ee0-5a72-83d0-3c5031d1d3c4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SUBSCRIPTION-BOX (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4a8d83cb-b8ba-5245-b9d3-8364ef2657b4', 'subscription-box', 'Cost Leak', 'subscription-box.leak_01',
   'COGS per box above 40% of price', 'Compare product cost per box to subscription price',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: COGS <40% box price. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare product cost per box to subscription price', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8ba85c33-54a9-5931-b625-a0c08424bfe1', 'subscription-box', 'Revenue Leak', 'subscription-box.leak_02',
   'Churn rate above 10%/mo', 'Track monthly subscriber cancellations',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Monthly churn <10%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track monthly subscriber cancellations', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('99a89ccb-48e3-5f33-a451-b2a2fb5a31fd', 'subscription-box', 'Cost Leak', 'subscription-box.leak_03',
   'Shipping cost above 15% of revenue', 'Track per-box shipping cost',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Shipping <15% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track per-box shipping cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('579fe442-fdfc-5ec7-84ff-dcf170d513fc', 'subscription-box', 'Growth Leak', 'subscription-box.leak_04',
   'CAC payback above 3 months', 'Calculate subscriber acquisition cost / monthly margin',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: CAC payback <3 months. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Calculate subscriber acquisition cost / monthly margin', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for subscription-box
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('subscription-box', 'Is your churn rate within target (Monthly churn <10%)?', 1, '8ba85c33-54a9-5931-b625-a0c08424bfe1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('subscription-box', 'Is your cogs per box within target (COGS <40% box price)?', 2, '4a8d83cb-b8ba-5245-b9d3-8364ef2657b4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('subscription-box', 'Is your cac payback within target (CAC payback <3 months)?', 3, '579fe442-fdfc-5ec7-84ff-dcf170d513fc')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('subscription-box', 'Is your shipping cost within target (Shipping <15% revenue)?', 4, '99a89ccb-48e3-5f33-a451-b2a2fb5a31fd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== SURVEYING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c3231ec5-1eba-524f-abbe-6281747434e3', 'surveying', 'Revenue Leak', 'surveying.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('18268593-b8ba-5350-8e28-9d2a9ff0035c', 'surveying', 'Revenue Leak', 'surveying.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('702da2f2-a9f4-526c-9fd9-092b4ec9656f', 'surveying', 'Revenue Leak', 'surveying.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8343e0b1-1015-5867-bdbd-e28822a1719a', 'surveying', 'Revenue Leak', 'surveying.leak_04',
   'Revenue per survey below $1500', 'Compare fee per survey to market rates',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue/survey >$1500. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare fee per survey to market rates', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for surveying
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('surveying', 'Does your billable utilization meet the target of Utilization >60%?', 1, 'c3231ec5-1eba-524f-abbe-6281747434e3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('surveying', 'Is your scope creep being billed?', 2, '18268593-b8ba-5350-8e28-9d2a9ff0035c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('surveying', 'Does your client retention meet the target of Client retention >75%/yr?', 3, '702da2f2-a9f4-526c-9fd9-092b4ec9656f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('surveying', 'Does your revenue per survey meet the target of Revenue/survey >$1500?', 4, '8343e0b1-1015-5867-bdbd-e28822a1719a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TATTOO-PIERCING (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e64ff6bb-7a45-5446-ac96-d96ffcc0329c', 'tattoo-piercing', 'Revenue Leak', 'tattoo-piercing.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('10af536e-80bf-5b40-96ff-862bb3af2cdb', 'tattoo-piercing', 'Cost Leak', 'tattoo-piercing.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1c4af686-aebe-535e-b0e3-335e9a0aea4d', 'tattoo-piercing', 'Cost Leak', 'tattoo-piercing.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for tattoo-piercing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tattoo-piercing', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, 'e64ff6bb-7a45-5446-ac96-d96ffcc0329c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tattoo-piercing', 'Is your labor/operator cost within target (Labor <45% revenue)?', 2, '10af536e-80bf-5b40-96ff-862bb3af2cdb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tattoo-piercing', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 3, '1c4af686-aebe-535e-b0e3-335e9a0aea4d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TAX-PREPARATION (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('dde6a5d8-927d-5a15-994f-a984ca4c8c93', 'tax-preparation', 'Revenue Leak', 'tax-preparation.leak_01',
   'Returns per preparer below 200/season', 'Track returns filed per preparer per season',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Returns/preparer >200/season. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track returns filed per preparer per season', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('92d15a57-4c3a-5962-9dc0-20cf25acbe29', 'tax-preparation', 'Revenue Leak', 'tax-preparation.leak_02',
   'Revenue per return below $250', 'Compare average fee per return to market',
   75.00, 'critical', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Revenue/return >$250 avg. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Compare average fee per return to market', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fcf7fadb-a11c-5445-8871-711cb0ccf768', 'tax-preparation', 'Cost Leak', 'tax-preparation.leak_03',
   'Seasonal labor cost above 30% of revenue', 'Track seasonal staff cost vs seasonal revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Seasonal labor <30% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track seasonal staff cost vs seasonal revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7f866366-3bfc-5f63-96df-43de55139026', 'tax-preparation', 'Cost Leak', 'tax-preparation.leak_04',
   'Software/e-file cost per return above $30', 'Compare per-return software/e-file cost to alternatives',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Software cost <$30/return. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare per-return software/e-file cost to alternatives', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('36065d72-1f2b-581c-b899-9b995896cf7a', 'tax-preparation', 'Compliance Leak', 'tax-preparation.leak_05',
   'Error/amendment rate above 2%', 'Track amended returns and IRS notices per 100 returns',
   75.00, 'critical', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Error rate <2% of returns. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track amended returns and IRS notices per 100 returns', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for tax-preparation
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tax-preparation', 'Does your returns per preparer meet the target of Returns/preparer >200/season?', 1, 'dde6a5d8-927d-5a15-994f-a984ca4c8c93')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tax-preparation', 'Does your revenue per return meet the target of Revenue/return >$250 avg?', 2, '92d15a57-4c3a-5962-9dc0-20cf25acbe29')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tax-preparation', 'Is your error/amendment rate within target (Error rate <2% of returns)?', 3, '36065d72-1f2b-581c-b899-9b995896cf7a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tax-preparation', 'Is your seasonal labor cost within target (Seasonal labor <30% revenue)?', 4, 'fcf7fadb-a11c-5445-8871-711cb0ccf768')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tax-preparation', 'Is your software/e-file cost per return within target (Software cost <$30/return)?', 5, '7f866366-3bfc-5f63-96df-43de55139026')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TAXI-RIDESHARE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fda0d463-34ba-5fe6-98eb-4eb5f8ce72b8', 'taxi-rideshare', 'Revenue Leak', 'taxi-rideshare.leak_01',
   'Revenue per mile below market', 'Compare actual revenue per mile to published rates',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Rev/mile >$2.50 urban. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare actual revenue per mile to published rates', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c23d7f00-7069-5354-96eb-24493a8e4d2f', 'taxi-rideshare', 'Operational Leak', 'taxi-rideshare.leak_02',
   'Idle time above 30%', 'Track idle minutes vs total shift hours',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Idle time <30%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track idle minutes vs total shift hours', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('fac52882-1027-5a92-9be4-fb38e14539b5', 'taxi-rideshare', 'Cost Leak', 'taxi-rideshare.leak_03',
   'Vehicle depreciation outpacing revenue', 'Compare vehicle depreciation+maintenance to gross revenue',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Vehicle cost <25% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare vehicle depreciation+maintenance to gross revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4b5fd7c4-eb7f-5612-91ba-63849bc0ac75', 'taxi-rideshare', 'Cost Leak', 'taxi-rideshare.leak_04',
   'Platform fees eroding margin', 'Track effective commission rate across platforms',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Platform fees <25% of fare. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track effective commission rate across platforms', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for taxi-rideshare
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('taxi-rideshare', 'Does your revenue per mile meet the target of Rev/mile >$2.50 urban?', 1, 'fda0d463-34ba-5fe6-98eb-4eb5f8ce72b8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('taxi-rideshare', 'Is your idle time within target (Idle time <30%)?', 2, 'c23d7f00-7069-5354-96eb-24493a8e4d2f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('taxi-rideshare', 'Have you reviewed and optimized your vehicle depreciation outpacing revenue with a tax professional?', 3, 'fac52882-1027-5a92-9be4-fb38e14539b5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('taxi-rideshare', 'Do you regularly track effective commission rate across platforms?', 4, '4b5fd7c4-eb7f-5612-91ba-63849bc0ac75')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TELECOM (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e90e3c4b-c741-5c43-86fa-608105a065de', 'telecom', 'Revenue Leak', 'telecom.leak_01',
   'ARPU below market average', 'Compare average revenue per user to competitors',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: ARPU above regional benchmark. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare average revenue per user to competitors', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d3d93345-f543-547a-8365-bf5db3e608bf', 'telecom', 'Revenue Leak', 'telecom.leak_02',
   'Customer churn above 2%/mo', 'Track monthly subscriber churn rate',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Monthly churn <2%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track monthly subscriber churn rate', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d803ac26-a8ca-52e3-b52a-2fe52c945545', 'telecom', 'Cost Leak', 'telecom.leak_03',
   'Installation cost above target', 'Track per-install cost including labor and equipment',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Install cost <$200/customer. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track per-install cost including labor and equipment', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for telecom
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('telecom', 'Does your arpu meet the target of ARPU above regional benchmark?', 1, 'e90e3c4b-c741-5c43-86fa-608105a065de')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('telecom', 'Is your customer churn within target (Monthly churn <2%)?', 2, 'd3d93345-f543-547a-8365-bf5db3e608bf')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('telecom', 'Is your installation cost within target (Install cost <$200/customer)?', 3, 'd803ac26-a8ca-52e3-b52a-2fe52c945545')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TEXTILE-APPAREL (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0a21dc03-5cc4-5115-a056-c2f6181becc1', 'textile-apparel', 'Cost Leak', 'textile-apparel.leak_01',
   'Material waste above 15%', 'Compare fabric purchased vs finished garment output',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Cutting waste <15%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare fabric purchased vs finished garment output', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b7e27df5-2a69-5ab4-8d14-2c0ea80e81b9', 'textile-apparel', 'Revenue Leak', 'textile-apparel.leak_02',
   'Defect/return rate above 3%', 'Track quality control rejection and customer return rates',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Defect rate <3%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track quality control rejection and customer return rates', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('cd4e9951-8aed-5029-9aa7-be6984bd997c', 'textile-apparel', 'Cost Leak', 'textile-apparel.leak_03',
   'Labor cost per unit above benchmark', 'Compare labor hours per unit to industry standard',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Labor <25% of COGS. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare labor hours per unit to industry standard', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e10817eb-2ccc-5c90-8c5a-801b036e0ba0', 'textile-apparel', 'Cash Flow Leak', 'textile-apparel.leak_04',
   'Inventory age above 90 days', 'Track inventory age distribution and markdown triggers',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Inventory turns >4x/yr. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track inventory age distribution and markdown triggers', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for textile-apparel
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('textile-apparel', 'Is your defect/return rate within target (Defect rate <3%)?', 1, 'b7e27df5-2a69-5ab4-8d14-2c0ea80e81b9')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('textile-apparel', 'Is your material waste within target (Cutting waste <15%)?', 2, '0a21dc03-5cc4-5115-a056-c2f6181becc1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('textile-apparel', 'Is your labor cost per unit within target (Labor <25% of COGS)?', 3, 'cd4e9951-8aed-5029-9aa7-be6984bd997c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('textile-apparel', 'Is your inventory age within target (Inventory turns >4x/yr)?', 4, 'e10817eb-2ccc-5c90-8c5a-801b036e0ba0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TIRE-SHOP (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('769a0ee9-ced3-5aa5-8cdf-8b08a5a33539', 'tire-shop', 'Revenue Leak', 'tire-shop.leak_01',
   'Tire margin below 25%', 'Compare tire cost to selling price by brand/size',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Tire margin >25%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare tire cost to selling price by brand/size', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('60a74c84-2fe0-55f8-8d42-c8239cc0754c', 'tire-shop', 'Revenue Leak', 'tire-shop.leak_02',
   'Alignment/service revenue below 15%', 'Track alignment and service revenue as % of total',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Alignment+service >15% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track alignment and service revenue as % of total', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e584f379-695c-57ce-916c-5a3bdbd7e986', 'tire-shop', 'Cost Leak', 'tire-shop.leak_03',
   'Seasonal inventory overstock', 'Track seasonal tire inventory vs sales',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: End-of-season inventory <20% of peak buy. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track seasonal tire inventory vs sales', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for tire-shop
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tire-shop', 'Does your tire margin meet the target of Tire margin >25%?', 1, '769a0ee9-ced3-5aa5-8cdf-8b08a5a33539')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tire-shop', 'Does your alignment/service revenue meet the target of Alignment+service >15% revenue?', 2, '60a74c84-2fe0-55f8-8d42-c8239cc0754c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tire-shop', 'Do you regularly track seasonal tire inventory vs sales?', 3, 'e584f379-695c-57ce-916c-5a3bdbd7e986')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TOWING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0af91983-bb23-5afb-b9fd-d310c22efbbf', 'towing', 'Revenue Leak', 'towing.leak_01',
   'Revenue per call below market', 'Compare average revenue per call to local market rates',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Avg revenue >$200/call. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare average revenue per call to local market rates', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a3a79824-d04b-5cc9-8678-cd4658edde37', 'towing', 'Revenue Leak', 'towing.leak_02',
   'Response time causing lost calls', 'Track calls received vs calls completed and lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Response time <30 min urban. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track calls received vs calls completed and lost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2084f22f-6d5d-5b27-b5fc-bf59f4e26c49', 'towing', 'Cost Leak', 'towing.leak_03',
   'Equipment maintenance cost overrun', 'Compare per-truck maintenance cost to fleet benchmark',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Maintenance <8% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare per-truck maintenance cost to fleet benchmark', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('76884c51-14ca-57da-9945-50b15c6c9e28', 'towing', 'Cost Leak', 'towing.leak_04',
   'Insurance cost above norm', 'Benchmark insurance cost per truck to industry',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Insurance <10% of revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Benchmark insurance cost per truck to industry', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for towing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('towing', 'Does your revenue per call meet the target of Avg revenue >$200/call?', 1, '0af91983-bb23-5afb-b9fd-d310c22efbbf')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('towing', 'Do you regularly track calls received vs calls completed and lost?', 2, 'a3a79824-d04b-5cc9-8678-cd4658edde37')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('towing', 'Do you track your equipment maintenance cost weekly and keep it within target (Maintenance <8% of revenue)?', 3, '2084f22f-6d5d-5b27-b5fc-bf59f4e26c49')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('towing', 'Is your insurance cost within target (Insurance <10% of revenue)?', 4, '76884c51-14ca-57da-9945-50b15c6c9e28')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TRADES (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('05a4d9f6-a3bd-573f-a47f-8efb7547cde7', 'trades', 'Cost Leak', 'trades.leak_01',
   'Callback rate too high', 'Track rework/callback frequency and cost per callback',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Callbacks <3% of jobs. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track rework/callback frequency and cost per callback', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f8e419d7-d266-56b4-aae2-530179f6ff57', 'trades', 'Revenue Leak', 'trades.leak_02',
   'Material markup below standard', 'Compare material cost vs client billed price',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Markup 20-30% on materials. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare material cost vs client billed price', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('31f0c0b5-4a87-57d2-b703-9969d4fbdb65', 'trades', 'Revenue Leak', 'trades.leak_03',
   'Underpriced service calls', 'Compare service call revenue to fully loaded cost',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Service call min $150+travel. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare service call revenue to fully loaded cost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('225798cc-1271-5ed6-8504-bf3218d46d68', 'trades', 'Cost Leak', 'trades.leak_04',
   'Vehicle cost per job too high', 'Track fuel, insurance, maintenance per vehicle per month',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Vehicle cost <$150/day all-in. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track fuel, insurance, maintenance per vehicle per month', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e4a50bf0-4af5-5b4f-aecb-78a473f2f946', 'trades', 'Revenue Leak', 'trades.leak_05',
   'Quote-to-close rate low', 'Track quotes issued vs jobs won',
   75.00, 'high', 'fixed_range', 3000.00, 20000.00,
   'Benchmark: Close rate >40%. Impact: $3,000–$20,000/year.',
   'Industry benchmark data', 'Track quotes issued vs jobs won', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for trades
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trades', 'Does your material markup meet the target of Markup 20-30% on materials?', 1, 'f8e419d7-d266-56b4-aae2-530179f6ff57')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trades', 'Do you regularly track rework/callback frequency and cost per callback?', 2, '05a4d9f6-a3bd-573f-a47f-8efb7547cde7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trades', 'Have you benchmarked your pricing recently (Service call min $150+travel)?', 3, '31f0c0b5-4a87-57d2-b703-9969d4fbdb65')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trades', 'Do you regularly track quotes issued vs jobs won?', 4, 'e4a50bf0-4af5-5b4f-aecb-78a473f2f946')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trades', 'Do you regularly track fuel, insurance, maintenance per vehicle per month?', 5, '225798cc-1271-5ed6-8504-bf3218d46d68')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TRAINING-COACHING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f94430b7-9b89-5d59-add0-26427a89e0aa', 'training-coaching', 'Revenue Leak', 'training-coaching.leak_01',
   'Revenue per client below $200/mo', 'Compare monthly client revenue to market',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue/client >$200/mo. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare monthly client revenue to market', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f00f7c5b-1d07-5f02-9654-f11f3c1c5b02', 'training-coaching', 'Revenue Leak', 'training-coaching.leak_02',
   'Client retention below 70%', 'Track client continuation rate',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >70%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client continuation rate', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f22a8ddf-ff0b-54cd-827b-1ab1588e6f40', 'training-coaching', 'Operational Leak', 'training-coaching.leak_03',
   'Session fill rate below 80%', 'Compare booked sessions to available slots',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Session utilization >80%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare booked sessions to available slots', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ad151b68-a4ec-57f4-bd32-314a97ec2fc0', 'training-coaching', 'Cost Leak', 'training-coaching.leak_04',
   'Marketing cost above 10% of revenue', 'Track CAC and marketing spend vs revenue',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Marketing <10% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track CAC and marketing spend vs revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for training-coaching
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('training-coaching', 'Does your client retention meet the target of Client retention >70%/yr?', 1, 'f00f7c5b-1d07-5f02-9654-f11f3c1c5b02')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('training-coaching', 'Does your revenue per client meet the target of Revenue/client >$200/mo?', 2, 'f94430b7-9b89-5d59-add0-26427a89e0aa')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('training-coaching', 'Does your session fill rate meet the target of Session utilization >80%?', 3, 'f22a8ddf-ff0b-54cd-827b-1ab1588e6f40')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('training-coaching', 'Is your marketing cost within target (Marketing <10% revenue)?', 4, 'ad151b68-a4ec-57f4-bd32-314a97ec2fc0')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TRANSLATION (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a42af6ea-7bc8-5650-8c06-512d896aaf6b', 'translation', 'Revenue Leak', 'translation.leak_01',
   'Billable utilization below 60%', 'Track billable hours / available hours',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Utilization >60%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track billable hours / available hours', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6e9a6c99-3dd2-5e1e-a27b-bdec2783934e', 'translation', 'Revenue Leak', 'translation.leak_02',
   'Scope creep not billed', 'Track hours over estimate and billing recovery',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Change orders billed 100%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track hours over estimate and billing recovery', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('56c229d0-02b4-519f-b79a-aaa1b151cfd7', 'translation', 'Revenue Leak', 'translation.leak_03',
   'Client retention below 75%', 'Track client departures and revenue lost',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Client retention >75%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track client departures and revenue lost', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('23658124-2f63-5044-bcf8-18685de87f9f', 'translation', 'Revenue Leak', 'translation.leak_04',
   'Revenue per word below market', 'Compare per-word rate to market benchmarks',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Rev/word at market rate by language. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare per-word rate to market benchmarks', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for translation
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('translation', 'Does your billable utilization meet the target of Utilization >60%?', 1, 'a42af6ea-7bc8-5650-8c06-512d896aaf6b')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('translation', 'Is your scope creep being billed?', 2, '6e9a6c99-3dd2-5e1e-a27b-bdec2783934e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('translation', 'Does your client retention meet the target of Client retention >75%/yr?', 3, '56c229d0-02b4-519f-b79a-aaa1b151cfd7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('translation', 'Does your revenue per word meet the target of Rev/word at market rate by language?', 4, '23658124-2f63-5044-bcf8-18685de87f9f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TRUCKING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('4c5ee32b-b4b5-5139-9244-3886c338fca1', 'trucking', 'Cost Leak', 'trucking.leak_01',
   'Deadhead miles above 15%', 'Compare empty miles to total miles driven',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Deadhead miles <15%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare empty miles to total miles driven', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('af67e8d1-3bde-5b6e-8c1a-55be37564799', 'trucking', 'Cost Leak', 'trucking.leak_02',
   'Fuel cost per mile above benchmark', 'Track fuel spend per loaded mile vs national average',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Fuel cost <$0.60/mile. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track fuel spend per loaded mile vs national average', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d0a7633b-1459-5bd2-842b-fed2f55f3213', 'trucking', 'Cost Leak', 'trucking.leak_03',
   'Driver turnover cost', 'Calculate recruitment+training cost per driver churned',
   75.00, 'high', 'fixed_range', 5000.00, 35000.00,
   'Benchmark: Driver retention >85%/yr. Impact: $5,000–$35,000/year.',
   'Industry benchmark data', 'Calculate recruitment+training cost per driver churned', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('82ca399a-7cdc-5836-9cdf-b046d0274ae5', 'trucking', 'Cost Leak', 'trucking.leak_04',
   'Maintenance cost per mile above norm', 'Compare per-mile maintenance cost to fleet age benchmark',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Maintenance <$0.20/mile. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare per-mile maintenance cost to fleet age benchmark', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('94accdec-18f2-50f6-a347-f4cf16535a46', 'trucking', 'Cost Leak', 'trucking.leak_05',
   'Insurance cost above peers', 'Benchmark insurance premiums per truck to industry',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Insurance <6% of revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Benchmark insurance premiums per truck to industry', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for trucking
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking', 'Is your deadhead miles within target (Deadhead miles <15%)?', 1, '4c5ee32b-b4b5-5139-9244-3886c338fca1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking', 'Is your fuel cost per mile within target (Fuel cost <$0.60/mile)?', 2, 'af67e8d1-3bde-5b6e-8c1a-55be37564799')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking', 'Is your driver turnover cost within target (Driver retention >85%/yr)?', 3, 'd0a7633b-1459-5bd2-842b-fed2f55f3213')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking', 'Is your maintenance cost per mile within target (Maintenance <$0.20/mile)?', 4, '82ca399a-7cdc-5836-9cdf-b046d0274ae5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking', 'Is your insurance cost within target (Insurance <6% of revenue)?', 5, '94accdec-18f2-50f6-a347-f4cf16535a46')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== TUTORING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('250ea418-fe82-5601-8799-8fa8d2ee8b22', 'tutoring', 'Revenue Leak', 'tutoring.leak_01',
   'Revenue per hour below $50', 'Compare hourly rate to local market',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue/hour >$50. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare hourly rate to local market', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('337d22e7-5fb2-5e39-8960-f9a20bbf3c1f', 'tutoring', 'Revenue Leak', 'tutoring.leak_02',
   'No-show rate above 10%', 'Track no-show frequency and revenue lost',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: No-show rate <10%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Track no-show frequency and revenue lost', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a82acf19-a2fc-514b-a49f-0889febb02b3', 'tutoring', 'Operational Leak', 'tutoring.leak_03',
   'Scheduling fill rate below 80%', 'Compare booked hours to available hours',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Schedule utilization >80%. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare booked hours to available hours', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('9521c604-6d05-5edc-aa2a-76985432f987', 'tutoring', 'Revenue Leak', 'tutoring.leak_04',
   'Student retention below 70%', 'Track students continuing term-to-term',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Student retention >70% per term. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track students continuing term-to-term', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for tutoring
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring', 'Does your revenue per hour meet the target of Revenue/hour >$50?', 1, '250ea418-fe82-5601-8799-8fa8d2ee8b22')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring', 'Does your student retention meet the target of Student retention >70% per term?', 2, '9521c604-6d05-5edc-aa2a-76985432f987')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring', 'Is your no-show rate within target (No-show rate <10%)?', 3, '337d22e7-5fb2-5e39-8960-f9a20bbf3c1f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring', 'Does your scheduling fill rate meet the target of Schedule utilization >80%?', 4, 'a82acf19-a2fc-514b-a49f-0889febb02b3')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== UPHOLSTERY (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('77e88dee-1fdb-5130-89fb-f7e8964c9426', 'upholstery', 'Revenue Leak', 'upholstery.leak_01',
   'Revenue per unit below market', 'Compare pricing to local market averages',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Revenue at market rate per service. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare pricing to local market averages', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('339f152c-b14f-59cc-8136-3a2c649abae5', 'upholstery', 'Cost Leak', 'upholstery.leak_02',
   'Labor/operator cost above 45%', 'Track labor cost as % of revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Labor <45% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track labor cost as % of revenue', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('51fd7b3c-e13f-506e-97f9-580bcdeda48e', 'upholstery', 'Cost Leak', 'upholstery.leak_03',
   'Supply/material cost above benchmark', 'Compare supply costs to industry norms',
   75.00, 'high', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Supplies benchmarked quarterly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare supply costs to industry norms', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for upholstery
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('upholstery', 'Does your revenue per unit meet the target of Revenue at market rate per service?', 1, '77e88dee-1fdb-5130-89fb-f7e8964c9426')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('upholstery', 'Is your labor/operator cost within target (Labor <45% revenue)?', 2, '339f152c-b14f-59cc-8136-3a2c649abae5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('upholstery', 'Is your supply/material cost within target (Supplies benchmarked quarterly)?', 3, '51fd7b3c-e13f-506e-97f9-580bcdeda48e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== VAPE-SMOKE-SHOP (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('e46be881-4808-5670-9e8e-1dccfe06cf56', 'vape-smoke-shop', 'Revenue Leak', 'vape-smoke-shop.leak_01',
   'Product margin below benchmark', 'Compare margin by product category',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Gross margin >45%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare margin by product category', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('bd047497-e97e-5665-afba-8cddafe97dbb', 'vape-smoke-shop', 'Compliance Leak', 'vape-smoke-shop.leak_02',
   'Compliance cost overrun', 'Audit license, age-verification, and regulatory costs',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Compliance <3% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Audit license, age-verification, and regulatory costs', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('01ae97ff-8f52-5b12-baf9-8a40320cf5a6', 'vape-smoke-shop', 'Cost Leak', 'vape-smoke-shop.leak_03',
   'Inventory turns too low', 'Track inventory age by SKU',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Turns >6x/yr. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track inventory age by SKU', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('a9c34327-cfe7-5615-b7ef-baa764f849d1', 'vape-smoke-shop', 'Revenue Leak', 'vape-smoke-shop.leak_04',
   'Online competition price erosion', 'Compare in-store prices to top online sellers',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Monitor online prices monthly. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Compare in-store prices to top online sellers', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for vape-smoke-shop
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('vape-smoke-shop', 'Does your product margin meet the target of Gross margin >45%?', 1, 'e46be881-4808-5670-9e8e-1dccfe06cf56')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('vape-smoke-shop', 'Do you track your compliance cost weekly and keep it within target (Compliance <3% revenue)?', 2, 'bd047497-e97e-5665-afba-8cddafe97dbb')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('vape-smoke-shop', 'Do you regularly track inventory age by sku?', 3, '01ae97ff-8f52-5b12-baf9-8a40320cf5a6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('vape-smoke-shop', 'Do you regularly compare in-store prices to top online sellers?', 4, 'a9c34327-cfe7-5615-b7ef-baa764f849d1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== VETERINARY (3 patterns, 3 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('01999161-360b-55f2-9cc9-4d89721eedb1', 'veterinary', 'Revenue Leak', 'veterinary.leak_01',
   'Avg transaction value below $200', 'Track average invoice per visit',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Avg transaction >$200. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track average invoice per visit', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('099f1b39-6dbe-5812-bb23-3388736800d5', 'veterinary', 'Revenue Leak', 'veterinary.leak_02',
   'No-show rate above 10%', 'Track missed appointments',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: No-show <10%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track missed appointments', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f0df1c16-9ff6-5367-a622-6ddda0fa8ab2', 'veterinary', 'Cost Leak', 'veterinary.leak_03',
   'Supply cost above 20% of revenue', 'Track medical supply cost per visit',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Supply cost <20% revenue. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track medical supply cost per visit', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for veterinary
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('veterinary', 'Does your avg transaction value meet the target of Avg transaction >$200?', 1, '01999161-360b-55f2-9cc9-4d89721eedb1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('veterinary', 'Is your no-show rate within target (No-show <10%)?', 2, '099f1b39-6dbe-5812-bb23-3388736800d5')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('veterinary', 'Is your supply cost within target (Supply cost <20% revenue)?', 3, 'f0df1c16-9ff6-5367-a622-6ddda0fa8ab2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== WAREHOUSING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('64a2fb48-5e8a-52dc-8457-8d67b11acba8', 'warehousing', 'Revenue Leak', 'warehousing.leak_01',
   'Space utilization below 85%', 'Compare occupied space to total available space',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Space utilization >85%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Compare occupied space to total available space', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('6b6218cb-61dd-5fd5-8cdc-6c4269f00ce7', 'warehousing', 'Operational Leak', 'warehousing.leak_02',
   'Pick accuracy below 99%', 'Track pick errors per 1000 orders',
   75.00, 'critical', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Pick accuracy >99%. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track pick errors per 1000 orders', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('b363a277-ee44-5ae5-baaf-023e813c9d53', 'warehousing', 'Cost Leak', 'warehousing.leak_03',
   'Labor cost per order above benchmark', 'Calculate labor cost divided by orders fulfilled',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Labor cost <$3/order picked. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Calculate labor cost divided by orders fulfilled', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5e26d5ff-0689-5bf8-b00d-4203499f78dd', 'warehousing', 'Cost Leak', 'warehousing.leak_04',
   'Damage rate above 1%', 'Track damaged goods as % of total handled',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Product damage <1%. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track damaged goods as % of total handled', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for warehousing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('warehousing', 'Does your space utilization meet the target of Space utilization >85%?', 1, '64a2fb48-5e8a-52dc-8457-8d67b11acba8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('warehousing', 'Does your pick accuracy meet the target of Pick accuracy >99%?', 2, '6b6218cb-61dd-5fd5-8cdc-6c4269f00ce7')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('warehousing', 'Is your labor cost per order within target (Labor cost <$3/order picked)?', 3, 'b363a277-ee44-5ae5-baaf-023e813c9d53')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('warehousing', 'Is your damage rate within target (Product damage <1%)?', 4, '5e26d5ff-0689-5bf8-b00d-4203499f78dd')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== WASTE-MANAGEMENT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('83f6b22c-99ce-5e3c-997a-183bb6fa450e', 'waste-management', 'Cost Leak', 'waste-management.leak_01',
   'Route inefficiency', 'Track stops per route and revenue per truck per day',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Revenue per route >$2,500/day. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Track stops per route and revenue per truck per day', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('209376d0-5e19-5a09-8f97-f325c54f3710', 'waste-management', 'Operational Leak', 'waste-management.leak_02',
   'Truck utilization below capacity', 'Compare actual tonnage per truck to rated capacity',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Truck utilization >80%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare actual tonnage per truck to rated capacity', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('ca21424b-6c91-5de3-9ceb-5cf45438f514', 'waste-management', 'Cost Leak', 'waste-management.leak_03',
   'Disposal cost per ton above contract', 'Audit disposal invoices against contract rates',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Compare actual vs contracted tip fees. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Audit disposal invoices against contract rates', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('2c481e99-550f-5f6e-94ae-802aa4ce7cb2', 'waste-management', 'Revenue Leak', 'waste-management.leak_04',
   'Recycling revenue not captured', 'Track recyclable diversion rate and commodity revenue',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Capture recyclable commodity value. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Track recyclable diversion rate and commodity revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d13e45b3-33f4-5b23-8020-ba6fc6ea4998', 'waste-management', 'Cost Leak', 'waste-management.leak_05',
   'Labor cost per ton excessive', 'Compare crew hours per route to benchmarks',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Labor <30% revenue. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare crew hours per route to benchmarks', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for waste-management
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('waste-management', 'Is your route inefficiency at target (Revenue per route >$2,500/day)?', 1, '83f6b22c-99ce-5e3c-997a-183bb6fa450e')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('waste-management', 'Is your disposal cost per ton within target (Compare actual vs contracted tip fees)?', 2, 'ca21424b-6c91-5de3-9ceb-5cf45438f514')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('waste-management', 'Does your truck utilization meet the target of Truck utilization >80%?', 3, '209376d0-5e19-5a09-8f97-f325c54f3710')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('waste-management', 'Do you regularly compare crew hours per route to benchmarks?', 4, 'd13e45b3-33f4-5b23-8020-ba6fc6ea4998')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('waste-management', 'Is your recycling revenue being captured?', 5, '2c481e99-550f-5f6e-94ae-802aa4ce7cb2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== WEB-DEVELOPMENT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('789be83c-50c1-5283-89a4-df07a366cef8', 'web-development', 'Revenue Leak', 'web-development.leak_01',
   'Billable utilization below 65%', 'Compare billable hours to total available hours per dev',
   75.00, 'critical', 'fixed_range', 5000.00, 40000.00,
   'Benchmark: Billable utilization >65%. Impact: $5,000–$40,000/year.',
   'Industry benchmark data', 'Compare billable hours to total available hours per dev', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f2b64755-e155-5242-8016-fe94b4eea1b1', 'web-development', 'Revenue Leak', 'web-development.leak_02',
   'Project scope creep unpaid', 'Track hours over estimate and change order billing',
   75.00, 'critical', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Scope changes billed 100%. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track hours over estimate and change order billing', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('7643e9e5-e519-50c3-a3cd-6b6e20abda8f', 'web-development', 'Revenue Leak', 'web-development.leak_03',
   'Hosting/maintenance margin below 60%', 'Compare hosting cost to hosting revenue per client',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Hosting margin >60%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare hosting cost to hosting revenue per client', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f3fc253e-7e88-5685-93cc-eb91b2cab27c', 'web-development', 'Revenue Leak', 'web-development.leak_04',
   'Client churn above 20%/yr', 'Track retainer client retention rate',
   75.00, 'high', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Retainer churn <20%/yr. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Track retainer client retention rate', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('02f09a14-0120-586e-a39a-e328bcb9c4a6', 'web-development', 'Cost Leak', 'web-development.leak_05',
   'Tool/license cost above 5% of revenue', 'Audit software subscriptions and licenses',
   75.00, 'medium', 'fixed_range', 1000.00, 8000.00,
   'Benchmark: Tool cost <5% revenue. Impact: $1,000–$8,000/year.',
   'Industry benchmark data', 'Audit software subscriptions and licenses', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for web-development
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('web-development', 'Does your billable utilization meet the target of Billable utilization >65%?', 1, '789be83c-50c1-5283-89a4-df07a366cef8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('web-development', 'Do you regularly track hours over estimate and change order billing?', 2, 'f2b64755-e155-5242-8016-fe94b4eea1b1')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('web-development', 'Is your client churn within target (Retainer churn <20%/yr)?', 3, 'f3fc253e-7e88-5685-93cc-eb91b2cab27c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('web-development', 'Does your hosting/maintenance margin meet the target of Hosting margin >60%?', 4, '7643e9e5-e519-50c3-a3cd-6b6e20abda8f')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('web-development', 'Is your tool/license cost within target (Tool cost <5% revenue)?', 5, '02f09a14-0120-586e-a39a-e328bcb9c4a6')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== WHOLESALE (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('efc0323f-9e66-546a-989b-a04473c968e8', 'wholesale', 'Revenue Leak', 'wholesale.leak_01',
   'Gross margin compression', 'Compare margin by product line to historical and industry',
   75.00, 'critical', 'fixed_range', 5000.00, 50000.00,
   'Benchmark: Gross margin >20%. Impact: $5,000–$50,000/year.',
   'Industry benchmark data', 'Compare margin by product line to historical and industry', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('31ed757b-dabf-53af-adb6-2dad2b3fe34c', 'wholesale', 'Cost Leak', 'wholesale.leak_02',
   'Inventory carrying cost excessive', 'Calculate carrying cost as % of avg inventory value',
   75.00, 'high', 'fixed_range', 3000.00, 40000.00,
   'Benchmark: Turns >6x/yr. Impact: $3,000–$40,000/year.',
   'Industry benchmark data', 'Calculate carrying cost as % of avg inventory value', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('d38a674d-d1c5-51b4-82ac-7e58fab6ae3d', 'wholesale', 'Cost Leak', 'wholesale.leak_03',
   'Warehouse cost per sqft above norm', 'Compare all-in warehouse cost per sqft to market',
   75.00, 'high', 'fixed_range', 2000.00, 20000.00,
   'Benchmark: Warehouse cost <$8/sqft/yr. Impact: $2,000–$20,000/year.',
   'Industry benchmark data', 'Compare all-in warehouse cost per sqft to market', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('0eb0d5fd-d1d1-537a-9d25-aa1f6fb99b01', 'wholesale', 'Cost Leak', 'wholesale.leak_04',
   'Shipping cost as % of revenue too high', 'Track shipping spend as % of invoiced revenue',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: Shipping <5% of revenue. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track shipping spend as % of invoiced revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('1c723756-8a07-5673-9b8b-feac7a1f4f55', 'wholesale', 'Cash Flow Leak', 'wholesale.leak_05',
   'AR days above 45', 'Track average days to collect by customer tier',
   75.00, 'high', 'fixed_range', 3000.00, 30000.00,
   'Benchmark: AR days <45. Impact: $3,000–$30,000/year.',
   'Industry benchmark data', 'Track average days to collect by customer tier', 5)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for wholesale
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wholesale', 'Do you regularly compare margin by product line to historical and industry?', 1, 'efc0323f-9e66-546a-989b-a04473c968e8')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wholesale', 'Do you calculate carrying cost as % of avg inventory value?', 2, '31ed757b-dabf-53af-adb6-2dad2b3fe34c')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wholesale', 'Do you regularly track shipping spend as % of invoiced revenue?', 3, '0eb0d5fd-d1d1-537a-9d25-aa1f6fb99b01')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wholesale', 'Is your ar days within target (AR days <45)?', 4, '1c723756-8a07-5673-9b8b-feac7a1f4f55')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wholesale', 'Is your warehouse cost per sqft within target (Warehouse cost <$8/sqft/yr)?', 5, 'd38a674d-d1c5-51b4-82ac-7e58fab6ae3d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== WOODWORKING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('70a6ae06-d8ec-5313-966b-2e1e6d1d97ae', 'woodworking', 'Cost Leak', 'woodworking.leak_01',
   'Material yield below 80%', 'Compare lumber input to finished product output',
   75.00, 'critical', 'fixed_range', 3000.00, 25000.00,
   'Benchmark: Board-foot yield >80%. Impact: $3,000–$25,000/year.',
   'Industry benchmark data', 'Compare lumber input to finished product output', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('814df5e4-8b3d-5e27-8619-971f34fc30d4', 'woodworking', 'Revenue Leak', 'woodworking.leak_02',
   'Custom vs production ratio unbalanced', 'Compare custom job margin to production run margin',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Custom work priced at >40% premium. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare custom job margin to production run margin', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('f0c8e8c9-b321-509e-9d28-b27f85640586', 'woodworking', 'Operational Leak', 'woodworking.leak_03',
   'Equipment maintenance overdue', 'Track preventive maintenance completion vs schedule',
   75.00, 'high', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: PM schedule adherence >90%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track preventive maintenance completion vs schedule', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('c3d11f17-d605-5a49-bf8c-e0118c9cc02d', 'woodworking', 'Cost Leak', 'woodworking.leak_04',
   'Finishing cost per unit above benchmark', 'Compare stain/finish material cost per sqft to spec',
   75.00, 'medium', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Finish cost <12% of COGS. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Compare stain/finish material cost per sqft to spec', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for woodworking
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('woodworking', 'Does your material yield meet the target of Board-foot yield >80%?', 1, '70a6ae06-d8ec-5313-966b-2e1e6d1d97ae')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('woodworking', 'Do you regularly compare custom job margin to production run margin?', 2, '814df5e4-8b3d-5e27-8619-971f34fc30d4')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('woodworking', 'Do you regularly track preventive maintenance completion vs schedule?', 3, 'f0c8e8c9-b321-509e-9d28-b27f85640586')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('woodworking', 'Is your finishing cost per unit within target (Finish cost <12% of COGS)?', 4, 'c3d11f17-d605-5a49-bf8c-e0118c9cc02d')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;

-- ========== YOGA-STUDIO (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('42d43094-847e-5631-b35f-c9bc31e5f5ba', 'yoga-studio', 'Revenue Leak', 'yoga-studio.leak_01',
   'Class fill rate below 65%', 'Compare attendees to room capacity per class',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Class fill rate >65%. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Compare attendees to room capacity per class', 1)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('5eb0a394-6816-51d9-a696-6b170f5287ff', 'yoga-studio', 'Revenue Leak', 'yoga-studio.leak_02',
   'Member retention below 65%', 'Track monthly cancellations',
   75.00, 'critical', 'fixed_range', 2000.00, 15000.00,
   'Benchmark: Retention >65%/yr. Impact: $2,000–$15,000/year.',
   'Industry benchmark data', 'Track monthly cancellations', 2)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('80b077dd-6308-5f32-b1eb-2b78d33e48d2', 'yoga-studio', 'Cost Leak', 'yoga-studio.leak_03',
   'Teacher cost above 35% of revenue', 'Track per-class instructor cost vs class revenue',
   75.00, 'high', 'fixed_range', 1000.00, 10000.00,
   'Benchmark: Teacher cost <35% revenue. Impact: $1,000–$10,000/year.',
   'Industry benchmark data', 'Track per-class instructor cost vs class revenue', 3)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_fixed_low, loss_fixed_high,
   impact_statement, evidence_line, fix_description, display_order)
VALUES
  ('8d7a7a75-4067-5731-90d3-4fad20e7660a', 'yoga-studio', 'Revenue Leak', 'yoga-studio.leak_04',
   'Retail revenue below 5%', 'Track product sales as % of revenue',
   75.00, 'medium', 'fixed_range', 500.00, 5000.00,
   'Benchmark: Retail >5% of total. Impact: $500–$5,000/year.',
   'Industry benchmark data', 'Track product sales as % of revenue', 4)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description,
  probability_pct=EXCLUDED.probability_pct, severity=EXCLUDED.severity,
  loss_type=EXCLUDED.loss_type, loss_fixed_low=EXCLUDED.loss_fixed_low,
  loss_fixed_high=EXCLUDED.loss_fixed_high,
  impact_statement=EXCLUDED.impact_statement, fix_description=EXCLUDED.fix_description;

-- Quiz Questions for yoga-studio
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga-studio', 'Does your class fill rate meet the target of Class fill rate >65%?', 1, '42d43094-847e-5631-b35f-c9bc31e5f5ba')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga-studio', 'Does your member retention meet the target of Retention >65%/yr?', 2, '5eb0a394-6816-51d9-a696-6b170f5287ff')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga-studio', 'Is your teacher cost within target (Teacher cost <35% revenue)?', 3, '80b077dd-6308-5f32-b1eb-2b78d33e48d2')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga-studio', 'Does your retail revenue meet the target of Retail >5% of total?', 4, '8d7a7a75-4067-5731-90d3-4fad20e7660a')
ON CONFLICT (industry, question_order) DO UPDATE SET
  question_text=EXCLUDED.question_text, no_leak_pattern_id=EXCLUDED.no_leak_pattern_id;


-- ============================================================
-- COMPLETE: 673 patterns + 671 questions across 156 industries
-- ============================================================