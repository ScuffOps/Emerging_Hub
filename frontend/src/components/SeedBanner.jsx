import React, { useState } from 'react';
import { Database, RefreshCw, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCharacter } from '../context/CharacterContext';
import AdminLoginModal from './AdminLoginModal';

/**
 * Non-blocking banner that only appears when the character profile failed to load
 * (i.e. fresh production DB with no seed). Admin can click "Seed database" to
 * bootstrap; unauthenticated users see a Sign-in prompt.
 */
const SeedBanner = () => {
  const { character, loading, error, reload } = useCharacter();
  const { isAuthed, token } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Only show the banner if we're done loading AND the character is missing/errored
  if (loading) return null;
  if (character) return null;

  const runSeed = async () => {
    if (!token) { toast.error('No auth token — sign in again'); return; }
    setSeeding(true);
    try {
      const res = await fetch('/api/_diag/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Seed failed');
      toast.success('Database seeded — reloading data…');
      await reload();
    } catch (e) {
      toast.error(`Seed failed: ${e.message}`);
    } finally { setSeeding(false); }
  };

  return (
    <>
      <div
        data-testid="seed-banner"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] max-w-[min(560px,calc(100vw-2.5rem))] px-5 py-3 rounded-full flex items-center gap-3 backdrop-blur-md bg-[#600612]/25 border border-[#600612]/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="p-1.5 rounded-full bg-[#600612]/50 border border-[#ff8095]/40 shrink-0">
          <Database className="w-3.5 h-3.5 text-[#ff8095]" />
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-[13px] font-semibold text-[#E1DBC2]">Database is empty</p>
          <p className="text-[11px] text-[#7E88B7] truncate">
            {error || 'No character profile found.'}{' '}
            {isAuthed ? 'Click Seed to bootstrap.' : 'Sign in as admin to seed.'}
          </p>
        </div>
        {isAuthed ? (
          <button
            onClick={runSeed}
            disabled={seeding}
            data-testid="seed-banner-run"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-[11px] font-bold uppercase tracking-[0.15em] shadow-[0_0_18px_rgba(6,109,247,0.4)] disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding…' : 'Seed'}
          </button>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            data-testid="seed-banner-signin"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#E1DBC2] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-white/20 shrink-0"
          >
            <LogIn className="w-3 h-3" />Sign in
          </button>
        )}
      </div>
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default SeedBanner;
