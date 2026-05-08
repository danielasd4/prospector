-- MIGRATION: 20260507_001_foundation_settings
-- GOAL: Move critical settings from LocalStorage to Supabase for persistence and security.

-- Table for user profile settings
CREATE TABLE IF NOT EXISTS user_profile_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_cash DECIMAL(15, 2) DEFAULT 0,
  total_fixed_costs DECIMAL(15, 2) DEFAULT 0,
  min_hourly_rate DECIMAL(15, 2) DEFAULT 0,
  has_completed_onboarding BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profile_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own settings
CREATE POLICY "Users can view own settings" 
ON user_profile_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON user_profile_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
ON user_profile_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Migration for existing tables to ensure is_archived and user_id consistency
-- Ensure 'transactions' has correct indexing for filtering
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_archived ON transactions(is_archived);

-- Ensure 'recurring_bills' follows the same pattern
CREATE INDEX IF NOT EXISTS idx_recurring_bills_company_id ON recurring_bills(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_id ON recurring_bills(user_id);

-- Table for monthly snapshots (Immutable history)
CREATE TABLE IF NOT EXISTS monthly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_income DECIMAL(15, 2) DEFAULT 0,
  total_expense DECIMAL(15, 2) DEFAULT 0,
  net_profit DECIMAL(15, 2) DEFAULT 0,
  predictable_revenue DECIMAL(15, 2) DEFAULT 0,
  variable_revenue DECIMAL(15, 2) DEFAULT 0,
  total_hours DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE monthly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own snapshots" 
ON monthly_snapshots FOR ALL 
USING (auth.uid() = user_id);
