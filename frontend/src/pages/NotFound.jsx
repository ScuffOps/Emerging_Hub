import React, { useEffect, useState } from 'react';
import { Home as HomeIcon, ScrollText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 140);
    }, 2400);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-[#171718] text-white overflow-hidden" data-testid="not-found-page">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/cj8cuhxa_Discord_BG.png')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#171718]/60 to-[#171718]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className={`text-[140px] md:text-[200px] font-black leading-none gradient-text transition-all ${glitch ? 'translate-x-[2px] -translate-y-[1px] [text-shadow:_2px_0_#066DF7,_-2px_0_#600612]' : ''}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          404
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#600612]/20 border border-[#600612]/40 text-[#ff8095] text-[11px] uppercase tracking-[0.25em] mb-5">
          <Sparkles className="w-3 h-3" />Aether disturbance
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
          Even Veri can't find this page.
        </h2>
        <p className="text-[#7E88B7] max-w-md leading-relaxed mb-8">
          The Aether warped, the link snapped, and your destination drifted into the void.
          Don't worry — every Tenko gets lost sometimes. Let's get you home.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate('/')}
            data-testid="go-landing-btn"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,109,247,0.35)] hover:shadow-[0_0_30px_rgba(6,109,247,0.55)] transition-all"
          >
            <HomeIcon className="w-4 h-4" />Take me to the splash
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            data-testid="go-lore-btn"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] text-sm font-semibold hover:bg-white/10 transition-all"
          >
            <ScrollText className="w-4 h-4" />Read the lore
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
