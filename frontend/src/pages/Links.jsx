import React, { useEffect, useState, useCallback } from 'react';
import { Link as LinkIcon, Plus, X, ExternalLink, Edit, Trash2, EyeOff, GripVertical, Globe, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink, reorderSocialLinks } from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

// Curated platform presets (icon = lucide name or special; color = brand color)
const PRESETS = [
  { id: 'twitch',    label: 'Twitch',    color: '#9146FF', host: 'twitch.tv' },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', host: 'youtube.com' },
  { id: 'twitter',   label: 'X / Twitter', color: '#FFFFFF', host: 'x.com' },
  { id: 'discord',   label: 'Discord',   color: '#5865F2', host: 'discord.gg' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', host: 'instagram.com' },
  { id: 'tiktok',    label: 'TikTok',    color: '#69C9D0', host: 'tiktok.com' },
  { id: 'bluesky',   label: 'Bluesky',   color: '#0085FF', host: 'bsky.app' },
  { id: 'kofi',      label: 'Ko-fi',     color: '#FF5E5B', host: 'ko-fi.com' },
  { id: 'patreon',   label: 'Patreon',   color: '#FF424D', host: 'patreon.com' },
  { id: 'throne',    label: 'Throne',    color: '#FFC700', host: 'throne.com' },
  { id: 'fourthwall',label: 'Merch',     color: '#E1B04A', host: 'fourthwall.com' },
  { id: 'website',   label: 'Website',   color: '#B1EDE8', host: '' },
];

const presetById = (id) => PRESETS.find((p) => p.id === id);
const presetForUrl = (url) => {
  try {
    const u = new URL(url);
    return PRESETS.find((p) => p.host && u.hostname.includes(p.host));
  } catch { return null; }
};

const Links = () => {
  const { token, isAuthed } = useAuth();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchSocialLinks(token);
      setItems(d.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onDragStart = (id) => () => setDragId(id);
  const onDragOver = (id) => (e) => { if (dragId && dragId !== id) e.preventDefault(); };
  const onDrop = (id) => async (e) => {
    e.preventDefault();
    if (!dragId || dragId === id) { setDragId(null); return; }
    const ids = items.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(id);
    if (from < 0 || to < 0) { setDragId(null); return; }
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    const reordered = ids.map((i) => items.find((x) => x.id === i)).filter(Boolean);
    setItems(reordered);
    setDragId(null);
    try { await reorderSocialLinks(token, ids); toast.success('Order saved'); }
    catch { toast.error('Reorder failed'); load(); }
  };

  return (
    <div className="p-8 lg:p-12 pb-32">
      <div className="mb-10">
        <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Links
        </h1>
        <p className="text-xl text-[#B1EDE8] tracking-wide">Find me everywhere on the web</p>
      </div>

      {isAuthed && (
        <div className="mb-6 flex items-center justify-between max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#7E88B7]">{items.length} link{items.length === 1 ? '' : 's'} · drag rows to reorder</span>
          <button onClick={() => setEditing('new')} data-testid="link-add-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)]">
            <Plus className="w-4 h-4" />Add link
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-3" data-testid="links-list">
        {loading ? (
          <div className="text-center text-[#7E88B7] py-12">Loading…</div>
        ) : items.length === 0 ? (
          <div className="glass-card rounded-[28px] p-10 text-center" data-testid="links-empty">
            <Inbox className="w-8 h-8 text-[#7E88B7] mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>No links yet</h3>
            <p className="text-sm text-[#7E88B7]">{isAuthed ? 'Click "Add link" to add your first one.' : 'Check back soon!'}</p>
          </div>
        ) : (
          items.map((it) => {
            const preset = presetById(it.platform) || presetForUrl(it.url);
            const accent = it.color || preset?.color || '#066DF7';
            const isHidden = it.is_visible === false;
            return (
              <a
                key={it.id}
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                draggable={isAuthed}
                onDragStart={onDragStart(it.id)}
                onDragOver={onDragOver(it.id)}
                onDrop={onDrop(it.id)}
                data-testid={`link-card-${it.id}`}
                className="group relative flex items-center gap-4 px-5 py-4 rounded-[26px] glass-card hover:scale-[1.015] hover:shadow-[0_18px_50px_rgba(0,0,0,0.55)] transition-all"
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                {isAuthed && (
                  <span className="opacity-30 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-[#7E88B7]" />
                  </span>
                )}
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border" style={{ background: `${accent}18`, borderColor: `${accent}55`, color: accent }}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                      {it.label}
                    </h3>
                    {isHidden && isAuthed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold bg-[#E1B04A]/85 text-[#171718]">
                        <EyeOff className="w-2.5 h-2.5" />Hidden
                      </span>
                    )}
                    {preset && <span className="text-[10px] uppercase tracking-[0.2em] text-[#7E88B7]">{preset.label}</span>}
                  </div>
                  {it.description && <p className="text-xs text-[#7E88B7] mt-0.5 truncate">{it.description}</p>}
                </div>
                {isAuthed ? (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.preventDefault(); setEditing(it); }} data-testid={`link-edit-${it.id}`}
                      className="p-2 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] hover:bg-white/10" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <ExternalLink className="w-4 h-4 text-[#7E88B7] group-hover:text-[#B1EDE8] transition-colors" />
                )}
              </a>
            );
          })
        )}
      </div>

      {editing && (
        <LinkModal
          token={token}
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
          onDeleted={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
};

const LinkModal = ({ token, initial, onClose, onSaved, onDeleted }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    label: '', url: '', platform: '', description: '', color: '', is_visible: true,
  });
  const [saving, setSaving] = useState(false);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  // Auto-detect platform from URL
  const detectFromUrl = (url) => {
    const p = presetForUrl(url);
    if (p) {
      set({ platform: p.id, color: form.color || p.color, label: form.label || p.label });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) { toast.error('Label and URL required'); return; }
    setSaving(true);
    try {
      if (isEdit) await updateSocialLink(token, initial.id, form);
      else        await createSocialLink(token, form);
      toast.success(isEdit ? 'Link updated' : 'Link added');
      onSaved();
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm(`Remove "${initial.label}"?`)) return;
    try { await deleteSocialLink(token, initial.id); toast.success('Removed'); onDeleted(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[28px] w-full max-w-md p-7 max-h-[92vh] overflow-y-auto custom-scrollbar"
        data-testid="link-modal">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {isEdit ? 'Edit link' : 'New link'}
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <Field label="URL *">
            <input value={form.url} onChange={(e) => set({ url: e.target.value })}
              onBlur={(e) => detectFromUrl(e.target.value)} required autoFocus type="url" data-testid="link-url"
              placeholder="https://twitch.tv/your-handle"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Display label *">
            <input value={form.label} onChange={(e) => set({ label: e.target.value })} required data-testid="link-label"
              placeholder="e.g. Watch me on Twitch"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Field>

          <Field label="Platform">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button type="button" key={p.id} onClick={() => set({ platform: p.id, color: p.color, label: form.label || p.label })}
                  data-testid={`link-preset-${p.id}`}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${form.platform === p.id ? 'bg-[#066DF7]/20 text-white border-[#066DF7]/50' : 'bg-white/5 text-[#7E88B7] border-white/10 hover:text-white'}`}
                  style={form.platform === p.id ? { borderColor: `${p.color}80`, color: p.color, background: `${p.color}15` } : {}}>
                  {p.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Short description (optional)">
            <input value={form.description || ''} onChange={(e) => set({ description: e.target.value })} maxLength={200} data-testid="link-desc"
              placeholder="One-line description shown under the label"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Field>

          <Field label="Accent color (optional)">
            <div className="flex items-center gap-2">
              <input type="color" value={form.color || '#066DF7'} onChange={(e) => set({ color: e.target.value })} data-testid="link-color"
                className="w-12 h-10 rounded-xl bg-transparent cursor-pointer border border-white/10" />
              <input type="text" value={form.color || ''} onChange={(e) => set({ color: e.target.value })} placeholder="#066DF7"
                className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
            </div>
          </Field>

          <label className="flex items-center gap-2 mt-3 text-sm text-[#B1EDE8] cursor-pointer">
            <input type="checkbox" checked={form.is_visible !== false} onChange={(e) => set({ is_visible: e.target.checked })}
              data-testid="link-visible" className="accent-[#066DF7]" />
            Visible to public
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          {isEdit ? (
            <button type="button" onClick={handleDelete} data-testid="link-delete"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-xs hover:bg-[#600612]/30">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
            <button type="submit" disabled={saving} data-testid="link-save"
              className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">{label}</span>
    {children}
  </label>
);

export default Links;
