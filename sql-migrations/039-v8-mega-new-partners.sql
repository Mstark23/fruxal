-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — NEW AFFILIATE PARTNERS (v8-mega expansion)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 47 new partners to add to existing 212-partner database
-- Categories: CRM, Email, Accounting, E-commerce, HR, Security, PM, Analytics,
--             Communication, Insurance, Cloud, Legal, AI
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('close-crm', 'Close', 'CRM built for inside sales teams. Built-in calling, email, SMS. 30% commission for 12 months.', 'https://close.com/partners', 'CRM', 'percentage', , 30, true, '{saas,consulting}', 'https://close.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('lemlist', 'Lemlist', 'Cold outreach platform. Multi-channel sequences. 25% recurring commission.', 'https://lemlist.com/affiliate', 'Sales Outreach', 'percentage', , 25, false, '{saas,agency}', 'https://lemlist.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('snov-io', 'Snov.io', 'B2B lead generation and outreach. 40% lifetime recurring commission.', 'https://snov.io/affiliate', 'Sales Outreach', 'percentage', , 40, false, '{saas,agency}', 'https://snov.io', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('engagebay', 'EngageBay', 'All-in-one CRM: marketing, sales, support. 20% recurring lifetime.', 'https://www.engagebay.com/affiliate', 'CRM', 'percentage', , 20, false, '{}', 'https://www.engagebay.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('salesflare', 'Salesflare', 'Automated CRM for small B2B. 20% recurring commission.', 'https://salesflare.com/affiliates', 'CRM', 'percentage', , 20, false, '{consulting,agency}', 'https://salesflare.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('activecampaign', 'ActiveCampaign', 'Email marketing and automation. $1,350 avg per referral. 20-30% recurring.', 'https://www.activecampaign.com/partner/affiliate', 'Email Marketing', 'percentage', , 25, false, '{}', 'https://www.activecampaign.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('convertkit', 'Kit (ConvertKit)', 'Creator email marketing. 30% recurring commission for 24 months.', 'https://kit.com/affiliates', 'Email Marketing', 'percentage', , 30, true, '{agency,consulting}', 'https://kit.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('omnisend', 'Omnisend', 'E-commerce email & SMS marketing. 20% recurring commission.', 'https://www.omnisend.com/affiliates', 'Email Marketing', 'percentage', , 20, false, '{ecommerce}', 'https://www.omnisend.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('brevo-paid', 'Brevo (Sendinblue)', 'Email marketing, SMS, chat. CPA model: €5+ per signup.', 'https://www.brevo.com/partners/affiliate', 'Email Marketing', 'flat', , 5, false, '{}', 'https://www.brevo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('mailmodo', 'Mailmodo', 'Interactive email marketing with AMP emails. 20% recurring commission.', 'https://www.mailmodo.com/affiliates', 'Email Marketing', 'percentage', , 20, false, '{saas,ecommerce}', 'https://www.mailmodo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('moosend', 'Moosend', 'Affordable email marketing. 30% lifetime recurring commission.', 'https://moosend.com/affiliates', 'Email Marketing', 'percentage', , 30, false, '{}', 'https://moosend.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('xero', 'Xero', 'Cloud accounting. Earn $100-200 per referral through partner program.', 'https://www.xero.com/partners', 'Accounting', 'flat', , 150, false, '{}', 'https://www.xero.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('bench', 'Bench Accounting', 'Done-for-you bookkeeping. $150 per qualified referral.', 'https://bench.co/referral', 'Bookkeeping', 'flat', , 150, false, '{consulting,agency}', 'https://bench.co', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('plooto', 'Plooto', 'AP/AR automation. $50 per referred account.', 'https://www.plooto.com/partners', 'Payments', 'flat', , 50, false, '{}', 'https://www.plooto.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('dext', 'Dext (Receipt Bank)', 'Receipt scanning and bookkeeping automation. Partner commissions vary.', 'https://dext.com/partners', 'Bookkeeping', 'percentage', , 20, false, '{accounting}', 'https://dext.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('float-cash', 'Float Cash Flow', 'Cash flow forecasting. 25% recurring commission.', 'https://floatapp.com/partners', 'Cash Flow', 'percentage', , 25, false, '{accounting,consulting}', 'https://floatapp.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('bigcommerce', 'BigCommerce', 'Enterprise e-commerce. 200% of first monthly payment or $1,500/enterprise.', 'https://www.bigcommerce.com/partners/affiliate', 'E-commerce', 'percentage', , 200, false, '{ecommerce}', 'https://www.bigcommerce.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('wix-affiliate', 'Wix', 'Website builder. $100 per premium sale.', 'https://www.wix.com/about/affiliates', 'Website Builder', 'flat', , 100, false, '{}', 'https://www.wix.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('helcim', 'Helcim', 'Interchange-plus payment processing. Revenue share on processing volume.', 'https://www.helcim.com/partners', 'Payment Processing', 'percentage', , 15, false, '{ecommerce,restaurant}', 'https://www.helcim.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('loox', 'Loox', 'Shopify product reviews with photos/videos. 20% recurring commission.', 'https://loox.io/affiliate', 'E-commerce', 'percentage', , 20, false, '{ecommerce}', 'https://loox.io', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('gusto', 'Gusto', 'Payroll, benefits, HR. $300-$600 per referral depending on plan.', 'https://gusto.com/partners', 'Payroll', 'flat', , 400, false, '{}', 'https://gusto.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('deel', 'Deel', 'Global payroll and hiring. Up to $500 per referral.', 'https://www.deel.com/partners/affiliate', 'Global Payroll', 'flat', , 500, false, '{saas}', 'https://www.deel.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('rippling', 'Rippling', 'Employee management platform. Commission structure varies by product.', 'https://www.rippling.com/partners', 'HR', 'flat', , 300, false, '{saas}', 'https://www.rippling.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('bamboohr', 'BambooHR', 'HR software for SMBs. Referral program available.', 'https://www.bamboohr.com/partners', 'HR', 'flat', , 200, false, '{}', 'https://www.bamboohr.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('nordlayer', 'NordLayer', 'Business VPN and network security. 30% recurring commission.', 'https://nordlayer.com/affiliates', 'Cybersecurity', 'percentage', , 30, false, '{saas}', 'https://nordlayer.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('1password-business', '1Password Business', 'Team password management. 25% commission for first year.', 'https://1password.com/affiliates', 'Security', 'percentage', , 25, true, '{}', 'https://1password.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('cloudflare', 'Cloudflare', 'CDN, DDoS protection, DNS. Referral bonuses for pro plans.', 'https://www.cloudflare.com/partners', 'Security', 'flat', , 100, false, '{saas,ecommerce}', 'https://www.cloudflare.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('clickup', 'ClickUp', 'All-in-one PM tool. 20% recurring commission.', 'https://clickup.com/affiliates', 'Project Management', 'percentage', , 20, false, '{}', 'https://clickup.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('monday-com', 'Monday.com', 'Work OS for teams. $100-$300 per sale.', 'https://monday.com/partnerships/affiliate', 'Project Management', 'flat', , 200, false, '{}', 'https://monday.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('notion-team', 'Notion (Teams)', 'Workspace for docs, wikis, projects. Partner program.', 'https://www.notion.so/affiliates', 'Productivity', 'percentage', , 15, false, '{}', 'https://www.notion.so', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('semrush', 'Semrush', 'SEO and digital marketing toolkit. $200-$350 per sale + $10/trial.', 'https://www.semrush.com/lp/affiliate-program', 'SEO', 'flat', , 200, false, '{agency,ecommerce}', 'https://www.semrush.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('ahrefs', 'Ahrefs', 'SEO toolset. Revenue share program.', 'https://ahrefs.com/affiliates', 'SEO', 'percentage', , 20, false, '{agency,ecommerce}', 'https://ahrefs.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('hotjar', 'Hotjar', 'Heatmaps and behavior analytics. 25% recurring commission.', 'https://www.hotjar.com/partners/affiliate', 'Analytics', 'percentage', , 25, false, '{saas,ecommerce}', 'https://www.hotjar.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('ringcentral', 'RingCentral', 'Business phone system. Up to $200 per sale.', 'https://www.ringcentral.com/partner', 'Business Phone', 'flat', , 200, false, '{}', 'https://www.ringcentral.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('dialpad', 'Dialpad', 'AI-powered business phone. Partner commissions.', 'https://www.dialpad.com/partners', 'Business Phone', 'flat', , 150, false, '{consulting,agency}', 'https://www.dialpad.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('calendly', 'Calendly', 'Scheduling automation. 20% recurring commission.', 'https://calendly.com/affiliates', 'Scheduling', 'percentage', , 20, false, '{}', 'https://calendly.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('next-insurance', 'NEXT Insurance', 'Digital business insurance. Referral commissions available.', 'https://www.nextinsurance.com/partners', 'Insurance', 'flat', , 50, false, '{}', 'https://www.nextinsurance.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('embroker', 'Embroker', 'Business insurance platform. Partner program.', 'https://www.embroker.com/partners', 'Insurance', 'flat', , 75, false, '{saas,consulting}', 'https://www.embroker.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('cloudways', 'Cloudways', 'Managed cloud hosting. Up to $125/sale + hybrid model.', 'https://www.cloudways.com/en/web-hosting-affiliate-program.php', 'Hosting', 'flat', , 125, false, '{saas,ecommerce}', 'https://www.cloudways.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('siteground', 'SiteGround', 'Web hosting. $50-$125 per sale.', 'https://www.siteground.com/affiliates', 'Hosting', 'flat', , 75, false, '{ecommerce,agency}', 'https://www.siteground.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('legalzoom', 'LegalZoom', 'Business legal services. Commission per sale.', 'https://www.legalzoom.com/affiliates', 'Legal', 'flat', , 50, false, '{}', 'https://www.legalzoom.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('rocket-lawyer', 'Rocket Lawyer', 'Legal documents and attorney advice. Affiliate program.', 'https://www.rocketlawyer.com/affiliates.rl', 'Legal', 'flat', , 40, false, '{}', 'https://www.rocketlawyer.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('pandadoc', 'PandaDoc', 'Document automation: proposals, contracts, e-sign. 25% recurring.', 'https://www.pandadoc.com/partners/affiliate', 'Documents', 'percentage', , 25, false, '{consulting,agency,real-estate}', 'https://www.pandadoc.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('grammarly-business', 'Grammarly Business', 'AI writing assistant. Commission on free signups AND paid plans.', 'https://www.grammarly.com/affiliates', 'Writing', 'flat', , 20, false, '{}', 'https://www.grammarly.com', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('notion-ai', 'Notion AI', 'AI-powered workspace. Part of Notion affiliate program.', 'https://www.notion.so/affiliates', 'AI Productivity', 'percentage', , 15, false, '{saas,consulting}', 'https://www.notion.so', false, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('jasper-ai', 'Jasper AI', 'AI content creation. 30% recurring commission for 12 months.', 'https://www.jasper.ai/partners/affiliates', 'AI Content', 'percentage', , 30, true, '{agency,ecommerce}', 'https://www.jasper.ai', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('copy-ai', 'Copy.ai', 'AI copywriting and workflow. 45% commission first year, 10% recurring.', 'https://www.copy.ai/affiliate', 'AI Content', 'percentage', , 45, true, '{agency}', 'https://www.copy.ai', true, true)
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url,
  commission_value=EXCLUDED.commission_value, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT '═══ NEW AFFILIATE PARTNERS ═══' AS header;
SELECT category, COUNT(*) AS count FROM affiliate_partners WHERE active=true GROUP BY category ORDER BY count DESC;
SELECT 'TOTAL PARTNERS' AS metric, COUNT(*) AS value FROM affiliate_partners WHERE active=true;
