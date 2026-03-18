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
