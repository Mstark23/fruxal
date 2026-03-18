-- ═══════════════════════════════════════════════════════════════════════════════
-- LEAK & GROW — EXPANSION: ADDITIONAL AFFILIATE PARTNERS (v8-expansion)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run AFTER v8-mega-new-partners.sql
-- Adds 57 more partners to the database
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('zoho-crm', 'Zoho CRM', 'Full CRM suite with 50+ apps. 15% recurring commission, 90-day cookie.', 'https://www.zoho.com/affiliate.html', 'CRM', 'percentage', , 15, false, '{}', 'https://www.zoho.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('keap', 'Keap (Infusionkeep)', 'CRM and marketing automation for small businesses. 20% recurring commission.', 'https://keap.com/partners/affiliate', 'CRM', 'percentage', , 20, false, '{}', 'https://keap.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('copper-crm', 'Copper CRM', 'Google Workspace-native CRM. Partner program with commissions.', 'https://www.copper.com/partners', 'CRM', 'flat', , 200, false, '{consulting,agency}', 'https://www.copper.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('freshsales', 'Freshsales (Freshworks)', 'AI-powered CRM. 20% recurring commission on all Freshworks products.', 'https://www.freshworks.com/partners/affiliate', 'CRM', 'percentage', , 20, false, '{}', 'https://www.freshworks.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('pipeline-crm', 'Pipeline CRM', 'Sales CRM for SMBs. 20% lifetime recurring commission, 90-day cookie.', 'https://pipelinecrm.com/partners', 'CRM', 'percentage', , 20, false, '{consulting}', 'https://pipelinecrm.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('getresponse', 'GetResponse', 'Email marketing and automation. 33% recurring or $100 one-time per sale.', 'https://www.getresponse.com/affiliate-programs', 'Email Marketing', 'percentage', , 33, false, '{}', 'https://www.getresponse.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('aweber', 'AWeber', 'Email marketing for small business. Up to 50% recurring lifetime commission.', 'https://www.aweber.com/advocates.htm', 'Email Marketing', 'percentage', , 50, false, '{}', 'https://www.aweber.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('drip', 'Drip', 'E-commerce email marketing. 20% recurring commission.', 'https://www.drip.com/partners/affiliate', 'Email Marketing', 'percentage', , 20, false, '{ecommerce}', 'https://www.drip.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('mailerlite', 'MailerLite', 'Simple email marketing. 30% lifetime recurring commission.', 'https://www.mailerlite.com/affiliate-program', 'Email Marketing', 'percentage', , 30, false, '{}', 'https://www.mailerlite.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('constant-contact', 'Constant Contact', 'Email marketing. $105 per referral who pays.', 'https://www.constantcontact.com/partners/affiliate', 'Email Marketing', 'flat', , 105, false, '{}', 'https://www.constantcontact.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('klaviyo', 'Klaviyo', 'E-commerce marketing automation. Partner program with revenue share.', 'https://www.klaviyo.com/partners', 'Email Marketing', 'percentage', , 15, false, '{ecommerce}', 'https://www.klaviyo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('socialpilot', 'SocialPilot', 'Social media management. 30% recurring commission.', 'https://www.socialpilot.co/affiliate-program', 'Social Media', 'percentage', , 30, false, '{agency}', 'https://www.socialpilot.co', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('brand24', 'Brand24', 'Social media monitoring. 20% recurring commission.', 'https://brand24.com/referral-program', 'Social Media', 'percentage', , 20, false, '{agency,ecommerce}', 'https://brand24.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('freshbooks', 'FreshBooks', 'Cloud accounting for small business. $10 per trial + $200 per subscription.', 'https://www.freshbooks.com/affiliate-program', 'Accounting', 'flat', , 200, false, '{}', 'https://www.freshbooks.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('sage-accounting', 'Sage Accounting', 'Global accounting software. Commission on sales and free trials.', 'https://www.sage.com/en-us/affiliate-program', 'Accounting', 'flat', , 100, false, '{}', 'https://www.sage.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('zoho-books', 'Zoho Books', 'Cloud accounting. 15% recurring commission as part of Zoho affiliate.', 'https://www.zoho.com/affiliate.html', 'Accounting', 'percentage', , 15, false, '{}', 'https://www.zoho.com/books', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('bill-com', 'BILL (Bill.com)', 'AP/AR automation. Partner referral program.', 'https://www.bill.com/partners', 'Payments', 'flat', , 150, false, '{accounting}', 'https://www.bill.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('melio', 'Melio', 'Free business payments. Partner referral rewards.', 'https://meliopayments.com/partners', 'Payments', 'flat', , 50, false, '{}', 'https://meliopayments.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('paychex', 'Paychex', 'Payroll and HR. Referral bonus up to $250 per client.', 'https://www.paychex.com/partnerships', 'Payroll', 'flat', , 250, false, '{}', 'https://www.paychex.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('onpay', 'OnPay', 'Simple payroll. $100 per referral.', 'https://onpay.com/referral-partner', 'Payroll', 'flat', , 100, false, '{}', 'https://onpay.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('homebase', 'Homebase', 'Free scheduling and time tracking. Partner commissions on paid plans.', 'https://joinhomebase.com/partners', 'HR', 'flat', , 75, false, '{restaurant}', 'https://joinhomebase.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('when-i-work', 'When I Work', 'Employee scheduling app. Partner program available.', 'https://wheniwork.com/partners', 'HR', 'flat', , 50, false, '{restaurant,healthcare}', 'https://wheniwork.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('squarespace', 'Squarespace', 'Website builder. Earn commission on new annual subscriptions.', 'https://www.squarespace.com/affiliates', 'Website Builder', 'flat', , 100, false, '{}', 'https://www.squarespace.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('webflow', 'Webflow', 'Visual web development platform. 50% revenue for 12 months.', 'https://webflow.com/affiliates', 'Website Builder', 'percentage', , 50, true, '{agency}', 'https://webflow.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('teachable', 'Teachable', 'Course platform. 30% recurring commission.', 'https://teachable.com/affiliates', 'E-learning', 'percentage', , 30, false, '{consulting}', 'https://teachable.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('samcart', 'SamCart', 'Checkout pages and sales funnels. 40% recurring commission.', 'https://www.samcart.com/affiliate-program', 'E-commerce', 'percentage', , 40, false, '{ecommerce}', 'https://www.samcart.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('thinkific', 'Thinkific', 'Online course platform. 30% recurring commission for 12 months.', 'https://www.thinkific.com/affiliates', 'E-learning', 'percentage', , 30, true, '{consulting}', 'https://www.thinkific.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('kinsta', 'Kinsta', 'Premium WordPress hosting. Up to $500 per referral + 10% recurring.', 'https://kinsta.com/affiliates', 'Hosting', 'flat', , 500, false, '{agency,ecommerce}', 'https://kinsta.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('vultr', 'Vultr', 'Cloud hosting. $35 per qualified referral.', 'https://www.vultr.com/affiliates', 'Hosting', 'flat', , 35, false, '{saas}', 'https://www.vultr.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('digitalocean', 'DigitalOcean', 'Cloud infrastructure. $200 per referral who spends $25+.', 'https://www.digitalocean.com/referral-program', 'Hosting', 'flat', , 200, false, '{saas}', 'https://www.digitalocean.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('namecheap', 'Namecheap', 'Domains and hosting. 20-35% commission.', 'https://www.namecheap.com/affiliates', 'Hosting', 'percentage', , 25, false, '{}', 'https://www.namecheap.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('nordvpn-business', 'NordVPN', 'VPN service. 40-100% first month + 30% recurring.', 'https://nordvpn.com/affiliates', 'Security', 'percentage', , 40, false, '{}', 'https://nordvpn.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('surfshark', 'Surfshark', 'VPN service. 40% recurring commission.', 'https://surfshark.com/affiliates', 'Security', 'percentage', , 40, false, '{}', 'https://surfshark.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('dashlane-business', 'Dashlane Business', 'Password manager for teams. Referral program.', 'https://www.dashlane.com/business/partnerships', 'Security', 'flat', , 100, false, '{}', 'https://www.dashlane.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('surfer-seo', 'Surfer SEO', 'AI content optimization. 25% recurring commission.', 'https://surferseo.com/affiliate-program', 'SEO', 'percentage', , 25, false, '{agency,ecommerce}', 'https://surferseo.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('writesonic', 'Writesonic', 'AI writing tool. 30% lifetime recurring commission.', 'https://writesonic.com/affiliate', 'AI Content', 'percentage', , 30, false, '{agency}', 'https://writesonic.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('descript', 'Descript', 'AI video/podcast editing. 15% recurring commission.', 'https://www.descript.com/affiliates', 'AI Video', 'percentage', , 15, false, '{agency,consulting}', 'https://www.descript.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('loom', 'Loom', 'Video messaging for teams. Partner program.', 'https://www.loom.com/partners', 'Video', 'flat', , 50, false, '{saas,consulting}', 'https://www.loom.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('calendly-pro', 'Calendly Pro', 'Advanced scheduling. 20% recurring commission.', 'https://calendly.com/partners', 'Scheduling', 'percentage', , 20, false, '{}', 'https://calendly.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('intercom', 'Intercom', 'Customer messaging platform. Partner program with revenue share.', 'https://www.intercom.com/partners', 'Customer Support', 'percentage', , 15, false, '{saas,ecommerce}', 'https://www.intercom.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('zendesk', 'Zendesk', 'Customer service platform. Partner referral program.', 'https://www.zendesk.com/partners/technology', 'Customer Support', 'flat', , 200, false, '{}', 'https://www.zendesk.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('freshdesk', 'Freshdesk', 'Customer support. 20% recurring (Freshworks affiliate).', 'https://www.freshworks.com/partners/affiliate', 'Customer Support', 'percentage', , 20, false, '{}', 'https://www.freshdesk.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('helpscout', 'Help Scout', 'Customer support for growing teams. Partner program.', 'https://www.helpscout.com/partners/affiliate', 'Customer Support', 'percentage', , 20, false, '{saas}', 'https://www.helpscout.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('livechat', 'LiveChat', 'Live chat software. 20% recurring lifetime commission.', 'https://partners.livechat.com', 'Customer Support', 'percentage', , 20, false, '{ecommerce,saas}', 'https://www.livechat.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('tidio', 'Tidio', 'Live chat + chatbot. 20% recurring commission.', 'https://www.tidio.com/affiliate-program', 'Customer Support', 'percentage', , 20, false, '{ecommerce}', 'https://www.tidio.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('typeform', 'Typeform', 'Interactive forms and surveys. 20% recurring commission.', 'https://www.typeform.com/partners/affiliate', 'Forms', 'percentage', , 20, false, '{}', 'https://www.typeform.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('jotform', 'Jotform', 'Online form builder. 30% commission for first year.', 'https://www.jotform.com/affiliates', 'Forms', 'percentage', , 30, true, '{}', 'https://www.jotform.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('surveysparrow', 'SurveySparrow', 'Survey and experience management. 25% commission.', 'https://surveysparrow.com/partner-programs/affiliate', 'Surveys', 'percentage', , 25, false, '{healthcare,consulting}', 'https://surveysparrow.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('docusign', 'DocuSign', 'E-signature and CLM. Referral program with commissions.', 'https://www.docusign.com/partners/referral', 'E-signature', 'flat', , 100, false, '{}', 'https://www.docusign.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('proposify', 'Proposify', 'Proposal software. 25% recurring commission.', 'https://www.proposify.com/affiliate', 'Documents', 'percentage', , 25, false, '{consulting,agency}', 'https://www.proposify.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('signaturely', 'Signaturely', 'E-signature tool. 25% recurring commission.', 'https://signaturely.com/affiliate', 'E-signature', 'percentage', , 25, false, '{law-firm,real-estate}', 'https://signaturely.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('toast-pos', 'Toast POS', 'Restaurant POS. Referral bonuses per qualified restaurant.', 'https://pos.toasttab.com/partners', 'Restaurant POS', 'flat', , 250, false, '{restaurant}', 'https://pos.toasttab.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('vagaro', 'Vagaro', 'Salon/spa booking and POS. Referral commission.', 'https://www.vagaro.com/referral', 'Beauty/Wellness', 'flat', , 100, false, '{healthcare}', 'https://www.vagaro.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('jobber', 'Jobber', 'Field service management. 20% commission for 12 months.', 'https://getjobber.com/partners', 'Field Service', 'percentage', , 20, true, '{construction}', 'https://getjobber.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('buildertrend', 'Buildertrend', 'Construction project management. Referral program.', 'https://buildertrend.com/referral', 'Construction', 'flat', , 200, false, '{construction}', 'https://buildertrend.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('simplepractice', 'SimplePractice', 'Practice management for health/wellness. 1 month free per referral.', 'https://www.simplepractice.com/referral', 'Healthcare', 'flat', , 50, false, '{healthcare}', 'https://www.simplepractice.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();

INSERT INTO affiliate_partners (slug, name, description, referral_url, category, commission_type, commission_value, commission_recurring, industries_served, website_url, data_verified, active)
VALUES ('clio', 'Clio', 'Legal practice management. Referral program.', 'https://www.clio.com/partnerships/referral', 'Legal', 'flat', , 200, false, '{law-firm}', 'https://www.clio.com', true, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, referral_url=EXCLUDED.referral_url, commission_value=EXCLUDED.commission_value, updated_at=NOW();


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT '═══ EXPANSION PARTNERS ═══' AS header;
SELECT category, COUNT(*) AS count FROM affiliate_partners WHERE active=true GROUP BY category ORDER BY count DESC;
SELECT 'TOTAL PARTNERS' AS metric, COUNT(*) AS value FROM affiliate_partners WHERE active=true;
