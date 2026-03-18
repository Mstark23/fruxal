-- ============================================================================
-- MIGRATION: obligation_rules + user_obligations tables
-- Canadian compliance obligations for Fruxal
-- Run once in Supabase SQL editor
-- ============================================================================

-- ── 1. obligation_rules ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS obligation_rules (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   text UNIQUE NOT NULL,
  title                  text NOT NULL,
  title_fr               text,
  category               text NOT NULL,   -- tax | payroll | registration | compliance | permit | insurance | contract | privacy | safety
  risk_level             text NOT NULL DEFAULT 'medium', -- critical | high | medium | low
  frequency              text,            -- monthly | quarterly | annual | bi-annual | one-time | continuous
  agency                 text,            -- CRA | Revenu Québec | CNESST | etc.
  penalty_min            numeric DEFAULT 0,
  penalty_max            numeric DEFAULT 0,
  penalty_description    text,
  deadline_description   text,
  applies_to_provinces   text[] DEFAULT '{}',   -- empty = all provinces
  applies_to_industries  text[] DEFAULT '{}',   -- empty = all industries
  applies_to_structures  text[] DEFAULT '{}',   -- sole_proprietor | corporation | partnership | etc.
  min_employees          int DEFAULT 0,
  min_revenue            numeric DEFAULT 0,
  priority_score         int DEFAULT 50,        -- 0-100, higher = more important
  active                 boolean DEFAULT true,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ── 2. user_obligations ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_obligations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  business_id       uuid,
  obligation_slug   text NOT NULL REFERENCES obligation_rules(slug) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'upcoming', -- upcoming | overdue | completed | snoozed
  next_deadline     date,
  completed_at      timestamptz,
  snoozed_until     date,
  notes             text,
  actual_cost       numeric,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, obligation_slug)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_obligations_user_id    ON user_obligations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_obligations_business   ON user_obligations(business_id);
CREATE INDEX IF NOT EXISTS idx_user_obligations_status     ON user_obligations(status);
CREATE INDEX IF NOT EXISTS idx_user_obligations_deadline   ON user_obligations(next_deadline);
CREATE INDEX IF NOT EXISTS idx_obligation_rules_province   ON obligation_rules USING gin(applies_to_provinces);
CREATE INDEX IF NOT EXISTS idx_obligation_rules_category   ON obligation_rules(category);
CREATE INDEX IF NOT EXISTS idx_obligation_rules_active     ON obligation_rules(active);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE obligation_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_obligations  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_obligation_rules"  ON obligation_rules;
DROP POLICY IF EXISTS "service_role_all_user_obligations"  ON user_obligations;

CREATE POLICY "service_role_all_obligation_rules"  ON obligation_rules  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_user_obligations"  ON user_obligations  FOR ALL USING (auth.role() = 'service_role');

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_obligation_rules_updated_at  ON obligation_rules;
DROP TRIGGER IF EXISTS trg_user_obligations_updated_at  ON user_obligations;

CREATE TRIGGER trg_obligation_rules_updated_at
  BEFORE UPDATE ON obligation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_user_obligations_updated_at
  BEFORE UPDATE ON user_obligations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: Canadian compliance obligations (universal + Quebec-specific)
-- ============================================================================
INSERT INTO obligation_rules
  (slug, title, title_fr, category, risk_level, frequency, agency, penalty_min, penalty_max, penalty_description, deadline_description, applies_to_provinces, applies_to_industries, applies_to_structures, min_employees, min_revenue, priority_score)
VALUES

-- ── FEDERAL TAX ─────────────────────────────────────────────────────────────
('cra-corporate-t2',
 'T2 Corporate Income Tax Return',
 'Déclaration de revenus T2',
 'tax','critical','annual','CRA',2500,25000,
 'Late filing penalty: 5% of balance + 1%/month up to 12 months',
 'Due 6 months after fiscal year end',
 '{}','{}','{corporation}',0,0,95),

('cra-personal-t1',
 'T1 Personal Income Tax Return',
 'Déclaration de revenus T1',
 'tax','critical','annual','CRA',250,5000,
 'Late filing penalty: 5% of balance owing + 1%/month',
 'Due April 30 (June 15 for self-employed, but balance due April 30)',
 '{}','{}','{sole_proprietor,self_employed}',0,0,95),

('cra-gst-hst-quarterly',
 'GST/HST Return — Quarterly Filer',
 'Déclaration TPS/TVH — Trimestrielle',
 'tax','high','quarterly','CRA',250,2500,
 '$25/day penalty up to 12 months; interest on unpaid amounts',
 'Due 1 month after each quarter end',
 '{}','{}','{}',0,30000,88),

('cra-gst-hst-annual',
 'GST/HST Return — Annual Filer',
 'Déclaration TPS/TVH — Annuelle',
 'tax','high','annual','CRA',250,2500,
 '$25/day penalty; interest on outstanding balance',
 'Due 3 months after fiscal year end',
 '{}','{}','{}',0,1500,85),

('cra-gst-hst-monthly',
 'GST/HST Return — Monthly Filer',
 'Déclaration TPS/TVH — Mensuelle',
 'tax','high','monthly','CRA',250,5000,
 '$25/day penalty up to 12 months',
 'Due 1 month after month end',
 '{}','{}','{}',10,6000000,82),

('cra-payroll-remittance',
 'Payroll Deductions Remittance (CPP/EI/Income Tax)',
 'Versement des retenues salariales (RPC/AE/impôt)',
 'payroll','critical','monthly','CRA',1000,25000,
 '10% penalty on first late remittance; 20% on second within a year',
 'Due by the 15th of the following month (regular remitters)',
 '{}','{}','{}',1,0,95),

('cra-t4-slips',
 'T4 Slips & T4 Summary Filing',
 'Feuillets T4 et sommaire T4',
 'payroll','high','annual','CRA',25,2500,
 '$25/day per late slip, max $2,500 per filing',
 'Due February 28 each year',
 '{}','{}','{}',1,0,90),

('cra-t4a-slips',
 'T4A Slips (Contractors & Fees)',
 'Feuillets T4A (sous-traitants et honoraires)',
 'payroll','medium','annual','CRA',25,2500,
 '$25/day per late slip, max $2,500',
 'Due February 28 each year',
 '{}','{}','{}',0,0,72),

('cra-roe-filing',
 'Record of Employment (ROE) — Employment Insurance',
 'Relevé d'emploi (RE) — Assurance-emploi',
 'payroll','high','continuous','Service Canada',2000,2000,
 'Up to $2,000 fine for late or incorrect ROE',
 'Due within 5 calendar days of employee separation',
 '{}','{}','{}',1,0,80),

('cra-sr-ed-claim',
 'SR&ED Tax Credit Claim (T661)',
 'Demande de crédit RS&DE (T661)',
 'tax','medium','annual','CRA',0,0,
 'No penalty but claim denied if filed late — forfeits 15-35% of R&D spend',
 'Due 18 months after fiscal year end',
 '{}','{}','{}',0,0,70),

-- ── FEDERAL CORPORATE ────────────────────────────────────────────────────────
('corp-annual-return-federal',
 'Federal Annual Return — Corporations Canada',
 'Rapport annuel fédéral — Corporations Canada',
 'registration','high','annual','Corporations Canada',2500,25000,
 'Corporation may be dissolved; $2,500+ restoration fee',
 'Due within 60 days of incorporation anniversary',
 '{}','{}','{corporation}',0,0,88),

('corp-register-beneficial-owners',
 'Register of Individuals with Significant Control (ISC)',
 'Registre des particuliers ayant un contrôle important',
 'compliance','high','annual','Corporations Canada',0,200000,
 'Fine up to $200,000 or 6 months imprisonment',
 'Must be kept current; updated within 15 days of changes',
 '{}','{}','{corporation}',0,0,85),

-- ── PAYROLL / HR ─────────────────────────────────────────────────────────────
('cpp-contributions',
 'Canada Pension Plan (CPP) Contributions',
 'Cotisations au Régime de pensions du Canada (RPC)',
 'payroll','critical','continuous','CRA',0,0,
 'Employer pays 100% of missed contributions + employee share + 10% penalty',
 'Deducted each pay period; remitted with payroll',
 '{}','{}','{}',1,0,95),

('ei-premiums',
 'Employment Insurance (EI) Premiums',
 'Cotisations à l'assurance-emploi (AE)',
 'payroll','critical','continuous','CRA',0,0,
 'Employer pays 1.4× employee rate; penalties for late remittance',
 'Deducted each pay period; remitted with payroll',
 '{}','{}','{}',1,0,95),

('employment-standards-records',
 'Employment Standards — Record Keeping',
 'Normes d'emploi — Tenue de registres',
 'compliance','medium','continuous','ESDC / Province',500,10000,
 'Fines up to $10,000; liability for unpaid wages',
 'Ongoing — records kept 3 years minimum',
 '{}','{}','{}',1,0,70),

('wsib-registration',
 'WSIB / WCB Registration & Premium Remittance',
 'WSIB / CNESST — Inscription et versement de primes',
 'insurance','high','annual','WSIB / WCB',0,50000,
 'Back premiums + 25% penalty; personal liability for directors',
 'Register within 10 days of first employee; remit quarterly or annually',
 '{}','{}','{}',1,0,88),

-- ── BUSINESS REGISTRATION ────────────────────────────────────────────────────
('business-name-registration',
 'Business Name Registration Renewal',
 'Renouvellement d'immatriculation du nom d'entreprise',
 'registration','medium','annual','Provincial Registry',500,5000,
 'Registration lapses; may not conduct business legally',
 'Typically renews every 5 years; check provincial registry',
 '{}','{}','{}',0,0,65),

('business-licence-renewal',
 'Municipal Business Licence Renewal',
 'Renouvellement du permis d'affaires municipal',
 'permit','medium','annual','Municipality',200,5000,
 'Fines and forced closure for operating without valid licence',
 'Varies by municipality; typically January or fiscal year',
 '{}','{}','{}',0,0,72),

-- ── PRIVACY ──────────────────────────────────────────────────────────────────
('pipeda-privacy-policy',
 'PIPEDA Privacy Policy (Federal)',
 'Politique de confidentialité LPRPDE (fédérale)',
 'privacy','high','annual','OPC Canada',0,100000,
 'Up to $100,000 fine; mandatory breach notification',
 'Must be current; review annually',
 '{}','{}','{}',0,0,75),

('breach-notification-pipeda',
 'Privacy Breach Notification to OPC',
 'Notification de violation à l'OPC',
 'privacy','critical','continuous','OPC Canada',0,100000,
 'Up to $100,000 per breach; mandatory 30-day notification',
 'Report within 30 days of becoming aware of a breach',
 '{}','{}','{}',0,0,80),

-- ── QUEBEC-SPECIFIC ──────────────────────────────────────────────────────────
('rq-tvq-return',
 'QST (TVQ) Return — Revenu Québec',
 'Déclaration de TVQ — Revenu Québec',
 'tax','critical','quarterly','Revenu Québec',500,5000,
 '15% of amount owing penalty; interest at prime + 6%',
 'Due same day as GST/HST return',
 '{QC}','{}','{}',0,30000,92),

('rq-co-17-corporate',
 'QC Corporate Income Tax Return CO-17',
 'Déclaration de revenus CO-17',
 'tax','critical','annual','Revenu Québec',500,25000,
 'Additional penalty on top of federal T2 penalties',
 'Due 6 months after fiscal year end (same as T2)',
 '{QC}','{}','{corporation}',0,0,93),

('rq-source-deductions',
 'Quebec Source Deductions Remittance',
 'Versement des retenues à la source (Québec)',
 'payroll','critical','monthly','Revenu Québec',500,25000,
 '15-50% penalty on late or under-remittance',
 'Due by the 15th of the following month',
 '{QC}','{}','{}',1,0,95),

('rq-rl-1-slips',
 'RL-1 Slips (Revenu Québec payroll)',
 'Feuillets RL-1 (Revenu Québec)',
 'payroll','high','annual','Revenu Québec',25,2500,
 '$25/day per late slip; penalties mirror T4',
 'Due February 28 each year (with RQ summary)',
 '{QC}','{}','{}',1,0,90),

('cnesst-registration',
 'CNESST Registration & Employer Declaration',
 'Inscription et déclaration de l'employeur — CNESST',
 'insurance','high','annual','CNESST',0,50000,
 'Back premiums + interest + administrative penalties',
 'Register before first employee starts; declare annually in March',
 '{QC}','{}','{}',1,0,88),

('rclalq-commercial-lease',
 'Lease Compliance — Commercial Real Property',
 'Conformité du bail commercial',
 'contract','medium','annual','Tribunal administratif du logement',0,10000,
 'Damages, lease termination, fines',
 'Review annually; comply with renewal notices deadlines',
 '{QC}','{}','{}',0,0,55),

('rq-loi-25-compliance',
 'Law 25 (Quebec Privacy Law) Compliance',
 'Conformité Loi 25 (vie privée au Québec)',
 'privacy','high','annual','Commission d'accès à l'information',0,25000000,
 'Up to $25M or 4% of global revenue — whichever is higher',
 'Full compliance required since September 2023; annual review',
 '{QC}','{}','{}',0,0,90),

('rq-loi-25-privacy-officer',
 'Law 25 — Appoint Privacy Officer',
 'Loi 25 — Désigner un responsable de la protection des renseignements',
 'privacy','high','one-time','Commission d'accès à l'information',15000,25000000,
 'Significant fines for non-designation',
 'Must be designated; name published on website',
 '{QC}','{}','{}',0,0,85),

-- ── HEALTH & SAFETY ──────────────────────────────────────────────────────────
('ohs-workplace-policy',
 'Occupational Health & Safety Policy',
 'Politique de santé et sécurité au travail',
 'safety','high','annual','Provincial OHS Authority',0,500000,
 'Fines up to $500,000; stop-work orders',
 'Must be current and posted in workplace',
 '{}','{}','{}',5,0,80),

('ohs-first-aid-requirements',
 'First Aid Kit & Certified First Aider',
 'Trousse de premiers soins et secouriste certifié',
 'safety','medium','annual','Provincial OHS / CNESST',500,25000,
 'Fines for non-compliance; liability if worker injured',
 'Inspect kit monthly; certification renewed every 3 years',
 '{}','{}','{}',5,0,65),

-- ── ONTARIO-SPECIFIC ─────────────────────────────────────────────────────────
('on-annual-return',
 'Ontario Annual Return — Ontario Business Registry',
 'Rapport annuel — Registre des entreprises de l'Ontario',
 'registration','high','annual','ServiceOntario',200,2000,
 'Dissolution; reinstatement fee + back returns',
 'Due within 6 months of fiscal year end',
 '{ON}','{}','{corporation}',0,0,88),

('on-wsib-clearance',
 'WSIB Clearance Certificate',
 'Certificat d'autorisation WSIB',
 'insurance','medium','continuous','WSIB Ontario',0,0,
 'Contractors may withhold payment without valid clearance',
 'Obtain before each contract; valid 90 days',
 '{ON}','{}','{}',0,0,65),

-- ── BC-SPECIFIC ──────────────────────────────────────────────────────────────
('bc-annual-report',
 'BC Annual Report — BC Registries',
 'Rapport annuel — Registres BC',
 'registration','high','annual','BC Registries',0,50000,
 'Company struck off; restoration costs',
 'Due within 2 months of incorporation anniversary',
 '{BC}','{}','{corporation}',0,0,88),

('bc-pst-return',
 'BC Provincial Sales Tax (PST) Return',
 'Déclaration de la taxe de vente provinciale (TVP) BC',
 'tax','high','quarterly','BC Ministry of Finance',500,5000,
 'Penalty 10% of tax owing; interest charges',
 'Due last day of the month following the reporting period',
 '{BC}','{}','{}',0,10000,82),

-- ── ALBERTA-SPECIFIC ─────────────────────────────────────────────────────────
('ab-annual-return',
 'Alberta Annual Return — Corporate Registry',
 'Rapport annuel Alberta',
 'registration','high','annual','Service Alberta',200,5000,
 'Dissolution; reinstatement required to operate',
 'Due within 2 months of anniversary of incorporation',
 '{AB}','{}','{corporation}',0,0,85),

-- ── INSURANCE ────────────────────────────────────────────────────────────────
('commercial-general-liability',
 'Commercial General Liability Insurance Review',
 'Révision de l'assurance responsabilité civile commerciale',
 'insurance','medium','annual','Private Insurer',0,0,
 'Uninsured losses; client contracts often require $2M+ coverage',
 'Review policy at renewal; adjust limits annually',
 '{}','{}','{}',0,50000,68),

('directors-officers-insurance',
 'Directors & Officers (D&O) Insurance',
 'Assurance responsabilité des administrateurs et dirigeants',
 'insurance','medium','annual','Private Insurer',0,0,
 'Personal liability for directors without coverage',
 'Review at renewal; required for many bank covenants',
 '{}','{}','{corporation}',2,500000,62),

-- ── BANKING / FINANCE ─────────────────────────────────────────────────────────
('bank-covenant-compliance',
 'Bank Covenant Compliance Reporting',
 'Rapport de conformité des engagements bancaires',
 'compliance','high','quarterly','Bank / Lender',0,0,
 'Loan called; line of credit frozen if covenants breached',
 'Per loan agreement — typically quarterly financial statements',
 '{}','{}','{}',0,500000,78),

('anti-money-laundering',
 'Anti-Money Laundering (AML) Compliance Program',
 'Programme de conformité anti-blanchiment d'argent',
 'compliance','high','annual','FINTRAC',25000,500000,
 'Up to $500,000 per violation; criminal prosecution',
 'Annual review; mandatory for dealers in securities, real estate, finance',
 '{}','{real_estate,financial_services,mortgage,accounting}','{}',0,0,85),

-- ── ACCESSIBILITY ─────────────────────────────────────────────────────────────
('aoda-compliance-ontario',
 'AODA Accessibility Compliance Report',
 'Rapport de conformité AODA (accessibilité Ontario)',
 'compliance','medium','bi-annual','AODA Director (Ontario)',50000,100000,
 'Up to $100,000/day for corporations; name published',
 'Due every 3 years for small business (1-49 employees)',
 '{ON}','{}','{corporation}',1,0,70)

ON CONFLICT (slug) DO UPDATE SET
  title              = EXCLUDED.title,
  title_fr           = EXCLUDED.title_fr,
  category           = EXCLUDED.category,
  risk_level         = EXCLUDED.risk_level,
  frequency          = EXCLUDED.frequency,
  agency             = EXCLUDED.agency,
  penalty_min        = EXCLUDED.penalty_min,
  penalty_max        = EXCLUDED.penalty_max,
  penalty_description= EXCLUDED.penalty_description,
  deadline_description=EXCLUDED.deadline_description,
  applies_to_provinces=EXCLUDED.applies_to_provinces,
  applies_to_structures=EXCLUDED.applies_to_structures,
  min_employees      = EXCLUDED.min_employees,
  min_revenue        = EXCLUDED.min_revenue,
  priority_score     = EXCLUDED.priority_score,
  active             = EXCLUDED.active,
  updated_at         = now();

-- Verify
SELECT category, count(*) FROM obligation_rules GROUP BY category ORDER BY count DESC;
