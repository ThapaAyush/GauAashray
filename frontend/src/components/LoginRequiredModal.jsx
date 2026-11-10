import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, UserPlus, X, ShieldAlert } from 'lucide-react';

export default function LoginRequiredModal({ isOpen, onClose, intendedPath = '/home' }) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoLogin = () => {
    onClose();
    navigate('/login', {
      state: {
        from: { pathname: intendedPath },
        message: 'Please log in first to continue with GauAashray services.'
      }
    });
  };

  const handleGoSignup = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <div
      id="login-required-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-t-2 sm:border-2 border-[#EADBCE] text-center transform transition-all duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        {/* Mobile Swipe/Pull Indicator Bar */}
        <div className="w-12 h-1.5 rounded-full bg-stone-300 mx-auto mb-4 sm:hidden" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition active:scale-95 cursor-pointer touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FAF6ED] border-2 border-[#D6A23A]/50 flex items-center justify-center text-[#80501D] mb-4 shadow-inner">
          <Lock className="w-8 h-8 text-[#80501D]" />
        </div>

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-[#80501D] mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-[#D6A23A]" />
          <span>Authentication Required</span>
        </div>

        {/* Headline */}
        <h3 className="text-2xl font-black text-[#593713] tracking-tight">
          Log In First
        </h3>

        {/* Subtext */}
        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
          You must be signed in or registered to use GauAashray services, dispatch emergency cattle rescues, request doctor visits, or surrender cows.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={handleGoLogin}
            className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-[#80501D] hover:bg-[#593713] active:scale-[0.98] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <span>Log In to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleGoSignup}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#FAF6ED] hover:bg-[#F3ECE0] active:scale-[0.98] text-[#80501D] border border-[#D6A23A]/60 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <UserPlus className="w-4 h-4 text-[#D6A23A]" />
            <span>New user? Register / Sign Up</span>
          </button>
        </div>

        {/* Dismiss Option */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 font-medium transition cursor-pointer touch-manipulation"
          >
            Cancel &bull; Continue browsing public info
          </button>
        </div>
      </div>
    </div>
  );
}

