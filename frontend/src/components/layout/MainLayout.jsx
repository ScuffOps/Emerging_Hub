import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Image as ImageIcon, 
  Library, 
  Lock,
  Palette,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  Heart
} from 'lucide-react';
import { useCharacter } from '../../context/CharacterContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useTwitchLive } from '../TwitchWidget';
import AuthPill from '../AuthPill';
import AdminSettingsPanel from '../AdminSettingsPanel';
import '../../styles/theme.css';

const TWITCH_CHANNEL = 'veri';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const { character, loading, error } = useCharacter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);
  const { live: isLive, uptime } = useTwitchLive(TWITCH_CHANNEL);
  const { isAuthed } = useAuth();
  const { settings } = useSiteSettings();

  const DEFAULT_BG = "https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/cj8cuhxa_Discord_BG.png";
  const backgroundImage = settings.background_url || DEFAULT_BG;
  const sidebarCharacterImage = settings.sidebar_character_url || character?.fullBody;

  if (loading) {
    return <div className="flex h-screen bg-[#171718] items-center justify-center text-white">Loading...</div>;
  }
  if (error) {
    return <div className="flex h-screen bg-[#171718] items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-[#171718] text-white overflow-hidden font-sans relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000" style={{ backgroundImage: `url('${backgroundImage}')` }} />
      <div className="fixed inset-0 z-0 bg-black/20 mix-blend-multiply pointer-events-none" />

      {/* Subtle Particle Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 mix-blend-screen">
        <video
          src="https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/vqco9jvi_DustFalling1.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Sidebar Nav */}
      <nav className="relative z-50 w-20 lg:w-24 flex flex-col items-center py-10 border-r border-white/5 gap-6 shrink-0 transition-all duration-300" style={{ background: 'rgba(23, 23, 24, 0.4)', backdropFilter: 'blur(20px)' }}>
        {/* Live indicator at top */}
        <a
          href={`https://www.twitch.tv/${TWITCH_CHANNEL}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="sidebar-live-pulse"
          title={isLive ? `Live now${uptime ? ' · ' + uptime : ''}` : 'Currently offline'}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full border transition-all ${
            isLive
              ? 'bg-[#ff0033]/15 border-[#ff0033]/50 shadow-[0_0_20px_rgba(255,0,51,0.45)]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          {isLive && (
            <span className="absolute inset-0 rounded-full bg-[#ff0033]/30 animate-ping" />
          )}
          <span className="relative text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: isLive ? '#ff8095' : '#7E88B7' }}>
            {isLive ? 'LIVE' : 'OFF'}
          </span>
        </a>
        <button onClick={() => navigate('/home')} className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/home') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#B1EDE8]'}`}>
          <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => navigate('/dashboard')} className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/dashboard') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => navigate('/design')} data-testid="nav-design" className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/design') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => navigate('/gallery')} className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/gallery') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        {isAuthed && (
        <button onClick={() => navigate('/brand')} className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/brand') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <Library className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        )}
        {isAuthed && (
        <button onClick={() => navigate('/commissions')} data-testid="nav-commissions" className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/commissions') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <Palette className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        )}
        <button onClick={() => navigate('/credits')} data-testid="nav-credits" className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/credits') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <HeartHandshake className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => navigate('/fanart')} data-testid="nav-fanart" className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/fanart') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => navigate('/merch')} data-testid="nav-merch" className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/merch') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
          <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <div className="mt-auto">
          <button onClick={() => navigate('/debut')} className={`group relative p-3 rounded-full transition-all duration-300 ${isActive('/debut') ? 'bg-gradient-to-br from-[#066DF7] to-[#3086AE] text-white shadow-[0_0_20px_rgba(6,109,247,0.4)]' : 'hover:bg-white/10 text-[#7E88B7]'}`}>
            <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Main Scrollable Content */}
      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </main>

      {/* Floating Auth Pill (top-right, persistent) */}
      <AuthPill />
      {/* Admin Settings Panel (gear button beside the pill, admin-only) */}
      <AdminSettingsPanel />

      {/* Pinned Character Art (Right Side) */}
      {/* Hidden on small screens, fixed on the right on larger screens */}
      {/* Suppressed on /design where the in-page canvas already shows the full body */}
      {!isActive('/design') && (
      <aside className={`relative z-20 hidden lg:flex flex-col justify-end w-[35%] xl:w-[40%] h-full pointer-events-none transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
        {/* Glow effect behind the character */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#066DF7] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" />
        
        {/* Character Full Body Render */}
        {sidebarCharacterImage && (
          <img 
            src={sidebarCharacterImage} 
            alt={`${character?.name || 'Veri'} Full Body`}
            className="w-full h-auto object-contain max-h-[95vh] drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            style={{ 
              maskImage: 'linear-gradient(to top, transparent 0%, black 10%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 10%, black 100%)' 
            }}
          />
        )}
      </aside>
      )}
    </div>
  );
};

export default MainLayout;
