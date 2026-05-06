import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBrandAsset, updateBrandAsset, deleteBrandAsset } from '../api';

const CATEGORY_PRESETS = ['Logo', 'Overlay', 'Emote', 'Sticker', 'Banner', 'BG', 'Avatar', 'Other'];

const BrandAssetModal = ({ token, initial, onClose, onSaved, onDeleted }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    title: '', board: '', category: 'Logo',
    artist: '', platform: '',
    tags: [], urls: [],
    uploadDate: new Date().toISOString().split('T')[0],
    visibility: 'public',
  });
  const [tagDraft, setTagDraft] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    if (!form.tags.includes(t)) set({ tags: [...form.tags, t] });
    setTagDraft('');
  };
  const removeTag = (t) => set({ tags: form.tags.filter((x) => x !== t) });
  const addUrl = () => {
    const u = urlDraft.trim();
    if (!u) return;
    if (!form.urls.includes(u)) set({ urls: [...form.urls, u] });
    setUrlDraft('');
  };
  const removeUrl = (u) => set({ urls: form.urls.filter((x) => x !== u) });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      if (isEdit) await updateBrandAsset(token, initial.id, form);
      else        await createBrandAsset(token, form);
      toast.success(isEdit ? 'Asset updated' : 'Asset created');
      onSaved();
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm(`Delete "${initial.title}"?`)) return;
    try {
      await deleteBrandAsset(token, initial.id);
      toast.success('Deleted');
      onDeleted();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[28px] w-full max-w-lg max-h-[92vh] flex flex-col"
        data-testid="brand-asset-modal">
        <div className="flex items-center justify-between px-7 pt-7 pb-4 shrink-0 border-b border-white/5">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {isEdit ? 'Edit asset' : 'New brand asset'}
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-7 py-5 space-y-3 min-h-0">
          <Field label="Title *">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} required autoFocus data-testid="ba-title"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_PRESETS.map((c) => (
                <button type="button" key={c} onClick={() => set({ category: c })}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${form.category === c ? 'bg-[#066DF7]/20 text-white border-[#066DF7]/50' : 'bg-white/5 text-[#7E88B7] border-white/10 hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Board / Set"><input value={form.board} onChange={(e) => set({ board: e.target.value })} data-testid="ba-board" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" /></Field>
            <Field label="Platform"><input value={form.platform} onChange={(e) => set({ platform: e.target.value })} placeholder="Twitch · YouTube · X" data-testid="ba-platform" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" /></Field>
          </div>
          <Field label="Artist"><input value={form.artist} onChange={(e) => set({ artist: e.target.value })} data-testid="ba-artist" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" /></Field>

          <Field label="Visibility">
            <div className="flex gap-2">
              {[{ id: 'public', label: 'Public' }, { id: 'private', label: 'Private' }].map((opt) => (
                <button type="button" key={opt.id} onClick={() => set({ visibility: opt.id })}
                  data-testid={`ba-vis-${opt.id}`}
                  className={`flex-1 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${(form.visibility || 'public') === opt.id ? 'bg-[#066DF7]/20 text-white border-[#066DF7]/50' : 'bg-white/5 text-[#7E88B7] border-white/10 hover:text-white'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {form.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#B1EDE8]">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} className="text-[#7E88B7] hover:text-[#ff8095]"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="add tag and press enter" data-testid="ba-tag-input"
                className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
              <button type="button" onClick={addTag} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#B1EDE8] hover:bg-white/10">Add</button>
            </div>
          </Field>

          <Field label="Asset URLs">
            <div className="flex flex-col gap-1.5 mb-1.5">
              {form.urls.map((u) => (
                <div key={u} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="flex-1 text-xs text-[#B1EDE8] truncate">{u}</span>
                  <button type="button" onClick={() => removeUrl(u)} className="text-[#7E88B7] hover:text-[#ff8095]"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
                placeholder="https://… and press enter" data-testid="ba-url-input"
                className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
              <button type="button" onClick={addUrl} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#B1EDE8] hover:bg-white/10">Add</button>
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-2 px-7 py-4 shrink-0 border-t border-white/5">
          {isEdit ? (
            <button type="button" onClick={handleDelete} data-testid="ba-delete"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-xs hover:bg-[#600612]/30">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
            <button type="submit" disabled={saving} data-testid="ba-save"
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

export default BrandAssetModal;
