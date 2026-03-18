-- =============================================================================
-- FRUXAL MISSING_TABLES.sql  —  v3  (conflict-safe, correct column names)
-- Run in Supabase SQL Editor. Safe to re-run (all wrapped in DO blocks).
-- =============================================================================


-- ─── 1. chat_conversations  (uses "userId" camelCase) ────────────────────────

-- ─── users — add password_hash column (code uses this, Prisma schema had 'password') ──
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash text,
    ADD COLUMN IF NOT EXISTS role          text DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS image         text;

CREATE TABLE IF NOT EXISTS chat_conversations (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"          text    NOT NULL,
  messages          jsonb   NOT NULL DEFAULT '[]'::jsonb,
  message_count     int     DEFAULT 0,
  industry          text,
  leak_count        int     DEFAULT 0,
  total_leak_amount numeric DEFAULT 0,
  title             text,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_chat_conversations_userid ON chat_conversations("userId");
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS message_count     int     DEFAULT 0;
  ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS industry          text;
  ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS leak_count        int     DEFAULT 0;
  ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS total_leak_amount numeric DEFAULT 0;
  ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS title             text;
  -- If table was created by v2-tables.sql with user_id (snake_case), add "userId" alias
  ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS "userId"          text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  UPDATE chat_conversations SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Ensure index on "userId" for query performance
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_chatconversations_userid ON chat_conversations("userId");
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── 2. user_progress  (uses "userId" camelCase) ─────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id                     uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"               text    NOT NULL UNIQUE,
  "businessId"            text,
  total_leak_found       numeric DEFAULT 0,
  total_recovered        numeric DEFAULT 0,
  total_verified_leak    numeric DEFAULT 0,
  actions_total          int     DEFAULT 0,
  actions_completed      int     DEFAULT 0,
  actions_in_progress    int     DEFAULT 0,
  leaks_fixed            int     DEFAULT 0,
  last_action_at         timestamptz,
  last_prescan_date      timestamptz,
  last_deep_scan_date    timestamptz,
  scan_count             int     DEFAULT 0,
  quickbooks_connected   boolean DEFAULT false,
  bank_connected         boolean DEFAULT false,
  contracts_uploaded     int     DEFAULT 0,
  payment_status         text    DEFAULT 'free',
  payment_type           text,
  paid_at                timestamptz,
  plan_expires_at        timestamptz,
  stripe_customer_id     text,
  stripe_session_id      text,
  stripe_subscription_id text,
  paid_plan              text,
  onboarding_completed   boolean DEFAULT false,
  tour_completed_at      timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE UNIQUE INDEX idx_user_progress_userid ON user_progress("userId");
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS leaks_fixed            int     DEFAULT 0;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_action_at         timestamptz;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS payment_status         text    DEFAULT 'free';
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS payment_type           text;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS paid_at                timestamptz;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS plan_expires_at        timestamptz;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS stripe_customer_id     text;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS stripe_session_id      text;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS paid_plan              text;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS onboarding_completed   boolean DEFAULT false;
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS tour_completed_at      timestamptz;
  -- If table was created by v2-tables.sql with user_id (snake_case), add "userId" alias
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS "userId"                text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  UPDATE user_progress SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Ensure unique constraint on "userId" so upsert onConflict:"userId" works
DO $$ BEGIN
  ALTER TABLE user_progress ADD CONSTRAINT user_progress_userid_unique UNIQUE ("userId");
EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL; END $$;


-- ─── 3. user_actions  (uses "userId" camelCase) ──────────────────────────────
CREATE TABLE IF NOT EXISTS user_actions (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"        text    NOT NULL,
  leak_title      text    NOT NULL DEFAULT '',
  fix_description text,
  estimated_value numeric DEFAULT 0,
  status          text    NOT NULL DEFAULT 'pending',
  priority        text    NOT NULL DEFAULT 'this_week',
  display_order   int     DEFAULT 100,
  completed_at    timestamptz,
  actual_savings  numeric DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_user_actions_userid ON user_actions("userId");
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE user_actions ADD COLUMN IF NOT EXISTS priority       text DEFAULT 'this_week';
  ALTER TABLE user_actions ADD COLUMN IF NOT EXISTS completed_at   timestamptz;
  ALTER TABLE user_actions ADD COLUMN IF NOT EXISTS actual_savings numeric DEFAULT 0;
  -- If table was created by v2-tables.sql with user_id (snake_case), add "userId" alias
  ALTER TABLE user_actions ADD COLUMN IF NOT EXISTS "userId"       text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Backfill "userId" from user_id where missing (safe, only updates NULLs)
DO $$ BEGIN
  UPDATE user_actions SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Ensure index on "userId" for query performance
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_useractions_userid ON user_actions("userId");
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── 4. leak_actions  (uses user_id snake_case) ──────────────────────────────
CREATE TABLE IF NOT EXISTS leak_actions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        text NOT NULL,
  leak_slug      text NOT NULL,
  status         text NOT NULL DEFAULT 'detected',
  savings_amount numeric DEFAULT 0,
  actioned_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, leak_slug)
);
DO $$ BEGIN
  CREATE INDEX idx_leak_actions_user ON leak_actions(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── 5. obligation_rules ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS obligation_rules (
  id                      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    text    NOT NULL UNIQUE,
  title                   text,
  title_fr                text,
  category                text,
  risk_level              text    DEFAULT 'medium',
  agency                  text,
  frequency               text,
  penalty_min             numeric DEFAULT 0,
  penalty_max             numeric DEFAULT 0,
  penalty_description     text,
  deadline_description    text,
  applies_to_provinces    text[],
  applies_to_industries   text[],
  applies_to_structures   text[],
  min_employees           int     DEFAULT 0,
  min_revenue             numeric DEFAULT 0,
  priority_score          int     DEFAULT 50,
  active                  boolean DEFAULT true,
  created_at              timestamptz DEFAULT now()
);


-- ─── 6. user_obligations  (uses user_id snake_case) ──────────────────────────
CREATE TABLE IF NOT EXISTS user_obligations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text NOT NULL,
  business_id      uuid,
  obligation_slug  text NOT NULL,
  status           text NOT NULL DEFAULT 'upcoming',
  next_deadline    date,
  snoozed_until    date,
  completed_at     timestamptz,
  notes            text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, obligation_slug)
);
DO $$ BEGIN
  CREATE INDEX idx_user_obligations_user ON user_obligations(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── 7. industry_benchmarks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug text NOT NULL,
  metric_key    text NOT NULL,
  metric_name   text,
  avg_value     numeric,
  top_performer numeric,
  unit          text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(industry_slug, metric_key)
);
DO $$ BEGIN
  CREATE INDEX idx_industry_benchmarks_slug ON industry_benchmarks(industry_slug);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;


-- ─── 8. smart_questions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smart_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  question_en text,
  question_fr text,
  industry    text,
  province    text,
  priority    int  DEFAULT 50,
  active      boolean DEFAULT true
);


-- ─── 9. canadian_benchmarks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS canadian_benchmarks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug text NOT NULL,
  province      text,
  metric_key    text NOT NULL,
  value         numeric,
  sample_size   int,
  year          int,
  source        text,
  UNIQUE(industry_slug, province, metric_key, year)
);


-- ─── 10. notification_preferences  (uses user_id snake_case) ─────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL UNIQUE,
  email_enabled     boolean DEFAULT true,
  in_app_enabled    boolean DEFAULT true,
  email_frequency   text    DEFAULT 'smart',
  quiet_start_hour  int     DEFAULT 20,
  quiet_end_hour    int     DEFAULT 8,
  timezone          text    DEFAULT 'America/Montreal',
  min_urgency_email text    DEFAULT 'warning',
  updated_at        timestamptz DEFAULT now()
);


-- ─── 11. subscriptions  (uses user_id snake_case) ────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                text NOT NULL UNIQUE,
  plan                   text NOT NULL DEFAULT 'free',
  status                 text NOT NULL DEFAULT 'active',
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  diagnostics_used       int DEFAULT 0,
  diagnostics_limit      int DEFAULT 1,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);


-- ─── 12. quickbooks_connections — add missing enrichment columns only ─────────
-- Table already exists from migration_097 (user_id uuid, NOT text).
-- Only add columns that migration_097 didn't include.
DO $$ BEGIN
  ALTER TABLE quickbooks_connections
    ADD COLUMN IF NOT EXISTS qb_ar_overdue_30    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS qb_top_expense_cats jsonb,
    ADD COLUMN IF NOT EXISTS qb_bank_balance     numeric;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── detected_leaks — add v2 diagnostic columns ─────────────────────────────
DO $$ BEGIN
  ALTER TABLE detected_leaks
    ADD COLUMN IF NOT EXISTS diagnostic_report_id uuid,
    ADD COLUMN IF NOT EXISTS leak_name            text,
    ADD COLUMN IF NOT EXISTS annual_leak          numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS potential_savings    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS annual_impact_min    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS annual_impact_max    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS evidence             jsonb,
    ADD COLUMN IF NOT EXISTS affiliates           jsonb,
    ADD COLUMN IF NOT EXISTS solution_steps       jsonb,
    ADD COLUMN IF NOT EXISTS solution_type        text DEFAULT 'professional',
    ADD COLUMN IF NOT EXISTS priority_score       int DEFAULT 50;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── businesses — add v2 columns ────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE businesses
    ADD COLUMN IF NOT EXISTS tier                text DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS billing_tier        text,
    ADD COLUMN IF NOT EXISTS streak_days         int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_active_date    date,
    ADD COLUMN IF NOT EXISTS leaks_fixed         int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_recovered     numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS name                text,
    ADD COLUMN IF NOT EXISTS industry_slug       text,
    ADD COLUMN IF NOT EXISTS province            text,
    ADD COLUMN IF NOT EXISTS city                text,
    ADD COLUMN IF NOT EXISTS owner_user_id       text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── diagnostic_reports — CORE TABLE for AI diagnostic engine ────────────────
-- This table is created here since no existing migration defines it.
CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id                       uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id              uuid,
  user_id                  text,
  language                 text    DEFAULT 'en',
  status                   text    NOT NULL DEFAULT 'analyzing'
                                   CHECK (status IN ('analyzing','completed','failed')),
  tier                     text    DEFAULT 'solo',
  input_snapshot           jsonb,
  result_json              jsonb,
  overall_score            int     DEFAULT 0,
  compliance_score         int     DEFAULT 0,
  efficiency_score         int     DEFAULT 0,
  optimization_score       int     DEFAULT 0,
  growth_score             int     DEFAULT 0,
  bankability_score        int     DEFAULT 0,
  exit_readiness_score     int     DEFAULT 0,
  findings_count           int     DEFAULT 0,
  critical_findings        int     DEFAULT 0,
  total_potential_savings  numeric DEFAULT 0,
  total_annual_leaks       numeric DEFAULT 0,
  total_penalty_exposure   numeric DEFAULT 0,
  total_programs_value     numeric DEFAULT 0,
  ebitda_impact            numeric DEFAULT 0,
  enterprise_value_impact  numeric DEFAULT 0,
  model_used               text,
  completed_at             timestamptz,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_diagnostic_reports_user    ON diagnostic_reports(user_id);
  CREATE INDEX idx_diagnostic_reports_biz     ON diagnostic_reports(business_id);
  CREATE INDEX idx_diagnostic_reports_status  ON diagnostic_reports(user_id, status);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE diagnostic_reports ADD COLUMN IF NOT EXISTS model_used text;
  ALTER TABLE diagnostic_reports ADD COLUMN IF NOT EXISTS ebitda_impact numeric DEFAULT 0;
  ALTER TABLE diagnostic_reports ADD COLUMN IF NOT EXISTS enterprise_value_impact numeric DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── 13-15. tier3 core tables ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tier3_reps (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL UNIQUE,
  name       text,
  email      text,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tier3_pipeline (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid,
  stage        text DEFAULT 'lead',
  assigned_rep uuid REFERENCES tier3_reps(id),
  notes        text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tier3_rep_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES tier3_pipeline(id),
  rep_id      uuid REFERENCES tier3_reps(id),
  assigned_at timestamptz DEFAULT now()
);


-- ─── 16-18. tier3 engagement tables ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tier3_engagements (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid,
  pipeline_id       uuid,
  stage             text    DEFAULT 'discovery',
  contract_signed   boolean DEFAULT false,
  savings_target    numeric DEFAULT 0,
  savings_confirmed numeric DEFAULT 0,
  rep_id            uuid,
  status            text    DEFAULT 'active',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tier3_engagement_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid REFERENCES tier3_engagements(id),
  document_type text,
  file_url      text,
  uploaded_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tier3_confirmed_findings (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   uuid    REFERENCES tier3_engagements(id),
  finding_slug    text,
  confirmed_value numeric DEFAULT 0,
  notes           text,
  confirmed_at    timestamptz DEFAULT now()
);


-- ─── 19-20. v3 dashboard tables ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_snapshots (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid,
  user_id       text,
  snapshot_date date    DEFAULT CURRENT_DATE,
  revenue       numeric DEFAULT 0,
  expenses      numeric DEFAULT 0,
  payroll       numeric DEFAULT 0,
  net_income    numeric DEFAULT 0,
  cash_balance  numeric DEFAULT 0,
  source        text    DEFAULT 'manual',
  created_at    timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_financial_snapshots_bid ON financial_snapshots(business_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS snapshot_cost_breakdown (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id    uuid    REFERENCES financial_snapshots(id) ON DELETE CASCADE,
  category       text    NOT NULL,
  amount         numeric DEFAULT 0,
  pct_of_revenue numeric DEFAULT 0,
  benchmark_pct  numeric
);


-- ─── 21. alerts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text    NOT NULL,
  business_id uuid,
  type        text    NOT NULL,
  title       text,
  message     text,
  severity    text    DEFAULT 'info',
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_alerts_user ON alerts(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;



-- ─── prescan_results — add v2 columns and "userId" alias ────────────────────
DO $$ BEGIN
  ALTER TABLE prescan_results
    ADD COLUMN IF NOT EXISTS view_count         int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_viewed_at     timestamptz,
    ADD COLUMN IF NOT EXISTS "userId"           text,
    ADD COLUMN IF NOT EXISTS industry_display   text,
    ADD COLUMN IF NOT EXISTS revenue_estimate   numeric,
    ADD COLUMN IF NOT EXISTS total_leak_amount  numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS leak_count         int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS question_count     int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS confirmed_leaks    jsonb,
    ADD COLUMN IF NOT EXISTS passed_checks      jsonb,
    ADD COLUMN IF NOT EXISTS category_breakdown jsonb,
    ADD COLUMN IF NOT EXISTS payment_status     text DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS temp_user_id       text,
    ADD COLUMN IF NOT EXISTS health_score       int,
    ADD COLUMN IF NOT EXISTS summary            jsonb,
    ADD COLUMN IF NOT EXISTS teaser_leaks       jsonb,
    ADD COLUMN IF NOT EXISTS hidden_leak_count  int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS insights           jsonb,
    ADD COLUMN IF NOT EXISTS obligation_categories jsonb,
    ADD COLUMN IF NOT EXISTS teaser_programs    jsonb,
    ADD COLUMN IF NOT EXISTS hidden_program_count int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS province           text,
    ADD COLUMN IF NOT EXISTS industry           text,
    ADD COLUMN IF NOT EXISTS structure          text,
    ADD COLUMN IF NOT EXISTS tier               text DEFAULT 'solo';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  UPDATE prescan_results SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── tier3_diagnostics ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tier3_diagnostics (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text    NOT NULL,
  company_name    text    NOT NULL,
  industry        text    NOT NULL,
  province        text    NOT NULL,
  annual_revenue  numeric DEFAULT 0,
  employee_count  int     DEFAULT 0,
  report_id       uuid,
  total_leak      numeric DEFAULT 0,
  health_score    int     DEFAULT 50,
  status          text    DEFAULT 'pending',
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_tier3_diag_user ON tier3_diagnostics(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── tier3_agreements ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tier3_agreements (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id       uuid    REFERENCES tier3_diagnostics(id) ON DELETE CASCADE,
  engagement_id       uuid,
  pipeline_id         uuid,
  user_id             text    NOT NULL,
  company_name        text,
  fee_percentage      numeric DEFAULT 12,
  status              text    DEFAULT 'pending',
  signed_at           timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);


-- ─── user_leak_status — tracks per-user leak action status ──────────────────
-- Used by: register (seed), find-user-leaks (read), leaks/action (write)
CREATE TABLE IF NOT EXISTS user_leak_status (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        text    NOT NULL,
  leak_slug      text    NOT NULL,
  status         text    NOT NULL DEFAULT 'detected',
  savings_amount numeric DEFAULT 0,
  fixed_at       timestamptz,
  updated_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, leak_slug)
);
DO $$ BEGIN
  CREATE INDEX idx_user_leak_status_user ON user_leak_status(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── affiliate_partners — add v2 columns ────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE affiliate_partners
    ADD COLUMN IF NOT EXISTS name_fr             text,
    ADD COLUMN IF NOT EXISTS description_fr      text,
    ADD COLUMN IF NOT EXISTS url                 text,
    ADD COLUMN IF NOT EXISTS is_government_program boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS industry_tags       text[],
    ADD COLUMN IF NOT EXISTS tags                text[],
    ADD COLUMN IF NOT EXISTS is_active           boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS priority_score      int DEFAULT 50,
    ADD COLUMN IF NOT EXISTS annual_value_min    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS annual_value_max    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS commission_rate     numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS provinces           text[],
    ADD COLUMN IF NOT EXISTS province            text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ─── provincial_leak_detectors — generic fallback leak data per province ─────
CREATE TABLE IF NOT EXISTS provincial_leak_detectors (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text    NOT NULL,
  province          text    NOT NULL,
  title             text,
  title_fr          text,
  severity          text    DEFAULT 'medium',
  category          text    DEFAULT 'general',
  description       text,
  description_fr    text,
  annual_impact_min numeric DEFAULT 0,
  annual_impact_max numeric DEFAULT 0,
  solution_type     text    DEFAULT 'professional',
  solution_steps    jsonb,
  affiliates        jsonb,
  priority_score    int     DEFAULT 50,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(slug, province)
);
DO $$ BEGIN
  CREATE INDEX idx_pld_province ON provincial_leak_detectors(province, is_active);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;



-- ─── payments — legacy payment records ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text    NOT NULL,
  amount          numeric DEFAULT 0,
  currency        text    DEFAULT 'cad',
  status          text    DEFAULT 'pending',
  stripe_id       text,
  plan            text,
  created_at      timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_payments_user ON payments(user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── scan_snapshots — legacy scan history ────────────────────────────────────
CREATE TABLE IF NOT EXISTS scan_snapshots (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid,
  user_id         text,
  scan_date       timestamptz DEFAULT now(),
  health_score    int DEFAULT 50,
  total_leak      numeric DEFAULT 0,
  leak_count      int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);


-- ─── leaks — legacy leak records (distinct from detected_leaks) ──────────────
CREATE TABLE IF NOT EXISTS leaks (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid,
  user_id         text,
  slug            text,
  title           text,
  category        text,
  severity        text    DEFAULT 'medium',
  annual_impact   numeric DEFAULT 0,
  status          text    DEFAULT 'detected',
  created_at      timestamptz DEFAULT now()
);



-- ─── tier3_rep_commissions — rep commission tracking ─────────────────────────
CREATE TABLE IF NOT EXISTS tier3_rep_commissions (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id            uuid    REFERENCES tier3_reps(id) ON DELETE CASCADE,
  engagement_id     uuid,
  diagnostic_id     uuid,
  commission_amount numeric DEFAULT 0,
  commission_pct    numeric DEFAULT 12,
  status            text    DEFAULT 'pending' CHECK (status IN ('pending','earned','paid','cancelled')),
  earned_at         timestamptz,
  paid_at           timestamptz,
  notes             text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_rep_commissions_rep ON tier3_rep_commissions(rep_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── notifications — in-app notification queue ───────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text    NOT NULL,
  type            text    NOT NULL,
  title           text,
  message         text,
  read            boolean DEFAULT false,
  data            jsonb,
  created_at      timestamptz DEFAULT now()
);
DO $$ BEGIN
  CREATE INDEX idx_notifications_user ON notifications(user_id, read);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN undefined_column THEN NULL; END $$;


-- ─── affiliate_referrals — affiliate referral tracking ───────────────────────
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      uuid,
  user_id           text,
  click_id          text,
  status            text    DEFAULT 'pending',
  commission_amount numeric DEFAULT 0,
  created_at        timestamptz DEFAULT now()
);


-- ─── data_collection_items — items collected via data-collect page ───────────
CREATE TABLE IF NOT EXISTS data_collection_items (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid,
  user_id         text,
  collection_type text,
  label           text,
  status          text    DEFAULT 'pending',
  file_url        text,
  storage_path    text,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);


-- ─── tier3_notes — rep notes on client engagements ───────────────────────────
CREATE TABLE IF NOT EXISTS tier3_notes (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   uuid,
  rep_id          uuid,
  content         text    NOT NULL,
  is_private      boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);


-- ─── webhook_endpoints — registered webhook destinations ─────────────────────
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text,
  url             text    NOT NULL,
  events          text[],
  secret          text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);



-- ─── plaid_connections — Plaid integration state ────────────────────────────
CREATE TABLE IF NOT EXISTS plaid_connections (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid,
  user_id         text,
  access_token    text,
  item_id         text,
  institution_id  text,
  institution_name text,
  status          text    DEFAULT 'connected',
  last_sync       timestamptz,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(business_id)
);


-- ─── stripe_connections — Stripe Connect state ───────────────────────────────
CREATE TABLE IF NOT EXISTS stripe_connections (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid,
  user_id         text,
  stripe_account_id text,
  access_token    text,
  status          text    DEFAULT 'connected',
  connected_at    timestamptz DEFAULT now(),
  UNIQUE(business_id)
);


-- ─── diagnostic_outreach_emails — public company outreach tracking ────────────
CREATE TABLE IF NOT EXISTS diagnostic_outreach_emails (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text    NOT NULL,
  company_name    text,
  company_ticker  text,
  recipient_email text,
  status          text    DEFAULT 'sent',
  report_id       uuid,
  sent_at         timestamptz DEFAULT now()
);

-- ─── 22. business_profiles — add all v2 columns (fully wrapped, safe) ────────
-- Also ensure UNIQUE constraints exist for upsert onConflict to work
DO $$ BEGIN
  ALTER TABLE business_profiles ADD CONSTRAINT bp_user_id_unique UNIQUE (user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE business_profiles ADD CONSTRAINT bp_business_id_unique UNIQUE (business_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE business_profiles
    ADD COLUMN IF NOT EXISTS business_id              uuid,
    ADD COLUMN IF NOT EXISTS business_name            text,
    ADD COLUMN IF NOT EXISTS industry_label           text,
    ADD COLUMN IF NOT EXISTS industry_slug            text,
    ADD COLUMN IF NOT EXISTS industry_naics           text,
    ADD COLUMN IF NOT EXISTS structure                text,
    ADD COLUMN IF NOT EXISTS business_structure       text,
    ADD COLUMN IF NOT EXISTS city                     text,
    ADD COLUMN IF NOT EXISTS province                 text,
    ADD COLUMN IF NOT EXISTS monthly_revenue          numeric,
    ADD COLUMN IF NOT EXISTS annual_revenue           numeric,
    ADD COLUMN IF NOT EXISTS exact_annual_revenue     numeric,
    ADD COLUMN IF NOT EXISTS ebitda_estimate          numeric,
    ADD COLUMN IF NOT EXISTS gross_margin_pct         numeric,
    ADD COLUMN IF NOT EXISTS exact_payroll_total      numeric,
    ADD COLUMN IF NOT EXISTS owner_salary             numeric,
    ADD COLUMN IF NOT EXISTS net_income_last_year     numeric,
    ADD COLUMN IF NOT EXISTS rdtoh_balance            numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sred_claimed_last_year   numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS employee_count           int DEFAULT 1,
    ADD COLUMN IF NOT EXISTS fiscal_year_end_month    int DEFAULT 12,
    ADD COLUMN IF NOT EXISTS exit_horizon             text DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS has_payroll              boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_accountant           boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_bookkeeper           boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_holdco               boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_cda_balance          boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_physical_location    boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS handles_data             boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS handles_food             boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS does_construction        boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS does_rd                  boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS exports_goods            boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS sells_alcohol            boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_professional_order   boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS passive_income_over_50k  boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS lcge_eligible            boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS uses_payroll_software    boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS uses_pos                 boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS incorporation_date       date,
    ADD COLUMN IF NOT EXISTS registration_date        date,
    ADD COLUMN IF NOT EXISTS gst_registration_date    date,
    ADD COLUMN IF NOT EXISTS qst_registration_date    date,
    ADD COLUMN IF NOT EXISTS first_employee_date      date,
    ADD COLUMN IF NOT EXISTS licence_renewal_date     date,
    ADD COLUMN IF NOT EXISTS insurance_renewal_date   date,
    ADD COLUMN IF NOT EXISTS lease_start_date         date,
    ADD COLUMN IF NOT EXISTS lease_end_date           date,
    ADD COLUMN IF NOT EXISTS qb_connected             boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS qb_last_sync_at          timestamptz,
    ADD COLUMN IF NOT EXISTS qb_revenue_ttm           numeric,
    ADD COLUMN IF NOT EXISTS qb_gross_profit_ttm      numeric,
    ADD COLUMN IF NOT EXISTS qb_payroll_ttm           numeric,
    ADD COLUMN IF NOT EXISTS qb_net_income_ttm        numeric,
    ADD COLUMN IF NOT EXISTS qb_bank_balance          numeric,
    ADD COLUMN IF NOT EXISTS qb_ar_overdue_30         numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS qb_top_expense_cats      jsonb,
    ADD COLUMN IF NOT EXISTS plaid_revenue_90d        numeric,
    ADD COLUMN IF NOT EXISTS plaid_expenses_90d       numeric,
    ADD COLUMN IF NOT EXISTS plaid_payroll_deposits   numeric,
    ADD COLUMN IF NOT EXISTS plaid_bank_balance_total numeric,
    ADD COLUMN IF NOT EXISTS plaid_recurring_expenses jsonb,
    ADD COLUMN IF NOT EXISTS stripe_arr               numeric,
    ADD COLUMN IF NOT EXISTS stripe_churn_rate_pct    numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stripe_refund_rate_pct   numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS plan                     text DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS updated_at               timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS tour_step_reached         int DEFAULT 0,
    ADD COLUMN IF NOT EXISTS plaid_connected           boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS plaid_last_sync           timestamptz,
    ADD COLUMN IF NOT EXISTS onboarding_completed      boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS tour_completed_at         timestamptz;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'business_profiles ALTER skipped: %', SQLERRM;
END $$;