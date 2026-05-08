import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const GoogleGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const AdminLoginModal = ({ open, onClose }) => {
  const { startGoogleLogin, passwordLogin } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  const submitPwd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordLogin(password);
      toast.success('Admin mode unlocked');
      onClose();
    } catch { toast.error('Incorrect password'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-[35px] p-8 w-full max-w-md" data-testid="admin-login-modal">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-[#E1B04A]/10 border border-[#E1B04A]/30"><Lock className="w-5 h-5 text-[#E1B04A]" /></div>
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Admin Access</h3>
        </div>
        <p className="text-sm text-[#7E88B7] mb-6">Sign in with your Google account to manage commissions, gallery, and other admin sections.</p>
        <button
          type="button"
          onClick={startGoogleLogin}
          data-testid="google-login-btn"
          className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-white text-[#171718] font-semibold text-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all"
        >
          <GoogleGlyph />Continue with Google
        </button>
        <div className="mt-5 pt-5 border-t border-white/5">
          {!showPwd ? (
            <button type="button" onClick={() => setShowPwd(true)} data-testid="show-password-fallback"
              className="w-full text-xs text-[#7E88B7] hover:text-[#B1EDE8] transition-colors">
              Use legacy admin password instead →
            </button>
          ) : (
            <form onSubmit={submitPwd} className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7E88B7]">Legacy password</p>
              <input
                autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password" data-testid="admin-password-input"
                className="w-full px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] transition-all" />
              <button type="submit" disabled={loading} data-testid="admin-login-submit"
                className="w-full py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(6,109,247,0.4)] disabled:opacity-50">
                {loading ? 'Verifying…' : 'Unlock'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
