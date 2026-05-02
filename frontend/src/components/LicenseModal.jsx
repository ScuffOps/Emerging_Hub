import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createLicense, updateLicense, deleteLicense } from '../api';

const OWNERSHIP_OPTIONS = ['Full Rights', 'Limited Use', 'Commercial Only', 'Personal Only', 'Time-Bound'];

const LicenseModal = ({ token, initial, onClose, onSaved, onDeleted }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    item: '', ownership: 'Full Rights', scope: '',
    proofLinks: [], expiryDate: '', notes: '',
  });
  const [linkDraft, setLinkDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const addLink = () => {
    const u = linkDraft.trim();
    if (!u) return;
    if (!form.proofLinks.includes(u)) set({ proofLinks: [...form.proofLinks, u] });
    setLinkDraft('');
  };
  const removeLink = (u) => set({ proofLinks: form.proofLinks.filter((x) => x !== u) });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.item.trim()) { toast.error('Item required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, expiryDate: form.expiryDate || null, notes: form.notes || null };
      if (isEdit) await updateLicense(token, initial.id, payload);
      else        await createLicense(token, payload);
      toast.success(isEdit ? 'License updated' : 'License created');
      onSaved();
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm(`Delete "${initial.item}"?`)) return;
    try {
      await deleteLicense(token, initial.id);
      toast.success('Deleted');
      onDeleted();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[28px] w-full max-w-lg p-7 max-h-[92vh] overflow-y-auto custom-scrollbar"
        data-testid="license-modal">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {isEdit ? 'Edit license' : 'New license'}
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Item *">
            <input value={form.item} onChange={(e) => set({ item: e.target.value })} required autoFocus data-testid="lic-item"
              placeholder="e.g. Stream Overlay v2 — KaeArt"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Ownership">
            <div className="flex flex-wrap gap-1.5">
              {OWNERSHIP_OPTIONS.map((o) => (
                <button type="button" key={o} onClick={() => set({ ownership: o })}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${form.ownership === o ? 'bg-[#3086AE]/20 text-white border-[#3086AE]/50' : 'bg-white/5 text-[#7E88B7] border-white/10 hover:text-white'}`}>
                  {o}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Scope / Description">
            <textarea value={form.scope} rows={2} onChange={(e) => set({ scope: e.target.value })} data-testid="lic-scope"
              placeholder="e.g. Personal stream + commercial subscriber emotes"
              className="w-full px-4 py-2.5 rounded-[22px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] resize-none" />
          </Field>
          <Field label="Expiry date (optional)">
            <input type="date" value={form.expiryDate || ''} onChange={(e) => set({ expiryDate: e.target.value })} data-testid="lic-expiry"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes || ''} rows={2} onChange={(e) => set({ notes: e.target.value })} data-testid="lic-notes"
              placeholder="any extra context"
              className="w-full px-4 py-2.5 rounded-[22px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] resize-none" />
          </Field>
          <Field label="Proof links">
            <div className="flex flex-col gap-1.5 mb-1.5">
              {form.proofLinks.map((u) => (
                <div key={u} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="flex-1 text-xs text-[#B1EDE8] truncate">{u}</span>
                  <button type="button" onClick={() => removeLink(u)} className="text-[#7E88B7] hover:text-[#ff8095]"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                placeholder="https://… (contract / receipt) and press enter" data-testid="lic-link-input"
                className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
              <button type="button" onClick={addLink} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#B1EDE8] hover:bg-white/10">Add</button>
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          {isEdit ? (
            <button type="button" onClick={handleDelete} data-testid="lic-delete"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-xs hover:bg-[#600612]/30">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
            <button type="submit" disabled={saving} data-testid="lic-save"
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

export default LicenseModal;
