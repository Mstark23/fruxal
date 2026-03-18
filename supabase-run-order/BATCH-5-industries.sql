-- ═══════════════════════════════════════════════════════════════
-- BATCH 5 of 7: 45 Industries — 229 Patterns + 214 Quiz Questions
-- This is the big one. May take 10-15 seconds.
-- ═══════════════════════════════════════════════════════════════
-- ============================================================
-- LEAK & GROW: PRE-SCAN v3 - FULL INDUSTRY SEED DATA
-- 20 Industries, Generated February 2026
-- ============================================================


-- ========== RESTAURANT (10 patterns, 7 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7d6220d0-4cf5-5905-a18e-5d75a40bcc82', 'restaurant', 'Cost Control', 'restaurant.food_cost_leak',
   'Food Cost Overrun', 'Food costs running 5-10% over ideal target, bleeding margin on every plate.',
   87.00, 'critical', 'pct_of_revenue', 0.0300, 0.0650, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NRA benchmark data', 'Implement weekly food cost tracking with automated waste monitoring.', 'Food Cost Mgmt', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d52f4c44-3a53-5e10-9bc0-d0c66d0ca52a', 'restaurant', 'Labor', 'restaurant.gut_scheduling',
   'Labor Scheduled by Gut', 'Scheduling based on feel instead of historical sales data leads to overstaffing slow shifts.',
   81.00, 'critical', 'pct_of_revenue', 0.0200, 0.0500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Industry labor benchmarks', 'Use sales-driven scheduling software.', 'Workforce Mgmt', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4adc0994-2f86-5669-8faa-166ef9415a8a', 'restaurant', 'Pricing', 'restaurant.menu_not_priced',
   'Menu Not Priced for Profit', 'Prices set by gut feel, not food cost targets. Some items profitable, many are not.',
   68.00, 'high', 'pct_of_revenue', 0.0150, 0.0400, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Menu engineering studies', 'Menu engineering analysis with strategic pricing.', 'Menu Consulting', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('dad122ee-444e-53cd-a133-cfac145a71d5', 'restaurant', 'Cost Control', 'restaurant.inventory_waste',
   'Inventory Waste Not Tracked', 'Spoilage, over-prep, and waste are invisible without tracking systems.',
   76.00, 'high', 'fixed_range', NULL, NULL, 600.00, 1800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NRA food waste data', 'Implement inventory tracking with waste logging.', 'Inventory Mgmt', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('f612a7ae-5103-5029-bf86-0cb31de05077', 'restaurant', 'Retention', 'restaurant.no_retention',
   'No Customer Retention Program', 'Every customer walks out with no reason to return. No loyalty, no email, no follow-up.',
   83.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Repeat customer value data', 'Launch loyalty program with email/SMS follow-up.', 'CRM / Loyalty', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('56393948-32ab-53db-b8a7-e9dce3f34920', 'restaurant', 'Revenue', 'restaurant.no_upsell',
   'No Upsell Training', 'Staff take orders instead of selling. No appetizer suggestions, no drink pairings.',
   79.00, 'medium', 'fixed_range', NULL, NULL, 300.00, 900.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Average check increase studies', 'Implement upsell training with suggestive selling scripts.', 'Staff Training', 6);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('bdcffcdc-d9fe-5baa-912f-ea1459dcee3a', 'restaurant', 'Marketing', 'restaurant.no_google',
   'Google Business Not Optimized', 'Google Business Profile unclaimed, incomplete, or not optimized for local search.',
   61.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Local search impact data', 'Optimize Google Business with photos, posts, reviews.', 'Local SEO', 7);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('508d831a-fb38-586e-960d-8ab758c4bded', 'restaurant', 'Labor', 'restaurant.staff_turnover',
   'Staff Turnover Above Average', 'High turnover means constant recruiting, training, and lost productivity.',
   74.00, 'high', 'per_employee', NULL, NULL, NULL, NULL, 150.00,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NRA turnover cost studies', 'Improve retention with competitive pay and growth paths.', 'HR / Training', 8);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('dc42814b-ef2c-57c3-a32f-5d29babb1ba1', 'restaurant', 'Technology', 'restaurant.no_online_ordering',
   'No Online Ordering', 'Missing the fastest-growing revenue channel in food service.',
   55.00, 'high', 'fixed_range', NULL, NULL, 900.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Off-premise dining trends', 'Implement integrated online ordering.', 'POS / Online Ordering', 9);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('230da735-3bf9-54ff-8dac-9de972458de1', 'restaurant', 'Cost Control', 'restaurant.no_portion_control',
   'No Portion Control', 'Every cook makes plates differently — inconsistent and wasteful.',
   72.00, 'high', 'fixed_range', NULL, NULL, 800.00, 2200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NRA food waste studies', 'Standardize recipes with portion tools.', 'Kitchen Ops', 10);

-- Quiz Questions for restaurant
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Do you track your food cost percentage weekly?', 1, '7d6220d0-4cf5-5905-a18e-5d75a40bcc82');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Do you use software to schedule staff based on sales forecasts?', 2, 'd52f4c44-3a53-5e10-9bc0-d0c66d0ca52a');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Have you done a menu profitability analysis in the last 12 months?', 3, '4adc0994-2f86-5669-8faa-166ef9415a8a');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Do you track inventory waste and spoilage systematically?', 4, 'dad122ee-444e-53cd-a133-cfac145a71d5');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Do you have an active customer loyalty or retention program?', 5, 'f612a7ae-5103-5029-bf86-0cb31de05077');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Do you train your staff on upselling and suggestive selling?', 6, '56393948-32ab-53db-b8a7-e9dce3f34920');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('restaurant', 'Is your Google Business Profile fully optimized with recent photos and posts?', 7, 'bdcffcdc-d9fe-5baa-912f-ea1459dcee3a');

-- ========== RETAIL (8 patterns, 7 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9a311810-38a9-54f0-a1b5-26d7f4541ffe', 'retail', 'Inventory', 'retail.shrinkage',
   'Inventory Shrinkage Above 1.5%', 'Theft, admin errors, and supplier fraud eating into inventory value.',
   82.00, 'critical', 'pct_of_revenue', 0.0150, 0.0400, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NRF shrinkage survey', 'Implement loss prevention tech and inventory audits.', 'Loss Prevention', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('f88f7549-31d0-5a76-bfa2-1cd818d63adf', 'retail', 'Sales', 'retail.no_clienteling',
   'No Customer Data or Clienteling', 'No system to remember customer preferences, purchase history, or contact info.',
   71.00, 'high', 'fixed_range', NULL, NULL, 800.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Retail CRM impact studies', 'Implement POS with customer tracking and CRM.', 'CRM / POS', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6157bd26-a5fd-541e-a40f-3643a846abf4', 'retail', 'Pricing', 'retail.markdown_timing',
   'Markdown Timing Costing Margin', 'Markdowns too early lose margin, too late means dead stock. No data-driven approach.',
   66.00, 'high', 'pct_of_revenue', 0.0100, 0.0350, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Markdown optimization data', 'Use sell-through rate analytics to time markdowns.', 'Pricing / Merch', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b95bcabe-ea20-564c-b31a-0b198476c4ca', 'retail', 'Inventory', 'retail.stockouts',
   'Stockouts Losing Sales', 'Popular items out of stock means customers leave empty-handed or buy from competitors.',
   73.00, 'critical', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'IHL Group stockout studies', 'Implement demand forecasting and auto-reorder points.', 'Inventory Mgmt', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('68f32239-5fda-5ec3-8c12-346fd297b51a', 'retail', 'Marketing', 'retail.no_email_marketing',
   'No Email/SMS Marketing', 'Customers buy once and never hear from you again unless they walk by.',
   59.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 1800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Retail email ROI data', 'Launch email/SMS campaigns with segmented lists.', 'Email Marketing', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fbb68b77-0b7b-5426-afe3-e579d1585558', 'retail', 'Analytics', 'retail.no_foot_traffic',
   'Foot Traffic Not Measured', 'No way to know conversion rate from visitors to buyers or peak traffic times.',
   77.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'People counter ROI data', 'Install foot traffic counters and analytics.', 'Retail Analytics', 6);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('68011dd5-d8b8-5641-ba24-8f747a5412dc', 'retail', 'Labor', 'retail.scheduling_not_optimized',
   'Staff Scheduling Not Optimized', 'Overstaffed during slow hours, understaffed during rushes.',
   69.00, 'high', 'fixed_range', NULL, NULL, 900.00, 2800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Labor scheduling studies', 'Use traffic-based scheduling software.', 'Workforce Mgmt', 7);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2438d285-b158-5a98-9d7b-c2e882a256e5', 'retail', 'Retention', 'retail.no_loyalty',
   'No Loyalty/Rewards Program', 'No program to incentivize repeat visits or increase average basket size.',
   64.00, 'medium', 'fixed_range', NULL, NULL, 600.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Customer lifetime value data', 'Launch points-based loyalty program.', 'Loyalty Platform', 8);

-- Quiz Questions for retail
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you conduct regular inventory audits (at least monthly)?', 1, '9a311810-38a9-54f0-a1b5-26d7f4541ffe');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you have a system to track individual customer purchase history?', 2, 'f88f7549-31d0-5a76-bfa2-1cd818d63adf');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you use data to decide when and how much to markdown items?', 3, '6157bd26-a5fd-541e-a40f-3643a846abf4');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you have automated reorder points for your best-selling products?', 4, 'b95bcabe-ea20-564c-b31a-0b198476c4ca');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you actively market to past customers via email or SMS?', 5, '68f32239-5fda-5ec3-8c12-346fd297b51a');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you measure foot traffic and conversion rate in your store?', 6, 'fbb68b77-0b7b-5426-afe3-e579d1585558');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('retail', 'Do you have a customer loyalty or rewards program?', 7, '2438d285-b158-5a98-9d7b-c2e882a256e5');

-- ========== ECOMMERCE (8 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('42a97311-0926-5810-b84d-4dde91cad080', 'ecommerce', 'Conversion', 'ecommerce.cart_abandonment',
   'Cart Abandonment Above 70%', 'Customers add items to cart and leave without purchasing.',
   88.00, 'critical', 'pct_of_revenue', 0.0400, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Baymard Institute studies', 'Optimize checkout flow, add trust signals, exit-intent recovery.', 'CRO / Email', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8bbcbe36-97cb-5ddd-9fe7-5241d4f0a4a8', 'ecommerce', 'Retention', 'ecommerce.no_cart_recovery',
   'No Abandoned Cart Emails', 'Customers who abandon cart never hear from you again.',
   62.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Email recovery rate data', 'Set up 3-email abandoned cart sequence.', 'Email Marketing', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4cbbc3c3-de20-5861-8cdb-02e43390da3e', 'ecommerce', 'Conversion', 'ecommerce.no_trust_signals',
   'Missing Trust Signals', 'No reviews, no guarantees, no security badges on product pages.',
   71.00, 'high', 'pct_of_revenue', 0.0150, 0.0500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Conversion rate studies', 'Add reviews, guarantee badges, secure checkout icons.', 'CRO', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('75a3c34a-dc39-5413-8e31-31d041bcf70c', 'ecommerce', 'Conversion', 'ecommerce.shipping_dropoff',
   'Shipping Costs Kill Checkout', 'Unexpected shipping costs are the #1 reason for checkout abandonment.',
   79.00, 'critical', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Free shipping threshold data', 'Implement free shipping threshold or build into pricing.', 'Fulfillment / 3PL', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7d9c7adf-e08a-5710-b6fe-b82308069d3d', 'ecommerce', 'Marketing', 'ecommerce.no_retargeting',
   'No Retargeting', '97% of first-time visitors don''t buy. Without retargeting, they''re gone forever.',
   67.00, 'high', 'pct_of_revenue', 0.0100, 0.0500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Retargeting ROI studies', 'Set up pixel-based retargeting on Meta and Google.', 'Paid Ads / CRO', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('3a61ea64-1100-501f-a906-bee960dc5871', 'ecommerce', 'Retention', 'ecommerce.no_post_purchase',
   'No Post-Purchase Emails', 'Customer buys once and never hears from you again.',
   74.00, 'medium', 'pct_of_revenue', 0.0080, 0.0250, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Repeat purchase rate data', 'Build 5-email post-purchase nurture sequence.', 'Email Marketing', 6);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ae13f162-65e0-5cb3-8f67-2078fa1b58f1', 'ecommerce', 'Technology', 'ecommerce.slow_site',
   'Site Loads Over 3 Seconds', 'Every second of load time costs 7% in conversions.',
   58.00, 'high', 'pct_of_revenue', 0.0100, 0.0350, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Page speed conversion data', 'Optimize images, enable CDN, upgrade hosting.', 'Web Dev / Hosting', 7);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8be171bc-6072-58ca-a797-45d8cf8596e5', 'ecommerce', 'Conversion', 'ecommerce.no_reviews',
   'No Customer Review System', 'Products without reviews convert at a fraction of reviewed products.',
   54.00, 'high', 'pct_of_revenue', 0.0100, 0.0400, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Social proof impact data', 'Implement post-purchase review collection.', 'Review Platform', 8);

-- Quiz Questions for ecommerce
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Do you have an abandoned cart email sequence?', 1, '8bbcbe36-97cb-5ddd-9fe7-5241d4f0a4a8');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Do your product pages show customer reviews?', 2, '8be171bc-6072-58ca-a797-45d8cf8596e5');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Do you offer free shipping (or a clear free shipping threshold)?', 3, '75a3c34a-dc39-5413-8e31-31d041bcf70c');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Do you retarget visitors who leave without buying?', 4, '7d9c7adf-e08a-5710-b6fe-b82308069d3d');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Do you send post-purchase follow-up emails?', 5, '3a61ea64-1100-501f-a906-bee960dc5871');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('ecommerce', 'Does your site load in under 3 seconds on mobile?', 6, 'ae13f162-65e0-5cb3-8f67-2078fa1b58f1');

-- ========== CONSTRUCTION (8 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('da2ef32d-6942-57f1-8973-8232c8601ec1', 'construction', 'Estimating', 'construction.low_estimates',
   'Estimates Too Low', 'Bids underestimate true costs. You win jobs but leave margin on the table.',
   84.00, 'critical', 'pct_of_revenue', 0.0400, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'CFMA benchmark data', 'Implement estimating software with historical cost tracking.', 'Estimating Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7cb8bfd8-02f9-5380-8106-0733c207edee', 'construction', 'Project Mgmt', 'construction.change_orders',
   'Change Orders Not Captured', 'Scope changes happen but aren''t documented and billed. Free work adds up.',
   77.00, 'critical', 'pct_of_revenue', 0.0250, 0.0700, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'CFMA change order data', 'Formalize change order process with digital docs.', 'Project Mgmt', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('e3a7e012-6751-55e6-8b2c-9d150e4e2d92', 'construction', 'Sales', 'construction.no_bid_followup',
   'No Bid Follow-Up System', 'Bids go out and nobody follows up. 50% of lost bids could be won.',
   82.00, 'high', 'pct_of_revenue', 0.0300, 0.0700, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Bid follow-up studies', 'Implement CRM with automated bid follow-up sequences.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('716c8905-1f01-573e-a3cb-35423d9c9b48', 'construction', 'Accounting', 'construction.no_job_costing',
   'No Job Costing System', 'Without job-level P&L, you don''t know which jobs make money.',
   65.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'CFMA profitability data', 'Implement job costing with time tracking.', 'Accounting / ERP', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('084b8f2e-1936-5a7b-add4-279050b1e286', 'construction', 'Labor', 'construction.crew_utilization',
   'Crew Utilization Gaps', 'Crews idle between jobs, traveling inefficiently, or mismatched to requirements.',
   71.00, 'high', 'pct_of_revenue', 0.0200, 0.0500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Labor utilization studies', 'Use crew scheduling software with GPS tracking.', 'Workforce Mgmt', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c6ad2bee-eae2-5e11-9090-0aa9b75cf6ac', 'construction', 'Cost Control', 'construction.materials_waste',
   'Materials Waste Above Norm', 'Over-ordering, damage, theft, poor storage eating material margins.',
   68.00, 'high', 'pct_of_revenue', 0.0150, 0.0400, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Construction waste data', 'Implement materials tracking with just-in-time ordering.', 'Materials Mgmt', 6);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fb557e5b-c440-578d-85ad-7a8e4d2b0b1f', 'construction', 'Quality', 'construction.warranty_callbacks',
   'Warranty Callbacks', 'Callbacks to fix warranty issues are 100% cost with 0% revenue.',
   59.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Warranty cost benchmarks', 'Improve QC checklists and final walkthrough processes.', 'Quality Control', 7);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fde91e73-95f4-53f3-99f7-8fbe8fff2c8f', 'construction', 'Estimating', 'construction.sub_markup',
   'Sub Markup Not Optimized', 'Sub markup set by habit, not market data.',
   73.00, 'medium', 'pct_of_revenue', 0.0100, 0.0350, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Sub markup benchmarks', 'Analyze historical sub costs to optimize markup by trade.', 'Estimating', 8);

-- Quiz Questions for construction
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you use estimating software with historical cost data?', 1, 'da2ef32d-6942-57f1-8973-8232c8601ec1');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you have a formal change order process with documentation?', 2, '7cb8bfd8-02f9-5380-8106-0733c207edee');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you systematically follow up on every bid you submit?', 3, 'e3a7e012-6751-55e6-8b2c-9d150e4e2d92');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you track profitability per job after completion?', 4, '716c8905-1f01-573e-a3cb-35423d9c9b48');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you use scheduling software for crew deployment?', 5, '084b8f2e-1936-5a7b-add4-279050b1e286');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('construction', 'Do you track materials waste on each job?', 6, 'c6ad2bee-eae2-5e11-9090-0aa9b75cf6ac');

-- ========== HEALTHCARE (7 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2e652a0f-c759-50db-8cf6-a4b657555387', 'healthcare', 'Revenue', 'healthcare.no_show_rate',
   'No-Show Rate Above 5%', 'Empty appointment slots are pure revenue loss with fixed overhead still running.',
   79.00, 'critical', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'MGMA benchmark data', 'Implement automated reminders and no-show fee policy.', 'Patient Scheduling', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c7690858-786d-5b28-a779-7ce19d878538', 'healthcare', 'Billing', 'healthcare.coding_errors',
   'Coding/Billing Errors', 'Incorrect coding leads to underbilling, denials, and delayed payments.',
   67.00, 'critical', 'pct_of_revenue', 0.0300, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'AAPC billing error rates', 'Hire certified coder or outsource billing review.', 'Medical Billing', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8a544976-5ebe-5966-bade-05862a541151', 'healthcare', 'Billing', 'healthcare.claim_denials',
   'Insurance Denials Above 5%', 'Claims denied due to errors, missing info, or coding issues.',
   63.00, 'high', 'pct_of_revenue', 0.0200, 0.0700, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'MGMA denial rate data', 'Implement claim scrubbing before submission.', 'Revenue Cycle', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('41a16810-0e69-59f8-bce8-f985e97f4b09', 'healthcare', 'Marketing', 'healthcare.patient_acquisition',
   'High Patient Acquisition Cost', 'Spending too much to acquire each new patient with no tracking on ROI.',
   72.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Healthcare marketing ROI', 'Implement digital marketing with patient source tracking.', 'Healthcare Mktg', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6430683a-6a16-5ff7-9381-fc4ed39c7f3b', 'healthcare', 'Retention', 'healthcare.no_retention',
   'No Patient Retention Program', 'Patients leave for other providers with no follow-up or engagement system.',
   81.00, 'medium', 'fixed_range', NULL, NULL, 1000.00, 3500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Patient lifetime value data', 'Launch patient engagement and recall campaigns.', 'Patient Engagement', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d978a876-372a-5b9b-ad80-3ca458b802ce', 'healthcare', 'Operations', 'healthcare.no_online_scheduling',
   'No Online Scheduling', 'Patients must call during office hours to book, losing after-hours demand.',
   52.00, 'medium', 'fixed_range', NULL, NULL, 600.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Online booking impact data', 'Implement 24/7 online scheduling portal.', 'Patient Scheduling', 6);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d4c27c95-31f5-5aad-8108-6817694bbf5b', 'healthcare', 'Operations', 'healthcare.intake_inefficiency',
   'Slow Patient Intake', 'Paper forms, manual data entry, and slow check-in eating into appointment time.',
   66.00, 'high', 'fixed_range', NULL, NULL, 1200.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Intake efficiency studies', 'Digital intake forms with pre-visit completion.', 'Practice Mgmt', 7);

-- Quiz Questions for healthcare
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Do you have automated appointment reminders (text/email)?', 1, '2e652a0f-c759-50db-8cf6-a4b657555387');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Do you audit your billing codes for accuracy at least quarterly?', 2, 'c7690858-786d-5b28-a779-7ce19d878538');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Is your insurance claim denial rate below 5%?', 3, '8a544976-5ebe-5966-bade-05862a541151');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Do you track which marketing channels bring in new patients?', 4, '41a16810-0e69-59f8-bce8-f985e97f4b09');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Do you have a system to re-engage patients who haven''t visited in 6+ months?', 5, '6430683a-6a16-5ff7-9381-fc4ed39c7f3b');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('healthcare', 'Can patients book appointments online 24/7?', 6, 'd978a876-372a-5b9b-ad80-3ca458b802ce');

-- ========== SAAS (7 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4da02e8b-7b7d-5636-aeaf-acfc4fd2c0cc', 'saas', 'Conversion', 'saas.trial_conversion',
   'Trial-to-Paid Below 15%', 'Free trial users aren''t converting to paid plans.',
   76.00, 'critical', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'SaaS benchmark reports', 'Optimize onboarding flow and activation metrics.', 'CRO / Onboarding', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7ac333d6-eb50-59b0-9a89-e75ce103126c', 'saas', 'Retention', 'saas.churn_rate',
   'Churn Above Industry Average', 'Customers leaving faster than you can replace them.',
   71.00, 'critical', 'pct_of_revenue', 0.0300, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Profitwell churn data', 'Implement customer health scoring and proactive outreach.', 'Customer Success', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('921e6c60-e276-551b-ada7-b03c7e744af7', 'saas', 'Conversion', 'saas.pricing_page',
   'Pricing Page Not Optimized', 'Confusing tiers, no anchoring, hidden pricing killing conversions.',
   83.00, 'high', 'pct_of_revenue', 0.0150, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pricing psychology data', 'Redesign pricing with anchoring and clear value props.', 'Pricing Strategy', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('015ceee0-4228-5695-8d55-59d2db6a16db', 'saas', 'Revenue', 'saas.no_expansion',
   'No Expansion Revenue Strategy', 'Not upselling, cross-selling, or growing existing accounts.',
   72.00, 'high', 'pct_of_revenue', 0.0200, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Net revenue retention data', 'Build upgrade paths and usage-based expansion triggers.', 'Product / Growth', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6fe8054d-abb6-5dd7-ad78-2c14156185f1', 'saas', 'Retention', 'saas.no_onboarding_emails',
   'No Onboarding Email Sequence', 'New users get no guided activation and drift away.',
   58.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Onboarding impact studies', 'Build behavior-triggered onboarding email series.', 'Email / Product', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2a7ffc30-1c5e-510a-8bd4-1ed32519b137', 'saas', 'Billing', 'saas.no_dunning',
   'No Failed Payment Recovery', 'Failed credit cards silently churning paying customers.',
   55.00, 'medium', 'pct_of_revenue', 0.0100, 0.0400, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Involuntary churn data', 'Implement dunning emails and card update flows.', 'Billing / Dunning', 6);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b4d833ca-c01f-5f09-8986-c689442cde33', 'saas', 'Pricing', 'saas.no_annual_plan',
   'No Annual Plan Incentive', 'Missing predictable revenue and higher LTV from annual commitments.',
   64.00, 'medium', 'pct_of_revenue', 0.0100, 0.0400, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Annual vs monthly data', 'Offer 15-20% discount for annual commitment.', 'Pricing Strategy', 7);

-- Quiz Questions for saas
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Is your free trial to paid conversion rate above 15%?', 1, '4da02e8b-7b7d-5636-aeaf-acfc4fd2c0cc');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Is your monthly churn rate below 5%?', 2, '7ac333d6-eb50-59b0-9a89-e75ce103126c');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Have you A/B tested your pricing page in the last 6 months?', 3, '921e6c60-e276-551b-ada7-b03c7e744af7');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Do you have a systematic upsell/expansion revenue strategy?', 4, '015ceee0-4228-5695-8d55-59d2db6a16db');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Do you have an automated onboarding email sequence?', 5, '6fe8054d-abb6-5dd7-ad78-2c14156185f1');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('saas', 'Do you have automated recovery for failed payments?', 6, '2a7ffc30-1c5e-510a-8bd4-1ed32519b137');

-- ========== SALON SPA (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a87956cc-0b79-523c-9b61-f5d3d87c54cb', 'salon_spa', 'Revenue', 'salon.no_show_rate',
   'No-Show / Late Cancel Rate', 'Empty chairs are pure lost revenue with staff still on the clock.',
   78.00, 'critical', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Salon industry benchmarks', 'Implement deposit policy and automated reminders.', 'Booking Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('35850497-5bd4-5d1b-8afd-17cd8b5fbe14', 'salon_spa', 'Retention', 'salon.no_rebooking',
   'No Rebooking System', 'Clients leave without their next appointment scheduled.',
   72.00, 'high', 'fixed_range', NULL, NULL, 800.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Salon rebooking rate studies', 'Train staff to rebook at checkout + automated reminders.', 'Booking Software', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ac7bff94-7af0-5f4a-922e-9c672a6546bb', 'salon_spa', 'Pricing', 'salon.underpriced',
   'Services Underpriced', 'Prices haven''t kept up with costs, competitors, or market rates.',
   69.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Industry pricing surveys', 'Conduct competitive pricing analysis and adjust.', 'Business Consulting', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2bc28306-66c4-5458-8af0-396ca2af2444', 'salon_spa', 'Revenue', 'salon.no_retail',
   'Retail Product Sales Weak', 'Not selling take-home products that extend the service experience.',
   74.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Salon retail benchmarks', 'Train staff on product recommendations at service.', 'Staff Training', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('1d2f4539-2805-527f-ab3e-5b4339716c34', 'salon_spa', 'Marketing', 'salon.no_referral',
   'No Referral Program', 'Happy clients have no incentive to bring friends.',
   68.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Referral program ROI data', 'Launch refer-a-friend rewards program.', 'Marketing', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('5abfd60f-0a05-5114-b2c0-9e25f1ac1804', 'salon_spa', 'Marketing', 'salon.no_online_presence',
   'Weak Online Presence', 'No social media strategy, outdated website, poor review management.',
   61.00, 'medium', 'fixed_range', NULL, NULL, 300.00, 1200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Beauty industry digital trends', 'Build Instagram/social presence with before/after content.', 'Social Media Mgmt', 6);

-- Quiz Questions for salon_spa
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('salon_spa', 'Do you require deposits or have a no-show policy with automated reminders?', 1, 'a87956cc-0b79-523c-9b61-f5d3d87c54cb');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('salon_spa', 'Do your staff rebook clients before they leave?', 2, '35850497-5bd4-5d1b-8afd-17cd8b5fbe14');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('salon_spa', 'Have you raised your prices in the last 12 months?', 3, 'ac7bff94-7af0-5f4a-922e-9c672a6546bb');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('salon_spa', 'Do your stylists/therapists actively recommend retail products?', 4, '2bc28306-66c4-5458-8af0-396ca2af2444');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('salon_spa', 'Do you have an active referral rewards program?', 5, '1d2f4539-2805-527f-ab3e-5b4339716c34');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('salon_spa', 'Do you consistently post on social media at least 3x per week?', 6, '5abfd60f-0a05-5114-b2c0-9e25f1ac1804');

-- ========== AUTO REPAIR (6 patterns, 6 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('0090a43d-22c6-5e1e-add6-01dd34d8efeb', 'auto_repair', 'Revenue', 'auto.low_arv',
   'Low Average Repair Order Value', 'Techs not performing thorough inspections or recommending needed services.',
   76.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Auto repair industry benchmarks', 'Implement digital vehicle inspections with photo/video.', 'Shop Mgmt Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('55a5fba8-149b-5011-931b-1d0f987b01cd', 'auto_repair', 'Retention', 'auto.no_followup',
   'No Customer Follow-Up', 'No reminder system for upcoming maintenance or declined services.',
   81.00, 'high', 'fixed_range', NULL, NULL, 800.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Customer retention studies', 'Implement automated service reminder system.', 'CRM / Marketing', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('759a4347-3fab-5007-8e61-2f95066d7785', 'auto_repair', 'Operations', 'auto.tech_efficiency',
   'Low Technician Efficiency', 'Techs billing fewer hours than available. Target is 85%+ efficiency.',
   71.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Shop efficiency benchmarks', 'Track tech hours and implement workflow optimization.', 'Shop Mgmt Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c3483d31-659e-5600-b6ae-fc17d3143b9e', 'auto_repair', 'Pricing', 'auto.low_labor_rate',
   'Labor Rate Below Market', 'Door rate hasn''t kept up with market or cost of living increases.',
   65.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Regional labor rate surveys', 'Research market rates and adjust pricing.', 'Business Consulting', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('299c98c9-72e9-59a7-9905-b209c4d47c66', 'auto_repair', 'Marketing', 'auto.no_google',
   'No Google Business Optimization', 'Not showing up in local search results for auto repair.',
   58.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Local search data', 'Optimize Google Business Profile with photos and reviews.', 'Local SEO', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('15f010fb-2ca3-5e04-afa5-afa5f8cdbc6c', 'auto_repair', 'Sales', 'auto.declined_services',
   'Declined Services Not Tracked', 'Customer declines work and nobody follows up later.',
   74.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Declined service recovery data', 'Track declined services and automate follow-up.', 'Shop Mgmt Software', 6);

-- Quiz Questions for auto_repair
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_repair', 'Do your technicians perform digital multi-point inspections on every vehicle?', 1, '0090a43d-22c6-5e1e-add6-01dd34d8efeb');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_repair', 'Do you send automated reminders for upcoming maintenance?', 2, '55a5fba8-149b-5011-931b-1d0f987b01cd');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_repair', 'Is your technician efficiency rate above 85%?', 3, '759a4347-3fab-5007-8e61-2f95066d7785');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_repair', 'Have you reviewed your labor rate against local competitors this year?', 4, 'c3483d31-659e-5600-b6ae-fc17d3143b9e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_repair', 'Do you track and follow up on declined repair recommendations?', 5, '15f010fb-2ca3-5e04-afa5-afa5f8cdbc6c');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_repair', 'Is your Google Business Profile optimized with recent photos and reviews?', 6, '299c98c9-72e9-59a7-9905-b209c4d47c66');

-- ========== REAL ESTATE (6 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7f1320ea-b003-5762-b930-b88960d25046', 'real_estate', 'Lead Gen', 'realestate.lead_followup',
   'Slow Lead Follow-Up', 'Leads go cold because response time is hours or days instead of minutes.',
   78.00, 'critical', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NAR lead response studies', 'Implement CRM with instant auto-response.', 'Real Estate CRM', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7b77e616-3021-5693-a3cb-3d773f9c8a5d', 'real_estate', 'Lead Gen', 'realestate.no_nurture',
   'No Lead Nurture System', 'Leads not ready to buy/sell today get abandoned instead of nurtured.',
   73.00, 'high', 'pct_of_revenue', 0.0300, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Real estate nurture data', 'Build automated drip campaigns by lead stage.', 'Email Marketing', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('0afe2f7a-53e1-5ad8-adee-051c30b8cdcc', 'real_estate', 'Retention', 'realestate.past_client_contact',
   'Past Clients Forgotten', 'No systematic contact with past clients who are your best referral source.',
   82.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NAR referral statistics', 'Implement past client touchpoint calendar.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('dc103d6f-6262-510d-bb85-bee9edccb964', 'real_estate', 'Marketing', 'realestate.weak_digital',
   'Weak Digital Presence', 'No personal brand, inconsistent social media, outdated website.',
   66.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Real estate marketing data', 'Build personal brand with content strategy.', 'Digital Marketing', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('52a39937-2670-529c-a884-aeab29671261', 'real_estate', 'Operations', 'realestate.no_transaction_mgmt',
   'No Transaction Management', 'Manual tracking of deals leads to missed deadlines and errors.',
   58.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Transaction management studies', 'Implement digital transaction management platform.', 'Transaction Mgmt', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6a2eb8de-d41b-55b3-8c01-a968d7dc9a5b', 'real_estate', 'Revenue', 'realestate.no_ancillary',
   'No Ancillary Revenue', 'Not earning referral fees from mortgage, title, insurance partners.',
   61.00, 'medium', 'fixed_range', NULL, NULL, 300.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Ancillary revenue data', 'Build referral partnerships with service providers.', 'Business Development', 6);

-- Quiz Questions for real_estate
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real_estate', 'Do you respond to new leads within 5 minutes?', 1, '7f1320ea-b003-5762-b930-b88960d25046');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real_estate', 'Do you have automated email drip campaigns for leads not ready to act?', 2, '7b77e616-3021-5693-a3cb-3d773f9c8a5d');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real_estate', 'Do you systematically stay in touch with past clients at least quarterly?', 3, '0afe2f7a-53e1-5ad8-adee-051c30b8cdcc');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real_estate', 'Do you consistently post valuable content on social media?', 4, 'dc103d6f-6262-510d-bb85-bee9edccb964');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('real_estate', 'Do you use a digital transaction management system?', 5, '52a39937-2670-529c-a884-aeab29671261');

-- ========== FITNESS (6 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('27e13d4c-403f-5621-8951-b29efbb71064', 'fitness', 'Retention', 'fitness.member_churn',
   'Member Churn Above 30%', 'Losing members faster than acquiring them. Each lost member costs 5-10x to replace.',
   77.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'IHRSA industry data', 'Implement engagement tracking and at-risk member outreach.', 'Gym Mgmt Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4f7fb5a1-b1f6-523d-a4b0-ee8a4adc7ac2', 'fitness', 'Revenue', 'fitness.no_pt_upsell',
   'No Personal Training Upsell', 'Members not being introduced to personal training or group classes.',
   72.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Secondary revenue studies', 'Create systematic PT intro program for new members.', 'Staff Training', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('004ad5e2-59bf-5d7d-81d4-d90942138745', 'fitness', 'Sales', 'fitness.lead_followup',
   'Trial/Lead Follow-Up Weak', 'Free trial users and inquiries not systematically followed up.',
   74.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Gym sales conversion data', 'Implement CRM with automated trial follow-up.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('841e3c2a-3ff8-506e-b650-8bd1bd67d7ab', 'fitness', 'Retention', 'fitness.no_engagement_tracking',
   'No Member Engagement Tracking', 'Can''t identify at-risk members before they cancel.',
   69.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Member engagement studies', 'Track visit frequency and flag declining members.', 'Gym Mgmt Software', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('dec75b17-3cb7-56ca-8c2c-b800da8aff83', 'fitness', 'Revenue', 'fitness.no_retail',
   'No Supplement/Merch Revenue', 'Missing secondary revenue from supplements, apparel, accessories.',
   63.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Gym retail benchmarks', 'Add retail display with auto-reorder for top sellers.', 'Retail / Merch', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7bcd44c0-8a1f-5a4e-9413-eaf2363a4f2b', 'fitness', 'Marketing', 'fitness.no_referral',
   'No Member Referral Program', 'Happy members not incentivized to bring friends.',
   66.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Referral program data', 'Launch bring-a-friend rewards program.', 'Marketing', 6);

-- Quiz Questions for fitness
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Is your annual member churn rate below 30%?', 1, '27e13d4c-403f-5621-8951-b29efbb71064');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Do you have a systematic process to introduce members to personal training?', 2, '4f7fb5a1-b1f6-523d-a4b0-ee8a4adc7ac2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Do you follow up with every trial member and lead within 24 hours?', 3, '004ad5e2-59bf-5d7d-81d4-d90942138745');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Do you track member visit frequency and flag at-risk members?', 4, '841e3c2a-3ff8-506e-b650-8bd1bd67d7ab');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('fitness', 'Do you have an active member referral program?', 5, '7bcd44c0-8a1f-5a4e-9413-eaf2363a4f2b');

-- ========== PROFESSIONAL SERVICES (6 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('eae33f9b-0aad-57b7-9e9e-43370067f65f', 'professional_services', 'Pricing', 'proserv.undercharging',
   'Undercharging for Services', 'Rates below market value, not raised in years, or not tracking billable vs actual.',
   78.00, 'critical', 'pct_of_revenue', 0.0800, 0.2000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Professional services rate surveys', 'Conduct rate benchmarking and implement value-based pricing.', 'Business Consulting', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('bd5a2533-fdd7-52f5-9bae-60ed99bc8d86', 'professional_services', 'Revenue', 'proserv.scope_creep',
   'Scope Creep Not Managed', 'Projects expand beyond original scope without additional billing.',
   81.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Project management studies', 'Implement scope management with change order process.', 'Project Mgmt', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('12deb4b1-8784-52bd-b228-4c0d6c2ef988', 'professional_services', 'Sales', 'proserv.no_pipeline',
   'No Sales Pipeline System', 'Leads and opportunities tracked in head or scattered spreadsheets.',
   66.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'CRM adoption studies', 'Implement CRM with pipeline stages and follow-up automation.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2fd64b6e-df7c-5040-b7e5-766d5672d7f2', 'professional_services', 'Retention', 'proserv.no_client_retention',
   'No Client Retention Strategy', 'Clients finish projects and disappear with no systematic re-engagement.',
   72.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Client lifetime value data', 'Build client success program with quarterly check-ins.', 'Client Success', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a9efa845-b225-541d-8b8c-dfab24fa2089', 'professional_services', 'Operations', 'proserv.low_utilization',
   'Low Billable Utilization', 'Team spending too much time on non-billable work.',
   69.00, 'high', 'pct_of_revenue', 0.0300, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Utilization rate benchmarks', 'Track time and optimize for billable work.', 'Time Tracking', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a643b6b5-027e-537b-8e20-037c4097e779', 'professional_services', 'Marketing', 'proserv.no_content',
   'No Thought Leadership Content', 'No blog, podcast, or content marketing to attract inbound leads.',
   64.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Inbound marketing ROI data', 'Launch content strategy with weekly publishing.', 'Content Marketing', 6);

-- Quiz Questions for professional_services
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('professional_services', 'Have you benchmarked your rates against market competitors this year?', 1, 'eae33f9b-0aad-57b7-9e9e-43370067f65f');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('professional_services', 'Do you have a formal process for managing scope changes with clients?', 2, 'bd5a2533-fdd7-52f5-9bae-60ed99bc8d86');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('professional_services', 'Do you use a CRM to track your sales pipeline and follow-ups?', 3, '12deb4b1-8784-52bd-b228-4c0d6c2ef988');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('professional_services', 'Do you proactively re-engage past clients with check-ins or updates?', 4, '2fd64b6e-df7c-5040-b7e5-766d5672d7f2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('professional_services', 'Is your team''s billable utilization rate above 70%?', 5, 'a9efa845-b225-541d-8b8c-dfab24fa2089');

-- ========== DENTAL (6 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('e77e3734-d018-5666-aac3-1b9038d0b9f0', 'dental', 'Revenue', 'dental.low_case_acceptance',
   'Low Treatment Acceptance Rate', 'Patients declining recommended treatment due to poor presentation or financing.',
   75.00, 'critical', 'pct_of_revenue', 0.1000, 0.2000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'ADA practice benchmarks', 'Implement visual treatment planning and financing options.', 'Practice Mgmt', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('0a3dd6fe-8482-59e9-9877-f5eed023292b', 'dental', 'Revenue', 'dental.no_show',
   'High No-Show Rate', 'Empty chair time is the most expensive waste in dentistry.',
   73.00, 'critical', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Dental practice data', 'Automated reminders with confirmation and waitlist backfill.', 'Patient Scheduling', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4d31ff1a-b029-502e-a9d8-ef959114ab32', 'dental', 'Revenue', 'dental.hygiene_recare',
   'Hygiene Recare Gaps', 'Patients not returning for regular cleanings at recommended intervals.',
   71.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Hygiene recare benchmarks', 'Implement automated recare reminders and pre-scheduling.', 'Patient Engagement', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('5aa15dee-5580-5b9a-93a3-7b57ede4a290', 'dental', 'Billing', 'dental.insurance_optimization',
   'Insurance Not Maximized', 'Not maximizing insurance benefits for patients or leaving money on the table.',
   62.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Dental billing studies', 'Train on insurance optimization and benefit maximization.', 'Dental Billing', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a0877d6f-cec1-5499-ad83-92c20385469f', 'dental', 'Marketing', 'dental.weak_new_patient',
   'New Patient Flow Below Target', 'Not attracting enough new patients to replace natural attrition.',
   67.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Dental marketing data', 'Implement digital marketing with patient source tracking.', 'Dental Marketing', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ba7cae6a-2104-5107-8679-26d7c465496a', 'dental', 'Revenue', 'dental.no_cosmetic_offering',
   'No Cosmetic/Elective Services', 'Missing high-margin elective procedures like whitening, veneers, aligners.',
   56.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Cosmetic dentistry trends', 'Add cosmetic menu and train on case presentation.', 'Practice Consulting', 6);

-- Quiz Questions for dental
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Is your treatment case acceptance rate above 60%?', 1, 'e77e3734-d018-5666-aac3-1b9038d0b9f0');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Do you have automated appointment reminders and confirmation?', 2, '0a3dd6fe-8482-59e9-9877-f5eed023292b');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Do patients pre-schedule their next hygiene visit before leaving?', 3, '4d31ff1a-b029-502e-a9d8-ef959114ab32');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Do you verify and maximize insurance benefits before treatment?', 4, '5aa15dee-5580-5b9a-93a3-7b57ede4a290');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('dental', 'Are you attracting 20+ new patients per month per provider?', 5, 'a0877d6f-cec1-5499-ad83-92c20385469f');

-- ========== HVAC PLUMBING (6 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('637c2a32-4e77-5aa7-9fbb-f3ca143bab54', 'hvac_plumbing', 'Revenue', 'hvac.no_maintenance_plans',
   'No Maintenance Plan Program', 'Missing recurring revenue from preventive maintenance agreements.',
   71.00, 'critical', 'fixed_range', NULL, NULL, 2000.00, 6000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'HVAC industry benchmarks', 'Launch maintenance agreement program with auto-renewal.', 'Field Service Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('36400449-cc3f-54ed-8898-a561864a8fac', 'hvac_plumbing', 'Sales', 'hvac.no_flat_rate',
   'No Flat Rate Pricing', 'Time & materials pricing leaves money on the table and confuses customers.',
   58.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Flat rate pricing studies', 'Implement flat rate pricing book.', 'Business Consulting', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ca78898a-8bf4-5371-8c52-597a631eae15', 'hvac_plumbing', 'Sales', 'hvac.low_close_rate',
   'Low Quote Close Rate', 'Giving quotes but not closing them due to poor follow-up or presentation.',
   74.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Home services sales data', 'Implement quote follow-up system with financing options.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('072fcc4e-3135-5163-8849-21881f8b3f56', 'hvac_plumbing', 'Operations', 'hvac.dispatch_inefficiency',
   'Dispatch Inefficiency', 'Poor routing, wasted drive time, wrong tech sent to wrong job.',
   67.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Field service optimization data', 'Use GPS-based dispatch optimization software.', 'Field Service Software', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8946508d-6180-52c4-9c61-e7765bf4edcc', 'hvac_plumbing', 'Marketing', 'hvac.no_online_reviews',
   'Poor Online Review Management', 'Not asking for reviews or responding to existing ones.',
   63.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Local business review data', 'Implement automated review request after each job.', 'Reputation Mgmt', 5);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b4a74117-879c-5dad-8980-1930280cccca', 'hvac_plumbing', 'Revenue', 'hvac.no_accessory_sales',
   'No Accessory/Add-On Sales', 'Techs not offering filters, thermostats, air quality products on calls.',
   69.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Accessory attachment rate data', 'Train techs on accessory recommendations with visual aids.', 'Staff Training', 6);

-- Quiz Questions for hvac_plumbing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac_plumbing', 'Do you offer maintenance plans or service agreements?', 1, '637c2a32-4e77-5aa7-9fbb-f3ca143bab54');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac_plumbing', 'Do you use flat rate pricing (vs. time and materials)?', 2, '36400449-cc3f-54ed-8898-a561864a8fac');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac_plumbing', 'Do you follow up on every quote within 48 hours?', 3, 'ca78898a-8bf4-5371-8c52-597a631eae15');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac_plumbing', 'Do you use dispatch software that optimizes routes?', 4, '072fcc4e-3135-5163-8849-21881f8b3f56');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hvac_plumbing', 'Do you actively ask customers for online reviews after service?', 5, '8946508d-6180-52c4-9c61-e7765bf4edcc');

-- ========== LANDSCAPING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c935120f-67e1-5d99-8142-0dd6738052a5', 'landscaping', 'Pricing', 'landscape.underpricing',
   'Jobs Underpriced', 'Not accounting for true labor costs, drive time, materials waste in bids.',
   82.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Landscaping profitability data', 'Use job costing software with burden rate calculations.', 'Estimating Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d395411b-1515-59af-a91c-bb61b4001391', 'landscaping', 'Revenue', 'landscape.no_upsell',
   'No Upsell on Maintenance', 'Mowing crews not trained to identify and sell additional services.',
   76.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Landscape upsell rate data', 'Train crews to identify and photograph opportunities.', 'Staff Training', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('49ff6a82-b9ef-5ce8-a072-ffe83a284b94', 'landscaping', 'Operations', 'landscape.route_inefficiency',
   'Route Inefficiency', 'Crews zigzagging across town instead of working in clusters.',
   71.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Route optimization studies', 'Implement route optimization software.', 'Field Service Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9f51c222-371b-5db1-ad14-8f65b8a41cb1', 'landscaping', 'Retention', 'landscape.no_contracts',
   'No Annual Service Contracts', 'Customers free to leave any month with no commitment securing revenue.',
   64.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Contract retention data', 'Offer annual contracts with seasonal pricing incentives.', 'Business Consulting', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('405ba546-a215-5c81-98e8-a5650d5d0157', 'landscaping', 'Labor', 'landscape.crew_downtime',
   'Crew Downtime Between Jobs', 'Crews waiting at the shop or between jobs without productive work.',
   69.00, 'medium', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Labor utilization benchmarks', 'Use job scheduling with backfill capabilities.', 'Workforce Mgmt', 5);

-- Quiz Questions for landscaping
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Do you calculate true job cost including labor burden and drive time?', 1, 'c935120f-67e1-5d99-8142-0dd6738052a5');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Do your crews identify and report upsell opportunities at job sites?', 2, 'd395411b-1515-59af-a91c-bb61b4001391');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Do you use route optimization software for daily scheduling?', 3, '49ff6a82-b9ef-5ce8-a072-ffe83a284b94');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Do you offer annual service contracts to customers?', 4, '9f51c222-371b-5db1-ad14-8f65b8a41cb1');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('landscaping', 'Do you track crew utilization and minimize downtime between jobs?', 5, '405ba546-a215-5c81-98e8-a5650d5d0157');

-- ========== CLEANING SERVICES (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6ab5db25-3a75-57b0-8336-ed8bcb954ebd', 'cleaning_services', 'Operations', 'cleaning.callback_rate',
   'High Callback/Redo Rate', 'Sending crews back to redo work is double the labor cost with zero revenue.',
   68.00, 'critical', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Cleaning industry QC data', 'Implement photo-verified checklists and QC inspections.', 'Operations Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('733cd998-e8a9-5353-a2b3-1bf657bd3ef6', 'cleaning_services', 'Retention', 'cleaning.client_churn',
   'High Client Churn', 'Losing clients faster than replacing them due to inconsistent quality.',
   74.00, 'critical', 'pct_of_revenue', 0.0400, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Cleaning retention studies', 'Implement customer feedback loops and quality guarantees.', 'CRM', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('e496c6cf-c738-5ee0-bf01-664efad84804', 'cleaning_services', 'Pricing', 'cleaning.underpriced',
   'Services Underpriced', 'Not accounting for true costs: supplies, drive time, insurance, callbacks.',
   77.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Cleaning industry pricing data', 'Recalculate pricing with all costs and profit target.', 'Business Consulting', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('bc642b31-4b67-5910-bbe8-bb95fe18fc03', 'cleaning_services', 'Labor', 'cleaning.employee_turnover',
   'High Employee Turnover', 'Constantly hiring and training new cleaners, losing quality and consistency.',
   81.00, 'high', 'per_employee', NULL, NULL, NULL, NULL, 200.00,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Cleaning industry HR data', 'Improve pay, training, and career growth paths.', 'HR / Recruiting', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('03cc1803-62e9-5ad5-90bf-6fe14a34d126', 'cleaning_services', 'Revenue', 'cleaning.no_upsell',
   'No Add-On Service Sales', 'Not offering deep cleaning, window washing, or seasonal services.',
   66.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Service attachment rate data', 'Train teams to offer add-on services during regular visits.', 'Sales Training', 5);

-- Quiz Questions for cleaning_services
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning_services', 'Do you use checklists with photo verification for quality control?', 1, '6ab5db25-3a75-57b0-8336-ed8bcb954ebd');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning_services', 'Is your annual client retention rate above 80%?', 2, '733cd998-e8a9-5353-a2b3-1bf657bd3ef6');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning_services', 'Have you calculated your true cost per clean including all overhead?', 3, 'e496c6cf-c738-5ee0-bf01-664efad84804');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning_services', 'Is your employee turnover rate below industry average?', 4, 'bc642b31-4b67-5910-bbe8-bb95fe18fc03');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('cleaning_services', 'Do you actively offer and sell add-on services to existing clients?', 5, '03cc1803-62e9-5ad5-90bf-6fe14a34d126');

-- ========== INSURANCE AGENCY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('41238734-3c0e-587c-9ddf-4214511c8fe9', 'insurance_agency', 'Retention', 'insurance.policy_churn',
   'Policy Retention Below 90%', 'Policies not renewing due to price shopping or lack of relationship management.',
   72.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Insurance retention benchmarks', 'Implement proactive renewal outreach 60 days out.', 'Agency Mgmt System', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b7c38926-5847-5b21-9059-9cfd7064426e', 'insurance_agency', 'Revenue', 'insurance.low_policies_per',
   'Low Policies Per Household', 'Clients have only 1-2 policies when they could have 4-5.',
   78.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Cross-sell benchmarks', 'Implement coverage review process for all clients.', 'Sales Training', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fb8234da-3139-54f7-93b4-59579f2a6c77', 'insurance_agency', 'Sales', 'insurance.slow_quoting',
   'Slow Quote Turnaround', 'Quotes taking hours/days instead of minutes. Leads go to faster competitors.',
   65.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Insurance quoting speed data', 'Implement comparative rating software.', 'Rating Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('acde1d5d-265f-5553-ad8b-6dbe5fd90ae7', 'insurance_agency', 'Marketing', 'insurance.no_referral',
   'No Referral Program', 'Happy clients not incentivized to refer friends and family.',
   70.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Insurance referral data', 'Launch client referral rewards program.', 'Marketing', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2db64b66-e74e-56cc-a677-18d7c4bf5899', 'insurance_agency', 'Operations', 'insurance.manual_processes',
   'Manual Processes Eating Time', 'Manual data entry, paper forms, and redundant processes wasting staff time.',
   67.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Agency automation studies', 'Automate workflows with agency management system.', 'Agency Mgmt System', 5);

-- Quiz Questions for insurance_agency
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance_agency', 'Is your policy retention rate above 90%?', 1, '41238734-3c0e-587c-9ddf-4214511c8fe9');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance_agency', 'Do you regularly review clients'' full coverage needs (account rounding)?', 2, 'b7c38926-5847-5b21-9059-9cfd7064426e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance_agency', 'Can you quote a client across multiple carriers in under 10 minutes?', 3, 'fb8234da-3139-54f7-93b4-59579f2a6c77');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance_agency', 'Do you have a formal client referral program?', 4, 'acde1d5d-265f-5553-ad8b-6dbe5fd90ae7');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('insurance_agency', 'Have you automated your renewal and follow-up workflows?', 5, '2db64b66-e74e-56cc-a677-18d7c4bf5899');

-- ========== TRUCKING LOGISTICS (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('364a3bf1-5b48-54bc-b4c3-db8caab8dab2', 'trucking_logistics', 'Operations', 'trucking.empty_miles',
   'High Empty Mile Percentage', 'Trucks driving empty between loads, burning fuel with no revenue.',
   76.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'ATRI trucking benchmarks', 'Use load matching and route optimization software.', 'Fleet Mgmt Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('034f9c44-1a96-5e8a-9135-1e2adbc68fea', 'trucking_logistics', 'Cost Control', 'trucking.fuel_waste',
   'Fuel Costs Not Optimized', 'No fuel cards, route optimization, or idle time monitoring.',
   71.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Fleet fuel benchmarks', 'Implement fuel cards with analytics and idle monitoring.', 'Fleet Mgmt Software', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('83ee8fb6-fc4a-5b6e-a059-ac357beef170', 'trucking_logistics', 'Pricing', 'trucking.rate_negotiation',
   'Rates Below Market', 'Accepting below-market rates due to poor lane data or broker dependency.',
   68.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'DAT rate data', 'Use market rate tools and diversify broker relationships.', 'Rate Intelligence', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4be7aec2-d5fa-5263-a667-830a33952458', 'trucking_logistics', 'Compliance', 'trucking.compliance_fines',
   'Compliance Fines and Violations', 'ELD violations, weight violations, and hours-of-service fines adding up.',
   55.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'FMCSA violation data', 'Implement compliance monitoring and training program.', 'Compliance Software', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d0c06393-3928-5de4-8e5b-8090661db299', 'trucking_logistics', 'Maintenance', 'trucking.reactive_maintenance',
   'Reactive Not Preventive Maintenance', 'Fixing breakdowns instead of preventing them costs 3-5x more.',
   64.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Fleet maintenance data', 'Implement preventive maintenance scheduling.', 'Fleet Mgmt Software', 5);

-- Quiz Questions for trucking_logistics
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking_logistics', 'Is your empty mile percentage below 15%?', 1, '364a3bf1-5b48-54bc-b4c3-db8caab8dab2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking_logistics', 'Do you use fuel cards with analytics and idle monitoring?', 2, '034f9c44-1a96-5e8a-9135-1e2adbc68fea');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking_logistics', 'Do you use market rate data when negotiating loads?', 3, '83ee8fb6-fc4a-5b6e-a059-ac357beef170');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking_logistics', 'Have you had zero compliance violations in the last 12 months?', 4, '4be7aec2-d5fa-5263-a667-830a33952458');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('trucking_logistics', 'Do you have a preventive maintenance schedule for all vehicles?', 5, 'd0c06393-3928-5de4-8e5b-8090661db299');

-- ========== MANUFACTURING (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c8a1f38c-5b51-53ea-8764-fb790d2444ff', 'manufacturing', 'Operations', 'mfg.oee_low',
   'Low Equipment Effectiveness (OEE)', 'Equipment running below optimal availability, performance, and quality rates.',
   79.00, 'critical', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'OEE industry benchmarks', 'Implement OEE tracking and continuous improvement program.', 'MES / OEE Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('74a495da-5370-530f-9d5d-e9fbda7aa6de', 'manufacturing', 'Quality', 'mfg.scrap_rework',
   'Scrap and Rework Above Target', 'Defective products being scrapped or reworked, wasting materials and labor.',
   72.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Quality cost benchmarks', 'Implement statistical process control and root cause analysis.', 'Quality Mgmt', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('49148be9-45d1-5dba-8b0a-290de98400c8', 'manufacturing', 'Inventory', 'mfg.excess_inventory',
   'Excess Inventory Tying Up Cash', 'Too much raw material or finished goods sitting idle, tying up working capital.',
   74.00, 'high', 'pct_of_revenue', 0.0200, 0.0500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Inventory turnover benchmarks', 'Implement demand planning and lean inventory practices.', 'ERP / Inventory', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('738e47b4-e781-56fd-900e-b9c8bdb73190', 'manufacturing', 'Maintenance', 'mfg.unplanned_downtime',
   'High Unplanned Downtime', 'Equipment breakdowns stopping production and missing delivery dates.',
   68.00, 'critical', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Downtime cost studies', 'Implement predictive maintenance with sensor monitoring.', 'CMMS Software', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8e9c9b4e-c6b6-5016-95ce-73e09f65139d', 'manufacturing', 'Labor', 'mfg.labor_inefficiency',
   'Labor Inefficiency', 'Workers spending time on non-value-added activities or waiting for materials.',
   66.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Lean manufacturing studies', 'Implement lean principles and value stream mapping.', 'Lean Consulting', 5);

-- Quiz Questions for manufacturing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Do you track Overall Equipment Effectiveness (OEE)?', 1, 'c8a1f38c-5b51-53ea-8764-fb790d2444ff');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Is your scrap/rework rate below 2%?', 2, '74a495da-5370-530f-9d5d-e9fbda7aa6de');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Do you have a demand planning system for inventory management?', 3, '49148be9-45d1-5dba-8b0a-290de98400c8');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Do you have a preventive/predictive maintenance program?', 4, '738e47b4-e781-56fd-900e-b9c8bdb73190');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('manufacturing', 'Have you conducted a lean assessment or value stream mapping?', 5, '8e9c9b4e-c6b6-5016-95ce-73e09f65139d');

-- ========== NONPROFIT (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9ee1c61a-fcff-560e-b441-8c3ea65d7097', 'nonprofit', 'Fundraising', 'nonprofit.donor_retention',
   'Donor Retention Below 45%', 'Losing donors faster than acquiring them. Replacing a donor costs 5-10x.',
   77.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'AFP fundraising benchmarks', 'Implement donor stewardship program with touchpoints.', 'Donor CRM', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('484adb6c-e722-5427-8973-1d1f6b7cd24e', 'nonprofit', 'Fundraising', 'nonprofit.no_monthly_giving',
   'No Monthly Giving Program', 'Missing predictable recurring revenue from monthly donors.',
   62.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Recurring giving studies', 'Launch monthly giving program with clear impact messaging.', 'Fundraising Platform', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a5ca4697-ca4e-59c3-baed-717918d3df33', 'nonprofit', 'Marketing', 'nonprofit.no_email_strategy',
   'No Email Fundraising Strategy', 'Email list exists but no strategic campaigns to drive donations.',
   69.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Nonprofit email benchmarks', 'Build annual email calendar with appeal sequences.', 'Email Marketing', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('f21cd007-27d8-5917-a5d2-a219337068f7', 'nonprofit', 'Revenue', 'nonprofit.no_major_gifts',
   'No Major Gift Program', 'Not identifying or cultivating donors capable of larger gifts.',
   73.00, 'high', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Major gift fundraising data', 'Implement donor screening and major gift officer role.', 'Fundraising Consulting', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7580e2e4-4c4c-5988-be3f-3d0c84a47067', 'nonprofit', 'Operations', 'nonprofit.grant_tracking',
   'Poor Grant Tracking', 'Missing deadlines, incomplete reporting, not pursuing available grants.',
   58.00, 'medium', 'fixed_range', NULL, NULL, 1000.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Grant management studies', 'Implement grant management calendar and tracking system.', 'Grant Mgmt Software', 5);

-- Quiz Questions for nonprofit
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Is your donor retention rate above 45%?', 1, '9ee1c61a-fcff-560e-b441-8c3ea65d7097');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Do you have a monthly/recurring giving program?', 2, '484adb6c-e722-5427-8973-1d1f6b7cd24e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Do you have a strategic email fundraising calendar?', 3, 'a5ca4697-ca4e-59c3-baed-717918d3df33');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Do you have a process to identify and cultivate major gift donors?', 4, 'f21cd007-27d8-5917-a5d2-a219337068f7');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('nonprofit', 'Do you track all grant deadlines and reporting requirements systematically?', 5, '7580e2e4-4c4c-5988-be3f-3d0c84a47067');

-- ========== PHOTOGRAPHY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9fa6ad51-b5f4-5540-83be-3f76c531bba4', 'photography', 'Pricing', 'photo.undercharging',
   'Undercharging for Services', 'Pricing below market, not accounting for editing time, travel, equipment.',
   84.00, 'critical', 'pct_of_revenue', 0.1500, 0.3000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Photography pricing surveys', 'Recalculate pricing with full cost + profit target.', 'Business Coaching', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('21379dab-b1b6-528e-a6b3-cdb935b30ec0', 'photography', 'Revenue', 'photo.no_upsell',
   'No Print/Album Upsell', 'Delivering digital files only, missing high-margin print and album sales.',
   72.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Photography revenue studies', 'Add in-person sales session for prints and albums.', 'Sales Training', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('eed9a447-111c-5b2d-a6b8-ab51e8625d56', 'photography', 'Sales', 'photo.no_booking_system',
   'No Booking/CRM System', 'Managing inquiries through email with no pipeline tracking.',
   68.00, 'high', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Photography booking data', 'Implement CRM with automated inquiry follow-up.', 'CRM / Booking', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6d9b7f04-0498-5d8a-8edd-f1a02d63f989', 'photography', 'Retention', 'photo.no_referral',
   'No Referral/Repeat System', 'Happy clients not being asked for referrals or booked for future milestones.',
   76.00, 'medium', 'fixed_range', NULL, NULL, 300.00, 1200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Photography referral data', 'Launch referral rewards and anniversary reminders.', 'Marketing', 4);

-- Quiz Questions for photography
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Have you calculated your true cost per shoot including editing and overhead?', 1, '9fa6ad51-b5f4-5540-83be-3f76c531bba4');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Do you offer prints, albums, or wall art as upsells after sessions?', 2, '21379dab-b1b6-528e-a6b3-cdb935b30ec0');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Do you use a CRM to track inquiries and follow up automatically?', 3, 'eed9a447-111c-5b2d-a6b8-ab51e8625d56');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('photography', 'Do you have a referral program and milestone reminder system?', 4, '6d9b7f04-0498-5d8a-8edd-f1a02d63f989');


-- ============================================================
-- TOTAL: 124 patterns + 109 quiz questions across 20 industries
-- ============================================================-- ============================================================
-- LEAK & GROW: PRE-SCAN v3 - BATCH 2 INDUSTRY SEED DATA
-- 25 Additional Industries
-- ============================================================


-- ========== ACCOUNTING FIRM (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d8229eef-d4b1-5f9d-83e5-6713dbe82e38', 'accounting_firm', 'Pricing', 'accounting.hourly_trap',
   'Stuck on Hourly Billing', 'Billing by the hour caps revenue and punishes efficiency.',
   74.00, 'critical', 'pct_of_revenue', 0.1000, 0.2500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'AICPA practice benchmarks', 'Transition to value-based and fixed-fee pricing.', 'Practice Consulting', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('09e68887-be0e-570d-b1db-dfd9403d03a3', 'accounting_firm', 'Revenue', 'accounting.no_advisory',
   'No Advisory Services', 'Only doing compliance work, missing high-margin advisory revenue.',
   68.00, 'high', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Advisory revenue data', 'Package advisory services (CFO, planning, KPIs).', 'Advisory Platform', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('5dec52c5-2ff9-5cc4-aaed-72a1ec163ff5', 'accounting_firm', 'Operations', 'accounting.manual_workflows',
   'Manual Data Entry', 'Staff spending hours on manual data entry instead of analysis.',
   72.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Automation ROI studies', 'Implement cloud accounting with automated bank feeds.', 'Cloud Accounting', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7acd9d42-7b32-5119-b368-2e9192320ecb', 'accounting_firm', 'Retention', 'accounting.client_churn',
   'Client Churn Above 10%', 'Losing clients to competitors or DIY solutions without proactive engagement.',
   61.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Practice retention data', 'Implement client engagement with regular reviews.', 'CRM', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('45879ba6-38f3-5e0a-8f56-69ec2a57a4d5', 'accounting_firm', 'Sales', 'accounting.no_referral_system',
   'No Referral System', 'Happy clients not asked for referrals systematically.',
   70.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Professional services referral data', 'Launch referral rewards program.', 'Marketing', 5);

-- Quiz Questions for accounting_firm
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting_firm', 'Do you offer fixed-fee or value-based pricing (vs. purely hourly)?', 1, 'd8229eef-d4b1-5f9d-83e5-6713dbe82e38');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting_firm', 'Do you offer advisory services beyond compliance (CFO, planning, KPIs)?', 2, '09e68887-be0e-570d-b1db-dfd9403d03a3');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting_firm', 'Have you automated bank feeds, data entry, and reconciliation?', 3, '5dec52c5-2ff9-5cc4-aaed-72a1ec163ff5');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting_firm', 'Do you proactively engage clients beyond tax season?', 4, '7acd9d42-7b32-5119-b368-2e9192320ecb');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('accounting_firm', 'Do you have a formal referral program?', 5, '45879ba6-38f3-5e0a-8f56-69ec2a57a4d5');

-- ========== LAW FIRM (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9e63f7d6-c215-5362-a159-7a41f3de4c4f', 'law_firm', 'Revenue', 'law.low_realization',
   'Low Billing Realization Rate', 'Writing off too many hours. Realization below 90% means significant lost revenue.',
   71.00, 'critical', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Clio legal trends report', 'Implement time tracking discipline and billing reviews.', 'Legal Practice Mgmt', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c3614dc1-7918-564e-b6d0-b0dddeedb9df', 'law_firm', 'Operations', 'law.low_utilization',
   'Low Billable Utilization', 'Attorneys spending too much time on admin vs. billable work.',
   73.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Legal utilization benchmarks', 'Automate admin tasks and delegate to paralegals.', 'Legal Tech', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c2ce90f4-44a4-5ba1-a0dd-af532bf7c538', 'law_firm', 'Sales', 'law.slow_intake',
   'Slow Client Intake', 'Potential clients waiting days for callbacks and consultations.',
   67.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Legal intake conversion data', 'Implement online intake forms and fast response.', 'Legal CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('92ea2619-cf9d-520a-9e43-78faf90ffac2', 'law_firm', 'Billing', 'law.slow_collections',
   'AR Over 60 Days', 'Clients taking too long to pay invoices, hurting cash flow.',
   64.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Legal billing studies', 'Implement online payments and automated AR follow-up.', 'Legal Billing', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('cba6df36-c0ad-5fc4-b151-abcd6307566b', 'law_firm', 'Marketing', 'law.no_content_marketing',
   'No Content Marketing', 'No blog, guides, or educational content driving inbound leads.',
   66.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Legal marketing ROI data', 'Launch content strategy targeting client questions.', 'Legal Marketing', 5);

-- Quiz Questions for law_firm
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law_firm', 'Is your billing realization rate above 90%?', 1, '9e63f7d6-c215-5362-a159-7a41f3de4c4f');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law_firm', 'Is your attorney utilization rate above 70%?', 2, 'c3614dc1-7918-564e-b6d0-b0dddeedb9df');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law_firm', 'Do you respond to new client inquiries within 1 hour?', 3, 'c2ce90f4-44a4-5ba1-a0dd-af532bf7c538');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law_firm', 'Is your average accounts receivable under 45 days?', 4, '92ea2619-cf9d-520a-9e43-78faf90ffac2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('law_firm', 'Do you publish educational content to attract clients?', 5, 'cba6df36-c0ad-5fc4-b151-abcd6307566b');

-- ========== HOTEL HOSPITALITY (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('841e9a95-ec4b-5289-b707-45c04ef70dc1', 'hotel_hospitality', 'Revenue', 'hotel.no_revenue_mgmt',
   'No Revenue Management Strategy', 'Static pricing instead of dynamic rates based on demand and events.',
   72.00, 'critical', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'STR hotel benchmark data', 'Implement revenue management software with dynamic pricing.', 'Revenue Mgmt Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('add2d0b8-ba83-58cc-b5ff-51563fc5009b', 'hotel_hospitality', 'Revenue', 'hotel.low_direct_bookings',
   'Low Direct Booking Rate', 'Too many bookings through OTAs paying 15-25% commission.',
   78.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Hotel distribution data', 'Invest in direct booking with best-rate guarantee.', 'Hotel Marketing', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('34fe2663-6486-5f61-8f2c-06a081a03514', 'hotel_hospitality', 'Revenue', 'hotel.no_upsell',
   'No Upsell/Ancillary Revenue', 'Not selling room upgrades, early check-in, or ancillary services.',
   69.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Hotel upsell revenue data', 'Implement pre-arrival upsell emails and front desk scripts.', 'Hotel Tech', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('387b185a-9fa4-5fe9-8920-bcfd8b0bae3c', 'hotel_hospitality', 'Retention', 'hotel.no_loyalty',
   'No Guest Loyalty Program', 'No incentive for repeat stays. Every guest is a one-timer.',
   63.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Loyalty program ROI data', 'Launch simple loyalty program with direct booking perks.', 'Hotel CRM', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fc515b91-8f8b-5623-99ad-adc54a14bc6c', 'hotel_hospitality', 'Operations', 'hotel.housekeeping_efficiency',
   'Housekeeping Inefficiency', 'Rooms not turned fast enough, poor scheduling wasting labor hours.',
   65.00, 'high', 'fixed_range', NULL, NULL, 1200.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Housekeeping efficiency data', 'Implement housekeeping management software.', 'Hotel Operations', 5);

-- Quiz Questions for hotel_hospitality
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel_hospitality', 'Do you use dynamic pricing based on demand and events?', 1, '841e9a95-ec4b-5289-b707-45c04ef70dc1');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel_hospitality', 'Is your direct booking rate above 40%?', 2, 'add2d0b8-ba83-58cc-b5ff-51563fc5009b');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel_hospitality', 'Do you offer room upgrades and ancillary services at check-in or pre-arrival?', 3, '34fe2663-6486-5f61-8f2c-06a081a03514');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel_hospitality', 'Do you have a guest loyalty program?', 4, '387b185a-9fa4-5fe9-8920-bcfd8b0bae3c');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('hotel_hospitality', 'Do you use software to optimize housekeeping schedules?', 5, 'fc515b91-8f8b-5623-99ad-adc54a14bc6c');

-- ========== PET SERVICES (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c724c0b6-6da3-588a-b6a6-4b6a40f21dd6', 'pet_services', 'Revenue', 'pet.no_packages',
   'No Service Packages', 'Selling individual services instead of bundled packages with higher LTV.',
   71.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pet industry revenue data', 'Create multi-visit packages with prepay discounts.', 'Business Consulting', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('36df99c7-f1a4-5078-99e2-982ce20b1db4', 'pet_services', 'Retention', 'pet.no_rebooking',
   'No Rebooking at Checkout', 'Clients leave without scheduling their next appointment.',
   75.00, 'high', 'fixed_range', NULL, NULL, 500.00, 1800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pet service retention data', 'Train staff to rebook and add automated reminders.', 'Booking Software', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('27a169d1-ba75-58b0-9440-63f69f508b3a', 'pet_services', 'Marketing', 'pet.no_reviews',
   'No Review Generation', 'Happy pet parents not asked for Google/Yelp reviews.',
   68.00, 'medium', 'fixed_range', NULL, NULL, 300.00, 1200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Local review impact data', 'Automate review requests after each service.', 'Reputation Mgmt', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ed9d0ca9-4e0f-5d2d-98f1-c2a7b4491e8f', 'pet_services', 'Revenue', 'pet.no_retail',
   'No Retail Product Sales', 'Not selling food, treats, toys, supplements that clients buy elsewhere.',
   63.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pet retail attachment data', 'Add curated retail selection with recommendation cards.', 'Retail / Distribution', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('98db9fac-3f83-5c1b-b222-ac2a2a434a66', 'pet_services', 'Pricing', 'pet.underpriced',
   'Services Underpriced', 'Pricing hasn''t kept pace with rising supply, rent, and labor costs.',
   72.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pet services pricing surveys', 'Annual pricing review benchmarked against market.', 'Business Consulting', 5);

-- Quiz Questions for pet_services
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet_services', 'Do you offer prepaid service packages or memberships?', 1, 'c724c0b6-6da3-588a-b6a6-4b6a40f21dd6');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet_services', 'Do clients rebook their next visit before leaving?', 2, '36df99c7-f1a4-5078-99e2-982ce20b1db4');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet_services', 'Do you actively ask for online reviews after each visit?', 3, '27a169d1-ba75-58b0-9440-63f69f508b3a');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet_services', 'Do you sell retail products (food, treats, supplements)?', 4, 'ed9d0ca9-4e0f-5d2d-98f1-c2a7b4491e8f');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pet_services', 'Have you raised your prices in the last 12 months?', 5, '98db9fac-3f83-5c1b-b222-ac2a2a434a66');

-- ========== FOOD TRUCK (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('1d1e00ec-4622-52aa-ae24-4878280500df', 'food_truck', 'Operations', 'foodtruck.location_random',
   'No Data-Driven Location Strategy', 'Picking locations by feel instead of tracking sales by location and time.',
   79.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Food truck industry data', 'Track sales by location/time and optimize schedule.', 'POS / Analytics', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a4e2ac5c-7740-5ceb-a490-73033fd05d2d', 'food_truck', 'Revenue', 'foodtruck.no_catering',
   'No Catering Revenue Stream', 'Missing high-margin private event and catering revenue.',
   65.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Catering revenue data', 'Build catering menu and booking system.', 'Catering Platform', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('eface66d-6db9-5fe2-841b-ec40e3db854c', 'food_truck', 'Marketing', 'foodtruck.no_social',
   'No Social Media Location Updates', 'Customers don''t know where you are today.',
   56.00, 'high', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Food truck marketing data', 'Daily social media posts with location and schedule.', 'Social Media Mgmt', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8adb8d68-cf91-5632-a825-e7f3087128ec', 'food_truck', 'Cost Control', 'foodtruck.food_waste',
   'Food Waste Not Tracked', 'Prepping too much or wrong items for the day wasting ingredients.',
   73.00, 'high', 'fixed_range', NULL, NULL, 500.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Food waste benchmarks', 'Track sales patterns to optimize daily prep quantities.', 'Inventory Mgmt', 4);

-- Quiz Questions for food_truck
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food_truck', 'Do you track sales by location and use data to pick where to park?', 1, '1d1e00ec-4622-52aa-ae24-4878280500df');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food_truck', 'Do you offer catering or private event bookings?', 2, 'a4e2ac5c-7740-5ceb-a490-73033fd05d2d');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food_truck', 'Do you post your daily location on social media?', 3, 'eface66d-6db9-5fe2-841b-ec40e3db854c');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('food_truck', 'Do you track food waste and adjust prep based on historical sales?', 4, '8adb8d68-cf91-5632-a825-e7f3087128ec');

-- ========== BAKERY CAFE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d929307b-d688-5e97-8306-6132061ba46e', 'bakery_cafe', 'Cost Control', 'bakery.ingredient_cost',
   'Ingredient Cost Not Tracked Per Item', 'Don''t know the true cost to produce each menu item.',
   81.00, 'critical', 'pct_of_revenue', 0.0400, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Bakery cost benchmarks', 'Calculate recipe costs and update pricing accordingly.', 'Food Cost Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('aa04f7c7-33f3-5335-b3eb-ba40b935d138', 'bakery_cafe', 'Revenue', 'bakery.no_wholesale',
   'No Wholesale Channel', 'Selling only direct-to-consumer, missing office and restaurant wholesale.',
   58.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Bakery revenue diversification', 'Build wholesale menu and approach local businesses.', 'Business Development', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('44a4f9e2-819f-5044-a170-00513cfeea0e', 'bakery_cafe', 'Revenue', 'bakery.no_online_orders',
   'No Online Pre-Orders', 'No way for customers to order ahead, losing sales and creating waste.',
   64.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Online ordering impact data', 'Implement online ordering for pickup.', 'Online Ordering', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('05fc61bc-7124-5402-824d-2cc8fadd12a1', 'bakery_cafe', 'Operations', 'bakery.overproduction',
   'Overproduction Waste', 'Baking too much and throwing away unsold items daily.',
   76.00, 'high', 'fixed_range', NULL, NULL, 600.00, 1800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Bakery waste data', 'Use sales tracking to optimize daily production quantities.', 'POS / Analytics', 4);

-- Quiz Questions for bakery_cafe
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery_cafe', 'Do you know the exact ingredient cost for each menu item?', 1, 'd929307b-d688-5e97-8306-6132061ba46e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery_cafe', 'Do you sell wholesale to offices, restaurants, or events?', 2, 'aa04f7c7-33f3-5335-b3eb-ba40b935d138');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery_cafe', 'Can customers pre-order online for pickup?', 3, '44a4f9e2-819f-5044-a170-00513cfeea0e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('bakery_cafe', 'Do you track daily sell-through rates to optimize production?', 4, '05fc61bc-7124-5402-824d-2cc8fadd12a1');

-- ========== WEDDING EVENTS (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('aff86c8c-fc50-57e2-bf90-95de0964c499', 'wedding_events', 'Pricing', 'wedding.underpriced',
   'Packages Underpriced', 'Not pricing for market value or underestimating true time investment.',
   79.00, 'critical', 'pct_of_revenue', 0.1200, 0.2500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Wedding industry pricing data', 'Benchmark pricing and restructure packages.', 'Business Coaching', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('1faba41a-6a2b-521c-9ba7-f05e9edd2c9e', 'wedding_events', 'Sales', 'wedding.no_crm',
   'No Inquiry Tracking System', 'Leads managed through scattered emails with no follow-up system.',
   72.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Wedding lead conversion data', 'Implement CRM with automated follow-up sequences.', 'CRM', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('0f71106b-0b8d-50ff-bbfa-34b2eacb3ddf', 'wedding_events', 'Revenue', 'wedding.no_upsell',
   'No Upsell Strategy', 'Not offering add-ons, upgrades, or premium tiers after initial booking.',
   67.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Upsell attachment rate data', 'Create tiered packages with clear upgrade paths.', 'Sales Training', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d2adf121-8263-531c-8d4a-1fcbc3b9bc03', 'wedding_events', 'Marketing', 'wedding.no_vendor_network',
   'No Vendor Referral Network', 'Not getting or giving referrals from complementary vendors.',
   64.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Vendor referral data', 'Build preferred vendor list with mutual referral agreements.', 'Business Development', 4);

-- Quiz Questions for wedding_events
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wedding_events', 'Have you benchmarked your pricing against competitors in the last year?', 1, 'aff86c8c-fc50-57e2-bf90-95de0964c499');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wedding_events', 'Do you use a CRM to track inquiries and follow up automatically?', 2, '1faba41a-6a2b-521c-9ba7-f05e9edd2c9e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wedding_events', 'Do you offer tiered packages with clear upgrade options?', 3, '0f71106b-0b8d-50ff-bbfa-34b2eacb3ddf');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('wedding_events', 'Do you have mutual referral agreements with other vendors?', 4, 'd2adf121-8263-531c-8d4a-1fcbc3b9bc03');

-- ========== HOME SERVICES (5 patterns, 5 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a9bd4f58-5fbb-5501-acfb-798a26858661', 'home_services', 'Sales', 'homeserv.low_close',
   'Low Estimate Close Rate', 'Giving estimates but not converting them to jobs.',
   76.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Home services conversion data', 'Implement estimate follow-up and financing options.', 'CRM', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('541a96b3-b381-5909-8cbb-069eda073ead', 'home_services', 'Marketing', 'homeserv.no_reviews',
   'Weak Online Reviews', 'Few reviews or poor review score killing trust and visibility.',
   69.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Local business review data', 'Automate review requests after every job.', 'Reputation Mgmt', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ab76aa6d-7a6b-5548-9ca0-f1a2e7b0a641', 'home_services', 'Operations', 'homeserv.no_scheduling',
   'No Scheduling Software', 'Manual scheduling causing double-bookings and wasted drive time.',
   63.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Field service efficiency data', 'Implement scheduling and dispatch software.', 'Field Service Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c85b8827-bd4a-5779-95d1-f949b1e88908', 'home_services', 'Revenue', 'homeserv.no_maintenance',
   'No Recurring Revenue', 'One-time jobs only, no maintenance plans or seasonal contracts.',
   72.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Home services recurring data', 'Launch maintenance plan or membership program.', 'Membership Platform', 4);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('76e912be-f518-5cc1-9685-8ac323fad6b3', 'home_services', 'Pricing', 'homeserv.no_financing',
   'No Customer Financing', 'Losing big jobs because customers can''t pay in full upfront.',
   58.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Consumer financing studies', 'Offer financing through third-party provider.', 'Financing Platform', 5);

-- Quiz Questions for home_services
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home_services', 'Do you follow up on every estimate within 48 hours?', 1, 'a9bd4f58-5fbb-5501-acfb-798a26858661');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home_services', 'Do you actively ask for reviews after every completed job?', 2, '541a96b3-b381-5909-8cbb-069eda073ead');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home_services', 'Do you use scheduling and dispatch software?', 3, 'ab76aa6d-7a6b-5548-9ca0-f1a2e7b0a641');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home_services', 'Do you offer recurring maintenance plans or memberships?', 4, 'c85b8827-bd4a-5779-95d1-f949b1e88908');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('home_services', 'Do you offer financing options for larger jobs?', 5, '76e912be-f518-5cc1-9685-8ac323fad6b3');

-- ========== DAYCARE CHILDCARE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ce866265-90a2-5e5b-933b-7dba61f4775d', 'daycare_childcare', 'Revenue', 'daycare.low_enrollment',
   'Below Capacity Enrollment', 'Empty spots are pure overhead loss. Every unfilled slot costs the full rate.',
   67.00, 'critical', 'pct_of_revenue', 0.0500, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Childcare enrollment data', 'Implement waitlist management and enrollment marketing.', 'Childcare Mgmt Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('50f27232-3d16-5650-8503-4b377020cd2b', 'daycare_childcare', 'Billing', 'daycare.late_payments',
   'Late Tuition Payments', 'Parents paying late with no enforcement mechanism.',
   73.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Childcare billing data', 'Implement auto-pay with late fee policy.', 'Billing Software', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('beef3fb1-0c0b-542b-b8bf-00f89686c77b', 'daycare_childcare', 'Retention', 'daycare.parent_communication',
   'Poor Parent Communication', 'Parents feel disconnected from their child''s day, leading to attrition.',
   64.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Parent satisfaction studies', 'Implement daily reports app with photos and updates.', 'Parent Engagement App', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('965332aa-5c6b-576d-ad58-911723edda06', 'daycare_childcare', 'Labor', 'daycare.staff_turnover',
   'High Staff Turnover', 'Constant hiring and training disrupts care quality and parent trust.',
   78.00, 'high', 'per_employee', NULL, NULL, NULL, NULL, 250.00,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Childcare workforce data', 'Competitive pay, professional development, better culture.', 'HR / Workforce', 4);

-- Quiz Questions for daycare_childcare
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare_childcare', 'Are you at or above 90% enrollment capacity?', 1, 'ce866265-90a2-5e5b-933b-7dba61f4775d');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare_childcare', 'Do you have auto-pay set up with late fee enforcement?', 2, '50f27232-3d16-5650-8503-4b377020cd2b');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare_childcare', 'Do you send parents daily activity reports with photos?', 3, 'beef3fb1-0c0b-542b-b8bf-00f89686c77b');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('daycare_childcare', 'Is your annual staff turnover below 30%?', 4, '965332aa-5c6b-576d-ad58-911723edda06');

-- ========== PHARMACY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7b9a5ab9-0d5b-5b44-95a9-99d7c2a2c7f8', 'pharmacy', 'Revenue', 'pharmacy.low_front_end',
   'Weak Front-End Revenue', 'Over-reliance on scripts, not driving OTC, supplement, and wellness sales.',
   71.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pharmacy retail benchmarks', 'Optimize front-end merchandising and product mix.', 'Retail Consulting', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a3918cff-49b1-5f9b-b5e2-4f3688738692', 'pharmacy', 'Operations', 'pharmacy.slow_fulfillment',
   'Slow Prescription Fill Time', 'Long wait times causing patients to transfer to competitors.',
   58.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pharmacy workflow data', 'Optimize workflow and implement tech-check processes.', 'Pharmacy Software', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('40287aae-7e32-553f-8e48-a8c3e22bef44', 'pharmacy', 'Revenue', 'pharmacy.no_immunizations',
   'No Immunization/Clinical Services', 'Missing high-margin clinical service revenue stream.',
   48.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Clinical services revenue data', 'Add immunization and MTM services.', 'Clinical Training', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7747d2f6-ffa7-50ee-9063-8d862793c57c', 'pharmacy', 'Retention', 'pharmacy.adherence_gap',
   'No Medication Adherence Program', 'Patients not refilling on time means lost dispensing revenue.',
   66.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 3500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Adherence impact studies', 'Implement sync-fill and adherence outreach program.', 'Patient Engagement', 4);

-- Quiz Questions for pharmacy
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Is your front-end (non-Rx) revenue growing year over year?', 1, '7b9a5ab9-0d5b-5b44-95a9-99d7c2a2c7f8');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Is your average prescription fill time under 15 minutes?', 2, 'a3918cff-49b1-5f9b-b5e2-4f3688738692');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Do you offer immunizations and clinical services?', 3, '40287aae-7e32-553f-8e48-a8c3e22bef44');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pharmacy', 'Do you have a medication synchronization or adherence program?', 4, '7747d2f6-ffa7-50ee-9063-8d862793c57c');

-- ========== GYM CROSSFIT (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('75fad97d-dcbb-5e40-a3f0-6da8e0b3aa97', 'gym_crossfit', 'Retention', 'crossfit.member_churn',
   'Member Churn Above 5%/Month', 'Members canceling because they don''t feel community or results.',
   72.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'IHRSA retention data', 'Implement goal tracking and community engagement.', 'Gym Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('928136a3-6683-5a80-b626-84464d630f01', 'gym_crossfit', 'Revenue', 'crossfit.no_nutrition',
   'No Nutrition Program', 'Missing high-margin nutrition coaching and supplement revenue.',
   68.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Fitness ancillary revenue data', 'Add nutrition coaching and supplement retail.', 'Nutrition Platform', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4e241c53-e678-57fa-a3d9-49b3982fb627', 'gym_crossfit', 'Sales', 'crossfit.poor_onboarding',
   'Poor New Member Onboarding', 'New members thrown into classes without proper introduction, causing early dropout.',
   65.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Onboarding retention studies', 'Create structured on-ramp program.', 'Staff Training', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ffd5385f-6616-55e9-8ec2-917877e02ac0', 'gym_crossfit', 'Marketing', 'crossfit.no_social_proof',
   'No Member Success Stories', 'Not showcasing transformations and testimonials to attract new members.',
   62.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Fitness marketing data', 'Collect and share member transformation stories.', 'Social Media Mgmt', 4);

-- Quiz Questions for gym_crossfit
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym_crossfit', 'Is your monthly member churn rate below 5%?', 1, '75fad97d-dcbb-5e40-a3f0-6da8e0b3aa97');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym_crossfit', 'Do you offer nutrition coaching or supplements?', 2, '928136a3-6683-5a80-b626-84464d630f01');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym_crossfit', 'Do new members go through a structured onboarding program?', 3, '4e241c53-e678-57fa-a3d9-49b3982fb627');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('gym_crossfit', 'Do you regularly share member success stories and testimonials?', 4, 'ffd5385f-6616-55e9-8ec2-917877e02ac0');

-- ========== CHIROPRACTIC (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('f4c6f0db-0a9e-5c28-91ad-4e8dfa1fd081', 'chiropractic', 'Revenue', 'chiro.low_pv_avg',
   'Low Patient Visit Average', 'Patients dropping off before completing recommended care plans.',
   74.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Chiropractic practice data', 'Improve case presentation and care plan compliance tracking.', 'Practice Mgmt', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('bed97c0b-ce20-5b6b-9694-72d17b5712d2', 'chiropractic', 'Revenue', 'chiro.no_show',
   'High No-Show Rate', 'Patients missing scheduled appointments without advance notice.',
   68.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Healthcare no-show data', 'Automated reminders and no-show policy enforcement.', 'Patient Scheduling', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('2186124e-1fb8-5bcc-8fd6-52892aa8fce2', 'chiropractic', 'Marketing', 'chiro.new_patient_flow',
   'Low New Patient Flow', 'Not attracting enough new patients to sustain growth.',
   71.00, 'high', 'fixed_range', NULL, NULL, 1000.00, 4000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Chiropractic marketing data', 'Implement digital marketing with educational content.', 'Healthcare Marketing', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ae246705-5d2b-50c1-af09-0d89851b8443', 'chiropractic', 'Revenue', 'chiro.no_wellness',
   'No Wellness Programs', 'Missing recurring revenue from wellness/maintenance plans.',
   63.00, 'medium', 'fixed_range', NULL, NULL, 800.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Wellness plan ROI data', 'Create membership-based wellness plans.', 'Practice Consulting', 4);

-- Quiz Questions for chiropractic
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Do patients complete their recommended care plans at least 80% of the time?', 1, 'f4c6f0db-0a9e-5c28-91ad-4e8dfa1fd081');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Do you have automated appointment reminders?', 2, 'bed97c0b-ce20-5b6b-9694-72d17b5712d2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Are you attracting 15+ new patients per month?', 3, '2186124e-1fb8-5bcc-8fd6-52892aa8fce2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('chiropractic', 'Do you offer wellness/maintenance membership plans?', 4, 'ae246705-5d2b-50c1-af09-0d89851b8443');

-- ========== TUTORING EDUCATION (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('436abeb8-8553-5bd1-8eb2-6c556aa57da3', 'tutoring_education', 'Retention', 'tutoring.student_churn',
   'High Student Dropout Rate', 'Students leaving before showing results. Each dropout is months of lost revenue.',
   72.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Tutoring retention studies', 'Track progress metrics and share with parents regularly.', 'EdTech Platform', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ce74f677-ce08-5452-a09c-a9a7e9919666', 'tutoring_education', 'Revenue', 'tutoring.no_packages',
   'No Prepaid Packages', 'Session-by-session pricing with no commitment or bundled pricing.',
   68.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Service packaging studies', 'Create multi-session packages with commitment discounts.', 'Business Consulting', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9ab76d50-f2e4-5832-8f24-0bf84eab43fd', 'tutoring_education', 'Sales', 'tutoring.no_followup',
   'No Inquiry Follow-Up System', 'Parent inquiries going cold without systematic follow-up.',
   74.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Lead follow-up conversion data', 'Implement CRM with automated nurture emails.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('e5d802ae-eb9f-5b25-be7b-bf35ac5c4deb', 'tutoring_education', 'Marketing', 'tutoring.no_referral',
   'No Parent Referral Program', 'Happy parents are not incentivized to refer other families.',
   66.00, 'medium', 'fixed_range', NULL, NULL, 300.00, 1200.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Referral program data', 'Launch refer-a-family rewards program.', 'Marketing', 4);

-- Quiz Questions for tutoring_education
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring_education', 'Do you track and share student progress with parents regularly?', 1, '436abeb8-8553-5bd1-8eb2-6c556aa57da3');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring_education', 'Do you offer prepaid session packages or monthly memberships?', 2, 'ce74f677-ce08-5452-a09c-a9a7e9919666');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring_education', 'Do you follow up with every inquiry within 24 hours?', 3, '9ab76d50-f2e4-5832-8f24-0bf84eab43fd');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('tutoring_education', 'Do you have a parent referral rewards program?', 4, 'e5d802ae-eb9f-5b25-be7b-bf35ac5c4deb');

-- ========== MOVING COMPANY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fd47f9d8-a8c4-583f-8e51-a440f8b89c9a', 'moving_company', 'Pricing', 'moving.underquoting',
   'Underquoting on Jobs', 'Initial quotes too low, leading to on-site adjustments or eating the cost.',
   78.00, 'critical', 'pct_of_revenue', 0.0600, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Moving industry profitability data', 'Use virtual estimates and detailed checklist-based quoting.', 'Moving Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('73a164dc-8b22-5e92-9f4f-79ef88c4c882', 'moving_company', 'Marketing', 'moving.low_reviews',
   'Poor Online Reviews or Few Reviews', 'Potential customers choosing competitors with more and better reviews.',
   71.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Local business review data', 'Automate review requests after every move.', 'Reputation Mgmt', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9095796d-e6a0-58d2-8a03-31c526e6cd57', 'moving_company', 'Sales', 'moving.no_followup',
   'No Quote Follow-Up', 'Sending quotes but not following up with prospects.',
   73.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Quote follow-up data', 'Implement CRM with automated quote follow-up.', 'CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('17e7c068-792a-508d-91d0-37b7a6bfc034', 'moving_company', 'Revenue', 'moving.no_addons',
   'No Add-On Service Revenue', 'Not offering packing, storage, junk removal, or cleaning add-ons.',
   62.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Service attachment rate data', 'Offer and market complementary services.', 'Business Development', 4);

-- Quiz Questions for moving_company
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving_company', 'Do you use detailed checklists or virtual estimates for accurate quoting?', 1, 'fd47f9d8-a8c4-583f-8e51-a440f8b89c9a');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving_company', 'Do you actively collect reviews after every move?', 2, '73a164dc-8b22-5e92-9f4f-79ef88c4c882');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving_company', 'Do you follow up on every quote within 24 hours?', 3, '9095796d-e6a0-58d2-8a03-31c526e6cd57');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('moving_company', 'Do you offer add-on services (packing, storage, cleaning)?', 4, '17e7c068-792a-508d-91d0-37b7a6bfc034');

-- ========== ROOFING (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('17150c27-747a-57b9-8568-3d09336e1646', 'roofing', 'Sales', 'roofing.low_close',
   'Low Estimate Close Rate', 'Giving free inspections and estimates but closing below 40%.',
   74.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Roofing industry sales data', 'Implement sales training and financing options.', 'Sales Training', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d83e52a4-a3a2-5898-b916-481cdc26c4c2', 'roofing', 'Marketing', 'roofing.no_storm_system',
   'No Storm Response System', 'Not capitalizing on storm events with rapid canvassing and outreach.',
   62.00, 'high', 'fixed_range', NULL, NULL, 2000.00, 8000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Storm restoration data', 'Build storm response protocol with canvass teams.', 'Sales / Marketing', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a577436b-8244-5fd7-8a94-d8ef3ad53ec3', 'roofing', 'Operations', 'roofing.no_project_mgmt',
   'No Project Management System', 'Jobs tracked on paper or spreadsheets causing missed steps and delays.',
   67.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Roofing project mgmt data', 'Implement roofing-specific project management software.', 'Project Mgmt Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('695b8ef9-543c-5257-a70e-0b0ec1a18f14', 'roofing', 'Revenue', 'roofing.no_maintenance',
   'No Maintenance/Inspection Plans', 'One-time job with no ongoing revenue relationship.',
   71.00, 'medium', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Roof maintenance program data', 'Launch annual roof inspection/maintenance plans.', 'Membership Platform', 4);

-- Quiz Questions for roofing
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Is your estimate-to-close rate above 40%?', 1, '17150c27-747a-57b9-8568-3d09336e1646');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Do you have a system to respond to storm events within 24 hours?', 2, 'd83e52a4-a3a2-5898-b916-481cdc26c4c2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Do you use project management software for all jobs?', 3, 'a577436b-8244-5fd7-8a94-d8ef3ad53ec3');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('roofing', 'Do you offer annual roof maintenance or inspection plans?', 4, '695b8ef9-543c-5257-a70e-0b0ec1a18f14');

-- ========== FLORIST (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('34f275ee-acc0-5137-b570-32f145f25636', 'florist', 'Revenue', 'florist.no_subscriptions',
   'No Subscription/Recurring Revenue', 'All sales are one-time transactions with no recurring income.',
   74.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Floral subscription data', 'Launch weekly/monthly flower subscription program.', 'eCommerce Platform', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('392d0c73-43c6-5332-908e-92670517f650', 'florist', 'Revenue', 'florist.no_corporate',
   'No Corporate Accounts', 'Missing recurring revenue from offices, hotels, restaurants, events.',
   68.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Corporate floral account data', 'Build B2B outreach program for corporate clients.', 'Business Development', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('93458be5-26e8-5b68-8dfe-836422327366', 'florist', 'Cost Control', 'florist.waste_high',
   'High Perishable Waste', 'Flowers dying before sale, poor inventory rotation, over-ordering.',
   77.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Floral waste benchmarks', 'Optimize buying based on sales patterns and pre-orders.', 'Inventory Mgmt', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fe810d23-3a87-5ffd-921f-b1f1107b929a', 'florist', 'Marketing', 'florist.weak_online',
   'No Online Ordering', 'No website ordering capability, losing to online competitors.',
   55.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Online floral market data', 'Build online ordering with local delivery.', 'eCommerce Platform', 4);

-- Quiz Questions for florist
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Do you offer a weekly or monthly flower subscription?', 1, '34f275ee-acc0-5137-b570-32f145f25636');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Do you actively market to corporate clients for recurring orders?', 2, '392d0c73-43c6-5332-908e-92670517f650');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Do you track and minimize floral waste and spoilage?', 3, '93458be5-26e8-5b68-8dfe-836422327366');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('florist', 'Can customers order arrangements online for delivery?', 4, 'fe810d23-3a87-5ffd-921f-b1f1107b929a');

-- ========== PROPERTY MANAGEMENT (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ed8b7f1d-8757-5c85-9f7a-5aa792b3edef', 'property_management', 'Revenue', 'propmgmt.below_market_rent',
   'Below Market Rent Rates', 'Rents not keeping up with market rates, leaving money on the table.',
   72.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Rent benchmark data', 'Implement annual rent surveys and market rate adjustments.', 'Property Mgmt Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('ab2f957e-1a97-5ca1-8304-9c056978f6c0', 'property_management', 'Operations', 'propmgmt.vacancy_rate',
   'High Vacancy Rate', 'Units sitting empty too long between tenants.',
   65.00, 'critical', 'pct_of_revenue', 0.0300, 0.1000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Vacancy cost data', 'Optimize listing, showings, and turnover process.', 'Leasing Software', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c97f8d70-3de1-5bc6-8153-9405e1aabd46', 'property_management', 'Maintenance', 'propmgmt.reactive_maintenance',
   'Reactive Maintenance Only', 'Emergency repairs cost 3-5x more than preventive maintenance.',
   69.00, 'high', 'pct_of_revenue', 0.0200, 0.0600, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Maintenance cost studies', 'Implement preventive maintenance schedules.', 'Maintenance Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a6371145-22bb-5e5a-b5c9-6ddb9799e0fa', 'property_management', 'Billing', 'propmgmt.late_rent',
   'High Late Payment Rate', 'Tenants paying late affecting cash flow.',
   71.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Rent collection data', 'Implement online payment portal with auto-pay incentives.', 'Property Mgmt Software', 4);

-- Quiz Questions for property_management
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property_management', 'Do you review rent rates against market comparables at least annually?', 1, 'ed8b7f1d-8757-5c85-9f7a-5aa792b3edef');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property_management', 'Is your average vacancy between tenants under 30 days?', 2, 'ab2f957e-1a97-5ca1-8304-9c056978f6c0');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property_management', 'Do you have a preventive maintenance schedule for all properties?', 3, 'c97f8d70-3de1-5bc6-8153-9405e1aabd46');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('property_management', 'Do you offer online rent payment with auto-pay options?', 4, 'a6371145-22bb-5e5a-b5c9-6ddb9799e0fa');

-- ========== COFFEE SHOP (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('0e93d76c-0072-52cf-a88c-d48bddb049bc', 'coffee_shop', 'Revenue', 'coffee.low_avg_ticket',
   'Low Average Ticket', 'Customers buying one drink and leaving. No food, no add-ons.',
   76.00, 'high', 'pct_of_revenue', 0.0800, 0.1500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Coffee shop revenue data', 'Train on upselling, improve food menu, add-on prompts.', 'Staff Training', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('f2ba5bd9-0807-53b3-9f93-97b927caa700', 'coffee_shop', 'Retention', 'coffee.no_loyalty',
   'No Loyalty Program', 'No punch card, app, or system to incentivize repeat visits.',
   58.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Coffee loyalty data', 'Launch digital loyalty program.', 'Loyalty Platform', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('6b34658b-fe6e-55f8-a4e8-1937c1ec6e1a', 'coffee_shop', 'Operations', 'coffee.labor_cost_high',
   'Labor Cost Over 35%', 'Overstaffing during slow periods, understaffing during rush.',
   69.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Coffee shop labor benchmarks', 'Use traffic-based scheduling.', 'Workforce Mgmt', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d651bd10-e345-520e-9ef3-f3db0c66e620', 'coffee_shop', 'Revenue', 'coffee.no_mobile_ordering',
   'No Mobile Ordering', 'Losing skip-the-line customers to chains with mobile order-ahead.',
   52.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Mobile ordering impact data', 'Implement mobile order-ahead through POS integration.', 'POS / Mobile Ordering', 4);

-- Quiz Questions for coffee_shop
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('coffee_shop', 'Do your staff actively suggest food items or drink add-ons?', 1, '0e93d76c-0072-52cf-a88c-d48bddb049bc');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('coffee_shop', 'Do you have a loyalty/rewards program?', 2, 'f2ba5bd9-0807-53b3-9f93-97b927caa700');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('coffee_shop', 'Is your labor cost below 35% of revenue?', 3, '6b34658b-fe6e-55f8-a4e8-1937c1ec6e1a');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('coffee_shop', 'Can customers order ahead on their phone?', 4, 'd651bd10-e345-520e-9ef3-f3db0c66e620');

-- ========== AUTO DEALERSHIP (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9d7749e1-ec57-53b3-bc1f-e846d652ded8', 'auto_dealership', 'Revenue', 'dealer.low_f_and_i',
   'Low F&I Revenue Per Unit', 'Finance and insurance products not being presented effectively.',
   71.00, 'critical', 'fixed_range', NULL, NULL, 2000.00, 8000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'NADA dealer benchmarks', 'Train F&I staff on menu selling and compliance.', 'F&I Training', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c85fabc7-e688-51b3-ad51-1dd9d5681e14', 'auto_dealership', 'Revenue', 'dealer.service_retention',
   'Low Service Department Retention', 'Customers not returning for service after purchase.',
   74.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Service retention data', 'Implement service reminder program and loyalty rewards.', 'Dealer CRM', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a24609a0-c647-5dde-b789-a440e4787579', 'auto_dealership', 'Sales', 'dealer.internet_lead',
   'Poor Internet Lead Follow-Up', 'Online leads not contacted within minutes, going to competitors.',
   68.00, 'high', 'fixed_range', NULL, NULL, 3000.00, 10000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Lead response time studies', 'Implement instant auto-response and 5-min callback.', 'Dealer CRM', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('8cba1214-31ac-50bc-be10-8bbc867e1534', 'auto_dealership', 'Revenue', 'dealer.low_used_margin',
   'Low Used Vehicle Margins', 'Aging inventory, poor pricing, and missed reconditioning opportunities.',
   66.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Used vehicle profitability data', 'Implement market-based pricing and inventory turn rules.', 'Inventory / Pricing', 4);

-- Quiz Questions for auto_dealership
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_dealership', 'Is your F&I revenue above $1,500 per unit?', 1, '9d7749e1-ec57-53b3-bc1f-e846d652ded8');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_dealership', 'Do customers return to your service department after purchase?', 2, 'c85fabc7-e688-51b3-ad51-1dd9d5681e14');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_dealership', 'Do you respond to online leads within 10 minutes?', 3, 'a24609a0-c647-5dde-b789-a440e4787579');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('auto_dealership', 'Do you use market data to price used vehicles?', 4, '8cba1214-31ac-50bc-be10-8bbc867e1534');

-- ========== STAFFING AGENCY (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('79647306-81b2-52ce-b8bb-fcf5775ff1c3', 'staffing_agency', 'Revenue', 'staffing.low_fill_rate',
   'Low Fill Rate', 'Not filling enough job orders, leaving revenue on the table.',
   72.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'ASA staffing benchmarks', 'Improve sourcing pipeline and candidate database.', 'ATS / Recruiting', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('29136189-a9e6-52a1-9213-e01c79fd2286', 'staffing_agency', 'Retention', 'staffing.client_churn',
   'Client Churn Above 20%', 'Clients leaving for competitors or bringing hiring in-house.',
   68.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Staffing retention data', 'Implement client success program with QBRs.', 'Client Success', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('fb1c3d78-cf3a-5ba6-9e05-2a3ca0a9ece6', 'staffing_agency', 'Operations', 'staffing.slow_time_to_fill',
   'Slow Time-to-Fill', 'Taking too long to present candidates, losing orders to faster agencies.',
   65.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Time-to-fill benchmarks', 'Build talent pipeline with pre-screened candidates.', 'ATS Software', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('e3c83aef-0d6e-504a-b65a-eca3878dcba1', 'staffing_agency', 'Revenue', 'staffing.no_temp_to_perm',
   'No Temp-to-Perm Conversions', 'Not capitalizing on conversion fees when temps are hired permanently.',
   56.00, 'medium', 'fixed_range', NULL, NULL, 1000.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Conversion fee data', 'Implement temp-to-perm tracking and fee structure.', 'Legal / Contracts', 4);

-- Quiz Questions for staffing_agency
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing_agency', 'Is your fill rate above 80%?', 1, '79647306-81b2-52ce-b8bb-fcf5775ff1c3');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing_agency', 'Is your annual client retention rate above 80%?', 2, '29136189-a9e6-52a1-9213-e01c79fd2286');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing_agency', 'Is your average time-to-fill under 5 business days?', 3, 'fb1c3d78-cf3a-5ba6-9e05-2a3ca0a9ece6');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('staffing_agency', 'Do you track and charge for temp-to-perm conversions?', 4, 'e3c83aef-0d6e-504a-b65a-eca3878dcba1');

-- ========== MEDICAL SPA (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('7b2e302a-8dab-501a-ad9f-bf17b0f17834', 'medical_spa', 'Revenue', 'medspa.low_treatment_plans',
   'No Treatment Plan Presentation', 'Selling single sessions instead of multi-session treatment plans.',
   73.00, 'critical', 'pct_of_revenue', 0.1000, 0.2000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Med spa revenue benchmarks', 'Train on consultative treatment plan selling.', 'Sales Training', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('0d0186ca-3b36-5789-9e80-b6bef03a9da2', 'medical_spa', 'Retention', 'medspa.no_membership',
   'No Membership Program', 'No recurring revenue model from loyal clients.',
   62.00, 'high', 'fixed_range', NULL, NULL, 1500.00, 5000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Med spa membership data', 'Launch monthly membership with included treatments.', 'Membership Platform', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b61c9102-fd92-5ab0-8777-4788145f0e68', 'medical_spa', 'Marketing', 'medspa.no_before_after',
   'No Before/After Content', 'Not showcasing results, the most powerful conversion tool in aesthetics.',
   58.00, 'high', 'fixed_range', NULL, NULL, 800.00, 3000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Med spa marketing data', 'Systematize before/after photo collection and sharing.', 'Social Media Mgmt', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4728c6bd-fa47-5466-910a-14a9a678fc7a', 'medical_spa', 'Revenue', 'medspa.no_product_sales',
   'Weak Retail Product Sales', 'Not selling post-treatment skincare that extends results.',
   67.00, 'medium', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Retail attachment data', 'Train on product recommendations tied to treatments.', 'Staff Training', 4);

-- Quiz Questions for medical_spa
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical_spa', 'Do you present multi-session treatment plans (vs. single sessions)?', 1, '7b2e302a-8dab-501a-ad9f-bf17b0f17834');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical_spa', 'Do you have a monthly membership program?', 2, '0d0186ca-3b36-5789-9e80-b6bef03a9da2');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical_spa', 'Do you systematically collect and share before/after photos?', 3, 'b61c9102-fd92-5ab0-8777-4788145f0e68');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('medical_spa', 'Do your providers recommend take-home products after treatments?', 4, '4728c6bd-fa47-5466-910a-14a9a678fc7a');

-- ========== CAR WASH (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('46feb255-bd28-527c-aa08-5cc0fdb4201e', 'car_wash', 'Revenue', 'carwash.no_membership',
   'No Unlimited Wash Membership', 'Missing predictable recurring revenue from membership program.',
   48.00, 'critical', 'pct_of_revenue', 0.1000, 0.2500, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Car wash industry data', 'Launch unlimited wash membership with tiered pricing.', 'Membership Platform', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('107e91fe-0859-5f6a-b4a2-475fe0417c6c', 'car_wash', 'Revenue', 'carwash.low_upsell',
   'Low Upsell Rate', 'Customers buying base wash without premium upgrades.',
   72.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Upsell conversion data', 'Optimize menu board and train on upgrade selling.', 'Staff Training', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('74294a2f-2125-5b0b-87f4-99c95abf9336', 'car_wash', 'Marketing', 'carwash.no_fleet',
   'No Fleet/Commercial Accounts', 'Missing steady B2B revenue from fleet and corporate accounts.',
   63.00, 'high', 'fixed_range', NULL, NULL, 600.00, 2500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Fleet account data', 'Build fleet program with volume pricing.', 'Business Development', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9b30cfd5-7c8c-5c33-bb32-501816fe7b9c', 'car_wash', 'Operations', 'carwash.equipment_downtime',
   'Equipment Downtime', 'Equipment failures causing lost revenue during peak hours.',
   56.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Equipment maintenance data', 'Implement preventive maintenance schedule.', 'Equipment Maintenance', 4);

-- Quiz Questions for car_wash
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car_wash', 'Do you offer an unlimited wash membership program?', 1, '46feb255-bd28-527c-aa08-5cc0fdb4201e');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car_wash', 'Do you upsell premium packages to at least 30% of customers?', 2, '107e91fe-0859-5f6a-b4a2-475fe0417c6c');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car_wash', 'Do you have fleet or commercial accounts?', 3, '74294a2f-2125-5b0b-87f4-99c95abf9336');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('car_wash', 'Do you have a preventive maintenance schedule for all equipment?', 4, '9b30cfd5-7c8c-5c33-bb32-501816fe7b9c');

-- ========== YOGA PILATES (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('1d3c8d22-446e-54fd-b58a-d8dfb9b99150', 'yoga_pilates', 'Retention', 'yoga.member_retention',
   'Low Student Retention', 'Students attending a few classes then disappearing.',
   74.00, 'critical', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Studio retention data', 'Implement new student journey with milestones.', 'Studio Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('e0087130-06da-5425-a6fc-701b3a6567c5', 'yoga_pilates', 'Revenue', 'yoga.no_retail',
   'No Retail/Workshop Revenue', 'Missing revenue from retail, workshops, retreats, teacher training.',
   67.00, 'high', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Studio ancillary revenue data', 'Add retail, workshops, and special events.', 'Business Consulting', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4139ad17-0207-5860-a82b-bec5a74f1f19', 'yoga_pilates', 'Revenue', 'yoga.class_pass_dependency',
   'Over-Reliance on ClassPass', 'Aggregator platforms bringing low-value, non-loyal students.',
   56.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Aggregator revenue data', 'Convert ClassPass users to direct memberships.', 'Marketing', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('d8ecd90f-f4eb-5dc8-ba5c-294cef65c5cc', 'yoga_pilates', 'Marketing', 'yoga.no_community',
   'No Community Building', 'Studio feels transactional, not like a community, hurting retention.',
   61.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1500.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Community impact data', 'Host events, challenges, and social gatherings.', 'Marketing', 4);

-- Quiz Questions for yoga_pilates
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga_pilates', 'Do new students return for at least 10 classes within their first month?', 1, '1d3c8d22-446e-54fd-b58a-d8dfb9b99150');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga_pilates', 'Do you generate revenue from retail, workshops, or retreats?', 2, 'e0087130-06da-5425-a6fc-701b3a6567c5');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga_pilates', 'Is less than 20% of your revenue from aggregator platforms?', 3, '4139ad17-0207-5860-a82b-bec5a74f1f19');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('yoga_pilates', 'Do you host community events or challenges regularly?', 4, 'd8ecd90f-f4eb-5dc8-ba5c-294cef65c5cc');

-- ========== PEST CONTROL (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('dab38889-15c0-529e-adf1-1de14fccf0b6', 'pest_control', 'Revenue', 'pest.no_recurring',
   'No Recurring Service Plans', 'All one-time treatments with no ongoing contracts.',
   58.00, 'critical', 'pct_of_revenue', 0.1000, 0.2000, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Pest control revenue data', 'Launch quarterly treatment plans with auto-renewal.', 'Field Service Software', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b29fcc89-9014-5c2b-bd54-1bcf0c854341', 'pest_control', 'Sales', 'pest.low_conversion',
   'Low Lead Conversion', 'Getting calls but not converting to booked services.',
   72.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Home services conversion data', 'Train phone staff on consultative booking.', 'Sales Training', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b2a4d31b-9343-5624-a9b1-f8cf29868c2f', 'pest_control', 'Marketing', 'pest.no_seasonal',
   'No Seasonal Marketing', 'Not capitalizing on seasonal pest surges with targeted campaigns.',
   66.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Seasonal marketing data', 'Build seasonal campaign calendar.', 'Marketing', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('a638cfd2-a98a-5ddc-93b0-7183533138bb', 'pest_control', 'Operations', 'pest.route_efficiency',
   'Poor Route Efficiency', 'Technicians driving long distances between service calls.',
   68.00, 'high', 'pct_of_revenue', 0.0300, 0.0800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Route optimization data', 'Implement route optimization software.', 'Field Service Software', 4);

-- Quiz Questions for pest_control
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest_control', 'Do you offer recurring quarterly or monthly service plans?', 1, 'dab38889-15c0-529e-adf1-1de14fccf0b6');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest_control', 'Is your phone-to-booking conversion rate above 60%?', 2, 'b29fcc89-9014-5c2b-bd54-1bcf0c854341');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest_control', 'Do you run targeted campaigns before seasonal pest surges?', 3, 'b2a4d31b-9343-5624-a9b1-f8cf29868c2f');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('pest_control', 'Do you use route optimization for daily scheduling?', 4, 'a638cfd2-a98a-5ddc-93b0-7183533138bb');

-- ========== PRINTING SIGNAGE (4 patterns, 4 questions) ==========
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('b0bd00f4-6072-57d5-9701-d3502aebfe79', 'printing_signage', 'Revenue', 'print.no_recurring',
   'No Recurring Revenue', 'All project-based work with no maintenance or subscription contracts.',
   74.00, 'high', 'pct_of_revenue', 0.0500, 0.1200, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Print industry data', 'Offer managed print and signage maintenance contracts.', 'Business Consulting', 1);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('c807898d-926e-5d32-acbc-0efb8b772e36', 'printing_signage', 'Pricing', 'print.race_to_bottom',
   'Racing to Bottom on Price', 'Competing on price instead of value and turnaround speed.',
   71.00, 'critical', 'pct_of_revenue', 0.0800, 0.1800, NULL, NULL, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Print pricing studies', 'Reposition on speed, quality, and service.', 'Business Consulting', 2);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('9cfaecd7-5e08-5518-a2c0-3e8b1a5c6187', 'printing_signage', 'Revenue', 'print.no_design_services',
   'No Design Services', 'Printing what customers bring instead of offering design.',
   56.00, 'medium', 'fixed_range', NULL, NULL, 500.00, 2000.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Design service revenue data', 'Add design services or partner with designers.', 'Business Development', 3);
INSERT INTO industry_leak_patterns 
  (id, industry, leak_category, detector_id, title, description, probability_pct, severity,
   loss_type, loss_pct_low, loss_pct_high, loss_fixed_low, loss_fixed_high, loss_per_employee,
   impact_statement, evidence_line, fix_description, affiliate_category, display_order)
VALUES
  ('4c28e245-939e-5a45-8adf-6b3ff10fcd71', 'printing_signage', 'Marketing', 'print.no_online_presence',
   'Weak Online Ordering', 'No website ordering, customers must call or visit.',
   62.00, 'medium', 'fixed_range', NULL, NULL, 400.00, 1800.00, NULL,
   '{{pct}}% of {{industry}} businesses have this problem. Impact: {{loss_low}}–{{loss_high}}/month.',
   'Online print ordering data', 'Add web-to-print ordering capability.', 'eCommerce / Web-to-Print', 4);

-- Quiz Questions for printing_signage
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing_signage', 'Do you have recurring service contracts for signage or print management?', 1, 'b0bd00f4-6072-57d5-9701-d3502aebfe79');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing_signage', 'Do you compete on value and speed (vs. lowest price)?', 2, 'c807898d-926e-5d32-acbc-0efb8b772e36');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing_signage', 'Do you offer design services alongside printing?', 3, '9cfaecd7-5e08-5518-a2c0-3e8b1a5c6187');
INSERT INTO diagnostic_questions
  (industry, question_text, question_order, no_leak_pattern_id)
VALUES
  ('printing_signage', 'Can customers order online through your website?', 4, '4c28e245-939e-5a45-8adf-6b3ff10fcd71');


-- ============================================================
-- BATCH 2 TOTAL: 105 patterns + 105 questions across 25 industries
-- ============================================================