import React from 'react';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Renders children only when an admin is signed in. Otherwise shows a friendly
 *  "admin only" gate with a Sign-in button that kicks off Google OAuth. */
const RequireAuth = ({ children, label = 'this page' }) => {
  const { isAuthed, startGoogleLogin } = useAuth();
  if (isAuthed) return children;
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8" data-testid="auth-gate">
      <div className="glass-card rounded-[28px] p-10 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-[#E1B04A]/15 border border-[#E1B04A]/40 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-[#E1B04A]" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#E1B04A] mb-2">Private</p>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
          Admin only
        </h2>
        <p className="text-sm text-[#7E88B7] mb-6">
          {label} is for the keeper of the Aether. Sign in to continue.
        </p>
        <button
          onClick={startGoogleLogin}
          data-testid="auth-gate-signin"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_22px_rgba(6,109,247,0.35)] hover:shadow-[0_0_30px_rgba(6,109,247,0.55)] transition-all"
        >
          <LogIn className="w-4 h-4" />Continue with Google
        </button>
      </div>
    </div>
  );
};

export default RequireAuth;
