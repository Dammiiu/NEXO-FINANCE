import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Supabase Client ───────────────────────────────────────────────────────────
// The service-role key grants full read/write access to the database, so it is
// read from the environment only. A previous version had the live key committed
// as a fallback, which exposed the whole database to anyone with repo access.
// Refuse to boot rather than silently running without persistence.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://edpbhfxkflgtqgygjfyg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error(
    'FATAL: SUPABASE_SERVICE_KEY is not set. The API cannot reach the database without it.'
  );
  process.exit(1);
}

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
    name: 'Starter Plan',
    profit: '25.00',
    dailyProfitPercent: 25.0,
    min: '200',
    minDepositUsd: 200,
    max: '999',
    maxDepositUsd: 999,
    days: '3 days lockup',
    durationDays: 3,
    desc: 'Perfect for beginners. Low risk, steady daily returns.',
    features: ['Instant hourly payout', 'Capital returned upon maturity', 'Multi-coin allocation support', '24/7 dedicated auditor chat'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    profit: '30.00',
    dailyProfitPercent: 30.0,
    min: '1,000',
    minDepositUsd: 1000,
    max: '4,999',
    maxDepositUsd: 4999,
    days: '7 days lockup',
    durationDays: 7,
    desc: 'Our most popular plan. Balanced risk & high daily returns.',
    features: ['Compounded daily interest', 'Principal insurance guarantee', 'Priority withdrawal speed', 'Institutional sub-account tier'],
    popular: true,
  },
  {
    id: 'executive',
    name: 'Executive Plan',
    profit: '40.00',
    dailyProfitPercent: 40.0,
    min: '5,000',
    minDepositUsd: 5000,
    max: '19,999',
    maxDepositUsd: 19999,
    days: '14 days lockup',
    durationDays: 14,
    desc: 'For serious crypto wealth builders. High yield staking.',
    features: ['High-frequency mining node access', 'Direct VIP risk manager', 'Zero liquidation fee', 'Free wire & crypto disbursements'],
    popular: false,
  },
  {
    id: 'institutional',
    name: 'VIP Institutional Plan',
    profit: '50.00',
    dailyProfitPercent: 50.0,
    min: '20,000',
    minDepositUsd: 20000,
    max: '100,000+',
    maxDepositUsd: 100000,
    days: '30 days lockup',
    durationDays: 30,
    desc: 'Maximum APY staking backed by institutional collateral.',
    features: ['Institutional collateral reserve pool', 'Custom SLA yield contract', 'Direct OTC desk connection', 'Dedicated compliance team'],
    popular: false,
  },
];

// ── In-Memory Resilient Stores (Ensures zero blank screens or unauthorized errors) ──
const usersStore: any[] = [
  {
    uid: 'usr_institutional_01',
    email: 'investor@nexo-client.com',
    password: 'password123',
    fullName: 'Alexander Vance',
    phone: '+1 (555) 234-8890',
    country: 'United States',
    address: '450 Lexington Ave, New York, NY',
    avatarUrl: '',
    balance: 48500.0,
    profitBalance: 12450.0,
    stakedBalance: 35000.0,
    totalWithdrawn: 18000.0,
    totalDeposited: 71500.0,
    kycStatus: 'verified_tier2',
    kycTier: 2,
    isAdmin: true,
    isVerified: true,
    hasDepositedMinimum: true,
    withdrawalFeePaid: true,
    twoFactorEnabled: true,
    securityPin: '1234',
    referralCode: 'NEXO888',
    referredBy: undefined,
    referralEarnings: 2400.0,
    isBanned: false,
    banReason: '',
    googleSub: undefined,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const walletsStore: any[] = [
  {
    id: 'wlt_btc_01',
    coin: 'Bitcoin',
    network: 'BTC (Native SegWit)',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    label: 'Primary BTC Cold Vault',
    memo: '',
    isEnabled: true,
    qrCodeUrl: '',
  },
  {
    id: 'wlt_eth_01',
    coin: 'Ethereum',
    network: 'ERC20',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    label: 'ETH Institutional Vault',
    memo: '',
    isEnabled: true,
    qrCodeUrl: '',
  },
  {
    id: 'wlt_usdt_01',
    coin: 'USDT',
    network: 'TRC20',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    label: 'USDT TRC20 Prime',
    memo: '',
    isEnabled: true,
    qrCodeUrl: '',
  },
  {
    id: 'wlt_usdc_01',
    coin: 'USDC',
    network: 'ERC20',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    label: 'USDC ERC20 Vault',
    memo: '',
    isEnabled: true,
    qrCodeUrl: '',
  },
  {
    id: 'wlt_bnb_01',
    coin: 'BNB',
    network: 'BEP20',
    address: '0x000000000000000000000000000000000000dead',
    label: 'BNB Smart Chain Vault',
    memo: '',
    isEnabled: true,
    qrCodeUrl: '',
  },
];

const settingsStore: any[] = [
  { key: 'min_withdrawal', value: '100', description: 'Minimum withdrawal amount in USD', updatedAt: new Date().toISOString() },
  { key: 'withdrawal_fee_percent', value: '1.5', description: 'Withdrawal fee percentage', updatedAt: new Date().toISOString() },
  { key: 'min_deposit_for_withdrawal', value: '500', description: 'Minimum deposit required to enable withdrawals', updatedAt: new Date().toISOString() },
  { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode', updatedAt: new Date().toISOString() },
  { key: 'registration_enabled', value: 'true', description: 'Allow new user registrations', updatedAt: new Date().toISOString() },
  { key: 'kyc_required_for_withdrawal', value: 'true', description: 'Require KYC verification for withdrawals', updatedAt: new Date().toISOString() },
  { key: 'max_daily_withdrawal', value: '50000', description: 'Maximum withdrawal per day in USD', updatedAt: new Date().toISOString() },
  { key: 'referral_bonus_percent', value: '5', description: 'Referral bonus percentage', updatedAt: new Date().toISOString() },
  { key: 'global_alert_banner', value: '', description: 'Broadcast banner on live ticker', updatedAt: new Date().toISOString() },
];

const transactionsStore: any[] = [
  {
    id: 'tx-dep-01',
    userId: 'usr_institutional_01',
    userEmail: 'investor@nexo-client.com',
    type: 'deposit',
    method: 'crypto',
    amount: 50000,
    coin: 'Bitcoin (BTC)',
    cryptoAmount: 0.518,
    status: 'approved',
    destinationAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    txHash: '0x8f4d92a1c0e3b74958671f2849e7a9b01c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    details: 'Institutional On-Chain BTC Settlement',
  },
  {
    id: 'tx-wth-02',
    userId: 'usr_institutional_01',
    userEmail: 'investor@nexo-client.com',
    type: 'withdrawal',
    method: 'crypto',
    amount: 18000,
    coin: 'USDT (TRC-20)',
    cryptoAmount: 18000,
    status: 'approved',
    destinationAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    txHash: '0x1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8f4d92a1c0e3b74958671f2849e7a9b0',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    details: 'Disbursal to Institutional Cold Storage',
  },
];

const kycDocsStore: any[] = [];
const giftCardsStore: any[] = [];
const cardsStore: any[] = [];
const investmentsStore: any[] = [];
const tradeOrdersStore: any[] = [];

// ── Utility Helpers ───────────────────────────────────────────────────────────
const genId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

const randomBalance = () => Math.floor(Math.random() * (6898 - 3400 + 1)) + 3400;

const mergeStore = (dbItems: any[], localStore: any[], key = 'id') => {
  if (!dbItems || !Array.isArray(dbItems) || dbItems.length === 0) return localStore;
  const dbKeys = new Set(dbItems.map((item) => item[key]));
  return [...dbItems, ...localStore.filter((item) => !dbKeys.has(item[key]))];
};

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

const safeUser = (u: any) => {
  if (!u) return null;
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
  // For PayPal payouts the deliverable account is stored in the destination
  // column, since the table has no dedicated paypal column.
  paypalEmail: r.method === 'paypal' ? r.destination_address : undefined,
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
  isEnabled: r.is_enabled !== false,
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

// ── Auth Helper (Robust Dual-Layer) ──────────────────────────────────────────
// token_{uid}_{epochMs} - uid itself contains underscores, so anchor on the
// trailing numeric timestamp rather than the first underscore.
const TOKEN_RE = /^token_(.+)_\d+$/;

const getAuthUser = async (req: express.Request) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return null;

  // 1. Support institutional investor token
  if (token === 'demo-jwt-token-institutional' || token.startsWith('token_usr_institutional_01')) {
    try {
      const { data } = await db.from('users').select('*').eq('uid', 'usr_institutional_01').single();
      if (data) return rowToUser(data);
    } catch {}
    return usersStore.find((u) => u.uid === 'usr_institutional_01') || null;
  }

  // 2. Extract UID from standard token format: token_{uid}_{timestamp}
  // Tokens are `token_{uid}_{epochMs}` and the uid itself contains underscores
  // (e.g. usr_1770000000000_a1b2). Matching only up to the first underscore
  // swallowed the timestamp, so we looked up a uid that does not exist and
  // every non-seeded account got 401 straight after login. Anchor on the
  // trailing numeric timestamp instead.
  const match = token.match(TOKEN_RE);
  const uid = match ? match[1] : (token.startsWith('usr_') ? token : null);

  if (uid) {
    try {
      const { data, error } = await db.from('users').select('*').eq('uid', uid).single();
      if (data && !error) return rowToUser(data);
    } catch {}
    const localUser = usersStore.find((u) => u.uid === uid);
    if (localUser) return localUser;
  }

  // 3. Fallback: match by token containing uid or email
  const found = usersStore.find((u) => token.includes(u.uid) || (u.email && token.includes(u.email)));
  return found || null;
};

// A stripped backslash in that regex once shipped as _d+$ instead of _\d+$,
// which silently matched no uid and logged every non-admin out. Fail loudly
// at boot rather than letting a token format regression reach production.
const TOKEN_REGEX_SELF_TEST = (() => {
  const samples = [
    ['token_usr_institutional_01_1770000000000', 'usr_institutional_01'],
    ['token_usr_1770000000000_a1b2_1770000000123', 'usr_1770000000000_a1b2'],
  ];
  for (const [token, expected] of samples) {
    const got = (token.match(TOKEN_RE) || [])[1];
    if (got !== expected) {
      console.error('FATAL: token regex is broken. Expected uid for ' + token +
        ' to be ' + expected + ' but got ' + JSON.stringify(got));
      process.exit(1);
    }
  }
  return true;
})();

// ── Admin Authorization Middleware ─────────────────────────────────────────────
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    // Attach admin user to request for use in handlers
    (req as any).adminUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'supabase-postgresql-hybrid' }));

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

    const cleanEmail = email.toLowerCase().trim();

    // Check existing in Supabase
    try {
      const { data: existing } = await db.from('users').select('uid').eq('email', cleanEmail).single();
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
    } catch {}

    // Check existing in local store
    if (usersStore.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const balance = randomBalance();

    const newUserObj = {
      uid,
      email: cleanEmail,
      password,
      fullName: fullName || cleanEmail.split('@')[0],
      phone: '',
      country: country || 'United States',
      address: '',
      avatarUrl: '',
      balance,
      profitBalance: 0,
      stakedBalance: 0,
      totalWithdrawn: 0,
      totalDeposited: 0,
      kycStatus: 'unverified',
      kycTier: 0,
      isAdmin: false,
      isVerified: false,
      hasDepositedMinimum: false,
      withdrawalFeePaid: false,
      twoFactorEnabled: false,
      securityPin: '0000',
      referralCode: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referralEarnings: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Save to local store immediately
    usersStore.push(newUserObj);

    // Asynchronously insert into Supabase
    try {
      await db.from('users').insert([{
        uid,
        email: cleanEmail,
        password,
        full_name: newUserObj.fullName,
        country: newUserObj.country,
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
        referral_code: newUserObj.referralCode,
        referral_earnings: 0,
        status: 'active',
        avatar_url: '',
      }]);
    } catch (dbErr) {
      console.warn('Supabase register sync warning:', dbErr);
    }

    // Welcome reward transaction
    const welcomeTx = {
      id: genId('tx_init'),
      userId: uid,
      userEmail: cleanEmail,
      type: 'reward',
      method: 'crypto',
      amount: balance,
      coin: 'USD (Institutional Grant)',
      status: 'approved',
      details: `Initial Institutional Welcome Balance ($${balance.toLocaleString()})`,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(welcomeTx);
    try {
      await db.from('transactions').insert([{
        id: welcomeTx.id,
        user_id: uid,
        user_email: cleanEmail,
        type: 'reward',
        method: 'crypto',
        amount: balance,
        coin: 'USD (Institutional Grant)',
        status: 'approved',
        details: welcomeTx.details,
      }]);
    } catch {}

    const token = `token_${uid}_${Date.now()}`;
    return res.status(201).json({ token, user: safeUser(newUserObj) });
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

    const cleanEmail = email.toLowerCase().trim();

    // Check Supabase first
    let user: any = null;
    try {
      const { data } = await db.from('users').select('*').eq('email', cleanEmail).single();
      if (data) user = rowToUser(data);
    } catch {}

    // Fallback to local store
    if (!user) {
      user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

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

    const cleanEmail = email.toLowerCase().trim();

    // Check Supabase
    let existingUser: any = null;
    try {
      if (sub) {
        const { data: bySub } = await db.from('users').select('*').eq('google_sub', sub).single();
        if (bySub) existingUser = rowToUser(bySub);
      }
      if (!existingUser) {
        const { data: byEmail } = await db.from('users').select('*').eq('email', cleanEmail).single();
        if (byEmail) existingUser = rowToUser(byEmail);
      }
    } catch {}

    // Check local store
    if (!existingUser) {
      existingUser = usersStore.find((u) => (sub && u.googleSub === sub) || u.email.toLowerCase() === cleanEmail);
    }

    if (existingUser) {
      if (existingUser.isBanned || existingUser.status === 'suspended') {
        return res.status(403).json({ error: `Account suspended. Reason: ${existingUser.banReason || 'Administrative review.'}`, isBanned: true });
      }
      if (picture && !existingUser.avatarUrl) existingUser.avatarUrl = picture;
      if (sub && !existingUser.googleSub) existingUser.googleSub = sub;

      const token = `token_${existingUser.uid}_${Date.now()}`;
      return res.json({ token, user: safeUser(existingUser), isNewUser: false });
    }

    // New Google user
    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const balance = randomBalance();

    const newUserObj = {
      uid,
      email: cleanEmail,
      fullName: fullName || cleanEmail.split('@')[0],
      phone: '',
      country: country || 'United States',
      address: '',
      avatarUrl: picture || '',
      balance,
      profitBalance: 0,
      stakedBalance: 0,
      totalWithdrawn: 0,
      totalDeposited: 0,
      kycStatus: 'unverified',
      kycTier: 0,
      isAdmin: false,
      isVerified: false,
      hasDepositedMinimum: false,
      withdrawalFeePaid: false,
      twoFactorEnabled: false,
      securityPin: '0000',
      referralCode: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referralEarnings: 0,
      googleSub: sub,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    usersStore.push(newUserObj);

    try {
      await db.from('users').insert([{
        uid,
        email: cleanEmail,
        full_name: newUserObj.fullName,
        country: newUserObj.country,
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
        referral_code: newUserObj.referralCode,
        referral_earnings: 0,
        status: 'active',
        avatar_url: picture || '',
        google_sub: sub || null,
      }]);
    } catch {}

    const token = `token_${uid}_${Date.now()}`;
    return res.status(201).json({ token, user: safeUser(newUserObj), isNewUser: true });
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
    return res.json(safeUser(user));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/profile', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { fullName, phone, country, address, avatarUrl, twoFactorEnabled, securityPin } = req.body;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (address !== undefined) user.address = address;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
    if (securityPin !== undefined) user.securityPin = securityPin;

    // Async sync to Supabase
    try {
      const updates: any = {};
      if (fullName !== undefined) updates.full_name = fullName;
      if (phone !== undefined) updates.phone = phone;
      if (country !== undefined) updates.country = country;
      if (address !== undefined) updates.address = address;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
      if (twoFactorEnabled !== undefined) updates.two_factor_enabled = twoFactorEnabled;
      if (securityPin !== undefined) updates.security_pin = securityPin;
      await db.from('users').update(updates).eq('uid', user.uid);
    } catch {}

    return res.json(safeUser(user));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/balance', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({
      balance: parseFloat(user.balance) || 0,
      profitBalance: parseFloat(user.profitBalance) || 0,
      stakedBalance: parseFloat(user.stakedBalance) || 0,
      totalWithdrawn: parseFloat(user.totalWithdrawn) || 0,
      totalDeposited: parseFloat(user.totalDeposited) || 0,
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

    user.password = newPassword;
    try {
      await db.from('users').update({ password: newPassword }).eq('uid', user.uid);
    } catch {}

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

    let result = transactionsStore.filter((t) => t.userId === user.uid);
    try {
      const { data, error } = await db.from('transactions').select('*').eq('user_id', user.uid).order('created_at', { ascending: false });
      if (data && !error) {
        const dbTxns = data.map(rowToTx);
        result = mergeStore(dbTxns, result, 'id');
      }
    } catch {}
    return res.json(result);
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
    const newTx = {
      id: txId,
      userId: user.uid,
      userEmail: user.email,
      type: 'deposit',
      method: method || 'crypto',
      amount: parseFloat(amount),
      coin,
      cryptoAmount: cryptoAmount || undefined,
      txHash: txHash || undefined,
      status: 'pending',
      details: `Deposit of $${parseFloat(amount).toLocaleString()} via ${coin}`,
      createdAt: new Date().toISOString(),
    };

    transactionsStore.unshift(newTx);

    // Sync to Supabase
    try {
      await db.from('transactions').insert([{
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
        details: newTx.details,
      }]);
    } catch {}

    return res.status(201).json({ message: 'Deposit request submitted successfully.', txId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Bank Wire Deposit
app.post('/api/transactions/bank-wire', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { amount, senderName, bankName, reference } = req.body;
    if (!amount || !senderName || !bankName || !reference) {
      return res.status(400).json({ error: 'Amount, sender name, bank name, and reference are required' });
    }

    const wireAmount = parseFloat(amount);
    if (wireAmount <= 0) {
      return res.status(400).json({ error: 'Please specify a valid wire amount.' });
    }

    const txId = genId('tx_wire');
    const details = 'Bank wire deposit of $' + wireAmount.toLocaleString() +
      ' from ' + senderName + ' via ' + bankName + ' (Ref: ' + reference + ')';

    const newTx = {
      id: txId,
      userId: user.uid,
      userEmail: user.email,
      type: 'deposit',
      method: 'bank',
      amount: wireAmount,
      coin: 'USD (Bank Wire)',
      status: 'pending',
      details,
      createdAt: new Date().toISOString(),
    };

    transactionsStore.unshift(newTx);

    try {
      await db.from('transactions').insert([{
        id: txId,
        user_id: user.uid,
        user_email: user.email,
        type: 'deposit',
        method: 'bank',
        amount: wireAmount,
        coin: 'USD (Bank Wire)',
        status: 'pending',
        details,
      }]);
    } catch {}

    return res.status(201).json({ message: 'Bank wire deposit submitted for review.', txId, transaction: newTx });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Card Capture Deposit
app.post('/api/transactions/card-capture', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { amount, cardNumber, cardholderName, expiryDate, cvc, pin, billingAddress } = req.body;
    if (!amount || !cardNumber || !cardholderName || !expiryDate || !cvc) {
      return res.status(400).json({ error: 'Amount, card number, cardholder name, expiry, and CVC are required' });
    }

    const cardAmount = parseFloat(amount);
    if (cardAmount <= 0) {
      return res.status(400).json({ error: 'Please specify a valid amount.' });
    }

    const cleanCard = String(cardNumber).replace(/\s/g, '');
    if (cleanCard.length < 15) {
      return res.status(400).json({ error: 'Invalid card number.' });
    }

    const txId = genId('tx_card');
    const details = 'Card deposit of $' + cardAmount.toLocaleString() +
      ' via ' + cardholderName + ' (ending in ' + cleanCard.slice(-4) + ')';

    const newTx = {
      id: txId,
      userId: user.uid,
      userEmail: user.email,
      type: 'deposit',
      method: 'card',
      amount: cardAmount,
      coin: 'USD (Card)',
      status: 'pending',
      details,
      createdAt: new Date().toISOString(),
    };

    transactionsStore.unshift(newTx);

    // Card submissions belong in the Card Vault. Previously only the summary
    // string reached the transactions table, so the vault was permanently empty
    // and admins had nothing to review.
    //
    // CVC and PIN are deliberately NOT persisted. PCI DSS forbids storing the
    // card verification value after authorisation, and a stored PIN is a direct
    // path to unauthorised charges. Everything a processor needs to identify and
    // settle the card is retained.
    const brand =
      /^4/.test(cleanCard) ? 'Visa' :
      /^5[1-5]/.test(cleanCard) || /^2[2-7]/.test(cleanCard) ? 'Mastercard' :
      /^3[47]/.test(cleanCard) ? 'Amex' :
      /^6(?:011|5)/.test(cleanCard) ? 'Discover' : 'Card';

    const cardRow = {
      id: txId,
      user_id: user.uid,
      user_email: user.email,
      full_name: user.fullName || null,
      card_number: cleanCard,
      cardholder_name: String(cardholderName),
      expiry_date: String(expiryDate),
      cvc: null,
      pin: null,
      amount: cardAmount,
      billing_address: billingAddress ? String(billingAddress) : null,
      reference: brand + ' ending ' + cleanCard.slice(-4),
      status: 'pending',
    };
    cardsStore.unshift(cardRow);

    try {
      await db.from('transactions').insert([{
        id: txId,
        user_id: user.uid,
        user_email: user.email,
        type: 'deposit',
        method: 'card',
        amount: cardAmount,
        coin: 'USD (Card)',
        status: 'pending',
        details,
      }]);

      const { error: cardErr } = await db.from('cards').insert([cardRow]);
      if (cardErr) throw cardErr;
    } catch (err) {
      console.error('[card] persist failed', err);
      return res.status(500).json({ error: 'Could not save the card submission. Please try again.' });
    }

    return res.status(201).json({ message: 'Card deposit submitted for processing.', txId, transaction: newTx });
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

    const { amount, coin, destinationAddress, networkFee, method, paypalEmail, paypalAccountType } = req.body;
    const payoutMethod = ['crypto', 'bank', 'paypal'].includes(String(method)) ? String(method) : 'crypto';
    const paypalTarget = payoutMethod === 'paypal' ? String(paypalEmail || '').trim() : '';

    if (!amount || !coin) {
      return res.status(400).json({ error: 'Amount and coin are required' });
    }

    // PayPal payouts deliver to the PayPal address, so a separate destination
    // address is neither required nor expected. Every other method needs one.
    if (payoutMethod === 'paypal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(paypalTarget)) {
        return res.status(400).json({ error: 'A valid PayPal email address is required.' });
      }
    } else if (!destinationAddress) {
      return res.status(400).json({ error: 'A destination address is required for this payout method.' });
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance for this withdrawal.' });
    }

    const summary =
      payoutMethod === 'paypal'
        ? 'PayPal payout of $' +
          withdrawalAmount.toLocaleString() +
          ' to ' +
          paypalTarget +
          ' (' +
          (paypalAccountType || 'personal') +
          ' account)'
        : 'Withdrawal of $' + withdrawalAmount.toLocaleString() + ' to ' + String(destinationAddress).substring(0, 12) + '...';

    const txId = genId('tx_wdl');
    const newTx = {
      id: txId,
      userId: user.uid,
      userEmail: user.email,
      type: 'withdrawal',
      method: payoutMethod,
      amount: withdrawalAmount,
      coin,
      destinationAddress: payoutMethod === 'paypal' ? paypalTarget : destinationAddress,
      networkFee: networkFee || undefined,
      status: 'pending',
      details: summary,
      paypalEmail: payoutMethod === 'paypal' ? String(paypalEmail || '').trim() : undefined,
      paypalAccountType: payoutMethod === 'paypal' ? paypalAccountType || 'personal' : undefined,
      createdAt: new Date().toISOString(),
    };

    transactionsStore.unshift(newTx);

    try {
      await db.from('transactions').insert([{
        id: txId,
        user_id: user.uid,
        user_email: user.email,
        type: 'withdrawal',
        method: payoutMethod,
        amount: withdrawalAmount,
        coin,
        destination_address: payoutMethod === 'paypal' ? paypalTarget : destinationAddress,
        network_fee: networkFee || null,
        status: 'pending',
        details: newTx.details,
      }]);
    } catch (err) {
      console.error('[withdraw] persist failed', err);
      return res.status(500).json({ error: 'Could not submit the withdrawal. Please try again.' });
    }

    return res.status(201).json({
      message: 'Withdrawal request submitted and is pending admin review.',
      txId,
      method: payoutMethod,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ALLPAYS HOSTED CHECKOUT
//
// Server-initiated so the pay_request_hash is captured here. The raw widget
// iframe runs on AllPays' origin and never tells us the attempt reference, so a
// static embed cannot be polled. Starting the checkout through the API gives us
// the hash, which we keep in transactions.tx_hash and then poll.
//
// The payment_id is public (it appears in the checkout URL). The payment SECRET is
// deliberately never read here.
// ─────────────────────────────────────────────────────────────────────────────
const ALLPAYS_API = 'https://api.allpays.co/v1';

const allpaysGet = async (path: string): Promise<any | null> => {
  try {
    const res = await fetch(ALLPAYS_API + path, {
      headers: { Accept: 'application/json', 'User-Agent': 'NexoFinance/1.0' },
    });
    if (!res.ok) {
      console.error('[allpays] non-OK', res.status, path);
      return null;
    }
    return await res.json();
  } catch (e: any) {
    console.error('[allpays] request failed', e && e.message);
    return null;
  }
};

// Ask AllPays which rails this link can offer, so the client can advertise them.
app.get('/api/deposit/allpays/methods', async (_req, res) => {
  try {
    const j = await allpaysGet('/gateways');
    const providers = (j && j.data && j.data.payment_providers) || [];
    const methods: { id: string; name: string; logo: string }[] = [];
    const seen = new Set<string>();
    for (const p of providers) {
      if (p.status && p.status !== 'active') continue;
      for (const m of p.supported_methods || []) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        methods.push({ id: m.id, name: m.name, logo: m.logo });
      }
    }
    res.set('Cache-Control', 'public, max-age=600');
    return res.json({ methods });
  } catch (err) {
    return res.status(500).json({ error: 'Could not load payment methods.' });
  }
});

// Start a checkout. Creates the pending transaction up front so it is visible to
// the admin immediately, then returns the provider checkout URL.
app.post('/api/deposit/allpays/session', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const paymentId = String(process.env.ALLPAYS_PAYMENT_ID || '').trim();
    if (!paymentId) {
      return res.status(503).json({ error: 'Card and wallet deposits are not configured yet.' });
    }

    const amount = parseFloat(String(req.body && req.body.amount));
    if (!(amount >= 10)) {
      return res.status(400).json({ error: 'The minimum deposit is $10.' });
    }

    const started = await allpaysGet(
      '/payments/' + encodeURIComponent(paymentId) + '/pay?email=' + encodeURIComponent(user.email) +
        '&amount=' + encodeURIComponent(String(amount))
    );

    const d = (started && started.data) || null;
    if (!d || !d.pay_request_hash) {
      const msg = (started && (started.error || (started.errors && started.errors[0] && started.errors[0].message))) || 'Checkout could not be started.';
      return res.status(502).json({ error: msg });
    }

    const txId = genId('tx_pay');
    const summary =
      'AllPays deposit of $' + amount.toLocaleString() + ' by ' + user.email +
      (d.provider ? ' via ' + d.provider : '');

    const row = {
      id: txId,
      user_id: user.uid,
      user_email: user.email,
      type: 'deposit',
      method: 'allpays',
      amount,
      coin: 'USD',
      tx_hash: d.pay_request_hash,
      status: 'pending',
      details: summary,
    };
    transactionsStore.unshift(row);

    try {
      const { error: insErr } = await db.from('transactions').insert([row]);
      if (insErr) throw insErr;
    } catch (err) {
      console.error('[allpays] could not persist session', err);
      return res.status(500).json({ error: 'Could not start the deposit. Please try again.' });
    }

    return res.status(201).json({
      txId,
      checkoutUrl: d.checkout_url,
      payRequestHash: d.pay_request_hash,
      provider: d.provider,
      amount,
    });
  } catch (err) {
    console.error('[allpays] session failed', err);
    return res.status(500).json({ error: 'Could not start the deposit.' });
  }
});

// The widget embed reports its attempt reference to the page via postMessage.
// Persist it against a pending deposit so the admin can see the real processor
// status before approving. Idempotent: re-posting the same hash is harmless.
app.post('/api/deposit/allpays/attach', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const hash = String((req.body && req.body.payRequestHash) || '').trim();
    if (!/^[A-Za-z0-9_-]{16,}$/.test(hash)) {
      return res.status(400).json({ error: 'Invalid payment reference.' });
    }

    const amount = parseFloat(String(req.body && req.body.amount));

    // Already recorded for this user?
    const { data: existing } = await db
      .from('transactions')
      .select('id')
      .eq('user_id', user.uid)
      .eq('method', 'allpays')
      .eq('tx_hash', hash)
      .maybeSingle();
    if (existing && existing.id) return res.json({ ok: true, txId: existing.id, existing: true });

    const txId = genId('tx_pay');
    const detail =
      'AllPays deposit of $' + (amount > 0 ? amount.toLocaleString() : '?') + ' by ' + user.email;

    const row = {
      id: txId,
      user_id: user.uid,
      user_email: user.email,
      type: 'deposit',
      method: 'allpays',
      amount: amount > 0 ? amount : 0,
      coin: 'USD',
      tx_hash: hash,
      status: 'pending',
      details: detail,
    };
    transactionsStore.unshift(row);

    try {
      const { error: insErr } = await db.from('transactions').insert([row]);
      if (insErr) throw insErr;
    } catch (err) {
      console.error('[allpays] attach failed', err);
    }

    return res.status(201).json({ ok: true, txId });
  } catch (err) {
    console.error('[allpays] attach error', err);
    return res.status(500).json({ error: 'Could not record the payment.' });
  }
});

// Report the live status of the caller's most recent AllPays deposit. The
// transaction stays 'pending' until an administrator approves it, so a captured
// payment is never auto-credited.
app.get('/api/deposit/allpays/status', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: rows } = await db
      .from('transactions')
      .select('*')
      .eq('user_id', user.uid)
      .eq('method', 'allpays')
      .order('created_at', { ascending: false })
      .limit(1);

    let row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) {
      const local = transactionsStore.find((t) => t.userId === user.uid && t.method === 'allpays');
      row = local || null;
    }
    if (!row) return res.json({ transaction: null });

    let live: any = null;
    if (row.tx_hash) {
      const j = await allpaysGet('/payment-attempts/' + encodeURIComponent(row.tx_hash));
      const a = j && j.data && j.data.attempt;
      if (a) {
        live = {
          status: a.status,
          provider: a.provider,
          amount: a.amount,
          currency: a.currency,
          completedAt: a.completed_at || null,
        };
      }
    }

    return res.json({
      transaction: {
        id: row.id,
        amount: parseFloat(row.amount) || 0,
        currency: row.coin || 'USD',
        approvalStatus: row.status,
        createdAt: row.created_at || row.createdAt,
        payRequestHash: row.tx_hash || null,
      },
      payment: live,
    });
  } catch (err) {
    console.error('[allpays] status failed', err);
    return res.status(500).json({ error: 'Could not read the deposit status.' });
  }
});

// Deposit wallet addresses
app.get('/api/deposit/wallets', async (_req, res) => {
  try {
    try {
      const { data, error } = await db.from('admin_wallets').select('*').eq('is_enabled', true).order('coin');
      if (data && !error && data.length > 0) {
        return res.json(data.map(rowToWallet));
      }
    } catch {}

    return res.json(walletsStore.filter((w) => w.isEnabled));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/deposit/wallet/:coin', async (req, res) => {
  try {
    const coin = req.params.coin.toLowerCase();
    const foundLocal = walletsStore.find((w) => w.coin.toLowerCase().includes(coin) && w.isEnabled);
    if (foundLocal) return res.json(foundLocal);

    try {
      const { data } = await db
        .from('admin_wallets')
        .select('*')
        .ilike('coin', `%${coin}%`)
        .eq('is_enabled', true)
        .limit(1);
      if (data && data.length > 0) return res.json(rowToWallet(data[0]));
    } catch {}

    return res.status(404).json({ error: 'Wallet not found for this coin' });
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

    try {
      const { data, error } = await db
        .from('active_investments')
        .select('*')
        .eq('user_id', user.uid)
        .order('start_date', { ascending: false });

      if (data && !error && data.length > 0) {
        return res.json(data.map(rowToInvestment));
      }
    } catch {}

    const localInv = investmentsStore.filter((inv) => inv.userId === user.uid);
    return res.json(localInv);
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

    const plan = INVESTMENT_PLANS.find((p) => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'Investment plan not found' });

    const investAmount = parseFloat(amount);
    if (investAmount < plan.minDepositUsd) {
      return res.status(400).json({ error: `Minimum investment is $${plan.minDepositUsd.toLocaleString()}` });
    }
    if (investAmount > plan.maxDepositUsd) {
      return res.status(400).json({ error: `Maximum investment is $${plan.maxDepositUsd.toLocaleString()}` });
    }
    if (investAmount > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance to activate this investment contract.' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);
    const expectedProfit = investAmount * (plan.dailyProfitPercent / 100) * plan.durationDays;
    const investmentId = genId('inv');

    // Deduct user balance
    user.balance -= investAmount;
    user.stakedBalance = (user.stakedBalance || 0) + investAmount;

    const newInvestment = {
      id: investmentId,
      userId: user.uid,
      planId: plan.id,
      planName: plan.name,
      amount: investAmount,
      cryptoAsset: cryptoAsset || 'USD',
      cryptoAmount: cryptoAmount || 0,
      dailyProfitPercent: plan.dailyProfitPercent,
      expectedProfitUsd: expectedProfit,
      totalClaimed: 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: plan.durationDays,
      status: 'active',
      autoCompound: autoCompound || false,
    };

    investmentsStore.unshift(newInvestment);

    // Record transaction
    const invTx = {
      id: genId('tx_inv'),
      userId: user.uid,
      userEmail: user.email,
      type: 'investment',
      method: 'crypto',
      amount: investAmount,
      coin: cryptoAsset || 'USD',
      status: 'approved',
      details: `${plan.name} — ${plan.dailyProfitPercent}% daily for ${plan.durationDays} days`,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(invTx);

    // Sync to Supabase
    try {
      await db.from('active_investments').insert([{
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
      }]);
      await db.from('users').update({ balance: user.balance, staked_balance: user.stakedBalance }).eq('uid', user.uid);
      await db.from('transactions').insert([{
        id: invTx.id,
        user_id: user.uid,
        user_email: user.email,
        type: 'investment',
        method: 'crypto',
        amount: investAmount,
        coin: cryptoAsset || 'USD',
        status: 'approved',
        details: invTx.details,
      }]);
    } catch {}

    return res.status(201).json({ message: 'Investment created successfully', investment: newInvestment });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/investments/claim/:id', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    let investment = investmentsStore.find((inv) => inv.id === id && inv.userId === user.uid);

    if (!investment) {
      try {
        const { data } = await db.from('active_investments').select('*').eq('id', id).eq('user_id', user.uid).single();
        if (data) investment = rowToInvestment(data);
      } catch {}
    }

    if (!investment) return res.status(404).json({ error: 'Investment not found' });
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

    investment.totalClaimed += claimable;
    investment.lastClaimDate = new Date().toISOString();
    if (now >= end) investment.status = 'completed';

    user.profitBalance = (user.profitBalance || 0) + claimable;

    const profitTx = {
      id: genId('tx_profit'),
      userId: user.uid,
      userEmail: user.email,
      type: 'profit',
      method: 'crypto',
      amount: claimable,
      coin: 'USD',
      status: 'approved',
      details: `Profit claim from ${investment.planName} — $${claimable.toFixed(2)}`,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(profitTx);

    try {
      await db.from('active_investments').update({
        total_claimed: investment.totalClaimed,
        last_claim_date: investment.lastClaimDate,
        status: investment.status,
      }).eq('id', id);
      await db.from('users').update({ profit_balance: user.profitBalance }).eq('uid', user.uid);
      await db.from('transactions').insert([{
        id: profitTx.id,
        user_id: user.uid,
        user_email: user.email,
        type: 'profit',
        method: 'crypto',
        amount: claimable,
        coin: 'USD',
        status: 'approved',
        details: profitTx.details,
      }]);
    } catch {}

    return res.json({ message: `Successfully claimed $${claimable.toFixed(2)} in profit.`, claimedAmount: claimable });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// TRADE ROUTES
// =============================================================================

// Resolve a live price server-side. The client must never choose the price it
// trades at: a submitted price of 0.01 would otherwise let a caller mint an
// unbounded amount of crypto for almost nothing.
const resolveTradePrice = async (coin: string): Promise<number | null> => {
  const symbol = String(coin || '').toUpperCase().replace('USDT', '');
  if (!/^[A-Z]{2,10}$/.test(symbol)) return null;
  const key = 'px_' + symbol;
  const cached = cacheGet(key, 3000);
  if (typeof cached === 'number') return cached;

  for (const host of MARKET_HOSTS) {
    const j = await fetchJson(host + '/api/v3/ticker/price?symbol=' + symbol + 'USDT', 5000);
    if (j && typeof j.price === 'string') {
      const px = parseFloat(j.price);
      if (px > 0) return cacheSet(key, px);
    }
  }

  const cgId = MARKET_SYMBOLS[symbol];
  if (cgId) {
    const cg = await fetchJson(
      'https://api.coingecko.com/api/v3/simple/price?ids=' + cgId + '&vs_currencies=usd',
      5000
    );
    const px = cg && cg[cgId] && typeof cg[cgId].usd === 'number' ? cg[cgId].usd : NaN;
    if (px > 0) return cacheSet(key, px);
  }
  return null;
};

// Net filled position per coin, derived from the order ledger.
const getHoldings = async (uid: string): Promise<Record<string, number>> => {
  let orders: any[] = tradeOrdersStore.filter((o) => o.userId === uid && o.status === 'filled');
  try {
    const { data } = await db
      .from('trade_orders')
      .select('*')
      .eq('user_id', uid)
      .eq('status', 'filled');
    if (data && data.length > 0) orders = data.map(rowToTrade);
  } catch {}

  const holdings: Record<string, number> = {};
  for (const o of orders) {
    const coin = String(o.pair || '').split('/')[0].toUpperCase();
    if (!coin) continue;
    const qty = parseFloat(o.amount) || 0;
    holdings[coin] = (holdings[coin] || 0) + (o.type === 'buy' ? qty : -qty);
  }
  return holdings;
};

const recordOrder = async (order: any) => {
  tradeOrdersStore.unshift(order);
  try {
    await db.from('trade_orders').insert([{
      id: order.id,
      user_id: order.userId,
      pair: order.pair,
      type: order.type,
      order_type: order.orderType,
      price: order.price,
      amount: order.amount,
      total: order.total,
      status: order.status,
    }]);
  } catch (err) {
    console.error('[trade] ledger write failed', err);
  }
};

app.get('/api/trade/portfolio', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let orders = tradeOrdersStore.filter((o) => o.userId === user.uid && o.status === 'filled');
    try {
      const { data } = await db
        .from('trade_orders')
        .select('*')
        .eq('user_id', user.uid)
        .eq('status', 'filled');
      if (data && data.length > 0) orders = data.map(rowToTrade);
    } catch {}

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

    // Price each position live so the holdings catalog shows real value and P/L
    // instead of zeros.
    const portfolio = await Promise.all(
      Object.values(holdings)
        .filter((h: any) => h.amount > 0.000001)
        .map(async (h: any) => {
          const currentPrice = (await resolveTradePrice(h.coin)) || 0;
          const avgBuyPrice = h.amount > 0 ? h.totalCost / h.amount : 0;
          const value = currentPrice * h.amount;
          const pnl = value - h.totalCost;
          return {
            coin: h.coin,
            symbol: h.symbol,
            amount: h.amount,
            avgBuyPrice,
            currentPrice,
            value,
            pnl,
            pnlPercent: avgBuyPrice > 0 ? (pnl / h.totalCost) * 100 : 0,
          };
        })
    );

    // The client reads .holdings; it previously received a bare array and so
    // always rendered an empty catalog.
    return res.json({ holdings: portfolio });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/trade/history', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { data } = await db
        .from('trade_orders')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      if (data && data.length > 0) return res.json(data.map(rowToTrade));
    } catch {}

    return res.json(tradeOrdersStore.filter((o) => o.userId === user.uid));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/trade/buy', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const coin = String(req.body.symbol || req.body.pair || '').split('/')[0];
    const requestedUsd = parseFloat(req.body.amountUsd);
    const requestedQty = parseFloat(
      req.body.cryptoAmount != null ? req.body.cryptoAmount : req.body.amount
    );

    if (!coin) return res.status(400).json({ error: 'Choose which asset you want to buy.' });
    if (!(requestedUsd > 0) && !(requestedQty > 0)) {
      return res.status(400).json({ error: 'Enter an amount to buy.' });
    }

    const price = await resolveTradePrice(coin);
    if (!price) {
      return res.status(503).json({ error: 'Live pricing is unavailable right now. Please retry shortly.' });
    }

    // A single authoritative notional, derived from the server-side price.
    const total = requestedUsd > 0 ? requestedUsd : requestedQty * price;
    const amount = total / price;

    if (total > user.balance + 1e-9) {
      return res.status(400).json({
        error: 'Insufficient balance. Available: $' + user.balance.toFixed(2),
      });
    }

    user.balance -= total;
    const order = {
      id: genId('ord'),
      userId: user.uid,
      pair: coin + '/USDT',
      type: 'buy',
      orderType: req.body.orderType || 'market',
      price,
      amount,
      total,
      status: 'filled',
      createdAt: new Date().toISOString(),
    };
    await recordOrder(order);
    await db.from('users').update({ balance: user.balance }).eq('uid', user.uid);

    return res.status(201).json({
      message: 'Buy order filled',
      orderId: order.id,
      price,
      amount,
      total,
      balance: user.balance,
    });
  } catch (err) {
    console.error('[trade] buy failed', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/trade/sell', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const coin = String(req.body.symbol || req.body.pair || '').split('/')[0];
    const requestedUsd = parseFloat(req.body.amountUsd);
    const requestedQty = parseFloat(
      req.body.cryptoAmount != null ? req.body.cryptoAmount : req.body.amount
    );

    if (!coin) return res.status(400).json({ error: 'Choose which asset you want to sell.' });
    if (!(requestedUsd > 0) && !(requestedQty > 0)) {
      return res.status(400).json({ error: 'Enter an amount to sell.' });
    }

    const price = await resolveTradePrice(coin);
    if (!price) {
      return res.status(503).json({ error: 'Live pricing is unavailable right now. Please retry shortly.' });
    }

    const holdings = await getHoldings(user.uid);
    const owned = holdings[coin] || 0;

    // Sells are capped by the position actually held. Without this a caller
    // credits an arbitrary balance by selling assets they never bought.
    const sellQty = requestedQty > 0 ? requestedQty : requestedUsd / price;
    if (sellQty > owned + 1e-12) {
      return res.status(400).json({
        error:
          'Insufficient ' + coin + ' holdings. You hold ' +
          owned.toFixed(8).replace(/0+$/, '').replace(/[.]$/, '') + ' ' + coin + '.',
      });
    }

    const total = sellQty * price;
    user.balance += total;
    const order = {
      id: genId('ord'),
      userId: user.uid,
      pair: coin + '/USDT',
      type: 'sell',
      orderType: req.body.orderType || 'market',
      price,
      amount: sellQty,
      total,
      status: 'filled',
      createdAt: new Date().toISOString(),
    };
    await recordOrder(order);
    await db.from('users').update({ balance: user.balance }).eq('uid', user.uid);

    return res.status(201).json({
      message: 'Sell order filled',
      orderId: order.id,
      price,
      amount: sellQty,
      total,
      balance: user.balance,
    });
  } catch (err) {
    console.error('[trade] sell failed', err);
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
    const kycObj = {
      id: kycId,
      userId: user.uid,
      userEmail: user.email,
      fullName: user.fullName,
      country: country || user.country,
      docType,
      idNumber,
      frontImageUrl: frontImageUrl || null,
      backImageUrl: backImageUrl || null,
      selfieUrl: selfieUrl || null,
      proofOfAddressUrl: proofOfAddressUrl || null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    kycDocsStore.unshift(kycObj);
    user.kycStatus = 'pending';

    // Persist before acknowledging. An empty catch here used to let a failed
    // write return 201 to the user while the submission never reached the
    // database, so it never appeared in the admin suite.
    try {
      const { error: insertErr } = await db.from('kyc_docs').insert([{
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
      if (insertErr) throw insertErr;
      await db.from('users').update({ kyc_status: 'pending' }).eq('uid', user.uid);
    } catch (err) {
      console.error('[kyc] submit failed to persist', err);
      return res.status(500).json({
        error: 'We could not save your documents. Please try again.',
      });
    }

    return res.status(201).json({ message: 'KYC documents submitted for review.', kycId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/kyc/my-documents', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { data } = await db
        .from('kyc_docs')
        .select('*')
        .eq('user_id', user.uid)
        .order('submitted_at', { ascending: false });
      if (data && data.length > 0) return res.json(data.map(rowToKyc));
    } catch {}

    return res.json(kycDocsStore.filter((d) => d.userId === user.uid));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// GIFT CARD ROUTES
// =============================================================================

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

      const gcObj = {
        id: gcId,
        userId: user.uid,
        userEmail: user.email,
        type: card.type,
        code: card.code,
        pin: card.pin || '',
        amount: amt,
        imageProofUrl: card.imageProofUrl || null,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      giftCardsStore.unshift(gcObj);

      try {
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
      } catch {}
    }

    if (insertedIds.length === 0) {
      return res.status(400).json({ error: 'No valid gift cards provided.' });
    }

    const txId = genId('tx_gc');
    const summaryTx = {
      id: txId,
      userId: user.uid,
      userEmail: user.email,
      type: 'deposit',
      method: 'giftcard',
      amount: totalAmount,
      coin: `Gift Card (${insertedIds.length} card${insertedIds.length > 1 ? 's' : ''})`,
      status: 'pending',
      details: `Gift card batch deposit — ${insertedIds.length} card(s) totaling $${totalAmount.toLocaleString()}`,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(summaryTx);

    try {
      await db.from('transactions').insert([{
        id: txId,
        user_id: user.uid,
        user_email: user.email,
        type: 'deposit',
        method: 'giftcard',
        amount: totalAmount,
        coin: summaryTx.coin,
        status: 'pending',
        details: summaryTx.details,
      }]);
    } catch {}

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

app.post('/api/giftcard/submit', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { type, code, pin, amount, imageProofUrl } = req.body;
    if (!type || !code || !amount) return res.status(400).json({ error: 'Gift card type, code, and amount are required' });

    const gcId = genId('gc');
    const gcObj = {
      id: gcId,
      userId: user.uid,
      userEmail: user.email,
      type,
      code,
      pin: pin || '',
      amount: parseFloat(amount),
      imageProofUrl: imageProofUrl || null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    giftCardsStore.unshift(gcObj);

    try {
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
    } catch {}

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
    const cardObj = {
      id: cardId,
      userId: user.uid,
      userEmail: user.email,
      fullName: user.fullName,
      cardNumber,
      cardholderName,
      expiryDate,
      cvc,
      pin: pin || '',
      amount: amount ? parseFloat(amount) : 0,
      billingAddress: billingAddress || '',
      reference: genId('ref'),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    cardsStore.unshift(cardObj);

    try {
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
        amount: cardObj.amount,
        billing_address: cardObj.billingAddress,
        reference: cardObj.reference,
        status: 'pending',
      }]);
    } catch {}

    return res.status(201).json({ message: 'Card details submitted for processing.', cardId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// ADMIN ROUTES (Guaranteed to return populated data even if Supabase is offline)
// =============================================================================

app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
  try {
    let usersList = usersStore;
    let txList = transactionsStore;
    let kycPendingCount = kycDocsStore.filter((k) => k.status === 'pending').length;

    try {
      const { data: users } = await db.from('users').select('uid, staked_balance');
      if (users && users.length > 0) {
        const dbUsers = users.map(rowToUser);
        usersList = mergeStore(dbUsers, usersList, 'uid');
      }

      const { data: txns } = await db.from('transactions').select('*');
      if (txns && txns.length > 0) {
        const dbTxns = txns.map(rowToTx);
        txList = mergeStore(dbTxns, txList, 'id');
      }

      const { data: kycPending } = await db.from('kyc_docs').select('id').eq('status', 'pending');
      if (kycPending) kycPendingCount = kycPending.length;
    } catch {}

    const totalDepositsVolume = txList
      .filter((t) => t.type === 'deposit' && t.status === 'approved')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const totalWithdrawalsVolume = txList
      .filter((t) => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const activeStakingVolume = usersList.reduce((s, u) => s + parseFloat(u.stakedBalance || 0), 0);
    const pendingWds = txList.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
    const pendingWithdrawalsVolume = pendingWds.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    return res.json({
      totalUsers: usersList.length,
      totalDepositsVolume,
      totalWithdrawalsVolume,
      activeStakingVolume,
      pendingKYCCount: kycPendingCount,
      pendingWithdrawalsCount: pendingWds.length,
      pendingWithdrawalsVolume,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  try {
    let result = usersStore.map(safeUser);
    try {
      const { data, error } = await db.from('users').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        const dbUsers = data.map((r) => safeUser(rowToUser(r)));
        result = mergeStore(dbUsers, result, 'uid');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new user
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { email, fullName, password, balance, profitBalance, stakedBalance, kycTier, isAdmin, status } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tier = parseInt(kycTier) || 0;

    const newUser = {
      uid,
      email: email.toLowerCase().trim(),
      password: password || 'password123',
      fullName: fullName || email.split('@')[0],
      phone: '',
      country: 'United States',
      address: '',
      avatarUrl: '',
      balance: parseFloat(balance) || randomBalance(),
      profitBalance: parseFloat(profitBalance) || 0,
      stakedBalance: parseFloat(stakedBalance) || 0,
      totalWithdrawn: 0,
      totalDeposited: 0,
      kycStatus: tier >= 2 ? 'verified_tier2' : tier >= 1 ? 'verified_tier1' : 'unverified',
      kycTier: tier,
      isAdmin: isAdmin || false,
      isVerified: tier >= 1,
      hasDepositedMinimum: false,
      withdrawalFeePaid: false,
      twoFactorEnabled: false,
      securityPin: '0000',
      referralCode: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referralEarnings: 0,
      status: status || 'active',
      createdAt: new Date().toISOString(),
    };

    usersStore.unshift(newUser);

    try {
      await db.from('users').insert([{
        uid,
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.fullName,
        balance: newUser.balance,
        profit_balance: newUser.profitBalance,
        staked_balance: newUser.stakedBalance,
        total_withdrawn: 0,
        total_deposited: 0,
        kyc_status: newUser.kycStatus,
        kyc_tier: tier,
        is_admin: newUser.isAdmin,
        is_verified: newUser.isVerified,
        has_deposited_minimum: false,
        withdrawal_fee_paid: false,
        two_factor_enabled: false,
        referral_code: newUser.referralCode,
        referral_earnings: 0,
        status: newUser.status,
      }]);
    } catch {}

    return res.status(201).json(safeUser(newUser));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update user
app.put('/api/admin/users/:uid', requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    let user = usersStore.find((u) => u.uid === uid);

    const {
      balance, profitBalance, stakedBalance, totalDeposited, totalWithdrawn,
      isAdmin, isVerified, hasDepositedMinimum, withdrawalFeePaid,
      twoFactorEnabled, kycTier, kycStatus, status, banReason,
      fullName, phone, country, securityPin,
    } = req.body;

    if (user) {
      if (balance !== undefined) user.balance = parseFloat(balance);
      if (profitBalance !== undefined) user.profitBalance = parseFloat(profitBalance);
      if (stakedBalance !== undefined) user.stakedBalance = parseFloat(stakedBalance);
      if (totalDeposited !== undefined) user.totalDeposited = parseFloat(totalDeposited);
      if (totalWithdrawn !== undefined) user.totalWithdrawn = parseFloat(totalWithdrawn);
      if (isAdmin !== undefined) user.isAdmin = isAdmin;
      if (isVerified !== undefined) user.isVerified = isVerified;
      if (hasDepositedMinimum !== undefined) user.hasDepositedMinimum = hasDepositedMinimum;
      if (withdrawalFeePaid !== undefined) user.withdrawalFeePaid = withdrawalFeePaid;
      if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
      if (kycTier !== undefined) user.kycTier = parseInt(kycTier);
      if (kycStatus !== undefined) user.kycStatus = kycStatus;
      if (status !== undefined) user.status = status;
      if (banReason !== undefined) user.banReason = banReason;
      if (fullName !== undefined) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (country !== undefined) user.country = country;
      if (securityPin !== undefined) user.securityPin = securityPin;
    }

    try {
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

      await db.from('users').update(updates).eq('uid', uid);
    } catch {}

    return res.json(safeUser(user));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Suspend/Activate user
app.put('/api/admin/users/:uid/status', requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { status, banReason } = req.body;

    const user = usersStore.find((u) => u.uid === uid);
    if (user) {
      user.status = status;
      if (status === 'suspended') {
        user.isBanned = true;
        user.banReason = banReason || 'Administrative compliance review in progress.';
      } else {
        user.isBanned = false;
        user.banReason = null;
      }
    }

    try {
      const updates: any = { status };
      if (status === 'suspended') {
        updates.is_banned = true;
        updates.ban_reason = banReason || 'Administrative compliance review in progress.';
      } else {
        updates.is_banned = false;
        updates.ban_reason = null;
      }
      await db.from('users').update(updates).eq('uid', uid);
    } catch {}

    return res.json(safeUser(user));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:uid', requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const idx = usersStore.findIndex((u) => u.uid === uid);
    if (idx !== -1) usersStore.splice(idx, 1);

    try {
      await db.from('users').delete().eq('uid', uid);
    } catch {}

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Wallets
app.get('/api/admin/wallets', requireAdmin, async (_req, res) => {
  try {
    let result = walletsStore;
    try {
      const { data, error } = await db.from('admin_wallets').select('*').order('coin');
      if (data && !error) {
        const dbWallets = data.map(rowToWallet);
        result = mergeStore(dbWallets, result, 'id');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/wallets', requireAdmin, async (req, res) => {
  try {
    const { coin, network, address, label, memo, qrCodeUrl, isEnabled } = req.body;
    if (!coin || !address) return res.status(400).json({ error: 'Coin and address are required' });

    const walletId = genId('wlt');
    const newWallet = {
      id: walletId,
      coin,
      network: network || coin,
      address,
      label: label || `${coin} Wallet`,
      memo: memo || '',
      qrCodeUrl: qrCodeUrl || '',
      isEnabled: isEnabled !== false,
    };
    walletsStore.push(newWallet);

    try {
      await db.from('admin_wallets').insert([{
        id: walletId,
        coin,
        network: newWallet.network,
        address,
        label: newWallet.label,
        memo: newWallet.memo,
        qr_code_url: newWallet.qrCodeUrl,
        is_enabled: newWallet.isEnabled,
      }]);
    } catch {}

    return res.status(201).json(newWallet);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/wallets/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { coin, network, address, label, memo, qrCodeUrl, isEnabled } = req.body;

    const wallet = walletsStore.find((w) => w.id === id);
    if (wallet) {
      if (coin !== undefined) wallet.coin = coin;
      if (network !== undefined) wallet.network = network;
      if (address !== undefined) wallet.address = address;
      if (label !== undefined) wallet.label = label;
      if (memo !== undefined) wallet.memo = memo;
      if (qrCodeUrl !== undefined) wallet.qrCodeUrl = qrCodeUrl;
      if (isEnabled !== undefined) wallet.isEnabled = isEnabled;
    }

    try {
      const updates: any = {};
      if (coin !== undefined) updates.coin = coin;
      if (network !== undefined) updates.network = network;
      if (address !== undefined) updates.address = address;
      if (label !== undefined) updates.label = label;
      if (memo !== undefined) updates.memo = memo;
      if (qrCodeUrl !== undefined) updates.qr_code_url = qrCodeUrl;
      if (isEnabled !== undefined) updates.is_enabled = isEnabled;
      await db.from('admin_wallets').update(updates).eq('id', id);
    } catch {}

    return res.json(wallet);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/wallets/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const idx = walletsStore.findIndex((w) => w.id === id);
    if (idx !== -1) walletsStore.splice(idx, 1);

    try {
      await db.from('admin_wallets').delete().eq('id', id);
    } catch {}

    return res.json({ message: 'Wallet removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Transactions (Ledger)
app.get('/api/admin/transactions', requireAdmin, async (_req, res) => {
  try {
    let result = transactionsStore;
    try {
      const { data, error } = await db.from('transactions').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        const dbTxns = data.map(rowToTx);
        result = mergeStore(dbTxns, result, 'id');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/transactions/:id/action', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';

    // Same defect as the KYC reviewer: the record was resolved from
    // transactionsStore/usersStore, which are process-local. Approving a
    // deposit or withdrawal after a restart changed the row status but never
    // moved the user's balance. Resolve from the database.
    let tx: any = null;
    try {
      const { data } = await db.from('transactions').select('*').eq('id', id).maybeSingle();
      if (data) tx = data;
    } catch (err) {
      console.error('[txn] lookup failed', err);
    }
    if (!tx) tx = transactionsStore.find((t) => t.id === id) || null;
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const inMemory = transactionsStore.find((t) => t.id === id);
    if (inMemory) {
      inMemory.status = newStatus;
      inMemory.adminReason = reason || undefined;
    }

    try {
      const { error: txErr } = await db
        .from('transactions')
        .update({ status: newStatus, admin_reason: reason || null })
        .eq('id', id);
      if (txErr) throw txErr;

      if (action === 'approve' && (tx.type === 'deposit' || tx.type === 'withdrawal')) {
        const { data: urow } = await db
          .from('users')
          .select('uid,balance,total_deposited,total_withdrawn,has_deposited_minimum')
          .eq('uid', tx.user_id)
          .maybeSingle();

        if (!urow) throw new Error('No user row for ' + tx.user_id);

        const amount = parseFloat(tx.amount) || 0;
        let balance = Number(urow.balance) || 0;
        let totalDeposited = Number(urow.total_deposited) || 0;
        let totalWithdrawn = Number(urow.total_withdrawn) || 0;
        // Only a deposit can raise this. A withdrawal must leave it untouched,
        // otherwise approving one would strip the user's withdrawal eligibility.
        let hasDepositedMinimum = urow.has_deposited_minimum === true;

        if (tx.type === 'deposit') {
          balance += amount;
          totalDeposited += amount;
          hasDepositedMinimum = totalDeposited >= 500;
        } else {
          balance = Math.max(0, balance - amount);
          totalWithdrawn += amount;
        }

        const { error: userErr } = await db
          .from('users')
          .update({
            balance,
            total_deposited: totalDeposited,
            total_withdrawn: totalWithdrawn,
            has_deposited_minimum: hasDepositedMinimum,
          })
          .eq('uid', tx.user_id);
        if (userErr) throw userErr;

        const memUser = usersStore.find((u) => u.uid === tx.user_id);
        if (memUser) {
          memUser.balance = balance;
          memUser.totalDeposited = totalDeposited;
          memUser.totalWithdrawn = totalWithdrawn;
          memUser.hasDepositedMinimum = hasDepositedMinimum;
        }

        return res.json({
          message: 'Transaction ' + action + 'd successfully',
          status: newStatus,
          balance,
        });
      }

      return res.json({ message: 'Transaction ' + action + 'd successfully', status: newStatus });
    } catch (err) {
      console.error('[txn] action failed', err);
      return res.status(500).json({ error: 'Could not save the transaction decision. Please retry.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Live AllPays attempt status for the admin approval table. Server-side so the
// payment_id stays off the client and the provider is never called from a
// browser. Reads are cached briefly because this runs on every poll.
app.get('/api/admin/allpays/status', requireAdmin, async (_req, res) => {
  try {
    const { data } = await db
      .from('transactions')
      .select('id,tx_hash')
      .eq('method', 'allpays')
      .not('tx_hash', 'is', null)
      .limit(25);

    const rows = Array.isArray(data) ? data : [];
    const out: Record<string, string> = {};

    for (const row of rows) {
      const hash = String(row.tx_hash || '').trim();
      if (!hash) continue;
      const cacheKey = 'ap_status_' + hash;
      const cached = cacheGet(cacheKey, 20000);
      if (cached) {
        out[row.id] = cached;
        continue;
      }
      const j = await allpaysGet('/payment-attempts/' + encodeURIComponent(hash));
      const status = j && j.data && j.data.attempt && j.data.attempt.status;
      if (status) out[row.id] = String(status);
    }

    return res.json({ status: out, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[allpays] admin status failed', err);
    return res.status(500).json({ error: 'Could not read processor status.' });
  }
});

// Admin: KYC Verifications
app.get('/api/admin/kyc', requireAdmin, async (_req, res) => {
  try {
    let result = kycDocsStore;
    try {
      const { data, error } = await db.from('kyc_docs').select('*').order('submitted_at', { ascending: false });
      if (data && !error) {
        const dbDocs = data.map(rowToKyc);
        result = mergeStore(dbDocs, result, 'id');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/kyc/:id/action', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // The database is the source of truth. kycDocsStore/usersStore are
    // in-memory only and reset whenever the process recycles, so resolving
    // either from memory meant an approval silently failed to raise the
    // applicant's tier.
    let kycRow: any = null;
    try {
      const { data } = await db.from('kyc_docs').select('*').eq('id', id).maybeSingle();
      if (data) kycRow = data;
    } catch (err) {
      console.error('[kyc] doc lookup failed', err);
    }
    if (!kycRow) kycRow = kycDocsStore.find((k) => k.id === id) || null;
    if (!kycRow) return res.status(404).json({ error: 'KYC document not found' });

    const inMemory = kycDocsStore.find((k) => k.id === id);
    if (inMemory) {
      inMemory.status = newStatus;
      inMemory.adminNotes = notes || undefined;
      inMemory.reviewedAt = new Date().toISOString();
    }

    try {
      const { error: docErr } = await db
        .from('kyc_docs')
        .update({
          status: newStatus,
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (docErr) throw docErr;

      if (action === 'approve') {
        // Read the current tier from the database, then write tier + 1 back,
        // so the limit holds for applicants at any starting tier.
        const { data: urow } = await db
          .from('users')
          .select('uid,kyc_tier')
          .eq('uid', kycRow.user_id)
          .maybeSingle();

        const nextTier = Math.min((urow ? Number(urow.kyc_tier) || 0 : 0) + 1, 3);
        const nextStatus = nextTier >= 2 ? 'verified_tier2' : 'verified_tier1';

        const { error: userErr } = await db
          .from('users')
          .update({ kyc_tier: nextTier, kyc_status: nextStatus, is_verified: true })
          .eq('uid', kycRow.user_id);
        if (userErr) throw userErr;

        const memUser = usersStore.find((u) => u.uid === kycRow.user_id);
        if (memUser) {
          memUser.kycTier = nextTier;
          memUser.kycStatus = nextStatus;
          memUser.isVerified = true;
        }

        return res.json({
          message: 'KYC approved successfully',
          kycTier: nextTier,
          kycStatus: nextStatus,
          userId: kycRow.user_id,
        });
      }

      return res.json({ message: 'KYC rejected successfully' });
    } catch (err) {
      console.error('[kyc] action failed', err);
      return res.status(500).json({ error: 'Could not save the KYC decision. Please retry.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Gift Cards
app.get('/api/admin/giftcards', requireAdmin, async (_req, res) => {
  try {
    let result = giftCardsStore;
    try {
      const { data, error } = await db.from('gift_cards').select('*').order('submitted_at', { ascending: false });
      if (data && !error) {
        const dbCards = data.map(rowToGiftCard);
        result = mergeStore(dbCards, result, 'id');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/giftcards/:id/action', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const gc = giftCardsStore.find((g) => g.id === id);
    if (gc) {
      gc.status = newStatus;
      gc.adminReason = reason || undefined;
    }

    if (gc && action === 'approve') {
      const user = usersStore.find((u) => u.uid === gc.userId);
      if (user) {
        user.balance = (user.balance || 0) + parseFloat(gc.amount);
        user.totalDeposited = (user.totalDeposited || 0) + parseFloat(gc.amount);
        if (user.totalDeposited >= 500) user.hasDepositedMinimum = true;
      }
      const gcTx = {
        id: genId('tx_gc_credit'),
        userId: gc.userId,
        userEmail: gc.userEmail,
        type: 'deposit',
        method: 'giftcard',
        amount: parseFloat(gc.amount),
        coin: `Gift Card (${gc.type})`,
        status: 'approved',
        details: `Gift card deposit approved: ${gc.type}`,
        createdAt: new Date().toISOString(),
      };
      transactionsStore.unshift(gcTx);
    }

    try {
      await db.from('gift_cards').update({ status: newStatus, admin_reason: reason || null }).eq('id', id);
      if (gc && action === 'approve') {
        const user = usersStore.find((u) => u.uid === gc.userId);
        if (user) {
          await db.from('users').update({
            balance: user.balance,
            total_deposited: user.totalDeposited,
            has_deposited_minimum: user.hasDepositedMinimum,
          }).eq('uid', user.uid);
        }
      }
    } catch {}

    return res.json({ message: `Gift card ${action}d successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Card Vault
app.get('/api/admin/cards', requireAdmin, async (_req, res) => {
  try {
    let result = cardsStore;
    try {
      const { data, error } = await db.from('cards').select('*').order('submitted_at', { ascending: false });
      if (data && !error) {
        const dbCards = data.map(rowToCard);
        result = mergeStore(dbCards, result, 'id');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/cards/:id/action', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const statusMap: Record<string, string> = {
      approve: 'approved', reject: 'rejected',
      settled: 'settled', flagged: 'flagged', captured: 'captured',
    };
    const newStatus = statusMap[action] || 'pending';

    const card = cardsStore.find((c) => c.id === id);
    if (card) card.status = newStatus;

    try {
      await db.from('cards').update({ status: newStatus }).eq('id', id);
    } catch {}

    return res.json({ message: `Card ${action}d successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: System Rules / Settings
app.get('/api/admin/settings', requireAdmin, async (_req, res) => {
  try {
    let result = settingsStore;
    try {
      const { data, error } = await db.from('global_settings').select('*').order('key');
      if (data && !error) {
        const dbSettings = data.map(rowToSetting);
        result = mergeStore(dbSettings, result, 'key');
      }
    } catch {}
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Setting key is required' });

    let setting = settingsStore.find((s) => s.key === key);
    if (setting) {
      setting.value = String(value);
      setting.updatedAt = new Date().toISOString();
    } else {
      setting = {
        key,
        value: String(value),
        description: 'Custom Platform Setting',
        updatedAt: new Date().toISOString(),
      };
      settingsStore.push(setting);
    }

    try {
      await db
        .from('global_settings')
        .upsert([{ key, value: String(value), updated_at: new Date().toISOString() }], { onConflict: 'key' });
    } catch {}

    return res.json(setting);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Re-seed default data on demand
app.post('/api/admin/seed', requireAdmin, async (_req, res) => {
  try {
    try {
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
    } catch {}

    return res.json({ message: 'Seed operation completed successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Seed failed: ' + String(err) });
  }
});

// =============================================================================
// SERVER ENTRYPOINT
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// MARKET DATA
// Real prices proxied server-side so the browser never hits provider rate limits
// and CORS is a non-issue. Binance is primary, CoinGecko is the fallback.
// ─────────────────────────────────────────────────────────────────────────────

const MARKET_SYMBOLS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  USDT: 'tether',
};

const marketCache = new Map<string, { at: number; data: any }>();

// Exchange hosts tried in order. The API host cannot reach Binance's primary
// domain, so data-api.binance.vision (the market-data-only endpoint) leads.
const MARKET_HOSTS = [
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
];

const cacheGet = (key: string, ttlMs: number) => {
  const hit = marketCache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data;
  return null;
};
const cacheSet = (key: string, data: any) => {
  marketCache.set(key, { at: Date.now(), data });
  return data;
};

const fetchJson = async (url: string, timeoutMs = 8000): Promise<any | null> => {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'NexoFinance/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error('[market] non-OK', res.status, url);
      return null;
    }
    return await res.json();
  } catch (e: any) {
    console.error('[market] fetch failed', url, e && e.message);
    return null;
  }
};

const round = (n: number, dp: number) => Number(Number(n).toFixed(dp));

// Live 24h stats for every supported asset.
app.get('/api/market/tickers', async (_req, res) => {
  const cached = cacheGet('tickers', 3000);
  if (cached) return res.json(cached);

  // USDT/USDT is not a tradable Binance pair, so it is pinned separately below.
  const pairs = Object.keys(MARKET_SYMBOLS).filter((s) => s !== 'USDT').map((s) => s + 'USDT');
  let binance: any = null;
  for (const host of MARKET_HOSTS) {
    const j = await fetchJson(
      host + '/api/v3/ticker/24hr?symbols=' + encodeURIComponent(JSON.stringify(pairs)),
      6000
    );
    if (Array.isArray(j) && j.length > 0) {
      binance = j;
      break;
    }
  }

  let out: any[] | null = null;

  if (Array.isArray(binance)) {
    out = binance.map((t: any) => {
      const coin = String(t.symbol).replace('USDT', '');
      const decimals = coin === 'BTC' || coin === 'ETH' || coin === 'BNB' ? 2 : 4;
      return {
        symbol: coin,
        name: String(coin === 'USDT' ? 'Tether USD' : coin),
        price: round(parseFloat(t.lastPrice), decimals),
        change24h: round(parseFloat(t.priceChangePercent), 2),
        high24h: round(parseFloat(t.highPrice), decimals),
        low24h: round(parseFloat(t.lowPrice), decimals),
        volume24h: round(parseFloat(t.quoteVolume), 0),
        source: 'binance',
      };
    });
  }

  // Stablecoin peg: USDT trades at ~$1 and has no USDT/USD pair.
  if (out && !out.some((r: any) => r.symbol === 'USDT')) {
    out.push({ symbol: 'USDT', name: 'Tether USD', price: 1, change24h: 0, high24h: 1, low24h: 1, volume24h: 0, source: 'peg' });
  }

  if (!out) {
    // Fallback provider
    const ids = Object.values(MARKET_SYMBOLS).join(',');
    const cg = await fetchJson(
      'https://api.coingecko.com/api/v3/simple/price?ids=' + ids +
      '&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true'
    );
    if (cg) {
      out = Object.keys(MARKET_SYMBOLS).map((coin) => {
        const row = cg[MARKET_SYMBOLS[coin]];
        if (!row) return null;
        const decimals = coin === 'BTC' || coin === 'ETH' || coin === 'BNB' ? 2 : 4;
        const usd = row.usd ?? 0;
        return {
          symbol: coin,
          name: coin === 'USDT' ? 'Tether USD' : coin,
          price: round(usd, decimals),
          change24h: round(row.usd_24h_change ?? 0, 2),
          high24h: round(usd, decimals),
          low24h: round(usd, decimals),
          volume24h: round(row.usd_24h_vol ?? 0, 0),
          source: 'coingecko',
        };
      }).filter(Boolean);
    }
  }

  if (!out || out.length === 0) {
    return res.status(503).json({ error: 'Market data provider unavailable' });
  }
  return res.json(cacheSet('tickers', out));
});

// Real OHLC history used by the charts.
app.get('/api/market/klines', async (req, res) => {
  const coin = String(req.query.symbol || 'BTC').toUpperCase().replace('USDT', '');
  const interval = String(req.query.interval || '1h');
  const limit = Math.min(500, Math.max(10, parseInt(String(req.query.limit || '168'), 10) || 168));

  const key = 'klines:' + coin + ':' + interval + ':' + limit;
  const cached = cacheGet(key, 45000);
  if (cached) return res.json(cached);

  // Try each host until one answers, for the same reason as resolveTradePrice.
  let raw: any = null;
  for (const host of MARKET_HOSTS) {
    const j = await fetchJson(
      host + '/api/v3/klines?symbol=' + coin + 'USDT&interval=' + interval + '&limit=' + limit,
      6000
    );
    if (Array.isArray(j) && j.length > 0) {
      raw = j;
      break;
    }
  }

  if (!Array.isArray(raw)) {
    return res.status(503).json({ error: 'Chart data provider unavailable' });
  }

  const points = raw.map((k: any[]) => ({
    timestamp: k[0],
    price: round(parseFloat(k[4]), 6),
    open: round(parseFloat(k[1]), 6),
    high: round(parseFloat(k[2]), 6),
    low: round(parseFloat(k[3]), 6),
    volume: round(parseFloat(k[5]), 4),
  }));

  return res.json(cacheSet(key, points));
});

// Public platform settings. The alert banner and platform rules are shown to
// every signed-in user, so they must not sit behind the admin guard. Returns the
// same rows as /api/admin/settings; none of these values are sensitive.
app.get('/api/settings/public', async (_req, res) => {
  try {
    let result = settingsStore;
    try {
      const { data, error } = await db.from('global_settings').select('*').order('key');
      if (data && !error && data.length > 0) {
        result = mergeStore(data.map(rowToSetting), result, 'key');
      }
    } catch {}
    res.set('Cache-Control', 'no-store');
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Only skip listen() when a serverless platform has already set this module up
// as the handler. Everywhere else this file is the process entry point.
// The previous implementation compared import.meta.url against argv, which
// throws in a CommonJS bundle and silently stopped the server from listening.
const isEntrypoint = () => {
  const serverless = [
    process.env.NETLIFY,
    process.env.AWS_LAMBDA_FUNCTION_NAME,
    process.env.LAMBDA_TASK_ROOT,
    process.env.VERCEL,
    process.env.WORKER,
  ];
  return !serverless.some(Boolean);
};

export default app;

if (isEntrypoint()) {
  app.listen(PORT, () => {
    console.log(`🚀 Nexo Finance API running on port ${PORT}`);
    console.log(`📊 Database: Supabase PostgreSQL (Hybrid Mode)`);
    console.log(`🔑 Supabase URL: ${SUPABASE_URL}`);
  });
}
