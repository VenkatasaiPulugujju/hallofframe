import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_EMAIL_DOMAIN } from '../firebase/config';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const {
    loading,
    authError,
    rejectedEmail,
    signInWithGoogle,
    clearAuthError,
  } = useAuth();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const success = await signInWithGoogle();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-3xl shadow-brutal-xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#FFD719] border-b-[3px] border-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💀</span>
            <span className="font-display font-black text-lg text-[#111111] uppercase tracking-tight">
              CAMPUS GATEWAY
            </span>
          </div>

          <button
            onClick={() => {
              clearAuthError();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#FFF9F0] border-2 border-[#111111] shadow-brutal-xs flex items-center justify-center font-black hover:bg-[#ffdad6] btn-press"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div>
            <div className="inline-block bg-[#8055F5] text-white px-3 py-1 rounded-md border-2 border-[#111111] font-display font-black text-xs uppercase tracking-wider mb-2 shadow-brutal-xs -rotate-2">
              CHINMAYA VISHWAVIDYAPEETH
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#111111]">
              YOUR CAMPUS. <br />
              <span className="bg-[#FF4388] text-white px-2 py-0.5 rounded-md inline-block rotate-1 border-2 border-[#111111] mt-1 shadow-brutal-xs">
                YOUR CHAOS.
              </span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-2 max-w-xs mx-auto">
              Sign in with your verified institutional Google account to post moments, react, and view campus archives.
            </p>
          </div>

          {/* Domain Restriction Requirement Notice */}
          <div className="p-3 bg-[#39D62D]/20 border-2 border-[#111111] rounded-xl text-left text-xs font-bold text-[#111111] shadow-brutal-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
            <div>
              <span>College Requirement: </span>
              <span className="underline font-black">@{ALLOWED_EMAIL_DOMAIN}</span> accounts only.
              Personal Gmail accounts are automatically rejected.
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 bg-[#ffdad6] border-2 border-[#111111] rounded-xl text-left text-xs font-bold text-red-950 shadow-brutal-xs space-y-1">
              <div className="flex items-center gap-2 text-red-700 font-display font-extrabold text-sm uppercase">
                <AlertCircle className="w-4 h-4" />
                <span>Authentication Denied</span>
              </div>
              <p className="leading-snug">{authError}</p>
              {rejectedEmail && (
                <p className="text-[11px] text-gray-600 font-mono pt-1">
                  Attempted Email: {rejectedEmail}
                </p>
              )}
            </div>
          )}

          {/* Real Google Sign In Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#FFF9F0] hover:bg-white border-[3px] border-[#111111] rounded-xl font-display font-black text-sm uppercase tracking-wider text-[#111111] shadow-brutal hover:shadow-brutal-lg transition-all flex items-center justify-center gap-3 btn-press"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Verifying with Google...' : 'Sign in with @cvv.ac.in Account'}</span>
            </button>
            <p className="text-[11px] text-gray-500 font-semibold">
              Authorized via Firebase Authentication (`collage-b3e32`)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
