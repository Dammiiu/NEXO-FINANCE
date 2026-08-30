import React, { useState } from 'react';
import {
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Info,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../../types';
import WithdrawalGuards from '../../components/WithdrawalGuards';

interface WithdrawProps {
  user: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
  onNavigateDeposit?: () => void;
}

export const Withdraw: React.FC<WithdrawProps> = ({
  user,
  authToken,
  theme = 'dark',
  onRefreshUser,
  onNavigateDeposit,
}) => {
  const [method, setMethod] = useState<'crypto' | 'bank'>('crypto');
  const [coin, setCoin] = useState('USDT (TRC-20)');
  const [amount, setAmount] = useState('1000');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: user.fullName || '',
    bankName: '',
    accountNumber: '',
    swift: '',
    routingNumber: '',
  });

  const [showGuardModal, setShowGuardModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const gasFee = method === 'crypto' ? 5.0 : 25.0;
  const netDisbursal = Math.max(0, numericAmount - gasFee);

  const handleOpenGuardCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (numericAmount <= 0) {
      setErrorMessage('Please enter a valid disbursement amount.');
      return;
    }

    if (numericAmount > (user?.balance ?? 0)) {
      setErrorMessage(`Insufficient liquid balance. Your available cash balance is $${(user?.balance ?? 0).toLocaleString()}.`);
      return;
    }

    if (method === 'crypto' && !destinationAddress) {
      setErrorMessage('Please provide your recipient crypto wallet address.');
      return;
    }

    if (method === 'bank' && (!bankDetails.bankName || !bankDetails.accountNumber)) {
      setErrorMessage('Please fill in required bank account information.');
      return;
    }

    setShowGuardModal(true);
  };

  const handleFinalizeWithdrawal = async () => {
    setShowGuardModal(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          coin: method === 'crypto' ? coin : 'USD',
          amount: numericAmount,
          destinationAddress: method === 'crypto' ? destinationAddress : `${bankDetails.bankName} - ${bankDetails.accountNumber}`,
          details: method === 'bank' ? JSON.stringify(bankDetails) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Withdrawal of $${numericAmount.toLocaleString()} submitted to Institutional Clearance Queue (Tx: ${data.id || 'NEXO-WD-OK'})!`
        );
        onRefreshUser();
      } else {
        setErrorMessage(data.error || 'Withdrawal clearance rejected by compliance engine.');
      }
    } catch (err) {
      setErrorMessage('Connection error during withdrawal clearance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Institutional Liquidity Settlement</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Capital Withdrawal Desk
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
          Withdraw funds to your external crypto cold wallet or international bank account with zero delay.
        </p>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Guard Trigger Modal */}
      {showGuardModal && (
        <WithdrawalGuards
          user={user}
          amount={numericAmount}
          currency={method === 'crypto' ? coin : 'USD'}
          destinationAddress={method === 'crypto' ? destinationAddress : `${bankDetails.bankName} (${bankDetails.accountNumber})`}
          theme={theme}
          onSuccess={handleFinalizeWithdrawal}
          onCancel={() => setShowGuardModal(false)}
          onNavigateDeposit={onNavigateDeposit}
        />
      )}

      {/* Form and Summary Container */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border grid grid-cols-1 lg:grid-cols-2 gap-8 ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <form onSubmit={handleOpenGuardCheck} className="space-y-4 text-xs">
          {/* Method Selection */}
          <div>
            <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-2">Disbursement Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('crypto')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold text-xs transition ${
                  method === 'crypto'
                    ? 'border-[#00FFB2] bg-[#00FFB2]/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 text-slate-500 dark:text-gray-400'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
                <span>Crypto Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold text-xs transition ${
                  method === 'bank'
                    ? 'border-[#00FFB2] bg-[#00FFB2]/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 text-slate-500 dark:text-gray-400'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Bank Wire (SWIFT/ACH)</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-500 dark:text-gray-400 font-semibold">Withdrawal Amount (USD)</label>
              <span className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                Available: ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400" />
              <input
                type="number"
                min="50"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-16 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
              <button
                type="button"
                onClick={() => setAmount(user.balance.toString())}
                className="absolute right-2 top-2 px-2 py-1 rounded bg-[#00FFB2]/20 text-emerald-700 dark:text-[#00FFB2] text-[10px] font-black uppercase"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Crypto Fields */}
          {method === 'crypto' && (
            <>
              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Cryptocurrency Asset</label>
                <select
                  value={coin}
                  onChange={(e) => setCoin(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                >
                  <option value="USDT (TRC-20)">USDT (TRC-20 Network - Fastest)</option>
                  <option value="Bitcoin (BTC)">Bitcoin (BTC Native)</option>
                  <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                  <option value="USDC (ERC-20)">USDC (USD Coin)</option>
                  <option value="Solana (SOL)">Solana (SOL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Recipient Destination Address</label>
                <input
                  type="text"
                  required
                  placeholder="Paste your external crypto address..."
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
            </>
          )}

          {/* Bank Fields */}
          {method === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  required
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barclays Bank PLC / Chase"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">IBAN / Account #</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BARCGB22"
                    value={bankDetails.swift}
                    onChange={(e) => setBankDetails({ ...bankDetails, swift: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Proceed to 0xGuard Security Verification</span>
          </button>
        </form>

        {/* Breakdown Card */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800">
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-gray-800 pb-3">
              Settlement Ledger Preview
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">Gross Request:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${numericAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">Network Gas & Processing:</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">-${gasFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-gray-400">KYC Clearance Tier:</span>
                <span className="font-bold text-emerald-600 dark:text-[#00FFB2] uppercase">Tier {user.kycTier} Verified</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-gray-800 pt-2 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Net Disbursal:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-500 text-base">
                  ${netDisbursal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-400 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Automated Node Clearance</span>
              </div>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                Crypto withdrawals under $10,000 are processed through our automated hot wallets. Larger disbursements
                undergo multi-sig clearance within 10–30 minutes.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-gray-500 flex items-center gap-1.5 pt-4">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FFB2]" />
            <span>End-to-End Cryptographic Ledger Hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Withdraw;
