import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  User,
  CreditCard,
  Building,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, KYCDocument } from '../../types';

interface KYCProps {
  user: UserProfile;
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
}

export const KYC: React.FC<KYCProps> = ({
  user,
  authToken,
  theme = 'dark',
  onRefreshUser,
}) => {
  const [docType, setDocType] = useState('passport');
  const [fullName, setFullName] = useState(user.fullName || '');
  const [idNumber, setIdNumber] = useState('');
  const [country, setCountry] = useState(user.country || 'United States');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const [existingDocs, setExistingDocs] = useState<KYCDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchKycHistory = async () => {
    try {
      const res = await fetch('/api/kyc/my-documents', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExistingDocs(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKycHistory();
  }, [authToken]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'front' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'front') setFrontImage(reader.result as string);
        else setSelfieImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!idNumber) {
      setErrorMessage('Please provide your identity document serial number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docType,
          fullName,
          idNumber,
          country,
          frontImageUrl: frontImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          selfieUrl: selfieImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Identity documents submitted to compliance auditor! Review typically takes 15–60 minutes.');
        setIdNumber('');
        setFrontImage(null);
        setSelfieImage(null);
        onRefreshUser();
        fetchKycHistory();
      } else {
        setErrorMessage(data.error || 'Failed to submit KYC verification.');
      }
    } catch (err) {
      setErrorMessage('Connection failure submitting KYC verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="kyc-vault-container">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/20 mb-2">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Anti-Money Laundering & Identity Clearance</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Institutional KYC & Identity Vault
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
          Verify your account to unlock unrestricted daily withdrawal limits and access VIP staking yield tiers.
        </p>
      </div>

      {/* KYC Tier Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div
          className={`p-5 rounded-3xl border ${
            user.kycTier >= 1
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : theme === 'dark'
              ? 'bg-[#121622] border-gray-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Tier 1: Basic Identity
            </span>
            {user.kycTier >= 1 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400">
                LOCKED
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">$10,000 / day</div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Full legal name, email verification, standard trading desk.</p>
        </div>

        {/* Tier 2 */}
        <div
          className={`p-5 rounded-3xl border ${
            user.kycTier >= 2
              ? 'border-emerald-600 dark:border-[#00FFB2] bg-emerald-500/5 dark:bg-[#00FFB2]/5 shadow-lg dark:shadow-xl dark:shadow-[#00FFB2]/10'
              : theme === 'dark'
              ? 'bg-[#121622] border-gray-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Tier 2: Government ID & Selfie
            </span>
            {user.kycTier >= 2 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-[#00FFB2]">
                ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-400">
                IN REVIEW
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-[#00FFB2] font-mono">$100,000 / day</div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Passport / Driver's License upload, rapid biometric facial check.</p>
        </div>

        {/* Tier 3 */}
        <div
          className={`p-5 rounded-3xl border ${
            user.kycTier >= 3
              ? 'border-purple-500/40 bg-purple-500/5'
              : theme === 'dark'
              ? 'bg-[#121622] border-gray-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Tier 3: VIP Institutional
            </span>
            {user.kycTier >= 3 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400">
                ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-gray-500/20 text-slate-600 dark:text-gray-400">
                ENTERPRISE
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">Unlimited</div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Proof of residence, bank statement audit, OTC desk access.</p>
        </div>
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

      {/* Submission Form & Audit Guidelines */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border grid grid-cols-1 lg:grid-cols-2 gap-8 ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <form onSubmit={handleSubmitKYC} className="space-y-4 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Submit Document for Tier 2 Clearance</h3>

          <div>
            <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
            >
              <option value="passport">International Passport</option>
              <option value="national_id">National Identity Card</option>
              <option value="drivers_license">Driver's License</option>
              <option value="residence_permit">Permanent Residence Card</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Full Legal Name (as shown on ID)</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Document ID Number</label>
              <input
                type="text"
                required
                placeholder="e.g. A92817291"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">Issuing Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
              />
            </div>
          </div>

          {/* Photo Upload Targets */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="block text-slate-500 dark:text-gray-400 font-semibold text-[11px]">Front ID Image</label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-emerald-600 dark:hover:border-[#00FFB2] transition">
                <UploadCloud className="w-6 h-6 text-slate-400 dark:text-gray-500 mb-1" />
                <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">{frontImage ? 'Uploaded ✓' : 'Select File'}</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'front')} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 dark:text-gray-400 font-semibold text-[11px]">Selfie with ID</label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-emerald-600 dark:hover:border-[#00FFB2] transition">
                <User className="w-6 h-6 text-slate-400 dark:text-gray-500 mb-1" />
                <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">{selfieImage ? 'Uploaded ✓' : 'Select File'}</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'selfie')} className="hidden" />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#00FFB2] hover:bg-[#00E59E] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 cursor-pointer"
          >
            {isSubmitting ? 'Uploading to Vault...' : 'Submit Identity For Clearance'}
          </button>
        </form>

        {/* Verification Requirements & History */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Verification Compliance Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2] shrink-0 mt-0.5" />
                <span>Ensure all 4 corners of the identity card are visible and not cropped.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2] shrink-0 mt-0.5" />
                <span>Documents must be valid with at least 3 months remaining before expiration.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FFB2] shrink-0 mt-0.5" />
                <span>Photos are encrypted with AES-256 and stored on isolated compliance vaults.</span>
              </li>
            </ul>
          </div>

          {/* Submission history */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">Document History</h4>
            {existingDocs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-gray-500">No prior KYC applications submitted.</p>
            ) : (
              <div className="space-y-2">
                {existingDocs.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">{d.docType}</span>
                      <span className="text-slate-500 dark:text-gray-400 font-mono block text-[11px]">ID: {d.idNumber}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : d.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default KYC;
