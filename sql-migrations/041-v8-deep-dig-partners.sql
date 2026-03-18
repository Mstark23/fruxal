-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — DEEP DIG: MORE AFFILIATE PARTNERS (v8-deep-dig)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run AFTER v8-mega-new-partners.sql and v8-expansion-new-partners.sql
-- Adds 40 more partners — industry-specific + niche categories
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('lightspeed-restaurant', 'Lightspeed Restaurant', 'Restaurant POS and management. Partner referral program.', 'https://www.lightspeedhq.com/partners', 'Restaurant POS', 'flat', , 200, false, '{restaurant}', 'https://www.lightspeedhq.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('7shifts', '7shifts', 'Restaurant scheduling and team management. $50 per referral.', 'https://www.7shifts.com/partners', 'Restaurant HR', 'flat', , 50, false, '{restaurant}', 'https://www.7shifts.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('marketman', 'MarketMan', 'Restaurant inventory and food cost management. Partner program.', 'https://www.marketman.com/partners', 'Restaurant Inventory', 'flat', , 100, false, '{restaurant}', 'https://www.marketman.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('procore', 'Procore', 'Construction project management. Referral program with bonuses.', 'https://www.procore.com/referral', 'Construction PM', 'flat', , 500, false, '{construction}', 'https://www.procore.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('housecall-pro', 'Housecall Pro', 'Field service management. 30% recurring commission.', 'https://www.housecallpro.com/partners', 'Field Service', 'percentage', , 30, false, '{construction}', 'https://www.housecallpro.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('servicetitan', 'ServiceTitan', 'Home services management. Referral program for contractors.', 'https://www.servicetitan.com/partners', 'Field Service', 'flat', , 300, false, '{construction}', 'https://www.servicetitan.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('jane-app', 'Jane App', 'Practice management for health/wellness. Referral credits.', 'https://jane.app/referral', 'Healthcare PM', 'flat', , 75, false, '{healthcare}', 'https://jane.app', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('drchrono', 'DrChrono', 'EHR and practice management. Partner referral program.', 'https://www.drchrono.com/partner-program', 'Healthcare EHR', 'flat', , 200, false, '{healthcare}', 'https://www.drchrono.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('practice-better', 'Practice Better', 'Practice management for nutrition/wellness. 20% recurring commission.', 'https://www.practicebetter.io/affiliate', 'Healthcare PM', 'percentage', , 20, false, '{healthcare}', 'https://www.practicebetter.io', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('follow-up-boss', 'Follow Up Boss', 'Real estate CRM. 20% commission for 12 months.', 'https://www.followupboss.com/partners', 'Real Estate CRM', 'percentage', , 20, true, '{real-estate}', 'https://www.followupboss.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('kvcore', 'kvCORE', 'Real estate platform. Partner referral program.', 'https://www.insiderealestate.com/partners', 'Real Estate', 'flat', , 200, false, '{real-estate}', 'https://www.insiderealestate.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('gorgias', 'Gorgias', 'E-commerce helpdesk. 20% recurring commission.', 'https://www.gorgias.com/partners/affiliate', 'E-commerce Support', 'percentage', , 20, false, '{ecommerce}', 'https://www.gorgias.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('recharge', 'ReCharge', 'Subscription management for e-commerce. Partner program.', 'https://rechargepayments.com/partners', 'E-commerce', 'flat', , 100, false, '{ecommerce}', 'https://rechargepayments.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('privy', 'Privy', 'E-commerce email marketing. 20% recurring commission.', 'https://www.privy.com/partners', 'E-commerce Marketing', 'percentage', , 20, false, '{ecommerce}', 'https://www.privy.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('smile-io', 'Smile.io', 'Loyalty and rewards for e-commerce. 20% recurring commission.', 'https://smile.io/partners', 'E-commerce Loyalty', 'percentage', , 20, false, '{ecommerce}', 'https://smile.io', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('yotpo', 'Yotpo', 'E-commerce reviews, loyalty, SMS. Partner program.', 'https://www.yotpo.com/partners', 'E-commerce Reviews', 'flat', , 150, false, '{ecommerce}', 'https://www.yotpo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('leadpages', 'Leadpages', 'Landing pages and conversions. Up to 50% recurring commission.', 'https://www.leadpages.com/partners', 'Landing Pages', 'percentage', , 50, false, '{agency,ecommerce}', 'https://www.leadpages.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('clickfunnels', 'ClickFunnels', 'Sales funnels. 30% recurring commission. Up to 40% for top affiliates.', 'https://www.clickfunnels.com/affiliates', 'Sales Funnels', 'percentage', , 30, false, '{agency,ecommerce}', 'https://www.clickfunnels.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('unbounce', 'Unbounce', 'Landing page builder. 20% recurring commission.', 'https://unbounce.com/partner-program', 'Landing Pages', 'percentage', , 20, false, '{agency}', 'https://unbounce.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('demio', 'Demio', 'Webinar platform. 30% lifetime recurring commission.', 'https://demio.com/affiliate', 'Webinars', 'percentage', , 30, false, '{consulting}', 'https://demio.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('systeme-io', 'Systeme.io', 'All-in-one marketing platform. 60% lifetime recurring commission.', 'https://systeme.io/affiliate-program', 'Marketing Platform', 'percentage', , 60, false, '{}', 'https://systeme.io', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('waveapps', 'Wave Financial', 'Free accounting + paid payroll/payments. Referral bonuses.', 'https://www.waveapps.com/partners', 'Accounting', 'flat', , 50, false, '{}', 'https://www.waveapps.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('expensify', 'Expensify', 'Expense management. Referral program with monthly credits.', 'https://www.expensify.com/referral', 'Expense Management', 'flat', , 100, false, '{}', 'https://www.expensify.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('ramp', 'Ramp', 'Corporate card and expense management. $500 per qualified referral.', 'https://ramp.com/partners', 'Expense Management', 'flat', , 500, false, '{saas}', 'https://ramp.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('mercury', 'Mercury', 'Banking for startups. $500 per qualified referral.', 'https://mercury.com/partner', 'Banking', 'flat', , 500, false, '{saas}', 'https://mercury.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('relay-financial', 'Relay Financial', 'No-fee business banking. $100 per funded account.', 'https://relayfi.com/referral', 'Banking', 'flat', , 100, false, '{}', 'https://relayfi.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('zapier', 'Zapier', 'Workflow automation. Referral program.', 'https://zapier.com/platform/partner-program', 'Automation', 'percentage', , 20, true, '{}', 'https://zapier.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('make-integromat', 'Make (Integromat)', 'Visual automation platform. 20% recurring commission.', 'https://www.make.com/en/affiliate-program', 'Automation', 'percentage', , 20, false, '{agency,saas}', 'https://www.make.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('gusto-payroll', 'Gusto Payroll', 'Full-service payroll. $300-$600 per referral.', 'https://gusto.com/partners', 'Payroll', 'flat', , 500, false, '{}', 'https://gusto.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('comply-advantage', 'ComplyAdvantage', 'AML and fraud detection. Partner program.', 'https://complyadvantage.com/partners', 'Compliance', 'flat', , 200, false, '{saas}', 'https://complyadvantage.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('hostinger', 'Hostinger', 'Budget web hosting. Up to 60% commission.', 'https://www.hostinger.com/affiliates', 'Hosting', 'percentage', , 60, false, '{}', 'https://www.hostinger.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('a2-hosting', 'A2 Hosting', 'Fast web hosting. $55-$125 per sale.', 'https://www.a2hosting.com/affiliates', 'Hosting', 'flat', , 85, false, '{}', 'https://www.a2hosting.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('linode-akamai', 'Linode (Akamai)', 'Cloud computing. $100 per qualified referral.', 'https://www.linode.com/referral-program', 'Cloud Hosting', 'flat', , 100, false, '{saas}', 'https://www.linode.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('podia', 'Podia', 'Online course and digital product platform. 30% recurring commission.', 'https://www.podia.com/affiliates', 'E-learning', 'percentage', , 30, false, '{consulting}', 'https://www.podia.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('kajabi', 'Kajabi', 'Course and membership platform. 30% recurring commission.', 'https://kajabi.com/partners', 'E-learning', 'percentage', , 30, false, '{consulting}', 'https://kajabi.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('elementor', 'Elementor', 'WordPress page builder. 50% commission per sale.', 'https://elementor.com/affiliates', 'Website Builder', 'percentage', , 50, false, '{agency}', 'https://elementor.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('canva-pro', 'Canva Pro', 'Design platform. Affiliate program with commissions.', 'https://www.canva.com/affiliates', 'Design', 'flat', , 36, false, '{}', 'https://www.canva.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('tailwind-app', 'Tailwind', 'Pinterest and Instagram scheduling. 25% recurring commission.', 'https://www.tailwindapp.com/affiliates', 'Social Media', 'percentage', , 25, false, '{ecommerce}', 'https://www.tailwindapp.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('protonvpn', 'Proton VPN Business', 'Privacy-focused VPN and email. 20% recurring commission.', 'https://proton.me/partners', 'Privacy/Security', 'percentage', , 20, false, '{}', 'https://protonvpn.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('tunnelbear', 'TunnelBear Business', 'Simple VPN for teams. Partner program.', 'https://www.tunnelbear.com/partners', 'Security', 'flat', , 50, false, '{}', 'https://www.tunnelbear.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT '═══ DEEP DIG PARTNERS ═══' AS header;
SELECT category, COUNT(*) AS count FROM affiliate_partners WHERE active=true GROUP BY category ORDER BY count DESC;
SELECT 'TOTAL PARTNERS' AS metric, COUNT(*) AS value FROM affiliate_partners WHERE active=true;
