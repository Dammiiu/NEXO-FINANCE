import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  User,
  Sliders,
  DollarSign,
  Layers,
  Award,
  Globe,
  ChevronRight,
  Activity,
  Sun,
  Moon,
  ShieldAlert,
  Radio,
  Lock,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { AreaChart } from './components/AreaChart';
import { Sparkline } from './components/Sparkline';
import { HeaderLiveActivityTicker } from './components/HeaderLiveActivityTicker';
import { Testimonials } from './components/Testimonials';
import { WithdrawalGuards } from './components/WithdrawalGuards';
import { AdminPanel } from './components/AdminPanel';
import { Invest } from './pages/user/Invest';
import { KYC } from './pages/user/KYC';
import { Portfolio } from './pages/user/Portfolio';
import { Profile } from './pages/user/Profile';
import { Transactions } from './pages/user/Transactions';
import { Trade } from './pages/user/Trade';
import { Deposit } from './pages/user/Deposit';
import { Withdraw } from './pages/user/Withdraw';
import { CryptoAsset, UserProfile, Transaction } from './types';

const INITIAL_ASSETS: Record<string, CryptoAsset> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 96420.5,
    change24h: 3.45,
    high24h: 98100,
    low24h: 94200,
    volume24h: 42000000000,
    sparkline: [94200, 94800, 95300, 95100, 95800, 96100, 96420.5],
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2840.2,
    change24h: 1.82,
    high24h: 2910,
    low24h: 2780,
    volume24h: 18120000000,
    sparkline: [2780, 2800, 2820, 2810, 2835, 2840.2],
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    price: 198.75,
    change24h: 6.42,
    high24h: 204,
    low24h: 188.5,
    volume24h: 5105400200,
    sparkline: [188.5, 192, 195, 194, 197.5, 198.75],
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB Chain',
    price: 645.1,
    change24h: 0.88,
    high24h: 655,
    low24h: 638,
    volume24h: 1804005000,
    sparkline: [638, 640, 642, 644, 643, 645.1],
  },
  XRP: {
    symbol: 'XRP',
    name: 'Ripple',
    price: 2.45,
    change24h: 8.2,
    high24h: 2.6,
    low24h: 2.25,
    volume24h: 4890021000,
    sparkline: [2.25, 2.3, 2.38, 2.4, 2.45],
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    price: 1.0,
    change24h: 0.01,
    high24h: 1.01,
    low24h: 0.99,
    volume24h: 54100900000,
    sparkline: [1, 1, 0.99, 1, 1, 1],
  },
};

const DEFAULT_USER: UserProfile = {
  uid: 'usr_institutional_01',
  email: 'investor@nexo-client.com',
  fullName: 'Alexander Vance',
  balance: 48500.0,
  profitBalance: 12450.0,
  stakedBalance: 35000.0,
  totalWithdrawn: 18000.0,
  totalDeposited: 71500.0,
  kycStatus: 'verified_tier2',
  kycTier: 2,
  isVerified: true,
  isAdmin: true,
  hasDepositedMinimum: true,
  withdrawalFeePaid: true,
  twoFactorEnabled: true,
  referralCode: 'NEXO888',
  referralEarnings: 0,
  country: 'United States',
  phone: '+1 (555) 234-8890',
  createdAt: new Date().toISOString(),
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('portfolio');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [prices, setPrices] = useState<Record<string, CryptoAsset>>(INITIAL_ASSETS);
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nexo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem('nexo_authToken') || 'demo-jwt-token-institutional';
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [globalBanner, setGlobalBanner] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
 
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
 
  // Fetch initial profile and transactions
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('nexo_user', JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions/history', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const settings = await res.json();
        const banner = settings.find((s: any) => s.key === 'global_alert_banner')?.value;
        if (banner) setGlobalBanner(banner);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Theme synchronization with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
    fetchGlobalSettings();
  }, [authToken]);

  // Live Binance WebSocket / Polling Stream
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrices((prev) => {
            const updated = { ...prev };
            for (const item of data) {
              if (item.symbol.endsWith('USDT')) {
                const coin = item.symbol.replace('USDT', '');
                if (updated[coin]) {
                  const price = parseFloat(item.lastPrice);
                  const change24h = parseFloat(item.priceChangePercent);
                  const high24h = parseFloat(item.highPrice);
                  const low24h = parseFloat(item.lowPrice);
                  const volume24h = parseFloat(item.volume);

                  const spark = [...updated[coin].sparkline, price];
                  if (spark.length > 10) spark.shift();

                  updated[coin] = {
                    ...updated[coin],
                    price: Number(price.toFixed(coin === 'BTC' || coin === 'ETH' || coin === 'BNB' ? 2 : 4)),
                    change24h: Number(change24h.toFixed(2)),
                    high24h,
                    low24h,
                    volume24h,
                    sparkline: spark,
                  };
                }
              }
            }
            return updated;
          });
        }
      } catch {
        // Fallback smoothing
        setPrices((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((sym) => {
            const delta = (Math.random() - 0.49) * 0.002;
            const newPrice = updated[sym].price * (1 + delta);
            const spark = [...updated[sym].sparkline, newPrice];
            if (spark.length > 10) spark.shift();
            updated[sym] = {
              ...updated[sym],
              price: Number(newPrice.toFixed(sym === 'BTC' || sym === 'ETH' ? 2 : 4)),
              sparkline: spark,
            };
          });
          return updated;
        });
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleAuth = async () => {
    setAuthError(null);
    try {
      // Generate realistic Google OAuth user payload or prompt user for email
      const promptEmail = prompt('Enter your Google Account Email for instant sign-in:', authEmail || 'investor.global@gmail.com');
      if (!promptEmail) return;

      const namePart = promptEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = namePart
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: promptEmail.trim(),
          fullName: formattedName || 'Google Verified Investor',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          country: 'United States',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('nexo_user', JSON.stringify(data.user));
        localStorage.setItem('nexo_authToken', data.token);
        setShowAuthModal(false);
        fetchUserData();
        fetchTransactions();
      } else {
        setAuthError(data.error || 'Google authentication failed.');
      }
    } catch (err) {
      setAuthError('Failed to connect to Google authentication server.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          fullName: authName || authEmail.split('@')[0],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('nexo_user', JSON.stringify(data.user));
        localStorage.setItem('nexo_authToken', data.token);
        setShowAuthModal(false);
        fetchUserData();
        fetchTransactions();
      } else {
        setAuthError(data.error || 'Authentication error.');
      }
    } catch (err) {
      setAuthError('Connection failure.');
    }
  };

  const handleLogout = () => {
    setUser({
      ...DEFAULT_USER,
      balance: 0,
      profitBalance: 0,
      stakedBalance: 0,
      fullName: 'Guest Account',
      email: 'guest@nexo-client.com',
      isAdmin: false,
    });
    setAuthToken('');
    localStorage.removeItem('nexo_user');
    localStorage.removeItem('nexo_authToken');
    setShowAuthModal(true);
  };

  const cryptoPriceList = Object.values(prices);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-[#0B0E17] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Global Alert Banner (If broadcasted by admin) */}
      {globalBanner && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{globalBanner}</span>
          <button onClick={() => setGlobalBanner('')} className="ml-2 hover:opacity-80 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time On-Chain Marquee Header Stream */}
      <HeaderLiveActivityTicker theme={theme} />

      {/* Primary Sticky Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
          theme === 'dark' ? 'bg-[#0B0E17]/95 border-gray-800/90' : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveTab('portfolio');
              setIsAdminOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00FFB2] via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-[#00FFB2]/20">
              <div className="w-full h-full bg-[#0B0E17] rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#00FFB2]" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg tracking-tight flex items-center gap-1">
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>NEXO</span>
                <span className="text-[#00FFB2]">FINANCE</span>
              </span>
              <span className="text-[9px] text-slate-500 dark:text-gray-400 tracking-wider block font-mono">
                INSTITUTIONAL LIQUIDITY PROTOCOL
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav
            className={`hidden xl:flex items-center gap-1 p-1 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {[
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'trade', label: 'Trade Desk' },
              { id: 'invest', label: 'Yield Staking' },
              { id: 'deposit', label: 'Deposit' },
              { id: 'withdraw', label: 'Withdraw' },
              { id: 'kyc', label: 'KYC Vault' },
              { id: 'transactions', label: 'Ledger' },
              { id: 'profile', label: 'Account' },
            ].map((tab) => {
              const isActive = activeTab === tab.id && !isAdminOpen;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsAdminOpen(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00FFB2] text-black shadow-md'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {user?.isAdmin && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAdminOpen
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-rose-500 dark:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Suite</span>
              </button>
            )}
          </nav>

          {/* Right Header Controls: Theme Toggle, User Profile OR Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#121622] border-gray-800 text-gray-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* ONLY SHOW Sign In if user is NOT authenticated */}
            {(!authToken || user?.email === 'guest@nexo-client.com') && (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthMode('login');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FFB2] text-black font-black text-xs hover:bg-[#00E59E] transition cursor-pointer shadow-sm"
                title="Sign In or Register"
              >
                <Lock className="w-3 h-3 stroke-[2.5]" />
                <span>Sign In</span>
              </button>
            )}

            {user?.isAdmin && (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="xl:hidden p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* User Profile Chip - Displayed when signed in */}
            {Boolean(authToken && user?.email && user?.email !== 'guest@nexo-client.com') && (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tier 2 Verified</span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsAdminOpen(false);
                  }}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#121622] border-gray-800 hover:border-gray-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                  title="Manage Account Settings & Security"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#00FFB2]/20 border border-[#00FFB2]/40 flex items-center justify-center text-xs font-black text-[#00FFB2]">
                    {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-[11px] font-black block leading-tight font-mono text-slate-900 dark:text-white">
                      ${(user?.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-[#00FFB2] font-extrabold block leading-tight">
                      {user?.fullName ? user.fullName.split(' ')[0] : 'Account'} (Active)
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div
          className={`xl:hidden flex items-center overflow-x-auto no-scrollbar gap-2 px-4 py-2 border-t ${
            theme === 'dark' ? 'bg-[#0B0E17] border-gray-900' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {[
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'trade', label: 'Trade' },
            { id: 'invest', label: 'Invest' },
            { id: 'deposit', label: 'Deposit' },
            { id: 'withdraw', label: 'Withdraw' },
            { id: 'kyc', label: 'KYC' },
            { id: 'transactions', label: 'Ledger' },
            { id: 'profile', label: 'Account' },
          ].map((tab) => {
            const isActive = activeTab === tab.id && !isAdminOpen;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsAdminOpen(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#00FFB2] text-black shadow-md'
                    : theme === 'dark'
                    ? 'bg-gray-900 text-gray-400'
                    : 'bg-white text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Suite Overlay View */}
        {isAdminOpen ? (
          <AdminPanel
            currentUser={user}
            authToken={authToken}
            theme={theme}
            onClose={() => setIsAdminOpen(false)}
            onRefreshData={() => {
              fetchUserData();
              fetchTransactions();
              fetchGlobalSettings();
            }}
          />
        ) : (
          <>
            {activeTab === 'portfolio' && (
              <Portfolio
                user={user}
                cryptoPrices={cryptoPriceList}
                transactions={transactions}
                theme={theme}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'trade' && (
              <Trade
                user={user}
                cryptoPrices={cryptoPriceList}
                authToken={authToken}
                theme={theme}
                onRefreshUser={fetchUserData}
              />
            )}

            {activeTab === 'invest' && (
              <Invest
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={fetchUserData}
              />
            )}

            {activeTab === 'deposit' && (
              <Deposit
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={fetchUserData}
              />
            )}

            {activeTab === 'withdraw' && (
              <Withdraw
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={fetchUserData}
              />
            )}

            {activeTab === 'kyc' && (
              <KYC
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={fetchUserData}
              />
            )}

            {activeTab === 'transactions' && (
              <Transactions
                transactions={transactions}
                theme={theme}
              />
            )}

            {activeTab === 'profile' && (
              <Profile
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={fetchUserData}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Modal (Login / Sign Up) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border relative ${
              theme === 'dark' ? 'bg-[#121622] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#00FFB2]/10 border border-[#00FFB2]/30 flex items-center justify-center mx-auto text-[#00FFB2] mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black">
                  {authMode === 'login' ? 'Institutional Sign In' : 'Open Vault Account'}
                </h3>
                <p className="text-xs text-gray-400">Access your private multi-currency cryptographic ledger</p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                  {authError}
                </div>
              )}

              {/* Google Sign-In / Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Or Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
                <span className="text-[10px] uppercase font-bold text-gray-400">or sign in with email</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Vance"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00FFB2]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00FFB2]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer mt-2"
                >
                  {authMode === 'login' ? 'Authenticate Session' : 'Create Account'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-[#00FFB2] hover:underline font-bold"
                >
                  {authMode === 'login'
                    ? "Don't have an account? Register here"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className={`border-t py-8 mt-12 text-xs transition-colors duration-200 ${
          theme === 'dark' ? 'bg-[#080A10] border-gray-800 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FFB2]" />
            <span className="font-bold">NEXO FINANCE PROTOCOL • Regulated Institutional Custody</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>0xGuard Multi-Sig Vaults</span>
            <span>•</span>
            <span>Proof of Reserves: $184,200,000</span>
            <span>•</span>
            <span>AES-256 Encrypted Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
