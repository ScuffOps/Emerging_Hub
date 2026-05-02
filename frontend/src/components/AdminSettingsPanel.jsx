import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useCharacter } from '../context/CharacterContext';
import { updateSiteSettings, updateDesignCanvas } from '../api';
import ImagePicker from './ImagePicker';

/**
 * Floating gear button + slide-out admin settings panel.
 * Admin-only — gracefully renders nothing for unauthenticated users.
 *
 * Surfaces:
 *  - Sidebar character image (overrides character.fullBody if set; falls back otherwise)
 *  - Background image (overrides default Discord_BG)
 *  - Quick "sync sidebar with Design canvas" toggle that updates both at once
 */
const AdminSettingsPanel = () => {
  const { isAuthed, token } = useAuth();
  const { settings, reload } = useSiteSettings();
  const { character, setCharacter } = useCharacter();
  const [open, setOpen] = useState(false);
  const [bgUrl, setBgUrl] = useState('');
  const [sidebarUrl, setSidebarUrl] = useState('');
  const [syncWithCanvas, setSyncWithCanvas] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync local form state when panel opens or settings change
  useEffect(() => {
    if (open) {
      setBgUrl(settings.background_url || '');
      setSidebarUrl(settings.sidebar_character_url || '');
      setSyncWithCanvas(false);
    }
  }, [open, settings]);

  if (!isAuthed) return null;

  const save = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(token, {
        background_url: bgUrl,
        sidebar_character_url: sidebarUrl,
      });
      // If the admin wants this also applied to the Design canvas + character.fullBody
      if (syncWithCanvas && sidebarUrl) {
        await updateDesignCanvas(token, sidebarUrl);
        setCharacter((c) => c ? { ...c, fullBody: sidebarUrl } : c);
      }
      await reload();
      toast.success('Site settings saved');
      setOpen(false);
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const resetField = (which) => {
    if (which === 'bg') setBgUrl('');
    if (which === 'sidebar') setSidebarUrl('');
  };

  return (
    <>
      {/* Gear button — sits beside the AuthPill */}
      <button
        onClick={() => setOpen(true)}
        data-testid="admin-settings-open"
        title="Site settings"
        className="fixed top-5 right-[7.5rem] z-[60] p-2 rounded-full bg-white/5 border border-white/10 text-[#7E88B7] hover:text-[#B1EDE8] hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
      >
        <SettingsIcon className="w-3.5 h-3.5" />
      </button>

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[min(420px,100vw)] z-[95] transition-transform duration-500 ease-out ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
        data-testid="admin-settings-panel"
      >
        <div className="h-full flex flex-col glass-card border-l border-white/10 rounded-none shadow-[0_0_60px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-[#E1B04A]/10 border border-[#E1B04A]/30">
                <SettingsIcon className="w-4 h-4 text-[#E1B04A]" />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                  Site Settings
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7E88B7]">Admin only · sitewide visuals</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} data-testid="admin-settings-close"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-7">
            <Section
              title="Sidebar character"
              description={`Image rendered on the right side of every page${!sidebarUrl && character?.fullBody ? ' · currently using Design canvas image' : ''}.`}
              onReset={sidebarUrl ? () => resetField('sidebar') : null}
            >
              <ImagePicker label="" value={sidebarUrl} onChange={setSidebarUrl} aspect="3/4" testPrefix="set-sidebar" />
              <label className="flex items-center gap-2 mt-2 text-[11px] text-[#B1EDE8] cursor-pointer">
                <input type="checkbox" checked={syncWithCanvas} onChange={(e) => setSyncWithCanvas(e.target.checked)} data-testid="set-sidebar-sync"
                  className="accent-[#066DF7]" />
                Also use this on the Design canvas
              </label>
            </Section>

            <Section
              title="Background image"
              description="Replaces the dark clock-face artwork behind every page."
              onReset={bgUrl ? () => resetField('bg') : null}
            >
              <ImagePicker label="" value={bgUrl} onChange={setBgUrl} aspect="auto" testPrefix="set-bg" />
            </Section>
          </div>

          <div className="border-t border-white/5 px-6 py-4 flex items-center justify-end gap-2">
            <button onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
            <button onClick={save} disabled={saving} data-testid="set-save-btn"
              className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm transition-opacity" />
      )}
    </>
  );
};

const Section = ({ title, description, onReset, children }) => (
  <section>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{title}</h4>
      {onReset && (
        <button onClick={onReset} title="Clear override"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] hover:text-[#ff8095] transition-colors">
          <RotateCcw className="w-2.5 h-2.5" />Reset
        </button>
      )}
    </div>
    <p className="text-[11px] text-[#7E88B7] mb-3 leading-relaxed">{description}</p>
    {children}
  </section>
);

export default AdminSettingsPanel;
