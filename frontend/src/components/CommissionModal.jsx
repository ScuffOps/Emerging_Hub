import React, { useState } from 'react';
import { X, Plus, Trash2, Globe, Lock, Key, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createCommission, updateCommission, uploadFile } from '../api';
import DatePicker from './DatePicker';

const STATUSES = ['Requested', 'Waitlisted', 'Accepted', 'In Progress', 'Review', 'Completed'];
const PLATFORMS = ['Skeb', 'DA', 'VGen', 'Etsy', 'Fiverr', 'Twitter', 'Discord', 'Other'];
const TYPES = ['L2D', 'CG', 'Icon', 'Bust', 'Waist-Up', 'Thigh-Up', 'Full Body', 'Outfit', 'Skeb', 'Other'];
const RIGHTS = ['n/a', 'personal', 'streaming', 'merch', 'full_commercial'];
const PAY_STATES = ['unpaid', 'partial', 'paid'];
const VISIBILITIES = [
  { id: 'public', label: 'Public',  icon: Globe, desc: 'Visible to anyone on the site' },
  { id: 'admin',  label: 'Admin',   icon: Lock,  desc: 'Only visible to you when unlocked' },
  { id: 'debut',  label: 'Debut',   icon: Key,   desc: 'Shown in the password-protected Debut section' },
];

const emptyForm = {
  title: '', description: '',
  artist: { name: '', discord: '', twitter: '', vgen: '', portfolio: '' },
  platform: 'Twitter', type: 'Full Body', status: 'Requested', payment_status: 'unpaid',
  budget: 0, currency: 'USD', payments: [],
  deadline: '', finished_date: '', usage_rights: 'personal', visibility: 'public',
  reference_urls: [], final_urls: [], notes: ''
};

const CommissionModal = ({ token, initial, onClose, onSaved }) => {
  const [form, setForm] = useState(() => initial ? { ...emptyForm, ...initial, artist: { ...emptyForm.artist, ...(initial.artist || {}) } } : emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setArtist = (patch) => setForm((f) => ({ ...f, artist: { ...f.artist, ...patch } }));

  const addPayment = () => set({ payments: [...(form.payments || []), { amount: 0, date: new Date().toISOString().split('T')[0], note: '' }] });
  const updatePayment = (idx, patch) => {
    const next = [...(form.payments || [])];
    next[idx] = { ...next[idx], ...patch };
    set({ payments: next });
  };
  const removePayment = (idx) => set({ payments: form.payments.filter((_, i) => i !== idx) });

  const addUrl = (field) => set({ [field]: [...(form[field] || []), ''] });
  const updateUrl = (field, idx, v) => {
    const next = [...(form[field] || [])];
    next[idx] = v;
    set({ [field]: next });
  };
  const removeUrl = (field, idx) => set({ [field]: form[field].filter((_, i) => i !== idx) });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget: Number(form.budget) || 0,
        payments: (form.payments || []).filter((p) => p && p.amount !== '').map((p) => ({ ...p, amount: Number(p.amount) || 0 })),
        reference_urls: (form.reference_urls || []).filter(Boolean),
        final_urls: (form.final_urls || []).filter(Boolean),
      };
      if (isEdit) await updateCommission(token, initial.id, payload);
      else        await createCommission(token, payload);
      toast.success(isEdit ? 'Commission updated' : 'Commission added');
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[35px] w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        data-testid="commission-modal">
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5">
          <div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
              {isEdit ? 'Edit Commission' : 'New Commission'}
            </h3>
            <p className="text-xs text-[#7E88B7] mt-1 uppercase tracking-[0.2em]">{isEdit ? initial.title : 'Track artist collab'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto custom-scrollbar px-8 py-6 space-y-6">
          {/* Basics */}
          <Section title="Basics">
            <Row>
              <Field label="Title" span={2}><Input value={form.title} onChange={(v) => set({ title: v })} required placeholder="Full body ref" testId="f-title" /></Field>
              <Field label="Status"><SelectEl value={form.status} onChange={(v) => set({ status: v })} options={STATUSES} testId="f-status" /></Field>
            </Row>
            <Row>
              <Field label="Platform"><SelectEl value={form.platform} onChange={(v) => set({ platform: v })} options={PLATFORMS} testId="f-platform" /></Field>
              <Field label="Type"><SelectEl value={form.type} onChange={(v) => set({ type: v })} options={TYPES} testId="f-type" /></Field>
              <Field label="Usage Rights"><SelectEl value={form.usage_rights} onChange={(v) => set({ usage_rights: v })} options={RIGHTS} testId="f-rights" /></Field>
            </Row>
            <Field label="Description"><TextArea value={form.description} onChange={(v) => set({ description: v })} placeholder="Brief description of the piece" testId="f-desc" /></Field>
          </Section>

          {/* Artist */}
          <Section title="Artist">
            <Row>
              <Field label="Name"><Input value={form.artist.name} onChange={(v) => setArtist({ name: v })} required testId="f-artist-name" /></Field>
              <Field label="Discord"><Input value={form.artist.discord || ''} onChange={(v) => setArtist({ discord: v })} placeholder="handle#0000" testId="f-artist-discord" /></Field>
            </Row>
            <Row>
              <Field label="Twitter/X"><Input value={form.artist.twitter || ''} onChange={(v) => setArtist({ twitter: v })} placeholder="@handle" testId="f-artist-twitter" /></Field>
              <Field label="VGen"><Input value={form.artist.vgen || ''} onChange={(v) => setArtist({ vgen: v })} testId="f-artist-vgen" /></Field>
              <Field label="Portfolio"><Input value={form.artist.portfolio || ''} onChange={(v) => setArtist({ portfolio: v })} placeholder="https://…" testId="f-artist-portfolio" /></Field>
            </Row>
          </Section>

          {/* Budget */}
          <Section title="Budget & Payments">
            <Row>
              <Field label="Budget"><Input type="number" value={form.budget} onChange={(v) => set({ budget: v })} testId="f-budget" /></Field>
              <Field label="Currency"><Input value={form.currency} onChange={(v) => set({ currency: v.toUpperCase() })} testId="f-currency" /></Field>
              <Field label="Payment Status"><SelectEl value={form.payment_status} onChange={(v) => set({ payment_status: v })} options={PAY_STATES} testId="f-pay-status" /></Field>
            </Row>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7E88B7]">Split Payments</span>
                <button type="button" onClick={addPayment} data-testid="add-payment" className="flex items-center gap-1 text-xs text-[#B1EDE8] hover:text-white"><Plus className="w-3 h-3" />Add</button>
              </div>
              <div className="space-y-2">
                {(form.payments || []).map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2" data-testid={`payment-row-${idx}`}>
                    <input type="number" value={p.amount} onChange={(e) => updatePayment(idx, { amount: e.target.value })} placeholder="Amount" className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
                    <div className="w-44">
                      <DatePicker value={p.date || ''} onChange={(v) => updatePayment(idx, { date: v })} placeholder="Date" testId={`payment-date-${idx}`} />
                    </div>
                    <input type="text" value={p.note || ''} onChange={(e) => updatePayment(idx, { note: e.target.value })} placeholder="note" className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
                    <button type="button" onClick={() => removePayment(idx)} className="p-2 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {(!form.payments || form.payments.length === 0) && <p className="text-xs italic text-[#7E88B7]">No payments logged.</p>}
              </div>
            </div>
          </Section>

          {/* Dates */}
          <Section title="Timeline">
            <Row>
              <Field label="Deadline">
                <DatePicker value={form.deadline || ''} onChange={(v) => set({ deadline: v })} placeholder="Pick deadline" testId="f-deadline" />
              </Field>
              <Field label="Finished">
                <DatePicker value={form.finished_date || ''} onChange={(v) => set({ finished_date: v })} placeholder="Pick finish date" testId="f-finished" />
              </Field>
            </Row>
          </Section>

          {/* Visibility */}
          <Section title="Visibility">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="visibility-selector">
              {VISIBILITIES.map((v) => {
                const Icon = v.icon;
                const active = form.visibility === v.id;
                return (
                  <button type="button" key={v.id} onClick={() => set({ visibility: v.id })} data-testid={`vis-${v.id}`}
                    className={`text-left rounded-[22px] p-4 border transition-all ${active ? 'bg-gradient-to-br from-[#066DF7]/25 to-[#3086AE]/10 border-[#066DF7] shadow-[0_0_20px_rgba(6,109,247,0.25)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#B1EDE8]'}`} />
                      <span className="text-sm font-bold" style={{ color: '#E1DBC2' }}>{v.label}</span>
                    </div>
                    <p className="text-[11px] text-[#7E88B7] leading-snug">{v.desc}</p>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Images */}
          <Section title="Images">
            <UrlList label="Reference URLs" field="reference_urls" form={form} add={addUrl} update={updateUrl} remove={removeUrl} />
            <UrlList label="Final Artwork URLs" field="final_urls" form={form} add={addUrl} update={updateUrl} remove={removeUrl} />
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <TextArea value={form.notes} onChange={(v) => set({ notes: v })} rows={3} placeholder="Revision logs, preferences, etc." testId="f-notes" />
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 px-8 py-5 border-t border-white/5 bg-black/20">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
          <button type="submit" disabled={saving} data-testid="commission-save-btn"
            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] hover:shadow-[0_0_30px_rgba(6,109,247,0.5)] transition-all disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ---- tiny helpers ----
const Section = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#066DF7] mb-3">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);
const Row = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{children}</div>;
const Field = ({ label, children, span }) => (
  <label className={`flex flex-col gap-1 ${span === 2 ? 'md:col-span-2' : ''}`}>
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">{label}</span>
    {children}
  </label>
);
const Input = ({ value, onChange, type = 'text', placeholder, required, testId }) => (
  <input type={type} value={value ?? ''} required={required} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testId}
    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
);
const SelectEl = ({ value, onChange, options, testId }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}
    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]">
    {options.map((o) => <option key={o} value={o} className="bg-[#171718]">{o}</option>)}
  </select>
);
const TextArea = ({ value, onChange, rows = 2, placeholder, testId }) => (
  <textarea value={value || ''} rows={rows} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testId}
    className="px-4 py-2.5 rounded-[22px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] resize-none" />
);
const UrlList = ({ label, field, form, add, update, remove }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setUploading(true);
    try {
      for (const file of list) {
        const { url } = await uploadFile(file);
        // append by reusing the add+update primitives
        const idx = (form[field] || []).length;
        add(field);
        update(field, idx, url);
      }
      toast.success(`Uploaded ${list.length} image${list.length === 1 ? '' : 's'}`);
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally { setUploading(false); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#7E88B7]">{label}</span>
        <div className="flex items-center gap-2">
          <label className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${uploading ? 'text-[#7E88B7]' : 'text-[#B1EDE8] hover:text-white'}`} data-testid={`upload-${field}`}>
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? 'Uploading…' : 'Upload'}
            <input type="file" accept="image/*" multiple className="hidden" disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)} />
          </label>
          <button type="button" onClick={() => add(field)} data-testid={`add-${field}`} className="flex items-center gap-1 text-xs text-[#B1EDE8] hover:text-white">
            <Plus className="w-3 h-3" />URL
          </button>
        </div>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mb-2 rounded-[18px] border border-dashed p-3 text-center text-[11px] transition-all ${dragOver ? 'border-[#066DF7] bg-[#066DF7]/10 text-white' : 'border-white/10 text-[#7E88B7]'}`}
        data-testid={`dropzone-${field}`}
      >
        Drop images here or click <span className="text-[#B1EDE8]">Upload</span> above
      </div>
      <div className="space-y-2">
        {(form[field] || []).map((url, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {url && url.match(/\.(png|jpe?g|gif|webp)/i) && (
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-black/30 shrink-0">
                <img src={url} alt="thumb" className="w-full h-full object-cover" />
              </div>
            )}
            <input type="url" value={url} onChange={(e) => update(field, idx, e.target.value)} placeholder="https://…" data-testid={`${field}-${idx}`}
              className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
            <button type="button" onClick={() => remove(field, idx)} className="p-2 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095]"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {(!form[field] || form[field].length === 0) && <p className="text-xs italic text-[#7E88B7]">None.</p>}
      </div>
    </div>
  );
};

export default CommissionModal;
