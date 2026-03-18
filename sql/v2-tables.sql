-- =============================================================================
-- LEAK & GROW V2 — New Tables for 3-Screen Product
-- =============================================================================
-- Run this in Supabase SQL Editor AFTER existing migrations.
-- These tables power: Dashboard to-do list, AI chat history, action tracking
-- =============================================================================

-- ─── 1. User Actions (Dashboard To-Do Items) ────────────────────────────────
-- Generated from prescan results + engine findings + integrations
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  business_id TEXT,
  scan_id TEXT,
  
  -- What type of action
  action_type TEXT NOT NULL DEFAULT 'fix',
  -- 'switch' = cost saving (swap tools), 'fix' = operational leak, 'collect' = unpaid invoice, 'cancel' = unused subscription, 'review' = contract/document finding
  
  -- Source of this finding
  source TEXT NOT NULL DEFAULT 'prescan',
  -- 'prescan' = GODMODE quiz, 'engine' = deep engine (catalyst/phantom/etc), 'quickbooks' = QB sync, 'bank' = Plaid, 'contract' = document upload
  source_engine TEXT,
  -- which engine found it: 'catalyst', 'phantom', etc. NULL for prescan
  
  -- The leak details
  leak_title TEXT NOT NULL,
  leak_description TEXT,
  leak_category TEXT,
  severity TEXT DEFAULT 'medium',
  -- critical, high, medium, low
  
  estimated_value DECIMAL(10,2) DEFAULT 0,
  -- annual savings or leak amount
  verified BOOLEAN DEFAULT FALSE,
  -- true = from real data (engine/QB), false = estimated (prescan)
  
  -- For SWITCH actions (cost comparison)
  current_tool TEXT,
  current_price DECIMAL(10,2),
  current_price_unit TEXT DEFAULT 'monthly',
  recommended_tool TEXT,
  recommended_price DECIMAL(10,2),
  recommended_price_unit TEXT DEFAULT 'monthly',
  affiliate_url TEXT,
  savings_annual DECIMAL(10,2),
  
  -- For FIX actions (operational leaks)
  fix_description TEXT,
  fix_tool_name TEXT,
  fix_tool_url TEXT,
  fix_tool_price TEXT,
  steps_total INT DEFAULT 1,
  steps_completed INT DEFAULT 0,
  current_step_description TEXT,
  
  -- For COLLECT actions (unpaid invoices)
  client_name TEXT,
  invoice_number TEXT,
  amount_owed DECIMAL(10,2),
  days_overdue INT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending',
  -- pending, in_progress, completed, skipped, dismissed
  priority TEXT DEFAULT 'this_month',
  -- this_week, this_month, this_quarter, backlog
  display_order INT DEFAULT 100,
  
  -- Completion
  completed_at TIMESTAMP,
  actual_savings DECIMAL(10,2),
  completion_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_actions_user ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_status ON user_actions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_actions_priority ON user_actions(user_id, priority, display_order);

-- ─── 2. User Progress (Dashboard Header Stats) ──────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  business_id TEXT,
  
  -- Totals
  total_leak_found DECIMAL(10,2) DEFAULT 0,
  total_recovered DECIMAL(10,2) DEFAULT 0,
  total_verified_leak DECIMAL(10,2) DEFAULT 0,
  
  -- Counts
  actions_total INT DEFAULT 0,
  actions_completed INT DEFAULT 0,
  actions_in_progress INT DEFAULT 0,
  
  -- Scan tracking
  last_prescan_date TIMESTAMP,
  last_deep_scan_date TIMESTAMP,
  next_scan_date TIMESTAMP,
  scan_count INT DEFAULT 0,
  
  -- Integration status
  quickbooks_connected BOOLEAN DEFAULT FALSE,
  bank_connected BOOLEAN DEFAULT FALSE,
  contracts_uploaded INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);

-- ─── 3. Chat Conversations (AI Chat History) ────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  business_id TEXT,
  scan_id TEXT,
  
  title TEXT DEFAULT 'New Conversation',
  
  -- The conversation messages stored as JSONB array
  -- Each message: { role: 'user'|'assistant', content: string, timestamp: string }
  messages JSONB DEFAULT '[]'::jsonb,
  
  -- Context that was loaded for this conversation
  industry TEXT,
  leak_count INT DEFAULT 0,
  total_leak_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  message_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_active ON chat_conversations(user_id, is_active);

-- ─── 4. Affiliate Click Tracking ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  business_id TEXT,
  action_id UUID REFERENCES user_actions(id),
  
  tool_name TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  source TEXT DEFAULT 'chat',
  -- 'chat' = clicked in AI conversation, 'dashboard' = clicked on dashboard card
  
  clicked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON affiliate_clicks(user_id);

-- ─── 5. Prescan Results Storage ─────────────────────────────────────────────
-- Stores the full prescan result so the AI chat can access it
CREATE TABLE IF NOT EXISTS prescan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT,
  
  industry TEXT NOT NULL,
  industry_display TEXT,
  tier TEXT DEFAULT 'mid-size-business',
  revenue_estimate DECIMAL(12,2),
  
  -- Results
  total_leak_amount DECIMAL(10,2) DEFAULT 0,
  leak_count INT DEFAULT 0,
  question_count INT DEFAULT 0,
  
  -- Full leak data as JSONB
  -- Array of: { title, category, severity, low, high, midpoint, benchmark, fix, tool_name, tool_url }
  confirmed_leaks JSONB DEFAULT '[]'::jsonb,
  passed_checks JSONB DEFAULT '[]'::jsonb,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  
  -- Payment
  payment_status TEXT DEFAULT 'free',
  -- free, paid_single, paid_monthly, paid_annual
  stripe_session_id TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescan_results_user ON prescan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_prescan_results_session ON prescan_results(session_id);

-- ─── Helper: Update timestamp trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that need it
DROP TRIGGER IF EXISTS user_actions_updated ON user_actions;
CREATE TRIGGER user_actions_updated BEFORE UPDATE ON user_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS user_progress_updated ON user_progress;
CREATE TRIGGER user_progress_updated BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS chat_conversations_updated ON chat_conversations;
CREATE TRIGGER chat_conversations_updated BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS Policies (if using Supabase auth) ───────────────────────────────────
-- Uncomment these if you enable RLS on these tables
-- ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prescan_results ENABLE ROW LEVEL SECURITY;
