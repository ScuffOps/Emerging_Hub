import React, { useState } from 'react';
import { X, Wand2, Twitter, MessageCircle, Palette, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { bulkRenameArtist } from '../api';

const BulkRenameArtistModal = ({ token, fromName, artistOptions = [], onClose, onSaved }) => {
  const [pickedFrom, setPickedFrom] = useState(fromName || (artistOptions[0] || ''));
  const [toName, setToName] = useState(pickedFrom === 'Unknown Artist' ? '' : pickedFrom);
  const [twitter, setTwitter] = useState('');
  const [vgen, setVgen] = useState('');
  const [discord, setDiscord] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFromChange = (v) => {
    setPickedFrom(v);
    setToName(v === 'Unknown Artist' ? '' : v);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!pickedFrom) { toast.error('Pick a source artist'); return; }
    if (!toName.trim()) { toast.error('Enter the new artist name'); return; }
    setSaving(true);
    try {
      const r = await bulkRenameArtist(token, {
        from_name: pickedFrom,
        to_name: toName.trim(),
        twitter: twitter.trim() || undefined,
        vgen: vgen.trim() || undefined,
        discord: discord.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
      });
      toast.success(`Updated ${r.modified} commission${r.modified === 1 ? '' : 's'}`);
      onSaved();
    } catch {
      toast.error('Bulk update failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[35px] w-full max-w-lg p-7"
        data-testid="bulk-rename-modal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D477FF]/10 border border-[#D477FF]/30"><Wand2 className="w-5 h-5 text-[#D477FF]" /></div>
            <div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Bulk re-attribute artist</h3>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#7E88B7] mt-1">Updates every public Completed piece for the source artist</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          {artistOptions.length > 0 && (
            <Field label="From artist" required>
              <select value={pickedFrom} onChange={(e) => handleFromChange(e.target.value)} data-testid="bulk-from-name"
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]">
                {artistOptions.map((n) => <option key={n} value={n} className="bg-[#171718]">{n}</option>)}
              </select>
            </Field>
          )}
          <Field label="New artist name" required>
            <input value={toName} onChange={(e) => setToName(e.target.value)} required autoFocus
              data-testid="bulk-to-name"
              className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#066DF7]" />
          </Field>
          <p className="text-[11px] text-[#7E88B7] -mt-1.5">Optional handles — applied to every piece in this batch (existing values overwritten only when set):</p>

          <Field label="Twitter/X" icon={Twitter}><input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" data-testid="bulk-twitter" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" /></Field>
          <Field label="VGen" icon={Palette}><input value={vgen} onChange={(e) => setVgen(e.target.value)} placeholder="vgen.co/handle or @handle" data-testid="bulk-vgen" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" /></Field>
          <Field label="Discord" icon={MessageCircle}><input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="handle#0000 or invite link" data-testid="bulk-discord" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" /></Field>
          <Field label="Portfolio URL" icon={Globe}><input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://…" data-testid="bulk-portfolio" className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" /></Field>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
          <button type="submit" disabled={saving} data-testid="bulk-save"
            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] disabled:opacity-50">
            {saving ? 'Updating…' : 'Re-attribute'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children, icon: Icon, required }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}{label}{required && <span className="text-[#ff8095]">*</span>}
    </span>
    {children}
  </label>
);

export default BulkRenameArtistModal;
