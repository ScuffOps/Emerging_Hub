import React, { useEffect, useState, useRef } from 'react';
import { Plus, X, ArrowRight, Tag, Sparkles, MousePointer2, Image as ImageIcon, Move, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { fetchDesign, reorderDesignElements, updateDesignCanvas, updateDesignElement, deleteDesignElement } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCharacter } from '../context/CharacterContext';
import DesignElementModal from '../components/DesignElementModal';
import ImagePicker from '../components/ImagePicker';
import '../styles/theme.css';

const CATEGORY_META = {
  tattoo:    { label: 'Tattoo',    color: '#D477FF' },
  accessory: { label: 'Accessory', color: '#E1B04A' },
  mark:      { label: 'Mark',      color: '#066DF7' },
  motif:     { label: 'Motif',     color: '#3086AE' },
  feature:   { label: 'Feature',   color: '#B1EDE8' },
  outfit:    { label: 'Outfit',    color: '#ff8095' },
};
const catColor = (c) => CATEGORY_META[c]?.color || '#066DF7';
const catLabel = (c) => CATEGORY_META[c]?.label || (c || 'Element');

const Hotspot = ({ el, active, isAdmin, onClick, onDragStart, isDragging }) => {
  const color = catColor(el.category);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={isAdmin ? onDragStart : undefined}
      onTouchStart={isAdmin ? onDragStart : undefined}
      data-testid={`hotspot-${el.id}`}
      className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none ${isAdmin ? 'cursor-move' : ''} ${isDragging ? 'z-50' : ''}`}
      style={{ left: `${el.position_x}%`, top: `${el.position_y}%`, touchAction: 'none' }}
      aria-label={el.name}
    >
      <span className="absolute inset-0 -m-3 rounded-full animate-ping" style={{ backgroundColor: `${color}40` }} />
      <span
        className={`relative block rounded-full border-2 transition-all duration-300 ${active ? 'w-6 h-6 scale-110 shadow-[0_0_22px_currentColor]' : 'w-4 h-4 group-hover:w-5 group-hover:h-5'} ${isDragging ? 'scale-125 ring-2 ring-white/80' : ''}`}
        style={{
          background: color,
          color,
          borderColor: 'rgba(255,255,255,0.85)',
          boxShadow: active ? `0 0 22px ${color}` : `0 0 10px ${color}`,
        }}
      />
      <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
        {el.name}
      </span>
      {isAdmin && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#E1B04A] border border-[#171718]" title="Admin: drag to reposition · click to edit" />
      )}
    </button>
  );
};

const DetailPane = ({ el, onClose, isAdmin, onEdit, onDelete }) => {
  const open = !!el;
  const [zoomed, setZoomed] = useState(false);
  return (
    <>
    <div
      className={`fixed right-5 top-1/2 -translate-y-1/2 w-[min(420px,calc(100vw-2.5rem))] max-h-[85vh] z-[90] transition-all duration-500 ease-out ${open ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      data-testid="design-detail-pane"
    >
      <div className="glass-card flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10" style={{ borderRadius: '15px', maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex-1 min-w-0">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.22em] mb-2 border"
              style={{ color: el ? catColor(el.category) : '#066DF7', borderColor: `${el ? catColor(el.category) : '#066DF7'}55`, background: `${el ? catColor(el.category) : '#066DF7'}15` }}
            >
              <Tag className="w-3 h-3" />{el ? catLabel(el.category) : ''}
            </span>
            <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
              {el?.name || ''}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8] shrink-0" data-testid="close-detail-pane">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {el?.full_image ? (
            <button
              type="button"
              onClick={() => setZoomed(true)}
              data-testid="detail-image-zoom"
              title="Click to view full size"
              className="group relative block w-full overflow-hidden bg-black/30 ring-1 ring-white/10 hover:ring-[#B1EDE8]/30 transition-all"
              style={{ borderRadius: '15px' }}
            >
              <img src={el.full_image} alt={el.name} className="w-full h-auto block" loading="lazy" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold bg-black/60 backdrop-blur-md text-[#E1DBC2] border border-white/15">
                  Click to enlarge
                </span>
              </span>
            </button>
          ) : (
            <div className="w-full rounded-[15px] bg-white/[0.03] border border-dashed border-white/10 py-10 flex flex-col items-center justify-center gap-1 text-center">
              <ImageIcon className="w-5 h-5 text-[#7E88B7]" />
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7E88B7]">No detail image yet</p>
              {isAdmin && <p className="text-[10px] text-[#7E88B7]">Click "Edit details" below to add one.</p>}
            </div>
          )}
          {el?.description ? (
            <p className="text-sm text-[#B1EDE8] leading-relaxed whitespace-pre-line">{el.description}</p>
          ) : (
            <p className="text-xs italic text-[#7E88B7]">No description yet.</p>
          )}
        </div>

        {/* Admin actions */}
        {isAdmin && el && (
          <div className="border-t border-white/5 px-5 py-3 flex items-center justify-end gap-2" data-testid="detail-admin-actions">
            <button onClick={() => onDelete(el)} data-testid={`detail-delete-${el.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-xs hover:bg-[#600612]/30">
              <Trash2 className="w-3 h-3" />Delete
            </button>
            <button onClick={() => onEdit(el)} data-testid={`detail-edit-${el.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] text-xs hover:bg-white/10">
              <Edit className="w-3 h-3" />Edit details
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Fullscreen lightbox for detail image */}
    {zoomed && el?.full_image && (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
        onClick={() => setZoomed(false)}
        data-testid="detail-lightbox"
      >
        <button
          onClick={() => setZoomed(false)}
          className="absolute top-5 right-5 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#E1DBC2]"
          data-testid="detail-lightbox-close"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={el.full_image}
          alt={el.name}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[95vw] max-h-[92vh] object-contain rounded-[15px] shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-[#E1DBC2] max-w-[80vw] truncate">
          {el.name}
        </div>
      </div>
    )}
    </>
  );
};

const DesignCard = ({ el, onClick, draggable, onDragStart, onDragOver, onDrop, isDragOver }) => (
  <button
    type="button"
    onClick={onClick}
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    data-testid={`elem-card-${el.id}`}
    className={`group glass-card rounded-[22px] overflow-hidden text-left transition-all hover:ring-1 hover:ring-white/20 hover:-translate-y-0.5 ${isDragOver ? 'ring-2 ring-[#066DF7] scale-[1.02]' : ''} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
  >
    <div className="aspect-square bg-black/30 overflow-hidden">
      {el.thumbnail || el.full_image ? (
        <img src={el.thumbnail || el.full_image} alt={el.name} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#7E88B7]"><Sparkles className="w-8 h-8" /></div>
      )}
    </div>
    <div className="p-3.5">
      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.18em] mb-1.5 border"
        style={{ color: catColor(el.category), borderColor: `${catColor(el.category)}55`, background: `${catColor(el.category)}15` }}>
        {catLabel(el.category)}
      </span>
      <h4 className="text-sm font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{el.name}</h4>
    </div>
  </button>
);

const Design = () => {
  const { token, isAuthed } = useAuth();
  const { setCharacter } = useCharacter();
  const [data, setData] = useState({ elements: [], canvas_url: null });
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // active element
  const [editing, setEditing] = useState(null); // 'new' | element | null
  const [pendingPos, setPendingPos] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [hotspotDragId, setHotspotDragId] = useState(null);
  const [canvasEditOpen, setCanvasEditOpen] = useState(false);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchDesign();
      setData(d);
    } catch { toast.error('Failed to load design'); }
    finally { setLoading(false); setTimeout(() => setIsLoaded(true), 50); }
  };
  useEffect(() => { load(); }, []);

  const handleCanvasClick = (e) => {
    if (!adminMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPos({ x, y });
    setEditing('new');
  };

  const handleHotspotClick = (el) => {
    if (hotspotDragId) return; // suppress click after drag
    // Both public and admin: open detail pane (admin sees Edit/Delete actions in the pane)
    setActive((cur) => (cur?.id === el.id ? null : el));
  };

  const handleHotspotDragStart = (el) => (e) => {
    if (!adminMode) return;
    e.preventDefault();
    e.stopPropagation();
    setHotspotDragId(el.id);

    const rect = canvasRef.current.getBoundingClientRect();
    let lastX = el.position_x;
    let lastY = el.position_y;
    let moved = false;

    const point = (ev) => {
      const t = ev.touches ? ev.touches[0] : ev;
      return { x: t.clientX, y: t.clientY };
    };
    const onMove = (ev) => {
      const p = point(ev);
      const x = Math.max(0, Math.min(100, ((p.x - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((p.y - rect.top) / rect.height) * 100));
      lastX = x; lastY = y;
      moved = true;
      setData((d) => ({
        ...d,
        elements: d.elements.map((it) => it.id === el.id ? { ...it, position_x: x, position_y: y } : it),
      }));
    };
    const onUp = async () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      if (moved) {
        try {
          await updateDesignElement(token, el.id, { position_x: lastX, position_y: lastY });
          toast.success('Position saved');
        } catch { toast.error('Save position failed'); load(); }
      }
      // small delay to suppress click event
      setTimeout(() => setHotspotDragId(null), 50);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const handleHotspotDelete = async (el) => {
    if (!window.confirm(`Delete "${el.name}"?`)) return;
    try {
      await deleteDesignElement(token, el.id);
      toast.success('Deleted');
      setActive(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  const handleDragStart = (id) => () => setDragId(id);
  const handleDragOver = (id) => (e) => {
    if (!dragId || dragId === id) return;
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (id) => async (e) => {
    e.preventDefault();
    if (!dragId || dragId === id) { setDragId(null); setDragOverId(null); return; }
    const ids = data.elements.map((el) => el.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(id);
    if (from < 0 || to < 0) { setDragId(null); setDragOverId(null); return; }
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    // optimistic
    const reordered = ids.map((eid) => data.elements.find((el) => el.id === eid)).filter(Boolean);
    setData((d) => ({ ...d, elements: reordered }));
    setDragId(null); setDragOverId(null);
    try {
      await reorderDesignElements(token, ids);
      toast.success('Order saved');
    } catch { toast.error('Reorder failed'); load(); }
  };

  return (
    <div className="p-8 lg:p-12 pb-32" data-testid="design-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#066DF7]/10 border border-[#066DF7]/30 text-[#B1EDE8] text-[11px] uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-3 h-3" />Design Reference
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The Anatomy of Veri
          </h1>
          <p className="text-lg text-[#B1EDE8] tracking-wide">
            Click any glowing point to unfold the story behind it.
          </p>
        </div>
        {isAuthed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCanvasEditOpen(true)}
              data-testid="design-canvas-edit"
              title="Change main image"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] text-sm font-semibold hover:bg-white/10 transition-all"
            >
              <ImageIcon className="w-4 h-4" />Change image
            </button>
            <button
              onClick={() => setAdminMode((s) => !s)}
              data-testid="design-admin-toggle"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${adminMode ? 'bg-[#E1B04A]/15 text-[#E1B04A] border-[#E1B04A]/40 shadow-[0_0_16px_rgba(225,176,74,0.3)]' : 'bg-white/5 text-[#B1EDE8] border-white/10 hover:bg-white/10'}`}
            >
              <MousePointer2 className="w-4 h-4" />{adminMode ? 'Editing · click canvas to add' : 'Edit Mode'}
            </button>
            <button
              onClick={() => { setPendingPos({ x: 50, y: 50 }); setEditing('new'); }}
              data-testid="design-new-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)]"
            >
              <Plus className="w-4 h-4" />Add Element
            </button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className={`relative max-w-3xl mx-auto transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} data-testid="design-canvas-wrap">
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`relative aspect-[3/4] rounded-[35px] overflow-hidden glass-card ${adminMode ? 'cursor-crosshair' : ''}`}
          data-testid="design-canvas"
        >
          {data.canvas_url ? (
            <img src={data.canvas_url} alt={data.character_name || 'Veri'} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#7E88B7] text-sm italic">No reference image set on character profile yet.</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

          {data.elements.map((el) => (
            <Hotspot
              key={el.id}
              el={el}
              active={active?.id === el.id}
              isAdmin={adminMode}
              isDragging={hotspotDragId === el.id}
              onClick={(e) => { e.stopPropagation(); handleHotspotClick(el); }}
              onDragStart={handleHotspotDragStart(el)}
            />
          ))}

          {data.elements.length === 0 && !loading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/65 backdrop-blur-md text-[11px] text-[#B1EDE8] border border-white/10 flex items-center gap-2 pointer-events-none">
              <ArrowRight className="w-3 h-3" />{isAuthed ? 'Click "Edit Mode" then click anywhere to drop your first hotspot' : 'No elements pinned yet.'}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
          {Object.entries(CATEGORY_META).map(([id, m]) => (
            <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border bg-white/5"
              style={{ color: m.color, borderColor: `${m.color}40` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />{m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {data.elements.length > 0 && (
        <div className="mt-12 max-w-5xl mx-auto" data-testid="design-cards">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#7E88B7]">All elements</h3>
            {isAuthed && adminMode && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E1B04A]" data-testid="design-reorder-hint">Drag cards to reorder</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.elements.map((el) => (
              <DesignCard
                key={el.id}
                el={el}
                onClick={() => handleHotspotClick(el)}
                draggable={isAuthed && adminMode}
                onDragStart={handleDragStart(el.id)}
                onDragOver={handleDragOver(el.id)}
                onDrop={handleDrop(el.id)}
                isDragOver={dragOverId === el.id}
              />
            ))}
          </div>
        </div>
      )}

      <DetailPane
        el={active}
        onClose={() => setActive(null)}
        isAdmin={isAuthed}
        onEdit={(el) => { setActive(null); setEditing(el); }}
        onDelete={handleHotspotDelete}
      />

      {editing && (
        <DesignElementModal
          token={token}
          initial={editing === 'new' ? null : editing}
          position={pendingPos}
          onClose={() => { setEditing(null); setPendingPos(null); }}
          onSaved={() => { setEditing(null); setPendingPos(null); load(); }}
          onDeleted={() => { setEditing(null); setActive(null); load(); }}
        />
      )}

      {canvasEditOpen && (
        <CanvasEditModal
          token={token}
          current={data.canvas_url}
          onClose={() => setCanvasEditOpen(false)}
          onSaved={(newUrl) => {
            setCanvasEditOpen(false);
            setCharacter((c) => c ? { ...c, fullBody: newUrl } : c);
            load();
          }}
        />
      )}
    </div>
  );
};

const CanvasEditModal = ({ token, current, onClose, onSaved }) => {
  const [url, setUrl] = useState(current || '');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!url) { toast.error('Please choose or paste an image'); return; }
    setSaving(true);
    try {
      await updateDesignCanvas(token, url);
      toast.success('Main image updated');
      onSaved(url);
    } catch (e) { toast.error(e.message || 'Update failed'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-[28px] w-full max-w-md p-7 max-h-[92vh] overflow-y-auto custom-scrollbar"
        data-testid="canvas-edit-modal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
              Change main image
            </h3>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7E88B7] mt-0.5">Replaces the canvas on this page + sidebar</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B1EDE8]"><X className="w-4 h-4" /></button>
        </div>
        <ImagePicker label="Main character image" value={url} onChange={setUrl} aspect="3/4" testPrefix="canvas-img" />
        <div className="flex items-center justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[#B1EDE8] hover:bg-white/10">Cancel</button>
          <button type="button" onClick={submit} disabled={saving} data-testid="canvas-save-btn"
            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Design;
