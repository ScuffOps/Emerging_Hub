import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Palette, Image, Library, Lock, User } from 'lucide-react';
import { navigationCards } from '../mock';
import TwitchWidget from '../components/TwitchWidget';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

const TWITCH_CHANNEL = 'veri';
// Routes that should only show for signed-in admins.
const ADMIN_ONLY_ROUTES = ['/brand', '/commissions'];

const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthed } = useAuth();

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

  const visibleCards = navigationCards.filter((c) => isAuthed || !ADMIN_ONLY_ROUTES.includes(c.route));

  return (
    <div className="flex-1 flex flex-col justify-center px-8 lg:px-12 py-20 min-h-screen">
      <div className="max-w-5xl w-full mx-auto">
        {/* Hero text */}
        <div className={`text-left mb-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-6xl lg:text-7xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            Character Portfolio
          </h2>
          <p className="text-xl lg:text-2xl text-[#B1EDE8] font-light max-w-2xl">
            Explore the world of Veri through different interactive sections. Select a module below to begin.
          </p>
        </div>

        {/* Navigation cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map((card, index) => {
            const Icon = iconMap[card.icon];
            return (
              <div
                key={card.id}
                className={`transition-all duration-500 delay-[${index * 100}ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div
                  onClick={() => handleCardClick(card.route)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="glass-card p-8 rounded-[35px] cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between"
                  style={{
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCard === card.id ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: hoveredCard === card.id ? 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 20px 40px rgba(0, 0, 0, 0.6)' : undefined
                  }}
                >
                  <div className="relative z-10">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] shadow-inner" style={{ background: `linear-gradient(135deg, ${card.gradient.includes('263542') ? '#263542' : '#066DF7'}, ${card.gradient.includes('600612') ? '#600612' : '#3086AE'})` }}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {card.title}
                    </h3>
                    <p className="text-base text-[#7E88B7] leading-relaxed">
                      {card.description}
                    </p>

                    <div className={`mt-8 transform transition-all duration-300 ${hoveredCard === card.id ? 'translate-x-2 text-[#066DF7]' : 'translate-x-0 text-[#B1EDE8]'}`}>
                      <span className="text-sm font-bold tracking-wider uppercase">EXPLORE &rarr;</span>
                    </div>
                  </div>

                  <div 
                    className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full mix-blend-screen filter blur-[80px] transition-all duration-700 opacity-0 group-hover:opacity-40`}
                    style={{ background: card.gradient.includes('263542') ? '#3086AE' : '#066DF7' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Twitch live widget */}
        <div className={`mt-12 max-w-2xl transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#7E88B7] mb-3">Catch the stream</p>
          <TwitchWidget channel={TWITCH_CHANNEL} />
        </div>
      </div>
    </div>
  );
};

export default Home;
