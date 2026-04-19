import React, { useState, useEffect } from 'react';
import { Grid3x3, Filter, Search, Plus, FolderOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { fetchGallery } from '../api';
import UploadModal from '../components/UploadModal';
import HorizontalFolderCarousel from '../components/HorizontalFolderCarousel';
import '../styles/theme.css';

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoaded, setIsLoaded] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGallery();
        setGalleryItems(data);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const categories = ['All', 'Character Design', 'Live2D', 'Emotes', 'Graphics', 'Alt Outfits', 'Profile Art', 'Accessories', 'Companions'];

  // Dynamic Folders Extraction
  const foldersMap = galleryItems.reduce((acc, item) => {
    const f = item.folder || 'Uncategorized';
    if (!acc[f]) {
      acc[f] = { name: f, count: 0, image: item.thumbnail };
    }
    acc[f].count += 1;
    return acc;
  }, {});

  const foldersList = [
    { name: 'All', count: galleryItems.length, image: galleryItems[0]?.thumbnail || '' },
    ...Object.values(foldersMap)
  ];

  const [selectedFolder, setSelectedFolder] = useState('All');

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFolder = selectedFolder === 'All' || item.folder === selectedFolder;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'chip-success';
      case 'In Progress': return 'chip-warning';
      case 'Requested': return 'chip-primary';
      default: return 'chip-primary';
    }
  };

  return (
    <div className="p-8 lg:p-12 pb-32">
      <div className={`mb-10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-5xl lg:text-6xl font-bold mb-2 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Art Gallery
        </h1>
        <p className="text-xl text-[#B1EDE8] tracking-wide">A collection of artwork, references, and assets</p>
      </div>

      {/* Toolbar */}
      <div className={`glass-card p-6 mb-8 rounded-[35px] transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7E88B7]" />
            <Input
              type="text"
              placeholder="Search by title, artist, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-black/20 border-white/10 text-[#E1DBC2] placeholder:text-[#7E88B7] focus:border-[#066DF7] focus:ring-0 shadow-inner"
              style={{ borderRadius: '55px', height: '48px' }}
            />
          </div>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-3 rounded-2xl border border-white/10 bg-black/20 text-[#066DF7] hover:bg-white/10 transition-all shadow-inner"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>

          {/* Add New Button (placeholder for upload feature) */}
          <button
            onClick={() => {
              setEditItem(null);
              setIsUploadOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-[0_0_15px_rgba(6,109,247,0.3)] hover:shadow-[0_0_25px_rgba(6,109,247,0.5)]"
            style={{
              borderRadius: '55px',
              background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
            }}
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`chip ${selectedCategory === category ? 'chip-primary text-white border-[#066DF7]' : 'text-[#7E88B7] border-white/10 hover:border-white/30'}`}
              style={{
                background: selectedCategory === category ? 'rgba(6, 109, 247, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                cursor: 'pointer'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Folders Carousel */}
      <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <HorizontalFolderCarousel 
          folders={foldersList}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
        />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`glass-card rounded-[30px] overflow-hidden cursor-pointer group transition-all duration-500 delay-[${(index % 10) * 100}ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {/* Thumbnail */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Click to view details &rarr;</p>
              </div>
              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <span className={`chip shadow-lg ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Card content */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-[#E1DBC2] line-clamp-1">
                {item.title}
              </h3>
              <p className="text-sm text-[#7E88B7] mb-4">
                by {item.artistName}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="chip bg-white/5 border-white/10 text-xs text-white">{item.type}</span>
                <span className="text-sm font-bold" style={{ color: '#F5DBAE' }}>
                  ${item.payment}
                </span>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-1 rounded-full bg-black/30 border border-white/5 text-[#7E88B7]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20 glass-card rounded-[35px]">
          <Filter className="w-16 h-16 mx-auto mb-4 text-[#7E88B7] opacity-50" />
          <p className="text-xl text-[#7E88B7]">No artwork found matching your filters</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-black/80 backdrop-blur-3xl border border-white/10 text-[#E1DBC2] p-6 lg:p-8" style={{ borderRadius: '35px' }}>
          {selectedItem && (
            <>
              <DialogHeader className="mb-4 shrink-0 flex flex-row items-center justify-between">
                <DialogTitle className="text-2xl md:text-3xl font-bold break-words" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                  {selectedItem.title}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditItem(selectedItem);
                      setIsUploadOpen(true);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-[#066DF7] hover:bg-[#3086AE] text-white transition-all ml-4 shrink-0"
                  >
                    Edit Entry
                  </button>
                </div>
              </DialogHeader>
              
              <div className="flex flex-col gap-6">
                {/* Image */}
                <div className="relative w-full rounded-[25px] overflow-hidden shadow-2xl bg-black/50 flex items-center justify-center min-h-[200px] max-h-[50vh]">
                  <img
                    src={selectedItem.thumbnail}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain max-h-[50vh]"
                  />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 rounded-[25px] bg-white/5 border border-white/10">
                  <div>
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-1">Artist</p>
                    <p className="font-bold text-white text-sm md:text-base break-words">{selectedItem.artistName}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-1">Platform</p>
                    <p className="font-bold text-white text-sm md:text-base break-words">{selectedItem.platform}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-1">Type</p>
                    <span className="chip bg-white/10 text-white border-white/20 text-xs">{selectedItem.type}</span>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-1">Status</p>
                    <span className={`chip text-xs ${getStatusColor(selectedItem.status)}`}>{selectedItem.status}</span>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-1">Payment</p>
                    <p className="font-bold text-[#F5DBAE] text-sm md:text-base">${selectedItem.payment}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-1">Usage Rights</p>
                    <p className="font-bold text-white text-sm md:text-base break-words">{selectedItem.usageRights}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description */}
                  <div className="p-4 md:p-6 rounded-[25px] bg-white/5 border border-white/10">
                    <p className="text-xs md:text-sm text-[#7E88B7] mb-3">Description</p>
                    <p className="text-white text-sm md:text-base leading-relaxed">{selectedItem.description}</p>
                  </div>

                  {/* Artist Handles & Tags */}
                  <div className="flex flex-col gap-6">
                    <div className="p-4 md:p-6 rounded-[25px] bg-white/5 border border-white/10">
                      <p className="text-xs md:text-sm text-[#7E88B7] mb-3">Artist Contacts</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedItem.artistHandles || {}).map(([platform, handle]) => (
                          <span key={platform} className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white break-words">
                            {platform}: {handle}
                          </span>
                        ))}
                        {Object.keys(selectedItem.artistHandles || {}).length === 0 && (
                          <span className="text-sm text-white/50">No contacts provided</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6 rounded-[25px] bg-white/5 border border-white/10">
                      <p className="text-xs md:text-sm text-[#7E88B7] mb-3">Folder & Tags</p>
                      <p className="text-white text-sm md:text-base flex items-center gap-2 mb-4 font-medium break-words">
                        <FolderOpen className="w-4 h-4 text-[#066DF7] shrink-0" />
                        {selectedItem.folder}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags?.map((tag, idx) => (
                          <span key={idx} className="chip text-xs bg-black/30 border border-white/10 text-[#7E88B7] break-words">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        editItem={editItem}
        onUploadSuccess={(newItem, isEdit) => {
          if (isEdit) {
            setGalleryItems(prev => prev.map(i => i.id === newItem.id ? newItem : i));
          } else {
            setGalleryItems([newItem, ...galleryItems]);
          }
        }}
      />
    </div>
  );
};

export default Gallery;