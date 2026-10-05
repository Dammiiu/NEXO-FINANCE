import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  ExternalLink,
  DollarSign,
  ArrowRight,
  Radio,
  Activity,
  Globe2,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, CryptoAsset, Transaction, LiveActivity } from '../../types';
import AreaChart from '../../components/AreaChart';
import Sparkline from '../../components/Sparkline';
import Testimonials from '../../components/Testimonials';
import { GLOBAL_IDENTITIES } from '../../data/globalNames';

interface PortfolioProps {
  user: UserProfile;
  cryptoPrices: CryptoAsset[];
  transactions: Transaction[];
  theme?: 'dark' | 'light';
  onNavigate: (tab: string) => void;
}

const ASSET_COLORS = ['#00FFB2', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981'];

const RECENT_SETTLEMENTS = [
  {
    id: 'set-1',
    name: 'Alexander Vance',
    country: 'United States',
    flag: '🇺🇸',
    action: 'Withdrawal',
    amount: 18000,
    network: 'USDT (TRC-20)',
    time: '2m ago',
    hash: '0x8f3...a91c',
    status: 'Settled',
  },
  {
    id: 'set-2',
    name: 'Sarah Jenkins',
    country: 'United States',
    flag: '🇺🇸',
    action: 'Withdrawal',
    amount: 14250,
    network: 'Ethereum (ERC-20)',
    time: '4m ago',
    hash: '0x1b4...78fe',
    status: 'Settled',
  },
  {
    id: 'set-3',
    name: 'Hiroto Kobayashi',
    country: 'Japan',
    flag: '🇯🇵',
    action: 'Staking Locked',
    amount: 50000,
    network: 'VIP Staking Vault (3.8%)',
    time: '7m ago',
    hash: '0x4e2...cc90',
    status: 'Active',
  },
  {
    id: 'set-4',
    name: 'Maximilian Krause',
    country: 'Germany',
    flag: '🇩🇪',
    action: 'Deposit',
    amount: 72000,
    network: 'SEPA Instant SWIFT',
    time: '11m ago',
    hash: '0x9d1...54bb',
    status: 'Confirmed',
  },
  {
    id: 'set-5',
    name: 'Beat Meier',
    country: 'Switzerland',
    flag: '🇨🇭',
    action: 'Withdrawal',
    amount: 28900,
    network: '0xGuard Multi-Sig',
    time: '14m ago',
    hash: '0x7c3...112e',
    status: 'Settled',
  },
  {
    id: 'set-6',
    name: 'Wei Jie Tan',
    country: 'Singapore',
    flag: '🇸🇬',
    action: 'Deposit',
    amount: 41600,
    network: 'Bitcoin (BTC Native)',
    time: '19m ago',
    hash: '0x3a8...00fd',
    status: 'Confirmed',
  },
];

export const Portfolio: React.FC<PortfolioProps> = ({
  user,
  cryptoPrices,
  transactions,
  theme = 'dark',
  onNavigate,
}) => {
  const [settlements, setSettlements] = useState(RECENT_SETTLEMENTS);

  // The hero chart tracks BTC. Looked up by symbol rather than index so a
  // reordering of the ticker list cannot silently point it at another asset.
  const btc = cryptoPrices.find((c) => c.symbol === 'BTC');

  useEffect(() => {
    const interval = setInterval(() => {
      const identity = GLOBAL_IDENTITIES[Math.floor(Math.random() * GLOBAL_IDENTITIES.length)];
      const actions = ['Deposit', 'Withdrawal', 'Staking Locked'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const amount = Math.floor(Math.random() * 85000) + 5000;
      
      const networks = {
        'Deposit': ['Bitcoin (BTC Native)', 'ERC-20 USDT', 'TRC-20 USDT', 'SEPA SWIFT Transfer'],
        'Withdrawal': ['TRC-20 USDT', 'ERC-20 USDT', 'Bitcoin (BTC Native)', '0xGuard Multi-Sig Desk'],
        'Staking Locked': ['VIP Staking Vault (3.8%)', 'Compound Yield Node', 'HFT Arbitrage Pool']
      };
      
      const networkOptions = networks[action as keyof typeof networks] || ['ERC-20 USDT'];
      const network = networkOptions[Math.floor(Math.random() * networkOptions.length)];
      
      const hash = `0x${Math.random().toString(16).substring(2, 5)}...${Math.random().toString(16).substring(2, 6)}`;
      const status = action === 'Withdrawal' ? 'Settled' : action === 'Deposit' ? 'Confirmed' : 'Active';

      const newRow = {
        id: `set-${Date.now()}`,
        name: identity.name,
        country: identity.country,
        flag: identity.flag || '🌐',
        action,
        amount,
        network,
        time: 'Just now',
        hash,
        status,
      };

      setSettlements((prev) => {
        const updatedPrev = prev.map((row) => {
          if (row.time === 'Just now') return { ...row, time: '1m ago' };
          if (row.time.endsWith('m ago')) {
            const mins = parseInt(row.time) || 1;
            return { ...row, time: `${mins + 1}m ago` };
          }
          return row;
        });
        return [newRow, ...updatedPrev.slice(0, 5)];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const totalNetWorth = (user.balance || 0) + (user.stakedBalance || 0) + (user.profitBalance || 0);

  // Allocation breakdown
  const allocations = [
    { name: 'Available Cash', value: user.balance || 0 },
    { name: 'Staked Capital', value: user.stakedBalance || 0 },
    { name: 'Accrued Profits', value: user.profitBalance || 0 },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Metric Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <div
          className={`p-6 rounded-3xl border transition duration-200 ${
            isDark
              ? 'bg-[#121622] border-gray-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-500 dark:text-gray-400 uppercase tracking-wider">TOTAL ESTIMATED ASSETS</span>
            <div className="w-8 h-8 rounded-xl bg-[#00FFB2]/10 border border-[#00FFB2]/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight font-mono">
            ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+24.8% (30-day cumulative gain)</span>
          </div>
        </div>

        {/* Liquid Balance */}
        <div
          className={`p-6 rounded-3xl border transition duration-200 ${
            isDark
              ? 'bg-[#121622] border-gray-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-500 dark:text-gray-400 uppercase tracking-wider">AVAILABLE CASH BALANCE</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight font-mono">
            ${(user.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-gray-400 font-medium">
            Ready for immediate withdrawal / spot trading
          </div>
        </div>

        {/* Staked Capital */}
        <div
          className={`p-6 rounded-3xl border transition duration-200 ${
            isDark
              ? 'bg-[#121622] border-gray-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-500 dark:text-gray-400 uppercase tracking-wider">ACTIVE STAKED VAULTS</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight font-mono">
            ${(user.stakedBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Compounding daily yield (up to 3.8%)</span>
          </div>
        </div>

        {/* Accrued Staking Yields */}
        <div
          className={`p-6 rounded-3xl border transition duration-200 ${
            isDark
              ? 'bg-[#121622] border-gray-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-500 dark:text-gray-400 uppercase tracking-wider">CLAIMABLE YIELD PROFITS</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
            ${(user.profitBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-gray-400">Total Cleared: ${Number(user.totalWithdrawn || 0).toLocaleString()}</span>
            <button
              onClick={() => onNavigate('invest')}
              className="text-emerald-600 dark:text-[#00FFB2] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <span>Stake More</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Shortcuts Buttons with High Contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigate('deposit')}
          className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Deposit Capital</span>
        </button>

        <button
          onClick={() => onNavigate('withdraw')}
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer border hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-white'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-blue-500 dark:text-blue-400 stroke-[2.5]" />
          <span>Withdrawal Desk</span>
        </button>

        <button
          onClick={() => onNavigate('invest')}
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer border hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-white'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 stroke-[2.5]" />
          <span>Yield Staking (3.8%)</span>
        </button>

        <button
          onClick={() => onNavigate('trade')}
          className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer border hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-white'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>Spot Trade Desk</span>
        </button>
      </div>

      {/* Main Interactive Chart Section & Asset Allocation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time price chart */}
        <div
          className={`lg:col-span-2 p-6 rounded-3xl border ${
            isDark ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <AreaChart
            theme={theme}
            symbol="BTC/USDT"
            currentPrice={btc?.price ?? 0}
            change24h={btc?.change24h ?? 0}
          />
        </div>

        {/* Asset Allocation Split */}
        <div
          className={`p-6 rounded-3xl border flex flex-col justify-between ${
            isDark ? 'bg-[#121622] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
                <span>Asset Allocation Split</span>
              </h3>
              <span className="text-xs text-emerald-600 dark:text-[#00FFB2] font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                100% Vaulted
              </span>
            </div>

            <div className="space-y-4">
              {allocations.map((item, idx) => {
                const percent = totalNetWorth > 0 ? ((item.value / totalNetWorth) * 100).toFixed(1) : '0.0';
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSET_COLORS[idx] }} />
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-950 dark:text-white font-mono">
                        ${item.value.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: ASSET_COLORS[idx],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 mt-6 text-xs space-y-1.5">
            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
              <span>Multi-Signature Cold Storage Custody</span>
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-[11px] leading-relaxed">
              Institutional assets are secured with isolated multi-signature cold storage vaults and verified on-chain via 0xGuard real-time consensus.
            </p>
          </div>
        </div>
      </div>

      {/* Live Global On-Chain Settlement Stream Table */}
      <div
        className={`p-6 rounded-3xl border ${
          isDark ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" />
              <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                <span>Live Global On-Chain Settlement Stream</span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
              Real-time multi-signature ledger showing global investor withdrawals, deposits, and staking events
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-[#00FFB2] bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
              12/12 Nodes Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-gray-800">
              <tr>
                <th className="pb-3">Verified Investor</th>
                <th className="pb-3">Country / Region</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Settlement Amount</th>
                <th className="pb-3">Route / Network</th>
                <th className="pb-3">Tx Hash</th>
                <th className="pb-3">Time</th>
                <th className="pb-3 text-right">0xGuard Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
              {settlements.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition">
                  <td className="py-3.5">
                    <div className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 font-medium">
                      <span>{row.flag}</span>
                      <span>{row.country}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    {row.action === 'Withdrawal' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-[11px] font-black uppercase">
                        <ArrowUpRight className="w-3 h-3 text-red-600 dark:text-red-400 stroke-[3]" />
                        <span>Withdrawal</span>
                      </span>
                    ) : row.action === 'Deposit' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                        <span>Deposit</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Staked</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-mono font-black text-sm">
                    <span className={row.action === 'Withdrawal' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {row.action === 'Withdrawal' ? '-' : '+'}${row.amount.toLocaleString()} USD
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-gray-300 font-mono text-[11px]">
                    {row.network}
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                    <span className="underline cursor-pointer hover:text-blue-500">{row.hash}</span>
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-gray-400 font-mono text-[11px] font-bold">
                    {row.time}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#00FFB2] text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{row.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Binance Price Tickers with Sparklines */}
      <div
        className={`p-6 rounded-3xl border ${
          isDark ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <span>Live Binance & Spot Crypto Index</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Direct WebSocket sub-second price streaming with 24h market depth
            </p>
          </div>

          <button
            onClick={() => onNavigate('trade')}
            className="text-xs font-black text-emerald-600 dark:text-[#00FFB2] hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Advanced Trade Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-gray-800">
              <tr>
                <th className="pb-3">Asset</th>
                <th className="pb-3">Market Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">24h High / Low</th>
                <th className="pb-3">24h Volume</th>
                <th className="pb-3 text-center">Trend (7D)</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
              {cryptoPrices.map((coin) => {
                const isPositive = coin.change24h >= 0;
                return (
                  <tr key={coin.symbol} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition">
                    <td className="py-3.5">
                      <div className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                        <span>{coin.symbol}</span>
                        <span className="text-[11px] font-normal text-slate-500 dark:text-gray-400">{coin.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-black text-sm text-slate-950 dark:text-white font-mono">
                      ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-black text-xs ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {coin.change24h}%
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-gray-400 font-mono text-[11px]">
                      <div>H: ${coin.high24h.toLocaleString()}</div>
                      <div>L: ${coin.low24h.toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-gray-400 font-mono text-[11px]">
                      ${(coin.volume24h / 1e6).toFixed(1)}M
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex justify-center">
                        <Sparkline data={coin.sparkline} isPositive={isPositive} theme={theme} />
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('trade')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-[#00FFB2] dark:text-black font-black text-xs hover:opacity-90 transition cursor-pointer"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audited Wall of Love / Testimonials */}
      <Testimonials theme={theme} />
    </div>
  );
};

export default Portfolio;
