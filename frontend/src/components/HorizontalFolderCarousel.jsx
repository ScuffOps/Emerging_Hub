import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Folder } from 'lucide-react';

const HorizontalFolderCarousel = ({ folders, selectedFolder, onSelectFolder }) => {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full mb-6">
      {/* Left Gradient/Arrow */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#171718] to-transparent z-10 flex items-center">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-[#066DF7]/50 hover:border-[#066DF7] transition-all ml-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Carousel Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto custom-scrollbar-hide snap-x snap-mandatory py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {folders.map((folder, index) => (
          <div
            key={index}
            onClick={() => onSelectFolder(folder.name)}
            className={`snap-start shrink-0 w-64 h-32 rounded-[25px] p-6 flex flex-col justify-end cursor-pointer relative overflow-hidden transition-all duration-300 ${
              selectedFolder === folder.name 
                ? 'border border-[#066DF7] shadow-[0_0_20px_rgba(6,109,247,0.3)] transform -translate-y-2' 
                : 'border border-white/10 hover:border-white/30 hover:bg-white/5'
            }`}
            style={{
              background: selectedFolder === folder.name ? 'linear-gradient(135deg, rgba(6,109,247,0.1), rgba(48,134,174,0.05))' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {folder.image && (
              <img 
                src={folder.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative z-10 flex items-center gap-3">
              <Folder className={`w-6 h-6 ${selectedFolder === folder.name ? 'text-[#066DF7]' : 'text-[#7E88B7]'}`} />
              <span className="font-bold text-white tracking-wide">{folder.name}</span>
            </div>
            <span className="relative z-10 text-xs text-[#7E88B7] mt-1">{folder.count} Items</span>
          </div>
        ))}
      </div>

      {/* Right Gradient/Arrow */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#171718] to-transparent z-10 flex items-center justify-end">
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-[#066DF7]/50 hover:border-[#066DF7] transition-all mr-2"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HorizontalFolderCarousel;
