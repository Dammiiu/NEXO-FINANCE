import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  DollarSign,
  AlertCircle,
  X,
  PartyPopper,
  CalendarClock,
} from 'lucide-react';
import { UserProfile, InvestmentPlan, ActiveInvestment } from '../../types';

interface InvestProps {
  user: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
}

// Shown on the confirmation sheet once a contract is live, so the user has a
// record of what they just locked rather than only a green line of text.
interface InvestReceipt {
  planName: string;
  amount: number;
  durationDays: number;
  dailyProfitPercent: number;
  netProfit: number;
  totalReturn: number;
  maturity: string;
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

  // Selecting a plan opens the activation sheet in place. Previously the card
  // only highlighted and the form sat far below the fold, so on a phone tapping
  // a plan appeared to do nothing.
  const [isPlanOpen, setIsPlanOpen] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<InvestReceipt | null>(null);

  const openPlan = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.minDepositUsd.toString());
    setErrorMessage(null);
    setMessage(null);
    setIsPlanOpen(true);
  };

  const closePlan = () => {
    if (isSubmitting) return; // never abandon a request mid-flight
    setIsPlanOpen(false);
    setErrorMessage(null);
  };

  // Stop the page behind the sheet from scrolling under the user's thumb.
  useEffect(() => {
    if (!isPlanOpen && !receipt) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isPlanOpen, receipt]);

  // Escape closes whichever sheet is open.
  useEffect(() => {
    if (!isPlanOpen && !receipt) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPlanOpen(false);
        setReceipt(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlanOpen, receipt]);

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

  const handleCreateInvestment = async () => {
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
        // Hand over to the confirmation sheet rather than a transient line.
        setReceipt({
          planName: selectedPlan.name,
          amount: numericAmount,
          durationDays: selectedPlan.durationDays,
          dailyProfitPercent: selectedPlan.dailyProfitPercent,
          netProfit,
          totalReturn,
          maturity: new Date(Date.now() + selectedPlan.durationDays * 86400000).toLocaleDateString(
            undefined,
            { year: 'numeric', month: 'short', day: 'numeric' }
          ),
        });
        setIsPlanOpen(false);
        setMessage(null);
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
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/investments/claim/${subId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Yield claimed successfully! Added $${Number(data.claimedAmount ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} to your profits.`
        );
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
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={`Open the ${plan.name}`}
              onClick={() => openPlan(plan)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPlan(plan);
                }
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
                  onClick={() => openPlan(plan)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                    isSelected
                      ? 'bg-[#00FFB2] text-black shadow-md'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {isSelected ? 'Open Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>


      {/* Claim results. Claiming happens in the subscriptions panel below, so
          the notice sits directly above it where the eye already is - the
          activation sheet owns its own confirmation. */}
      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-[#00FFB2] text-xs font-bold flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-px" />
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label="Dismiss"
            className="shrink-0 p-0.5 -m-0.5 rounded hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && !isPlanOpen && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss"
            className="shrink-0 p-0.5 -m-0.5 rounded hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* Plan activation sheet. A bottom sheet on phones (thumb reachable, full
          width) and a centred dialog from sm up. */}
      {isPlanOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Activate the ${selectedPlan.name}`}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={closePlan}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl animate-fade-in ${
                theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              {/* Sheet grab handle, phones only */}
              <div className="sm:hidden pt-3 flex justify-center">
                <span className="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-gray-700" />
              </div>

              <div className="flex items-start justify-between gap-3 p-5 sm:p-6 pb-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#00FFB2] border border-emerald-500/20 mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Activate Contract</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    {selectedPlan.days} &middot; +{selectedPlan.profit}% guaranteed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePlan}
                  aria-label="Close"
                  disabled={isSubmitting}
                  className="shrink-0 p-2 -m-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Amount + activation */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="invest-amount"
                      className="block text-slate-600 dark:text-gray-400 font-semibold mb-1.5 text-xs"
                    >
                      Allocation Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3.5 text-slate-400 dark:text-gray-500" />
                      <input
                        id="invest-amount"
                        type="number"
                        inputMode="decimal"
                        min={selectedPlan.minDepositUsd}
                        max={selectedPlan.maxDepositUsd}
                        step="any"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-14 py-3 text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                      />
                      <span className="absolute right-3 top-3.5 text-slate-500 dark:text-gray-400 font-bold text-xs">
                        USD
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1.5">
                      Plan range ${selectedPlan.min} &ndash; ${selectedPlan.max}
                    </p>
                  </div>

                  {/* Quick amounts, clamped to this plan's own limits */}
                  <div className="flex flex-wrap gap-2">
                    {[selectedPlan.minDepositUsd, 2500, 5000, 10000, 25000]
                      .filter((a, i, arr) => a <= selectedPlan.maxDepositUsd && arr.indexOf(a) === i)
                      .map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setInvestAmount(amt.toString())}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                            numericAmount === amt
                              ? 'bg-[#00FFB2] text-black'
                              : 'bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300'
                          }`}
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-bold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    onClick={handleCreateInvestment}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] disabled:opacity-60 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Securing Contract</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Activate Staking Contract</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-500 dark:text-gray-400 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px text-emerald-600 dark:text-[#00FFB2]" />
                    <span>Collateralized by Nexo Multi-Sig Liquidity Pool</span>
                  </p>
                </div>

                {/* Financial breakdown */}
                <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800">
                  <div className="space-y-3.5 text-xs">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-gray-800 pb-3 text-slate-900 dark:text-white">
                      Contract Breakdown
                    </h4>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-gray-400">Principal:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ${numericAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-gray-400">Lockup:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {selectedPlan.days}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-gray-400">Daily yield:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{selectedPlan.profit}% (guaranteed)
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-gray-400">Net profit:</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        +${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-gray-400">
                        Total projected return
                      </div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        ${totalReturn.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-gray-400 pt-4">
                    Capital returns to your liquid balance on maturity. Accrued yield can be
                    claimed at any time from Active Staking Subscriptions below.
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Investment confirmation. A signed-off receipt rather than a passing
          toast, so the terms just accepted are still readable afterwards. */}
      {receipt &&
        createPortal(
          <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div
              role="status"
              aria-live="polite"
              className={`w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl ${
                theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="relative px-6 pt-8 pb-6 text-center bg-emerald-500/10 border-b border-emerald-500/20">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <PartyPopper className="w-7 h-7 text-emerald-600 dark:text-[#00FFB2]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Staking Contract Activated
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                  {receipt.planName} is now earning against the Nexo liquidity pool.
                </p>

                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-[#00FFB2]">
                    Projected net profit
                  </div>
                  <div className="text-4xl font-black font-mono text-emerald-600 dark:text-[#00FFB2] mt-0.5">
                    +${receipt.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-2.5 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400">Plan</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receipt.planName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400">Capital locked</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${receipt.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400">Daily yield</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{receipt.dailyProfitPercent}%
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400">Lockup</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {receipt.durationDays} days
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Maturity
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{receipt.maturity}</span>
                </div>

                <div className="flex justify-between gap-3 pt-2.5 mt-1 border-t border-slate-200 dark:border-gray-800">
                  <span className="text-slate-600 dark:text-gray-300 font-semibold">Total projected return</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-[#00FFB2] text-sm">
                    ${receipt.totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="w-full mt-3 py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
export default Invest;
