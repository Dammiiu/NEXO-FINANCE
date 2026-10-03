import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Real Google OAuth Client ID — replace with env variable in production
// ─────────────────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID =
  '823286338359-bnbpgsdppkjr1as8a043qpc3j1k766hl.apps.googleusercontent.com';

// Extend the window type to include google's GIS library
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason?: () => string;
            getSkippedReason?: () => string;
          }) => void) => void;
          renderButton: (element: HTMLElement, options: {
            type?: string;
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
            logo_alignment?: string;
            width?: number;
          }) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface AuthPortalProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onAuthSuccess: (user: UserProfile, token: string) => void;
}

// Decode a JWT payload (Google credential is a JWT)
function parseJwt(token: string): Record<string, string> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  theme,
  onToggleTheme,
  onAuthSuccess,
}) => {
  const isDark = theme === 'dark';
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoadingType, setAuthLoadingType] = useState<'email' | 'google' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const gsiReadyRef = useRef(false);

  // ─── Register the Google credential callback and render the real button ──────
  useEffect(() => {
    const initGSI = () => {
      if (!window.google || gsiReadyRef.current) return;
      gsiReadyRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: googleBtnRef.current.offsetWidth || 400,
        });
      }
    };

    // If the script is already loaded, init immediately
    if (window.google) {
      initGSI();
    } else {
      // Otherwise wait for it
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGSI();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDark]);

  // ─── Re-render button when theme changes so it picks up the new theme ────────
  useEffect(() => {
    gsiReadyRef.current = false;
  }, [isDark]);

  // ─── Called by Google with a signed JWT credential ───────────────────────────
  const handleGoogleCredential = async (response: { credential: string }) => {
    setErrorMessage(null);
    setAuthLoadingType('google');

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      setErrorMessage('Google sign-in failed. Could not retrieve account details.');
      setAuthLoadingType(null);
      return;
    }

    const googleEmail = payload.email;
    const googleName = payload.name || payload.email.split('@')[0];
    const googlePicture = payload.picture || '';

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail,
          fullName: googleName,
          picture: googlePicture,
          sub: payload.sub,
          country: 'United States',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user && data.token) {
          onAuthSuccess(data.user, data.token);
          return;
        }
      }

      // Never invent a session. A fabricated token does not exist server-side,
      // so the next authenticated call answers 401 and the session guard signs
      // the user straight back out - and it rendered a balance the server never
      // issued. Report the actual failure instead.
      let message = 'We could not complete your sign-in right now. Please try again.';
      if (res.status === 403) {
        const err = await res.json().catch(() => null);
        message = (err && err.error) || 'Sign-in was refused. Please contact support.';
      } else if (res.status === 400) {
        const err = await res.json().catch(() => null);
        message = (err && err.error) || 'Google did not return an email address.';
      }
      setErrorMessage(message);
    } catch {
      // The network call itself failed. Do not fabricate a session - a made-up
      // token cannot authenticate and would bounce the user straight back out.
      setErrorMessage(
        'We could not reach the server. Check your connection and try again.'
      );
    } finally {
      setAuthLoadingType(null);
    }
  };

  // ─── Email / Password form submission ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAuthLoadingType('email');

    const userEmail = email.trim();
    const userName = fullName.trim() || userEmail.split('@')[0];

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        authMode === 'login'
          ? { email: userEmail, password }
          : { email: userEmail, password, fullName: userName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.user && data.token) {
        onAuthSuccess(data.user, data.token);
        return;
      }

      // Show the server error message if login/register failed
      setErrorMessage(data.error || (authMode === 'login' ? 'Invalid email or password.' : 'Registration failed. Please try again.'));
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setAuthLoadingType(null);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#0B0E17] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00FFB2] via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-[#00FFB2]/20">
            <div className="w-full h-full bg-[#0B0E17] rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00FFB2]" />
            </div>
          </div>
          <div>
            <span className="font-black text-lg tracking-tight flex items-center gap-1">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>NEXO</span>
              <span className="text-[#00FFB2]">FINANCE</span>
            </span>
            <span className="text-[9px] text-slate-500 dark:text-gray-400 tracking-wider block font-mono">
              INSTITUTIONAL LIQUIDITY PROTOCOL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>0xGuard Ledger Online</span>
          </div>

          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-[#121622] border-gray-800 text-gray-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-xs'
            }`}
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-xl transition-all ${
              isDark ? 'bg-[#121622]/90 border-gray-800' : 'bg-white/95 border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00FFB2]/10 border border-[#00FFB2]/30 flex items-center justify-center mx-auto text-[#00FFB2] mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Sign in or Register to continue
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Access your private cryptographic portfolio & trading terminal
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div
              className={`grid grid-cols-2 p-1 rounded-2xl border mb-6 ${
                isDark ? 'bg-[#0B0E17] border-gray-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {(['login', 'register'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setAuthMode(mode); setErrorMessage(null); }}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    authMode === mode
                      ? 'bg-[#00FFB2] text-black shadow-md'
                      : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Error Box */}
            {errorMessage && (
              <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ── Real Google Sign-In Button (rendered by GSI SDK) ──────────── */}
            <div className="w-full flex justify-center mb-4">
              {authLoadingType === 'google' ? (
                <div className={`w-full py-3 rounded-full border flex items-center justify-center gap-2 text-xs font-bold ${
                  isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-slate-300 text-slate-600'
                }`}>
                  <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Signing in with Google...</span>
                </div>
              ) : (
                <div ref={googleBtnRef} className="w-full" style={{ colorScheme: 'normal' }} />
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 tracking-wider">
                or with credentials
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Legal Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none transition border ${
                        isDark
                          ? 'bg-[#0B0E17] border-gray-800 text-white focus:border-[#00FFB2]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none transition border ${
                      isDark
                        ? 'bg-[#0B0E17] border-gray-800 text-white focus:border-[#00FFB2]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">
                    Password
                  </label>
                  {authMode === 'login' && (
                    <span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">
                      Encrypted SSL
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 rounded-2xl text-xs font-medium focus:outline-none transition border ${
                      isDark
                        ? 'bg-[#0B0E17] border-gray-800 text-white focus:border-[#00FFB2]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoadingType !== null}
                className="w-full py-3.5 rounded-2xl bg-[#00FFB2] hover:bg-[#00E59E] active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#00FFB2]/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
              >
                {authLoadingType === 'email' ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In to Account' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Footer Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span>0xGuard Multi-Sig</span>
            </span>
            <span>•</span>
            <span>Proof of Reserves: \$184.2M</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 text-center text-xs transition-colors duration-200 ${
          isDark ? 'border-gray-900 text-gray-500' : 'border-slate-200 text-slate-400'
        }`}
      >
        <span>© {new Date().getFullYear()} Nexo Finance Protocol. Regulated Institutional Custody.</span>
      </footer>
    </div>
  );
};
