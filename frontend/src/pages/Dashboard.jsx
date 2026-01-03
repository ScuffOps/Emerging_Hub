import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Heart, X, Sparkles } from 'lucide-react';
import { characterData } from '../mock';
import '../styles/theme.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'lore', label: 'Lore & Story' },
    { id: 'design', label: 'Design Details' },
    { id: 'skills', label: 'Skills & Traits' }
  ];

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
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Character Dashboard
          </h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Character header card */}
          <div className={`glass-card p-8 mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-start gap-8">
              <img 
                src={characterData.avatar}
                alt={characterData.name}
                className="w-32 h-32 object-contain rounded-3xl"
                style={{ background: 'rgba(6, 109, 247, 0.1)' }}
              />
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                  {characterData.name}
                </h2>
                <p className="text-xl text-[#B1EDE8] mb-4">{characterData.tagline}</p>
                <p className="text-[#7E88B7] leading-relaxed">{characterData.personality.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {characterData.personality.traits.map((trait, index) => (
                  <span key={index} className="chip chip-primary">{trait}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap`}
                style={{
                  borderRadius: '55px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' : 'transparent',
                  border: activeTab === tab.id ? 'none' : '2px solid rgba(6, 109, 247, 0.3)',
                  color: activeTab === tab.id ? 'white' : '#066DF7',
                  transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Color Palette */}
                <div className="glass-card p-6 animate-fade-in-up">
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {characterData.colorPalette.map((color, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl border-2 border-white/20"
                          style={{ background: color.hex }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#E1DBC2]">{color.name}</p>
                          <p className="text-xs text-[#7E88B7]">{color.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Song */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Theme Song
                  </h3>
                  <div className="flex items-center gap-4 p-4 rounded-3xl" style={{ background: 'rgba(6, 109, 247, 0.1)' }}>
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl" style={{ background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)' }}>
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#E1DBC2]">{characterData.themeSongTitle}</p>
                      <p className="text-sm text-[#7E88B7]">Character Theme</p>
                    </div>
                  </div>
                </div>

                {/* Likes */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    <Heart className="w-6 h-6 text-[#066DF7]" />
                    Likes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {characterData.likes.map((like, index) => (
                      <span key={index} className="chip chip-success">{like}</span>
                    ))}
                  </div>
                </div>

                {/* Dislikes */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    <X className="w-6 h-6 text-[#600612]" />
                    Dislikes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {characterData.dislikes.map((dislike, index) => (
                      <span key={index} className="chip chip-danger">{dislike}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lore' && (
              <div className="space-y-6">
                <div className="glass-card p-6 animate-fade-in-up">
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Origin Story
                  </h3>
                  <p className="text-[#7E88B7] leading-relaxed">{characterData.lore.origin}</p>
                </div>

                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Backstory
                  </h3>
                  <p className="text-[#7E88B7] leading-relaxed">{characterData.lore.backstory}</p>
                </div>

                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Current Goal
                  </h3>
                  <p className="text-[#7E88B7] leading-relaxed">{characterData.lore.currentGoal}</p>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Design Motifs */}
                <div className="glass-card p-6 animate-fade-in-up">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    <Sparkles className="w-6 h-6 text-[#066DF7]" />
                    Design Motifs
                  </h3>
                  <ul className="space-y-2">
                    {characterData.designMotifs.map((motif, index) => (
                      <li key={index} className="text-[#7E88B7] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#066DF7]" />
                        {motif}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Markings */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Markings & Tattoos
                  </h3>
                  <ul className="space-y-2">
                    {characterData.markings.map((marking, index) => (
                      <li key={index} className="text-[#7E88B7] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3086AE]" />
                        {marking}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Accessories */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Accessories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {characterData.accessories.map((accessory, index) => (
                      <span key={index} className="chip chip-primary">{accessory}</span>
                    ))}
                  </div>
                </div>

                {/* Alt Outfits */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Alternate Outfits
                  </h3>
                  <div className="space-y-3">
                    {characterData.altOutfits.map((outfit, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: 'rgba(6, 109, 247, 0.05)' }}>
                        <span className="text-[#E1DBC2] font-medium">{outfit.name}</span>
                        <span className="chip chip-success">{outfit.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                {/* Skills */}
                <div className="glass-card p-6 animate-fade-in-up">
                  <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Skills & Abilities
                  </h3>
                  <div className="space-y-4">
                    {characterData.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#E1DBC2] font-medium">{skill.name}</span>
                          <span className="text-[#066DF7] font-bold">{skill.level}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(6, 109, 247, 0.1)' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${skill.level}%`,
                              background: 'linear-gradient(90deg, #066DF7 0%, #3086AE 100%)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationships */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Relationships
                  </h3>
                  <div className="space-y-3">
                    {characterData.relationships.map((rel, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-3xl" style={{ background: 'rgba(6, 109, 247, 0.05)' }}>
                        <div>
                          <p className="text-[#E1DBC2] font-semibold">{rel.name}</p>
                          <p className="text-sm text-[#7E88B7]">{rel.type}</p>
                        </div>
                        <span className="chip chip-success">{rel.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pets */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                    Companions & Pets
                  </h3>
                  <div className="space-y-3">
                    {characterData.pets.map((pet, index) => (
                      <div key={index} className="p-4 rounded-3xl" style={{ background: 'rgba(6, 109, 247, 0.05)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[#E1DBC2] font-semibold">{pet.name}</p>
                          <span className="chip chip-primary">{pet.type}</span>
                        </div>
                        <p className="text-sm text-[#7E88B7]">{pet.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;