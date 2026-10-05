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
  Menu,
} from 'lucide-react';
import { AuthPortal } from './components/AuthPortal';
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
import { fetchTickers, fetchSparkline } from './lib/market';

const INITIAL_ASSETS: Record<string, CryptoAsset> = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', price: 84400, change24h: -0.46, high24h: 87220, low24h: 83888, volume24h: 2229330499, sparkline: [84400] },
  ETH: { symbol: 'ETH', name: 'Ethereum', price: 2667.15, change24h: -1.29, high24h: 2777.33, low24h: 2650.88, volume24h: 1145200967, sparkline: [2667.15] },
  SOL: { symbol: 'SOL', name: 'Solana', price: 118.05, change24h: -0.22, high24h: 123.76, low24h: 117.11, volume24h: 387584204, sparkline: [118.05] },
  BNB: { symbol: 'BNB', name: 'BNB Chain', price: 766.04, change24h: -0.52, high24h: 784.46, low24h: 760.35, volume24h: 110657072, sparkline: [766.04] },
  XRP: { symbol: 'XRP', name: 'Ripple', price: 1.4742, change24h: -2, high24h: 1.555, low24h: 1.4458, volume24h: 305571658, sparkline: [1.4742] },
  USDT: { symbol: 'USDT', name: 'Tether USD', price: 1, change24h: 0, high24h: 1, low24h: 1, volume24h: 0, sparkline: [1] },
};


export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('portfolio');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [prices, setPrices] = useState<Record<string, CryptoAsset>>(INITIAL_ASSETS);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nexo_user');
    const token = localStorage.getItem('nexo_authToken');
    if (saved && token) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem('nexo_authToken') || '';
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [globalBanner, setGlobalBanner] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
 
  // Fetch initial profile and transactions
  const handleRefreshData = () => {
    fetchUserData();
    fetchTransactions();
    fetchGlobalSettings();
  };

  const fetchUserData = async () => {
    if (!authToken) return;
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
    if (!authToken) return;
    try {
      const res = await fetch('/api/transactions', {
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

  const applyBanner = (settings: any) => {
    const banner = (settings || []).find((s: any) => s.key === 'global_alert_banner')?.value;
    if (banner) setGlobalBanner(banner);
  };

  const fetchGlobalSettings = async () => {
    try {
      // The banner is shown to every user, so use the public route. Never fall
      // back to the admin-guarded route for a normal account: that answers 401
      // even with a valid token, which the session guard would treat as an
      // expired login and sign the user straight back out.
      const res = await fetch('/api/settings/public');
      if (res.ok) {
        applyBanner(await res.json());
        return;
      }

      // Backend predates the public route; admins can still read it directly.
      if (!user?.isAdmin) return;
      const token = authToken || localStorage.getItem('nexo_authToken') || '';
      if (!token) return;
      const adminRes = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (adminRes.ok) applyBanner(await adminRes.json());
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
    if (authToken) {
      fetchUserData();
      fetchTransactions();
      fetchGlobalSettings();
    }
  }, [authToken]);

  // Live market prices, proxied through our API (Binance primary, CoinGecko fallback).
  // If a poll fails we simply keep the last known good prices - we never invent them.
  useEffect(() => {
    const loadTickers = async () => {
      try {
        const rows = await fetchTickers();
        if (!rows || rows.length === 0) return;

        setPrices((prev) => {
          const next: Record<string, CryptoAsset> = { ...prev };
          rows.forEach((r: any) => {
            const cur = next[r.symbol];
            if (!cur) return;
            const spark = [...cur.sparkline, r.price].slice(-24);
            next[r.symbol] = {
              ...cur,
              name: r.name && r.name !== r.symbol ? r.name : cur.name,
              price: r.price,
              change24h: r.change24h,
              high24h: r.high24h,
              low24h: r.low24h,
              volume24h: r.volume24h,
              sparkline: spark.length > 1 ? spark : cur.sparkline,
            };
          });
          return next;
        });
      } catch {
        // Keep the previous values rather than showing fabricated numbers.
      }
    };

    loadTickers();
    const timer = setInterval(loadTickers, 5000);
    return () => clearInterval(timer);
  }, []);

  // Real 7-day history for the table sparklines (42 x 4h candles).
  useEffect(() => {
    const coins = ["BTC", "ETH", "SOL", "BNB", "XRP", "USDT"];

    const loadSparklines = async () => {
      await Promise.all(
        coins.map(async (coin) => {
          try {
            const series = await fetchSparkline(coin);
            if (series.length === 0) return;
            setPrices((prev) =>
              prev[coin] ? { ...prev, [coin]: { ...prev[coin], sparkline: series } } : prev
            );
          } catch {
            // ignore
          }
        })
      );
    };

    loadSparklines();
    const timer = setInterval(loadSparklines, 600000);
    return () => clearInterval(timer);
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
        sessionStorage.removeItem('nexo_session_recovered');
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
        sessionStorage.removeItem('nexo_session_recovered');
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
    setUser(null);
    setAuthToken('');
    localStorage.removeItem('nexo_user');
    localStorage.removeItem('nexo_authToken');
    setIsAdminOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = (authUser: UserProfile, token: string) => {
    setUser(authUser);
    setAuthToken(token);
    localStorage.setItem('nexo_user', JSON.stringify(authUser));
    localStorage.setItem('nexo_authToken', token);
    sessionStorage.removeItem('nexo_session_recovered');
  };

  if (!authToken || !user) {
    return (
      <AuthPortal
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

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
                <Zap className="w-5 h-5 text-emerald-600 dark:text-[#00FFB2]" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg tracking-tight flex items-center gap-1">
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>NEXO</span>
                <span className="text-emerald-600 dark:text-[#00FFB2]">FINANCE</span>
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

          {/* Right Header Controls: Theme Toggle, User Profile, Admin, Sign Out */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dynamic KYC Badge (desktop) */}
            <div
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                user.kycTier >= 2
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : user.kycTier === 1
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>
                {user.kycTier >= 2 ? 'Tier 2 Verified' : user.kycTier === 1 ? 'Tier 1 Verified' : 'Tier 0 Unverified'}
              </span>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#121622] border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300 shadow-xs'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Profile Chip - Displayed when signed in */}
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsAdminOpen(false);
              }}
              className={`flex items-center gap-2 p-1.5 pr-2.5 sm:pr-3 rounded-2xl border transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#121622] border-gray-800 hover:border-gray-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
              title="Manage Account Settings & Security"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-black text-[#00FFB2]">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[11px] font-black block leading-tight font-mono text-slate-900 dark:text-white">
                  ${user.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-[#00FFB2] font-extrabold block leading-tight">
                  {user.fullName.split(' ')[0]} (Active)
                </span>
              </div>
            </button>

            {/* Admin shortcut on mobile */}
            {user.isAdmin && (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className={`xl:hidden p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                  isAdminOpen
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400'
                }`}
                title="Admin Control Suite"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            {/* Logout shortcut */}
            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl border transition cursor-pointer text-slate-400 hover:text-red-500 hover:border-red-500/30 ${
                theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-slate-100 border-slate-200'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 xl:pb-12">
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
                onRefreshUser={handleRefreshData}
              />
            )}

            {activeTab === 'invest' && (
              <Invest
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={handleRefreshData}
              />
            )}

            {activeTab === 'deposit' && (
              <Deposit
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={handleRefreshData}
              />
            )}

            {activeTab === 'withdraw' && (
              <Withdraw
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={handleRefreshData}
                onNavigateDeposit={() => setActiveTab('deposit')}
              />
            )}

            {activeTab === 'kyc' && (
              <KYC
                user={user}
                authToken={authToken}
                theme={theme}
                onRefreshUser={handleRefreshData}
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
                onRefreshUser={handleRefreshData}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Sticky at bottom on small screens) */}
      <nav
        className={`xl:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl transition-colors duration-200 ${
          theme === 'dark'
            ? 'bg-[#0B0E17]/95 border-gray-800 text-gray-400'
            : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
        }`}
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {[
            { id: 'portfolio', label: 'Portfolio', icon: Wallet },
            { id: 'trade', label: 'Trade', icon: TrendingUp },
            { id: 'invest', label: 'Invest', icon: Sparkles },
            { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isAdminOpen && !isMobileMenuOpen;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsAdminOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1 h-full py-1 cursor-pointer transition ${
                  isActive
                    ? 'text-emerald-600 dark:text-[#00FFB2] font-black'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition ${
                    isActive ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#00FFB2]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* More / Menu Drawer Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 cursor-pointer transition relative ${
              isMobileMenuOpen ||
              ['withdraw', 'kyc', 'transactions', 'profile'].includes(activeTab) ||
              isAdminOpen
                ? 'text-emerald-600 dark:text-[#00FFB2] font-black'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                isMobileMenuOpen ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#00FFB2]' : ''
              }`}
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] tracking-tight">Menu</span>
            {user.isAdmin && (
              <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-up Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={`relative z-10 w-full rounded-t-3xl border-t p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto ${
              theme === 'dark'
                ? 'bg-[#121622] border-gray-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-1.5 rounded-full bg-gray-600/40 mx-auto mb-4" />

            {/* User identity card */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-[#00FFB2]">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-black leading-tight">{user.fullName}</h4>
                  <span className="text-[11px] text-gray-400 font-mono">{user.email}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {user.kycStatus === 'verified_tier2' ? 'Tier 2 Verified' : user.kycStatus}
                </span>
                <span className="block text-xs font-mono font-bold mt-1 text-emerald-600 dark:text-[#00FFB2]">
                  ${user.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[
                { id: 'withdraw', label: 'Withdrawal Desk', icon: ArrowUpRight, desc: 'Crypto & Bank wire' },
                { id: 'kyc', label: 'KYC Vault', icon: ShieldCheck, desc: 'Identity verification' },
                { id: 'transactions', label: 'Ledger', icon: Layers, desc: 'Audit & tx history' },
                { id: 'profile', label: 'Account Profile', icon: User, desc: 'Security & settings' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && !isAdminOpen;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsAdminOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:border-[#00FFB2] dark:text-[#00FFB2]'
                        : theme === 'dark'
                        ? 'bg-[#0B0E17] border-gray-800 hover:border-gray-700 text-white'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-gray-400 block">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {user.isAdmin && (
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-3 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between font-bold text-xs cursor-pointer hover:bg-rose-500/15"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Open Administrative Suite</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Actions: Theme and Logout */}
            <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  theme === 'dark' ? 'bg-[#0B0E17] border-gray-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
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
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
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
