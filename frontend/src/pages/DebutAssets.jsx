import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { debutAssets } from '../mock';
import { Input } from '../components/ui/input';
import '../styles/theme.css';

const DebutAssets = () => {
  const navigate = useNavigate();
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
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#171718] via-[#263542] to-[#352D39]" />
        
        {/* Animated background */}
        <div className="fixed inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#600612] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5C1E48] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Lock screen content */}
        <div className="relative z-10 w-full max-w-md px-8">
          <div className={`glass-card p-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Lock icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #600612 0%, #5C1E48 100%)' }}>
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
              Debut Assets
            </h2>
            <p className="text-center text-[#7E88B7] mb-6">
              This section contains exclusive and sensitive content
            </p>

            {/* Password form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 bg-transparent border-[#600612]/50 text-[#E1DBC2] placeholder:text-[#7E88B7] focus:border-[#600612]"
                  style={{ borderRadius: '55px', height: '52px', paddingLeft: '20px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7E88B7] hover:text-[#E1DBC2] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 font-semibold text-white transition-all"
                style={{
                  borderRadius: '55px',
                  background: 'linear-gradient(135deg, #600612 0%, #5C1E48 100%)',
                }}
              >
                Unlock
              </button>
            </form>

            {/* Back button */}
            <button 
              onClick={() => navigate('/home')}
              className="w-full mt-4 text-[#7E88B7] hover:text-[#E1DBC2] transition-colors text-sm"
            >
              Back to Home
            </button>

            {/* Hint for demo */}
            <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(96, 6, 18, 0.1)', border: '1px solid rgba(96, 6, 18, 0.3)' }}>
              <p className="text-xs text-[#7E88B7] text-center">
                Demo password: <span className="text-[#E1DBC2] font-mono">veri2024</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#171718] via-[#263542] to-[#352D39]" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6" style={{ backdropFilter: 'blur(20px)', background: 'rgba(23, 23, 24, 0.6)', borderBottom: '1px solid rgba(177, 237, 232, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-[#B1EDE8] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Lock className="w-6 h-6" />
            Debut Assets
          </h1>
          <button
            onClick={() => setIsUnlocked(false)}
            className="text-[#7E88B7] hover:text-[#E1DBC2] transition-colors text-sm"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Warning banner */}
          <div className="glass-card p-6 mb-8 border-[#600612]/50 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ background: 'linear-gradient(135deg, #600612 0%, #5C1E48 100%)' }}>
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E1DBC2] mb-1">Exclusive Content</h3>
                <p className="text-sm text-[#7E88B7]">
                  This section contains unreleased and sensitive assets. Please handle with care.
                </p>
              </div>
            </div>
          </div>

          {/* Assets grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debutAssets.map((asset, index) => (
              <div
                key={asset.id}
                className="glass-card overflow-hidden group transition-all duration-500 animate-fade-in-up"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={asset.thumbnail}
                    alt={asset.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Exclusive badge */}
                  <div className="absolute top-4 right-4">
                    <span className="chip chip-danger flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Exclusive
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 text-[#E1DBC2]">
                    {asset.title}
                  </h3>
                  <p className="text-sm text-[#7E88B7] mb-3">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="chip chip-primary text-xs">{asset.category}</span>
                    <span className="text-xs text-[#7E88B7]">{asset.uploadDate}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {asset.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(96, 6, 18, 0.15)', color: '#7E88B7' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DebutAssets;