import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { UserProfile, InvestmentPlan, ActiveInvestment } from '../../types';

interface InvestProps {
  user: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
}

const DEFAULT_PLANS: InvestmentPlan[] = [
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
    badge: 'MOST POPULAR',
    popular: true,
    desc: 'Our most popular plan. Balanced risk & high daily returns.',
    features: ['Compounded daily interest', 'Principal insurance guarantee', 'Priority withdrawal speed', 'Institutional sub-account tier'],
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
    badge: 'MAX APY',
    desc: 'Maximum APY staking backed by institutional collateral.',
    features: ['Institutional collateral reserve pool', 'Custom SLA yield contract', 'Direct OTC desk connection', 'Dedicated compliance team'],
  },
];

export const Invest: React.FC<InvestProps> = ({
  user,
  authToken,
  theme = 'dark',
  onRefreshUser,
}) => {
  const [plans, setPlans] = useState<InvestmentPlan[]>(DEFAULT_PLANS);
  const [activeSubs, setActiveSubs] = useState<ActiveInvestment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan>(DEFAULT_PLANS[1]);
  const [investAmount, setInvestAmount] = useState<string>('1500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchActiveInvestments = async () => {
    try {
      const res = await fetch('/api/investments/mine', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSubs(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActiveInvestments();
  }, [authToken]);

  // Calculate projected return
  const numericAmount = parseFloat(investAmount) || 0;
  const totalReturn = (numericAmount * (selectedPlan.dailyProfitPercent / 100) * selectedPlan.durationDays) + numericAmount;
  const netProfit = totalReturn - numericAmount;

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (numericAmount < selectedPlan.minDepositUsd) {
      setErrorMessage(`Minimum investment for ${selectedPlan.name} is $${selectedPlan.minDepositUsd.toLocaleString()}.`);
      return;
    }

    if (numericAmount > (user?.balance ?? 0)) {
      setErrorMessage(
        `Insufficient liquid balance ($${(user?.balance ?? 0).toLocaleString()}). Please deposit capital first.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/investments/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: numericAmount,
          durationDays: selectedPlan.durationDays,
          dailyProfitPercent: selectedPlan.dailyProfitPercent,
          autoCompound: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Successfully activated ${selectedPlan.name} with $${numericAmount.toLocaleString()} locked!`);
        onRefreshUser();
        fetchActiveInvestments();
      } else {
        setErrorMessage(data.error || 'Failed to activate staking contract.');
      }
    } catch (err) {
      setErrorMessage('Connection failure while activating investment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimYield = async (subId: string) => {
    setClaimingId(subId);
    setMessage(null);
    try {
      const res = await fetch(`/api/investments/claim/${subId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Yield claimed successfully! Added $${data.claimedAmount?.toLocaleString()} to your profits.`);
        onRefreshUser();
        fetchActiveInvestments();
      } else {
        setErrorMessage(data.error || 'Failed to claim accrued yield.');
      }
    } catch (err) {
      setErrorMessage('Connection error claiming yield.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="staking-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tier Staking Contracts</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Automated High-Yield Crypto Vaults
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
            Lock capital into institutional mining and liquidity algorithms to earn guaranteed daily yield.
          </p>
        </div>

        <div
          className={`px-4 py-2.5 rounded-2xl border text-xs flex items-center gap-3 ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-gray-400 block text-[10px]">Available Liquid Balance</span>
            <span className="font-black text-emerald-600 dark:text-[#00FFB2] text-base font-mono">
              ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => {
                setSelectedPlan(plan);
                setInvestAmount(plan.minDepositUsd.toString());
              }}
              className={`p-6 rounded-3xl border transition duration-200 flex flex-col justify-between cursor-pointer relative ${
                isSelected
                  ? 'border-[#00FFB2] bg-[#00FFB2]/5 shadow-xl shadow-[#00FFB2]/10 ring-2 ring-[#00FFB2]/30'
                  : theme === 'dark'
                  ? 'bg-[#121622] border-gray-800 hover:border-gray-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#00FFB2] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{plan.desc}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950/60 border border-slate-200 dark:border-gray-800">
                  <div className="text-3xl font-black text-emerald-600 dark:text-[#00FFB2] font-mono">+{plan.profit}%</div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold mt-0.5">{plan.days}</div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-gray-400">
                    <span>Min Allocation:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">${plan.min}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-gray-400">
                    <span>Max Allocation:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">${plan.max}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-gray-800/80 space-y-2 text-[11px]">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FFB2] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                    isSelected
                      ? 'bg-[#00FFB2] text-black shadow-md'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {isSelected ? 'Selected Tier' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive ROI Calculator & Contract Activation Form */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border grid grid-cols-1 lg:grid-cols-2 gap-8 ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-[#00FFB2]" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Instant Compound Yield Calculator
            </h3>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
            Specify your allocation amount to preview estimated daily returns, total net profit, and automated maturity
            disbursement dates.
          </p>

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateInvestment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-gray-400 font-semibold mb-1">
                Selected Plan: <span className="text-emerald-600 dark:text-[#00FFB2] font-bold">{selectedPlan.name}</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-gray-500" />
                <input
                  type="number"
                  min={selectedPlan.minDepositUsd}
                  step="any"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-14 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 dark:text-gray-400 font-bold">USD</span>
              </div>
            </div>

            {/* Quick amount buttons */}
            <div className="flex flex-wrap gap-2">
              {[selectedPlan.minDepositUsd, 2500, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInvestAmount(amt.toString())}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-[11px]"
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Activate High-Yield Staking Contract</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Projected Return Card */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800">
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-gray-800 pb-3">
              Contract Financial Breakdown
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">Principal Deposit:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">Lockup Duration:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedPlan.days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">Yield Multiplier:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{selectedPlan.profit}% (Guaranteed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">Estimated Net Profits:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  +${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-semibold">Total Projected Return</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1.5 pt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FFB2]" />
            <span>Collateralized by Nexo Multi-Sig Liquidity Pool</span>
          </div>
        </div>
      </div>

      {/* Active Staking Subscriptions */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-black text-base flex gap-2 items-center text-slate-900 dark:text-white">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
            <span>Active Staking Subscriptions ({activeSubs.length})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-gray-400 font-mono">Live Counter</span>
        </div>

        {activeSubs.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Lock className="w-10 h-10 text-slate-400 dark:text-gray-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-gray-400">No active staking contracts. Select a plan above to start earning daily yield.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-950/60 border border-slate-200 dark:border-gray-800 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{sub.planName}</span>
                    <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">ID: {sub.id.substring(0, 8)}...</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#00FFB2] border border-emerald-500/20 uppercase animate-pulse">
                    Active Yielding
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 block">Locked Capital</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">${sub.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 block">Daily Yield</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+{sub.dailyProfitPercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 block">Total Expected</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-[#00FFB2]">
                      ${Number(sub.expectedProfitUsd || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-gray-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                    Accrued: ${Number(sub.totalClaimed || 0).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleClaimYield(sub.id)}
                    disabled={claimingId === sub.id}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition cursor-pointer"
                  >
                    {claimingId === sub.id ? 'Claiming...' : 'Claim Accrued Yield'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Invest;
