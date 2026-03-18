-- ═══════════════════════════════════════════════════════════════
-- BATCH 6 of 7: Partners + Free Alternatives (356 partners, 305 free)
-- ═══════════════════════════════════════════════════════════════

-- === 039-v8-mega-new-partners.sql ===
-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — NEW AFFILIATE PARTNERS (v8-mega expansion)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 47 new partners to add to existing 212-partner database
-- Categories: CRM, Email, Accounting, E-commerce, HR, Security, PM, Analytics,
--             Communication, Insurance, Cloud, Legal, AI
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('close-crm', 'Close', 'CRM built for inside sales teams. Built-in calling, email, SMS. 30% commission for 12 months.', 'https://close.com/partners', 'CRM', 'percentage', 30, 12, '{saas,consulting}', 'https://close.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('lemlist', 'Lemlist', 'Cold outreach platform. Multi-channel sequences. 25% recurring commission.', 'https://lemlist.com/affiliate', 'Sales Outreach', 'percentage', 25, 0, '{saas,agency}', 'https://lemlist.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('snov-io', 'Snov.io', 'B2B lead generation and outreach. 40% lifetime recurring commission.', 'https://snov.io/affiliate', 'Sales Outreach', 'percentage', 40, 0, '{saas,agency}', 'https://snov.io', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('engagebay', 'EngageBay', 'All-in-one CRM: marketing, sales, support. 20% recurring lifetime.', 'https://www.engagebay.com/affiliate', 'CRM', 'percentage', 20, 0, '{}', 'https://www.engagebay.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('salesflare', 'Salesflare', 'Automated CRM for small B2B. 20% recurring commission.', 'https://salesflare.com/affiliates', 'CRM', 'percentage', 20, 0, '{consulting,agency}', 'https://salesflare.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('activecampaign', 'ActiveCampaign', 'Email marketing and automation. $1,350 avg per referral. 20-30% recurring.', 'https://www.activecampaign.com/partner/affiliate', 'Email Marketing', 'percentage', 25, 0, '{}', 'https://www.activecampaign.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('convertkit', 'Kit (ConvertKit)', 'Creator email marketing. 30% recurring commission for 24 months.', 'https://kit.com/affiliates', 'Email Marketing', 'percentage', 30, 24, '{agency,consulting}', 'https://kit.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('omnisend', 'Omnisend', 'E-commerce email & SMS marketing. 20% recurring commission.', 'https://www.omnisend.com/affiliates', 'Email Marketing', 'percentage', 20, 0, '{ecommerce}', 'https://www.omnisend.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('brevo-paid', 'Brevo (Sendinblue)', 'Email marketing, SMS, chat. CPA model: €5+ per signup.', 'https://www.brevo.com/partners/affiliate', 'Email Marketing', 'flat', 5, 0, '{}', 'https://www.brevo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('mailmodo', 'Mailmodo', 'Interactive email marketing with AMP emails. 20% recurring commission.', 'https://www.mailmodo.com/affiliates', 'Email Marketing', 'percentage', 20, 0, '{saas,ecommerce}', 'https://www.mailmodo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('moosend', 'Moosend', 'Affordable email marketing. 30% lifetime recurring commission.', 'https://moosend.com/affiliates', 'Email Marketing', 'percentage', 30, 0, '{}', 'https://moosend.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('xero', 'Xero', 'Cloud accounting. Earn $100-200 per referral through partner program.', 'https://www.xero.com/partners', 'Accounting', 'flat', 150, 0, '{}', 'https://www.xero.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('bench', 'Bench Accounting', 'Done-for-you bookkeeping. $150 per qualified referral.', 'https://bench.co/referral', 'Bookkeeping', 'flat', 150, 0, '{consulting,agency}', 'https://bench.co', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('plooto', 'Plooto', 'AP/AR automation. $50 per referred account.', 'https://www.plooto.com/partners', 'Payments', 'flat', 50, 0, '{}', 'https://www.plooto.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('dext', 'Dext (Receipt Bank)', 'Receipt scanning and bookkeeping automation. Partner commissions vary.', 'https://dext.com/partners', 'Bookkeeping', 'percentage', 20, 0, '{accounting}', 'https://dext.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('float-cash', 'Float Cash Flow', 'Cash flow forecasting. 25% recurring commission.', 'https://floatapp.com/partners', 'Cash Flow', 'percentage', 25, 0, '{accounting,consulting}', 'https://floatapp.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('bigcommerce', 'BigCommerce', 'Enterprise e-commerce. 200% of first monthly payment or $1,500/enterprise.', 'https://www.bigcommerce.com/partners/affiliate', 'E-commerce', 'percentage', 200, 0, '{ecommerce}', 'https://www.bigcommerce.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('wix-affiliate', 'Wix', 'Website builder. $100 per premium sale.', 'https://www.wix.com/about/affiliates', 'Website Builder', 'flat', 100, 0, '{}', 'https://www.wix.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('helcim', 'Helcim', 'Interchange-plus payment processing. Revenue share on processing volume.', 'https://www.helcim.com/partners', 'Payment Processing', 'percentage', 15, 0, '{ecommerce,restaurant}', 'https://www.helcim.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('loox', 'Loox', 'Shopify product reviews with photos/videos. 20% recurring commission.', 'https://loox.io/affiliate', 'E-commerce', 'percentage', 20, 0, '{ecommerce}', 'https://loox.io', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('gusto', 'Gusto', 'Payroll, benefits, HR. $300-$600 per referral depending on plan.', 'https://gusto.com/partners', 'Payroll', 'flat', 400, 0, '{}', 'https://gusto.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('deel', 'Deel', 'Global payroll and hiring. Up to $500 per referral.', 'https://www.deel.com/partners/affiliate', 'Global Payroll', 'flat', 500, 0, '{saas}', 'https://www.deel.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('rippling', 'Rippling', 'Employee management platform. Commission structure varies by product.', 'https://www.rippling.com/partners', 'HR', 'flat', 300, 0, '{saas}', 'https://www.rippling.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('bamboohr', 'BambooHR', 'HR software for SMBs. Referral program available.', 'https://www.bamboohr.com/partners', 'HR', 'flat', 200, 0, '{}', 'https://www.bamboohr.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('nordlayer', 'NordLayer', 'Business VPN and network security. 30% recurring commission.', 'https://nordlayer.com/affiliates', 'Cybersecurity', 'percentage', 30, 0, '{saas}', 'https://nordlayer.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('1password-business', '1Password Business', 'Team password management. 25% commission for first year.', 'https://1password.com/affiliates', 'Security', 'percentage', 25, 12, '{}', 'https://1password.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('cloudflare', 'Cloudflare', 'CDN, DDoS protection, DNS. Referral bonuses for pro plans.', 'https://www.cloudflare.com/partners', 'Security', 'flat', 100, 0, '{saas,ecommerce}', 'https://www.cloudflare.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('clickup', 'ClickUp', 'All-in-one PM tool. 20% recurring commission.', 'https://clickup.com/affiliates', 'Project Management', 'percentage', 20, 0, '{}', 'https://clickup.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('monday-com', 'Monday.com', 'Work OS for teams. $100-$300 per sale.', 'https://monday.com/partnerships/affiliate', 'Project Management', 'flat', 200, 0, '{}', 'https://monday.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('notion-team', 'Notion (Teams)', 'Workspace for docs, wikis, projects. Partner program.', 'https://www.notion.so/affiliates', 'Productivity', 'percentage', 15, 0, '{}', 'https://www.notion.so', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('semrush', 'Semrush', 'SEO and digital marketing toolkit. $200-$350 per sale + $10/trial.', 'https://www.semrush.com/lp/affiliate-program', 'SEO', 'flat', 200, 0, '{agency,ecommerce}', 'https://www.semrush.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('ahrefs', 'Ahrefs', 'SEO toolset. Revenue share program.', 'https://ahrefs.com/affiliates', 'SEO', 'percentage', 20, 0, '{agency,ecommerce}', 'https://ahrefs.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('hotjar', 'Hotjar', 'Heatmaps and behavior analytics. 25% recurring commission.', 'https://www.hotjar.com/partners/affiliate', 'Analytics', 'percentage', 25, 0, '{saas,ecommerce}', 'https://www.hotjar.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('ringcentral', 'RingCentral', 'Business phone system. Up to $200 per sale.', 'https://www.ringcentral.com/partner', 'Business Phone', 'flat', 200, 0, '{}', 'https://www.ringcentral.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('dialpad', 'Dialpad', 'AI-powered business phone. Partner commissions.', 'https://www.dialpad.com/partners', 'Business Phone', 'flat', 150, 0, '{consulting,agency}', 'https://www.dialpad.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('calendly', 'Calendly', 'Scheduling automation. 20% recurring commission.', 'https://calendly.com/affiliates', 'Scheduling', 'percentage', 20, 0, '{}', 'https://calendly.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('next-insurance', 'NEXT Insurance', 'Digital business insurance. Referral commissions available.', 'https://www.nextinsurance.com/partners', 'Insurance', 'flat', 50, 0, '{}', 'https://www.nextinsurance.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('embroker', 'Embroker', 'Business insurance platform. Partner program.', 'https://www.embroker.com/partners', 'Insurance', 'flat', 75, 0, '{saas,consulting}', 'https://www.embroker.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('cloudways', 'Cloudways', 'Managed cloud hosting. Up to $125/sale + hybrid model.', 'https://www.cloudways.com/en/web-hosting-affiliate-program.php', 'Hosting', 'flat', 125, 0, '{saas,ecommerce}', 'https://www.cloudways.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('siteground', 'SiteGround', 'Web hosting. $50-$125 per sale.', 'https://www.siteground.com/affiliates', 'Hosting', 'flat', 75, 0, '{ecommerce,agency}', 'https://www.siteground.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('legalzoom', 'LegalZoom', 'Business legal services. Commission per sale.', 'https://www.legalzoom.com/affiliates', 'Legal', 'flat', 50, 0, '{}', 'https://www.legalzoom.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('rocket-lawyer', 'Rocket Lawyer', 'Legal documents and attorney advice. Affiliate program.', 'https://www.rocketlawyer.com/affiliates.rl', 'Legal', 'flat', 40, 0, '{}', 'https://www.rocketlawyer.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('pandadoc', 'PandaDoc', 'Document automation: proposals, contracts, e-sign. 25% recurring.', 'https://www.pandadoc.com/partners/affiliate', 'Documents', 'percentage', 25, 0, '{consulting,agency,real-estate}', 'https://www.pandadoc.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('grammarly-business', 'Grammarly Business', 'AI writing assistant. Commission on free signups AND paid plans.', 'https://www.grammarly.com/affiliates', 'Writing', 'flat', 20, 0, '{}', 'https://www.grammarly.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('notion-ai', 'Notion AI', 'AI-powered workspace. Part of Notion affiliate program.', 'https://www.notion.so/affiliates', 'AI Productivity', 'percentage', 15, 0, '{saas,consulting}', 'https://www.notion.so', false, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('jasper-ai', 'Jasper AI', 'AI content creation. 30% recurring commission for 12 months.', 'https://www.jasper.ai/partners/affiliates', 'AI Content', 'percentage', 30, 12, '{agency,ecommerce}', 'https://www.jasper.ai', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('copy-ai', 'Copy.ai', 'AI copywriting and workflow. 45% commission first year, 10% recurring.', 'https://www.copy.ai/affiliate', 'AI Content', 'percentage', 45, 12, '{agency}', 'https://www.copy.ai', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_rate=EXCLUDED.commission_rate, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT '═══ NEW AFFILIATE PARTNERS ═══' AS header;
SELECT category, COUNT(*) AS count FROM affiliate_partners WHERE active=true GROUP BY category ORDER BY count DESC;
SELECT 'TOTAL PARTNERS' AS metric, COUNT(*) AS value FROM affiliate_partners WHERE active=true;

-- === 040-v8-mega-free-alternatives.sql ===
-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — MEGA FREE ALTERNATIVES DATABASE (v8-mega)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 150+ entries covering 6 types across 20+ countries
-- "We show you the BEST way to fix every leak — even if we don't earn from it."
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — FREE ALTERNATIVES ENGINE (v1)
-- ═══════════════════════════════════════════════════════════════════════════════
-- "We show you the BEST way to fix every leak — even if we don't earn from it."
--
-- This file creates and populates the free_alternatives system.
-- Every leak type gets matched with non-affiliate savings options:
--   • FREE_TOOL        — Open-source / free software replacing paid tools
--   • GOVERNMENT        — Grants, tax credits, subsidies (Canada-focused)
--   • DIY_TACTIC        — Negotiation scripts, process changes, internal fixes
--   • RATE_COMPARISON   — Better rates available (banks, insurance, telecom)
--   • TEMPLATE          — Free templates/docs replacing paid services
--   • BUILT_IN          — Hidden features in tools they already own
--
-- These appear ALONGSIDE affiliate partners on fix pages:
--   "Here's the best paid option (affiliate) AND here's what you can do for free."
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS free_alternatives (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  type                TEXT NOT NULL CHECK (type IN (
                        'FREE_TOOL','GOVERNMENT','DIY_TACTIC',
                        'RATE_COMPARISON','TEMPLATE','BUILT_IN'
                      )),
  description         TEXT NOT NULL,
  detailed_steps      TEXT,          -- For DIY tactics: step-by-step guide
  url                 TEXT,          -- Link to tool/program/resource
  replaces            TEXT[],        -- Paid tools this replaces (e.g. '{QuickBooks,Xero}')
  industries          TEXT[],        -- Which industries benefit (empty = all)
  leak_types          TEXT[],        -- Maps to existing leak_type slugs
  estimated_savings_pct  FLOAT DEFAULT 0,     -- % of leak value saved
  estimated_savings_flat FLOAT DEFAULT 0,     -- Fixed $ saved per year
  effort_level        TEXT DEFAULT 'low' CHECK (effort_level IN ('low','medium','high')),
  time_to_implement   TEXT,          -- e.g. '30 minutes', '2-4 weeks'
  skill_required      TEXT DEFAULT 'none' CHECK (skill_required IN ('none','basic','technical','expert')),
  risk_level          TEXT DEFAULT 'low' CHECK (risk_level IN ('low','medium','high')),
  limitations         TEXT,          -- Honest about what you lose vs paid
  region              TEXT DEFAULT 'ALL',  -- 'ALL', 'CA', 'US', 'CA-QC', 'CA-ON', etc.
  business_size_min   INT DEFAULT 0,
  business_size_max   INT DEFAULT 99999,
  quality_vs_paid     INT DEFAULT 70 CHECK (quality_vs_paid BETWEEN 0 AND 100),
  active              BOOLEAN DEFAULT true,
  source              TEXT,          -- Where we found this info
  verified_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_free_alt_type ON free_alternatives(type);
CREATE INDEX IF NOT EXISTS idx_free_alt_leak_types ON free_alternatives USING GIN(leak_types);
CREATE INDEX IF NOT EXISTS idx_free_alt_industries ON free_alternatives USING GIN(industries);
CREATE INDEX IF NOT EXISTS idx_free_alt_region ON free_alternatives(region);
CREATE INDEX IF NOT EXISTS idx_free_alt_active ON free_alternatives(active) WHERE active = true;

-- Junction table: maps free alternatives to affiliate partners they complement
CREATE TABLE IF NOT EXISTS free_alt_partner_pairings (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  free_alt_id         TEXT NOT NULL REFERENCES free_alternatives(id) ON DELETE CASCADE,
  partner_slug        TEXT NOT NULL,  -- References affiliate_partners.slug
  relationship        TEXT NOT NULL CHECK (relationship IN (
                        'free_alternative',    -- Use this instead of paying
                        'complement',          -- Use WITH the paid tool
                        'stepping_stone',      -- Start free, upgrade to paid later
                        'fallback'             -- If paid doesn't work out
                      )),
  comparison_notes    TEXT,           -- "Free version lacks X, paid adds Y"
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pairing_free ON free_alt_partner_pairings(free_alt_id);
CREATE INDEX IF NOT EXISTS idx_pairing_partner ON free_alt_partner_pairings(partner_slug);


-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- FREE TOOLS (66 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wave-accounting', 'Wave Accounting', 'FREE_TOOL', 'Free cloud accounting with invoicing, receipts, reports. Zero monthly fees. Ideal for service businesses.', 'https://www.waveapps.com', '{QuickBooks,Xero,FreshBooks}', '{}', '{accounting-software-overspend,bookkeeping-inefficiency,invoice-delays}', 100, 0, 'low', '1-2 hours', 'basic', 'low', 'No inventory, no project costing, limited multi-currency. Best for service <10 employees.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('gnucash', 'GnuCash', 'FREE_TOOL', 'Open-source double-entry accounting. Desktop app, no subscription, full financial reporting.', 'https://www.gnucash.org', '{QuickBooks,Sage}', '{}', '{accounting-software-overspend,bookkeeping-inefficiency}', 100, 0, 'medium', '3-5 hours', 'basic', 'low', 'Desktop only, steeper learning curve, no built-in invoicing templates.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('invoice-ninja-free', 'Invoice Ninja (Free)', 'FREE_TOOL', 'Free invoicing for unlimited clients with recurring invoices, auto-reminders, online payments.', 'https://www.invoiceninja.com', '{FreshBooks,HoneyBook}', '{}', '{invoice-delays,payment-collection-gaps,late-payment-losses}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Free tier has branded invoices. Self-hosted removes all limits.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('akaunting', 'Akaunting', 'FREE_TOOL', 'Free open-source online accounting. Double-entry with invoicing, expenses, reports.', 'https://akaunting.com', '{QuickBooks,Xero}', '{accounting,consulting}', '{accounting-software-overspend,bookkeeping-inefficiency}', 100, 0, 'medium', '2-4 hours', 'basic', 'low', 'Some modules paid. Self-hosting requires basic server knowledge.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('crater-invoicing', 'Crater', 'FREE_TOOL', 'Open-source invoicing for freelancers and small businesses. Estimates, invoices, expenses, reports.', 'https://craterapp.com', '{FreshBooks,QuickBooks}', '{consulting,agency}', '{invoice-delays,bookkeeping-inefficiency}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Self-hosted only for free. Less polished than commercial alternatives.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('firefly-iii', 'Firefly III', 'FREE_TOOL', 'Self-hosted personal/business finance manager. Budgets, transactions, reports, multi-currency.', 'https://www.firefly-iii.org', '{YNAB,Quicken}', '{}', '{cash-flow-timing-gap,financial-planning-gaps}', 100, 0, 'medium', '2-3 hours', 'technical', 'low', 'Self-hosted only. No bank sync in free version. Great for manual tracking.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('hubspot-free-crm', 'HubSpot Free CRM', 'FREE_TOOL', 'Full CRM: contact management, deal tracking, email templates, meeting scheduling. Free forever, unlimited users.', 'https://www.hubspot.com/products/crm', '{Salesforce,Pipedrive,Copper}', '{}', '{crm-overspend,client-retention-leak,lead-conversion-gap}', 100, 0, 'low', '1-2 hours', 'none', 'low', 'HubSpot branding, limited automation (5 active lists), no custom reporting.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('twenty-crm', 'Twenty CRM', 'FREE_TOOL', 'Open-source Salesforce alternative. Modern UI, self-hosted, fully customizable.', 'https://twenty.com', '{Salesforce,HubSpot Paid}', '{}', '{crm-overspend,client-retention-leak}', 100, 0, 'medium', '2-4 hours', 'technical', 'medium', 'Newer product, smaller ecosystem. Self-hosting requires Docker.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('erp-next-crm', 'ERPNext CRM Module', 'FREE_TOOL', 'Free CRM inside ERPNext open-source ERP. Lead tracking, opportunity management, quotations.', 'https://erpnext.com', '{Salesforce,Zoho CRM}', '{}', '{crm-overspend,lead-conversion-gap}', 100, 0, 'high', '1-2 weeks', 'technical', 'medium', 'Part of full ERP — overkill if you only need CRM. Complex setup.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('espocrm', 'EspoCRM', 'FREE_TOOL', 'Open-source CRM with sales automation, email tracking, calendar, reporting. Clean UI.', 'https://www.espocrm.com', '{Salesforce,HubSpot,Pipedrive}', '{}', '{crm-overspend,client-retention-leak,lead-conversion-gap}', 100, 0, 'medium', '2-3 hours', 'basic', 'low', 'Self-hosted. Smaller community than larger CRMs. Extensions available.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('folk-crm-free', 'Folk CRM (Free Tier)', 'FREE_TOOL', 'Modern CRM with 200 contacts free. Import from LinkedIn, Gmail, Outlook.', 'https://www.folk.app', '{Pipedrive,HubSpot}', '{consulting,agency}', '{crm-overspend,client-communication-gaps}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Free tier limited to 200 contacts. No sales pipeline in free version.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('plane-pm', 'Plane', 'FREE_TOOL', 'Open-source PM with kanban, sprints, issues, roadmaps. Alternative to Jira.', 'https://plane.so', '{Jira,Asana,Monday.com}', '{}', '{project-management-overspend,scope-creep-losses,team-productivity-leak}', 100, 0, 'low', '1 hour', 'none', 'low', 'Fewer integrations than Jira. Cloud has usage limits.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('openproject', 'OpenProject', 'FREE_TOOL', 'Open-source PM with Gantt charts, agile boards, time tracking, cost reporting.', 'https://www.openproject.org', '{Microsoft Project,Smartsheet}', '{construction,consulting}', '{project-management-overspend,scheduling-inefficiency}', 100, 0, 'medium', '2-3 hours', 'basic', 'low', 'Community edition lacks some enterprise features. Gantt charts excellent.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('focalboard', 'Focalboard', 'FREE_TOOL', 'Open-source Trello/Notion alternative by Mattermost. Kanban, table, gallery views.', 'https://www.focalboard.com', '{Trello,Notion,Asana}', '{}', '{project-management-overspend,team-productivity-leak}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Simpler than full PM tools. No Gantt charts. Best for small teams.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('taiga', 'Taiga', 'FREE_TOOL', 'Open-source agile PM with scrum/kanban. Built-in wiki, video conferencing integration.', 'https://taiga.io', '{Jira,Asana,ClickUp}', '{saas,agency}', '{project-management-overspend,team-productivity-leak}', 100, 0, 'low', '1 hour', 'none', 'low', 'Less maintained than alternatives. Good for agile teams.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wekan', 'WeKan', 'FREE_TOOL', 'Open-source kanban board (Trello alternative). Self-hosted, unlimited boards.', 'https://wekan.github.io', '{Trello,Monday.com}', '{}', '{project-management-overspend}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Kanban only — no timeline, Gantt, or resource views.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('planka', 'Planka', 'FREE_TOOL', 'Real-time kanban for workgroups. Beautiful UI, self-hosted, open source.', 'https://planka.app', '{Trello,Asana}', '{}', '{project-management-overspend,team-productivity-leak}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Kanban-focused. No advanced PM features. Great for small teams.', 68, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('vikunja', 'Vikunja', 'FREE_TOOL', 'Open-source to-do/project app. Lists, kanban, gantt, calendar views. Self-hosted.', 'https://vikunja.io', '{Todoist,Asana,ClickUp}', '{}', '{project-management-overspend,team-productivity-leak}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Newer project, smaller community. Actively developed.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('element-chat', 'Element (Matrix)', 'FREE_TOOL', 'End-to-end encrypted team messaging. Self-hosted, bridges to Slack/Discord.', 'https://element.io', '{Slack,Microsoft Teams}', '{}', '{communication-tool-overspend,team-productivity-leak}', 100, 0, 'medium', '1-2 hours', 'basic', 'low', 'Smaller app ecosystem than Slack. Best for privacy-conscious teams.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('rocket-chat', 'Rocket.Chat', 'FREE_TOOL', 'Open-source team chat with video, file sharing, 150+ integrations.', 'https://www.rocket.chat', '{Slack,Microsoft Teams}', '{}', '{communication-tool-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosting required for free unlimited. Cloud limited to 25 users.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mattermost', 'Mattermost', 'FREE_TOOL', 'Open-source Slack alternative. Self-hosted, unlimited users, rich integrations.', 'https://mattermost.com', '{Slack,Microsoft Teams}', '{saas,agency}', '{communication-tool-overspend,team-productivity-leak}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted free edition. Cloud requires paid plan for >10 users.', 78, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('jitsi-meet', 'Jitsi Meet', 'FREE_TOOL', 'Free video conferencing. No account needed. Unlimited duration.', 'https://jitsi.org', '{Zoom,Google Meet}', '{}', '{video-conferencing-overspend,communication-tool-overspend}', 100, 0, 'low', '5 minutes', 'none', 'low', 'No breakout rooms on free hosted. Quality excellent for <20 participants.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('big-blue-button', 'BigBlueButton', 'FREE_TOOL', 'Open-source web conferencing designed for education. Whiteboard, polling, breakout rooms.', 'https://bigbluebutton.org', '{Zoom,Microsoft Teams}', '{healthcare,consulting}', '{video-conferencing-overspend}', 100, 0, 'high', '4-8 hours', 'technical', 'low', 'Self-hosted only. Designed for teaching/training, not general business calls.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('canva-free', 'Canva Free', 'FREE_TOOL', 'Free design tool with 250K+ templates. Social posts, presentations, logos, flyers.', 'https://www.canva.com', '{Adobe Creative Suite}', '{}', '{marketing-spend-inefficiency,design-costs-overspend}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Watermarks on premium assets. Limited brand kit. 5GB storage.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('gimp', 'GIMP', 'FREE_TOOL', 'Free image editor. Professional-grade photo editing and graphic design.', 'https://www.gimp.org', '{Adobe Photoshop}', '{}', '{design-costs-overspend}', 100, 0, 'medium', '1-2 hours', 'basic', 'low', 'Steeper learning curve. UI less intuitive. Excellent for photo editing.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('inkscape', 'Inkscape', 'FREE_TOOL', 'Free vector graphics editor. Logos, illustrations, SVG, AI, EPS support.', 'https://inkscape.org', '{Adobe Illustrator}', '{}', '{design-costs-overspend}', 100, 0, 'medium', '2-3 hours', 'basic', 'low', 'Performance issues with complex files. No CMYK color mode natively.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mailchimp-free', 'Mailchimp Free', 'FREE_TOOL', 'Free email marketing for 500 contacts. Templates, basic automation, analytics.', 'https://www.mailchimp.com', '{Constant Contact,ConvertKit}', '{}', '{email-marketing-overspend,marketing-spend-inefficiency}', 100, 0, 'low', '30 minutes', 'none', 'low', '500 contacts, 1000 sends/month. Mailchimp branding. Single automation.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mautic', 'Mautic', 'FREE_TOOL', 'Open-source marketing automation. Email campaigns, landing pages, lead scoring, segmentation.', 'https://www.mautic.org', '{HubSpot Marketing,Marketo,ActiveCampaign}', '{saas,ecommerce}', '{email-marketing-overspend,marketing-spend-inefficiency,lead-conversion-gap}', 100, 0, 'high', '1-2 weeks', 'technical', 'medium', 'Complex setup. Self-hosted. Requires PHP knowledge for customization.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('brevo-free', 'Brevo Free Tier (Sendinblue)', 'FREE_TOOL', 'Free email marketing: 300 emails/day, unlimited contacts. Automation available.', 'https://www.brevo.com', '{Mailchimp,ConvertKit}', '{}', '{email-marketing-overspend}', 100, 0, 'low', '30 minutes', 'none', 'low', '300 emails/day limit. Brevo branding. Basic automation only.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('matomo', 'Matomo Analytics', 'FREE_TOOL', 'Open-source Google Analytics alternative. Privacy-first, self-hosted, GDPR compliant.', 'https://matomo.org', '{Google Analytics,Mixpanel}', '{saas,ecommerce}', '{analytics-tool-overspend,data-blind-spots}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted for free. Requires server. Less real-time than GA4.', 78, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('plausible', 'Plausible Analytics', 'FREE_TOOL', 'Open-source, lightweight web analytics. Privacy-friendly, no cookies.', 'https://plausible.io', '{Google Analytics,Adobe Analytics}', '{}', '{analytics-tool-overspend}', 100, 0, 'medium', '1-2 hours', 'technical', 'low', 'Self-hosting required for free. Simpler than GA4 (feature, not bug).', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('umami', 'Umami Analytics', 'FREE_TOOL', 'Simple, fast, privacy-focused open-source analytics. Clean dashboard.', 'https://umami.is', '{Google Analytics,Mixpanel}', '{saas,ecommerce}', '{analytics-tool-overspend}', 100, 0, 'medium', '1-2 hours', 'technical', 'low', 'Basic compared to GA4. No e-commerce tracking. Great for simplicity.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('listmonk', 'Listmonk', 'FREE_TOOL', 'Open-source newsletter and mailing list manager. High performance, self-hosted.', 'https://listmonk.app', '{Mailchimp,ConvertKit,Constant Contact}', '{}', '{email-marketing-overspend}', 100, 0, 'medium', '2-3 hours', 'technical', 'low', 'Self-hosted only. No drag-and-drop editor. Needs HTML knowledge for templates.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('ghost-cms', 'Ghost (Free/Self-Hosted)', 'FREE_TOOL', 'Open-source publishing platform with built-in newsletter, memberships, and SEO.', 'https://ghost.org', '{WordPress,Substack,Squarespace}', '{agency,consulting}', '{website-overspend,content-management-overspend}', 100, 0, 'medium', '2-4 hours', 'basic', 'low', 'Self-hosted for free. Less plugin ecosystem than WordPress. Beautiful by default.', 78, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('cal-com', 'Cal.com', 'FREE_TOOL', 'Open-source scheduling. Free alternative to Calendly with unlimited events and bookings.', 'https://cal.com', '{Calendly,Acuity Scheduling}', '{}', '{scheduling-inefficiency,administrative-overhead}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Free: 1 connected calendar. Self-hosted has zero limits.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('odoo-community', 'Odoo Community Edition', 'FREE_TOOL', 'Open-source ERP/HR suite. Free modules: HR, CRM, inventory, accounting, website, POS.', 'https://www.odoo.com/page/community', '{BambooHR,Gusto,ADP,SAP}', '{}', '{hr-software-overspend,payroll-processing-overspend}', 100, 0, 'high', '1-2 weeks', 'technical', 'medium', 'Self-host only. Fewer themes, no Odoo support. Complex implementation.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('erpnext-hr', 'ERPNext', 'FREE_TOOL', 'Free open-source ERP. HR, accounting, CRM, inventory, manufacturing, POS. All-in-one.', 'https://erpnext.com', '{SAP,Oracle,Odoo Enterprise}', '{construction,restaurant,healthcare}', '{hr-software-overspend,erp-overspend,administrative-overhead}', 100, 0, 'high', '2-4 weeks', 'expert', 'medium', 'Complex implementation. Needs Python/Frappe knowledge for customization.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('clockify-free', 'Clockify (Free)', 'FREE_TOOL', 'Free time tracking for unlimited users. Timesheets, reports, project tracking.', 'https://clockify.me', '{Harvest,Toggl,TimeCamp}', '{consulting,agency,law-firm}', '{time-tracking-leak,billable-utilization-gap,unbilled-work}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Free tier covers most needs. Advanced reporting requires paid plan.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('toggl-free', 'Toggl Track (Free)', 'FREE_TOOL', 'Free time tracking for up to 5 users. One-click timer, reports, integrations.', 'https://toggl.com/track', '{Harvest,TimeCamp}', '{consulting,agency}', '{time-tracking-leak,unbilled-work}', 100, 0, 'low', '10 minutes', 'none', 'low', '5 user limit on free. No billable rates in free. Excellent UX.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('nextcloud', 'Nextcloud', 'FREE_TOOL', 'Self-hosted cloud storage and collaboration. Replace Google Workspace/Dropbox.', 'https://nextcloud.com', '{Google Workspace,Dropbox Business}', '{}', '{cloud-storage-overspend,collaboration-tool-overspend}', 100, 0, 'high', '4-8 hours', 'technical', 'medium', 'Requires server management. Performance depends on hosting.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('libreoffice', 'LibreOffice', 'FREE_TOOL', 'Free office suite: word processor, spreadsheet, presentation. MS Office compatible.', 'https://www.libreoffice.org', '{Microsoft 365,Google Workspace}', '{}', '{software-subscription-waste,office-suite-overspend}', 100, 0, 'low', '30 minutes', 'none', 'low', 'No real-time collaboration. Some complex MS macros may not convert.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('cryptpad', 'CryptPad', 'FREE_TOOL', 'End-to-end encrypted collaborative office suite. Docs, sheets, presentations, kanban.', 'https://cryptpad.org', '{Google Docs,Microsoft 365}', '{law-firm,healthcare}', '{collaboration-tool-overspend,cloud-storage-overspend}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Smaller feature set than Google Docs. Privacy-first design.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('xwiki', 'XWiki', 'FREE_TOOL', 'Open-source enterprise wiki. Knowledge base, documentation, structured data.', 'https://www.xwiki.org', '{Confluence,Notion}', '{saas,consulting}', '{knowledge-management-gap,collaboration-tool-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Java-based, heavier than alternatives. Very powerful for large teams.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wordpress-org', 'WordPress.org (Self-Hosted)', 'FREE_TOOL', 'Free CMS powering 43% of websites. Thousands of free themes and plugins.', 'https://wordpress.org', '{Squarespace,Wix}', '{ecommerce,agency}', '{website-overspend}', 80, 0, 'medium', '4-8 hours', 'basic', 'low', 'Requires hosting ($3-10/mo). More maintenance than hosted solutions.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('woocommerce', 'WooCommerce', 'FREE_TOOL', 'Free open-source e-commerce for WordPress. Full store, no transaction fees.', 'https://woocommerce.com', '{Shopify,BigCommerce}', '{ecommerce}', '{ecommerce-platform-overspend,transaction-fee-leak}', 100, 0, 'medium', '1-2 days', 'basic', 'medium', 'More setup than Shopify. Hosting separate. No built-in transaction fees.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('prestashop', 'PrestaShop', 'FREE_TOOL', 'Free open-source e-commerce platform. 300+ features, 600+ themes, multi-language.', 'https://www.prestashop.com', '{Shopify,BigCommerce}', '{ecommerce}', '{ecommerce-platform-overspend}', 100, 0, 'medium', '1-2 days', 'basic', 'medium', 'More complex than Shopify. Some essential modules are paid.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('medusa-js', 'Medusa.js', 'FREE_TOOL', 'Open-source headless commerce engine. Node.js, highly customizable, API-first.', 'https://medusajs.com', '{Shopify Plus,BigCommerce Enterprise}', '{ecommerce,saas}', '{ecommerce-platform-overspend}', 100, 0, 'high', '1-2 weeks', 'expert', 'medium', 'Developer-focused. No drag-and-drop. Best for custom storefronts.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('bitwarden-free', 'Bitwarden (Free)', 'FREE_TOOL', 'Open-source password manager. Unlimited passwords, 2FA, secure sharing.', 'https://bitwarden.com', '{1Password,LastPass,Dashlane}', '{}', '{security-vulnerability-costs,password-management-overspend}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Free: 2 user sharing. Core password management fully free.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('keepass', 'KeePass', 'FREE_TOOL', 'Free offline password manager. Local database, plugins, portable.', 'https://keepass.info', '{1Password,LastPass}', '{}', '{security-vulnerability-costs}', 100, 0, 'low', '30 minutes', 'basic', 'low', 'Desktop only. No cloud sync built-in. Very secure (local only).', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wireguard', 'WireGuard VPN', 'FREE_TOOL', 'Free, fast VPN protocol. Self-hosted, lightweight, modern cryptography.', 'https://www.wireguard.com', '{NordVPN Business,Cisco VPN}', '{saas}', '{security-vulnerability-costs,vpn-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Requires server setup. No GUI by default. Extremely fast.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('snipe-it', 'Snipe-IT', 'FREE_TOOL', 'Free open-source IT asset management. Track hardware, software licenses, accessories.', 'https://snipeitapp.com', '{ServiceNow,Freshservice}', '{saas,healthcare}', '{it-asset-management-gap,software-license-waste}', 100, 0, 'medium', '2-3 hours', 'basic', 'low', 'Self-hosted free. Cloud version paid. Great for tracking licenses.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('zabbix', 'Zabbix', 'FREE_TOOL', 'Free open-source IT monitoring. Networks, servers, VMs, cloud, applications.', 'https://www.zabbix.com', '{Datadog,New Relic}', '{saas}', '{it-monitoring-overspend}', 100, 0, 'high', '1-2 days', 'expert', 'low', 'Complex setup. Powerful but steep learning curve.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('metabase', 'Metabase', 'FREE_TOOL', 'Open-source BI. Connect any database, build dashboards, share insights.', 'https://www.metabase.com', '{Tableau,Looker,Power BI}', '{saas,ecommerce}', '{analytics-tool-overspend,reporting-inefficiency}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted free. Fewer data connectors than Tableau.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('apache-superset', 'Apache Superset', 'FREE_TOOL', 'Open-source BI and data exploration platform. SQL-native, dashboards, charts.', 'https://superset.apache.org', '{Tableau,Looker,Sisense}', '{saas,ecommerce}', '{analytics-tool-overspend,reporting-inefficiency}', 100, 0, 'high', '4-8 hours', 'expert', 'low', 'Complex setup. Best for data-savvy teams. Very powerful.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('redash', 'Redash', 'FREE_TOOL', 'Open-source data visualization. Query, visualize, collaborate on data.', 'https://redash.io', '{Tableau,Looker}', '{saas}', '{analytics-tool-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted. No longer actively maintained but fork exists.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('chatwoot', 'Chatwoot', 'FREE_TOOL', 'Open-source customer support. Live chat, email, social media, WhatsApp from one inbox.', 'https://www.chatwoot.com', '{Intercom,Zendesk,Freshdesk}', '{saas,ecommerce}', '{customer-support-overspend,client-communication-gaps}', 100, 0, 'medium', '2-3 hours', 'basic', 'low', 'Self-hosted free. Cloud free tier: 2 agents. Growing fast.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('zammad', 'Zammad', 'FREE_TOOL', 'Open-source helpdesk and ticketing. Email, phone, chat, social integrated.', 'https://zammad.org', '{Zendesk,Freshdesk}', '{saas,healthcare}', '{customer-support-overspend}', 100, 0, 'medium', '3-4 hours', 'technical', 'low', 'Self-hosted. German-made, strong GDPR compliance.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('freescout', 'FreeScout', 'FREE_TOOL', 'Open-source helpdesk. Lightweight Zendesk/Help Scout alternative.', 'https://freescout.net', '{Help Scout,Zendesk}', '{consulting,agency}', '{customer-support-overspend}', 100, 0, 'low', '1-2 hours', 'basic', 'low', 'Self-hosted. Minimal resources needed. Module marketplace.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('typebot', 'Typebot', 'FREE_TOOL', 'Open-source chatbot builder. Conversational forms, lead qualification, support automation.', 'https://typebot.io', '{Typeform,Intercom}', '{saas,ecommerce}', '{lead-conversion-gap,customer-support-overspend}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Self-hosted for free. Cloud free tier available. Drag-and-drop builder.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('limesurvey', 'LimeSurvey Community', 'FREE_TOOL', 'Open-source survey tool. Unlimited surveys, questions, respondents.', 'https://www.limesurvey.org', '{SurveyMonkey,Typeform}', '{healthcare,consulting}', '{survey-tool-overspend}', 100, 0, 'medium', '1-2 hours', 'basic', 'low', 'Self-hosted. UI dated compared to Typeform. Very powerful features.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('n8n', 'n8n', 'FREE_TOOL', 'Open-source workflow automation. Visual editor connecting 400+ apps. Self-hosted.', 'https://n8n.io', '{Zapier,Make.com}', '{saas,ecommerce}', '{automation-tool-overspend,manual-process-waste}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted for free. Requires Node.js. Very powerful automation.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('automatisch', 'Automatisch', 'FREE_TOOL', 'Open-source Zapier alternative. Connect apps with visual workflow builder.', 'https://automatisch.io', '{Zapier,Make.com}', '{}', '{automation-tool-overspend}', 100, 0, 'medium', '2-3 hours', 'basic', 'low', 'Fewer integrations than Zapier. Growing ecosystem.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('notion-free', 'Notion (Free)', 'FREE_TOOL', 'Free workspace for notes, wikis, databases, project tracking. Unlimited pages for individuals.', 'https://www.notion.so', '{Confluence,Evernote}', '{}', '{knowledge-management-gap,documentation-overspend}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Free: 1 user unlimited. Teams limited on free. No offline mode.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('bookstack', 'BookStack', 'FREE_TOOL', 'Open-source wiki/documentation platform. Books, chapters, pages. Beautiful and simple.', 'https://www.bookstackapp.com', '{Confluence,Notion}', '{saas,consulting}', '{knowledge-management-gap}', 100, 0, 'low', '1-2 hours', 'basic', 'low', 'Self-hosted. Simple but fewer features than Confluence.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('outline', 'Outline', 'FREE_TOOL', 'Open-source wiki for teams. Markdown, real-time collaboration, search.', 'https://www.getoutline.com', '{Confluence,Notion,Slite}', '{saas,agency}', '{knowledge-management-gap,collaboration-tool-overspend}', 100, 0, 'medium', '2-3 hours', 'technical', 'low', 'Self-hosted for free. Beautiful UI. Slack/Figma integrations.', 78, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('docuseal', 'DocuSeal', 'FREE_TOOL', 'Open-source document signing. Create, fill, sign PDF forms. Free and self-hosted.', 'https://www.docuseal.co', '{DocuSign,HelloSign,PandaDoc}', '{law-firm,consulting,real-estate}', '{document-signing-overspend,contract-gaps}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Self-hosted for free. Cloud free tier: 10 docs/month.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- GOVERNMENT PROGRAMS (45 entries — Worldwide)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('sred-tax-credit', 'SR&ED Tax Credit (Canada)', 'GOVERNMENT', 'Federal R&D tax credit: 15% non-refundable or 35% refundable (CCPCs) on R&D expenditures. Budget 2025 raised limit to $6M.', 'https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html', '{}', '{saas,ecommerce,consulting}', '{technology-overspend,r-and-d-costs}', 0, 50000, 'high', '2-6 months', 'expert', 'low', 'Requires genuine R&D with technological uncertainty. Claims may be audited.', 95, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('irap-funding', 'NRC IRAP (Canada)', 'GOVERNMENT', 'Non-repayable funding for SME innovation up to $10M. Advisory services included.', 'https://nrc.canada.ca/en/support-technology-innovation', '{}', '{saas,ecommerce,healthcare}', '{technology-overspend,r-and-d-costs}', 0, 100000, 'high', '3-6 months', 'expert', 'low', 'Must be Canadian SME <500 employees. Competitive.', 95, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('csbfp-loan', 'CSBFP Loan (Canada)', 'GOVERNMENT', 'Government-backed loans up to $1M for equipment, leasehold, technology.', 'https://ised-isde.canada.ca/site/canada-small-business-financing-program', '{}', '{}', '{equipment-cost-overspend,capital-expenditure-leak}', 0, 25000, 'medium', '2-6 weeks', 'basic', 'low', '2% registration fee. Must be <$10M revenue.', 90, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('cdap-boost', 'CDAP Digital Adoption (Canada)', 'GOVERNMENT', 'Up to $15,000 grant + $100K interest-free BDC loan for digital adoption.', 'https://ised-isde.canada.ca/site/canada-digital-adoption-program', '{}', '{}', '{technology-overspend,digital-transformation-gap}', 0, 15000, 'medium', '4-8 weeks', 'basic', 'low', 'Program subscribed in waves. 1+ employee, $500K-$100M revenue.', 90, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('quebec-r-and-d-credit', 'Québec R&D Tax Credits', 'GOVERNMENT', 'Provincial R&D credit 14-30%. Stacks with federal SR&ED for up to 69% savings on labour.', 'https://www.revenuquebec.ca', '{}', '{saas,consulting}', '{r-and-d-costs}', 30, 0, 'high', '2-4 months', 'expert', 'low', 'Must have establishment in Québec. Complex forms.', 95, 'CA-QC')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('ontario-jobs-training', 'Ontario Jobs Training Tax Credit', 'GOVERNMENT', 'Up to 50% of training costs (max $10,000) for employee upskilling.', 'https://www.ontario.ca', '{}', '{}', '{training-cost-inefficiency}', 50, 0, 'low', 'At tax filing', 'basic', 'low', 'Only for businesses with Ontario establishments.', 85, 'CA-ON')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('alberta-innovates', 'Alberta Innovates', 'GOVERNMENT', 'Grants up to $2M for technology and innovation projects in Alberta.', 'https://albertainnovates.ca', '{}', '{saas,healthcare}', '{r-and-d-costs,technology-overspend}', 0, 75000, 'high', '3-6 months', 'expert', 'low', 'Must be Alberta-based. Sector-specific programs.', 90, 'CA-AB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('canexport-smes', 'CanExport SMEs (Canada)', 'GOVERNMENT', 'Up to $50,000 for international market development activities.', 'https://www.tradecommissioner.gc.ca/funding-financement/canexport', '{}', '{}', '{market-expansion-gap}', 0, 50000, 'medium', '4-8 weeks', 'basic', 'low', 'Must be Canadian SME with 1-500 employees.', 90, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wage-subsidy-csj', 'Canada Summer Jobs', 'GOVERNMENT', 'Wage subsidies covering 50-75% of student wages for summer positions.', 'https://www.canada.ca/en/employment-social-development/services/funding/canada-summer-jobs.html', '{}', '{}', '{labor-cost-overspend,staffing-inefficiency}', 50, 8000, 'medium', '2-4 months', 'basic', 'low', 'Seasonal (May-Aug). Annual application in Jan-Feb.', 80, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('apprenticeship-tax-credit-ca', 'Apprenticeship Job Creation Tax Credit (Canada)', 'GOVERNMENT', '10% of wages for eligible apprentices, up to $2,000/apprentice/year.', 'https://www.canada.ca/en/revenue-agency', '{}', '{construction,restaurant}', '{labor-cost-overspend,training-cost-inefficiency}', 0, 2000, 'low', 'At tax filing', 'basic', 'low', 'Only Red Seal trades, first 2 years.', 90, 'CA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-rd-tax-credit', 'US R&D Tax Credit (Section 41)', 'GOVERNMENT', 'Federal tax credit for research activities. 20% of qualified research expenses above base amount. Startups can apply up to $500K against payroll taxes.', 'https://www.irs.gov/forms-pubs/about-form-6765', '{}', '{saas,ecommerce,healthcare}', '{r-and-d-costs,technology-overspend}', 0, 75000, 'high', '2-4 months', 'expert', 'low', 'Requires 4-part test. Documentation critical. Startups <$5M revenue can offset payroll tax.', 95, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-section-179', 'Section 179 Deduction (US)', 'GOVERNMENT', 'Immediate expense deduction up to $1,220,000 for qualifying equipment purchased in tax year. Includes software.', 'https://www.irs.gov/newsroom/section-179-deduction', '{}', '{}', '{equipment-cost-overspend,technology-overspend}', 25, 0, 'low', 'At tax filing', 'basic', 'low', 'Phase-out begins at $3.05M total equipment purchases. Cannot exceed taxable income.', 90, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-qbi-deduction', 'Qualified Business Income Deduction (US)', 'GOVERNMENT', '20% deduction on qualified business income for pass-through entities (S-corps, LLCs, sole props).', 'https://www.irs.gov/newsroom/qualified-business-income-deduction', '{}', '{}', '{tax-planning-gaps,tax-overpayment}', 20, 0, 'low', 'At tax filing', 'basic', 'low', 'Income limitations apply for service businesses. Complex calculation.', 90, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-wotc', 'Work Opportunity Tax Credit (US)', 'GOVERNMENT', 'Up to $9,600 per eligible hire from target groups (veterans, ex-felons, SNAP recipients).', 'https://www.irs.gov/businesses/small-businesses-self-employed/work-opportunity-tax-credit', '{}', '{restaurant,construction}', '{labor-cost-overspend,hiring-cost-overspend}', 0, 9600, 'medium', '1-2 months', 'basic', 'low', 'Must file Form 8850 within 28 days of hire start date.', 85, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-sba-7a-loans', 'SBA 7(a) Loan Program (US)', 'GOVERNMENT', 'Government-guaranteed loans up to $5M. Lower down payments, longer terms than conventional.', 'https://www.sba.gov/funding-programs/loans', '{}', '{}', '{capital-expenditure-leak,cash-flow-timing-gap}', 0, 50000, 'medium', '2-8 weeks', 'basic', 'low', 'Must meet SBA size standards. 2.25-2.75% guaranty fee.', 90, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-sba-504-loans', 'SBA 504 Loan Program (US)', 'GOVERNMENT', 'Up to $5.5M for major fixed assets. Below-market fixed interest rate.', 'https://www.sba.gov/funding-programs/loans/504-loans', '{}', '{construction,restaurant,healthcare}', '{equipment-cost-overspend,capital-expenditure-leak}', 0, 100000, 'high', '4-12 weeks', 'basic', 'low', 'Must create or retain jobs. 10% down payment minimum.', 90, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-step-grants', 'State Trade Expansion Program (US)', 'GOVERNMENT', 'Grants up to $5,000-$15,000 for international trade activities (trade shows, websites, translation).', 'https://www.sba.gov/funding-programs/grants/state-trade-expansion-program-step', '{}', '{ecommerce}', '{market-expansion-gap}', 0, 10000, 'medium', '4-8 weeks', 'basic', 'low', 'Must apply through state. Varies by state.', 85, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-eidl-advance', 'SBA Microloans (US)', 'GOVERNMENT', 'Loans up to $50,000 through nonprofit intermediaries. For working capital, inventory, equipment.', 'https://www.sba.gov/funding-programs/loans/microloans', '{}', '{}', '{cash-flow-timing-gap}', 0, 5000, 'low', '1-4 weeks', 'none', 'low', 'Must work with SBA intermediary lender.', 80, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-clean-energy-credits', 'Clean Energy Tax Credits (US)', 'GOVERNMENT', 'IRA provides 30% tax credit for solar, energy storage, clean vehicles for businesses.', 'https://www.energy.gov/clean-energy-tax-provisions', '{}', '{construction,restaurant}', '{energy-cost-inefficiency,utility-overspend}', 30, 0, 'medium', '1-3 months', 'basic', 'low', 'Bonus credits for domestic content and energy communities.', 90, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-bonus-depreciation', 'Bonus Depreciation (US)', 'GOVERNMENT', '80% first-year bonus depreciation on qualifying assets (2024). Decreasing 20%/year through 2027.', 'https://www.irs.gov/newsroom/new-rules-and-limitations-for-depreciation-and-expensing', '{}', '{}', '{equipment-cost-overspend,tax-planning-gaps}', 20, 0, 'low', 'At tax filing', 'basic', 'low', 'Applies to new and used assets. Phase-down: 60% in 2025, 40% in 2026, 20% in 2027.', 90, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-health-care-tax-credit', 'Small Business Health Care Tax Credit (US)', 'GOVERNMENT', 'Up to 50% credit on premiums paid for employee health coverage.', 'https://www.irs.gov/affordable-care-act/employers/small-business-health-care-tax-credit', '{}', '{restaurant,construction}', '{benefits-overspend,labor-cost-overspend}', 50, 0, 'medium', 'At tax filing', 'basic', 'low', 'Must have <25 FTEs averaging <$58,000/year. Buy through SHOP marketplace.', 85, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-rd-tax-relief', 'UK R&D Tax Relief (RDEC)', 'GOVERNMENT', 'Above-the-line credit of 20% on qualifying R&D expenditure. Merged scheme from April 2024.', 'https://www.gov.uk/guidance/corporation-tax-research-and-development-rd-relief', '{}', '{saas,consulting,healthcare}', '{r-and-d-costs,technology-overspend}', 0, 50000, 'high', '2-4 months', 'expert', 'low', 'Must meet HMRC definition of R&D. Enhanced scheme for R&D-intensive SMEs.', 95, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-startup-loans', 'UK Start Up Loans', 'GOVERNMENT', 'Government-backed loans £500-£25,000 at 6% fixed. Free mentoring included.', 'https://www.startuploans.co.uk', '{}', '{}', '{capital-expenditure-leak,cash-flow-timing-gap}', 0, 12000, 'medium', '2-4 weeks', 'basic', 'low', 'Business must be under 3 years old. Personal guarantee required.', 85, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-innovate-uk', 'Innovate UK Grants', 'GOVERNMENT', 'Innovation grants from £25K-£10M+ for UK businesses. Smart Grants, sector-specific competitions.', 'https://www.ukri.org/councils/innovate-uk', '{}', '{saas,healthcare}', '{r-and-d-costs,innovation-investment-gap}', 0, 100000, 'high', '3-6 months', 'expert', 'medium', 'Highly competitive. Smart Grants paused 2025/26. Check Innovation Funding Service.', 95, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-eis-seis', 'EIS/SEIS Tax Relief (UK)', 'GOVERNMENT', 'Seed Enterprise Investment Scheme: investors get 50% tax relief on shares (SEIS) or 30% (EIS). Helps you raise capital.', 'https://www.gov.uk/guidance/seed-enterprise-investment-scheme-background', '{}', '{saas}', '{capital-expenditure-leak,fundraising-cost}', 0, 0, 'high', '2-3 months', 'expert', 'low', 'Company must be UK-based, <25 employees (SEIS) or <250 (EIS).', 90, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-annual-investment-allowance', 'Annual Investment Allowance (UK)', 'GOVERNMENT', '100% first-year deduction on qualifying plant and machinery up to £1M.', 'https://www.gov.uk/capital-allowances/annual-investment-allowance', '{}', '{construction,restaurant}', '{equipment-cost-overspend,tax-planning-gaps}', 25, 0, 'low', 'At tax filing', 'basic', 'low', 'Permanent £1M limit. Most businesses never exceed this.', 90, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-patent-box', 'UK Patent Box', 'GOVERNMENT', 'Reduced 10% corporation tax rate on profits from patented inventions (vs standard 25%).', 'https://www.gov.uk/guidance/corporation-tax-the-patent-box', '{}', '{saas,healthcare}', '{tax-planning-gaps,innovation-investment-gap}', 15, 0, 'high', '3-6 months', 'expert', 'low', 'Must own qualifying patents granted by UK or EPC.', 90, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uk-knowledge-transfer', 'Knowledge Transfer Partnerships (UK)', 'GOVERNMENT', 'Government co-funds a graduate to work on innovation project. 67% funding for SMEs.', 'https://www.ukri.org/what-we-do/developing-people-and-skills/ktp/', '{}', '{saas,consulting,healthcare}', '{r-and-d-costs,staffing-inefficiency}', 67, 0, 'high', '3-6 months', 'expert', 'low', 'Must partner with a UK university. 12-36 month projects.', 85, 'GB')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('au-rd-tax-incentive', 'Australia R&D Tax Incentive', 'GOVERNMENT', '43.5% refundable tax offset for SMEs (<$20M turnover) on eligible R&D.', 'https://business.gov.au/grants-and-programs/research-and-development-tax-incentive', '{}', '{saas,healthcare}', '{r-and-d-costs,technology-overspend}', 0, 75000, 'high', '2-4 months', 'expert', 'low', 'Must register with AusIndustry. Minimum $20K R&D expenditure.', 95, 'AU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('au-instant-asset-writeoff', 'Instant Asset Write-Off (Australia)', 'GOVERNMENT', '$20,000 threshold for immediate deduction on qualifying assets for small businesses.', 'https://www.ato.gov.au', '{}', '{construction,restaurant}', '{equipment-cost-overspend,tax-planning-gaps}', 25, 0, 'low', 'At tax filing', 'basic', 'low', '$20K threshold for 2025-26. Aggregated turnover <$10M.', 90, 'AU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('au-export-market-grant', 'Export Market Development Grant (Australia)', 'GOVERNMENT', 'Reimbursement of up to 50% of eligible export marketing expenses, up to $150K over grant period.', 'https://www.austrade.gov.au/en/how-austrade-can-help/programs-and-incentives/emdg', '{}', '{ecommerce,saas}', '{market-expansion-gap}', 0, 50000, 'medium', '4-8 weeks', 'basic', 'low', 'Must be Australian company with <$50M turnover.', 85, 'AU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('au-csiro-kickstart', 'CSIRO Kick-Start (Australia)', 'GOVERNMENT', 'Up to $50K matched funding for SMEs to access CSIRO research expertise.', 'https://www.csiro.au/en/work-with-us/funding-programs/SME/csiro-kick-start', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 50000, 'medium', '2-4 months', 'basic', 'low', 'Must be an SME. Matched funding means you contribute 50%.', 85, 'AU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('eu-horizon-europe', 'Horizon Europe (EU)', 'GOVERNMENT', '€95.5B EU research and innovation programme. SME Instrument / EIC Accelerator for startups.', 'https://ec.europa.eu/info/research-and-innovation/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en', '{}', '{saas,healthcare}', '{r-and-d-costs,innovation-investment-gap}', 0, 250000, 'high', '4-9 months', 'expert', 'high', 'Must be EU-based or associated country. Highly competitive (5-8% success rate).', 95, 'EU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('eu-eic-accelerator', 'EIC Accelerator (EU)', 'GOVERNMENT', 'Up to €2.5M grant + €15M equity for breakthrough innovations.', 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en', '{}', '{saas,healthcare}', '{innovation-investment-gap,r-and-d-costs}', 0, 500000, 'high', '6-12 months', 'expert', 'high', 'For EU SMEs. TRL 5-8 innovations. ~5% success rate.', 95, 'EU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('eu-digital-europe', 'Digital Europe Programme (EU)', 'GOVERNMENT', '€7.6B for digital transformation. AI, cybersecurity, digital skills, cloud, data.', 'https://digital-strategy.ec.europa.eu/en/activities/digital-programme', '{}', '{saas}', '{technology-overspend,digital-transformation-gap}', 0, 100000, 'high', '3-6 months', 'expert', 'medium', 'For EU organizations. Open calls on EC Funding & Tenders portal.', 90, 'EU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('germany-exist', 'EXIST Business Start-Up Grant (Germany)', 'GOVERNMENT', 'Up to €3,000/month for founders + €30,000 for materials. For university spin-offs.', 'https://www.exist.de/EN/Home/home_node.html', '{}', '{saas}', '{capital-expenditure-leak}', 0, 30000, 'high', '3-6 months', 'basic', 'medium', 'Must be associated with a German university or research institution.', 85, 'DE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('france-jei', 'JEI Status (France)', 'GOVERNMENT', 'Young innovative companies get social contribution exemptions (up to €231K/year) and CII R&D tax credit.', 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F31188', '{}', '{saas}', '{labor-cost-overspend,r-and-d-costs}', 0, 100000, 'high', '2-4 months', 'expert', 'low', 'Must be <8 years old, <250 employees, R&D spend >15% of charges.', 90, 'FR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('france-cir', 'Crédit Impôt Recherche (France)', 'GOVERNMENT', 'R&D tax credit of 30% on first €100M of R&D spend (5% above that). Most generous in EU.', 'https://www.enseignementsup-recherche.gouv.fr/fr/le-credit-d-impot-recherche-46406', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 100000, 'high', '2-4 months', 'expert', 'low', 'Must perform qualifying R&D in France. Covers salaries, consumables, subcontractors.', 95, 'FR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('netherlands-wbso', 'WBSO R&D Tax Credit (Netherlands)', 'GOVERNMENT', '32% wage tax reduction on first €350K R&D labour costs (16% above). For R&D hours.', 'https://english.rvo.nl/subsidies-programmes/wbso', '{}', '{saas}', '{r-and-d-costs,labor-cost-overspend}', 0, 50000, 'medium', '1-2 months', 'expert', 'low', 'Must apply before start of R&D period. Tracks hours worked on R&D.', 90, 'NL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('ireland-rd-credit', 'Ireland R&D Tax Credit', 'GOVERNMENT', '25% tax credit on qualifying R&D expenditure. Can be used to reduce corporation tax or get cash refund.', 'https://www.revenue.ie/en/companies-and-charities/reliefs-and-exemptions/research-and-development-rd-tax-credit/index.aspx', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 50000, 'high', '2-4 months', 'expert', 'low', 'Must be Irish-registered company. R&D must seek to achieve scientific/technological advancement.', 90, 'IE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('singapore-edg', 'Enterprise Development Grant (Singapore)', 'GOVERNMENT', 'Up to 50% funding support for transformation, innovation, overseas expansion.', 'https://www.enterprisesg.gov.sg/financial-support/enterprise-development-grant', '{}', '{saas,ecommerce}', '{technology-overspend,market-expansion-gap}', 50, 0, 'medium', '4-8 weeks', 'basic', 'low', 'Must be Singapore-registered, >=30% local shareholding, viable business.', 85, 'SG')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('singapore-startup-sg', 'Startup SG Founder (Singapore)', 'GOVERNMENT', 'S$50,000 startup capital grant. 2:1 co-funding with approved incubator.', 'https://www.startupsg.gov.sg/programmes/4894/startup-sg-founder', '{}', '{saas}', '{capital-expenditure-leak}', 0, 35000, 'medium', '2-4 months', 'basic', 'low', 'Must be first-time entrepreneur with innovative business concept.', 80, 'SG')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('nz-callaghan', 'Callaghan Innovation R&D Grants (New Zealand)', 'GOVERNMENT', 'Up to 40% of eligible R&D costs. Project grants up to $800K, growth grants uncapped.', 'https://www.callaghaninnovation.govt.nz/grants', '{}', '{saas,healthcare}', '{r-and-d-costs}', 40, 0, 'high', '3-6 months', 'expert', 'low', 'Must be NZ-registered company performing qualifying R&D.', 90, 'NZ')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('india-startup-india', 'Startup India Tax Exemption', 'GOVERNMENT', '100% tax exemption on profits for 3 consecutive years out of first 10 years for DPIIT-recognized startups.', 'https://www.startupindia.gov.in', '{}', '{saas,ecommerce}', '{tax-planning-gaps}', 100, 0, 'medium', '2-4 weeks', 'basic', 'low', 'Must be DPIIT-recognized. Turnover <₹100 crore. Under 10 years old.', 85, 'IN')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('israel-innovation-authority', 'Israel Innovation Authority Grants', 'GOVERNMENT', '20-50% of approved R&D budget. Non-dilutive. Focus on tech innovation.', 'https://innovationisrael.org.il/en', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 100000, 'high', '3-6 months', 'expert', 'low', 'Must be Israeli company. Royalty repayment from future revenues.', 90, 'IL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- DIY TACTICS (25 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('vendor-renegotiation', 'Vendor Contract Renegotiation', 'DIY_TACTIC', 'Most vendors pad pricing 15-30%. A call with competitor quotes reduces costs immediately.', '{vendor-overspend,software-subscription-waste,contract-auto-renewal-trap}', 20, 0, 'low', '1-2 hours per vendor', 'none', 'low', 'Requires confidence. Works best with B2B services, SaaS, insurance, telecom.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('payment-terms-optimization', 'Payment Terms Optimization', 'DIY_TACTIC', 'Negotiate net-60+ with suppliers, offer net-15 discounts to clients. Improves cash flow 30-60 days.', '{cash-flow-timing-gap,payment-collection-gaps,late-payment-losses}', 0, 5000, 'medium', '2-4 weeks', 'basic', 'low', 'Some suppliers won''t agree. 2% discount reduces margin slightly.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('insurance-rate-shopping', 'Annual Insurance Rate Shopping', 'DIY_TACTIC', 'Businesses overpay insurance 15-25% from auto-renewal. Annual comparison takes 2 hours.', '{insurance-overspend,commercial-insurance-overspend}', 20, 0, 'low', '2-3 hours', 'none', 'low', 'Don''t sacrifice coverage quality for price. Use independent broker.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('subscription-audit', 'Monthly Subscription Audit', 'DIY_TACTIC', 'Average business wastes $2,400-$18,000/yr on unused/duplicate subscriptions.', '{software-subscription-waste,duplicate-tool-overspend,unused-license-waste}', 30, 0, 'low', '1-2 hours', 'none', 'low', 'Some subscriptions have cancellation penalties. Check terms first.', 95, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('energy-audit-diy', 'DIY Energy Audit', 'DIY_TACTIC', 'Identify energy waste. Average savings 10-30% on utility bills with simple changes.', '{utility-overspend,energy-cost-inefficiency}', 20, 0, 'low', '2-4 hours', 'none', 'low', 'Bigger savings require capital (HVAC, solar). DIY catches easy wins.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('price-increase-strategy', 'Client Price Increase Strategy', 'DIY_TACTIC', 'Most businesses haven''t raised prices in 2+ years. Structured increase recovers margin, <5% client loss.', '{pricing-below-market,undercharging,revenue-leak,margin-erosion}', 10, 0, 'medium', '1-2 weeks', 'none', 'medium', 'Requires confidence. Data shows <5% churn from reasonable increases.', 95, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('ar-collection-overhaul', 'AR Collection Process Overhaul', 'DIY_TACTIC', 'Systematic follow-up for unpaid invoices reduces average collection by 15-30 days.', '{late-payment-losses,payment-collection-gaps,accounts-receivable-aging}', 25, 0, 'low', '1-2 hours setup', 'none', 'low', 'Requires discipline. Automating with accounting software makes it effortless.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('scope-creep-prevention', 'Scope Creep Prevention Framework', 'DIY_TACTIC', 'Average project loses 10-25% profit to unbilled scope creep. Change order process fixes this.', '{scope-creep-losses,project-profitability-leak,unbilled-work}', 20, 0, 'low', '2-3 hours', 'none', 'low', 'Cultural shift needed. Start with new clients.', 95, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('tax-deduction-checklist', 'Overlooked Tax Deduction Checklist', 'DIY_TACTIC', 'Most small businesses miss $3,000-$15,000 in legitimate deductions every year.', '{tax-planning-gaps,tax-overpayment,missed-deductions}', 0, 5000, 'low', '2-4 hours', 'none', 'low', 'Keep receipts 6+ years. Not tax advice — consult accountant.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('employee-retention-tactics', 'Zero-Cost Employee Retention', 'DIY_TACTIC', 'Replacing an employee costs 50-200% of salary. Free tactics reduce turnover 20-40%.', '{employee-turnover-cost,staffing-inefficiency,training-cost-inefficiency}', 30, 0, 'low', 'Start this week', 'none', 'low', 'Culture change takes 3-12 months. Won''t fix below-market pay.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('menu-engineering', 'Menu Engineering (Restaurants)', 'DIY_TACTIC', 'Redesign menu to promote high-margin items. Increases average check 8-15% at zero cost.', '{food-cost-overrun,menu-pricing-leak,revenue-leak}', 12, 0, 'medium', '4-8 hours', 'none', 'low', 'Requires food cost percentages. Test 2-4 weeks before committing.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('billable-hour-recovery', 'Billable Hour Recovery System', 'DIY_TACTIC', 'Professional firms lose 20-40% billable hours to poor tracking. Recover $15K-$80K/yr.', '{unbilled-work,billable-utilization-gap,time-tracking-leak}', 25, 0, 'low', '1 day', 'none', 'low', 'Cultural shift. Start with partners/seniors to set example.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('inventory-par-levels', 'Inventory Par Level Optimization', 'DIY_TACTIC', 'Set min/max stock levels based on usage data. Reduces waste 15-25% and prevents stockouts.', '{inventory-overspend,materials-waste,stockout-losses}', 15, 0, 'medium', '1-2 weeks', 'basic', 'low', 'Requires historical usage data. Adjust seasonally.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('cross-training-program', 'Employee Cross-Training Program', 'DIY_TACTIC', 'Train employees on multiple roles. Reduces overtime 20%, improves coverage, lowers hiring needs.', '{labor-cost-overspend,staffing-inefficiency,overtime-overspend}', 20, 0, 'medium', '2-4 weeks', 'none', 'low', 'Some pushback from specialists. Start with willing volunteers.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('procurement-consolidation', 'Procurement Consolidation', 'DIY_TACTIC', 'Consolidate 3+ vendors to 1-2 preferred suppliers. Volume discounts of 10-25%.', '{supply-cost-overspend,vendor-overspend}', 15, 0, 'medium', '2-4 weeks', 'none', 'low', 'Don''t sacrifice quality. Maintain backup supplier for critical items.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('meeting-audit', 'Meeting Time Audit', 'DIY_TACTIC', 'Average employee spends 31 hours/month in meetings. Cutting 30% recovers $15K-$40K/yr per manager.', '{team-productivity-leak,administrative-overhead}', 0, 15000, 'low', '1 week', 'none', 'low', 'Requires organizational buy-in. Start with your own calendar.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('freelancer-vs-fte', 'Freelancer vs FTE Cost Analysis', 'DIY_TACTIC', 'For roles under 30hrs/week, freelancers save 30-50% vs full-time with benefits.', '{labor-cost-overspend,hiring-cost-overspend}', 30, 0, 'medium', '2-4 hours', 'none', 'medium', 'Less control, IP considerations, availability risk. Best for project-based work.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('loss-leader-elimination', 'Loss Leader Product Elimination', 'DIY_TACTIC', 'Identify and remove products/services losing money. Focus resources on profitable offerings.', '{low-margin-items,revenue-leak,product-profitability-gap}', 15, 0, 'medium', '4-8 hours', 'basic', 'medium', 'Some loss leaders drive other sales. Analyze full customer journey.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('warranty-claim-recovery', 'Warranty and Claim Recovery', 'DIY_TACTIC', 'Systematically file warranty claims and vendor claims for defective goods. Average recovery: $2,000-$10,000/yr.', '{materials-waste,vendor-overspend}', 0, 5000, 'low', '2-4 hours', 'none', 'low', 'Requires organized records of purchases and defects.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('utility-rate-switch', 'Utility Provider Rate Comparison', 'DIY_TACTIC', 'In deregulated markets, comparing electricity/gas providers saves 10-30%.', '{utility-overspend,energy-cost-inefficiency}', 15, 0, 'low', '1-2 hours', 'none', 'low', 'Only in deregulated markets (Alberta, Ontario, Texas, UK, Australia).', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('referral-program-diy', 'DIY Referral Program', 'DIY_TACTIC', 'Offer existing clients a reward for referrals. Costs 80% less than traditional marketing per acquisition.', '{marketing-spend-inefficiency,lead-conversion-gap,client-acquisition-overspend}', 0, 3000, 'low', '2-4 hours', 'none', 'low', 'Requires asking. Most businesses never formally ask for referrals.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('credit-card-optimization', 'Business Credit Card Optimization', 'DIY_TACTIC', 'Switch to cards with 2-5% cashback on top spending categories. Free money on existing spend.', '{bank-fee-overspend,transaction-fee-leak}', 3, 0, 'low', '1-2 hours', 'none', 'low', 'Pay in full monthly. Interest eliminates benefits.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('preventive-maintenance', 'Preventive Maintenance Schedule', 'DIY_TACTIC', 'Planned maintenance costs 3-5x less than emergency repairs. Creates predictable budget.', '{equipment-cost-overspend,maintenance-overspend,emergency-repair-costs}', 0, 5000, 'medium', '1-2 weeks', 'basic', 'low', 'Requires discipline. Track everything. Calendar reminders.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('late-fee-enforcement', 'Late Payment Fee Enforcement', 'DIY_TACTIC', 'Adding and enforcing 1.5-2% monthly late fees reduces DSO by 10-20 days.', '{late-payment-losses,cash-flow-timing-gap}', 0, 3000, 'low', '1 hour', 'none', 'low', 'Must be in contract. Enforce consistently or don''t bother.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('batch-processing', 'Batch Processing Workflows', 'DIY_TACTIC', 'Group similar tasks instead of context-switching. Increases output 20-40% with same effort.', '{process-inefficiency,team-productivity-leak}', 25, 0, 'low', '1 day trial', 'none', 'low', 'Requires planning. Some tasks need immediate response.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- RATE COMPARISONS (8 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('interchange-plus', 'Switch to Interchange-Plus Processing', 'RATE_COMPARISON', 'Flat-rate (2.6-2.9%) to interchange-plus saves 0.3-0.8%. Thousands per year on $500K+ volume.', '{payment-processing-overspend,transaction-fee-leak}', 25, 0, 'low', '1-2 weeks', 'none', 'low', 'Better for >$10K/month processing. Variable monthly costs.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('bank-optimization', 'Business Bank Account Optimization', 'RATE_COMPARISON', 'Many pay $25-75/mo in fees unnecessarily. Digital banks offer $0 accounts.', '{bank-fee-overspend,transaction-fee-leak}', 50, 0, 'low', '1-2 weeks', 'none', 'low', 'Digital banks may not offer loans. Keep traditional for lending relationship.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('lease-renegotiation', 'Commercial Lease Renegotiation', 'RATE_COMPARISON', 'Vacancy rates 12-18% give tenants leverage. Approach 6-12 months before renewal.', '{rent-overspend,occupancy-cost-leak}', 10, 0, 'medium', '1-3 months', 'basic', 'medium', 'Works best in high-vacancy markets. Use commercial tenant rep broker.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('bulk-supply-negotiation', 'Bulk Supply Cost Reduction', 'RATE_COMPARISON', 'Consolidate suppliers and buy in bulk. 10-25% savings on materials.', '{supply-cost-overspend,vendor-overspend,food-cost-overrun}', 15, 0, 'medium', '2-4 weeks', 'none', 'low', 'Ties up capital. Careful with perishables.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('shipping-rate-negotiation', 'Shipping Rate Negotiation', 'RATE_COMPARISON', 'Compare UPS/FedEx/USPS/regional. Multi-carrier strategies save 15-30%.', '{shipping-cost-overspend,logistics-inefficiency}', 20, 0, 'low', '2-4 hours', 'none', 'low', 'Volume-dependent. Negotiate annual contracts.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('telecom-bundle-optimization', 'Telecom & Internet Rate Shopping', 'RATE_COMPARISON', 'Business internet/phone often 30-50% overpriced. Annual comparison saves $1,200-$6,000/yr.', '{telecom-overspend,communication-tool-overspend}', 30, 0, 'low', '1-2 hours', 'none', 'low', 'Watch contract terms. Early termination fees may apply.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('group-buying-coop', 'Group Buying Cooperative', 'RATE_COMPARISON', 'Join industry buying group for 15-30% savings on supplies, insurance, benefits.', '{supply-cost-overspend,insurance-overspend}', 20, 0, 'medium', '2-4 weeks', 'none', 'low', 'Must find relevant group. Less product choice flexibility.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('merchant-account-audit', 'Merchant Account Fee Audit', 'RATE_COMPARISON', 'Hidden fees (PCI non-compliance, batch, monthly minimum) add 0.5-1.5% extra. Audit finds them.', '{payment-processing-overspend,transaction-fee-leak}', 0, 2000, 'low', '1-2 hours', 'none', 'low', 'Request detailed statement from processor. Compare line by line.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- TEMPLATES (8 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('free-contracts', 'Free Business Contract Templates', 'TEMPLATE', 'Lawyer-reviewed templates save $500-2K per contract in legal fees.', '{legal-cost-overspend,contract-gaps}', 60, 0, 'low', '1-2 hours', 'none', 'medium', 'Templates are starting points. Get first version lawyer-reviewed.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('sop-templates', 'Standard Operating Procedure Templates', 'TEMPLATE', 'Document top 10 processes. Reduces training time 40%, prevents mistakes.', '{training-cost-inefficiency,quality-control-failures,process-inefficiency}', 0, 3000, 'medium', '1-2 weeks', 'none', 'low', 'Living documents. Biggest ROI in high-turnover businesses.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('financial-model-templates', 'Free Financial Model Templates', 'TEMPLATE', 'Cash flow, break-even, P&L forecast templates from BDC/SCORE/SBA.', '{financial-planning-gaps,cash-flow-timing-gap}', 0, 3000, 'medium', '4-8 hours', 'basic', 'low', 'Templates give structure, not strategy. Consult professional for complex scenarios.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('employee-handbook-template', 'Free Employee Handbook Template', 'TEMPLATE', 'Pre-built handbook templates covering policies, benefits, conduct, compliance.', '{hr-software-overspend,compliance-risk,employee-turnover-cost}', 0, 2000, 'medium', '1-2 days', 'none', 'medium', 'Must be reviewed for local labour law compliance.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('business-plan-template', 'Free Business Plan Templates', 'TEMPLATE', 'SBA, BDC, and SCORE offer comprehensive business plan templates for free.', '{financial-planning-gaps}', 0, 1500, 'medium', '2-4 days', 'none', 'low', 'Good for structure. Customize extensively for your specific business.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('proposal-templates', 'Client Proposal Templates', 'TEMPLATE', 'Professional proposal templates replacing paid tools like PandaDoc/Proposify.', '{client-acquisition-overspend,administrative-overhead}', 0, 1200, 'low', '2-4 hours', 'none', 'low', 'Google Docs/Canva have great free proposal templates.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('invoice-templates', 'Professional Invoice Templates', 'TEMPLATE', 'Free invoice templates from Wave, Canva, Google Sheets with auto-calculations.', '{invoice-delays,administrative-overhead}', 0, 500, 'low', '30 minutes', 'none', 'low', 'For very small operations. Consider free invoicing app for automation.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('marketing-plan-template', 'Free Marketing Plan Templates', 'TEMPLATE', 'HubSpot, CoSchedule offer free marketing plan templates with calendars.', '{marketing-spend-inefficiency}', 0, 1000, 'low', '2-4 hours', 'none', 'low', 'Good starting framework. Customize for your industry.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- BUILT-IN FEATURES (10 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('quickbooks-hidden', 'QuickBooks Features You''re Not Using', 'BUILT_IN', 'Auto-invoicing, bank rules, receipt capture, project tracking, late fee automation.', '{bookkeeping-inefficiency,invoice-delays,project-profitability-leak}', 0, 2000, 'low', '1-2 hours', 'basic', 'low', 'Features vary by tier. Projects requires Plus ($80/mo)+.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('google-workspace-hidden', 'Google Workspace Hidden Features', 'BUILT_IN', 'Shared drives, Forms automation, Google Sites, Apps Script, approval workflows.', '{collaboration-tool-overspend,software-subscription-waste}', 0, 1500, 'low', '2-3 hours', 'basic', 'low', 'Apps Script needs some coding. Google Sites is basic.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('excel-automation', 'Excel/Sheets Power Features', 'BUILT_IN', 'Pivot tables, VLOOKUP, conditional formatting, data validation replace many paid tools.', '{analytics-tool-overspend,software-subscription-waste}', 0, 2000, 'low', '2-4 hours', 'basic', 'low', 'Breaks at >10K rows or multiple simultaneous editors.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('outlook-rules', 'Outlook/Gmail Rules & Filters', 'BUILT_IN', 'Auto-sort, auto-respond, auto-forward replaces paid email management tools.', '{email-marketing-overspend,administrative-overhead}', 0, 500, 'low', '30 minutes', 'none', 'low', 'Basic compared to dedicated email tools. Good for simple workflows.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('zoom-free-features', 'Zoom Features You''re Not Using', 'BUILT_IN', 'Polls, breakout rooms, whiteboard, recording, waiting room, virtual background.', '{video-conferencing-overspend}', 0, 500, 'low', '30 minutes', 'none', 'low', 'Some features require paid plan. Check your current tier.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('shopify-builtin', 'Shopify Built-in Features', 'BUILT_IN', 'Abandoned cart recovery, discount codes, analytics, SEO tools, email marketing already included.', '{ecommerce-platform-overspend,marketing-spend-inefficiency}', 0, 1500, 'low', '1-2 hours', 'none', 'low', 'Many merchants buy apps that duplicate existing features.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('stripe-dashboard', 'Stripe Dashboard Analytics', 'BUILT_IN', 'Revenue analytics, customer insights, subscription metrics, fraud tools built into Stripe.', '{analytics-tool-overspend,payment-processing-overspend}', 0, 1000, 'low', '30 minutes', 'none', 'low', 'Often overlooked. Replaces basic BI tools for payment data.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('slack-workflow-builder', 'Slack Workflow Builder', 'BUILT_IN', 'Automate onboarding, approvals, standup reports without leaving Slack. No code.', '{automation-tool-overspend,administrative-overhead}', 0, 1000, 'low', '1 hour', 'none', 'low', 'Workflow Builder requires Slack paid plan.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('microsoft365-power-automate', 'Power Automate (Microsoft 365)', 'BUILT_IN', 'Included in M365 Business. Automate workflows between 500+ services.', '{automation-tool-overspend,manual-process-waste}', 0, 2000, 'medium', '2-4 hours', 'basic', 'low', 'Requires M365 Business Premium. Learning curve for complex flows.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wordpress-built-in-seo', 'WordPress Built-in SEO', 'BUILT_IN', 'WordPress has built-in sitemaps, meta tags, clean URLs, RSS feeds without paid plugins.', '{seo-tool-overspend,marketing-spend-inefficiency}', 0, 500, 'low', '1 hour', 'basic', 'low', 'Yoast/RankMath add value but WordPress basics cover 70% of SEO needs.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- SMART MATCHING FUNCTIONS (same as v8)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_free_alternatives(
  p_leak_type TEXT, p_industry TEXT DEFAULT NULL, p_region TEXT DEFAULT 'ALL',
  p_business_size INT DEFAULT 10, p_limit INT DEFAULT 10
) RETURNS TABLE (
  id TEXT, name TEXT, slug TEXT, type TEXT, description TEXT, detailed_steps TEXT,
  url TEXT, estimated_savings_pct FLOAT, estimated_savings_flat FLOAT,
  effort_level TEXT, time_to_implement TEXT, skill_required TEXT, risk_level TEXT,
  limitations TEXT, quality_vs_paid INT, relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT fa.id, fa.name, fa.slug, fa.type, fa.description, fa.detailed_steps, fa.url,
    fa.estimated_savings_pct, fa.estimated_savings_flat, fa.effort_level, fa.time_to_implement,
    fa.skill_required, fa.risk_level, fa.limitations, fa.quality_vs_paid,
    (CASE WHEN p_leak_type = ANY(fa.leak_types) THEN 40 ELSE 0 END +
     CASE WHEN array_length(fa.industries,1) IS NULL OR array_length(fa.industries,1)=0 THEN 10
          WHEN p_industry = ANY(fa.industries) THEN 20 ELSE 0 END +
     CASE WHEN fa.region='ALL' THEN 10 WHEN fa.region=p_region THEN 20
          WHEN p_region LIKE fa.region||'%' THEN 15 ELSE 0 END +
     fa.quality_vs_paid * 0.2 +
     CASE fa.effort_level WHEN 'low' THEN 15 WHEN 'medium' THEN 10 WHEN 'high' THEN 5 ELSE 0 END +
     CASE WHEN p_business_size BETWEEN fa.business_size_min AND fa.business_size_max THEN 10 ELSE 0 END
    )::FLOAT AS relevance_score
  FROM free_alternatives fa
  WHERE fa.active = true
    AND (p_leak_type = ANY(fa.leak_types) OR array_length(fa.leak_types,1) IS NULL)
    AND (fa.region='ALL' OR fa.region=p_region OR p_region LIKE fa.region||'%')
    AND p_business_size BETWEEN fa.business_size_min AND fa.business_size_max
  ORDER BY relevance_score DESC, fa.quality_vs_paid DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_partner_alternatives(p_partner_slug TEXT, p_limit INT DEFAULT 5)
RETURNS TABLE (alt_id TEXT, alt_name TEXT, alt_slug TEXT, alt_type TEXT,
  alt_description TEXT, relationship TEXT, comparison_notes TEXT, quality_vs_paid INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT fa.id, fa.name, fa.slug, fa.type, fa.description, p.relationship,
    p.comparison_notes, fa.quality_vs_paid
  FROM free_alt_partner_pairings p
  JOIN free_alternatives fa ON fa.id = p.free_alt_id
  WHERE p.partner_slug = p_partner_slug AND fa.active = true
  ORDER BY CASE p.relationship WHEN 'free_alternative' THEN 1 WHEN 'stepping_stone' THEN 2
    WHEN 'complement' THEN 3 WHEN 'fallback' THEN 4 END
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT '═══ FREE ALTERNATIVES MEGA DATABASE ═══' AS header;
SELECT type, COUNT(*) AS count FROM free_alternatives WHERE active=true GROUP BY type ORDER BY count DESC;
SELECT 'TOTAL' AS type, COUNT(*) AS count FROM free_alternatives WHERE active=true;
SELECT region, COUNT(*) AS count FROM free_alternatives WHERE active=true AND region != 'ALL' GROUP BY region ORDER BY count DESC;

-- === 041-v8-deep-dig-partners.sql ===
-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — DEEP DIG: MORE AFFILIATE PARTNERS (v8-deep-dig)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run AFTER v8-mega-new-partners.sql and v8-expansion-new-partners.sql
-- Adds 40 more partners — industry-specific + niche categories
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('lightspeed-restaurant', 'Lightspeed Restaurant', 'Restaurant POS and management. Partner referral program.', 'https://www.lightspeedhq.com/partners', 'Restaurant POS', 'flat', 200, 0, '{restaurant}', 'https://www.lightspeedhq.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('7shifts', '7shifts', 'Restaurant scheduling and team management. $50 per referral.', 'https://www.7shifts.com/partners', 'Restaurant HR', 'flat', 50, 0, '{restaurant}', 'https://www.7shifts.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('marketman', 'MarketMan', 'Restaurant inventory and food cost management. Partner program.', 'https://www.marketman.com/partners', 'Restaurant Inventory', 'flat', 100, 0, '{restaurant}', 'https://www.marketman.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('procore', 'Procore', 'Construction project management. Referral program with bonuses.', 'https://www.procore.com/referral', 'Construction PM', 'flat', 500, 0, '{construction}', 'https://www.procore.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('housecall-pro', 'Housecall Pro', 'Field service management. 30% recurring commission.', 'https://www.housecallpro.com/partners', 'Field Service', 'percentage', 30, 0, '{construction}', 'https://www.housecallpro.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('servicetitan', 'ServiceTitan', 'Home services management. Referral program for contractors.', 'https://www.servicetitan.com/partners', 'Field Service', 'flat', 300, 0, '{construction}', 'https://www.servicetitan.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('jane-app', 'Jane App', 'Practice management for health/wellness. Referral credits.', 'https://jane.app/referral', 'Healthcare PM', 'flat', 75, 0, '{healthcare}', 'https://jane.app', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('drchrono', 'DrChrono', 'EHR and practice management. Partner referral program.', 'https://www.drchrono.com/partner-program', 'Healthcare EHR', 'flat', 200, 0, '{healthcare}', 'https://www.drchrono.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('practice-better', 'Practice Better', 'Practice management for nutrition/wellness. 20% recurring commission.', 'https://www.practicebetter.io/affiliate', 'Healthcare PM', 'percentage', 20, 0, '{healthcare}', 'https://www.practicebetter.io', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('follow-up-boss', 'Follow Up Boss', 'Real estate CRM. 20% commission for 12 months.', 'https://www.followupboss.com/partners', 'Real Estate CRM', 'percentage', 20, 12, '{real-estate}', 'https://www.followupboss.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('kvcore', 'kvCORE', 'Real estate platform. Partner referral program.', 'https://www.insiderealestate.com/partners', 'Real Estate', 'flat', 200, 0, '{real-estate}', 'https://www.insiderealestate.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('gorgias', 'Gorgias', 'E-commerce helpdesk. 20% recurring commission.', 'https://www.gorgias.com/partners/affiliate', 'E-commerce Support', 'percentage', 20, 0, '{ecommerce}', 'https://www.gorgias.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('recharge', 'ReCharge', 'Subscription management for e-commerce. Partner program.', 'https://rechargepayments.com/partners', 'E-commerce', 'flat', 100, 0, '{ecommerce}', 'https://rechargepayments.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('privy', 'Privy', 'E-commerce email marketing. 20% recurring commission.', 'https://www.privy.com/partners', 'E-commerce Marketing', 'percentage', 20, 0, '{ecommerce}', 'https://www.privy.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('smile-io', 'Smile.io', 'Loyalty and rewards for e-commerce. 20% recurring commission.', 'https://smile.io/partners', 'E-commerce Loyalty', 'percentage', 20, 0, '{ecommerce}', 'https://smile.io', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('yotpo', 'Yotpo', 'E-commerce reviews, loyalty, SMS. Partner program.', 'https://www.yotpo.com/partners', 'E-commerce Reviews', 'flat', 150, 0, '{ecommerce}', 'https://www.yotpo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('leadpages', 'Leadpages', 'Landing pages and conversions. Up to 50% recurring commission.', 'https://www.leadpages.com/partners', 'Landing Pages', 'percentage', 50, 0, '{agency,ecommerce}', 'https://www.leadpages.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('clickfunnels', 'ClickFunnels', 'Sales funnels. 30% recurring commission. Up to 40% for top affiliates.', 'https://www.clickfunnels.com/affiliates', 'Sales Funnels', 'percentage', 30, 0, '{agency,ecommerce}', 'https://www.clickfunnels.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('unbounce', 'Unbounce', 'Landing page builder. 20% recurring commission.', 'https://unbounce.com/partner-program', 'Landing Pages', 'percentage', 20, 0, '{agency}', 'https://unbounce.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('demio', 'Demio', 'Webinar platform. 30% lifetime recurring commission.', 'https://demio.com/affiliate', 'Webinars', 'percentage', 30, 0, '{consulting}', 'https://demio.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('systeme-io', 'Systeme.io', 'All-in-one marketing platform. 60% lifetime recurring commission.', 'https://systeme.io/affiliate-program', 'Marketing Platform', 'percentage', 60, 0, '{}', 'https://systeme.io', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('waveapps', 'Wave Financial', 'Free accounting + paid payroll/payments. Referral bonuses.', 'https://www.waveapps.com/partners', 'Accounting', 'flat', 50, 0, '{}', 'https://www.waveapps.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('expensify', 'Expensify', 'Expense management. Referral program with monthly credits.', 'https://www.expensify.com/referral', 'Expense Management', 'flat', 100, 0, '{}', 'https://www.expensify.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('ramp', 'Ramp', 'Corporate card and expense management. $500 per qualified referral.', 'https://ramp.com/partners', 'Expense Management', 'flat', 500, 0, '{saas}', 'https://ramp.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('mercury', 'Mercury', 'Banking for startups. $500 per qualified referral.', 'https://mercury.com/partner', 'Banking', 'flat', 500, 0, '{saas}', 'https://mercury.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('relay-financial', 'Relay Financial', 'No-fee business banking. $100 per funded account.', 'https://relayfi.com/referral', 'Banking', 'flat', 100, 0, '{}', 'https://relayfi.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('zapier', 'Zapier', 'Workflow automation. Referral program.', 'https://zapier.com/platform/partner-program', 'Automation', 'percentage', 20, 12, '{}', 'https://zapier.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('make-integromat', 'Make (Integromat)', 'Visual automation platform. 20% recurring commission.', 'https://www.make.com/en/affiliate-program', 'Automation', 'percentage', 20, 0, '{agency,saas}', 'https://www.make.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('gusto-payroll', 'Gusto Payroll', 'Full-service payroll. $300-$600 per referral.', 'https://gusto.com/partners', 'Payroll', 'flat', 500, 0, '{}', 'https://gusto.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('comply-advantage', 'ComplyAdvantage', 'AML and fraud detection. Partner program.', 'https://complyadvantage.com/partners', 'Compliance', 'flat', 200, 0, '{saas}', 'https://complyadvantage.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('hostinger', 'Hostinger', 'Budget web hosting. Up to 60% commission.', 'https://www.hostinger.com/affiliates', 'Hosting', 'percentage', 60, 0, '{}', 'https://www.hostinger.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('a2-hosting', 'A2 Hosting', 'Fast web hosting. $55-$125 per sale.', 'https://www.a2hosting.com/affiliates', 'Hosting', 'flat', 85, 0, '{}', 'https://www.a2hosting.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('linode-akamai', 'Linode (Akamai)', 'Cloud computing. $100 per qualified referral.', 'https://www.linode.com/referral-program', 'Cloud Hosting', 'flat', 100, 0, '{saas}', 'https://www.linode.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('podia', 'Podia', 'Online course and digital product platform. 30% recurring commission.', 'https://www.podia.com/affiliates', 'E-learning', 'percentage', 30, 0, '{consulting}', 'https://www.podia.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('kajabi', 'Kajabi', 'Course and membership platform. 30% recurring commission.', 'https://kajabi.com/partners', 'E-learning', 'percentage', 30, 0, '{consulting}', 'https://kajabi.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('elementor', 'Elementor', 'WordPress page builder. 50% commission per sale.', 'https://elementor.com/affiliates', 'Website Builder', 'percentage', 50, 0, '{agency}', 'https://elementor.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('canva-pro', 'Canva Pro', 'Design platform. Affiliate program with commissions.', 'https://www.canva.com/affiliates', 'Design', 'flat', 36, 0, '{}', 'https://www.canva.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('tailwind-app', 'Tailwind', 'Pinterest and Instagram scheduling. 25% recurring commission.', 'https://www.tailwindapp.com/affiliates', 'Social Media', 'percentage', 25, 0, '{ecommerce}', 'https://www.tailwindapp.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('protonvpn', 'Proton VPN Business', 'Privacy-focused VPN and email. 20% recurring commission.', 'https://proton.me/partners', 'Privacy/Security', 'percentage', 20, 0, '{}', 'https://protonvpn.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('tunnelbear', 'TunnelBear Business', 'Simple VPN for teams. Partner program.', 'https://www.tunnelbear.com/partners', 'Security', 'flat', 50, 0, '{}', 'https://www.tunnelbear.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT '═══ DEEP DIG PARTNERS ═══' AS header;
SELECT category, COUNT(*) AS count FROM affiliate_partners WHERE active=true GROUP BY category ORDER BY count DESC;
SELECT 'TOTAL PARTNERS' AS metric, COUNT(*) AS value FROM affiliate_partners WHERE active=true;

-- === 042-v8-deep-dig-free-alt.sql ===
-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — DEEP DIG: MORE FREE ALTERNATIVES (v8-deep-dig)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run AFTER v8-mega-free-alternatives.sql and v8-expansion-free-alternatives.sql
-- Adds industry-specific tools, more countries, advanced tactics
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDUSTRY-SPECIFIC FREE TOOLS (20 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('qloapps', 'QloApps (Hotel PMS)', 'FREE_TOOL', 'Free open-source hotel management. Property management, booking engine, website, POS.', 'https://qloapps.com', '{Cloudbeds,Opera PMS,Mews}', '{restaurant}', '{pms-software-overspend,booking-commission-leak,technology-overspend}', 100, 0, 'high', '1-2 weeks', 'technical', 'medium', 'Self-hosted. Active community. Add-ons for channel manager. Setup complexity.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('hoteldruid', 'HotelDruid', 'FREE_TOOL', 'Free hotel booking software. Multi-property, POS for restaurants, availability calendar.', 'https://www.hoteldruid.com', '{Cloudbeds,Little Hotelier}', '{restaurant}', '{pms-software-overspend,booking-commission-leak}', 100, 0, 'medium', '1 week', 'basic', 'low', 'Multi-language (EN/IT/ES). Simple UI. Channel manager is paid add-on.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('kwhotel', 'KWHotel (Free Edition)', 'FREE_TOOL', 'Free hotel management for small properties. Room management, bookings, invoicing.', 'https://www.kwhotel.com', '{Little Hotelier,Guesty}', '{restaurant}', '{pms-software-overspend}', 100, 0, 'low', '2-4 hours', 'none', 'low', 'Free version limited to one property. Windows-only. Clean interface.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('openemr', 'OpenEMR', 'FREE_TOOL', 'Free open-source EHR and medical practice management. HIPAA compliant. 30K+ installations.', 'https://www.open-emr.org', '{Epic,Athenahealth,eClinicalWorks}', '{healthcare}', '{ehr-software-overspend,technology-overspend,compliance-risk}', 100, 0, 'high', '2-4 weeks', 'technical', 'medium', 'Complex setup. Active community. HIPAA-ready. Used globally.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('open-hospital', 'Open Hospital', 'FREE_TOOL', 'Free hospital information system. Registration, appointments, medical records, pharmacy.', 'https://www.open-hospital.org', '{Epic,Cerner}', '{healthcare}', '{ehr-software-overspend,technology-overspend}', 100, 0, 'high', '2-4 weeks', 'expert', 'medium', 'Java-based. Best for hospitals in developing regions. WHO-aligned.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('gnu-health', 'GNU Health', 'FREE_TOOL', 'Free health & hospital management. Social medicine, demographics, epidemiology.', 'https://www.gnuhealth.org', '{Epic,Athenahealth}', '{healthcare}', '{ehr-software-overspend}', 100, 0, 'high', '2-4 weeks', 'expert', 'high', 'UN and WHO endorsed. Complex but powerful. Best for public health.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('casefox-free', 'CaseFox (Free Plan)', 'FREE_TOOL', 'Free legal case management. 2 users, 4 cases. Time tracking, billing, documents.', 'https://www.casefox.com', '{Clio,PracticePanther}', '{law-firm}', '{case-management-overspend,billable-hour-leakage}', 100, 0, 'low', '1-2 hours', 'none', 'low', 'Very limited free tier. Good for solo practitioners starting out.', 55, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mylegalnet', 'MyLegalNet', 'FREE_TOOL', 'Open-source case management. Cases, documents, invoices, expenses, appointments.', 'https://github.com/topics/legal-case-management', '{Clio,MyCase}', '{law-firm}', '{case-management-overspend}', 100, 0, 'medium', '4-8 hours', 'technical', 'medium', 'Open-source but less polished. Good starting point for customization.', 50, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('openproject-bim', 'OpenProject BIM Edition', 'FREE_TOOL', 'Free open-source BIM project management. IFC model viewer, Gantt charts, agile boards.', 'https://www.openproject.org/bim-project-management', '{Procore,PlanGrid,Autodesk BIM 360}', '{construction}', '{project-management-overspend,technology-overspend}', 100, 0, 'medium', '1 week', 'basic', 'low', 'Self-hosted free. Cloud paid. BIM features unique in open-source.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('floreant-pos', 'Floreant POS', 'FREE_TOOL', 'Free open-source restaurant POS. Kitchen display, table management, split checks.', 'https://floreant.org', '{Toast,Square for Restaurants}', '{restaurant}', '{pos-system-overspend,technology-overspend}', 100, 0, 'medium', '4-8 hours', 'basic', 'low', 'Java-based. Desktop application. No cloud features.', 55, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('sambapos', 'SambaPOS', 'FREE_TOOL', 'Free open-source POS for restaurants and bars. Modular, customizable workflows.', 'https://sambapos.com', '{Toast,Lightspeed Restaurant}', '{restaurant}', '{pos-system-overspend}', 100, 0, 'medium', '4-8 hours', 'basic', 'low', 'Windows only. Very customizable but steeper learning curve.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('moodle', 'Moodle', 'FREE_TOOL', 'Free open-source LMS. Create courses, quizzes, certificates. Used by 300K+ sites worldwide.', 'https://moodle.org', '{Teachable,Thinkific,TalentLMS}', '{consulting,healthcare}', '{training-cost-inefficiency,lms-overspend}', 100, 0, 'medium', '1-2 weeks', 'basic', 'low', 'Self-hosted free. MoodleCloud has free tier. Hugely flexible.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('canvas-lms', 'Canvas LMS (Free for Teachers)', 'FREE_TOOL', 'Open-source LMS by Instructure. Free for individual teachers. Clean modern UI.', 'https://www.instructure.com/canvas', '{Thinkific,TalentLMS}', '{consulting}', '{training-cost-inefficiency}', 100, 0, 'medium', '1 week', 'basic', 'low', 'Free for individual teachers. Institutional use requires license.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('shippo-free', 'Shippo (Free Tier)', 'FREE_TOOL', 'Free shipping rates comparison. Pay per label. Compare USPS, UPS, FedEx, DHL.', 'https://goshippo.com', '{ShipStation,Easyship}', '{ecommerce}', '{shipping-cost-overspend}', 0, 500, 'low', '30 minutes', 'none', 'low', 'Free: no monthly fee. Pay per label at discounted rates.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('formbricks', 'Formbricks', 'FREE_TOOL', 'Open-source survey and forms platform. In-app surveys, website surveys, link surveys.', 'https://formbricks.com', '{SurveyMonkey,Typeform}', '{saas,ecommerce}', '{survey-tool-overspend}', 100, 0, 'low', '1-2 hours', 'basic', 'low', 'Self-hosted free with no limits. Cloud: generous free tier.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('heyform', 'HeyForm', 'FREE_TOOL', 'Open-source form builder. Conversational forms. Clean modern UI.', 'https://heyform.net', '{Typeform,JotForm}', '{}', '{survey-tool-overspend}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Self-hosted free. Cloud: free with basic features.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('penpot', 'Penpot', 'FREE_TOOL', 'Free open-source design platform. Figma alternative. Prototyping, components, collaboration.', 'https://penpot.app', '{Figma,Sketch,Adobe XD}', '{agency}', '{design-costs-overspend,design-tool-overspend}', 100, 0, 'low', '2-4 hours', 'basic', 'low', 'Self-hosted or cloud free. SVG-based. Growing fast. Not yet feature-parity with Figma.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('blender', 'Blender', 'FREE_TOOL', 'Free open-source 3D creation. Modeling, animation, rendering, video editing, compositing.', 'https://www.blender.org', '{Maya,Cinema 4D,3ds Max}', '{agency}', '{design-costs-overspend}', 100, 0, 'high', '2-4 weeks', 'expert', 'low', 'Industry-standard quality. Steep learning curve. Used by Netflix, Amazon.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('wazuh', 'Wazuh', 'FREE_TOOL', 'Free open-source security monitoring. SIEM, XDR, vulnerability detection, compliance.', 'https://wazuh.com', '{CrowdStrike,SentinelOne,Splunk}', '{saas}', '{cybersecurity-overspend,compliance-risk}', 100, 0, 'high', '1-2 weeks', 'expert', 'low', 'Enterprise-grade. Complex setup. Requires dedicated resources.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('crowdsec', 'CrowdSec', 'FREE_TOOL', 'Free open-source collaborative security. Behavior-based intrusion detection.', 'https://www.crowdsec.net', '{Cloudflare Enterprise,Akamai}', '{saas,ecommerce}', '{cybersecurity-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Community-powered IP reputation. Lightweight. Easy to deploy.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- GOVERNMENT PROGRAMS — MORE COUNTRIES (20 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('estonia-e-residency', 'Estonia e-Residency', 'GOVERNMENT', 'Digital identity for non-Estonians. Run EU business remotely. €100-120 one-time fee. Access EU grants.', 'https://www.e-resident.gov.ee', '{}', '{saas}', '{market-expansion-gap,incorporation-overspend}', 0, 5000, 'medium', '2-4 weeks', 'basic', 'low', '€100 one-time. No physical presence needed. Access to Estonian banking and EU market.', 85, 'EE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('estonia-enterprise', 'Enterprise Estonia Grants', 'GOVERNMENT', 'Innovation, export, and digitalization grants for Estonian-registered companies. Up to €500K.', 'https://www.eas.ee', '{}', '{saas}', '{r-and-d-costs,market-expansion-gap}', 0, 100000, 'high', '3-6 months', 'expert', 'medium', 'Must have business substance in Estonia. E-resident companies eligible with real ties.', 90, 'EE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('estonia-startup-visa', 'Estonia Startup Visa', 'GOVERNMENT', '12-month visa for non-EU founders. Path to 5-year residence. 0% tax on reinvested profits.', 'https://startupestonia.ee', '{}', '{saas}', '{incorporation-overspend,tax-planning-gaps}', 0, 10000, 'high', '2-3 months', 'basic', 'medium', 'Must be tech-driven, scalable startup. Startup Committee approval required.', 85, 'EE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('portugal-startup-visa', 'Portugal Startup Visa', 'GOVERNMENT', 'Residency for non-EU entrepreneurs. Incubator partnership required. Path to EU residency.', 'https://startupportugal.com/startup-visa', '{}', '{saas}', '{market-expansion-gap}', 0, 5000, 'high', '3-6 months', 'basic', 'medium', 'Must be accepted by a certified Portuguese incubator.', 80, 'PT')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('portugal-sifide', 'SIFIDE R&D Tax Credit (Portugal)', 'GOVERNMENT', 'Up to 82.5% tax credit on R&D expenditures. One of highest in EU.', 'https://www.ani.pt/en/financing/tax-incentives/sifide', '{}', '{saas}', '{r-and-d-costs,tax-planning-gaps}', 47, 0, 'high', '2-4 months', 'expert', 'low', 'Portuguese company. Must register R&D activities with ANI.', 90, 'PT')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('poland-feng-smart', 'FENG Smart Path (Poland)', 'GOVERNMENT', 'EU-funded innovation grants for Polish SMEs. R&D, implementation, digitization.', 'https://www.parp.gov.pl', '{}', '{saas}', '{r-and-d-costs,technology-overspend}', 0, 200000, 'high', '3-6 months', 'expert', 'medium', 'Polish-registered. National-scale innovation required. Competitive.', 85, 'PL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('poland-digit-sme', 'DIG.IT Polish SME Digitization', 'GOVERNMENT', 'Digital transformation grants for Polish SMEs. AI, cybersecurity, e-commerce, automation.', 'https://www.parp.gov.pl', '{}', '{}', '{technology-overspend,digital-transformation-gap}', 0, 50000, 'medium', '2-4 months', 'basic', 'low', 'Polish SME. Focus on digital technologies adoption.', 85, 'PL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('czech-tacr', 'TA CR Innovation Funding (Czech Republic)', 'GOVERNMENT', 'Up to 80% grant for SME R&D. Through Technology Agency of the Czech Republic.', 'https://www.tacr.cz', '{}', '{saas}', '{r-and-d-costs}', 80, 0, 'high', '3-6 months', 'expert', 'medium', 'Czech-registered. Applied research only. SIGMA programme sub-objective 4.', 85, 'CZ')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('taiwan-sbir', 'Taiwan SBIR Program', 'GOVERNMENT', 'NT$1M-10M (~$30K-$300K) for innovative SME R&D. Phase I/II structure like US SBIR.', 'https://www.sbir.org.tw', '{}', '{saas}', '{r-and-d-costs}', 0, 150000, 'high', '3-6 months', 'expert', 'high', 'Taiwanese company. Technical review. Phase structure: feasibility → development.', 85, 'TW')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('taiwan-siir', 'Taiwan SIIR Service Innovation', 'GOVERNMENT', 'Grants for service industry innovation. Up to NT$10M (~$300K).', 'https://www.moea.gov.tw', '{}', '{consulting,healthcare}', '{r-and-d-costs,innovation-investment-gap}', 0, 150000, 'high', '3-6 months', 'expert', 'high', 'Taiwanese company. Service sector focus.', 80, 'TW')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('colombia-innpulsa', 'iNNpulsa Colombia', 'GOVERNMENT', 'Government innovation and entrepreneurship agency. Various grants, acceleration programs.', 'https://www.innpulsa.gov.co', '{}', '{saas}', '{r-and-d-costs,market-expansion-gap}', 0, 50000, 'high', '2-4 months', 'basic', 'medium', 'Colombian company. Various programs by sector and stage.', 80, 'CO')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('chile-startup-chile', 'Start-Up Chile', 'GOVERNMENT', 'Equity-free funding: up to $80K USD for international startups. Must relocate to Chile.', 'https://www.startupchile.org', '{}', '{saas}', '{capital-expenditure-leak}', 0, 80000, 'high', '3-6 months', 'basic', 'medium', 'Must relocate to Chile for program duration. Highly competitive.', 90, 'CL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('nigeria-tony-elumelu', 'Tony Elumelu Foundation', 'GOVERNMENT', '$5,000 non-refundable seed capital per entrepreneur. Mentoring, training, networking.', 'https://www.tonyelumelufoundation.org', '{}', '{}', '{capital-expenditure-leak}', 0, 5000, 'medium', '3-6 months', 'none', 'low', 'African entrepreneurs only. 10,000+ funded since 2015.', 80, 'NG')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('sa-seda', 'SEDA Small Enterprise Support (South Africa)', 'GOVERNMENT', 'Free business advisory services, training, mentoring for South African SMEs.', 'https://www.seda.org.za', '{}', '{}', '{consulting-cost-overspend}', 0, 3000, 'low', '1-2 weeks', 'none', 'low', 'South African business. Free advisory and training. No direct grants.', 70, 'ZA')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('eurostars-programme', 'Eurostars R&D Programme', 'GOVERNMENT', 'International collaborative R&D funding. 37 countries. SME-led projects. Up to €500K.', 'https://www.eurekanetwork.org/programmes-and-calls/eurostars', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 250000, 'high', '3-6 months', 'expert', 'medium', 'Must have partners from 2+ Eurostars countries. SME must lead. Competitive.', 90, 'EU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('eic-accelerator-2', 'EIC Accelerator (Expanded)', 'GOVERNMENT', 'Up to €2.5M grant + €15M equity. For breakthrough innovations. Highest EU single-company funding.', 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en', '{}', '{saas,healthcare}', '{r-and-d-costs,scaling-costs}', 0, 2500000, 'high', '6-12 months', 'expert', 'high', 'EU-established. Must have prototype/MVP. Extremely competitive (<5% success).', 95, 'EU')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('japan-nedo-rd', 'NEDO R&D Grants (Japan)', 'GOVERNMENT', 'New Energy and Industrial Technology Development Organization. Phase-structured R&D funding.', 'https://www.nedo.go.jp', '{}', '{saas}', '{r-and-d-costs}', 0, 500000, 'high', '3-6 months', 'expert', 'medium', 'Japanese entity. Focus on energy, environment, industrial tech.', 90, 'JP')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('denmark-innovationsfonden', 'Innovation Fund Denmark', 'GOVERNMENT', 'Grants and investments for innovative research and development. Up to DKK 5M (~$700K).', 'https://innovationsfonden.dk', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 350000, 'high', '3-6 months', 'expert', 'medium', 'Danish-connected project. Multiple program types by stage.', 90, 'DK')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('austria-ffg', 'FFG Innovation Grants (Austria)', 'GOVERNMENT', 'Austrian Research Promotion Agency. Grants and loans for R&D. Up to 85% of eligible costs.', 'https://www.ffg.at', '{}', '{saas}', '{r-and-d-costs}', 0, 200000, 'high', '3-6 months', 'expert', 'medium', 'Austrian company or branch. Various programs by technology area.', 90, 'AT')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('norway-innovation', 'Innovation Norway Grants', 'GOVERNMENT', 'Funding for innovative Norwegian businesses. Grants, loans, equity. International expansion support.', 'https://www.innovasjonnorge.no', '{}', '{saas}', '{r-and-d-costs,market-expansion-gap}', 0, 200000, 'high', '3-6 months', 'expert', 'medium', 'Norwegian-registered. Various programs. Export support.', 90, 'NO')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- ADVANCED DIY TACTICS (15 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('value-based-pricing', 'Value-Based Pricing Overhaul', 'DIY_TACTIC', 'Switch from hourly/cost-plus to value-based pricing. Average 20-50% revenue increase on same work.', '{pricing-strategy-leak,revenue-leak,profit-margin-compression}', 35, 0, 'high', '2-4 weeks', 'basic', 'medium', 'Requires understanding of client value. Not for commodity services. Test with new clients first.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('80-20-client-analysis', '80/20 Client Profitability Audit', 'DIY_TACTIC', 'Analyze which 20% of clients generate 80% of profits. Fire unprofitable clients, double down on best.', '{client-portfolio-imbalance,profit-margin-compression,revenue-leak}', 25, 0, 'medium', '1-2 days', 'basic', 'medium', 'Requires honest analysis. Some ''big'' clients may actually lose money. Hard conversations.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('retainer-model-shift', 'Retainer Model Shift', 'DIY_TACTIC', 'Move from project-based to retainer/subscription billing. Smooths revenue, reduces sales cost.', '{cash-flow-timing-gap,revenue-leak,client-retention-leak}', 0, 15000, 'medium', '1-2 months', 'none', 'medium', 'Not all clients will agree. Start with best clients. Offer discount for commitment.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('strategic-price-anchoring', 'Strategic Price Anchoring', 'DIY_TACTIC', 'Introduce premium tier to make mid-tier look like a deal. Typically lifts average sale 15-25%.', '{pricing-strategy-leak,revenue-leak}', 20, 0, 'low', '1-2 weeks', 'none', 'low', 'Don''t add fake options. Premium tier should deliver real value.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('supplier-payment-card', 'Supplier Payment via Credit Card', 'DIY_TACTIC', 'Pay suppliers with credit card for 1-3% cashback while gaining 30-day float. Net positive.', '{cash-flow-timing-gap,payment-processing-overspend}', 2, 0, 'low', '1-2 hours', 'none', 'low', 'Some suppliers charge convenience fees. Do the math. Works best for recurring payments.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('strategic-outsourcing-audit', 'Strategic Outsourcing Audit', 'DIY_TACTIC', 'Map all functions. Outsource non-core activities to specialists. Save 30-50% on those functions.', '{labor-cost-overspend,operational-inefficiency}', 30, 0, 'high', '1-2 months', 'basic', 'medium', 'Quality control critical. Start with one function. Don''t outsource your competitive advantage.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('loss-prevention-program', 'Loss Prevention Program', 'DIY_TACTIC', 'Implement basic inventory controls, camera systems, POS audits. Retail shrinkage averages 1.4% of revenue.', '{inventory-shrinkage,theft-loss,inventory-overspend}', 0, 5000, 'medium', '2-4 weeks', 'none', 'low', 'Balance security with employee trust. Start with data analysis, not accusations.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('dynamic-pricing-implementation', 'Dynamic Pricing Implementation', 'DIY_TACTIC', 'Adjust prices based on demand, time, capacity. Airlines do it. Your business can too.', '{pricing-strategy-leak,capacity-underutilization}', 15, 0, 'medium', '2-4 weeks', 'basic', 'medium', 'Transparent about pricing. Avoid gouging perception. Start with off-peak discounts.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('vertical-integration-analysis', 'Vertical Integration Analysis', 'DIY_TACTIC', 'Analyze whether bringing supplier functions in-house saves money at your volume.', '{supply-cost-overspend,vendor-overspend}', 20, 0, 'high', '2-4 weeks', 'basic', 'high', 'Only worth it at sufficient volume. Increases complexity and risk.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('customer-success-program', 'Customer Success Program (DIY)', 'DIY_TACTIC', 'Proactive outreach at 30/60/90 days. Track usage. Intervene before churn. Costs nothing but time.', '{client-retention-leak,customer-churn-cost,revenue-leak}', 0, 20000, 'medium', '2-4 weeks', 'none', 'low', 'Requires discipline. Schedule the calls. Track in CRM or spreadsheet.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('tax-entity-restructuring', 'Tax Entity Structure Review', 'DIY_TACTIC', 'Review business entity type annually. LLC vs S-Corp vs C-Corp optimization can save $5K-$50K/year.', '{tax-planning-gaps,tax-overpayment}', 0, 15000, 'high', '1-2 months', 'expert', 'medium', 'Consult accountant. Entity changes have tax implications. Don''t DIY the actual change.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('strategic-debt-restructuring', 'Debt Restructuring Review', 'DIY_TACTIC', 'Refinance high-interest debt. Consolidate. Renegotiate terms. Average savings 2-5% on interest.', '{interest-rate-overpayment,cash-flow-timing-gap}', 3, 0, 'medium', '2-4 weeks', 'basic', 'low', 'Watch for prepayment penalties. Time with rate environment.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('packaging-optimization', 'Packaging & Shipping Optimization', 'DIY_TACTIC', 'Right-size packaging. Reduce DIM weight charges. Average 10-25% shipping cost reduction.', '{shipping-cost-overspend,packaging-waste}', 15, 0, 'low', '1-2 weeks', 'none', 'low', 'Weigh and measure top 20 SKUs. Compare with carrier DIM factors.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('customer-referral-program-v2', 'Structured Customer Referral Program', 'DIY_TACTIC', 'Formal program: offer $X or X% credit per referral. Track, automate, reward. 80% cheaper than cold acquisition.', '{client-acquisition-overspend,marketing-spend-inefficiency}', 0, 10000, 'medium', '2-4 weeks', 'none', 'low', 'Simple is better. Reward both referrer and new customer. Track in CRM.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('capacity-utilization-audit', 'Capacity Utilization Audit', 'DIY_TACTIC', 'Measure actual vs theoretical capacity. Most businesses run at 60-75%. Fill gaps strategically.', '{capacity-underutilization,revenue-leak,resource-underutilization}', 15, 0, 'medium', '1-2 weeks', 'basic', 'low', 'Measure before optimizing. Track by hour/day/week. Use dead time for maintenance or training.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- MORE RATE COMPARISONS (5 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('credit-card-processing-audit', 'Credit Card Processing Audit', 'RATE_COMPARISON', 'Have a payment consultant audit your statements. Find hidden fees, downgrades, misclassified transactions.', '{payment-processing-overspend,transaction-fee-leak,merchant-fee-overspend}', 0, 3000, 'low', '2-4 hours', 'none', 'low', 'Many consultants work on savings-share model (free to you). Average SMB overpays 0.5-1.5%.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('commercial-auto-insurance', 'Commercial Auto Insurance Rebid', 'RATE_COMPARISON', 'Fleet and commercial auto rarely rebid. Competition saves 15-25% on premiums.', '{insurance-overspend,vehicle-cost-overspend}', 20, 0, 'low', '2-4 hours', 'none', 'low', 'Get 3+ quotes. Consider telematics discounts. Review annually.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('property-tax-appeal', 'Property Tax Assessment Appeal', 'RATE_COMPARISON', '30-40% of commercial properties are over-assessed. Appeal saves $2K-$50K/year.', '{property-tax-overpayment,rent-overspend}', 0, 5000, 'medium', '1-2 months', 'basic', 'low', 'Most jurisdictions allow annual appeals. Hire assessor if large property.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('software-license-audit', 'Software License True-Up Audit', 'RATE_COMPARISON', 'Audit all software subscriptions and licenses. Average company has 25-40% unused licenses.', '{software-license-waste,subscription-overspend,technology-overspend}', 30, 0, 'low', '4-8 hours', 'none', 'low', 'Check every credit card statement. Ask each team what they actually use.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('banking-relationship-review', 'Banking Relationship Review', 'RATE_COMPARISON', 'Compare business banking fees, interest rates, services. Online banks save $300-$1,200/year.', '{banking-fee-overspend,cash-flow-timing-gap}', 0, 800, 'low', '2-4 hours', 'none', 'low', 'Watch for hidden fees. Compare monthly fees, per-transaction costs, wire fees.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- MORE TEMPLATES (5 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('kpi-dashboard-template', 'KPI Dashboard Template (Google Sheets)', 'TEMPLATE', 'Free pre-built KPI dashboards. Financial, sales, marketing, operations. Auto-updating charts.', '{data-blind-spots,analytics-tool-overspend}', 0, 2000, 'low', '2-4 hours', 'basic', 'low', 'Template provides structure. Customize metrics for your business.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('pricing-calculator-template', 'Pricing Calculator Spreadsheet', 'TEMPLATE', 'Free template to calculate true costs, margins, break-even, and optimal pricing.', '{pricing-strategy-leak,profit-margin-compression}', 0, 1500, 'low', '2-4 hours', 'basic', 'low', 'Forces you to understand your real costs. Essential before any pricing changes.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('vendor-rfp-template', 'Vendor RFP Template', 'TEMPLATE', 'Standardized Request for Proposal template. Forces apples-to-apples vendor comparison.', '{vendor-overspend,procurement-inefficiency}', 0, 1000, 'low', '1-2 hours', 'none', 'low', 'Customize evaluation criteria per category. Weight by importance.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('project-budget-template', 'Project Budget Tracker Template', 'TEMPLATE', 'Track budget vs actual by category. Auto-calculate variances. Alert on overruns.', '{scope-creep-losses,budget-overrun}', 0, 2000, 'low', '1-2 hours', 'basic', 'low', 'Update weekly. Include contingency line. Review at milestones.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('customer-journey-map-template', 'Customer Journey Map Template', 'TEMPLATE', 'Map every touchpoint from awareness to advocacy. Identify friction points and leaks.', '{lead-conversion-gap,client-retention-leak,customer-experience-gaps}', 0, 3000, 'medium', '4-8 hours', 'none', 'low', 'Workshop with team. Talk to actual customers. Update quarterly.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT '═══ DEEP DIG FREE ALTERNATIVES ═══' AS header;
SELECT type, COUNT(*) FROM free_alternatives WHERE active=true GROUP BY type ORDER BY count DESC;
SELECT 'TOTAL FREE ALTERNATIVES' AS metric, COUNT(*) AS value FROM free_alternatives WHERE active=true;
SELECT 'COUNTRIES' AS metric, COUNT(DISTINCT region) AS value FROM free_alternatives WHERE region != 'ALL';

-- === 043-v8-expansion-partners.sql ===
-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — EXPANSION: ADDITIONAL AFFILIATE PARTNERS (v8-expansion)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run AFTER v8-mega-new-partners.sql
-- Adds 57 more partners to the database
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('zoho-crm', 'Zoho CRM', 'Full CRM suite with 50+ apps. 15% recurring commission, 90-day cookie.', 'https://www.zoho.com/affiliate.html', 'CRM', 'percentage', 15, 0, '{}', 'https://www.zoho.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('keap', 'Keap (Infusionkeep)', 'CRM and marketing automation for small businesses. 20% recurring commission.', 'https://keap.com/partners/affiliate', 'CRM', 'percentage', 20, 0, '{}', 'https://keap.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('copper-crm', 'Copper CRM', 'Google Workspace-native CRM. Partner program with commissions.', 'https://www.copper.com/partners', 'CRM', 'flat', 200, 0, '{consulting,agency}', 'https://www.copper.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('freshsales', 'Freshsales (Freshworks)', 'AI-powered CRM. 20% recurring commission on all Freshworks products.', 'https://www.freshworks.com/partners/affiliate', 'CRM', 'percentage', 20, 0, '{}', 'https://www.freshworks.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('pipeline-crm', 'Pipeline CRM', 'Sales CRM for SMBs. 20% lifetime recurring commission, 90-day cookie.', 'https://pipelinecrm.com/partners', 'CRM', 'percentage', 20, 0, '{consulting}', 'https://pipelinecrm.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('getresponse', 'GetResponse', 'Email marketing and automation. 33% recurring or $100 one-time per sale.', 'https://www.getresponse.com/affiliate-programs', 'Email Marketing', 'percentage', 33, 0, '{}', 'https://www.getresponse.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('aweber', 'AWeber', 'Email marketing for small business. Up to 50% recurring lifetime commission.', 'https://www.aweber.com/advocates.htm', 'Email Marketing', 'percentage', 50, 0, '{}', 'https://www.aweber.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('drip', 'Drip', 'E-commerce email marketing. 20% recurring commission.', 'https://www.drip.com/partners/affiliate', 'Email Marketing', 'percentage', 20, 0, '{ecommerce}', 'https://www.drip.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('mailerlite', 'MailerLite', 'Simple email marketing. 30% lifetime recurring commission.', 'https://www.mailerlite.com/affiliate-program', 'Email Marketing', 'percentage', 30, 0, '{}', 'https://www.mailerlite.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('constant-contact', 'Constant Contact', 'Email marketing. $105 per referral who pays.', 'https://www.constantcontact.com/partners/affiliate', 'Email Marketing', 'flat', 105, 0, '{}', 'https://www.constantcontact.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('klaviyo', 'Klaviyo', 'E-commerce marketing automation. Partner program with revenue share.', 'https://www.klaviyo.com/partners', 'Email Marketing', 'percentage', 15, 0, '{ecommerce}', 'https://www.klaviyo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('socialpilot', 'SocialPilot', 'Social media management. 30% recurring commission.', 'https://www.socialpilot.co/affiliate-program', 'Social Media', 'percentage', 30, 0, '{agency}', 'https://www.socialpilot.co', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('brand24', 'Brand24', 'Social media monitoring. 20% recurring commission.', 'https://brand24.com/referral-program', 'Social Media', 'percentage', 20, 0, '{agency,ecommerce}', 'https://brand24.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('freshbooks', 'FreshBooks', 'Cloud accounting for small business. $10 per trial + $200 per subscription.', 'https://www.freshbooks.com/affiliate-program', 'Accounting', 'flat', 200, 0, '{}', 'https://www.freshbooks.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('sage-accounting', 'Sage Accounting', 'Global accounting software. Commission on sales and free trials.', 'https://www.sage.com/en-us/affiliate-program', 'Accounting', 'flat', 100, 0, '{}', 'https://www.sage.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('zoho-books', 'Zoho Books', 'Cloud accounting. 15% recurring commission as part of Zoho affiliate.', 'https://www.zoho.com/affiliate.html', 'Accounting', 'percentage', 15, 0, '{}', 'https://www.zoho.com/books', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('bill-com', 'BILL (Bill.com)', 'AP/AR automation. Partner referral program.', 'https://www.bill.com/partners', 'Payments', 'flat', 150, 0, '{accounting}', 'https://www.bill.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('melio', 'Melio', 'Free business payments. Partner referral rewards.', 'https://meliopayments.com/partners', 'Payments', 'flat', 50, 0, '{}', 'https://meliopayments.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('paychex', 'Paychex', 'Payroll and HR. Referral bonus up to $250 per client.', 'https://www.paychex.com/partnerships', 'Payroll', 'flat', 250, 0, '{}', 'https://www.paychex.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('onpay', 'OnPay', 'Simple payroll. $100 per referral.', 'https://onpay.com/referral-partner', 'Payroll', 'flat', 100, 0, '{}', 'https://onpay.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('homebase', 'Homebase', 'Free scheduling and time tracking. Partner commissions on paid plans.', 'https://joinhomebase.com/partners', 'HR', 'flat', 75, 0, '{restaurant}', 'https://joinhomebase.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('when-i-work', 'When I Work', 'Employee scheduling app. Partner program available.', 'https://wheniwork.com/partners', 'HR', 'flat', 50, 0, '{restaurant,healthcare}', 'https://wheniwork.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('squarespace', 'Squarespace', 'Website builder. Earn commission on new annual subscriptions.', 'https://www.squarespace.com/affiliates', 'Website Builder', 'flat', 100, 0, '{}', 'https://www.squarespace.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('webflow', 'Webflow', 'Visual web development platform. 50% revenue for 12 months.', 'https://webflow.com/affiliates', 'Website Builder', 'percentage', 50, 12, '{agency}', 'https://webflow.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('teachable', 'Teachable', 'Course platform. 30% recurring commission.', 'https://teachable.com/affiliates', 'E-learning', 'percentage', 30, 0, '{consulting}', 'https://teachable.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('samcart', 'SamCart', 'Checkout pages and sales funnels. 40% recurring commission.', 'https://www.samcart.com/affiliate-program', 'E-commerce', 'percentage', 40, 0, '{ecommerce}', 'https://www.samcart.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('thinkific', 'Thinkific', 'Online course platform. 30% recurring commission for 12 months.', 'https://www.thinkific.com/affiliates', 'E-learning', 'percentage', 30, 12, '{consulting}', 'https://www.thinkific.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('kinsta', 'Kinsta', 'Premium WordPress hosting. Up to $500 per referral + 10% recurring.', 'https://kinsta.com/affiliates', 'Hosting', 'flat', 500, 0, '{agency,ecommerce}', 'https://kinsta.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('vultr', 'Vultr', 'Cloud hosting. $35 per qualified referral.', 'https://www.vultr.com/affiliates', 'Hosting', 'flat', 35, 0, '{saas}', 'https://www.vultr.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('digitalocean', 'DigitalOcean', 'Cloud infrastructure. $200 per referral who spends $25+.', 'https://www.digitalocean.com/referral-program', 'Hosting', 'flat', 200, 0, '{saas}', 'https://www.digitalocean.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('namecheap', 'Namecheap', 'Domains and hosting. 20-35% commission.', 'https://www.namecheap.com/affiliates', 'Hosting', 'percentage', 25, 0, '{}', 'https://www.namecheap.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('nordvpn-business', 'NordVPN', 'VPN service. 40-100% first month + 30% recurring.', 'https://nordvpn.com/affiliates', 'Security', 'percentage', 40, 0, '{}', 'https://nordvpn.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('surfshark', 'Surfshark', 'VPN service. 40% recurring commission.', 'https://surfshark.com/affiliates', 'Security', 'percentage', 40, 0, '{}', 'https://surfshark.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('dashlane-business', 'Dashlane Business', 'Password manager for teams. Referral program.', 'https://www.dashlane.com/business/partnerships', 'Security', 'flat', 100, 0, '{}', 'https://www.dashlane.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('surfer-seo', 'Surfer SEO', 'AI content optimization. 25% recurring commission.', 'https://surferseo.com/affiliate-program', 'SEO', 'percentage', 25, 0, '{agency,ecommerce}', 'https://surferseo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('writesonic', 'Writesonic', 'AI writing tool. 30% lifetime recurring commission.', 'https://writesonic.com/affiliate', 'AI Content', 'percentage', 30, 0, '{agency}', 'https://writesonic.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('descript', 'Descript', 'AI video/podcast editing. 15% recurring commission.', 'https://www.descript.com/affiliates', 'AI Video', 'percentage', 15, 0, '{agency,consulting}', 'https://www.descript.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('loom', 'Loom', 'Video messaging for teams. Partner program.', 'https://www.loom.com/partners', 'Video', 'flat', 50, 0, '{saas,consulting}', 'https://www.loom.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('calendly-pro', 'Calendly Pro', 'Advanced scheduling. 20% recurring commission.', 'https://calendly.com/partners', 'Scheduling', 'percentage', 20, 0, '{}', 'https://calendly.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('intercom', 'Intercom', 'Customer messaging platform. Partner program with revenue share.', 'https://www.intercom.com/partners', 'Customer Support', 'percentage', 15, 0, '{saas,ecommerce}', 'https://www.intercom.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('zendesk', 'Zendesk', 'Customer service platform. Partner referral program.', 'https://www.zendesk.com/partners/technology', 'Customer Support', 'flat', 200, 0, '{}', 'https://www.zendesk.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('freshdesk', 'Freshdesk', 'Customer support. 20% recurring (Freshworks affiliate).', 'https://www.freshworks.com/partners/affiliate', 'Customer Support', 'percentage', 20, 0, '{}', 'https://www.freshdesk.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('helpscout', 'Help Scout', 'Customer support for growing teams. Partner program.', 'https://www.helpscout.com/partners/affiliate', 'Customer Support', 'percentage', 20, 0, '{saas}', 'https://www.helpscout.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('livechat', 'LiveChat', 'Live chat software. 20% recurring lifetime commission.', 'https://partners.livechat.com', 'Customer Support', 'percentage', 20, 0, '{ecommerce,saas}', 'https://www.livechat.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('tidio', 'Tidio', 'Live chat + chatbot. 20% recurring commission.', 'https://www.tidio.com/affiliate-program', 'Customer Support', 'percentage', 20, 0, '{ecommerce}', 'https://www.tidio.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('typeform', 'Typeform', 'Interactive forms and surveys. 20% recurring commission.', 'https://www.typeform.com/partners/affiliate', 'Forms', 'percentage', 20, 0, '{}', 'https://www.typeform.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('jotform', 'Jotform', 'Online form builder. 30% commission for first year.', 'https://www.jotform.com/affiliates', 'Forms', 'percentage', 30, 12, '{}', 'https://www.jotform.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('surveysparrow', 'SurveySparrow', 'Survey and experience management. 25% commission.', 'https://surveysparrow.com/partner-programs/affiliate', 'Surveys', 'percentage', 25, 0, '{healthcare,consulting}', 'https://surveysparrow.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('docusign', 'DocuSign', 'E-signature and CLM. Referral program with commissions.', 'https://www.docusign.com/partners/referral', 'E-signature', 'flat', 100, 0, '{}', 'https://www.docusign.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('proposify', 'Proposify', 'Proposal software. 25% recurring commission.', 'https://www.proposify.com/affiliate', 'Documents', 'percentage', 25, 0, '{consulting,agency}', 'https://www.proposify.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('signaturely', 'Signaturely', 'E-signature tool. 25% recurring commission.', 'https://signaturely.com/affiliate', 'E-signature', 'percentage', 25, 0, '{law-firm,real-estate}', 'https://signaturely.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('toast-pos', 'Toast POS', 'Restaurant POS. Referral bonuses per qualified restaurant.', 'https://pos.toasttab.com/partners', 'Restaurant POS', 'flat', 250, 0, '{restaurant}', 'https://pos.toasttab.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('vagaro', 'Vagaro', 'Salon/spa booking and POS. Referral commission.', 'https://www.vagaro.com/referral', 'Beauty/Wellness', 'flat', 100, 0, '{healthcare}', 'https://www.vagaro.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('jobber', 'Jobber', 'Field service management. 20% commission for 12 months.', 'https://getjobber.com/partners', 'Field Service', 'percentage', 20, 12, '{construction}', 'https://getjobber.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('buildertrend', 'Buildertrend', 'Construction project management. Referral program.', 'https://buildertrend.com/referral', 'Construction', 'flat', 200, 0, '{construction}', 'https://buildertrend.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('simplepractice', 'SimplePractice', 'Practice management for health/wellness. 1 month free per referral.', 'https://www.simplepractice.com/referral', 'Healthcare', 'flat', 50, 0, '{healthcare}', 'https://www.simplepractice.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_rate, commission_duration_months, industries_served, website_url, data_verified, active)
VALUES ('clio', 'Clio', 'Legal practice management. Referral program.', 'https://www.clio.com/partnerships/referral', 'Legal', 'flat', 200, 0, '{law-firm}', 'https://www.clio.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_rate=EXCLUDED.commission_rate, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT '═══ EXPANSION PARTNERS ═══' AS header;
SELECT category, COUNT(*) AS count FROM affiliate_partners WHERE active=true GROUP BY category ORDER BY count DESC;
SELECT 'TOTAL PARTNERS' AS metric, COUNT(*) AS value FROM affiliate_partners WHERE active=true;

-- === 044-v8-expansion-free-alt.sql ===
-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — EXPANSION: ADDITIONAL FREE ALTERNATIVES (v8-expansion)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run AFTER v8-mega-free-alternatives.sql
-- Adds 100+ more entries across all categories
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL FREE TOOLS (28 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('loyverse-pos', 'Loyverse POS (Free)', 'FREE_TOOL', 'Free POS system for restaurants, retail, cafes. Inventory, employee mgmt, analytics.', 'https://loyverse.com', '{Square,Lightspeed,Toast}', '{restaurant,ecommerce}', '{pos-system-overspend,inventory-overspend}', 100, 0, 'low', '1-2 hours', 'none', 'low', 'Free: unlimited items/users. Premium: employee mgmt, advanced inventory.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('ospos', 'Open Source POS', 'FREE_TOOL', 'Free web-based POS. Barcode scanning, multi-language, inventory tracking.', 'https://opensourcepos.org', '{Square,Clover}', '{restaurant,ecommerce}', '{pos-system-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted. Basic UI. Good for small retail.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('partkeepr', 'PartKeepr', 'FREE_TOOL', 'Free open-source inventory and parts management. Multi-location, barcode support.', 'https://partkeepr.org', '{Fishbowl,inFlow}', '{construction}', '{inventory-overspend,materials-waste}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted. Best for parts/components inventory. Not for retail.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('openboxes', 'OpenBoxes', 'FREE_TOOL', 'Free open-source supply chain and inventory management. Designed for healthcare but works for all.', 'https://openboxes.com', '{NetSuite,Fishbowl}', '{healthcare,ecommerce}', '{inventory-overspend,supply-chain-inefficiency}', 100, 0, 'medium', '4-8 hours', 'technical', 'low', 'Java-based. Excellent for multi-location. Originally for health supply chains.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('dolibarr', 'Dolibarr ERP/CRM', 'FREE_TOOL', 'Free open-source ERP+CRM. Popular in EU. Invoicing, inventory, HR, projects, POS.', 'https://www.dolibarr.org', '{SAP,Oracle,Odoo Enterprise}', '{construction,consulting}', '{erp-overspend,accounting-software-overspend}', 100, 0, 'medium', '1-2 weeks', 'basic', 'low', 'Simpler than ERPNext. Very popular in France, Italy, Germany. Module marketplace.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('suitecrm', 'SuiteCRM', 'FREE_TOOL', 'Open-source enterprise CRM. Fork of SugarCRM. Workflows, campaigns, reporting.', 'https://suitecrm.com', '{Salesforce,SugarCRM,Dynamics 365}', '{}', '{crm-overspend,client-retention-leak}', 100, 0, 'high', '1-2 weeks', 'technical', 'medium', 'Complex setup. Most feature-complete open-source CRM. Active community.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('civicrm', 'CiviCRM', 'FREE_TOOL', 'Free CRM designed for nonprofits. Fundraising, memberships, events, mailings.', 'https://civicrm.org', '{Salesforce Nonprofit,Bloomerang}', '{healthcare}', '{crm-overspend}', 100, 0, 'medium', '4-8 hours', 'basic', 'low', 'Nonprofit-focused. Integrates with WordPress/Drupal/Joomla.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('rallly', 'Rallly', 'FREE_TOOL', 'Free open-source scheduling polls. Simple alternative to Doodle for group scheduling.', 'https://rallly.co', '{Doodle,Calendly}', '{}', '{scheduling-inefficiency}', 100, 0, 'low', '5 minutes', 'none', 'low', 'Very simple. Just polls for scheduling. No calendar integration.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('posthog', 'PostHog', 'FREE_TOOL', 'Open-source product analytics. Session replay, feature flags, A/B testing, funnels.', 'https://posthog.com', '{Mixpanel,Amplitude,LaunchDarkly}', '{saas,ecommerce}', '{analytics-tool-overspend,data-blind-spots}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted free with no limits. Cloud: 1M events/month free.', 82, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('aptabase', 'Aptabase', 'FREE_TOOL', 'Open-source analytics for mobile and desktop apps. Privacy-first.', 'https://aptabase.com', '{Mixpanel,Firebase Analytics}', '{saas}', '{analytics-tool-overspend}', 100, 0, 'low', '1 hour', 'basic', 'low', 'Focused on app analytics. Not for websites.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('dub-link', 'Dub.co (Free Tier)', 'FREE_TOOL', 'Open-source link management. Shortened URLs with analytics. Free 1000 links/month.', 'https://dub.co', '{Bitly,Rebrandly}', '{ecommerce,agency}', '{marketing-spend-inefficiency}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Free: 1000 links. Self-hosted removes limits.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('phplist', 'phpList', 'FREE_TOOL', 'Open-source newsletter manager. Handles millions of subscribers. Self-hosted.', 'https://www.phplist.com', '{Mailchimp,ConvertKit}', '{}', '{email-marketing-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted. Mature platform. UI dated. Very reliable for high volume.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mailtrain', 'Mailtrain', 'FREE_TOOL', 'Open-source self-hosted newsletter app built on Node.js. Works with any SMTP.', 'https://mailtrain.org', '{Mailchimp,Sendinblue}', '{}', '{email-marketing-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted. Good for large lists with own SMTP (Amazon SES = $0.10/1000).', 62, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('screeb', 'Screeb (Free Tier)', 'FREE_TOOL', 'Product feedback and in-app surveys. Free tier with core features.', 'https://screeb.app', '{Hotjar,SurveyMonkey}', '{saas}', '{survey-tool-overspend,client-communication-gaps}', 100, 0, 'low', '30 minutes', 'none', 'low', 'Free tier limited. Good for quick user feedback.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('gitea', 'Gitea', 'FREE_TOOL', 'Open-source self-hosted Git service. Lightweight GitHub/GitLab alternative.', 'https://about.gitea.com', '{GitHub,GitLab}', '{saas}', '{development-tool-overspend}', 100, 0, 'low', '1-2 hours', 'technical', 'low', 'Very lightweight. Runs on minimal resources. Great for private repos.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('portainer', 'Portainer CE', 'FREE_TOOL', 'Free Docker/Kubernetes management UI. Simplifies container management.', 'https://www.portainer.io', '{Docker Desktop Business}', '{saas}', '{development-tool-overspend,it-monitoring-overspend}', 100, 0, 'low', '30 minutes', 'technical', 'low', 'Community edition free. Business features in paid tier.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uptime-kuma', 'Uptime Kuma', 'FREE_TOOL', 'Open-source uptime monitoring. Beautiful dashboard, notifications, status pages.', 'https://github.com/louislam/uptime-kuma', '{Pingdom,UptimeRobot Pro}', '{saas}', '{it-monitoring-overspend}', 100, 0, 'low', '30 minutes', 'technical', 'low', 'Self-hosted only. Single binary. Incredibly simple.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('grafana', 'Grafana', 'FREE_TOOL', 'Open-source monitoring and observability platform. Dashboards for any data source.', 'https://grafana.com', '{Datadog,New Relic,Splunk}', '{saas}', '{it-monitoring-overspend,analytics-tool-overspend}', 100, 0, 'medium', '4-8 hours', 'technical', 'low', 'Self-hosted OSS free. Powerful but requires learning. Pairs with Prometheus.', 78, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('sentry-self-hosted', 'Sentry (Self-Hosted)', 'FREE_TOOL', 'Open-source error tracking. Application monitoring, performance, and debugging.', 'https://sentry.io', '{Datadog,Bugsnag}', '{saas}', '{it-monitoring-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Self-hosted free. Cloud: 5K errors/month free. Developer essential.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('ollama', 'Ollama', 'FREE_TOOL', 'Run large language models locally for free. Llama 3, Mistral, Gemma, Phi.', 'https://ollama.com', '{ChatGPT Plus,Claude Pro}', '{}', '{ai-tool-overspend}', 100, 0, 'low', '30 minutes', 'basic', 'low', 'Requires decent hardware (8GB+ RAM). Models less capable than GPT-4/Claude.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('openwebui', 'Open WebUI', 'FREE_TOOL', 'Free self-hosted AI chat interface. Works with Ollama, OpenAI, Anthropic APIs.', 'https://openwebui.com', '{ChatGPT Plus}', '{}', '{ai-tool-overspend}', 100, 0, 'low', '1 hour', 'technical', 'low', 'Beautiful UI. Self-hosted. Needs Ollama or API key.', 68, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('hugging-face', 'Hugging Face (Free Tier)', 'FREE_TOOL', 'Free AI model hosting, inference API, datasets. Hub for open-source AI.', 'https://huggingface.co', '{OpenAI,AWS SageMaker}', '{saas}', '{ai-tool-overspend,technology-overspend}', 100, 0, 'low', '1 hour', 'technical', 'low', 'Free inference API has rate limits. Huge model library.', 72, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('opencontract', 'OpenContract', 'FREE_TOOL', 'Open-source contract management. Store, organize, search contracts.', 'https://github.com/JSv4/OpenContracts', '{Ironclad,ContractPodAi}', '{law-firm,consulting}', '{contract-gaps,legal-cost-overspend}', 100, 0, 'medium', '2-4 hours', 'technical', 'low', 'Early-stage project. Good for basic contract repository.', 55, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('cleandocs', 'Google Docs Templates (Free)', 'FREE_TOOL', 'Google offers free business document templates: invoices, proposals, budgets, resumes.', 'https://docs.google.com/document/u/0/?ftv=1', '{PandaDoc,Proposify}', '{}', '{document-signing-overspend,administrative-overhead}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Basic templates. No e-signature. No tracking.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('buffer-free', 'Buffer (Free Plan)', 'FREE_TOOL', 'Schedule posts to 3 channels. Basic analytics. No credit card needed.', 'https://buffer.com', '{Hootsuite,Sprout Social}', '{agency,ecommerce}', '{social-media-tool-overspend,marketing-spend-inefficiency}', 100, 0, 'low', '15 minutes', 'none', 'low', 'Free: 3 channels, 10 scheduled posts. Very limited but good start.', 60, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mixpost', 'Mixpost', 'FREE_TOOL', 'Open-source social media management. Self-hosted. Schedule to all platforms.', 'https://mixpost.app', '{Hootsuite,Buffer,Sprout Social}', '{agency,ecommerce}', '{social-media-tool-overspend}', 100, 0, 'medium', '2-3 hours', 'technical', 'low', 'Self-hosted for free. Supports major platforms. Laravel-based.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('duplicati', 'Duplicati', 'FREE_TOOL', 'Free open-source backup to any cloud storage. Encrypted, incremental, scheduled.', 'https://www.duplicati.com', '{Backblaze Business,Carbonite}', '{}', '{data-backup-gap,it-disaster-risk}', 100, 0, 'low', '1-2 hours', 'basic', 'low', 'Self-managed. Reliable but requires your own cloud storage account.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('restic', 'Restic', 'FREE_TOOL', 'Fast open-source backup program. Supports all cloud backends. Encrypted by default.', 'https://restic.net', '{Veeam,Acronis}', '{saas}', '{data-backup-gap}', 100, 0, 'medium', '1-2 hours', 'technical', 'low', 'CLI only. Very fast and efficient. Great for servers.', 68, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL GOVERNMENT PROGRAMS (21 entries — More Countries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('japan-meti-subsidy', 'METI SME Subsidy (Japan)', 'GOVERNMENT', 'Up to ¥2M (~$13K) for small businesses under 5 years. Equipment, digitalization, marketing.', 'https://www.meti.go.jp', '{}', '{}', '{technology-overspend,equipment-cost-overspend}', 0, 13000, 'high', '2-4 months', 'expert', 'medium', 'Japanese language application. METI review process. Competitive.', 85, 'JP')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('japan-it-subsidy', 'IT Introduction Subsidy (Japan)', 'GOVERNMENT', '50-75% of IT adoption costs. ¥300K-¥4.5M. For digital transformation tools.', 'https://www.it-hojo.jp', '{}', '{}', '{technology-overspend,digital-transformation-gap}', 66, 0, 'medium', '2-4 months', 'basic', 'low', 'Must use certified IT tools. Japanese application.', 85, 'JP')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('japan-tokyo-startup', 'Tokyo Startup Subsidy', 'GOVERNMENT', 'Up to ¥4M (~$27K) for businesses under 5 years in Tokyo. 66% of eligible expenses.', 'https://startup-station.jp', '{}', '{saas}', '{capital-expenditure-leak}', 0, 27000, 'high', '3-6 months', 'expert', 'medium', 'Tokyo-based only. Very competitive. Japanese required.', 85, 'JP')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('korea-tips', 'TIPS Program (South Korea)', 'GOVERNMENT', 'Up to ₩500M (~$370K) for tech startups. R&D funding through private accelerators.', 'https://www.tipa.or.kr', '{}', '{saas}', '{r-and-d-costs,technology-overspend}', 0, 200000, 'high', '3-6 months', 'expert', 'high', 'Must go through approved accelerator. Technology startups only.', 90, 'KR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('korea-kised', 'KISED Startup Support (South Korea)', 'GOVERNMENT', 'Various startup support programs. Up to ₩100M (~$74K) for early-stage ventures.', 'https://www.kised.or.kr', '{}', '{saas}', '{capital-expenditure-leak}', 0, 74000, 'high', '3-6 months', 'expert', 'medium', 'Korean-registered entity. Multiple program types.', 85, 'KR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('korea-rd-credit', 'South Korea R&D Tax Credit', 'GOVERNMENT', 'Up to 25% tax credit for SME R&D expenditures. Stackable with other incentives.', 'https://english.moef.go.kr', '{}', '{saas,healthcare}', '{r-and-d-costs}', 25, 0, 'high', '2-4 months', 'expert', 'low', 'Must be Korean-registered. Complex claim process.', 90, 'KR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('brazil-finep', 'FINEP Innovation Credit (Brazil)', 'GOVERNMENT', 'Low-interest innovation loans. R$1M-R$200M for R&D and innovation projects.', 'https://www.finep.gov.br', '{}', '{saas}', '{r-and-d-costs}', 0, 100000, 'high', '3-6 months', 'expert', 'medium', 'Brazilian company. Innovation-focused projects. Below-market interest.', 85, 'BR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('brazil-lei-do-bem', 'Lei do Bem Tax Incentive (Brazil)', 'GOVERNMENT', '20.4-34% additional deduction on R&D expenses. Automatic for eligible companies.', 'https://www.gov.br/mcti', '{}', '{saas,healthcare}', '{r-and-d-costs,tax-planning-gaps}', 25, 0, 'medium', 'At tax filing', 'expert', 'low', 'Must be profitable and on Lucro Real tax regime. No pre-approval.', 90, 'BR')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('mexico-conacyt', 'CONAHCYT R&D Incentive (Mexico)', 'GOVERNMENT', 'Formerly CONACYT. Tax incentives for R&D investments up to 30% of R&D spend.', 'https://conahcyt.mx', '{}', '{saas}', '{r-and-d-costs}', 30, 0, 'high', '3-6 months', 'expert', 'medium', 'Mexican entity. Must register project. Annual budget cap.', 85, 'MX')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uae-adio', 'ADIO Innovation Programme (UAE)', 'GOVERNMENT', 'Up to 50% financial support for innovative projects in Abu Dhabi.', 'https://www.investinabudhabi.ae', '{}', '{saas,healthcare}', '{r-and-d-costs,market-expansion-gap}', 50, 0, 'high', '3-6 months', 'expert', 'medium', 'Must establish operations in Abu Dhabi. Various sector programs.', 85, 'AE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('uae-dubai-sme', 'Dubai SME Support', 'GOVERNMENT', 'Various programs: startup license fee waivers, co-working spaces, mentorship.', 'https://sme.ae', '{}', '{}', '{capital-expenditure-leak}', 0, 10000, 'medium', '1-3 months', 'basic', 'low', 'Must be Dubai-based. Programs change frequently.', 80, 'AE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('india-msme-champion', 'MSME Champions Scheme (India)', 'GOVERNMENT', 'Collateral-free loans up to ₹1 crore for MSMEs. 2% interest subvention.', 'https://msme.gov.in', '{}', '{}', '{capital-expenditure-leak,cash-flow-timing-gap}', 0, 12000, 'medium', '2-4 weeks', 'basic', 'low', 'Must be registered MSME. Through approved lending institutions.', 85, 'IN')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('india-atal-innovation', 'Atal Innovation Mission (India)', 'GOVERNMENT', 'Grants up to ₹1 crore for startups. Incubation centers, tinkering labs.', 'https://aim.gov.in', '{}', '{saas}', '{r-and-d-costs,innovation-investment-gap}', 0, 12000, 'high', '3-6 months', 'basic', 'medium', 'Must be DPIIT-recognized startup. Competitive.', 80, 'IN')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('sweden-vinnova', 'Vinnova Innovation Grants (Sweden)', 'GOVERNMENT', 'SEK 500K-10M for innovation projects. Sweden''s innovation agency.', 'https://www.vinnova.se', '{}', '{saas,healthcare}', '{r-and-d-costs}', 0, 50000, 'high', '3-6 months', 'expert', 'medium', 'Swedish-registered. Various open calls by theme.', 90, 'SE')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('finland-business-finland', 'Business Finland R&D Funding', 'GOVERNMENT', 'Grants and loans for R&D and internationalization. Up to 50% of eligible costs.', 'https://www.businessfinland.fi', '{}', '{saas}', '{r-and-d-costs,market-expansion-gap}', 50, 0, 'high', '2-4 months', 'expert', 'medium', 'Finnish-registered company. Strong innovation plan required.', 90, 'FI')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('spain-cdti', 'CDTI Innovation Funding (Spain)', 'GOVERNMENT', 'Partially reimbursable funding for R&D projects. Up to 85% of approved budget.', 'https://www.cdti.es', '{}', '{saas}', '{r-and-d-costs}', 0, 75000, 'high', '3-6 months', 'expert', 'medium', 'Spanish-registered. Projects must have technical innovation.', 85, 'ES')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('swiss-innosuisse', 'Innosuisse (Switzerland)', 'GOVERNMENT', 'Federal innovation agency. Co-funds R&D projects with academic partners.', 'https://www.innosuisse.ch', '{}', '{saas,healthcare}', '{r-and-d-costs}', 50, 0, 'high', '3-6 months', 'expert', 'medium', 'Must partner with Swiss research institution. 50% co-funding.', 90, 'CH')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('bc-itn', 'BC Innovator Skills Initiative', 'GOVERNMENT', 'Up to $300K for BC companies adopting new technology and upskilling staff.', 'https://www.innovatebctech.ca', '{}', '{saas}', '{training-cost-inefficiency,technology-overspend}', 0, 100000, 'medium', '2-4 months', 'basic', 'low', 'BC-based businesses. Technology adoption focus.', 85, 'CA-BC')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-employee-retention-credit', 'Employee Retention Credit (US)', 'GOVERNMENT', 'Refundable tax credit up to $26K per employee for 2020-2021 wages. Can still be claimed retroactively.', 'https://www.irs.gov/coronavirus/employee-retention-credit', '{}', '{}', '{labor-cost-overspend}', 0, 26000, 'high', '2-6 months', 'expert', 'high', 'Retroactive claims through amended returns. Deadline extensions vary. Beware of scams.', 85, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-opportunity-zones', 'Opportunity Zone Tax Benefits (US)', 'GOVERNMENT', 'Defer/reduce capital gains tax by investing in designated economically distressed areas.', 'https://www.irs.gov/credits-deductions/businesses/opportunity-zones', '{}', '{real-estate,construction}', '{tax-planning-gaps}', 15, 0, 'high', '3-6 months', 'expert', 'medium', 'Must invest through Qualified Opportunity Fund. Complex rules.', 85, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, url, replaces, industries, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('us-state-grants-database', 'State Business Incentives Database (US)', 'GOVERNMENT', 'Each US state has unique grants, tax credits, and incentives. SBA database searchable by state.', 'https://www.sba.gov/local-assistance', '{}', '{}', '{tax-planning-gaps,capital-expenditure-leak}', 0, 10000, 'medium', 'Varies', 'basic', 'low', 'Varies wildly by state. Check your state economic development office.', 80, 'US')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, url=EXCLUDED.url, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL DIY TACTICS (15 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('payment-method-optimization', 'Payment Method Optimization', 'DIY_TACTIC', 'Steer customers to lower-cost payment methods. ACH/bank transfer saves 2-3% vs credit card.', '{payment-processing-overspend,transaction-fee-leak}', 2, 0, 'low', '1-2 weeks', 'none', 'low', 'Some customers prefer credit cards. Offer discounts for ACH.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('customer-lifetime-value-focus', 'CLV-Based Customer Strategy', 'DIY_TACTIC', 'Focus on top 20% customers generating 80% revenue. Reduces wasted acquisition spend.', '{marketing-spend-inefficiency,client-acquisition-overspend}', 25, 0, 'medium', '2-4 weeks', 'basic', 'low', 'Requires customer data analysis. Don''t neglect growth opportunities.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('exit-interview-implementation', 'Exit Interview System', 'DIY_TACTIC', 'Understand why employees leave. Reduces future turnover 15-25% by fixing root causes.', '{employee-turnover-cost,staffing-inefficiency}', 0, 5000, 'low', '1 day', 'none', 'low', 'Honesty depends on trust. Anonymous surveys work better than face-to-face.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('remote-work-policy', 'Remote/Hybrid Work Policy', 'DIY_TACTIC', 'Reduce office space 30-50%. Average savings $5K-$11K per remote employee per year.', '{rent-overspend,occupancy-cost-leak}', 0, 8000, 'medium', '1-2 months', 'none', 'medium', 'Not suitable for all roles. Requires trust and accountability systems.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('annual-contract-review', 'Annual Contract Review Cycle', 'DIY_TACTIC', 'Review ALL vendor contracts annually. Average business finds 10-15% savings opportunity.', '{contract-auto-renewal-trap,vendor-overspend}', 12, 0, 'low', '4-8 hours', 'none', 'low', 'Calendar it. Most savings from simply asking for better rates.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('intake-form-optimization', 'Client Intake Form Optimization', 'DIY_TACTIC', 'Better intake forms reduce project scope misunderstandings by 40-60%.', '{scope-creep-losses,client-communication-gaps}', 0, 3000, 'low', '2-4 hours', 'none', 'low', 'Test with 5 clients before rolling out. Keep it short.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('dead-stock-liquidation', 'Dead Stock Liquidation Program', 'DIY_TACTIC', 'Identify and liquidate slow-moving inventory. Recover 20-60% of tied-up capital.', '{inventory-overspend,materials-waste}', 0, 10000, 'medium', '2-4 weeks', 'none', 'low', 'Accept losses on dead stock. Better to recover 30% than hold at 100% forever.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('churn-prevention-system', 'Customer Churn Prevention System', 'DIY_TACTIC', 'Track at-risk customers. 5% reduction in churn = 25-95% increase in profits.', '{client-retention-leak,revenue-leak}', 0, 10000, 'medium', '2-4 weeks', 'basic', 'low', 'Requires CRM and regular touchpoints. Start with top 50 customers.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('process-documentation', 'Core Process Documentation', 'DIY_TACTIC', 'Document top 20 business processes. Reduces errors 30-50%, cuts training time in half.', '{process-inefficiency,training-cost-inefficiency,quality-control-failures}', 0, 5000, 'medium', '2-4 weeks', 'none', 'low', 'Start with highest-impact, highest-frequency processes.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('accounts-payable-optimization', 'Accounts Payable Optimization', 'DIY_TACTIC', 'Negotiate early payment discounts (2/10 net 30). Earn 36% annualized return on early payments.', '{cash-flow-timing-gap,vendor-overspend}', 3, 0, 'low', '1-2 weeks', 'none', 'low', 'Only if you have cash available. Don''t sacrifice liquidity.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('google-business-profile', 'Google Business Profile Optimization', 'DIY_TACTIC', 'Free. Optimized profiles get 7x more clicks. Photos, reviews, posts, Q&A.', '{marketing-spend-inefficiency,lead-conversion-gap}', 0, 3000, 'low', '2-4 hours', 'none', 'low', 'Requires consistent updates. Respond to every review.', 90, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('warranty-negotiation', 'Extended Warranty Negotiation', 'DIY_TACTIC', 'Negotiate extended warranties on major purchases. Often 50% off list price.', '{equipment-cost-overspend,maintenance-overspend}', 50, 0, 'low', '30 minutes', 'none', 'low', 'Not all vendors negotiate. Best at point of purchase.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('seasonal-staffing-model', 'Seasonal Staffing Optimization', 'DIY_TACTIC', 'Use part-time/seasonal workers during peak. Reduces labor costs 15-30% vs full-time-for-all.', '{labor-cost-overspend,overtime-overspend}', 20, 0, 'medium', '2-4 weeks', 'none', 'low', 'Requires workforce planning. Training costs for seasonal workers.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('expense-policy-enforcement', 'Expense Policy Enforcement', 'DIY_TACTIC', 'Clear expense policies with approval workflows reduce discretionary spending 10-20%.', '{expense-overspend,administrative-overhead}', 15, 0, 'low', '1 week', 'none', 'low', 'Balance control with trust. Over-policing kills morale.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('bartering-network', 'Business Bartering/Trade Exchange', 'DIY_TACTIC', 'Trade services with other businesses. Save cash on services you need.', '{cash-flow-timing-gap,marketing-spend-inefficiency}', 0, 3000, 'low', '2-4 hours', 'none', 'low', 'Tax implications — traded value is taxable income. Track everything.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL RATE COMPARISONS (4 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('workers-comp-audit', 'Workers Comp Classification Audit', 'RATE_COMPARISON', '30-50% of businesses are misclassified. Reclassification can save 20-40% on premiums.', '{insurance-overspend,commercial-insurance-overspend}', 30, 0, 'medium', '2-4 hours', 'basic', 'low', 'Hire a workers comp auditor. Often free — they take a % of savings.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('fleet-fuel-optimization', 'Fleet Fuel Card Optimization', 'RATE_COMPARISON', 'Negotiate fleet fuel discounts. Fuel cards offer 2-6 cents/gallon savings.', '{fuel-cost-overspend,vehicle-cost-overspend}', 5, 0, 'low', '1-2 hours', 'none', 'low', 'Only for businesses with vehicles. Compare WEX, Fuelman, Comdata.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('waste-management-rebid', 'Waste Management Service Rebid', 'RATE_COMPARISON', 'Waste hauling contracts rarely rebid. Competition saves 15-30%.', '{utility-overspend,vendor-overspend}', 20, 0, 'low', '2-4 hours', 'none', 'low', 'Watch for multi-year contract lock-ins.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('payroll-processor-comparison', 'Payroll Processor Comparison', 'RATE_COMPARISON', 'Compare ADP, Paychex, Gusto, OnPay. Savings of $500-$3,000/yr for <50 employees.', '{payroll-processing-overspend}', 0, 1500, 'low', '2-4 hours', 'none', 'low', 'Switching has transition costs. Time it with fiscal year.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL BUILT-IN FEATURES (5 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('xero-hidden', 'Xero Features You''re Not Using', 'BUILT_IN', 'Bank feeds, invoicing reminders, project tracking, multi-currency, Hubdoc for receipts.', '{bookkeeping-inefficiency,invoice-delays}', 0, 1500, 'low', '1-2 hours', 'basic', 'low', 'Some features require add-ons. Hubdoc included free with Xero.', 80, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('quickbooks-payroll-builtin', 'QuickBooks Payroll Built-in Features', 'BUILT_IN', 'Direct deposit, tax filing, time tracking, 1099 contractor payments already in QBO.', '{payroll-processing-overspend}', 0, 1200, 'low', '1 hour', 'basic', 'low', 'Payroll add-on required but often cheaper than standalone.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('canva-pro-features', 'Canva Features Most Users Miss', 'BUILT_IN', 'Magic Resize, Brand Kit (free with 1 brand), background remover, content planner.', '{design-costs-overspend}', 0, 800, 'low', '30 minutes', 'none', 'low', 'Some features require Pro. But free tier has more than most realize.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('gmail-advanced', 'Gmail Advanced Features', 'BUILT_IN', 'Scheduled send, confidential mode, templates, labels as folders, search operators.', '{communication-tool-overspend}', 0, 500, 'low', '30 minutes', 'none', 'low', 'Built into free Gmail. Most users use <10% of features.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('linkedin-free-tools', 'LinkedIn Free Business Tools', 'BUILT_IN', 'Company pages, job posts (1 free), content analytics, Sales Navigator free trial, alumni search.', '{marketing-spend-inefficiency,lead-conversion-gap}', 0, 1000, 'low', '1-2 hours', 'none', 'low', 'Free features sufficient for basic outreach. Paid adds InMail and advanced search.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();



-- ═══════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL TEMPLATES (5 entries)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('cash-flow-forecast-template', 'Cash Flow Forecast Template', 'TEMPLATE', 'Free 12-month cash flow projection spreadsheet. BDC, SCORE, SBA versions available.', '{cash-flow-timing-gap,financial-planning-gaps}', 0, 2000, 'low', '2-4 hours', 'basic', 'low', 'Template provides structure. Customize for your business.', 70, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('performance-review-template', 'Employee Performance Review Templates', 'TEMPLATE', 'Free review templates: 360-degree, self-assessment, goal-based. SHRM and SCORE.', '{employee-turnover-cost,hr-software-overspend}', 0, 800, 'low', '1-2 hours', 'none', 'low', 'Templates are starting points. Customize for culture.', 65, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('change-order-template', 'Change Order Template', 'TEMPLATE', 'Free construction/project change order forms. Prevents unbilled scope creep.', '{scope-creep-losses,unbilled-work}', 0, 5000, 'low', '1 hour', 'none', 'low', 'Essential for contractors. Implement from day 1 with new clients.', 85, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('vendor-comparison-matrix', 'Vendor Comparison Matrix Template', 'TEMPLATE', 'Structured template for comparing vendors on price, quality, terms, service.', '{vendor-overspend,supply-cost-overspend}', 0, 1000, 'low', '1 hour', 'none', 'low', 'Simple but effective. Removes emotional purchasing decisions.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();

INSERT INTO free_alternatives (slug, name, type, description, leak_types, estimated_savings_pct, estimated_savings_flat, effort_level, time_to_implement, skill_required, risk_level, limitations, quality_vs_paid, region)
VALUES ('onboarding-checklist-template', 'Employee Onboarding Checklist', 'TEMPLATE', 'Comprehensive onboarding template. Reduces new hire ramp-up time 30-50%.', '{training-cost-inefficiency,employee-turnover-cost}', 0, 2000, 'low', '2-4 hours', 'none', 'low', 'Customize per role. Living document. Update quarterly.', 75, 'ALL')
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT '═══ EXPANSION ADDED ═══' AS header;
SELECT type, COUNT(*) FROM free_alternatives WHERE active=true GROUP BY type ORDER BY count DESC;
SELECT 'TOTAL FREE ALTERNATIVES' AS metric, COUNT(*) AS value FROM free_alternatives WHERE active=true;
SELECT 'COUNTRIES' AS metric, COUNT(DISTINCT region) AS value FROM free_alternatives WHERE region != 'ALL';
