export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  sparkline: number[];
  icon?: string;
}

export type KYCStatus = 'unverified' | 'pending' | 'verified_tier1' | 'verified_tier2' | 'verified_tier3' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  country?: string;
  address?: string;
  avatarUrl?: string;
  balance: number;
  profitBalance: number;
  stakedBalance: number;
  totalWithdrawn: number;
  totalDeposited?: number;
  kycStatus: KYCStatus;
  kycTier: number;
  isAdmin: boolean;
  isVerified: boolean;
  hasDepositedMinimum: boolean;
  withdrawalFeePaid: boolean;
  twoFactorEnabled: boolean;
  antiPhishingCode?: string;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  isBanned?: boolean;
  banReason?: string;
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  badge?: string;
  profit: string;
  dailyProfitPercent: number;
  min: string;
  minDepositUsd: number;
  max: string;
  maxDepositUsd: number;
  days: string;
  durationDays: number;
  desc: string;
  features: string[];
  popular?: boolean;
}

export interface ActiveInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  cryptoAsset: string;
  cryptoAmount: number;
  dailyProfitPercent: number;
  expectedProfitUsd: number;
  totalClaimed: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'active' | 'completed' | 'cancelled';
  autoCompound: boolean;
  lastClaimDate?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'trade_buy' | 'trade_sell' | 'profit' | 'fee';
export type TransactionStatus = 'approved' | 'pending' | 'processing' | 'rejected' | 'failed';
export type TransactionMethod = 'crypto' | 'bank' | 'card' | 'giftcard';

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: TransactionType;
  method?: TransactionMethod;
  amount: number;
  coin: string;
  cryptoAmount?: number;
  txHash?: string;
  destinationAddress?: string;
  status: TransactionStatus;
  createdAt: string;
  details?: string;
  adminReason?: string;
  networkFee?: number;
}

export interface KYCDocument {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  country: string;
  docType: 'passport' | 'id_card' | 'drivers_license' | 'national_id' | 'residence_permit' | 'other' | string;
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

export interface GiftCardSubmission {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  code: string;
  pin: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  imageProofUrl?: string;
  submittedAt: string;
  adminReason?: string;
}

export interface CardSubmission {
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
  reference?: string;
  submittedAt: string;
  status: 'pending' | 'captured' | 'approved' | 'settled' | 'rejected' | 'flagged';
}

export interface AdminWalletSetting {
  id: string;
  coin: string;
  network: string;
  address: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
  label: string;
}

export interface GlobalSetting {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface SpotHolding {
  coin: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface TradeOrder {
  id: string;
  userId: string;
  pair: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price: number;
  amount: number;
  total: number;
  status: 'filled' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface LiveActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'staking_reward';
  name: string;
  country: string;
  amount: number;
  channel: string;
  timeAgoSeconds: number;
  txHash?: string;
  city?: string;
  flag?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  category: 'all' | 'vip' | 'crypto' | 'institutional' | 'payout';
  rating: number;
  stakedAsset: string;
  earnings: string;
  avatarBg: string;
  avatarInitials: string;
  quote: string;
  verifiedDate: string;
  likes: number;
  auditTxHash: string;
  programDuration: string;
}
