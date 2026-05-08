import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import '../styles/theme.css';

const Landing = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEntrance, setShowEntrance] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20, // -10 to 10 range
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleEnter = () => {
    setShowEntrance(false);
    setTimeout(() => {
      navigate('/home');
    }, 800);
  };

  if (!showEntrance) return null;

  return (
    <div className={`min-h-[150vh] relative overflow-hidden transition-opacity duration-700 ${showEntrance ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- PARALLAX LAYERS --- */}
      
      {/* Layer 1: Background Forest (Slowest) */}
      <div 
        className="fixed inset-0 w-full h-[120vh] bg-cover bg-center -top-[10vh]"
        style={{ 
          backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/o939fyg6_wp7170402.jpg')",
          transform: `translateY(${scrollY * 0.1}px) translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          zIndex: 1
        }} 
      />

      {/* Layer 2: Grass */}
      <div 
        className="fixed inset-0 w-full h-[120vh] bg-cover bg-center -top-[10vh]"
        style={{ 
          backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/jehhejlh_scene%20layer%20-%20grass.png')",
          transform: `translateY(${scrollY * 0.25}px) translate(${mousePos.x * 1}px, ${mousePos.y * 1}px)`,
          zIndex: 2
        }} 
      />

      {/* Layer 3: Stone Walls */}
      <div 
        className="fixed inset-0 w-full h-[120vh] bg-cover bg-center -top-[10vh]"
        style={{ 
          backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/hgchkz89_scene%20layer%20-%20wall.png')",
          transform: `translateY(${scrollY * 0.4}px) translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
          zIndex: 3
        }} 
      />

      {/* Layer 4: Front Grass */}
      <div 
        className="fixed inset-0 w-full h-[120vh] bg-cover bg-center -top-[10vh]"
        style={{ 
          backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/m82w4m14_scene%20layer%20-%20front%20grass.png')",
          transform: `translateY(${scrollY * 0.6}px) translate(${mousePos.x * 2.5}px, ${mousePos.y * 2.5}px)`,
          zIndex: 4
        }} 
      />

      {/* Layer 5: Front Altar */}
      <div 
        className="fixed inset-0 w-full h-[120vh] bg-cover bg-center -top-[10vh]"
        style={{ 
          backgroundImage: "url('https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/cn4b699w_scene%20layer%20-%20altar.png')",
          transform: `translateY(${scrollY * 0.8}px) translate(${mousePos.x * 3.5}px, ${mousePos.y * 3.5}px)`,
          zIndex: 5
        }} 
      />

      {/* Particle Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-80 mix-blend-screen" style={{ zIndex: 6 }}>
        <video
          src="https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/vqco9jvi_DustFalling1.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* --- UI CONTENT OVERLAY --- */}
      <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        
        {/* Dark gradient overlay to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#171718]/90" />

        <div className={`relative flex flex-col items-center justify-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transform: `translateY(${scrollY * -0.5}px)` }}>
          
          <div className="mb-6 animate-float relative">
            <div className="absolute inset-0 bg-[#066DF7] rounded-full blur-[60px] opacity-40 animate-pulse" />
            <img 
              src="https://customer-assets.emergentagent.com/job_a5642998-d1ff-4501-9f69-da4970bc345c/artifacts/76c60ckv_Tenko%20Head%20Doodle.png"
              alt="Veri Logo"
              className="w-48 h-48 mx-auto object-contain drop-shadow-[0_0_30px_rgba(6,109,247,0.8)] relative z-10"
            />
          </div>

          <h1 className="text-8xl font-bold mb-4 tracking-wider text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            VERI
          </h1>
          
          <p className="text-2xl text-[#B1EDE8] mb-12 font-medium tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Digital Kitsune Spirit
          </p>

          <button
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-3 px-12 py-5 text-lg font-bold overflow-hidden pointer-events-auto shadow-[0_0_40px_rgba(6,109,247,0.5)] transition-all hover:scale-105"
            style={{
              borderRadius: '55px',
              background: 'rgba(23, 23, 24, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#066DF7]/50 to-[#3086AE]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="w-5 h-5 text-[#B1EDE8] relative z-10" />
            <span className="relative z-10 tracking-widest uppercase">Enter Realm</span>
            <Sparkles className="w-5 h-5 text-[#B1EDE8] relative z-10" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-12 transition-opacity duration-500 ${scrollY > 100 ? 'opacity-0' : 'opacity-60'}`}>
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-white text-sm font-medium tracking-widest uppercase mb-2">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;