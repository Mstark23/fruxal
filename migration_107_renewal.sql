ALTER TABLE tier3_engagements
  ADD COLUMN IF NOT EXISTS renewal_outreach_sent_at TIMESTAMPTZ;
