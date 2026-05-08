import React, { useState, useEffect, useCallback } from 'react';
import { Music, Heart, X, Sparkles, ScrollText, User, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, RotateCcw, Edit3 } from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { useAuth } from '../context/AuthContext';
import ProfileEditModal from '../components/ProfileEditModal';
import '../styles/theme.css';

// Lore parts — drop additional image URLs here as they are produced.
const LORE_PARTS = [
  {
    id: 'part-1',
    label: 'Part I',
    title: 'Legend of the Fallen Tenko',
    image: 'https://customer-assets.emergentagent.com/job_a42feb3f-56ce-4ffd-8b00-356ad4cf2ce7/artifacts/suaaqdui_Lore%20pt.I.png',
  },
  { id: 'part-2', label: 'Part II', title: 'Coming Soon', image: null },
  { id: 'part-3', label: 'Part III', title: 'Coming Soon', image: null },
];

const TABS = [
  { id: 'lore', label: 'Lore', icon: ScrollText },
  { id: 'profile', label: 'Profile', icon: User },
];

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('lore');
  const [loreIndex, setLoreIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const { character, loading, setCharacter } = useCharacter();
  const { token, isAuthed } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const currentLore = LORE_PARTS[loreIndex];
  const goPrev = useCallback(() => setLoreIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setLoreIndex((i) => Math.min(LORE_PARTS.length - 1, i + 1)), []);

  // Lightbox keyboard controls
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, z + 0.25));
      else if (e.key === '-') setZoom((z) => Math.max(0.5, z - 0.25));
      else if (e.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', onKey);
    // lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, goPrev, goNext]);

  // Reset zoom when switching parts or closing
  useEffect(() => { setZoom(1); }, [loreIndex, lightbox]);

  const openLightbox = () => { if (currentLore.image) setLightbox(true); };

  if (loading || !character) return null;

  return (
    <div className="p-8 lg:p-12 pb-32">
      {/* Header Area */}
      <div className={`mb-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {character.name}
        </h1>
        <p className="text-xl text-[#B1EDE8] tracking-wide">{character.tagline}</p>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 mb-8 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} data-testid="dashboard-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                active
                  ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white border-transparent shadow-[0_0_20px_rgba(6,109,247,0.35)]'
                  : 'bg-white/5 text-[#B1EDE8] border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em' }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* LORE TAB */}
      {activeTab === 'lore' && (
        <div
          className={`max-w-4xl glass-card rounded-[35px] overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          data-testid="lore-panel"
        >
          {/* Header row with part pagination */}
          <div className="flex items-center justify-between gap-4 px-8 pt-7 pb-5 border-b border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                <ScrollText className="w-5 h-5 text-[#066DF7]" />
              </div>
              <div className="min-w-0">
                <h3
                  className="text-xl font-bold leading-tight truncate"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}
                  data-testid="lore-title"
                >
                  {currentLore.title}
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#7E88B7] mt-1">Lore · {currentLore.label}</p>
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={goPrev}
                disabled={loreIndex === 0}
                data-testid="lore-prev-btn"
                className="p-2 rounded-full border border-white/10 bg-white/5 text-[#B1EDE8] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous part"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {LORE_PARTS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setLoreIndex(idx)}
                  data-testid={`lore-dot-${idx}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === loreIndex ? 'bg-[#066DF7] shadow-[0_0_10px_rgba(6,109,247,0.6)] scale-125' : 'bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to ${p.label}`}
                />
              ))}
              <button
                onClick={goNext}
                disabled={loreIndex === LORE_PARTS.length - 1}
                data-testid="lore-next-btn"
                className="p-2 rounded-full border border-white/10 bg-white/5 text-[#B1EDE8] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next part"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lore content — image is the sole focus */}
          <div
            className="overflow-y-auto custom-scrollbar px-5 py-5"
            style={{ maxHeight: '75vh' }}
            data-testid="lore-scroll-container"
          >
            {currentLore.image ? (
              <button
                type="button"
                onClick={openLightbox}
                className="group relative block w-full cursor-zoom-in rounded-[22px] overflow-hidden ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-[#066DF7]"
                data-testid="lore-image-btn"
                aria-label="Open fullscreen"
              >
                <img
                  key={currentLore.id}
                  src={currentLore.image}
                  alt={currentLore.title}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.015]"
                  loading="lazy"
                  data-testid="lore-image"
                />
                <span className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm text-[10px] uppercase tracking-[0.2em] text-[#E1DBC2] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />Fullscreen
                </span>
              </button>
            ) : (
              <div
                className="w-full h-[50vh] flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] gap-3"
                data-testid="lore-placeholder"
              >
                <ScrollText className="w-10 h-10 text-[#7E88B7]" />
                <p className="text-[#E1DBC2] text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {currentLore.label} — Coming Soon
                </p>
                <p className="text-[#7E88B7] text-sm">This chapter of Veri's story is still being written.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl auto-rows-min transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          data-testid="profile-panel"
        >
          {isAuthed && (
            <div className="md:col-span-4 flex items-center justify-end -mb-2">
              <button
                onClick={() => setEditOpen(true)}
                data-testid="profile-edit-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] text-xs font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />Edit profile
              </button>
            </div>
          )}
          {/* Color Palette Card - 2x1 */}
          <div className="md:col-span-2 md:row-span-1 glass-card p-8 rounded-[35px] h-full flex flex-col justify-center" data-testid="palette-card">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Color Palette</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {character.colorPalette?.slice(0, 4).map((color, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/20 shadow-inner" style={{ background: color.hex }} />
                  <span className="text-[10px] font-medium text-[#7E88B7] text-center">{color.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Song Card - 1x1 */}
          <div
            className="md:col-span-1 md:row-span-1 glass-card p-6 rounded-[35px] h-full flex flex-col justify-center items-center text-center"
            style={{ background: 'linear-gradient(145deg, rgba(6, 109, 247, 0.1), rgba(48, 134, 174, 0.05))' }}
            data-testid="theme-song-card"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,109,247,0.3)] animate-pulse" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
              <Music className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: '#E1DBC2' }}>Theme Song</h3>
            <p className="text-sm text-[#B1EDE8]">{character.themeSongTitle}</p>
          </div>

          {/* Likes & Dislikes Card - 1x2 */}
          <div className="md:col-span-1 md:row-span-2 glass-card p-6 rounded-[35px] h-full flex flex-col gap-6" data-testid="likes-dislikes-card">
            <div className="flex-1">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#E1DBC2' }}>
                <Heart className="w-4 h-4 text-[#B1EDE8]" /> Likes
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.likes?.slice(0, 3).map((like, index) => (
                  <span key={index} className="px-2 py-1 text-[10px] rounded-full bg-[#B1EDE8]/10 text-[#B1EDE8] border border-[#B1EDE8]/20">{like}</span>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#E1DBC2' }}>
                <X className="w-4 h-4 text-[#600612]" /> Dislikes
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.dislikes?.slice(0, 3).map((dislike, index) => (
                  <span key={index} className="px-2 py-1 text-[10px] rounded-full bg-[#600612]/20 text-[#ff8095] border border-[#600612]/30">{dislike}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills & Abilities Card - 2x1 */}
          <div className="md:col-span-2 md:row-span-1 glass-card p-8 rounded-[35px] h-full flex flex-col justify-center" data-testid="skills-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
              <Sparkles className="w-5 h-5 text-[#066DF7]" />
              Core Abilities
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {character.skills?.slice(0, 4).map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#E1DBC2] font-medium">{skill.name}</span>
                    <span className="text-[#066DF7]">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${skill.level}%`, background: 'linear-gradient(90deg, #066DF7 0%, #3086AE 100%)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motifs Card - 1x1 */}
          <div className="md:col-span-1 md:row-span-1 glass-card p-6 rounded-[35px] h-full flex flex-col justify-center" data-testid="motifs-card">
            <h3 className="text-base font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Motifs</h3>
            <div className="flex flex-wrap gap-2">
              {character.designMotifs?.slice(0, 3).map((motif, index) => (
                <span key={index} className="px-3 py-1.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10">
                  {motif}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Lightbox ---------- */}
      {lightbox && currentLore.image && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightbox(false)}
          data-testid="lore-lightbox"
        >
          {/* Top bar */}
          <div
            className="absolute top-0 inset-x-0 flex items-center justify-between gap-3 px-5 lg:px-8 py-4 pointer-events-none z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-auto min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#7E88B7] mb-0.5">Lore · {currentLore.label}</p>
              <h3 className="text-lg font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                {currentLore.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                data-testid="lightbox-zoom-out"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#B1EDE8] transition-all"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 text-xs tabular-nums text-[#E1DBC2] bg-white/5 border border-white/10 rounded-full" data-testid="lightbox-zoom-level">
                {Math.round(zoom * 100)}%
              </div>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                data-testid="lightbox-zoom-in"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#B1EDE8] transition-all"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                data-testid="lightbox-zoom-reset"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#B1EDE8] transition-all"
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                data-testid="lightbox-close"
                className="ml-2 p-2.5 rounded-full bg-white/5 hover:bg-[#600612]/30 border border-white/10 hover:border-[#600612]/40 text-[#E1DBC2] transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prev arrow */}
          {loreIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              data-testid="lightbox-prev"
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#E1DBC2] backdrop-blur-md transition-all z-20"
              aria-label="Previous part"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {/* Next arrow */}
          {loreIndex < LORE_PARTS.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              data-testid="lightbox-next"
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#E1DBC2] backdrop-blur-md transition-all z-20"
              aria-label="Next part"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scroll + zoom container */}
          <div
            className="relative w-full h-full overflow-auto custom-scrollbar flex items-start justify-center py-20 px-6 z-0"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setZoom((z) => Math.max(0.5, Math.min(4, z + (e.deltaY < 0 ? 0.1 : -0.1))));
              }
            }}
          >
            <img
              src={currentLore.image}
              alt={currentLore.title}
              className="rounded-[18px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/10 select-none"
              style={{
                maxWidth: zoom === 1 ? 'min(95vw, 1100px)' : 'none',
                width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
                transition: 'width 200ms ease',
              }}
              draggable={false}
              data-testid="lightbox-image"
            />
          </div>

          {/* Bottom hint */}
          <div
            className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 rounded-full bg-black/55 border border-white/10 backdrop-blur-md text-[11px] text-[#7E88B7] pointer-events-auto flex items-center gap-3">
              <span>Esc to close</span>
              <span className="w-px h-3 bg-white/10" />
              <span>← → switch parts</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Ctrl + wheel to zoom</span>
            </div>
          </div>
        </div>
      )}

      {editOpen && character && (
        <ProfileEditModal
          token={token}
          character={character}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setCharacter((c) => c ? { ...c, ...updated } : updated);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
