import React, { useState, useEffect } from 'react';
import { Music, Heart, X, Sparkles, ScrollText, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
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
  const { character, loading } = useCharacter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (loading || !character) return null;

  const currentLore = LORE_PARTS[loreIndex];
  const goPrev = () => setLoreIndex((i) => Math.max(0, i - 1));
  const goNext = () => setLoreIndex((i) => Math.min(LORE_PARTS.length - 1, i + 1));

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
              <img
                key={currentLore.id}
                src={currentLore.image}
                alt={currentLore.title}
                className="w-full h-auto rounded-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
                loading="lazy"
                data-testid="lore-image"
              />
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
    </div>
  );
};

export default Dashboard;
