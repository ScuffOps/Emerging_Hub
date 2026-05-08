import React, { useState } from 'react';
import { X, Plus, Music, Palette, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { patchCharacter } from '../api';

/**
 * Admin modal to edit profile-tab fields on the character:
 * likes, dislikes, skills (name+level), designMotifs, colorPalette (name+hex), themeSongTitle
 */
const ProfileEditModal = ({ token, character, onClose, onSaved }) => {
  const [form, setForm] = useState({
    themeSongTitle: character.themeSongTitle || '',
    likes: [...(character.likes || [])],
    dislikes: [...(character.dislikes || [])],
    skills: (character.skills || []).map((s) => ({ ...s })),
    designMotifs: [...(character.designMotifs || [])],
    colorPalette: (character.colorPalette || []).map((c) => ({ ...c })),
  });
  const [saving, setSaving] = useState(false);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  // ---- list helpers ----
  const addString = (key) => () => set({ [key]: [...form[key], ''] });
  const updateString = (key) => (i) => (e) => {
    const arr = [...form[key]]; arr[i] = e.target.value; set({ [key]: arr });
  };
  const removeString = (key) => (i) => () => {
    const arr = [...form[key]]; arr.splice(i, 1); set({ [key]: arr });
  };

  const addSkill = () => set({ skills: [...form.skills, { name: '', level: 50 }] });
  const updateSkill = (i, field, value) => {
    const arr = [...form.skills]; arr[i] = { ...arr[i], [field]: field === 'level' ? Number(value) : value };
    set({ skills: arr });
  };
  const removeSkill = (i) => {
    const arr = [...form.skills]; arr.splice(i, 1); set({ skills: arr });
  };

  const addColor = () => set({ colorPalette: [...form.colorPalette, { name: '', hex: '#066DF7' }] });
  const updateColor = (i, field, value) => {
    const arr = [...form.colorPalette]; arr[i] = { ...arr[i], [field]: value };
    set({ colorPalette: arr });
  };
  const removeColor = (i) => {
    const arr = [...form.colorPalette]; arr.splice(i, 1); set({ colorPalette: arr });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Clean empty strings
      const payload = {
        themeSongTitle: form.themeSongTitle.trim(),
        likes: form.likes.map((s) => s.trim()).filter(Boolean),
        dislikes: form.dislikes.map((s) => s.trim()).filter(Boolean),
        designMotifs: form.designMotifs.map((s) => s.trim()).filter(Boolean),
        skills: form.skills.filter((s) => s.name.trim()).map((s) => ({
          name: s.name.trim(),
          level: Math.max(0, Math.min(100, Number(s.level) || 0)),
        })),
        colorPalette: form.colorPalette.filter((c) => c.name.trim() || c.hex.trim()).map((c) => ({
          name: c.name.trim(), hex: c.hex.trim() || '#066DF7',
        })),
      };
      const updated = await patchCharacter(token, payload);
      toast.success('Profile saved');
      onSaved(updated);
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="glass-card rounded-[28px] w-full max-w-2xl max-h-[92vh] flex flex-col"
        data-testid="profile-edit-modal">
        <div className="flex items-center justify-between px-7 pt-7 pb-4 shrink-0 border-b border-white/5">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            Edit profile
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-7 py-5 space-y-6 min-h-0">
          <Section icon={<Music className="w-4 h-4 text-[#066DF7]" />} title="Theme song">
            <input value={form.themeSongTitle} onChange={(e) => set({ themeSongTitle: e.target.value })} data-testid="pf-theme"
              placeholder="e.g. Overture — Night Kin"
              className="w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
          </Section>

          <Section icon={<Palette className="w-4 h-4 text-[#B1EDE8]" />} title="Color palette">
            <div className="space-y-2">
              {form.colorPalette.map((c, i) => (
                <div key={i} className="flex items-center gap-2" data-testid={`pf-color-row-${i}`}>
                  <input type="color" value={c.hex || '#066DF7'} onChange={(e) => updateColor(i, 'hex', e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-white/10 shrink-0" />
                  <input value={c.hex || ''} onChange={(e) => updateColor(i, 'hex', e.target.value)} placeholder="#066DF7"
                    className="w-28 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
                  <input value={c.name || ''} onChange={(e) => updateColor(i, 'name', e.target.value)} placeholder="Name (e.g. Starfire)"
                    className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
                  <button type="button" onClick={() => removeColor(i)} className="p-2 rounded-full text-[#ff8095] hover:bg-[#600612]/20"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <AddRowButton onClick={addColor} label="Add color" testid="pf-color-add" />
            </div>
          </Section>

          <Section title="Likes">
            <ListEditor items={form.likes} onAdd={addString('likes')} onUpdate={updateString('likes')} onRemove={removeString('likes')} accent="#B1EDE8" placeholder="e.g. Thunderstorms" testPrefix="pf-like" addLabel="Add like" />
          </Section>

          <Section title="Dislikes">
            <ListEditor items={form.dislikes} onAdd={addString('dislikes')} onUpdate={updateString('dislikes')} onRemove={removeString('dislikes')} accent="#ff8095" placeholder="e.g. Loud noises" testPrefix="pf-dislike" addLabel="Add dislike" />
          </Section>

          <Section title="Core abilities / skills">
            <div className="space-y-2">
              {form.skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2" data-testid={`pf-skill-row-${i}`}>
                  <input value={s.name} onChange={(e) => updateSkill(i, 'name', e.target.value)} placeholder="e.g. Vocal prowess"
                    className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
                  <input type="range" min="0" max="100" step="1" value={s.level} onChange={(e) => updateSkill(i, 'level', e.target.value)}
                    className="flex-1 accent-[#066DF7]" />
                  <span className="text-xs text-[#066DF7] w-10 text-right font-bold">{s.level}%</span>
                  <button type="button" onClick={() => removeSkill(i)} className="p-2 rounded-full text-[#ff8095] hover:bg-[#600612]/20"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <AddRowButton onClick={addSkill} label="Add ability" testid="pf-skill-add" />
            </div>
          </Section>

          <Section title="Design motifs">
            <ListEditor items={form.designMotifs} onAdd={addString('designMotifs')} onUpdate={updateString('designMotifs')} onRemove={removeString('designMotifs')} accent="#E1B04A" placeholder="e.g. Cross, Feathers, Gold" testPrefix="pf-motif" addLabel="Add motif" />
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 px-7 py-4 shrink-0 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
          <button type="submit" disabled={saving} data-testid="pf-save"
            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] disabled:opacity-50">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h4 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{title}</h4>
    </div>
    {children}
  </div>
);

const ListEditor = ({ items, onAdd, onUpdate, onRemove, accent, placeholder, testPrefix, addLabel }) => (
  <div className="space-y-2">
    {items.map((v, i) => (
      <div key={i} className="flex items-center gap-2" data-testid={`${testPrefix}-row-${i}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        <input value={v} onChange={onUpdate(i)} placeholder={placeholder}
          className="flex-1 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
        <button type="button" onClick={onRemove(i)} className="p-2 rounded-full text-[#ff8095] hover:bg-[#600612]/20"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    ))}
    <AddRowButton onClick={onAdd} label={addLabel} testid={`${testPrefix}-add`} />
  </div>
);

const AddRowButton = ({ onClick, label, testid }) => (
  <button type="button" onClick={onClick} data-testid={testid}
    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-dashed border-white/15 text-xs text-[#B1EDE8] hover:bg-white/10 hover:border-white/30">
    <Plus className="w-3 h-3" />{label}
  </button>
);

export default ProfileEditModal;
