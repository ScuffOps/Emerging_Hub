import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import '../styles/theme.css';

const Landing = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEntrance, setShowEntrance] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleEnter = () => {
    setShowEntrance(false);
    setTimeout(() => {
      navigate('/home');
    }, 600);
  };

  if (showEntrance) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background gradient with animated overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#171718] via-[#263542] to-[#600612]" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#066DF7] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#6D435A] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3086AE] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main entrance content */}
        <div className={`relative z-10 text-center transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Character Logo */}
          <div className="mb-8 animate-float">
            <img 
              src="https://customer-assets.emergentagent.com/job_a5642998-d1ff-4501-9f69-da4970bc345c/artifacts/76c60ckv_Tenko%20Head%20Doodle.png"
              alt="Veri Logo"
              className="w-48 h-48 mx-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Welcome text */}
          <h1 className="text-7xl font-bold mb-4 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            VERI
          </h1>
          <p className="text-xl text-[#B1EDE8] mb-12 font-light tracking-wide">
            Digital Kitsune Spirit • Character Portfolio
          </p>

          {/* Enter button with interactive effect */}
          <button
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-3 px-12 py-5 text-lg font-semibold overflow-hidden"
            style={{
              borderRadius: '55px',
              background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 30px rgba(6, 109, 247, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(6, 109, 247, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(6, 109, 247, 0.4)';
            }}
          >
            <Sparkles className="w-5 h-5" />
            <span>Enter Portfolio</span>
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-[#B1EDE8] opacity-60" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Landing;