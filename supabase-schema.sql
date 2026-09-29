-- Nexo Finance Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    country TEXT,
    address TEXT,
    avatar_url TEXT,
    balance NUMERIC DEFAULT 0,
    profit_balance NUMERIC DEFAULT 0,
    staked_balance NUMERIC DEFAULT 0,
    total_withdrawn NUMERIC DEFAULT 0,
    total_deposited NUMERIC DEFAULT 0,
    kyc_status TEXT DEFAULT 'unverified',
    kyc_tier INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    has_deposited_minimum BOOLEAN DEFAULT FALSE,
    withdrawal_fee_paid BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    security_pin TEXT,
    referral_code TEXT,
    referred_by TEXT,
    referral_earnings NUMERIC DEFAULT 0,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    google_sub TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
    user_email TEXT,
    type TEXT NOT NULL,
    method TEXT,
    amount NUMERIC NOT NULL,
    coin TEXT,
    crypto_amount NUMERIC,
    tx_hash TEXT,
    destination_address TEXT,
    status TEXT DEFAULT 'pending',
    details TEXT,
    admin_reason TEXT,
    network_fee NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KYC Documents Table
CREATE TABLE IF NOT EXISTS kyc_docs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
    user_email TEXT,
    full_name TEXT,
    country TEXT,
    doc_type TEXT,
    id_number TEXT,
    front_image_url TEXT,
    back_image_url TEXT,
    selfie_url TEXT,
    proof_of_address_url TEXT,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Admin Wallets Table
CREATE TABLE IF NOT EXISTS admin_wallets (
    id TEXT PRIMARY KEY,
    coin TEXT NOT NULL,
    network TEXT NOT NULL,
    address TEXT NOT NULL,
    qr_code_url TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    label TEXT
);

-- 5. Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
    user_email TEXT,
    type TEXT,
    code TEXT,
    pin TEXT,
    amount NUMERIC,
    status TEXT DEFAULT 'pending',
    image_proof_url TEXT,
    admin_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Cards (Credit/Debit) Table
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
    user_email TEXT,
    full_name TEXT,
    card_number TEXT,
    cardholder_name TEXT,
    expiry_date TEXT,
    cvc TEXT,
    pin TEXT,
    amount NUMERIC,
    billing_address TEXT,
    reference TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Global Settings Table
CREATE TABLE IF NOT EXISTS global_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Active Investments Table
CREATE TABLE IF NOT EXISTS active_investments (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
    plan_id TEXT,
    plan_name TEXT,
    amount NUMERIC,
    crypto_asset TEXT,
    crypto_amount NUMERIC,
    daily_profit_percent NUMERIC,
    expected_profit_usd NUMERIC,
    total_claimed NUMERIC DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    duration_days INTEGER,
    status TEXT DEFAULT 'active',
    auto_compound BOOLEAN DEFAULT FALSE,
    last_claim_date TIMESTAMP WITH TIME ZONE
);

-- 9. Trade Orders Table
CREATE TABLE IF NOT EXISTS trade_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
    pair TEXT,
    type TEXT,
    order_type TEXT,
    price NUMERIC,
    amount NUMERIC,
    total NUMERIC,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Since this backend runs in a trusted serverless function using the Service Role Key, 
-- Row Level Security (RLS) is automatically bypassed for backend operations. 
-- For safety, we enable RLS but add no public policies, meaning direct browser queries will fail.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_orders ENABLE ROW LEVEL SECURITY;
