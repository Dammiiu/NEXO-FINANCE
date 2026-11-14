import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  Users,
  FileCheck,
  CreditCard,
  Gift,
  Wallet,
  Settings,
  LayoutDashboard,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Lock,
  Unlock,
  Radio,
  PlusCircle,
  X,
  Sparkles,
  Edit3,
  Trash2,
  Copy,
  Check,
  UserCheck,
  UserX,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  UserProfile,
  Transaction,
  KYCDocument,
  GiftCardSubmission,
  CardSubmission,
  AdminWalletSetting,
  GlobalSetting,
} from '../types';

interface AdminPanelProps {
  currentUser: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onClose: () => void;
  onRefreshData?: () => void;
}

// ─── KYC document viewer ──────────────────────────────────────────────────────
// Applicants upload base64 data URLs, so the thumbnails render straight from the
// stored value with no object storage. Clicking one opens it full size.
const KycDocumentViewer: React.FC<{ doc: KYCDocument }> = ({ doc }) => {
  const [open, setOpen] = useState<string | null>(null);

  const all: { label: string; url?: string }[] = [
    { label: 'Front', url: doc.frontImageUrl },
    { label: 'Back', url: doc.backImageUrl },
    { label: 'Selfie', url: doc.selfieUrl },
    { label: 'Address', url: doc.proofOfAddressUrl },
  ];
  const items: { label: string; url: string }[] = [];
  for (const i of all) {
    if (typeof i.url === 'string' && i.url.length > 0) {
      items.push({ label: i.label, url: i.url });
    }
  }

  if (items.length === 0) {
    return <span className="text-[10px] text-gray-500">None attached</span>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            title={`View ${item.label.toLowerCase()} document`}
            onClick={() => setOpen(item.url)}
            className="group relative w-12 h-12 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 hover:border-[#00FFB2] transition"
          >
            <img
              src={item.url}
              alt={`${item.label} document`}
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/75 text-[8px] font-black uppercase text-white py-0.5 text-center">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <img
            src={open}
            alt="KYC document"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute top-5 right-5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

// Gift card proofs are stored as data URLs in the database, so opening the raw
// URL in a new tab can cause the browser to lock up on large uploads. Keep the
// image inside the admin dashboard with a modal viewer instead.
const GiftCardImageViewer: React.FC<{ imageUrl?: string | null }> = ({ imageUrl }) => {
  const [open, setOpen] = useState<string | null>(null);

  if (!imageUrl) {
    return <span className="text-[10px] text-gray-500">No Image</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(imageUrl)}
        className="inline-flex items-center gap-1 text-[11px] text-[#00FFB2] hover:underline bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"
      >
        <img src={imageUrl} alt="Gift proof" className="w-6 h-6 object-cover rounded" />
        <span>View Image</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={open}
              alt="Gift card proof"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Card numbers are stored in full so a processor can settle them, but the vault
// shows only the brand and last four until an admin explicitly reveals the rest.
const PanCardNumber: React.FC<{ number?: string }> = ({ number }) => {
  const [revealed, setRevealed] = useState(false);
  const digits = String(number || '').replace(/\s/g, '');

  if (!digits) return <span className="text-gray-600 text-[11px]">Not provided</span>;

  const brand =
    /^4/.test(digits) ? 'Visa'
    : /^5[1-5]/.test(digits) || /^2[2-7]/.test(digits) ? 'Mastercard'
    : /^3[47]/.test(digits) ? 'Amex'
    : /^6(?:011|5)/.test(digits) ? 'Discover'
    : 'Card';

  const masked = digits.length > 8
    ? digits.slice(0, 4) + '•'.repeat(Math.max(4, digits.length - 8)) + digits.slice(-4)
    : '••••' + digits.slice(-4);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[10px] font-black uppercase text-gray-500">{brand}</span>
      <span className="font-mono text-[#00FFB2]">{revealed ? digits : masked}</span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        title={revealed ? 'Hide card number' : 'Reveal full card number'}
        className="text-gray-500 hover:text-white transition cursor-pointer"
      >
        {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
};

// The CVC and PIN are sealed at rest and deliberately withheld from the vault
// listing, so opening the tab cannot expose every card on the platform. Reading
// one is a separate call that the server writes to the audit trail, which is
// also why the reveal auto-hides: it should not sit on screen for the room.
const SealedSecret: React.FC<{
  cardId: string;
  label: string;
  available: boolean;
  authToken: string;
  onError: (msg: string) => void;
}> = ({ cardId, label, available, authToken, onError }) => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value) return;
    // Re-mask shortly after reading so a revealed secret does not linger on a
    // shared or recorded screen.
    const t = setTimeout(() => setValue(null), 30000);
    return () => clearTimeout(t);
  }, [value]);

  if (!available) return <span className="text-gray-600 text-[11px]">Not captured</span>;

  const toggle = async () => {
    if (value) {
      setValue(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cards/${cardId}/secrets`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not read the stored value.');
      const next = label === 'CVC' ? data.cvc : data.pin;
      if (!next) throw new Error('No value was stored for this submission.');
      setValue(String(next));
    } catch (err: any) {
      onError(err?.message || 'Could not read the stored value.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-[#00FFB2] min-w-[42px]">
        {loading ? '...' : value || '•••'}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        title={value ? `Hide ${label}` : `Reveal ${label} (recorded in the audit log)`}
        className="text-gray-500 hover:text-white transition disabled:opacity-40 cursor-pointer"
      >
        {value ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  authToken,
  theme = 'dark',
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'stats' | 'users' | 'txns' | 'kyc' | 'giftcards' | 'wallets' | 'settings' | 'cards'
  >('stats');

  const [stats, setStats] = useState<any>({
    totalUsers: 4,
    totalDepositsVolume: 1254300,
    totalWithdrawalsVolume: 489200,
    activeStakingVolume: 840500,
    pendingKYCCount: 1,
    pendingWithdrawalsCount: 1,
    pendingWithdrawalsVolume: 12400,
  });

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [allpaysStatus, setAllpaysStatus] = useState<Record<string, string>>({});

  const pollAllpaysStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/allpays/status', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.status) setAllpaysStatus(data.status);
    } catch {
      // transient
    }
  }, [authToken]);

  useEffect(() => {
    pollAllpaysStatus();
    const id = setInterval(pollAllpaysStatus, 20000);
    return () => clearInterval(id);
  }, [pollAllpaysStatus]);
  const [giftCards, setGiftCards] = useState<GiftCardSubmission[]>([]);
  const [cards, setCards] = useState<CardSubmission[]>([]);
  const [wallets, setWallets] = useState<AdminWalletSetting[]>([]);
  const [settings, setSettings] = useState<GlobalSetting[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'admin'>('all');

  const [stepUpUser, setStepUpUser] = useState<UserProfile | null>(null);
  const [stepUpPassword, setStepUpPassword] = useState('');
  const [stepUpReason, setStepUpReason] = useState('');
  const [stepUpBusy, setStepUpBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [editUserData, setEditUserData] = useState<{
    balance: number;
    profitBalance: number;
    stakedBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    isAdmin: boolean;
    isVerified: boolean;
    hasDepositedMinimum: boolean;
    withdrawalFeePaid: boolean;
    twoFactorEnabled: boolean;
    kycTier: number;
    kycStatus: string;
    status: 'active' | 'suspended' | 'locked';
    banReason: string;
    fullName: string;
    phone: string;
    country: string;
    securityPin: string;
  }>({
    balance: 0,
    profitBalance: 0,
    stakedBalance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    isAdmin: false,
    isVerified: true,
    hasDepositedMinimum: true,
    withdrawalFeePaid: true,
    twoFactorEnabled: false,
    kycTier: 1,
    kycStatus: 'unverified',
    status: 'active',
    banReason: '',
    fullName: '',
    phone: '',
    country: '',
    securityPin: '0000',
  });

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    fullName: '',
    password: 'password123',
    balance: parseFloat((Math.random() * (4967 - 3750) + 3750).toFixed(2)),
    profitBalance: 0,
    stakedBalance: 0,
    kycTier: 1,
    isAdmin: false,
  });

  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<AdminWalletSetting | null>(null);
  const [walletFormData, setWalletFormData] = useState<{
    coin: string;
    network: string;
    address: string;
    label: string;
    memo: string;
    qrCodeUrl: string;
    isEnabled: boolean;
  }>({
    coin: 'Bitcoin',
    network: 'BTC (Native SegWit)',
    address: '',
    label: 'Primary BTC Cold Vault',
    memo: '',
    qrCodeUrl: '',
    isEnabled: true,
  });

  const safeFetch = async <T,>(url: string, fallback: T): Promise<T> => {
    try {
      const res = await fetch(url, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Safe fallback on network transition
    }
    return fallback;
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        usersData,
        txnsData,
        kycData,
        giftcardsData,
        walletsData,
        settingsData,
        cardsData,
      ] = await Promise.all([
        safeFetch<any>('/api/admin/stats', stats),
        safeFetch<UserProfile[]>('/api/admin/users', users),
        safeFetch<Transaction[]>('/api/admin/transactions', transactions),
        safeFetch<KYCDocument[]>('/api/admin/kyc', kycDocs),
        safeFetch<GiftCardSubmission[]>('/api/admin/giftcards', giftCards),
        safeFetch<AdminWalletSetting[]>('/api/admin/wallets', wallets),
        safeFetch<GlobalSetting[]>('/api/admin/settings', settings),
        safeFetch<CardSubmission[]>('/api/admin/cards', cards),
      ]);

      if (statsData) setStats(statsData);
      if (Array.isArray(usersData) && usersData.length > 0) setUsers(usersData);
      if (Array.isArray(txnsData)) setTransactions(txnsData);
      if (Array.isArray(kycData)) setKycDocs(kycData);
      if (Array.isArray(giftcardsData)) setGiftCards(giftcardsData);
      if (Array.isArray(walletsData) && walletsData.length > 0) setWallets(walletsData);
      if (Array.isArray(settingsData) && settingsData.length > 0) setSettings(settingsData);
      if (Array.isArray(cardsData)) setCards(cardsData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [authToken]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || 'Institutional accounts reseeded with randomized balances ($3,750 - $4,967).');
        await fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        setErrorMessage(data.error || 'Failed to reseed database.');
      }
    } catch (err) {
      setErrorMessage('Connection error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setSelectedUser(u);
    setEditUserData({
      balance: u.balance || 0,
      profitBalance: u.profitBalance || 0,
      stakedBalance: u.stakedBalance || 0,
      totalDeposited: u.totalDeposited || 0,
      totalWithdrawn: u.totalWithdrawn || 0,
      isAdmin: Boolean(u.isAdmin),
      isVerified: Boolean(u.isVerified),
      hasDepositedMinimum: Boolean(u.hasDepositedMinimum),
      withdrawalFeePaid: Boolean(u.withdrawalFeePaid),
      twoFactorEnabled: Boolean(u.twoFactorEnabled),
      kycTier: u.kycTier || 1,
      kycStatus: u.kycStatus || 'unverified',
      status: (u as any).status || (u.isBanned ? 'suspended' : 'active'),
      banReason: (u as any).banReason || '',
      fullName: u.fullName || '',
      phone: u.phone || '',
      country: u.country || 'United States',
      securityPin: (u as any).securityPin || '0000',
    });
  };

  const handleSaveUser = async (uid: string) => {
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUserData),
      });
      if (res.ok) {
        setActionMessage(`Account for ${editUserData.fullName || uid} updated successfully.`);
        setSelectedUser(null);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to update user account.');
      }
    } catch (err) {
      setErrorMessage('Connection error saving user account.');
    }
  };

  const handleToggleUserStatus = async (
    user: UserProfile,
    stepUp?: { confirmPassword: string; banReason: string }
  ) => {
    const isCurrentlySuspended = (user as any).status === 'suspended' || user.isBanned;
    const newStatus = isCurrentlySuspended ? 'active' : 'suspended';
    const reason = stepUp?.banReason ?? (isCurrentlySuspended ? '' : 'Administrative compliance review in progress.');

    if (!isCurrentlySuspended && user.uid === currentUser.uid) {
      setErrorMessage('You cannot suspend your own account. Ask another administrator to do it.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.uid}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          banReason: reason,
          confirmPassword: stepUp?.confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setActionMessage(`User ${user.email} is now ${newStatus.toUpperCase()}.`);
        setStepUpUser(null);
        setStepUpPassword('');
        setStepUpReason('');
        fetchAdminData();
        if (onRefreshData) onRefreshData();
        return;
      }

      if (data?.stepUp && !stepUp) {
        setStepUpUser(user);
        setStepUpPassword('');
        setStepUpReason('');
        setErrorMessage(null);
        return;
      }
      setStepUpUser(null);
      setErrorMessage(data?.error || 'Failed to update user status.');
    } catch (err) {
      setErrorMessage('Failed to update user status.');
    }
  };

  const handleAdjustBalance = (field: 'balance' | 'profitBalance' | 'stakedBalance', amount: number) => {
    setEditUserData((prev) => ({
      ...prev,
      [field]: Math.max(0, parseFloat((prev[field] + amount).toFixed(2))),
    }));
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (res.ok) {
        setActionMessage(`New user ${newUserData.email} created with initial balance of $${newUserData.balance.toLocaleString()}.`);
        setShowAddUserModal(false);
        setNewUserData({
          email: '',
          fullName: '',
          password: 'password123',
          balance: parseFloat((Math.random() * (4967 - 3750) + 3750).toFixed(2)),
          profitBalance: 0,
          stakedBalance: 0,
          kycTier: 1,
          isAdmin: false,
        });
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to create user');
      }
    } catch (err) {
      setErrorMessage('Error communicating with server.');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setActionMessage('User account deleted.');
        if (selectedUser?.uid === uid) setSelectedUser(null);
        fetchAdminData();
      }
    } catch (err) {
      setErrorMessage('Failed to delete user.');
    }
  };

  const handleOpenAddWallet = () => {
    setWalletFormData({
      coin: 'Bitcoin (BTC)',
      network: 'BTC (Native SegWit)',
      address: '',
      label: 'Primary BTC Cold Vault',
      memo: '',
      qrCodeUrl: '',
      isEnabled: true,
    });
    setShowAddWalletModal(true);
  };

  const handleOpenEditWallet = (w: AdminWalletSetting) => {
    setEditingWallet(w);
    setWalletFormData({
      coin: w.coin,
      network: w.network,
      address: w.address,
      label: w.label || `${w.coin} Deposit Vault`,
      memo: (w as any).memo || '',
      qrCodeUrl: w.qrCodeUrl || '',
      isEnabled: w.isEnabled !== undefined ? w.isEnabled : true,
    });
  };

  const handleSaveNewWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletFormData.coin || !walletFormData.address) {
      setErrorMessage('Coin name and wallet address are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletFormData),
      });

      if (res.ok) {
        setActionMessage(`System deposit wallet for ${walletFormData.coin} added successfully.`);
        setShowAddWalletModal(false);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to add wallet');
      }
    } catch (err) {
      setErrorMessage('Connection error saving wallet.');
    }
  };

  const handleSaveEditedWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    try {
      const res = await fetch(`/api/admin/wallets/${editingWallet.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletFormData),
      });

      if (res.ok) {
        setActionMessage(`Wallet ${walletFormData.coin} (${walletFormData.network}) updated successfully.`);
        setEditingWallet(null);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to update wallet');
      }
    } catch (err) {
      setErrorMessage('Connection error updating wallet.');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to remove this deposit wallet address?')) return;
    try {
      const res = await fetch(`/api/admin/wallets/${walletId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setActionMessage('System wallet address removed from gateway.');
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setErrorMessage('Failed to delete wallet.');
    }
  };

  const handleTransactionAction = async (txnId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/transactions/${txnId}/action`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`Transaction marked as ${action.toUpperCase()}.`);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setErrorMessage('Failed to audit transaction.');
    }
  };

  const handleKycAction = async (kycId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/kyc/${kycId}/action`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`KYC Document status updated to ${action.toUpperCase()}.`);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setErrorMessage('Failed to audit KYC submission.');
    }
  };

  const handleGiftCardAction = async (giftCardId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/giftcards/${giftCardId}/action`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`Gift Card status updated to ${action.toUpperCase()} and credited.`);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to update gift card.');
      }
    } catch (err) {
      setErrorMessage('Failed to audit gift card.');
    }
  };

  const handleCardAction = async (cardId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/cards/${cardId}/action`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`Card checkout status updated to ${action.toUpperCase()} and credited.`);
        fetchAdminData();
        if (onRefreshData) onRefreshData();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to update card.');
      }
    } catch (err) {
      setErrorMessage('Failed to audit card.');
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/admin/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setActionMessage(`Global platform setting '${key}' published.`);
        fetchAdminData();
      }
    } catch (err) {
      setErrorMessage('Failed to update setting.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (userStatusFilter === 'active') return (u as any).status !== 'suspended' && !u.isBanned;
    if (userStatusFilter === 'suspended') return (u as any).status === 'suspended' || u.isBanned;
    if (userStatusFilter === 'admin') return u.isAdmin;
    return true;
  });

  return (
    <div
      className="bg-[#121724] border border-gray-800 rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden animate-fade-in"
      id="admin-panel-container"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Institutional Backoffice & User Ledger Management
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition cursor-pointer"
            title="Randomize accounts between $3,750 - $4,967"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00FFB2]" />
            <span>Randomize Balances ($3,750 - $4,967)</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
            title="Refresh Ledger State"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00FFB2]' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500 text-gray-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-gray-800/80 mb-6">
        {[
          { id: 'stats', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'users', label: 'User Management', icon: Users, badge: users.length },
          { id: 'wallets', label: 'System Wallets', icon: Wallet, badge: wallets.length },
          { id: 'txns', label: 'Transaction Ledger', icon: RefreshCw, badge: transactions.length },
          { id: 'kyc', label: 'KYC Verifications', icon: FileCheck, badge: kycDocs.filter((k) => k.status === 'pending').length },
          { id: 'giftcards', label: 'Gift Cards', icon: Gift, badge: giftCards.length },
          { id: 'cards', label: 'Card Vault', icon: CreditCard, badge: cards.length },
          { id: 'settings', label: 'System Rules', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedUser(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#00FFB2] text-black shadow-md'
                  : 'bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                    isActive ? 'bg-black text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-950/60 border border-gray-800 p-5 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Investors</div>
              <div className="text-3xl font-black text-white">{users.length}</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <span>{users.filter((u) => (u as any).status !== 'suspended' && !u.isBanned).length} Active Accounts</span>
              </div>
            </div>

            <div className="bg-gray-950/60 border border-gray-800 p-5 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Deposited Volume</div>
              <div className="text-3xl font-black text-[#00FFB2]">
                ${Number(stats.totalDepositsVolume || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">Cleared on-chain</div>
            </div>

            <div className="bg-gray-950/60 border border-gray-800 p-5 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Active Staking Reserves</div>
              <div className="text-3xl font-black text-blue-400">
                ${Number(stats.activeStakingVolume || 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-400 mt-1">Yield vault contracts</div>
            </div>

            <div className="bg-gray-950/60 border border-gray-800 p-5 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Pending Withdrawals</div>
              <div className="text-3xl font-black text-amber-400">{stats.pendingWithdrawalsCount || 0}</div>
              <div className="text-xs text-gray-400 mt-1">
                Volume: ${Number(stats.pendingWithdrawalsVolume || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'giftcards' && (
        <div className="space-y-4 animate-fade-in">
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Gift Brand</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">PIN</th>
                  <th className="p-3.5">Image Proof</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-950/60">
                {giftCards.map((gc) => (
                  <tr key={gc.id} className="hover:bg-gray-800/40">
                    <td className="p-3.5 font-mono text-gray-400">{gc.userEmail}</td>
                    <td className="p-3.5 font-bold text-white">{gc.type}</td>
                    <td className="p-3.5 font-mono text-[#00FFB2] font-black">${Number(gc.amount || 0).toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-bold text-white bg-gray-900/80 rounded px-2 select-all">{gc.code}</td>
                    <td className="p-3.5 font-mono text-amber-400">{gc.pin || 'N/A'}</td>
                    <td className="p-3.5">
                      <GiftCardImageViewer imageUrl={gc.imageProofUrl} />
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          gc.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : gc.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {gc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {gc.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleGiftCardAction(gc.id, 'approve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Approve & Credit
                          </button>
                          <button
                            onClick={() => handleGiftCardAction(gc.id, 'reject')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono">Settled ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stepUpUser &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm administrator suspension"
              className="w-full max-w-md rounded-3xl bg-[#121622] border border-rose-500/30 p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Suspend administrator</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    This removes back-office access from{' '}
                    <span className="font-mono text-gray-200">{stepUpUser.email}</span>. Confirm it is
                    really you at the keyboard, not just a signed-in session.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStepUpBusy(true);
                  handleToggleUserStatus(stepUpUser, {
                    confirmPassword: stepUpPassword,
                    banReason: stepUpReason.trim(),
                  }).finally(() => setStepUpBusy(false));
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-gray-400 text-[11px] font-bold mb-1">
                    Your administrator password
                  </label>
                  <input
                    type="password"
                    autoFocus
                    required
                    autoComplete="current-password"
                    placeholder="Re-enter your password"
                    value={stepUpPassword}
                    onChange={(e) => setStepUpPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] font-bold mb-1">
                    Reason for the audit log
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="At least 12 characters. Recorded permanently."
                    value={stepUpReason}
                    onChange={(e) => setStepUpReason(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    {stepUpReason.trim().length < 12
                      ? `${12 - stepUpReason.trim().length} more character(s) required.`
                      : 'Ready to confirm.'}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStepUpUser(null);
                      setStepUpPassword('');
                      setStepUpReason('');
                      setErrorMessage(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={stepUpBusy || stepUpReason.trim().length < 12 || !stepUpPassword}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {stepUpBusy ? 'Verifying...' : 'Suspend Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AdminPanel;
