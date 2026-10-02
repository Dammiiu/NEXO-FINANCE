-- ============================================================================
-- NEXO FINANCE - SUPABASE SCHEMA + SEED
-- Run this ONCE in Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / ON CONFLICT)
-- ============================================================================

-- 1. USERS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  uid                    TEXT PRIMARY KEY,
  email                  TEXT UNIQUE NOT NULL,
  password               TEXT,                      -- REQUIRED by server.ts (was missing before)
  full_name              TEXT,
  phone                  TEXT,
  country                TEXT,
  address                TEXT,
  avatar_url             TEXT,
  balance                NUMERIC DEFAULT 0,
  profit_balance         NUMERIC DEFAULT 0,
  staked_balance         NUMERIC DEFAULT 0,
  total_withdrawn        NUMERIC DEFAULT 0,
  total_deposited        NUMERIC DEFAULT 0,
  kyc_status             TEXT DEFAULT 'unverified',
  kyc_tier               INTEGER DEFAULT 0,
  is_admin               BOOLEAN DEFAULT FALSE,
  is_verified            BOOLEAN DEFAULT FALSE,
  has_deposited_minimum  BOOLEAN DEFAULT FALSE,
  withdrawal_fee_paid    BOOLEAN DEFAULT FALSE,
  two_factor_enabled     BOOLEAN DEFAULT FALSE,
  security_pin           TEXT DEFAULT '0000',
  referral_code          TEXT,
  referred_by            TEXT,
  referral_earnings      NUMERIC DEFAULT 0,
  is_banned              BOOLEAN DEFAULT FALSE,
  ban_reason             TEXT,
  google_sub             TEXT,
  status                 TEXT DEFAULT 'active',
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRANSACTIONS ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
  user_email           TEXT,
  type                 TEXT NOT NULL,
  method               TEXT,
  amount               NUMERIC NOT NULL,
  coin                 TEXT,
  crypto_amount        NUMERIC,
  tx_hash              TEXT,
  destination_address  TEXT,
  status               TEXT DEFAULT 'pending',
  details              TEXT,
  admin_reason         TEXT,
  network_fee          NUMERIC,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KYC DOCS ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kyc_docs (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
  user_email           TEXT,
  full_name            TEXT,
  country              TEXT,
  doc_type             TEXT,
  id_number            TEXT,
  front_image_url      TEXT,
  back_image_url       TEXT,
  selfie_url           TEXT,
  proof_of_address_url TEXT,
  status               TEXT DEFAULT 'pending',
  admin_notes          TEXT,
  submitted_at         TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at          TIMESTAMPTZ
);

-- 4. ADMIN WALLETS -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_wallets (
  id           TEXT PRIMARY KEY,
  coin         TEXT NOT NULL,
  network      TEXT NOT NULL,
  address      TEXT NOT NULL,
  memo         TEXT,
  qr_code_url  TEXT,
  is_enabled   BOOLEAN DEFAULT TRUE,
  label        TEXT
);

-- 5. GIFT CARDS --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
  user_email       TEXT,
  type             TEXT,
  code             TEXT,
  pin              TEXT,
  amount           NUMERIC,
  status           TEXT DEFAULT 'pending',
  image_proof_url  TEXT,
  admin_reason     TEXT,
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARDS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cards (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
  user_email         TEXT,
  full_name          TEXT,
  card_number        TEXT,
  cardholder_name    TEXT,
  expiry_date        TEXT,
  cvc                TEXT,
  pin                TEXT,
  amount             NUMERIC,
  billing_address    TEXT,
  reference          TEXT,
  status             TEXT DEFAULT 'pending',
  submitted_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GLOBAL SETTINGS ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVE INVESTMENTS ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.active_investments (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
  plan_id              TEXT,
  plan_name            TEXT,
  amount               NUMERIC,
  crypto_asset         TEXT,
  crypto_amount        NUMERIC,
  daily_profit_percent NUMERIC,
  expected_profit_usd  NUMERIC,
  total_claimed        NUMERIC DEFAULT 0,
  start_date           TIMESTAMPTZ,
  end_date             TIMESTAMPTZ,
  duration_days        INTEGER,
  status               TEXT DEFAULT 'active',
  auto_compound        BOOLEAN DEFAULT FALSE,
  last_claim_date      TIMESTAMPTZ
);

-- 9. TRADE ORDERS ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trade_orders (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
  pair        TEXT,
  type        TEXT,
  order_type  TEXT,
  price       NUMERIC,
  amount      NUMERIC,
  total       NUMERIC,
  status      TEXT DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_tx_user       ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_created    ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_user     ON public.kyc_docs(user_id);
CREATE INDEX IF NOT EXISTS idx_gc_user       ON public.gift_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user    ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_inv_user      ON public.active_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON public.trade_orders(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Locks the anon/authenticated roles out of the browser. The backend uses the
-- service-role secret, which bypasses RLS, so the API keeps working.
-- ============================================================================
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_docs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_wallets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_orders       ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Admin / institutional investor account
INSERT INTO public.users (
  uid, email, password, full_name, phone, country, address, avatar_url,
  balance, profit_balance, staked_balance, total_withdrawn, total_deposited,
  kyc_status, kyc_tier, is_admin, is_verified, has_deposited_minimum,
  withdrawal_fee_paid, two_factor_enabled, security_pin,
  referral_code, referral_earnings, is_banned, status, created_at
) VALUES (
  'usr_institutional_01',
  'investor@nexo-client.com',
  'password123',
  'Alexander Vance',
  '+1 (555) 234-8890',
  'United States',
  '450 Lexington Ave, New York, NY',
  '',
  48500.00, 12450.00, 35000.00, 18000.00, 71500.00,
  'verified_tier2', 2, TRUE, TRUE, TRUE,
  TRUE, TRUE, '1234',
  'NEXO888', 2400.00, FALSE, 'active',
  NOW() - INTERVAL '30 days'
) ON CONFLICT (uid) DO NOTHING;

-- Deposit gateway wallets
INSERT INTO public.admin_wallets (id, coin, network, address, memo, qr_code_url, is_enabled, label) VALUES
  ('wlt_btc_01',  'Bitcoin',  'BTC (Native SegWit)', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', '', '', TRUE, 'Primary BTC Cold Vault'),
  ('wlt_eth_01',  'Ethereum', 'ERC20',               '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '', '', TRUE, 'ETH Institutional Vault'),
  ('wlt_usdt_01', 'USDT',     'TRC20',               'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',      '', '', TRUE, 'USDT TRC20 Prime'),
  ('wlt_usdc_01', 'USDC',     'ERC20',               '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '', '', TRUE, 'USDC ERC20 Vault'),
  ('wlt_bnb_01',  'BNB',      'BEP20',               '0x000000000000000000000000000000000000dead', '', '', TRUE, 'BNB Smart Chain Vault')
ON CONFLICT (id) DO NOTHING;

-- Platform rules / settings
INSERT INTO public.global_settings (key, value, description) VALUES
  ('min_withdrawal',                '100',    'Minimum withdrawal amount in USD'),
  ('withdrawal_fee_percent',        '1.5',    'Withdrawal fee percentage'),
  ('min_deposit_for_withdrawal',    '500',    'Minimum deposit required to enable withdrawals'),
  ('maintenance_mode',              'false',  'Enable/disable maintenance mode'),
  ('registration_enabled',          'true',   'Allow new user registrations'),
  ('kyc_required_for_withdrawal',   'true',   'Require KYC verification for withdrawals'),
  ('max_daily_withdrawal',          '50000',  'Maximum withdrawal per day in USD'),
  ('referral_bonus_percent',        '5',      'Referral bonus percentage'),
  ('global_alert_banner',           '',       'Broadcast banner on live ticker')
ON CONFLICT (key) DO NOTHING;

-- Sample settled transactions so the admin ledger is not empty on first login
INSERT INTO public.transactions (
  id, user_id, user_email, type, method, amount, coin, crypto_amount,
  tx_hash, destination_address, status, details, created_at
) VALUES
  ('tx-dep-01', 'usr_institutional_01', 'investor@nexo-client.com', 'deposit', 'crypto', 50000,
   'Bitcoin (BTC)', 0.518, '0x8f4d92a1c0e3b74958671f2849e7a9b01c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
   'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'approved',
   'Institutional On-Chain BTC Settlement', NOW() - INTERVAL '2 days'),
  ('tx-wth-02', 'usr_institutional_01', 'investor@nexo-client.com', 'withdrawal', 'crypto', 18000,
   'USDT (TRC-20)', 18000, '0x1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8f4d92a1c0e3b74958671f2849e7a9b0',
   'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', 'approved',
   'Disbursal to Institutional Cold Storage', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
