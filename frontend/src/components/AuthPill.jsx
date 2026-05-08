import React, { useState } from 'react';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import AdminLoginModal from './AdminLoginModal';

/** Small unobtrusive auth control pinned top-right of every layout page. */
const AuthPill = () => {
  const { isAuthed, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
  };

  return (
    <>
      <div className="fixed top-5 right-5 z-[60]">
        {isAuthed ? (
          <button
            onClick={handleLogout}
            data-testid="auth-pill-logout"
            title="Sign out"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] bg-[#E1B04A]/12 border border-[#E1B04A]/35 text-[#E1B04A] hover:bg-[#E1B04A]/20 hover:shadow-[0_0_14px_rgba(225,176,74,0.35)] transition-all backdrop-blur-md"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Admin</span>
            <LogOut className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            data-testid="auth-pill-login"
            title="Sign in"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] bg-white/5 border border-white/10 text-[#7E88B7] hover:text-[#B1EDE8] hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            <LogIn className="w-3 h-3" />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        )}
      </div>
      <AdminLoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default AuthPill;
