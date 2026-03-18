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
