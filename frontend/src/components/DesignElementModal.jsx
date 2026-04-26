import React, { useEffect, useState } from 'react';
import { X, Upload, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createDesignElement, updateDesignElement, deleteDesignElement, uploadFile } from '../api';

const CATEGORIES = [
  { id: 'tattoo',    label: 'Tattoo',    color: '#D477FF' },
  { id: 'accessory', label: 'Accessory', color: '#E1B04A' },
  { id: 'mark',      label: 'Mark',      color: '#066DF7' },
  { id: 'motif',     label: 'Motif',     color: '#3086AE' },
  { id: 'feature',   label: 'Feature',   color: '#B1EDE8' },
  { id: 'outfit',    label: 'Outfit',    color: '#ff8095' },
];

const DesignElementModal = ({ token, initial, position, onClose, onSaved, onDeleted }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    name: '', category: 'feature', description: '',
    thumbnail: '', full_image: '',
    position_x: position?.x ?? 50,
    position_y: position?.y ?? 50,
    color: '',
  });
  const [uploading, setUploading] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploading(field);
    try {
      const { url } = await uploadFile(file);
      set({ [field]: url });
      // Auto-fill thumbnail when full_image set first
      if (field === 'full_image' && !form.thumbnail) set({ thumbnail: url });
    } catch (e) { toast.error('Upload failed'); }
    finally { setUploading(''); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, position_x: Number(form.position_x), position_y: Number(form.position_y) };
      if (isEdit) await updateDesignElement(token, initial.id, payload);
      else        await createDesignElement(token, payload);
      toast.success(isEdit ? 'Element updated' : 'Element added');
      onSaved();
    } catch (e) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm(`Delete "${initial.name}"?`)) return;
    try {
      await deleteDesignElement(token, initial.id);
      toast.success('Deleted');
      onDeleted();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[35px] w-full max-w-lg p-7 max-h-[92vh] overflow-y-auto custom-scrollbar"
        data-testid="design-element-modal">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {isEdit ? 'Edit element' : 'New design element'}
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Name *">
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} required autoFocus
              data-testid="elem-name"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Category">
            <div className="flex flex-wrap gap-1.5" data-testid="elem-categories">
              {CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => set({ category: c.id })}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${form.category === c.id ? 'text-white' : 'text-[#7E88B7] hover:text-white'}`}
                  style={{ borderColor: form.category === c.id ? c.color : 'rgba(255,255,255,0.1)', background: form.category === c.id ? `${c.color}25` : 'rgba(255,255,255,0.03)' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Description">
            <textarea value={form.description} rows={3} onChange={(e) => set({ description: e.target.value })}
              placeholder="Lore, meaning, style notes…" data-testid="elem-desc"
              className="w-full px-4 py-2.5 rounded-[22px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] resize-none" />
          </Field>
          <ImageRow label="Detail image" field="full_image" form={form} set={set} uploading={uploading === 'full_image'} onUpload={(f) => handleUpload('full_image', f)} />
          <ImageRow label="Thumbnail (optional · auto from detail)" field="thumbnail" form={form} set={set} uploading={uploading === 'thumbnail'} onUpload={(f) => handleUpload('thumbnail', f)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hotspot X (%)">
              <input type="number" min="0" max="100" step="0.1" value={form.position_x}
                onChange={(e) => set({ position_x: e.target.value })} data-testid="elem-x"
                className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
            </Field>
            <Field label="Hotspot Y (%)">
              <input type="number" min="0" max="100" step="0.1" value={form.position_y}
                onChange={(e) => set({ position_y: e.target.value })} data-testid="elem-y"
                className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          {isEdit ? (
            <button type="button" onClick={handleDelete} data-testid="elem-delete"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-xs hover:bg-[#600612]/30">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
            <button type="submit" disabled={saving} data-testid="elem-save"
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

const ImageRow = ({ label, field, form, set, uploading, onUpload }) => (
  <Field label={label}>
    <div className="flex items-center gap-2">
      {form[field] && (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/30 shrink-0">
          <img src={form[field]} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <input type="url" value={form[field] || ''} onChange={(e) => set({ [field]: e.target.value })} placeholder="https://… or upload"
        className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
      <label className={`flex items-center gap-1 px-3 py-2 rounded-full cursor-pointer text-xs transition-colors ${uploading ? 'bg-white/5 text-[#7E88B7]' : 'bg-white/5 border border-white/10 text-[#B1EDE8] hover:bg-white/10'}`}>
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {uploading ? '…' : 'Upload'}
        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onUpload(e.target.files?.[0])} />
      </label>
    </div>
  </Field>
);

export default DesignElementModal;
