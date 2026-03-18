-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — V9: INDUSTRY-SPECIFIC SOLUTIONS DATABASE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Maps AFFILIATE and FREE products to ALL 156 industries
-- Each industry gets both paid (affiliate) and free (non-affiliate) solutions
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create the industry_solutions table if not exists
CREATE TABLE IF NOT EXISTS industry_solutions (
    id SERIAL PRIMARY KEY,
    industry_slug TEXT NOT NULL,
    product_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('AFFILIATE', 'FREE')),
    category TEXT,
    description TEXT,
    url TEXT,
    relevance_score INTEGER DEFAULT 80,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(industry_slug, product_slug)
);

CREATE INDEX IF NOT EXISTS idx_industry_solutions_industry ON industry_solutions(industry_slug);
CREATE INDEX IF NOT EXISTS idx_industry_solutions_type ON industry_solutions(product_type);
CREATE INDEX IF NOT EXISTS idx_industry_solutions_active ON industry_solutions(active);


-- ═══ ACCOUNTING (8 affiliate, 3 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('accounting', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ADDICTION-TREATMENT (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('addiction-treatment', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ AGENCY (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'semrush', 'Semrush', 'AFFILIATE', 'SEO', 'SEO toolkit. $200-350/sale.', 'https://www.semrush.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'ahrefs', 'Ahrefs', 'AFFILIATE', 'SEO', 'SEO tools. 20% revenue share.', 'https://ahrefs.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('agency', 'client-retention-agency-diy', 'DIY: Client Retention Framework', 'FREE', 'DIY', 'Monthly reporting cadence. QBRs. Strategic roadmaps.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ AMUSEMENT-RECREATION (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'centeredge', 'CenterEdge', 'AFFILIATE', 'Recreation', 'Attraction management & POS. Partner program.', 'https://centeredge.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('amusement-recreation', 'revenue-per-visit-diy', 'DIY: Revenue Per Visit Optimization', 'FREE', 'DIY', 'F&B upsell, party packages, membership tiers, event nights.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ APP-DEVELOPMENT (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'cloudways', 'Cloudways', 'AFFILIATE', 'Hosting', 'Managed hosting. Up to $125/sale.', 'https://www.cloudways.com/en/affiliate.php')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'scope-creep-diy', 'DIY: Project Scope Document Template', 'FREE', 'Template', 'SOW template with change order process. Bill every change.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('app-development', 'github-copilot', 'GitHub Copilot', 'AFFILIATE', 'Dev Tools', 'AI coding assistant. Referral program.', 'https://github.com/features/copilot')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ APPLIANCE-REPAIR (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'repairshopr', 'RepairShopr', 'AFFILIATE', 'Repair CRM', 'Repair shop management. Partner program.', 'https://www.repairshopr.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('appliance-repair', 'repair-pricing-diy', 'DIY: Flat-Rate Pricing Implementation', 'FREE', 'DIY', 'Move from hourly to flat-rate. Increases revenue per job 20-30%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ARCHITECTURE (8 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'bqe-core', 'BQE CORE', 'AFFILIATE', 'AEC PM', 'Architecture/engineering PM. Partner program.', 'https://www.bqe.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('architecture', 'multiplier-diy', 'DIY: Revenue Multiplier Optimization', 'FREE', 'DIY', 'Target 2.5-3x multiplier on direct labor. Track weekly.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ AUTO-BODY (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'shopmonkey', 'ShopMonkey', 'AFFILIATE', 'Auto Repair', 'Auto repair management. Partner program.', 'https://www.shopmonkey.io')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'mitchell1', 'Mitchell 1', 'AFFILIATE', 'Auto Repair', 'Auto repair software + info. Partner program.', 'https://mitchell1.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-body', 'labor-rate-diy', 'DIY: Effective Labor Rate Optimization', 'FREE', 'DIY', 'Target $100+/hr. Track by tech. Reduce comebacks.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ AUTO-DETAILING (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'shopmonkey', 'ShopMonkey', 'AFFILIATE', 'Auto Repair', 'Auto repair management. Partner program.', 'https://www.shopmonkey.io')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'mitchell1', 'Mitchell 1', 'AFFILIATE', 'Auto Repair', 'Auto repair software + info. Partner program.', 'https://mitchell1.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-detailing', 'labor-rate-diy', 'DIY: Effective Labor Rate Optimization', 'FREE', 'DIY', 'Target $100+/hr. Track by tech. Reduce comebacks.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ AUTO-PARTS (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-parts', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ AUTO-REPAIR (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'shopmonkey', 'ShopMonkey', 'AFFILIATE', 'Auto Repair', 'Auto repair management. Partner program.', 'https://www.shopmonkey.io')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'mitchell1', 'Mitchell 1', 'AFFILIATE', 'Auto Repair', 'Auto repair software + info. Partner program.', 'https://mitchell1.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('auto-repair', 'labor-rate-diy', 'DIY: Effective Labor Rate Optimization', 'FREE', 'DIY', 'Target $100+/hr. Track by tech. Reduce comebacks.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BAKERY (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bakery', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BAR-NIGHTCLUB (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'barmetrics', 'BevSpot', 'AFFILIATE', 'Bar Inventory', 'Bar inventory management. Partner program.', 'https://www.bevspot.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bar-nightclub', 'pour-cost-diy', 'DIY: Pour Cost Control', 'FREE', 'DIY', 'Weekly inventory counts. Target 20-22%. Portioning systems.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BARBER-SHOP (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'vagaro', 'Vagaro', 'AFFILIATE', 'Booking', 'Salon/spa booking. $100/referral.', 'https://www.vagaro.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'fresha', 'Fresha (Free)', 'FREE', 'Booking', 'Free salon booking. No subscription fees.', 'https://www.fresha.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('barber-shop', 'retail-attach-diy', 'DIY: Retail Product Sales Training', 'FREE', 'DIY', 'Target 10%+ of revenue from retail. Commission incentives.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BEAUTY-SALON (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'vagaro', 'Vagaro', 'AFFILIATE', 'Booking', 'Salon/spa booking. $100/referral.', 'https://www.vagaro.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'fresha', 'Fresha (Free)', 'FREE', 'Booking', 'Free salon booking. No subscription fees.', 'https://www.fresha.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beauty-salon', 'retail-attach-diy', 'DIY: Retail Product Sales Training', 'FREE', 'DIY', 'Target 10%+ of revenue from retail. Commission incentives.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BED-BREAKFAST (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'cloudbeds', 'Cloudbeds', 'AFFILIATE', 'Hotel PMS', 'Hotel management platform. Partner program.', 'https://www.cloudbeds.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'qloapps-free', 'QloApps (Free)', 'FREE', 'Hotel PMS', 'Open-source hotel management. PMS, booking engine, website.', 'https://qloapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'little-hotelier', 'Little Hotelier', 'AFFILIATE', 'Hotel PMS', 'Small property management. Partner program.', 'https://www.littlehotelier.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bed-breakfast', 'revpar-diy', 'DIY: RevPAR Optimization', 'FREE', 'DIY', 'Dynamic pricing by day/season. OTA vs direct booking strategy.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BEVERAGE-MANUFACTURING (8 affiliate, 8 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'safefood360', 'SafeFood 360', 'AFFILIATE', 'Food Safety', 'Food safety management (HACCP/SQF). Referral program.', 'https://safefood360.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('beverage-manufacturing', 'haccp-plan-diy', 'DIY: HACCP Plan Development', 'FREE', 'Compliance', 'FDA templates available free. Critical for compliance.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BOOKKEEPING (9 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'dext', 'Dext (Receipt Bank)', 'AFFILIATE', 'Bookkeeping', 'Receipt scanning. 20% recurring.', 'https://dext.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookkeeping', 'revenue-per-client-diy', 'DIY: Monthly Recurring Revenue Packaging', 'FREE', 'DIY', 'Package services at $400+/mo. Tiered pricing.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BOOKSTORE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bookstore', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ BOWLING-ALLEY (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'centeredge', 'CenterEdge', 'AFFILIATE', 'Recreation', 'Attraction management & POS. Partner program.', 'https://centeredge.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('bowling-alley', 'revenue-per-visit-diy', 'DIY: Revenue Per Visit Optimization', 'FREE', 'DIY', 'F&B upsell, party packages, membership tiers, event nights.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CAFE-COFFEE-SHOP (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cafe-coffee-shop', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CANNABIS (8 affiliate, 8 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'dutchie', 'Dutchie', 'AFFILIATE', 'Cannabis POS', 'Cannabis POS and e-commerce. Partner program.', 'https://dutchie.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis', 'metrc-compliance-diy', 'DIY: Seed-to-Sale Compliance Tracking', 'FREE', 'Compliance', 'State-required tracking. Reduce compliance violations.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CANNABIS-RETAIL (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'dutchie', 'Dutchie', 'AFFILIATE', 'Cannabis POS', 'Cannabis POS and e-commerce. Partner program.', 'https://dutchie.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cannabis-retail', 'metrc-compliance-diy', 'DIY: Seed-to-Sale Compliance Tracking', 'FREE', 'Compliance', 'State-required tracking. Reduce compliance violations.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CAR-DEALERSHIP (9 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'shopmonkey', 'ShopMonkey', 'AFFILIATE', 'Auto Repair', 'Auto repair management. Partner program.', 'https://www.shopmonkey.io')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'mitchell1', 'Mitchell 1', 'AFFILIATE', 'Auto Repair', 'Auto repair software + info. Partner program.', 'https://mitchell1.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'labor-rate-diy', 'DIY: Effective Labor Rate Optimization', 'FREE', 'DIY', 'Target $100+/hr. Track by tech. Reduce comebacks.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'dealersocket', 'DealerSocket', 'AFFILIATE', 'Dealer CRM', 'Dealership CRM. Partner program.', 'https://www.dealersocket.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-dealership', 'fi-revenue-diy', 'DIY: F&I Revenue Per Deal Improvement', 'FREE', 'DIY', 'Target $1500+/deal. Menu selling. 100% F&I presentation.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CAR-WASH (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'dencar', 'DRB Systems', 'AFFILIATE', 'Car Wash', 'Car wash POS and management. Partner program.', 'https://www.drb.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('car-wash', 'membership-conversion-diy', 'DIY: Unlimited Wash Membership Program', 'FREE', 'DIY', 'Convert 15%+ to membership. 3 visits/mo = breakeven. Lock in MRR.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CATERING (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('catering', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CHILDCARE-HOME (6 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'brightwheel', 'Brightwheel', 'AFFILIATE', 'Childcare', 'Childcare management app. Referral program.', 'https://mybrightwheel.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'procare', 'Procare Solutions', 'AFFILIATE', 'Childcare', 'Childcare management. Partner program.', 'https://www.procaresoftware.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('childcare-home', 'occupancy-diy', 'DIY: Occupancy Rate Optimization', 'FREE', 'DIY', 'Waitlist management. Flexible scheduling. Subsidy enrollment.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CHIROPRACTIC (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('chiropractic', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CHURCH-RELIGIOUS (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'bloomerang', 'Bloomerang', 'AFFILIATE', 'Nonprofit CRM', 'Donor management. Partner program.', 'https://bloomerang.co/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'little-green-light', 'Little Green Light', 'AFFILIATE', 'Nonprofit CRM', 'Donor management. Referral program.', 'https://www.littlegreenlight.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'civicrm-free', 'CiviCRM (Free)', 'FREE', 'CRM', 'Open-source nonprofit CRM. Fundraising, memberships.', 'https://civicrm.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('church-religious', 'donor-retention-diy', 'DIY: Donor Retention Program', 'FREE', 'DIY', 'Thank within 48hrs. Impact reports. Recurring giving push.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CLEANING (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'swept', 'Swept', 'AFFILIATE', 'Cleaning', 'Janitorial management software. Referral program.', 'https://www.sweptworks.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cleaning', 'cleaning-labor-diy', 'DIY: Labor Cost Per Sqft Tracking', 'FREE', 'DIY', 'Track by building. Bid accurately. Target <50% labor.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CLOTHING-BOUTIQUE (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'lightspeed-retail', 'Lightspeed Retail', 'AFFILIATE', 'POS', 'Boutique POS + e-commerce. Partner program.', 'https://www.lightspeedhq.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('clothing-boutique', 'sell-through-diy', 'DIY: Sell-Through Rate Optimization', 'FREE', 'DIY', 'Track by style. Mark down at 60 days. Consign at 90.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ COLLECTIONS-AGENCY (8 affiliate, 3 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('collections-agency', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ COMPUTER-REPAIR (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'repairshopr', 'RepairShopr', 'AFFILIATE', 'Repair CRM', 'Repair shop management. Partner program.', 'https://www.repairshopr.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('computer-repair', 'repair-pricing-diy', 'DIY: Flat-Rate Pricing Implementation', 'FREE', 'DIY', 'Move from hourly to flat-rate. Increases revenue per job 20-30%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CONSTRUCTION (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('construction', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CONSULTING (7 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('consulting', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CONVENIENCE-STORE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('convenience-store', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ COURIER-DELIVERY (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'onfleet', 'Onfleet', 'AFFILIATE', 'Delivery', 'Last-mile delivery management. Partner program.', 'https://onfleet.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('courier-delivery', 'route-optimization-diy', 'DIY: Route Optimization', 'FREE', 'DIY', 'Free tools: Google Maps multi-stop, Route4Me free tier.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ CYBERSECURITY (9 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'crowdstrike', 'CrowdStrike', 'AFFILIATE', 'Security', 'Endpoint security. Partner program.', 'https://www.crowdstrike.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('cybersecurity', 'wazuh-free', 'Wazuh (Free)', 'FREE', 'Security', 'Open-source SIEM/XDR. Enterprise-grade.', 'https://wazuh.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DANCE-STUDIO (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'jackrabbit', 'Jackrabbit Technologies', 'AFFILIATE', 'Class Mgmt', 'Class management software. Partner program.', 'https://www.jackrabbittech.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dance-studio', 'student-retention-diy', 'DIY: Student/Family Retention System', 'FREE', 'DIY', 'Progress tracking, parent communication, events. Target 75%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DATA-ANALYTICS (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('data-analytics', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DAYCARE (9 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'jackrabbit', 'Jackrabbit Technologies', 'AFFILIATE', 'Class Mgmt', 'Class management software. Partner program.', 'https://www.jackrabbittech.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'student-retention-diy', 'DIY: Student/Family Retention System', 'FREE', 'DIY', 'Progress tracking, parent communication, events. Target 75%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'brightwheel', 'Brightwheel', 'AFFILIATE', 'Childcare', 'Childcare management app. Referral program.', 'https://mybrightwheel.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'procare', 'Procare Solutions', 'AFFILIATE', 'Childcare', 'Childcare management. Partner program.', 'https://www.procaresoftware.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('daycare', 'occupancy-diy', 'DIY: Occupancy Rate Optimization', 'FREE', 'DIY', 'Waitlist management. Flexible scheduling. Subsidy enrollment.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DEMOLITION (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('demolition', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DENTAL (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'dentrix', 'Dentrix', 'AFFILIATE', 'Dental PM', 'Dental practice management. Partner program.', 'https://www.dentrix.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dental', 'hygiene-production-diy', 'DIY: Hygiene Production Per Hour Tracking', 'FREE', 'DIY', 'Target $250+/hr. Add periodontal, sealants, whitening.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DRIVING-SCHOOL (6 affiliate, 3 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('driving-school', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ DRY-CLEANING (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'cents', 'Cents', 'AFFILIATE', 'Laundry', 'Laundry management platform. Partner program.', 'https://www.centslaundry.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('dry-cleaning', 'machine-revenue-diy', 'DIY: Revenue Per Machine Tracking', 'FREE', 'DIY', 'Track by machine. Replace underperformers. Vend price optimization.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ECOMMERCE (11 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'shopify', 'Shopify', 'AFFILIATE', 'E-commerce', 'E-commerce platform. Up to $150/sale.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'bigcommerce', 'BigCommerce', 'AFFILIATE', 'E-commerce', 'E-commerce. 200% first month or $1500 enterprise.', 'https://www.bigcommerce.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'woocommerce', 'WooCommerce (Free)', 'FREE', 'E-commerce', 'Free WordPress e-commerce. Thousands of extensions.', 'https://woocommerce.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'cart-abandonment-diy', 'DIY: Cart Abandonment Email Sequence', 'FREE', 'DIY', '3-email sequence recovers 5-15% of abandoned carts.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ecommerce', 'klaviyo', 'Klaviyo', 'AFFILIATE', 'Email', 'E-commerce email/SMS. 15% recurring.', 'https://www.klaviyo.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ELECTRICAL (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('electrical', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ENGINEERING (8 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'bqe-core', 'BQE CORE', 'AFFILIATE', 'AEC PM', 'Architecture/engineering PM. Partner program.', 'https://www.bqe.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('engineering', 'multiplier-diy', 'DIY: Revenue Multiplier Optimization', 'FREE', 'DIY', 'Target 2.5-3x multiplier on direct labor. Track weekly.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ENVIRONMENTAL-CONSULTING (7 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('environmental-consulting', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ESCAPE-ROOM (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'centeredge', 'CenterEdge', 'AFFILIATE', 'Recreation', 'Attraction management & POS. Partner program.', 'https://centeredge.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('escape-room', 'revenue-per-visit-diy', 'DIY: Revenue Per Visit Optimization', 'FREE', 'DIY', 'F&B upsell, party packages, membership tiers, event nights.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ EVENT-PLANNING (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'honeybook-event', 'HoneyBook', 'AFFILIATE', 'CRM', 'Client management. Referral program.', 'https://www.honeybook.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('event-planning', 'vendor-markup-diy', 'DIY: Vendor Markup Strategy', 'FREE', 'DIY', '15-20% markup standard. Transparent or bundled pricing.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FARMING (9 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'bushel', 'Bushel Farm', 'AFFILIATE', 'Farm Management', 'Farm management & grain marketing. Partner program.', 'https://bushel.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'granular-free', 'Granular (Free Tier)', 'FREE', 'Farm Management', 'Basic farm management. Field mapping, records. Free tier.', 'https://granular.ag')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'farmbrite', 'Farmbrite', 'AFFILIATE', 'Farm Management', 'Farm/ranch management software. Referral program.', 'https://www.farmbrite.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'sred-agriculture', 'SR&ED / R&D Tax Credits for Ag Innovation', 'FREE', 'Government', 'Farm innovations qualify for R&D credits in CA/US/UK/AU.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'farm-subsidy-diy', 'DIY: Government Farm Subsidy Application', 'FREE', 'Government', 'USDA FSA programs, Canadian AgriStability, EU CAP payments.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('farming', 'croptracker', 'CropTracker', 'AFFILIATE', 'Farm Management', 'Crop management, food safety, inventory. Referral program.', 'https://www.croptracker.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FAST-FOOD-FRANCHISE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fast-food-franchise', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FINANCIAL-ADVISOR (10 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'wealthbox', 'Wealthbox CRM', 'AFFILIATE', 'CRM', 'Financial advisor CRM. Partner program.', 'https://www.wealthbox.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'riskalyze', 'Riskalyze (Nitrogen)', 'AFFILIATE', 'FinTech', 'Risk assessment platform. Partner program.', 'https://www.nitrogenwealth.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('financial-advisor', 'client-retention-fa-diy', 'DIY: Client Retention Program', 'FREE', 'DIY', 'Quarterly reviews, birthday calls, tax-loss harvest check-ins.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FISHING (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'bushel', 'Bushel Farm', 'AFFILIATE', 'Farm Management', 'Farm management & grain marketing. Partner program.', 'https://bushel.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'granular-free', 'Granular (Free Tier)', 'FREE', 'Farm Management', 'Basic farm management. Field mapping, records. Free tier.', 'https://granular.ag')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'farmbrite', 'Farmbrite', 'AFFILIATE', 'Farm Management', 'Farm/ranch management software. Referral program.', 'https://www.farmbrite.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'sred-agriculture', 'SR&ED / R&D Tax Credits for Ag Innovation', 'FREE', 'Government', 'Farm innovations qualify for R&D credits in CA/US/UK/AU.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fishing', 'farm-subsidy-diy', 'DIY: Government Farm Subsidy Application', 'FREE', 'Government', 'USDA FSA programs, Canadian AgriStability, EU CAP payments.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FITNESS (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'mindbody', 'Mindbody', 'AFFILIATE', 'Fitness Mgmt', 'Fitness/wellness management. Partner program.', 'https://www.mindbodyonline.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'wodify', 'Wodify', 'AFFILIATE', 'Gym Mgmt', 'CrossFit/gym management. Referral program.', 'https://www.wodify.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'member-retention-diy', 'DIY: Member Retention System', 'FREE', 'DIY', '30-day check-in. Usage alerts. Community events. Target 70%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('fitness', 'class-fill-diy', 'DIY: Class Fill Rate Optimization', 'FREE', 'DIY', 'Waitlists, peak pricing, off-peak promos. Target 70%+ fill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FLORIST (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'floranext', 'FloraNext', 'AFFILIATE', 'Florist POS', 'Florist POS, website, delivery management. Referral.', 'https://www.floranext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('florist', 'spoilage-reduction-florist', 'DIY: Cooler Temperature & Rotation Optimization', 'FREE', 'DIY', 'Proper temps extend life 30-50%. Reduce spoilage below 15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FOOD-DELIVERY (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'onfleet', 'Onfleet', 'AFFILIATE', 'Delivery', 'Last-mile delivery management. Partner program.', 'https://onfleet.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-delivery', 'route-optimization-diy', 'DIY: Route Optimization', 'FREE', 'DIY', 'Free tools: Google Maps multi-stop, Route4Me free tier.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FOOD-PROCESSING (8 affiliate, 8 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'safefood360', 'SafeFood 360', 'AFFILIATE', 'Food Safety', 'Food safety management (HACCP/SQF). Referral program.', 'https://safefood360.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-processing', 'haccp-plan-diy', 'DIY: HACCP Plan Development', 'FREE', 'Compliance', 'FDA templates available free. Critical for compliance.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FOOD-TRUCK (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('food-truck', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FORESTRY-LOGGING (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'bushel', 'Bushel Farm', 'AFFILIATE', 'Farm Management', 'Farm management & grain marketing. Partner program.', 'https://bushel.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'granular-free', 'Granular (Free Tier)', 'FREE', 'Farm Management', 'Basic farm management. Field mapping, records. Free tier.', 'https://granular.ag')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'farmbrite', 'Farmbrite', 'AFFILIATE', 'Farm Management', 'Farm/ranch management software. Referral program.', 'https://www.farmbrite.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'sred-agriculture', 'SR&ED / R&D Tax Credits for Ag Innovation', 'FREE', 'Government', 'Farm innovations qualify for R&D credits in CA/US/UK/AU.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('forestry-logging', 'farm-subsidy-diy', 'DIY: Government Farm Subsidy Application', 'FREE', 'Government', 'USDA FSA programs, Canadian AgriStability, EU CAP payments.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FREELANCER-GIG (5 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'honeybook-freelance', 'HoneyBook', 'AFFILIATE', 'CRM', 'Client management. Referral program.', 'https://www.honeybook.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'and-co-free', 'AND.CO (Free by Fiverr)', 'FREE', 'Invoicing', 'Free invoicing, proposals, time tracking for freelancers.', 'https://www.and.co')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freelancer-gig', 'rate-optimization-diy', 'DIY: Freelancer Rate Setting Framework', 'FREE', 'DIY', 'Cost-plus + market rate analysis. Annual rate increases.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FREIGHT-BROKER (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'tai-tms', 'Tai TMS', 'AFFILIATE', 'TMS', 'Transportation management system. Partner program.', 'https://www.taitms.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('freight-broker', 'broker-margin-diy', 'DIY: Margin Per Load Analysis', 'FREE', 'DIY', 'Track true cost per load. Target 15%+ margin minimum.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FUNERAL-HOME (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'passare', 'Passare', 'AFFILIATE', 'Funeral', 'Funeral home management. Referral program.', 'https://www.passare.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('funeral-home', 'prepaid-plan-diy', 'DIY: Preneed/Prepaid Plan Marketing', 'FREE', 'DIY', 'Community seminars. Direct mail to 55+. Partnership with estate planners.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ FURNITURE-STORE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('furniture-store', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ GOLF-COURSE (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'centeredge', 'CenterEdge', 'AFFILIATE', 'Recreation', 'Attraction management & POS. Partner program.', 'https://centeredge.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'revenue-per-visit-diy', 'DIY: Revenue Per Visit Optimization', 'FREE', 'DIY', 'F&B upsell, party packages, membership tiers, event nights.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'lightspeed-golf', 'Lightspeed Golf', 'AFFILIATE', 'Golf', 'Golf course management. Partner program.', 'https://www.lightspeedhq.com/golf')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('golf-course', 'tee-time-yield-diy', 'DIY: Tee Time Yield Management', 'FREE', 'DIY', 'Dynamic pricing by day/time. Early bird and twilight rates.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ GRAPHIC-DESIGN (8 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'canva-pro', 'Canva Pro', 'AFFILIATE', 'Design', 'Design platform. Affiliate commission.', 'https://www.canva.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('graphic-design', 'penpot-free', 'Penpot (Free)', 'FREE', 'Design', 'Open-source design platform. Figma alternative.', 'https://penpot.app')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ GREENHOUSE-NURSERY (9 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'bushel', 'Bushel Farm', 'AFFILIATE', 'Farm Management', 'Farm management & grain marketing. Partner program.', 'https://bushel.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'granular-free', 'Granular (Free Tier)', 'FREE', 'Farm Management', 'Basic farm management. Field mapping, records. Free tier.', 'https://granular.ag')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'farmbrite', 'Farmbrite', 'AFFILIATE', 'Farm Management', 'Farm/ranch management software. Referral program.', 'https://www.farmbrite.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'sred-agriculture', 'SR&ED / R&D Tax Credits for Ag Innovation', 'FREE', 'Government', 'Farm innovations qualify for R&D credits in CA/US/UK/AU.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'farm-subsidy-diy', 'DIY: Government Farm Subsidy Application', 'FREE', 'Government', 'USDA FSA programs, Canadian AgriStability, EU CAP payments.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('greenhouse-nursery', 'croptracker', 'CropTracker', 'AFFILIATE', 'Farm Management', 'Crop management, food safety, inventory. Referral program.', 'https://www.croptracker.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ GROCERY (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'it-retail', 'IT Retail', 'AFFILIATE', 'Grocery POS', 'Grocery POS with scale integration. Partner program.', 'https://itretail.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('grocery', 'grocery-spoilage-diy', 'DIY: Spoilage Reduction Program', 'FREE', 'DIY', 'FIFO enforcement, markdown schedules, donation partnerships.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ GYM-CROSSFIT (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'mindbody', 'Mindbody', 'AFFILIATE', 'Fitness Mgmt', 'Fitness/wellness management. Partner program.', 'https://www.mindbodyonline.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'wodify', 'Wodify', 'AFFILIATE', 'Gym Mgmt', 'CrossFit/gym management. Referral program.', 'https://www.wodify.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'member-retention-diy', 'DIY: Member Retention System', 'FREE', 'DIY', '30-day check-in. Usage alerts. Community events. Target 70%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('gym-crossfit', 'class-fill-diy', 'DIY: Class Fill Rate Optimization', 'FREE', 'DIY', 'Waitlists, peak pricing, off-peak promos. Target 70%+ fill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HARDWARE-STORE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hardware-store', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HEALTHCARE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('healthcare', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HOME-CARE (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'alayacare', 'AlayaCare', 'AFFILIATE', 'Home Care', 'Home care management platform. Partner program.', 'https://www.alayacare.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-care', 'caregiver-retention-diy', 'DIY: Caregiver Retention Program', 'FREE', 'DIY', 'Recognition, flexible scheduling, career ladders. Target <60% turnover.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HOME-INSPECTION (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'spectora', 'Spectora', 'AFFILIATE', 'Inspection', 'Home inspection software. Referral program.', 'https://www.spectora.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-inspection', 'inspections-per-day-diy', 'DIY: Increase Inspections Per Day', 'FREE', 'DIY', 'Route optimization. Template reports. Same-day delivery.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HOME-STAGING (6 affiliate, 3 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('home-staging', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HOTEL-MOTEL (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'cloudbeds', 'Cloudbeds', 'AFFILIATE', 'Hotel PMS', 'Hotel management platform. Partner program.', 'https://www.cloudbeds.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'qloapps-free', 'QloApps (Free)', 'FREE', 'Hotel PMS', 'Open-source hotel management. PMS, booking engine, website.', 'https://qloapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'little-hotelier', 'Little Hotelier', 'AFFILIATE', 'Hotel PMS', 'Small property management. Partner program.', 'https://www.littlehotelier.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hotel-motel', 'revpar-diy', 'DIY: RevPAR Optimization', 'FREE', 'DIY', 'Dynamic pricing by day/season. OTA vs direct booking strategy.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HR-CONSULTING (7 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hr-consulting', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ HVAC (11 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'successware', 'Successware', 'AFFILIATE', 'HVAC', 'HVAC business management. Partner program.', 'https://successware.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('hvac', 'hvac-maintenance-diy', 'DIY: Maintenance Agreement Program', 'FREE', 'DIY', 'Build recurring revenue. $15-25/mo per customer. 70%+ margins.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ IMPORT-EXPORT (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'tradegecko', 'TradeGecko/QuickBooks Commerce', 'AFFILIATE', 'Inventory', 'Wholesale inventory management. Part of Intuit.', 'https://www.tradegecko.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'odoo-inventory', 'Odoo Inventory (Free)', 'FREE', 'Inventory', 'Free inventory, purchasing, multi-warehouse.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'customs-duty-diy', 'DIY: Customs Duty Classification Review', 'FREE', 'DIY', 'Review HTS codes. Misclassification = overpayment.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'flexport', 'Flexport', 'AFFILIATE', 'Logistics', 'Freight forwarding platform. Partner program.', 'https://www.flexport.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('import-export', 'canexport', 'CanExport (Canada) / STEP (US)', 'FREE', 'Government', 'Government export market development grants.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ INFLUENCER-CREATOR (7 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'honeybook-freelance', 'HoneyBook', 'AFFILIATE', 'CRM', 'Client management. Referral program.', 'https://www.honeybook.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'and-co-free', 'AND.CO (Free by Fiverr)', 'FREE', 'Invoicing', 'Free invoicing, proposals, time tracking for freelancers.', 'https://www.and.co')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'rate-optimization-diy', 'DIY: Freelancer Rate Setting Framework', 'FREE', 'DIY', 'Cost-plus + market rate analysis. Annual rate increases.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'stan-store', 'Stan Store', 'AFFILIATE', 'Creator', 'Creator storefront. 20% recurring.', 'https://stanstore.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'patreon', 'Patreon', 'AFFILIATE', 'Creator', 'Membership platform. Creator referral program.', 'https://www.patreon.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('influencer-creator', 'revenue-per-post-diy', 'DIY: Rate Card Development', 'FREE', 'DIY', 'CPM benchmarks by platform. Media kit. Negotiate up.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ INSURANCE-BROKER (9 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'hawksoft', 'HawkSoft', 'AFFILIATE', 'Insurance AMS', 'Insurance agency management. Referral program.', 'https://www.hawksoft.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('insurance-broker', 'renewal-rate-diy', 'DIY: Renewal Rate Improvement', 'FREE', 'DIY', '90-day pre-renewal outreach. Review + re-shop cycle.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ INTERIOR-DESIGN (7 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('interior-design', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ IT-SERVICES (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'connectwise', 'ConnectWise', 'AFFILIATE', 'MSP', 'MSP platform. Partner program.', 'https://www.connectwise.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'datto', 'Datto', 'AFFILIATE', 'MSP Backup', 'Backup and MSP tools. Partner program.', 'https://www.datto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'zabbix-free', 'Zabbix (Free)', 'FREE', 'Monitoring', 'Open-source monitoring. Enterprise-grade.', 'https://www.zabbix.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('it-services', 'msp-tool-stack-diy', 'DIY: Tool Stack Cost Audit', 'FREE', 'DIY', 'Audit all tools vs MRR. Keep stack below 15% of revenue.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ JANITORIAL-COMMERCIAL (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'swept', 'Swept', 'AFFILIATE', 'Cleaning', 'Janitorial management software. Referral program.', 'https://www.sweptworks.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('janitorial-commercial', 'cleaning-labor-diy', 'DIY: Labor Cost Per Sqft Tracking', 'FREE', 'DIY', 'Track by building. Bid accurately. Target <50% labor.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ JEWELRY-STORE (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'the-edge', 'The Edge by GemFind', 'AFFILIATE', 'Jewelry POS', 'Jewelry store management. Partner program.', 'https://www.gemfind.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('jewelry-store', 'jewelry-insurance-diy', 'DIY: Jewelry Insurance Optimization', 'FREE', 'DIY', 'Review per-item vs blanket coverage. Save 20-30%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ LANDSCAPING (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'lmn', 'LMN', 'AFFILIATE', 'Landscaping', 'Landscape business management. Referral program.', 'https://golmn.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('landscaping', 'seasonal-revenue-diy', 'DIY: Seasonal Revenue Bridging', 'FREE', 'DIY', 'Snow removal, holiday lights, maintenance contracts.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ LAUNDROMAT (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'cents', 'Cents', 'AFFILIATE', 'Laundry', 'Laundry management platform. Partner program.', 'https://www.centslaundry.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('laundromat', 'machine-revenue-diy', 'DIY: Revenue Per Machine Tracking', 'FREE', 'DIY', 'Track by machine. Replace underperformers. Vend price optimization.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ LAW-FIRM (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'clio', 'Clio', 'AFFILIATE', 'Legal PM', 'Legal practice management. $200/referral.', 'https://www.clio.com/partnerships/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'pandadoc', 'PandaDoc', 'AFFILIATE', 'Documents', 'Document automation. 25% recurring.', 'https://www.pandadoc.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('law-firm', 'realization-rate-diy', 'DIY: Realization Rate Improvement', 'FREE', 'DIY', 'Track billing vs worked. Reduce write-offs. Target 85%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ LIQUOR-STORE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('liquor-store', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ LOCKSMITH (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'repairshopr', 'RepairShopr', 'AFFILIATE', 'Repair CRM', 'Repair shop management. Partner program.', 'https://www.repairshopr.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('locksmith', 'repair-pricing-diy', 'DIY: Flat-Rate Pricing Implementation', 'FREE', 'DIY', 'Move from hourly to flat-rate. Increases revenue per job 20-30%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MANAGED-SERVICE-PROVIDER (10 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'connectwise', 'ConnectWise', 'AFFILIATE', 'MSP', 'MSP platform. Partner program.', 'https://www.connectwise.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'datto', 'Datto', 'AFFILIATE', 'MSP Backup', 'Backup and MSP tools. Partner program.', 'https://www.datto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'zabbix-free', 'Zabbix (Free)', 'FREE', 'Monitoring', 'Open-source monitoring. Enterprise-grade.', 'https://www.zabbix.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('managed-service-provider', 'msp-tool-stack-diy', 'DIY: Tool Stack Cost Audit', 'FREE', 'DIY', 'Audit all tools vs MRR. Keep stack below 15% of revenue.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MANUFACTURING (7 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('manufacturing', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MARKETING-CONSULTANT (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'semrush', 'Semrush', 'AFFILIATE', 'SEO', 'SEO toolkit. $200-350/sale.', 'https://www.semrush.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'ahrefs', 'Ahrefs', 'AFFILIATE', 'SEO', 'SEO tools. 20% revenue share.', 'https://ahrefs.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('marketing-consultant', 'client-retention-agency-diy', 'DIY: Client Retention Framework', 'FREE', 'DIY', 'Monthly reporting cadence. QBRs. Strategic roadmaps.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MARTIAL-ARTS (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'mindbody', 'Mindbody', 'AFFILIATE', 'Fitness Mgmt', 'Fitness/wellness management. Partner program.', 'https://www.mindbodyonline.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'wodify', 'Wodify', 'AFFILIATE', 'Gym Mgmt', 'CrossFit/gym management. Referral program.', 'https://www.wodify.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'member-retention-diy', 'DIY: Member Retention System', 'FREE', 'DIY', '30-day check-in. Usage alerts. Community events. Target 70%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('martial-arts', 'class-fill-diy', 'DIY: Class Fill Rate Optimization', 'FREE', 'DIY', 'Waitlists, peak pricing, off-peak promos. Target 70%+ fill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MASSAGE-THERAPY (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('massage-therapy', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MEDIA-PRODUCTION (9 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'frame-io', 'Frame.io', 'AFFILIATE', 'Video', 'Video review platform. Partner program.', 'https://frame.io/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('media-production', 'davinci-resolve', 'DaVinci Resolve (Free)', 'FREE', 'Video', 'Professional video editing. Free version is powerful.', 'https://www.blackmagicdesign.com/products/davinciresolve')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MEDICAL-LAB (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-lab', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MEDICAL-SPA (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'aestheticspro', 'AestheticsPro', 'AFFILIATE', 'Med Spa', 'Med spa management. Referral program.', 'https://aestheticspro.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('medical-spa', 'rebooking-diy', 'DIY: Rebooking Rate System', 'FREE', 'DIY', 'Book next appointment before leaving. Membership programs.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MENTAL-HEALTH (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'therapy-notes', 'TherapyNotes', 'AFFILIATE', 'Mental Health PM', 'Mental health practice management. Referral program.', 'https://www.therapynotes.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mental-health', 'session-fill-diy', 'DIY: Session Fill Rate Optimization', 'FREE', 'DIY', 'Online booking, waitlist, group sessions, telehealth hours.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ METAL-FABRICATION (7 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('metal-fabrication', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MINING (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'sap-mining', 'SAP Mining Solutions', 'AFFILIATE', 'ERP', 'Enterprise mining/O&G ERP. Partner program.', 'https://www.sap.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mining', 'mining-diy-safety', 'DIY: Safety Incident Cost Prevention', 'FREE', 'Safety', 'OSHA VPP programs. Safety audits reduce incidents 40-60%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MORTGAGE-BROKER (9 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'encompass', 'Encompass (ICE)', 'AFFILIATE', 'Mortgage', 'Mortgage origination. Partner program.', 'https://www.icemortgagetechnology.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('mortgage-broker', 'close-rate-diy', 'DIY: Close Rate Improvement', 'FREE', 'DIY', 'Speed to respond. Pre-qualification process. CRM follow-up.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MOVING-COMPANY (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'smartmoving', 'SmartMoving', 'AFFILIATE', 'Moving CRM', 'Moving company CRM. Partner program.', 'https://www.smartmoving.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('moving-company', 'damage-claim-diy', 'DIY: Damage Claim Prevention', 'FREE', 'DIY', 'Padding standards, inventory photos, valuation coverage.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ MUSIC-SCHOOL (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'jackrabbit', 'Jackrabbit Technologies', 'AFFILIATE', 'Class Mgmt', 'Class management software. Partner program.', 'https://www.jackrabbittech.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('music-school', 'student-retention-diy', 'DIY: Student/Family Retention System', 'FREE', 'DIY', 'Progress tracking, parent communication, events. Target 75%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ NAIL-SALON (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'vagaro', 'Vagaro', 'AFFILIATE', 'Booking', 'Salon/spa booking. $100/referral.', 'https://www.vagaro.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'fresha', 'Fresha (Free)', 'FREE', 'Booking', 'Free salon booking. No subscription fees.', 'https://www.fresha.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nail-salon', 'retail-attach-diy', 'DIY: Retail Product Sales Training', 'FREE', 'DIY', 'Target 10%+ of revenue from retail. Commission incentives.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ NONPROFIT (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'bloomerang', 'Bloomerang', 'AFFILIATE', 'Nonprofit CRM', 'Donor management. Partner program.', 'https://bloomerang.co/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'little-green-light', 'Little Green Light', 'AFFILIATE', 'Nonprofit CRM', 'Donor management. Referral program.', 'https://www.littlegreenlight.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'civicrm-free', 'CiviCRM (Free)', 'FREE', 'CRM', 'Open-source nonprofit CRM. Fundraising, memberships.', 'https://civicrm.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('nonprofit', 'donor-retention-diy', 'DIY: Donor Retention Program', 'FREE', 'DIY', 'Thank within 48hrs. Impact reports. Recurring giving push.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ OIL-GAS (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'sap-mining', 'SAP Mining Solutions', 'AFFILIATE', 'ERP', 'Enterprise mining/O&G ERP. Partner program.', 'https://www.sap.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('oil-gas', 'mining-diy-safety', 'DIY: Safety Incident Cost Prevention', 'FREE', 'Safety', 'OSHA VPP programs. Safety audits reduce incidents 40-60%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ OPTOMETRY (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('optometry', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PAINTING (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('painting', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PEST-CONTROL (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'pestroutes', 'PestRoutes', 'AFFILIATE', 'Pest Control', 'Pest control management. Partner program.', 'https://pestroutes.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pest-control', 'route-density-diy', 'DIY: Route Density Maximization', 'FREE', 'DIY', 'Cluster customers geographically. 8+ stops per route per day.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PET-STORE (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pet-store', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PHARMACY (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('pharmacy', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PHONE-REPAIR (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'repairshopr', 'RepairShopr', 'AFFILIATE', 'Repair CRM', 'Repair shop management. Partner program.', 'https://www.repairshopr.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('phone-repair', 'repair-pricing-diy', 'DIY: Flat-Rate Pricing Implementation', 'FREE', 'DIY', 'Move from hourly to flat-rate. Increases revenue per job 20-30%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PHOTOGRAPHY (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'honeybook', 'HoneyBook', 'AFFILIATE', 'CRM', 'Client management for creatives. Referral program.', 'https://www.honeybook.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'pixieset', 'Pixieset', 'AFFILIATE', 'Photography', 'Photo gallery and store. Referral program.', 'https://pixieset.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('photography', 'photo-pricing-diy', 'DIY: Photography Pricing Strategy', 'FREE', 'DIY', 'Cost-plus minimum + packages. Print markup 3-5x. Album upsell.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PHYSIOTHERAPY (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('physiotherapy', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PLASTICS-RUBBER (7 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plastics-rubber', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PLUMBING (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('plumbing', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PRINTING (7 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('printing', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PRIVATE-SCHOOL (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'jackrabbit', 'Jackrabbit Technologies', 'AFFILIATE', 'Class Mgmt', 'Class management software. Partner program.', 'https://www.jackrabbittech.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('private-school', 'student-retention-diy', 'DIY: Student/Family Retention System', 'FREE', 'DIY', 'Progress tracking, parent communication, events. Target 75%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PROPERTY-MANAGEMENT (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'buildium', 'Buildium', 'AFFILIATE', 'PM Software', 'Property management. Partner program.', 'https://www.buildium.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'appfolio', 'AppFolio', 'AFFILIATE', 'PM Software', 'Property management. Referral program.', 'https://www.appfolio.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('property-management', 'vacancy-reduction-diy', 'DIY: Vacancy Reduction Strategy', 'FREE', 'DIY', '30-day pre-notice marketing. Renewal incentives. Virtual tours.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ PUBLISHING (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('publishing', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ RANCHING (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'bushel', 'Bushel Farm', 'AFFILIATE', 'Farm Management', 'Farm management & grain marketing. Partner program.', 'https://bushel.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'granular-free', 'Granular (Free Tier)', 'FREE', 'Farm Management', 'Basic farm management. Field mapping, records. Free tier.', 'https://granular.ag')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'farmbrite', 'Farmbrite', 'AFFILIATE', 'Farm Management', 'Farm/ranch management software. Referral program.', 'https://www.farmbrite.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'sred-agriculture', 'SR&ED / R&D Tax Credits for Ag Innovation', 'FREE', 'Government', 'Farm innovations qualify for R&D credits in CA/US/UK/AU.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'farm-subsidy-diy', 'DIY: Government Farm Subsidy Application', 'FREE', 'Government', 'USDA FSA programs, Canadian AgriStability, EU CAP payments.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'cattlemax', 'CattleMax', 'AFFILIATE', 'Livestock', 'Cattle management software. Referral bonus.', 'https://cattlemax.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('ranching', 'ranch-diy', 'DIY: Feed Cost Per Head Optimization', 'FREE', 'DIY', 'Track feed conversion ratios. Bulk buying. Rotational grazing.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ REAL-ESTATE (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'follow-up-boss', 'Follow Up Boss', 'AFFILIATE', 'CRM', 'Real estate CRM. 20% for 12mo.', 'https://www.followupboss.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'kvcore', 'kvCORE', 'AFFILIATE', 'Platform', 'Real estate platform. Referral program.', 'https://www.insiderealestate.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('real-estate', 'lead-conversion-diy', 'DIY: Lead Response Time Optimization', 'FREE', 'DIY', '5-minute response = 21x conversion. Automate first touch.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ RESTAURANT (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'toast-pos', 'Toast POS', 'AFFILIATE', 'Restaurant POS', 'Restaurant POS. $250/referral.', 'https://pos.toasttab.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', '7shifts', '7shifts', 'AFFILIATE', 'Scheduling', 'Restaurant scheduling. $50/referral.', 'https://www.7shifts.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'loyverse-restaurant', 'Loyverse POS (Free)', 'FREE', 'POS', 'Free POS for restaurants. Kitchen display. Inventory.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'food-cost-diy', 'DIY: Weekly Food Cost Tracking', 'FREE', 'DIY', 'Track COGS weekly. Target 28-33%. Waste log. Portion control.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('restaurant', 'menu-engineering-diy', 'DIY: Menu Engineering', 'FREE', 'DIY', 'Stars/plowhorses/puzzles/dogs matrix. Boost avg check 8-15%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ RETAIL (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('retail', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ ROOFING (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('roofing', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SAAS (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'stripe', 'Stripe', 'AFFILIATE', 'Payments', 'Payment processing. $100 referral bonus.', 'https://stripe.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'profitwell', 'ProfitWell/Paddle (Free)', 'FREE', 'Analytics', 'Free subscription analytics. Track MRR, churn, LTV.', 'https://www.paddle.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('saas', 'churn-prevention-diy', 'DIY: Customer Success / Churn Prevention', 'FREE', 'DIY', '30/60/90 day check-ins. Usage-based health scoring.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SECURITY-GUARD (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'trackforce-valiant', 'TrackForce Valiant', 'AFFILIATE', 'Security', 'Security workforce management. Partner program.', 'https://www.trackforcevaliant.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('security-guard', 'bill-rate-diy', 'DIY: Bill Rate Optimization', 'FREE', 'DIY', 'Target 1.5x+ pay rate markup. Add value-adds to justify.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SENIOR-CARE (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'alayacare', 'AlayaCare', 'AFFILIATE', 'Home Care', 'Home care management platform. Partner program.', 'https://www.alayacare.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('senior-care', 'caregiver-retention-diy', 'DIY: Caregiver Retention Program', 'FREE', 'DIY', 'Recognition, flexible scheduling, career ladders. Target <60% turnover.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SOLAR-ENERGY (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'aurora-solar', 'Aurora Solar', 'AFFILIATE', 'Solar', 'Solar design and sales platform. Partner program.', 'https://aurorasolar.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'enphase', 'Enphase Energy', 'AFFILIATE', 'Solar', 'Microinverters + monitoring. Installer partner program.', 'https://enphase.com/installers')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('solar-energy', 'solar-diy-monitoring', 'DIY: Panel Performance Monitoring', 'FREE', 'DIY', 'Free monitoring dashboards. Track degradation vs expected.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SPA (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'vagaro', 'Vagaro', 'AFFILIATE', 'Booking', 'Salon/spa booking. $100/referral.', 'https://www.vagaro.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'fresha', 'Fresha (Free)', 'FREE', 'Booking', 'Free salon booking. No subscription fees.', 'https://www.fresha.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('spa', 'retail-attach-diy', 'DIY: Retail Product Sales Training', 'FREE', 'DIY', 'Target 10%+ of revenue from retail. Commission incentives.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SPORTING-GOODS (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('sporting-goods', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ STAFFING-AGENCY (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'bullhorn', 'Bullhorn', 'AFFILIATE', 'Staffing CRM', 'Staffing CRM. Partner program.', 'https://www.bullhorn.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('staffing-agency', 'fill-rate-diy', 'DIY: Fill Rate Improvement', 'FREE', 'DIY', 'Candidate pipeline. Pre-screen database. Speed to submit.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SUBSCRIPTION-BOX (10 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'shopify', 'Shopify', 'AFFILIATE', 'E-commerce', 'E-commerce platform. Up to $150/sale.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'bigcommerce', 'BigCommerce', 'AFFILIATE', 'E-commerce', 'E-commerce. 200% first month or $1500 enterprise.', 'https://www.bigcommerce.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'woocommerce', 'WooCommerce (Free)', 'FREE', 'E-commerce', 'Free WordPress e-commerce. Thousands of extensions.', 'https://woocommerce.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'cart-abandonment-diy', 'DIY: Cart Abandonment Email Sequence', 'FREE', 'DIY', '3-email sequence recovers 5-15% of abandoned carts.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'klaviyo', 'Klaviyo', 'AFFILIATE', 'Email', 'E-commerce email/SMS. 15% recurring.', 'https://www.klaviyo.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'cratejoy', 'Cratejoy', 'AFFILIATE', 'Subscription', 'Subscription box marketplace. Partner program.', 'https://www.cratejoy.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'churn-reduction-sub-diy', 'DIY: Subscription Churn Reduction', 'FREE', 'DIY', 'Skip-a-month option. Customization. Loyalty rewards. Exit surveys.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('subscription-box', 'cogs-optimization-diy', 'DIY: COGS Per Box Optimization', 'FREE', 'DIY', 'Negotiate bulk. Optimize packaging. Target <40% of price.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ SURVEYING (8 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'bqe-core', 'BQE CORE', 'AFFILIATE', 'AEC PM', 'Architecture/engineering PM. Partner program.', 'https://www.bqe.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('surveying', 'multiplier-diy', 'DIY: Revenue Multiplier Optimization', 'FREE', 'DIY', 'Target 2.5-3x multiplier on direct labor. Track weekly.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TATTOO-PIERCING (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'vagaro', 'Vagaro', 'AFFILIATE', 'Booking', 'Salon/spa booking. $100/referral.', 'https://www.vagaro.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'fresha', 'Fresha (Free)', 'FREE', 'Booking', 'Free salon booking. No subscription fees.', 'https://www.fresha.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tattoo-piercing', 'retail-attach-diy', 'DIY: Retail Product Sales Training', 'FREE', 'DIY', 'Target 10%+ of revenue from retail. Commission incentives.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TAX-PREPARATION (9 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'xero', 'Xero', 'AFFILIATE', 'Accounting', 'Cloud accounting. $100-200/referral.', 'https://www.xero.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'zoho-books', 'Zoho Books', 'AFFILIATE', 'Accounting', 'Accounting. 15% recurring.', 'https://www.zoho.com/affiliate.html')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'taxdome', 'TaxDome', 'AFFILIATE', 'Tax PM', 'Tax practice management. 25% referral commission.', 'https://taxdome.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tax-preparation', 'returns-per-preparer-diy', 'DIY: Productivity Tracking Per Preparer', 'FREE', 'DIY', 'Target 200+ returns/season. Assembly-line workflow.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TAXI-RIDESHARE (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'taxicaller', 'TaxiCaller', 'AFFILIATE', 'Dispatch', 'Taxi dispatch software. Partner program.', 'https://www.taxicaller.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('taxi-rideshare', 'idle-time-diy', 'DIY: Idle Time Reduction Strategy', 'FREE', 'DIY', 'Demand heatmaps. Airport queuing optimization. Events calendar.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TELECOM (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('telecom', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TEXTILE-APPAREL (7 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('textile-apparel', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TIRE-SHOP (8 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'shopmonkey', 'ShopMonkey', 'AFFILIATE', 'Auto Repair', 'Auto repair management. Partner program.', 'https://www.shopmonkey.io')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'mitchell1', 'Mitchell 1', 'AFFILIATE', 'Auto Repair', 'Auto repair software + info. Partner program.', 'https://mitchell1.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tire-shop', 'labor-rate-diy', 'DIY: Effective Labor Rate Optimization', 'FREE', 'DIY', 'Target $100+/hr. Track by tech. Reduce comebacks.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TOWING (7 affiliate, 3 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('towing', 'towbook', 'TowBook', 'AFFILIATE', 'Towing', 'Towing dispatch and management. Referral program.', 'https://www.towbook.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TRADES (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'jobber', 'Jobber', 'AFFILIATE', 'Field Service', 'Field service management. 20% for 12mo.', 'https://getjobber.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'housecall-pro', 'Housecall Pro', 'AFFILIATE', 'Field Service', 'Home service management. 30% recurring.', 'https://www.housecallpro.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'servicetitan', 'ServiceTitan', 'AFFILIATE', 'Field Service', 'Home services platform. $300/referral.', 'https://www.servicetitan.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'buildertrend', 'Buildertrend', 'AFFILIATE', 'Construction PM', 'Construction project mgmt. $200/referral.', 'https://buildertrend.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'openproject-bim', 'OpenProject (Free)', 'FREE', 'Project Management', 'Open-source project management with BIM support.', 'https://www.openproject.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'change-order-template', 'FREE: Change Order Template', 'FREE', 'Template', 'Prevent scope creep. Bill every change. Save $5K+/year.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trades', 'trades-markup-diy', 'DIY: Material Markup Optimization', 'FREE', 'DIY', 'Ensure 25-40% markup on all materials. Track in every estimate.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TRAINING-COACHING (9 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'jackrabbit', 'Jackrabbit Technologies', 'AFFILIATE', 'Class Mgmt', 'Class management software. Partner program.', 'https://www.jackrabbittech.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'student-retention-diy', 'DIY: Student/Family Retention System', 'FREE', 'DIY', 'Progress tracking, parent communication, events. Target 75%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'teachable', 'Teachable', 'AFFILIATE', 'E-learning', 'Online course platform. 30% recurring.', 'https://teachable.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'kajabi', 'Kajabi', 'AFFILIATE', 'E-learning', 'Course + membership platform. 30% recurring.', 'https://kajabi.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('training-coaching', 'moodle-free', 'Moodle (Free)', 'FREE', 'LMS', 'Open-source LMS. Create courses, quizzes, certificates.', 'https://moodle.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TRANSLATION (7 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'clockify-free', 'Clockify (Free)', 'FREE', 'Time Tracking', 'Free time tracking. Unlimited users. Track billable hours.', 'https://clockify.me')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'toggl', 'Toggl Track', 'AFFILIATE', 'Time Tracking', 'Time tracking. Referral program.', 'https://toggl.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'utilization-diy', 'DIY: Billable Utilization Tracking', 'FREE', 'DIY', 'Target 65%+ utilization. Track weekly. Coach underperformers.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('translation', 'value-pricing-diy', 'DIY: Value-Based Pricing Shift', 'FREE', 'DIY', 'Move from hourly to value/project pricing. 20-50% revenue lift.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TRUCKING (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'keeptruckin', 'Motive (KeepTruckin)', 'AFFILIATE', 'Fleet', 'Fleet management, ELD, dashcams. Partner program.', 'https://gomotive.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'samsara', 'Samsara', 'AFFILIATE', 'Fleet', 'Fleet tracking, ELD, safety. Partner program.', 'https://www.samsara.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'deadhead-reduction-diy', 'DIY: Deadhead Mile Reduction', 'FREE', 'DIY', 'Use load boards. Backhaul strategy. Target <15% empty.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('trucking', 'fuel-optimization-diy', 'DIY: Fuel Cost Per Mile Tracking', 'FREE', 'DIY', 'Track by driver, route, truck. IdleAir. Speed governors.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ TUTORING (6 affiliate, 3 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('tutoring', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ UPHOLSTERY (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'repairshopr', 'RepairShopr', 'AFFILIATE', 'Repair CRM', 'Repair shop management. Partner program.', 'https://www.repairshopr.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('upholstery', 'repair-pricing-diy', 'DIY: Flat-Rate Pricing Implementation', 'FREE', 'DIY', 'Move from hourly to flat-rate. Increases revenue per job 20-30%.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ VAPE-SMOKE-SHOP (8 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'shopify-pos', 'Shopify POS', 'AFFILIATE', 'POS', 'Retail POS + e-commerce. Up to $150/referral.', 'https://www.shopify.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'square-retail', 'Square for Retail', 'AFFILIATE', 'POS', 'Free POS + paid features. Referral program.', 'https://squareup.com/us/en/partnerships')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'loyverse-pos', 'Loyverse POS (Free)', 'FREE', 'POS', '100% free POS. Unlimited items and users.', 'https://loyverse.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'inventory-audit-diy', 'DIY: Weekly Inventory Count System', 'FREE', 'DIY', 'Cycle counting reduces shrinkage 40-60%. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('vape-smoke-shop', 'loss-prevention-diy', 'DIY: Loss Prevention Basics', 'FREE', 'DIY', 'Camera placement, POS audits, cash handling procedures.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ VETERINARY (9 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'openemr-free', 'OpenEMR (Free)', 'FREE', 'EHR', 'Open-source EHR. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'jane-app', 'Jane App', 'AFFILIATE', 'Practice Mgmt', 'Practice management. $75/referral.', 'https://jane.app/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'simplepractice', 'SimplePractice', 'AFFILIATE', 'Practice Mgmt', 'Practice management. 1 month free/referral.', 'https://www.simplepractice.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'no-show-diy', 'DIY: No-Show Reduction System', 'FREE', 'DIY', '48hr + 2hr reminders. Deposit policy. Waitlist backfill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'collection-rate-diy', 'DIY: Collection Rate Optimization', 'FREE', 'DIY', 'Verify insurance upfront. Collect copays at time of service.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'ezyvet', 'ezyVet', 'AFFILIATE', 'Vet PM', 'Veterinary practice management. Partner program.', 'https://www.ezyvet.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('veterinary', 'avg-transaction-diy', 'DIY: Average Transaction Value Increase', 'FREE', 'DIY', 'Wellness plans, dental bundles, preventive packages.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ WAREHOUSING (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'skuvault', 'SkuVault', 'AFFILIATE', 'WMS', 'Warehouse management system. Partner program.', 'https://www.skuvault.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'openboxes', 'OpenBoxes (Free)', 'FREE', 'WMS', 'Open-source supply chain/inventory management.', 'https://openboxes.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('warehousing', 'space-utilization-diy', 'DIY: Warehouse Space Utilization Audit', 'FREE', 'DIY', 'Vertical storage, slotting optimization, cross-docking.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ WASTE-MANAGEMENT (7 affiliate, 4 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'routeware', 'Routeware', 'AFFILIATE', 'Fleet', 'Route optimization for waste haulers. Partner program.', 'https://www.routeware.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('waste-management', 'waste-route-diy', 'DIY: Route Density Optimization', 'FREE', 'DIY', 'Map routes. Increase stops per route. Reduce deadhead.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ WEB-DEVELOPMENT (10 affiliate, 6 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'hubspot', 'HubSpot', 'AFFILIATE', 'CRM', 'CRM + marketing. 30% recurring commission.', 'https://www.hubspot.com/partners/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'twenty-crm', 'Twenty CRM (Free)', 'FREE', 'CRM', 'Open-source CRM. Self-hosted. Modern UI.', 'https://twenty.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'clickup', 'ClickUp', 'AFFILIATE', 'Project Management', 'Project management. 20% recurring.', 'https://clickup.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'plane-free', 'Plane (Free)', 'FREE', 'Project Management', 'Open-source project management. Jira alternative.', 'https://plane.so')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'cloudways', 'Cloudways', 'AFFILIATE', 'Hosting', 'Managed hosting. Up to $125/sale.', 'https://www.cloudways.com/en/affiliate.php')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'scope-creep-diy', 'DIY: Project Scope Document Template', 'FREE', 'Template', 'SOW template with change order process. Bill every change.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('web-development', 'github-copilot', 'GitHub Copilot', 'AFFILIATE', 'Dev Tools', 'AI coding assistant. Referral program.', 'https://github.com/features/copilot')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ WHOLESALE (7 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'tradegecko', 'TradeGecko/QuickBooks Commerce', 'AFFILIATE', 'Inventory', 'Wholesale inventory management. Part of Intuit.', 'https://www.tradegecko.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'odoo-inventory', 'Odoo Inventory (Free)', 'FREE', 'Inventory', 'Free inventory, purchasing, multi-warehouse.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('wholesale', 'customs-duty-diy', 'DIY: Customs Duty Classification Review', 'FREE', 'DIY', 'Review HTS codes. Misclassification = overpayment.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ WOODWORKING (7 affiliate, 7 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'erpnext', 'ERPNext (Free)', 'FREE', 'ERP', 'Open-source ERP. Manufacturing, inventory, MRP, quality.', 'https://erpnext.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'katana-mrp', 'Katana MRP', 'AFFILIATE', 'Manufacturing', 'Manufacturing ERP for SMBs. Partner program.', 'https://katanamrp.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'odoo-manufacturing', 'Odoo Community (Free)', 'FREE', 'ERP', 'Free ERP with manufacturing, MRP, quality modules.', 'https://www.odoo.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'scrap-reduction-diy', 'DIY: Scrap/Rework Rate Reduction', 'FREE', 'DIY', 'Track defect sources. 5 Whys analysis. Target 3% or less.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('woodworking', 'oee-tracking-diy', 'DIY: OEE Tracking (Overall Equipment Effectiveness)', 'FREE', 'DIY', 'Measure availability × performance × quality. Free spreadsheet.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();

-- ═══ YOGA-STUDIO (8 affiliate, 5 free) ═══
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'quickbooks', 'QuickBooks Online', 'AFFILIATE', 'Accounting', 'Accounting for all businesses. 30% commission.', 'https://quickbooks.intuit.com/affiliates')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'wave-accounting', 'Wave Accounting', 'FREE', 'Accounting', '100% free accounting, invoicing, receipts. No limits.', 'https://www.waveapps.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'freshbooks', 'FreshBooks', 'AFFILIATE', 'Accounting', 'Invoice & expense tracking. $200/referral.', 'https://www.freshbooks.com/affiliate-program')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'helcim', 'Helcim', 'AFFILIATE', 'Payments', 'Interchange-plus processing. 15% rev share.', 'https://www.helcim.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'interchange-plus-diy', 'DIY: Switch to Interchange-Plus Processing', 'FREE', 'Payments', 'Save 0.3-0.8% vs flat-rate. Compare Helcim, Stax, Payment Depot.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'next-insurance', 'NEXT Insurance', 'AFFILIATE', 'Insurance', 'Digital business insurance. $50/referral.', 'https://www.nextinsurance.com/referral')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'insurance-rate-shopping-diy', 'DIY: Annual Insurance Rate Shopping', 'FREE', 'Insurance', 'Get 3+ quotes annually. Save 15-25% on premiums.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'gusto', 'Gusto', 'AFFILIATE', 'Payroll', 'Full payroll + benefits. $300-$600/referral.', 'https://gusto.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'homebase', 'Homebase', 'AFFILIATE', 'Scheduling', 'Free scheduling + time tracking. Paid payroll.', 'https://joinhomebase.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'mindbody', 'Mindbody', 'AFFILIATE', 'Fitness Mgmt', 'Fitness/wellness management. Partner program.', 'https://www.mindbodyonline.com/partners')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'wodify', 'Wodify', 'AFFILIATE', 'Gym Mgmt', 'CrossFit/gym management. Referral program.', 'https://www.wodify.com')
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'member-retention-diy', 'DIY: Member Retention System', 'FREE', 'DIY', '30-day check-in. Usage alerts. Community events. Target 70%+.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();
INSERT INTO industry_solutions (industry_slug, product_slug, product_name, product_type, category, description, url)
VALUES ('yoga-studio', 'class-fill-diy', 'DIY: Class Fill Rate Optimization', 'FREE', 'DIY', 'Waitlists, peak pricing, off-peak promos. Target 70%+ fill.', NULL)
ON CONFLICT (industry_slug, product_slug) DO UPDATE SET product_name=EXCLUDED.product_name, description=EXCLUDED.description, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Total entries
SELECT 'TOTAL ENTRIES' AS metric, COUNT(*) AS value FROM industry_solutions;

-- By type
SELECT product_type, COUNT(*) FROM industry_solutions GROUP BY product_type;

-- Industries with solutions
SELECT 'INDUSTRIES COVERED' AS metric, COUNT(DISTINCT industry_slug) AS value FROM industry_solutions;

-- Top products (used across most industries)
SELECT product_slug, product_name, product_type, COUNT(DISTINCT industry_slug) AS industry_count
FROM industry_solutions 
GROUP BY product_slug, product_name, product_type 
ORDER BY industry_count DESC 
LIMIT 20;

-- Industries with least solutions (may need more)
SELECT industry_slug, COUNT(*) AS solutions
FROM industry_solutions 
GROUP BY industry_slug 
ORDER BY solutions ASC 
LIMIT 20;

-- Coverage check: industries in summary but not in solutions
-- (Run against your leak database to verify)
