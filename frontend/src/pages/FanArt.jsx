import React, { useEffect, useState } from 'react';
import { Heart, Plus, X, Upload, Loader2, Twitter, ExternalLink, Check, Trash2, Image as ImageIcon, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { submitFanart, fetchFanart, reviewFanart, deleteFanart, uploadFile } from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

const STATUS_TABS = [
  { id: 'approved', label: 'Approved', color: '#4ADE80' },
  { id: 'pending',  label: 'Pending',  color: '#E1B04A' },
  { id: 'rejected', label: 'Rejected', color: '#ff8095' },
];

const FanArtCard = ({ item, isAdmin, onApprove, onReject, onDelete }) => {
  const handle = item.submitter_handle || '';
  const twitterHref = handle && (handle.startsWith('@') ? `https://twitter.com/${handle.slice(1)}` : (handle.startsWith('http') ? handle : `https://twitter.com/${handle}`));
  return (
    <div className="glass-card rounded-[22px] overflow-hidden flex flex-col group" data-testid={`fanart-card-${item.id}`}>
      <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="aspect-[4/5] bg-black/30 overflow-hidden block">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#7E88B7]"><ImageIcon className="w-10 h-10" /></div>
        )}
      </a>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h4 className="text-sm font-bold leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{item.title}</h4>
        <div className="flex items-center gap-2 text-[11px] text-[#B1EDE8]">
          <span>by {item.submitter_name}</span>
          {twitterHref && (
            <a href={twitterHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-[#066DF7]/15 hover:text-white transition-colors">
              <Twitter className="w-3 h-3" />{handle}
            </a>
          )}
        </div>
        {item.message && <p className="text-xs text-[#7E88B7] italic line-clamp-3">"{item.message}"</p>}
      </div>
      {isAdmin && (
        <div className="flex items-center gap-1.5 px-4 pb-4">
          {item.status !== 'approved' && (
            <button onClick={() => onApprove(item)} data-testid={`approve-${item.id}`} className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/40 text-[#4ADE80] text-xs hover:bg-[#4ADE80]/25">
              <Check className="w-3 h-3" />Approve
            </button>
          )}
          {item.status !== 'rejected' && (
            <button onClick={() => onReject(item)} data-testid={`reject-${item.id}`} className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-xs hover:bg-[#600612]/30">
              <X className="w-3 h-3" />Reject
            </button>
          )}
          <button onClick={() => onDelete(item)} data-testid={`delete-${item.id}`} title="Delete permanently"
            className="px-2 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#7E88B7] hover:bg-white/10">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

const SubmitModal = ({ onClose, onSubmitted }) => {
  const [form, setForm] = useState({ title: '', submitter_name: '', submitter_handle: '', submitter_url: '', message: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      set({ image_url: url });
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.submitter_name || !form.image_url) { toast.error('Title, name, and image required'); return; }
    setSaving(true);
    try {
      await submitFanart(form);
      toast.success('Submitted! Veri will review and feature it soon ✨');
      onSubmitted();
    } catch (err) { toast.error(err.message || 'Submission failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[28px] w-full max-w-lg p-7 max-h-[92vh] overflow-y-auto custom-scrollbar"
        data-testid="fanart-submit-modal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D477FF]/10 border border-[#D477FF]/30"><Heart className="w-5 h-5 text-[#D477FF]" /></div>
            <div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Submit Fan Art</h3>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7E88B7] mt-0.5">All submissions reviewed before going live</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Your name *">
            <input value={form.submitter_name} onChange={(e) => set({ submitter_name: e.target.value })} required autoFocus data-testid="submitter-name"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Twitter/X handle (optional)">
            <input value={form.submitter_handle} onChange={(e) => set({ submitter_handle: e.target.value })} placeholder="@yourhandle" data-testid="submitter-handle"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Title *">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} required placeholder="What is this piece called?" data-testid="fanart-title"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <Field label="Image *">
            <div className="flex items-center gap-2">
              {form.image_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/30 shrink-0">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <input type="url" value={form.image_url} onChange={(e) => set({ image_url: e.target.value })} placeholder="https://… or upload below" data-testid="fanart-image-url"
                className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
              <label className={`flex items-center gap-1 px-3 py-2 rounded-full cursor-pointer text-xs transition-colors ${uploading ? 'bg-white/5 text-[#7E88B7]' : 'bg-white/5 border border-white/10 text-[#B1EDE8] hover:bg-white/10'}`}>
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {uploading ? '…' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} data-testid="fanart-upload" />
              </label>
            </div>
          </Field>
          <Field label="Message to Veri (optional)">
            <textarea value={form.message} rows={3} onChange={(e) => set({ message: e.target.value })} placeholder="Anything you want to say…" data-testid="fanart-message"
              className="w-full px-4 py-2.5 rounded-[22px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7] resize-none" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
          <button type="submit" disabled={saving} data-testid="fanart-submit-btn"
            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#D477FF] to-[#066DF7] text-white text-sm font-semibold shadow-[0_0_20px_rgba(212,119,255,0.35)] disabled:opacity-50">
            {saving ? 'Submitting…' : 'Submit'}
          </button>
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

const FanArt = () => {
  const { token, isAuthed } = useAuth();
  const [items, setItems] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusTab, setStatusTab] = useState('approved');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (s = statusTab) => {
    setLoading(true);
    try {
      const d = await fetchFanart(token, s);
      setItems(d.items);
      // also fetch pending count for admins
      if (isAuthed) {
        const p = await fetchFanart(token, 'pending');
        setPendingCount(p.count);
      } else {
        setPendingCount(0);
      }
    } catch { toast.error('Failed to load fan art'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(statusTab); /* eslint-disable-next-line */ }, [statusTab, isAuthed]);

  const setStatus = async (item, newStatus) => {
    try {
      await reviewFanart(token, item.id, newStatus);
      toast.success(newStatus === 'approved' ? 'Approved' : 'Rejected');
      load(statusTab);
    } catch { toast.error('Action failed'); }
  };
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}" permanently?`)) return;
    try { await deleteFanart(token, item.id); toast.success('Deleted'); load(statusTab); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="p-8 lg:p-12 pb-32" data-testid="fanart-page">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D477FF]/10 border border-[#D477FF]/30 text-[#D477FF] text-[11px] uppercase tracking-[0.25em] mb-4">
            <Heart className="w-3 h-3" />Fan Wall
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Fan Art</h1>
          <p className="text-lg text-[#B1EDE8] tracking-wide">Veri loves seeing the kingdom paint her — drop your piece below.</p>
        </div>
        <button onClick={() => setSubmitOpen(true)} data-testid="open-submit-btn"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#D477FF] to-[#066DF7] text-white text-sm font-semibold shadow-[0_0_22px_rgba(212,119,255,0.35)] hover:shadow-[0_0_30px_rgba(212,119,255,0.55)] transition-all">
          <Plus className="w-4 h-4" />Submit your art
        </button>
      </div>

      {isAuthed && (
        <div className="flex items-center gap-2 mb-6 flex-wrap" data-testid="fanart-tabs">
          {STATUS_TABS.map((t) => (
            <button key={t.id} onClick={() => setStatusTab(t.id)} data-testid={`tab-${t.id}`}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusTab === t.id ? 'text-white' : 'text-[#B1EDE8] hover:text-white'}`}
              style={{ borderColor: statusTab === t.id ? `${t.color}77` : 'rgba(255,255,255,0.1)', background: statusTab === t.id ? `${t.color}25` : 'rgba(255,255,255,0.03)' }}>
              {t.label}
              {t.id === 'pending' && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-[#E1B04A] text-black font-black">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-[#7E88B7] text-sm" data-testid="fanart-loading">Loading…</p>
      ) : items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl" data-testid="fanart-grid">
          {items.map((it) => (
            <FanArtCard key={it.id} item={it} isAdmin={isAuthed}
              onApprove={(i) => setStatus(i, 'approved')}
              onReject={(i) => setStatus(i, 'rejected')}
              onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[28px] p-10 max-w-xl text-center" data-testid="fanart-empty">
          <Inbox className="w-8 h-8 text-[#7E88B7] mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {statusTab === 'approved' ? 'Be the first to submit!' : 'Nothing here yet.'}
          </h3>
          <p className="text-sm text-[#7E88B7]">{statusTab === 'approved' ? 'Approved fan art will appear here.' : `${statusTab.charAt(0).toUpperCase()}${statusTab.slice(1)} submissions empty.`}</p>
        </div>
      )}

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} onSubmitted={() => { setSubmitOpen(false); load(statusTab); }} />}
    </div>
  );
};

export default FanArt;
