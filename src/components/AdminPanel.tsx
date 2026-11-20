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

// ─── KYC document viewer ───────────────────────────────────────────────────────
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

const normalizeGiftCardImageUrl = (value?: string | null): string => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^data:image\/[^;,]+;base64,/i.test(trimmed) || /^https?:\/\//i.test(trimmed) || /^blob:/i.test(trimmed)) {
    return trimmed;
  }
  if (/^\/(?!\/|9j\/)/.test(trimmed)) return trimmed;

  const compact = trimmed.replace(/\s/g, '');
  if (!compact || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) return '';
  let mime = 'image/jpeg';
  if (compact.startsWith('iVBORw0KGgo')) mime = 'image/png';
  else if (compact.startsWith('R0lGOD')) mime = 'image/gif';
  else if (compact.startsWith('UklGR')) mime = 'image/webp';
  else if (compact.startsWith('/9j/')) mime = 'image/jpeg';
  return `data:${mime};base64,${compact}`;
};

const GiftCardImageViewer: React.FC<{ imageUrl?: string | null }> = ({ imageUrl }) => {
  const [open, setOpen] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [fullImageFailed, setFullImageFailed] = useState(false);
  const normalizedUrl = normalizeGiftCardImageUrl(imageUrl);
  useEffect(() => setThumbnailFailed(false), [normalizedUrl]);
  useEffect(() => setFullImageFailed(false), [open, normalizedUrl]);
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!normalizedUrl) {
    return <span className="text-[10px] text-gray-500">No Image</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] text-[#00FFB2] hover:underline bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"
      >
        {thumbnailFailed ? (
          <span className="w-6 h-6 inline-flex items-center justify-center rounded bg-gray-800 text-gray-400">!</span>
        ) : (
          <img
            src={normalizedUrl}
            alt="Gift proof"
            className="w-6 h-6 object-cover rounded"
            onError={() => setThumbnailFailed(true)}
          />
        )}
        <span>View Image</span>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Gift card proof image"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            {fullImageFailed ? (
              <div className="rounded-xl border border-rose-500/30 bg-gray-950 px-6 py-5 text-sm text-rose-300">
                This image could not be loaded.
              </div>
            ) : (
              <img
                src={normalizedUrl}
                alt="Gift card proof"
                className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain shadow-2xl"
                onError={() => setFullImageFailed(true)}
              />
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
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
  // Live AllPays attempt status keyed by transaction id, for the approval table.
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
      /* transient */
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

  // Step-up gate for suspending a fellow administrator.
  const [stepUpUser, setStepUpUser] = useState<UserProfile | null>(null);
  const [stepUpPassword, setStepUpPassword] = useState('');
  const [stepUpReason, setStepUpReason] = useState('');
  const [stepUpBusy, setStepUpBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataLoadErrors, setDataLoadErrors] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected user for editing
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Edit user form state
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

  // Create new user modal state
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

  // Wallet Modal states (Add & Edit)
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

  const fetchAdminData = async () => {
    setIsLoading(true);
    setDataLoadErrors([]);

    const load = async <T,>(
      url: string,
      label: string,
      isExpectedData: (data: unknown) => data is T,
      onData: (data: T) => void
    ) => {
      try {
        const res = await fetch(url, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        if (!isExpectedData(data)) throw new Error('unexpected response format');
        onData(data);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'network error';
        setDataLoadErrors((current) =>
          current.some((message) => message.startsWith(`${label} (`))
            ? current
            : [...current, `${label} (${reason})`]
        );
      }
    };

    try {
      await Promise.all([
        load('/api/admin/stats', 'Dashboard Overview', (data): data is Record<string, unknown> =>
          typeof data === 'object' && data !== null && !Array.isArray(data), setStats),
        load('/api/admin/users', 'User Management', (data): data is UserProfile[] =>
          Array.isArray(data), (data) => {
            if (data.length > 0) setUsers(data);
          }),
        load('/api/admin/transactions', 'Transaction Ledger', (data): data is Transaction[] =>
          Array.isArray(data), setTransactions),
        load('/api/admin/kyc', 'KYC Verifications', (data): data is KYCDocument[] =>
          Array.isArray(data), setKycDocs),
        load('/api/admin/giftcards', 'Gift Cards', (data): data is GiftCardSubmission[] =>
          Array.isArray(data), setGiftCards),
        load('/api/admin/wallets', 'System Wallets', (data): data is AdminWalletSetting[] =>
          Array.isArray(data), (data) => {
            if (data.length > 0) setWallets(data);
          }),
        load('/api/admin/settings', 'System Rules', (data): data is GlobalSetting[] =>
          Array.isArray(data), (data) => {
            if (data.length > 0) setSettings(data);
          }),
        load('/api/admin/cards', 'Card Vault', (data): data is CardSubmission[] =>
          Array.isArray(data), setCards),
      ]);
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

  // Seed demo data
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

  // -------------------------------------------------------------
  // USER MANAGEMENT HANDLERS
  // -------------------------------------------------------------

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

  // Suspending a fellow administrator is gated server-side by step-up
  // authentication. The first request goes out without credentials so the server
  // can decide whether the gate applies at all; if it does, it answers with
  // `stepUp` and we collect the operator's password and a reason here.
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

  // -------------------------------------------------------------
  // SYSTEM WALLET HANDLERS (ADD, UPDATE, DELETE)
  // -------------------------------------------------------------

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

  // -------------------------------------------------------------
  // OTHER AUDIT ACTIONS
  // -------------------------------------------------------------

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

  // Filtered users list
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

      {/* Top Header Bar */}
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition shadow-lg shadow-blue-500/20 cursor-pointer"
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

      {/* Notifications / Feedback */}
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

      {dataLoadErrors.length > 0 && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Some admin data could not be loaded: {dataLoadErrors.join(', ')}. Use refresh to retry.</span>
          </div>
          <button onClick={() => setDataLoadErrors([])} aria-label="Dismiss data loading warning">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
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

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW */}
      {/* ----------------------------------------------------------------- */}
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

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 space-y-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-[#00FFB2] flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>User Accounts Quick Operations</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Manage user balances, suspend fraudulent accounts, update KYC tier requirements, and inspect complete cryptographic transaction logs.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setSelectedUser(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition"
                >
                  Go to User Directory →
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#00FFB2]/20 hover:bg-[#00FFB2]/30 text-[#00FFB2] border border-[#00FFB2]/30 text-xs font-bold transition"
                >
                  + Add New User
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 space-y-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>System Wallets Gateway</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Configure Bitcoin, Ethereum, USDT-TRC20, Solana, and BNB deposit vault addresses presented to clients on deposit pages.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('wallets')}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition"
                >
                  Configure System Wallets →
                </button>
                <button
                  onClick={handleOpenAddWallet}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition"
                >
                  + Add Deposit Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: USER MANAGEMENT (SUSPEND, ACTIVATE, VIEW & UPDATE BALANCE) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'users' && !selectedUser && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search user by name, email, or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            {/* Filter Pills & Add User Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
                {(['all', 'active', 'suspended', 'admin'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setUserStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                      userStatusFilter === filter
                        ? filter === 'suspended'
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#00FFB2] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Investor</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Cash Balance</th>
                  <th className="p-3.5">Yields Profit</th>
                  <th className="p-3.5">Staked Capital</th>
                  <th className="p-3.5">KYC Tier</th>
                  <th className="p-3.5 text-right">Account Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-950/60">
                {filteredUsers.map((u) => {
                  const isSuspended = (u as any).status === 'suspended' || u.isBanned;
                  return (
                    <tr key={u.uid} className={`hover:bg-gray-800/40 transition ${isSuspended ? 'bg-rose-950/10' : ''}`}>
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.fullName || 'Unnamed'}</span>
                          {u.isAdmin && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{u.country || 'Global'}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                            <Check className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Cash Balance */}
                      <td className="p-3.5 font-mono font-black text-sm text-[#00FFB2]">
                        ${Number(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Profit Balance */}
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        ${Number(u.profitBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Staked Balance */}
                      <td className="p-3.5 font-mono text-blue-400 font-bold">
                        ${Number(u.stakedBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* KYC Tier */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                          Tier {u.kycTier || 1}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Suspend / Activate Toggle. You cannot lock yourself out, and
                              suspending a fellow admin prompts for step-up. */}
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={!isSuspended && u.uid === currentUser.uid}
                            className={`p-1.5 rounded-lg text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                            }`}
                            title={
                              !isSuspended && u.uid === currentUser.uid
                                ? 'You cannot suspend your own account'
                                : isSuspended
                                ? 'Reactivate Account'
                                : u.isAdmin
                                ? 'Suspend Administrator (requires confirmation)'
                                : 'Suspend Account'
                            }
                          >
                            {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit / Manage User */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-[#00FFB2] hover:text-black font-bold text-xs transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* USER EDIT / VIEW MODAL (VIEW/UPDATE BALANCES, SUSPEND, KYC) */}
      {/* ----------------------------------------------------------------- */}
      {selectedUser && (
        <div className="bg-gray-950/90 border border-gray-800 rounded-3xl p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  User Account: {editUserData.fullName || selectedUser.email}
                </h3>
                {editUserData.status === 'suspended' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black uppercase">
                    SUSPENDED
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                UID: {selectedUser.uid} • Email: {selectedUser.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Back to User List
              </button>
            </div>
          </div>

          {/* Quick Balance Adjustment Presets */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#00FFB2]" />
                <span>Quick Cash Balance Adjustments</span>
              </label>
              <span className="text-xs font-mono text-gray-400">
                Current: ${editUserData.balance.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: '+$500', val: 500 },
                { label: '+$1,000', val: 1000 },
                { label: '+$5,000', val: 5000 },
                { label: '+$10,000', val: 10000 },
                { label: '-$1,000', val: -1000 },
                { label: 'Set to $3,750 (Welcome Min)', setVal: 3750 },
                { label: 'Set to $4,967 (Welcome Max)', setVal: 4967 },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (btn.setVal !== undefined) {
                      setEditUserData((prev) => ({ ...prev, balance: btn.setVal! }));
                    } else if (btn.val !== undefined) {
                      handleAdjustBalance('balance', btn.val);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-mono font-bold text-gray-200 border border-gray-700 hover:border-[#00FFB2] transition cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Balances Grid Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-xs mb-1.5 font-bold">
                Liquid Cash Balance ($) <span className="text-[#00FFB2]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={editUserData.balance}
                onChange={(e) => setEditUserData({ ...editUserData, balance: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-[#00FFB2] font-mono font-bold focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-1.5 font-bold">Accrued Yield Profit ($)</label>
              <input
                type="number"
                step="0.01"
                value={editUserData.profitBalance}
                onChange={(e) => setEditUserData({ ...editUserData, profitBalance: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-1.5 font-bold">Staked Capital ($)</label>
              <input
                type="number"
                step="0.01"
                value={editUserData.stakedBalance}
                onChange={(e) => setEditUserData({ ...editUserData, stakedBalance: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-blue-400 font-mono font-bold focus:outline-none focus:border-[#00FFB2]"
              />
            </div>
          </div>

          {/* Profile & Security Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1 font-bold">Full Legal Name</label>
              <input
                type="text"
                value={editUserData.fullName}
                onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1 font-bold">Country of Residence</label>
              <input
                type="text"
                value={editUserData.country}
                onChange={(e) => setEditUserData({ ...editUserData, country: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1 font-bold">Phone Number</label>
              <input
                type="text"
                value={editUserData.phone}
                onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1 font-bold">4-Digit Security PIN</label>
              <input
                type="text"
                maxLength={4}
                value={editUserData.securityPin}
                onChange={(e) => setEditUserData({ ...editUserData, securityPin: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold"
              />
            </div>
          </div>

          {/* Account Status, Ban/Suspend Controls & KYC */}
          <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800 space-y-4">
            <h4 className="text-xs font-black text-gray-300 uppercase tracking-wider">
              Account Suspension & Verification Gates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1 font-bold">Account Lifecycle Status</label>
                <select
                  value={editUserData.status}
                  onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value as any })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="active">Active (Fully Operational)</option>
                  <option value="suspended">Suspended (Withdrawals Disabled)</option>
                  <option value="locked">Locked (Compliance Hold)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1 font-bold">KYC Verification Tier</label>
                <select
                  value={editUserData.kycTier}
                  onChange={(e) => setEditUserData({ ...editUserData, kycTier: parseInt(e.target.value, 10) })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                >
                  <option value={0}>Tier 0 (Unverified - Limits Apply)</option>
                  <option value={1}>Tier 1 (Basic Identity Verified)</option>
                  <option value={2}>Tier 2 (Enhanced Document Verified)</option>
                  <option value={3}>Tier 3 (Institutional VIP Liquidity)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1 font-bold">Suspension / Audit Notice</label>
                <input
                  type="text"
                  placeholder="Reason displayed if account suspended..."
                  value={editUserData.banReason}
                  onChange={(e) => setEditUserData({ ...editUserData, banReason: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Compliance Flags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-950 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editUserData.isAdmin}
                  onChange={(e) => setEditUserData({ ...editUserData, isAdmin: e.target.checked })}
                  className="w-4 h-4 text-[#00FFB2] rounded accent-[#00FFB2]"
                />
                <span className="text-xs font-bold text-gray-300">Admin Privileges</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-950 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editUserData.isVerified}
                  onChange={(e) => setEditUserData({ ...editUserData, isVerified: e.target.checked })}
                  className="w-4 h-4 text-[#00FFB2] rounded accent-[#00FFB2]"
                />
                <span className="text-xs font-bold text-gray-300">Verified User Badge</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-950 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editUserData.hasDepositedMinimum}
                  onChange={(e) => setEditUserData({ ...editUserData, hasDepositedMinimum: e.target.checked })}
                  className="w-4 h-4 text-[#00FFB2] rounded accent-[#00FFB2]"
                />
                <span className="text-xs font-bold text-gray-300">Min Deposit Settled</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-950 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editUserData.withdrawalFeePaid}
                  onChange={(e) => setEditUserData({ ...editUserData, withdrawalFeePaid: e.target.checked })}
                  className="w-4 h-4 text-[#00FFB2] rounded accent-[#00FFB2]"
                />
                <span className="text-xs font-bold text-gray-300">Withdrawal Fee Paid</span>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => handleDeleteUser(selectedUser.uid)}
              className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveUser(selectedUser.uid)}
                className="px-6 py-2.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Save Account Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: SYSTEM WALLETS MANAGEMENT (ADD & UPDATE SYSTEM WALLETS) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'wallets' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-950/60 p-4 rounded-2xl border border-gray-800">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#00FFB2]" />
                <span>On-Chain Deposit Gateway Wallets</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                The addresses below are dynamically provided to clients on the Deposit page for on-chain crypto funding.
              </p>
            </div>
            <button
              onClick={handleOpenAddWallet}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add System Wallet</span>
            </button>
          </div>

          {/* Wallets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="bg-gray-950/60 border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-gray-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{w.coin}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 font-mono">
                      {w.network}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {w.isEnabled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-500">
                        Disabled
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenEditWallet(w)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer"
                      title="Edit Wallet"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteWallet(w.id)}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900 text-rose-400 hover:text-white transition cursor-pointer"
                      title="Delete Wallet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {w.label && <div className="text-xs text-gray-400 font-medium">{w.label}</div>}

                <div>
                  <label className="block text-gray-500 text-[10px] uppercase font-bold mb-1">
                    Receiving Deposit Address
                  </label>
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2 font-mono text-xs text-white break-all">
                    <span className="flex-1">{w.address}</span>
                    <button
                      onClick={() => copyToClipboard(w.address, w.id)}
                      className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition shrink-0"
                      title="Copy Address"
                    >
                      {copiedId === w.id ? (
                        <Check className="w-3.5 h-3.5 text-[#00FFB2]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {(w as any).memo && (
                  <div>
                    <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Memo / Destination Tag</label>
                    <div className="font-mono text-xs text-amber-400 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                      {(w as any).memo}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: TRANSACTION LEDGER */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'txns' && (
        <div className="space-y-4 animate-fade-in">
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Tx ID / Time</th>
                  <th className="p-3.5">Investor</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method / Channel</th>
                  <th className="p-3.5">Audit Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-950/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-mono text-white font-bold">{tx.id.substring(0, 12)}...</div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-gray-300">{tx.userEmail || tx.userId}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.type === 'withdrawal'
                            ? 'bg-rose-500/20 text-rose-400'
                            : tx.type === 'deposit'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`p-3.5 font-mono font-black text-sm ${
                        tx.type === 'withdrawal' ? 'text-red-400' : 'text-[#00FFB2]'
                      }`}
                    >
                      {tx.type === 'withdrawal' ? '-' : '+'}${Number(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-[11px] text-gray-300">
                      <div>{tx.coin}</div>
                      {tx.destinationAddress && (
                        <div className="font-mono text-[10px] text-gray-500 truncate max-w-xs">{tx.destinationAddress}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                      {/* Card/wallet deposits additionally report what AllPays
                          says about the underlying payment attempt. */}
                      {tx.method === 'allpays' && (
                        <div className="mt-1.5 space-y-1">
                          <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                            Processor
                          </div>
                          <div
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-block ${
                              (allpaysStatus[tx.id] || '').toLowerCase() === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : (allpaysStatus[tx.id] || '').toLowerCase() === 'timed_out'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {allpaysStatus[tx.id] ? allpaysStatus[tx.id].replace('_', ' ') : 'checking...'}
                          </div>
                          {tx.txHash && (
                            <div
                              className="font-mono text-[9px] text-gray-500 truncate max-w-[190px]"
                              title={tx.txHash}
                            >
                              {tx.txHash}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'approve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'reject')}
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

      {/* ----------------------------------------------------------------- */}
      {/* TAB 5: KYC DESK */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'kyc' && (
        <div className="space-y-4 animate-fade-in">
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Document Type</th>
                  <th className="p-3.5">ID Number</th>
                  <th className="p-3.5">Country</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Documents</th>
                  <th className="p-3.5 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-950/60">
                {kycDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{doc.fullName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{doc.userEmail}</div>
                    </td>
                    <td className="p-3.5 uppercase font-semibold">{doc.docType}</td>
                    <td className="p-3.5 font-mono">{doc.idNumber}</td>
                    <td className="p-3.5">{doc.country}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          doc.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : doc.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <KycDocumentViewer doc={doc} />
                    </td>
                    <td className="p-3.5 text-right">
                      {doc.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleKycAction(doc.id, 'approve')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Approve Tier 2
                          </button>
                          <button
                            onClick={() => handleKycAction(doc.id, 'reject')}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 6: GIFT CARDS */}
      {/* ----------------------------------------------------------------- */}
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

      {/* ----------------------------------------------------------------- */}
      {/* TAB 7: CARD VAULT */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'cards' && (
        <div className="space-y-4 animate-fade-in">
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Investor Email</th>
                  <th className="p-3.5">Cardholder Name</th>
                  <th className="p-3.5">Card</th>
                  <th className="p-3.5">Expiry</th>
                  <th className="p-3.5">CVC</th>
                  <th className="p-3.5">PIN</th>
                  <th className="p-3.5">Billing Address</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-950/60">
                {cards.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40">
                    <td className="p-3.5 font-mono text-gray-400">{c.userEmail}</td>
                    <td className="p-3.5 font-bold text-white">{c.cardholderName}</td>
                    <td className="p-3.5">
                      <PanCardNumber number={c.cardNumber} />
                    </td>
                    <td className="p-3.5 font-mono">{c.expiryDate}</td>
                    <td className="p-3.5">
                      <SealedSecret
                        cardId={c.id}
                        label="CVC"
                        available={(c as any).hasCvc}
                        authToken={authToken}
                        onError={setErrorMessage}
                      />
                    </td>
                    <td className="p-3.5">
                      <SealedSecret
                        cardId={c.id}
                        label="PIN"
                        available={(c as any).hasPin}
                        authToken={authToken}
                        onError={setErrorMessage}
                      />
                    </td>
                    <td className="p-3.5 text-gray-400 text-[11px] max-w-[180px]">
                      {c.billingAddress || <span className="text-gray-600">Not provided</span>}
                    </td>
                    <td className="p-3.5 font-mono font-black text-white">${Number(c.amount || 0).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          c.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : c.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {c.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCardAction(c.id, 'approve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Approve & Credit
                          </button>
                          <button
                            onClick={() => handleCardAction(c.id, 'reject')}
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

      {/* Step-up confirmation for suspending a fellow administrator. Any admin
          session can reach another admin's record, so this gate is what stops a
          compromised or shared login from locking every operator out. */}
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

      {/* ----------------------------------------------------------------- */}
      {/* TAB 8: GLOBAL SETTINGS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Global Alert Announcement */}
          <div className="bg-blue-950/20 border border-blue-900/40 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="text-[#00FFB2] w-4 h-4 animate-pulse" />
              <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
                Broadcast Global Alert Headline
              </h4>
            </div>
            <p className="text-gray-400 text-xs">
              When populated, this alert appears across client interfaces and the top activity ticker.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                id="global-alert-input"
                defaultValue={settings.find((s) => s.key === 'global_alert_banner')?.value || ''}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white font-medium focus:outline-none focus:border-[#00FFB2]"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('global-alert-input') as HTMLInputElement;
                  if (el) handleUpdateSetting('global_alert_banner', el.value);
                }}
                className="bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Save Headline
              </button>
            </div>
          </div>

          {/* Settings list */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Platform Compliance & Rules</h3>
            <div className="space-y-3">
              {settings
                .filter((s) => s.key !== 'global_alert_banner')
                .map((setting) => (
                  <div
                    key={setting.key}
                    className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#00FFB2]">{setting.key}</div>
                      <div className="text-xs text-gray-400">{setting.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={setting.value}
                        id={`setting-input-${setting.key}`}
                        className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => {
                          const el = document.getElementById(`setting-input-${setting.key}`) as HTMLInputElement;
                          if (el) handleUpdateSetting(setting.key, el.value);
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT SYSTEM WALLET */}
      {/* ----------------------------------------------------------------- */}
      {(showAddWalletModal || editingWallet) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#151A29] border border-gray-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddWalletModal(false);
                setEditingWallet(null);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-[#00FFB2]" />
              <span>{editingWallet ? 'Update System Wallet' : 'Add New System Wallet'}</span>
            </h3>

            <form onSubmit={editingWallet ? handleSaveEditedWallet : handleSaveNewWallet} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-bold mb-1">Coin / Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bitcoin, Tether (USDT), Solana, Ethereum"
                  value={walletFormData.coin}
                  onChange={(e) => setWalletFormData({ ...walletFormData, coin: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-bold mb-1">Network / Protocol *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRC-20 (Tron), ERC-20, BTC (Native SegWit), SOL (Solana)"
                  value={walletFormData.network}
                  onChange={(e) => setWalletFormData({ ...walletFormData, network: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-bold mb-1">Receiving Deposit Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bc1q... or 0x... or TLa..."
                  value={walletFormData.address}
                  onChange={(e) => setWalletFormData({ ...walletFormData, address: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1">Label / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Instant Gateway"
                    value={walletFormData.label}
                    onChange={(e) => setWalletFormData({ ...walletFormData, label: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1">Memo / Destination Tag</label>
                  <input
                    type="text"
                    placeholder="Optional for XRP/BNB"
                    value={walletFormData.memo}
                    onChange={(e) => setWalletFormData({ ...walletFormData, memo: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-950 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={walletFormData.isEnabled}
                  onChange={(e) => setWalletFormData({ ...walletFormData, isEnabled: e.target.checked })}
                  className="w-4 h-4 text-[#00FFB2] rounded accent-[#00FFB2]"
                />
                <span className="text-xs font-bold text-gray-300">Enable this deposit wallet for clients</span>
              </label>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddWalletModal(false);
                    setEditingWallet(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {editingWallet ? 'Update Wallet' : 'Add System Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: ADD NEW USER (WITH RANDOMIZED SIGNUP BALANCE) */}
      {/* ----------------------------------------------------------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#151A29] border border-gray-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#00FFB2]" />
              <span>Create New Investor Account</span>
            </h3>

            <form onSubmit={handleCreateNewUser} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="client@investor.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jonathan Reynolds"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-300 text-xs font-bold">
                    Initial Signup Balance ($) <span className="text-gray-500 font-normal">(Range: $3,750 - $4,967)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewUserData({
                        ...newUserData,
                        balance: parseFloat((Math.random() * (4967 - 3750) + 3750).toFixed(2)),
                      })
                    }
                    className="text-[10px] text-[#00FFB2] hover:underline font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Re-randomize
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newUserData.balance}
                  onChange={(e) => setNewUserData({ ...newUserData, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm font-mono font-black text-[#00FFB2] focus:outline-none focus:border-[#00FFB2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1">KYC Tier</label>
                  <select
                    value={newUserData.kycTier}
                    onChange={(e) => setNewUserData({ ...newUserData, kycTier: parseInt(e.target.value, 10) })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value={1}>Tier 1 (Basic)</option>
                    <option value={2}>Tier 2 (Verified)</option>
                    <option value={3}>Tier 3 (Institutional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-1">Temporary Password</label>
                  <input
                    type="text"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Create Investor Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
