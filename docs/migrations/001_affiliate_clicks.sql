-- Migration: Create affiliate_clicks table for tracking provider link clicks
-- Run this against your Neon database

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  provider TEXT NOT NULL,
  network TEXT,
  context TEXT NOT NULL,
  corridor TEXT NOT NULL DEFAULT 'USD-PHP',
  amount_usd DECIMAL(12, 2),
  affiliate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by provider (analytics dashboards)
CREATE INDEX idx_affiliate_clicks_provider ON affiliate_clicks (provider);

-- Index for querying by user (per-user analytics)
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks (user_id) WHERE user_id IS NOT NULL;

-- Index for time-range queries (daily/weekly reports)
CREATE INDEX idx_affiliate_clicks_created ON affiliate_clicks (created_at);
