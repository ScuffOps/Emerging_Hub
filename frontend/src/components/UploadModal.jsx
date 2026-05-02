import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (typeof window !== 'undefined' && window.location?.origin)
  ? window.location.origin
  : (process.env.REACT_APP_BACKEND_URL || '');

const UploadModal = ({ isOpen, onClose, onUploadSuccess, editItem = null }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const initialFormState = {
    title: '',
    artistName: '',
    platform: '',
    type: 'Full Body',
    status: 'Completed',
    payment: '',
    usageRights: 'Personal',
    category: 'Character Design',
    folder: 'Main',
    description: '',
    tags: '',
    visibility: 'public'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          ...editItem,
          payment: editItem.payment.toString(),
          tags: editItem.tags ? editItem.tags.join(', ') : ''
        });
        setPreview(editItem.thumbnail);
        setFile(null); // Clear file since we use existing thumbnail
      } else {
        setFormData(initialFormState);
        setPreview(null);
        setFile(null);
      }
    }
  }, [isOpen, editItem]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const uploadFileChunks = async (file) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    // 1. Init upload
    const initFormData = new FormData();
    initFormData.append('filename', file.name);
    initFormData.append('content_type', file.type);
    
    const initRes = await fetch(`${API_URL}/api/upload/init`, {
      method: 'POST',
      body: initFormData
    });
    if (!initRes.ok) throw new Error('Upload init failed');
    const { upload_id } = await initRes.json();

    // 2. Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkFormData = new FormData();
      chunkFormData.append('chunk_index', i);
      chunkFormData.append('file', chunk);

      const chunkRes = await fetch(`${API_URL}/api/upload/${upload_id}/chunk`, {
        method: 'POST',
        body: chunkFormData
      });
      if (!chunkRes.ok) throw new Error(`Chunk ${i} upload failed`);
      setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    // 3. Complete upload
    const completeFormData = new FormData();
    completeFormData.append('filename', file.name);
    completeFormData.append('content_type', file.type);
    
    const completeRes = await fetch(`${API_URL}/api/upload/${upload_id}/complete`, {
      method: 'POST',
      body: completeFormData
    });
    if (!completeRes.ok) throw new Error('Upload completion failed');
    
    const result = await completeRes.json();
    return `${API_URL}${result.url}`; // The full URL to serve
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editItem) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!formData.title || !formData.artistName) {
      toast.error('Please fill out all required fields (Title, Artist)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileUrl = editItem ? editItem.thumbnail : '';
      
      // Upload new file only if user selected one
      if (file) {
        fileUrl = await uploadFileChunks(file);
      }

      // Convert tags from comma separated string to array
      const parsedTags = (typeof formData.tags === 'string' ? formData.tags : '').split(',').map(t => t.trim()).filter(Boolean);

      const itemData = {
        ...formData,
        thumbnail: fileUrl,
        payment: parseFloat(formData.payment || 0),
        uploadDate: editItem ? editItem.uploadDate : new Date().toISOString().split('T')[0],
        artistHandles: editItem ? editItem.artistHandles : {},
        tags: parsedTags
      };

      const url = editItem ? `${API_URL}/api/gallery/${editItem.id}` : `${API_URL}/api/gallery`;
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      if (!res.ok) throw new Error(`Failed to ${editItem ? 'update' : 'save'} gallery item`);
      
      const savedItem = await res.json();
      toast.success(`Artwork ${editItem ? 'updated' : 'uploaded'} successfully!`);
      onUploadSuccess(savedItem, !!editItem);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-black/90 backdrop-blur-3xl border border-white/10 text-[#E1DBC2]" style={{ borderRadius: '35px' }}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {editItem ? 'Edit Gallery Item' : 'Upload New Artwork'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          
          {/* Left: Drag & Drop Zone */}
          <div className="flex flex-col h-full">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`flex-1 min-h-[300px] border-2 border-dashed rounded-[25px] flex flex-col items-center justify-center p-6 transition-all cursor-pointer relative overflow-hidden ${
                isDragging ? 'border-[#066DF7] bg-[#066DF7]/10' : 'border-white/20 hover:border-[#066DF7]/50 bg-white/5 hover:bg-white/10'
              }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold">Click to change</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-[#7E88B7] mx-auto mb-4" />
                  <p className="text-[#E1DBC2] font-semibold mb-2">Click or drag image to upload</p>
                  <p className="text-sm text-[#7E88B7]">PNG, JPG or WEBP (Max. 50MB)</p>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>
            
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1 text-[#7E88B7]">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#066DF7] to-[#3086AE] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Metadata Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#7E88B7] mb-1">Title *</label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-[#066DF7]"
                placeholder="e.g. New Year Outfit Ref"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Artist *</label>
                <Input 
                  value={formData.artistName}
                  onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-[#066DF7]"
                  placeholder="Artist name"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Platform</label>
                <Input 
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-[#066DF7]"
                  placeholder="e.g. Twitter, VGen"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#171718]/80 border border-white/10 text-white rounded-xl p-2 focus:border-[#066DF7] outline-none"
                >
                  {['Character Design', 'Live2D', 'Emotes', 'Graphics', 'Alt Outfits', 'Profile Art', 'Accessories', 'Companions'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[#171718]/80 border border-white/10 text-white rounded-xl p-2 focus:border-[#066DF7] outline-none"
                >
                  {['Completed', 'In Progress', 'Requested'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Payment (USD)</label>
                <Input 
                  type="number"
                  value={formData.payment}
                  onChange={(e) => setFormData({...formData, payment: e.target.value})}
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-[#066DF7]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Usage Rights</label>
                <select 
                  value={formData.usageRights}
                  onChange={(e) => setFormData({...formData, usageRights: e.target.value})}
                  className="w-full bg-[#171718]/80 border border-white/10 text-white rounded-xl p-2 focus:border-[#066DF7] outline-none"
                >
                  {['Personal', 'Streaming Only', 'Full Commercial'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Folder</label>
                <Input 
                  value={formData.folder}
                  onChange={(e) => setFormData({...formData, folder: e.target.value})}
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-[#066DF7]"
                  placeholder="e.g. Main/Character References"
                />
              </div>
              <div>
                <label className="block text-sm text-[#7E88B7] mb-1">Tags (Comma separated)</label>
                <Input 
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-[#066DF7]"
                  placeholder="e.g. reference, digital, wip"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#7E88B7] mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-[#066DF7] outline-none resize-none h-24"
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block text-sm text-[#7E88B7] mb-1">Visibility</label>
              <div className="flex gap-2" data-testid="upload-visibility">
                {[
                  { id: 'public',  label: 'Public',  desc: 'Visible to everyone' },
                  { id: 'private', label: 'Private', desc: 'Only visible to you (admin)' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, visibility: opt.id })}
                    data-testid={`vis-${opt.id}`}
                    className={`flex-1 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${formData.visibility === opt.id ? 'bg-[#066DF7]/20 text-white border-[#066DF7]/50 shadow-[0_0_14px_rgba(6,109,247,0.3)]' : 'bg-white/5 text-[#7E88B7] border-white/10 hover:text-white hover:bg-white/10'}`}
                    title={opt.desc}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 mt-4"
              style={{
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #066DF7 0%, #3086AE 100%)',
                boxShadow: '0 8px 25px rgba(6, 109, 247, 0.4)'
              }}
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {editItem && !file ? 'Saving...' : 'Uploading...'}</>
              ) : (
                editItem ? 'Save Changes' : 'Save to Gallery'
              )}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
