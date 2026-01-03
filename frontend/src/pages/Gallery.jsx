import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid3x3, Filter, Search, Plus, FolderOpen } from 'lucide-react';
import { galleryItems } from '../mock';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import '../styles/theme.css';

const Gallery = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = ['All', 'Character Design', 'Live2D', 'Emotes', 'Graphics', 'Alt Outfits', 'Profile Art', 'Accessories', 'Companions'];

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            Art Gallery
          </h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className={`glass-card p-6 mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7E88B7]" />
                <Input
                  type="text"
                  placeholder="Search by title, artist, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-transparent border-[#066DF7]/30 text-[#E1DBC2] placeholder:text-[#7E88B7] focus:border-[#066DF7]"
                  style={{ borderRadius: '55px', height: '48px' }}
                />
              </div>

              {/* View Mode Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 rounded-2xl border border-[#066DF7]/30 text-[#066DF7] hover:bg-[#066DF7]/10 transition-all"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>

              {/* Folder Button (placeholder) */}
              <button
                className="p-3 rounded-2xl border border-[#066DF7]/30 text-[#066DF7] hover:bg-[#066DF7]/10 transition-all"
              >
                <FolderOpen className="w-5 h-5" />
              </button>

              {/* Add New Button (placeholder for upload feature) */}
              <button
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all"
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
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#066DF7]/10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`chip ${selectedCategory === category ? 'chip-primary' : ''}`}
                  style={{
                    background: selectedCategory === category ? 'rgba(6, 109, 247, 0.2)' : 'rgba(6, 109, 247, 0.05)',
                    border: selectedCategory === category ? '1px solid #066DF7' : '1px solid rgba(6, 109, 247, 0.2)',
                    color: selectedCategory === category ? '#066DF7' : '#7E88B7',
                    cursor: 'pointer'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`glass-card overflow-hidden cursor-pointer group transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm">Click to view details</p>
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`chip ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 text-[#E1DBC2] line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#7E88B7] mb-3">
                    by {item.artistName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="chip chip-primary text-xs">{item.type}</span>
                    <span className="text-sm font-semibold" style={{ color: '#F5DBAE' }}>
                      ${item.payment}
                    </span>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(6, 109, 247, 0.1)', color: '#7E88B7' }}>
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
            <div className="text-center py-20">
              <Filter className="w-16 h-16 mx-auto mb-4 text-[#7E88B7] opacity-50" />
              <p className="text-xl text-[#7E88B7]">No artwork found matching your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl bg-[#171718] border border-[#066DF7]/30 text-[#E1DBC2]" style={{ borderRadius: '30px' }}>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Image */}
                <div className="relative aspect-video rounded-3xl overflow-hidden">
                  <img
                    src={selectedItem.thumbnail}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#7E88B7] mb-1">Artist</p>
                    <p className="font-semibold text-[#E1DBC2]">{selectedItem.artistName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7E88B7] mb-1">Platform</p>
                    <p className="font-semibold text-[#E1DBC2]">{selectedItem.platform}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7E88B7] mb-1">Type</p>
                    <span className="chip chip-primary">{selectedItem.type}</span>
                  </div>
                  <div>
                    <p className="text-sm text-[#7E88B7] mb-1">Status</p>
                    <span className={`chip ${getStatusColor(selectedItem.status)}`}>{selectedItem.status}</span>
                  </div>
                  <div>
                    <p className="text-sm text-[#7E88B7] mb-1">Payment</p>
                    <p className="font-semibold" style={{ color: '#F5DBAE' }}>${selectedItem.payment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7E88B7] mb-1">Usage Rights</p>
                    <p className="font-semibold text-[#E1DBC2]">{selectedItem.usageRights}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-[#7E88B7] mb-2">Description</p>
                  <p className="text-[#E1DBC2]">{selectedItem.description}</p>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-sm text-[#7E88B7] mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="chip chip-primary">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Artist Handles */}
                <div>
                  <p className="text-sm text-[#7E88B7] mb-2">Artist Contacts</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedItem.artistHandles).map(([platform, handle]) => (
                      <span key={platform} className="text-sm px-3 py-2 rounded-2xl" style={{ background: 'rgba(6, 109, 247, 0.1)', color: '#7E88B7' }}>
                        {platform}: {handle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Folder Path */}
                <div>
                  <p className="text-sm text-[#7E88B7] mb-2">Folder</p>
                  <p className="text-[#E1DBC2] flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {selectedItem.folder}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;