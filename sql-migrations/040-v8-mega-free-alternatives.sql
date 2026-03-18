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
