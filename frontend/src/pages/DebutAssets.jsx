import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { debutAssets } from '../mock';
import { Input } from '../components/ui/input';
import '../styles/theme.css';

const DebutAssets = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock password - in production, this would be stored securely in backend
  const DEBUT_PASSWORD = 'veri2024';

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === DEBUT_PASSWORD) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="relative z-10 w-full max-w-md">
          <div className={`glass-card p-10 rounded-[35px] transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-[30px] flex items-center justify-center shadow-[0_0_30px_rgba(96,6,18,0.5)] animate-pulse" style={{ background: 'linear-gradient(135deg, #600612 0%, #5C1E48 100%)' }}>
                <Lock className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-bold text-center mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
              Debut Assets
            </h2>
            <p className="text-center text-[#7E88B7] mb-8 font-medium">
              This section contains exclusive and sensitive content
            </p>

            <form onSubmit={handleUnlock} className="space-y-5">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 bg-black/40 border-[#600612]/50 text-[#E1DBC2] placeholder:text-[#7E88B7] focus:border-[#ff8095] focus:ring-[#ff8095] shadow-inner transition-colors"
                  style={{ borderRadius: '55px', height: '60px', paddingLeft: '24px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#7E88B7] hover:text-[#E1DBC2] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>

              {error && (
                <p className="text-sm font-semibold text-[#ff8095] text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 text-lg font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  borderRadius: '55px',
                  background: 'linear-gradient(135deg, #600612 0%, #5C1E48 100%)',
                  boxShadow: '0 8px 25px rgba(96, 6, 18, 0.4)'
                }}
              >
                Unlock Content
              </button>
            </form>

            <div className="mt-8 p-5 rounded-[25px] border border-[#600612]/30 bg-[#600612]/10 shadow-inner">
              <p className="text-sm text-[#7E88B7] text-center">
                Demo password: <span className="text-[#E1DBC2] font-mono font-bold tracking-widest">veri2024</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 pb-32">
      <div className="flex items-center justify-between mb-10">
        <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text flex items-center gap-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Lock className="w-10 h-10 text-[#5C1E48]" />
            Debut Assets
          </h1>
          <p className="text-xl text-[#B1EDE8] tracking-wide">Exclusive unreleased content</p>
        </div>
        <button
          onClick={() => setIsUnlocked(false)}
          className="flex items-center gap-2 px-6 py-3 font-semibold text-[#7E88B7] border border-white/10 hover:border-white/30 rounded-[55px] bg-black/20 hover:bg-white/10 transition-all shadow-inner"
        >
          <Lock className="w-4 h-4" />
          Lock Vault
        </button>
      </div>

      <div className={`glass-card p-8 mb-10 rounded-[35px] border-[#600612]/50 bg-gradient-to-br from-black/40 to-[#600612]/10 shadow-inner transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-3xl shrink-0" style={{ background: 'linear-gradient(135deg, #600612 0%, #5C1E48 100%)', boxShadow: '0 0 20px rgba(96,6,18,0.4)' }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#E1DBC2] mb-2">Restricted Access</h3>
            <p className="text-base text-[#7E88B7] leading-relaxed">
              This section contains unreleased and highly sensitive assets. Do not share or distribute.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
        {debutAssets.map((asset, index) => (
          <div
            key={asset.id}
            className={`glass-card rounded-[35px] overflow-hidden group transition-all duration-500 delay-[${index * 100}ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={asset.thumbnail}
                alt={asset.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 right-6">
                <span className="chip shadow-lg bg-[#600612]/80 text-white border-[#ff8095]/50 backdrop-blur-md flex items-center gap-2 px-4 py-2 font-bold tracking-wide">
                  <Lock className="w-4 h-4" />
                  CONFIDENTIAL
                </span>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3 text-[#E1DBC2]">
                {asset.title}
              </h3>
              <p className="text-base text-[#7E88B7] mb-6 leading-relaxed">
                {asset.description}
              </p>
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-[20px] border border-white/5 shadow-inner">
                <span className="chip bg-white/10 text-white border-white/20 font-medium px-4 py-1.5">{asset.category}</span>
                <span className="text-sm font-semibold text-[#7E88B7]">{asset.uploadDate}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {asset.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-3 py-1.5 rounded-full font-medium" style={{ background: 'rgba(96, 6, 18, 0.2)', color: '#ff8095', border: '1px solid rgba(96, 6, 18, 0.4)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebutAssets;
