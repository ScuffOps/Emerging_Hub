import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  Image as ImageIcon, 
  Library, 
  Lock, 
  Music, 
  Heart, 
  X, 
  Sparkles, 
  Quote 
} from 'lucide-react';
import { characterData } from '../mock';
import '../styles/theme.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex h-screen bg-[#171718] text-white overflow-hidden font-sans relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000" style={{ backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/cj8cuhxa_Discord_BG.png')" }} />
      <div className="fixed inset-0 z-0 bg-black/20 mix-blend-multiply pointer-events-none" />

      {/* Sidebar Nav (Option 2 - Immersive Vertical Sidebar) */}
      <nav className="relative z-50 w-20 lg:w-24 flex flex-col items-center py-10 border-r border-white/5 gap-8 shrink-0 transition-all duration-300" style={{ background: 'rgba(23, 23, 24, 0.4)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate('/home')} className="group relative p-3 rounded-full hover:bg-white/10 transition-all duration-300 text-[#B1EDE8]">
          <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button className="group relative p-3 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)] transition-all duration-300">
          <User className="w-6 h-6" />
        </button>
        <button onClick={() => navigate('/gallery')} className="group relative p-3 rounded-full hover:bg-white/10 transition-all duration-300 text-[#7E88B7]">
          <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => navigate('/brand')} className="group relative p-3 rounded-full hover:bg-white/10 transition-all duration-300 text-[#7E88B7]">
          <Library className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <div className="mt-auto">
          <button onClick={() => navigate('/debut')} className="group relative p-3 rounded-full hover:bg-white/10 transition-all duration-300 text-[#7E88B7]">
            <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Main Scrollable Content (Option 3 - Bento Grid) */}
      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 lg:p-12 pb-32">
          {/* Header Area */}
          <div className={`mb-10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {characterData.name}
            </h1>
            <p className="text-xl text-[#B1EDE8] tracking-wide">{characterData.tagline}</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-5xl">
            
            {/* Lore Card - Span 2 cols */}
            <div className={`col-span-1 md:col-span-2 glass-card p-8 rounded-[35px] transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Quote className="w-6 h-6 text-[#066DF7]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>The Origin</h3>
                  <p className="text-[#7E88B7] leading-relaxed mb-4">{characterData.lore.origin}</p>
                  <p className="text-[#7E88B7] leading-relaxed">{characterData.lore.backstory}</p>
                </div>
              </div>
            </div>

            {/* Theme Song Card */}
            <div className={`glass-card p-8 rounded-[35px] flex flex-col justify-center items-center text-center transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ background: 'linear-gradient(145deg, rgba(6, 109, 247, 0.1), rgba(48, 134, 174, 0.05))' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,109,247,0.3)] animate-pulse" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-1" style={{ color: '#E1DBC2' }}>Theme Song</h3>
              <p className="text-[#B1EDE8]">{characterData.themeSongTitle}</p>
            </div>

            {/* Color Palette Card */}
            <div className={`glass-card p-8 rounded-[35px] transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Color Palette</h3>
              <div className="grid grid-cols-2 gap-3">
                {characterData.colorPalette.map((color, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/20 shadow-inner" style={{ background: color.hex }} />
                    <span className="text-xs font-medium text-[#7E88B7] truncate">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Abilities Card */}
            <div className={`col-span-1 md:col-span-2 glass-card p-8 rounded-[35px] transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                <Sparkles className="w-5 h-5 text-[#066DF7]" />
                Core Abilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {characterData.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
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

            {/* Likes & Dislikes Card */}
            <div className={`col-span-1 md:col-span-1 glass-card p-8 rounded-[35px] flex flex-col gap-6 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#E1DBC2' }}>
                  <Heart className="w-4 h-4 text-[#B1EDE8]" /> Likes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {characterData.likes.slice(0, 4).map((like, index) => (
                    <span key={index} className="px-3 py-1 text-xs rounded-full bg-[#B1EDE8]/10 text-[#B1EDE8] border border-[#B1EDE8]/20">{like}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#E1DBC2' }}>
                  <X className="w-4 h-4 text-[#600612]" /> Dislikes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {characterData.dislikes.slice(0, 4).map((dislike, index) => (
                    <span key={index} className="px-3 py-1 text-xs rounded-full bg-[#600612]/20 text-[#ff8095] border border-[#600612]/30">{dislike}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Motifs Card */}
            <div className={`col-span-1 md:col-span-3 glass-card p-8 rounded-[35px] transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>Design Motifs & Details</h3>
              <div className="flex flex-wrap gap-3">
                {characterData.designMotifs.map((motif, index) => (
                  <span key={index} className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    {motif}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Pinned Character Art (Right Side) */}
      {/* Hidden on small screens, fixed on the right on larger screens */}
      <aside className={`relative z-20 hidden lg:flex flex-col justify-end w-[40%] xl:w-[45%] h-full pointer-events-none transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
        {/* Glow effect behind the character */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#066DF7] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" />
        
        {/* Character Full Body Render */}
        <img 
          src={characterData.fullBody} 
          alt={`${characterData.name} Full Body`}
          className="w-full h-auto object-contain max-h-[95vh] drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          style={{ 
            maskImage: 'linear-gradient(to top, transparent 0%, black 10%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 10%, black 100%)' 
          }}
        />
      </aside>
    </div>
  );
};

export default Dashboard;
