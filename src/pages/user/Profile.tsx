import React, { useState } from 'react';
import {
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
  Mail,
  Phone,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { COUNTRIES } from '../../lib/countries';

interface ProfileProps {
  user: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  authToken,
  theme = 'dark',
  onRefreshUser,
  onLogout,
}) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [country, setCountry] = useState(user.country || '');

  // Security Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [twoFaState, setTwoFaState] = useState(user.twoFactorEnabled || false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, phone, country }),
      });
      if (res.ok) {
        setMessage('Personal profile information saved successfully.');
        onRefreshUser();
      } else {
        setErrorMessage('Failed to update profile.');
      }
    } catch (err) {
      setErrorMessage('Connection error saving profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/security', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined,
          securityPin: newPin || undefined,
          twoFactorEnabled: twoFaState,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Only claim what was actually saved - "Nothing to update" and a silent
        // no-op look identical otherwise.
        const saved: string[] = data.updated || [];
        setMessage(
          saved.length
            ? `Security settings updated: ${saved.join(', ')}.`
            : 'Security settings saved.'
        );
        setOldPassword('');
        setNewPassword('');
        setNewPin('');
        onRefreshUser();
      } else {
        // Surface the real reason rather than a blanket failure.
        setErrorMessage(data.error || 'Failed to update security credentials.');
      }
    } catch (err) {
      setErrorMessage('Connection error updating security.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="profile-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Account Master Settings</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            User Profile & Security Suite
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
            Manage your personal data, two-factor authentication, security PIN, and account credentials.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-xs transition cursor-pointer border border-rose-500/20 self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Session</span>
        </button>
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

      {/* Grid: Profile Details & Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
              <span>Personal Information</span>
            </h3>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Email Address (Immutable)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-500 dark:text-gray-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">
                Country of Residence {country ? '' : <span className="text-amber-500">(required)</span>}
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400 pointer-events-none" />
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`w-full appearance-none bg-slate-100 dark:bg-gray-950 border rounded-xl pl-9 pr-9 py-2.5 text-xs focus:outline-none focus:border-[#00FFB2] ${
                    country
                      ? 'text-slate-900 dark:text-white border-slate-200 dark:border-gray-800'
                      : 'text-slate-500 dark:text-gray-400 border-amber-500/60'
                  }`}
                >
                  <option value="">Select your country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-500 dark:text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Security & 2FA */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <form onSubmit={handleUpdateSecurity} className="space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2]" />
              <span>Security & Access Controls</span>
            </h3>

            {/* 2FA Toggle - entirely optional */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  Two-Factor Authentication
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-gray-700">
                    Optional
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-gray-400">
                  {twoFaState
                    ? 'A 6-digit OTP is required to approve withdrawals.'
                    : 'Off. Your account is protected by password and PIN only.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={twoFaState}
                  onChange={(e) => setTwoFaState(e.target.checked)}
                  aria-label="Enable two-factor authentication"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FFB2]"></div>
              </label>
            </div>

            {/* Current password: required to change any credential, so a stolen
                session token is not enough to take the account over. */}
            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Required to change your PIN or password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                Leave blank if you are only changing the 2FA toggle.
              </p>
            </div>

            {/* Update PIN */}
            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">New 4-Digit Security PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400" />
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">New Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400" />
                <input
                  type="password"
                  placeholder="Leave blank to keep existing password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-white border border-slate-200 dark:border-gray-700 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Update Security Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;
