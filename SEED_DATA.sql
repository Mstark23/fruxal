-- ============================================================
-- SEED: provincial_leak_detectors
-- Generic Canadian SMB leaks applicable across all provinces.
-- Safe to re-run (ON CONFLICT DO NOTHING).
-- ============================================================

-- QC
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'QC', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'QC', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'QC', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'QC', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'QC', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'QC', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'QC', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'QC', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'QC', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'QC', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'QC', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'QC', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- ON
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'ON', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'ON', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'ON', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'ON', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'ON', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'ON', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'ON', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'ON', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'ON', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'ON', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'ON', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'ON', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- BC
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'BC', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'BC', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'BC', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'BC', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'BC', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'BC', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'BC', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'BC', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'BC', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'BC', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'BC', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'BC', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- AB
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'AB', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'AB', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'AB', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'AB', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'AB', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'AB', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'AB', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'AB', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'AB', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'AB', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'AB', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'AB', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- MB
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'MB', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'MB', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'MB', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'MB', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'MB', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'MB', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'MB', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'MB', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'MB', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'MB', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'MB', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'MB', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- SK
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'SK', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'SK', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'SK', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'SK', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'SK', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'SK', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'SK', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'SK', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'SK', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'SK', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'SK', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'SK', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- NS
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'NS', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'NS', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'NS', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'NS', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'NS', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'NS', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'NS', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'NS', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'NS', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'NS', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'NS', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'NS', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- NB
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'NB', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'NB', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'NB', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'NB', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'NB', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'NB', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'NB', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'NB', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'NB', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'NB', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'NB', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'NB', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- PE
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'PE', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'PE', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'PE', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'PE', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'PE', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'PE', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'PE', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'PE', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'PE', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'PE', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'PE', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'PE', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- NL
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'NL', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'NL', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'NL', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'NL', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'NL', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'NL', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'NL', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'NL', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'NL', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'NL', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'NL', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'NL', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- NT
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'NT', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'NT', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'NT', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'NT', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'NT', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'NT', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'NT', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'NT', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'NT', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'NT', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'NT', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'NT', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- YT
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'YT', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'YT', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'YT', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'YT', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'YT', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'YT', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'YT', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'YT', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'YT', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'YT', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'YT', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'YT', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;

-- NU
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_filing_inefficiency', 'NU', 'GST/HST Input Tax Credits Missed', 'Crédits de taxe sur les intrants GST/TVH manqués',
   'high', 'Fiscalité', 'Most small businesses miss 15-40% of eligible GST/HST input tax credits each year.', 'La plupart des petites entreprises manquent 15-40% de leurs crédits de taxe sur les intrants admissibles.',
   1800, 9500,
   'professional', 90, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('no_bookkeeping_system', 'NU', 'No Bookkeeping System', 'Aucun système de comptabilité',
   'critical', 'Opérations', 'Without accounting software, you are likely missing deductions and overpaying taxes.', 'Sans logiciel comptable, vous manquez probablement des déductions et surpayez vos impôts.',
   3500, 18000,
   'software', 95, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('processing_rate_high', 'NU', 'Card Processing Overpayment', 'Surfacturation des frais de traitement de carte',
   'high', 'Paiements', 'Your effective card processing rate is likely above what comparable businesses pay.', 'Votre taux de traitement effectif est probablement supérieur à celui d''entreprises similaires.',
   1200, 8400,
   'switch', 85, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('banking_fees_high', 'NU', 'Banking Fees Above Average', 'Frais bancaires supérieurs à la moyenne',
   'medium', 'Bancaire', 'Canadian business banking fees vary widely. Most SMBs overpay by switching to better plans.', 'Les frais bancaires pour entreprises varient beaucoup. Changer de forfait peut générer des économies.',
   600, 3600,
   'switch', 70, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('insurance_overpayment', 'NU', 'Insurance Premiums Too High', 'Primes d''assurance trop élevées',
   'medium', 'Assurance', 'Business insurance in Canada is highly competitive. Annual comparison shopping typically yields savings.', 'L''assurance entreprise au Canada est très compétitive. La comparaison annuelle génère habituellement des économies.',
   800, 6000,
   'professional', 72, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('subscription_bloat', 'NU', 'SaaS & Software Overspend', 'Dépenses logicielles excessives',
   'medium', 'Opérations', 'The average SMB pays for 3-5 software tools it barely uses. An annual audit typically uncovers significant savings.', 'La PME moyenne paie pour 3-5 outils logiciels qu''elle utilise à peine.',
   1200, 7200,
   'audit', 68, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('receivables_leakage', 'NU', 'Uncollected Invoices', 'Factures non encaissées',
   'high', 'Revenus', 'Canadian SMBs carry an average of 22 days of overdue receivables. Systematic follow-up recovers this.', 'Les PME canadiennes ont en moyenne 22 jours de créances en souffrance.',
   2400, 24000,
   'process', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('payroll_ratio_high', 'NU', 'Labour Cost Above Benchmark', 'Coût de la main-d''œuvre supérieur au benchmark',
   'high', 'Personnel', 'Your payroll ratio may be higher than industry norms. Scheduling and role clarity are the most common fixes.', 'Votre ratio masse salariale peut être plus élevé que la norme du secteur.',
   3000, 40000,
   'process', 80, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('tax_optimization_gap', 'NU', 'Tax Deductions Being Missed', 'Déductions fiscales manquées',
   'high', 'Fiscalité', 'Home office, vehicle, CCA, SR&ED — Canadian tax law offers extensive deductions that many owners miss.', 'Bureau à domicile, véhicule, DPA, RS&DE — la loi fiscale canadienne offre de nombreuses déductions souvent manquées.',
   2000, 15000,
   'professional', 88, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('revenue_underpricing', 'NU', 'Revenue Erosion from Underpricing', 'Érosion des revenus par sous-tarification',
   'critical', 'Revenus', 'Most Canadian SMBs haven''t reviewed pricing in 2+ years. Even a 5% price increase on existing clients has outsized impact.', 'La plupart des PME canadiennes n''ont pas révisé leur tarification depuis 2 ans ou plus.',
   5000, 50000,
   'strategy', 92, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('debt_interest_high', 'NU', 'Business Debt Interest Gap', 'Coût d''intérêt sur la dette d''entreprise',
   'medium', 'Financement', 'With BDC and EDC rates often below commercial lenders, refinancing can meaningfully reduce interest costs.', 'Avec les taux BDC et EDC souvent inférieurs aux prêteurs commerciaux, un refinancement peut réduire les intérêts.',
   1500, 12000,
   'professional', 65, true)
ON CONFLICT (slug, province) DO NOTHING;
INSERT INTO provincial_leak_detectors
  (slug, province, title, title_fr, severity, category, description, description_fr,
   annual_impact_min, annual_impact_max, solution_type, priority_score, is_active)
VALUES
  ('late_payment_penalties', 'NU', 'CRA Late Payment Penalties', 'Pénalités de retard ARC',
   'high', 'Fiscalité', 'CRA charges compound daily interest plus penalties. A payment schedule eliminates this entirely.', 'L''ARC facture des intérêts composés quotidiens plus des pénalités. Un calendrier de paiement élimine cela.',
   500, 8000,
   'process', 82, true)
ON CONFLICT (slug, province) DO NOTHING;
