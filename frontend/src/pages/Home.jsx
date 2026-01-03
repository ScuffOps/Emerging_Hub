import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Palette, Image, Library, Lock, User } from 'lucide-react';
import { navigationCards } from '../mock';
import '../styles/theme.css';

const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const iconMap = {
    Book: Book,
    Palette: Palette,
    Image: Image,
    Library: Library,
    Lock: Lock,
    User: User
  };

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#171718] via-[#263542] to-[#352D39]" />
      
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#066DF7] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#600612] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6" style={{ backdropFilter: 'blur(20px)', background: 'rgba(23, 23, 24, 0.6)', borderBottom: '1px solid rgba(177, 237, 232, 0.1)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_a5642998-d1ff-4501-9f69-da4970bc345c/artifacts/76c60ckv_Tenko%20Head%20Doodle.png"
                alt="Veri"
                className="w-12 h-12 object-contain"
              />
              <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                VERI
              </h1>
            </div>
            <nav className="flex gap-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-[#B1EDE8] hover:text-white transition-colors duration-200 font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/gallery')}
                className="text-[#B1EDE8] hover:text-white transition-colors duration-200 font-medium"
              >
                Gallery
              </button>
            </nav>
          </div>
        </header>

        {/* Main section with cards */}
        <main className="flex-1 flex items-center justify-center px-8 pt-32 pb-16">
          <div className="max-w-7xl w-full">
            {/* Hero text */}
            <div className={`text-center mb-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-6xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                Character Portfolio
              </h2>
              <p className="text-xl text-[#7E88B7] font-light">
                Explore the world of Veri through different sections
              </p>
            </div>

            {/* Navigation cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {navigationCards.map((card, index) => {
                const Icon = iconMap[card.icon];
                return (
                  <div
                    key={card.id}
                    className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div
                      onClick={() => handleCardClick(card.route)}
                      onMouseEnter={() => setHoveredCard(card.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="glass-card p-8 cursor-pointer group relative overflow-hidden h-full"
                      style={{
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: hoveredCard === card.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'
                      }}
                    >
                      {/* Gradient background on hover */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-400`}
                      />

                      {/* Card content */}
                      <div className="relative z-10">
                        <div className="mb-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${card.gradient.includes('263542') ? '#263542' : '#066DF7'}, ${card.gradient.includes('600612') ? '#600612' : '#3086AE'})` }}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2 text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {card.title}
                        </h3>
                        <p className="text-[#7E88B7] font-light">
                          {card.description}
                        </p>

                        {/* Arrow indicator */}
                        <div className={`mt-6 transform transition-transform duration-300 ${hoveredCard === card.id ? 'translate-x-2' : 'translate-x-0'}`}>
                          <span className="text-[#B1EDE8] text-sm font-medium">Explore →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-8 text-[#7E88B7] text-sm">
          <p>© 2024 Veri Character Portfolio • All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;