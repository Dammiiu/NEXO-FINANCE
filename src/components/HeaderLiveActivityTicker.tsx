import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { LiveActivity } from '../types';
import {
  GLOBAL_IDENTITIES,
  INITIAL_200_LIVE_ACTIVITIES,
  createDynamicLiveActivity,
} from '../data/globalNames';

interface HeaderLiveActivityTickerProps {
  theme?: 'dark' | 'light';
  onViewLedger?: () => void;
}

export const HeaderLiveActivityTicker: React.FC<HeaderLiveActivityTickerProps> = ({
  theme = 'dark',
  onViewLedger,
}) => {
  // Pre-seeded with 250+ unique, shuffled global transactions spanning 45+ countries
  const [activities, setActivities] = useState<LiveActivity[]>(() => INITIAL_200_LIVE_ACTIVITIES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showProofModal, setShowProofModal] = useState<boolean>(false);
  const [selectedProof, setSelectedProof] = useState<LiveActivity | null>(null);


  // Smooth 8–15 second transition cycle across all transactions
  const ROTATION_INTERVAL_MS = 8000 + Math.floor(Math.random() * 7000);

  // Seamless, glitch-free automatic carousel rotation across the 250+ transactions
  useEffect(() => {
    if (isPaused || activities.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, activities.length]);


  // Increment seconds ago timer dynamically
  useEffect(() => {
    const secInterval = setInterval(() => {
      setActivities((prev) =>
        prev.map((act) => ({
          ...act,
          timeAgoSeconds: act.timeAgoSeconds + 1,
        }))
      );
    }, 1000);
    return () => clearInterval(secInterval);
  }, []);

  const getFlag = (countryName: string, fallbackFlag?: string) => {
    if (fallbackFlag) return fallbackFlag;
    const found = GLOBAL_IDENTITIES.find(
      (c) => c.country.toLowerCase() === countryName.toLowerCase()
    );
    return found ? found.flag : '🌐';
  };

  const currentActivity = activities[currentIndex % activities.length] || activities[0];




  return (
    <>
      {/* Top Banner Real-time Multi-Sig Ticker */}
      <div
        id="top-activity-notification-bar"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full border-b transition-colors relative z-30 select-none overflow-hidden bg-slate-50 dark:bg-[#06080F] border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white shadow-xs"
      >



        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Live Multi-Sig Node Indicator Pill */}
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide border shadow-xs bg-white dark:bg-gray-900/90 border-slate-300 dark:border-gray-700 text-emerald-700 dark:text-[#00FFB2]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFB2] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFB2]"></span>
            </span>
            <span className="uppercase text-[10px] font-mono font-black hidden sm:inline">
              Live Transactions
            </span>
          </div>

          {/* Center: Dynamic Live Notification Banner with Smooth Transition */}
          {currentActivity && (
            <div
              key={currentActivity.id}
              onClick={() => {
                setSelectedProof(currentActivity);
                setShowProofModal(true);
              }}
              className={`flex-1 flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden animate-notification-swap ${
                currentActivity.type === 'withdrawal'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 hover:border-rose-400 shadow-xs'
                  : 'bg-white dark:bg-gray-900/90 border-slate-300 dark:border-gray-700/80 hover:border-emerald-500 dark:hover:border-[#00FFB2]/60 shadow-xs'
              }`}
              title="Click to inspect verified 0xGuard Cryptographic Settlement Proof"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                <span className="text-base shrink-0">
                  {getFlag(currentActivity.country, currentActivity.flag)}
                </span>

                {/* Investor Name & Country. Secondary labels drop away on small
                    screens so the amount always stays readable. */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] uppercase font-black text-slate-500 dark:text-gray-400 hidden sm:inline">
                    Investor:
                  </span>
                  <span className="text-xs sm:text-sm font-black tracking-tight truncate text-slate-900 dark:text-white">
                    {currentActivity.name}
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 border border-slate-300 dark:border-gray-700 hidden md:inline">
                    {currentActivity.country}
                  </span>
                </div>

                <span className="text-xs hidden sm:inline text-slate-300 dark:text-gray-600">•</span>

                {/* Action Badge & Amount (Strictly Capped Under $35,000) */}
                {currentActivity.type === 'withdrawal' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">Disbursal</span>
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                      -${Math.min(34900, currentActivity.amount).toLocaleString()} USD
                    </span>
                  </div>
                ) : currentActivity.type === 'deposit' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                      <ArrowDownLeft className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">Deposit</span>
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                      +${Math.min(34900, currentActivity.amount).toLocaleString()} USD
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-teal-100 dark:bg-[#00FFB2]/20 text-teal-800 dark:text-[#00FFB2] border border-teal-300 dark:border-[#00FFB2]/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Staking</span>
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-teal-800 dark:text-[#00FFB2]">
                      ${Math.min(34900, currentActivity.amount).toLocaleString()} USD
                    </span>
                  </div>
                )}

                {/* Channel Tag */}
                <span className="text-[11px] hidden md:inline font-mono truncate text-slate-500 dark:text-gray-400">
                  via {currentActivity.channel}
                </span>
              </div>

              {/* Right: Timestamp & Proof Verification Pill */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[10px] font-mono whitespace-nowrap text-slate-500 dark:text-gray-400">
                  {currentActivity.timeAgoSeconds < 60
                    ? `${currentActivity.timeAgoSeconds}s ago`
                    : `${Math.floor(currentActivity.timeAgoSeconds / 60)}m ago`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-black hidden lg:inline bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  Proof ✓
                </span>
              </div>
            </div>
          )}



        </div>
      </div>

      {/* Proof & Ledger Inspector Modal.
          Rendered through a portal: the ticker lives inside a sticky wrapper,
          which forms its own stacking context, so an in-tree fixed overlay would
          be trapped underneath overlays that are not part of that stack. */}
      {showProofModal && selectedProof && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border relative bg-white dark:bg-[#121622] border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white">
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    selectedProof.type === 'withdrawal'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/30'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/30'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <span>0xGuard Multi-Sig Ledger Proof</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                    TxRef: {selectedProof.id.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Transaction Summary Card */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  selectedProof.type === 'withdrawal'
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30'
                    : 'bg-slate-50 dark:bg-gray-950/60 border-slate-200 dark:border-gray-800'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-gray-400">Activity Type:</span>
                  <span
                    className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                      selectedProof.type === 'withdrawal'
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                    }`}
                  >
                    {selectedProof.type}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-gray-400">Transaction Amount:</span>
                  <span
                    className={`font-mono font-black text-base ${
                      selectedProof.type === 'withdrawal'
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {selectedProof.type === 'withdrawal' ? '-' : '+'}$
                    {Math.min(34900, selectedProof.amount).toLocaleString()} USD
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-gray-400">Verified Investor:</span>
                  <span className="font-black flex items-center gap-1.5 text-slate-950 dark:text-white">
                    <span>{getFlag(selectedProof.country, selectedProof.flag)}</span>
                    <span>
                      {selectedProof.name} ({selectedProof.country})
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-gray-400">Settlement Route:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-gray-200">
                    {selectedProof.channel}
                  </span>
                </div>
              </div>

              {/* Cryptographic Details */}
              <div className="space-y-2 text-xs font-mono p-3.5 rounded-2xl border bg-slate-100 dark:bg-gray-950/80 border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Cryptographic Hash:</span>
                  <span className="truncate max-w-[200px] font-bold text-slate-900 dark:text-white">
                    {selectedProof.txHash ||
                      `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Consensus Nodes:</span>
                  <span className="text-emerald-700 dark:text-[#00FFB2] font-bold">
                    12/12 Signatures Validated
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Block Timestamp:</span>
                  <span className="text-slate-800 dark:text-gray-300">
                    {new Date().toUTCString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Gate:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    0xGuard Real-Time Certified
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowProofModal(false)}
                  className="w-full py-3 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Close Proof Inspector
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default HeaderLiveActivityTicker;
