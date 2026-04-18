import React, { useState, useEffect } from 'react';
import { Music, Heart, X, Sparkles, Quote } from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import '../styles/theme.css';

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { character, loading } = useCharacter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (loading || !character) return null;

  return (
    <div className="p-8 lg:p-12 pb-32">
      {/* Header Area */}
      <div className={`mb-10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {character.name}
        </h1>
        <p className="text-xl text-[#B1EDE8] tracking-wide">{character.tagline}</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl auto-rows-min">
        
        {/* Lore Card - 2x2 */}
        <div className={`md:col-span-2 md:row-span-2 glass-card p-8 rounded-[35px] h-full flex flex-col transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-start gap-4 h-full">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
              <Quote className="w-6 h-6 text-[#066DF7]" />
            </div>
            <div className="flex flex-col justify-center h-full">
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>The Origin</h3>
              <p className="text-[#7E88B7] leading-relaxed mb-4 text-sm xl:text-base">{character.lore.origin}</p>
              <p className="text-[#7E88B7] leading-relaxed text-sm xl:text-base">{character.lore.backstory}</p>
            </div>
          </div>
        </div>

        {/* Color Palette Card - 2x1 */}
        <div className={`md:col-span-2 md:row-span-1 glass-card p-8 rounded-[35px] h-full flex flex-col justify-center transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
        <div className={`md:col-span-1 md:row-span-1 glass-card p-6 rounded-[35px] h-full flex flex-col justify-center items-center text-center transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ background: 'linear-gradient(145deg, rgba(6, 109, 247, 0.1), rgba(48, 134, 174, 0.05))' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,109,247,0.3)] animate-pulse" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
            <Music className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-base mb-1" style={{ color: '#E1DBC2' }}>Theme Song</h3>
          <p className="text-sm text-[#B1EDE8]">{character.themeSongTitle}</p>
        </div>

        {/* Likes & Dislikes Card - 1x2 */}
        <div className={`md:col-span-1 md:row-span-2 glass-card p-6 rounded-[35px] h-full flex flex-col gap-6 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
        <div className={`md:col-span-2 md:row-span-1 glass-card p-8 rounded-[35px] h-full flex flex-col justify-center transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
        <div className={`md:col-span-1 md:row-span-1 glass-card p-6 rounded-[35px] h-full flex flex-col justify-center transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
    </div>
  );
};

export default Dashboard;
