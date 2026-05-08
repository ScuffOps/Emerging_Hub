import React, { useRef, useState } from 'react';
import { Upload, Loader2, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from '../api';

/**
 * File-first image picker with drag-and-drop upload as primary path
 * and a collapsed "paste URL" fallback. Returns the resulting image URL
 * via onChange(url).
 *
 * Props:
 *  - value: current URL (string)
 *  - onChange: (url: string) => void
 *  - label: optional label text
 *  - aspect: 'square' | '4/5' | '3/4' (controls the drop-zone aspect); default 'auto' (compact ~h-32)
 *  - required: boolean (affects label * marker only)
 *  - testPrefix: data-testid prefix
 */
const ImagePicker = ({ value, onChange, label = 'Image', aspect = 'auto', required = false, testPrefix = 'imgpick' }) => {
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const aspectClass = aspect === 'square' ? 'aspect-square'
    : aspect === '4/5' ? 'aspect-[4/5]'
    : aspect === '3/4' ? 'aspect-[3/4]'
    : 'h-36';

  const doUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      onChange(url);
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = (e) => doUpload(e.target.files?.[0]);
  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    doUpload(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-1.5" data-testid={`${testPrefix}-wrap`}>
      <span className="text-[10px] uppercase tracking-[0.18em] text-[#7E88B7]">
        {label}{required && ' *'}
      </span>

      {value ? (
        // Preview state
        <div className="relative group rounded-[22px] overflow-hidden border border-white/10 bg-black/30">
          <div className={`${aspectClass} w-full`}>
            <img src={value} alt="" className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.style.opacity='0.25'; }} />
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/55 flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} data-testid={`${testPrefix}-replace`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs text-white hover:bg-white/20">
              <Upload className="w-3.5 h-3.5" />Replace
            </button>
            <button type="button" onClick={() => onChange('')} data-testid={`${testPrefix}-clear`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#600612]/50 border border-[#600612]/70 text-xs text-[#ff8095] hover:bg-[#600612]/70">
              <X className="w-3.5 h-3.5" />Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#B1EDE8]" />
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} data-testid={`${testPrefix}-file-input`} />
        </div>
      ) : (
        // Drop zone
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          data-testid={`${testPrefix}-dropzone`}
          className={`${aspectClass} w-full flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed cursor-pointer transition-all ${dragOver ? 'border-[#D477FF] bg-[#D477FF]/10' : 'border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'}`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-[#B1EDE8]" />
              <span className="text-xs text-[#B1EDE8]">Uploading…</span>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-full bg-white/5 border border-white/10">
                <Upload className="w-4 h-4 text-[#B1EDE8]" />
              </div>
              <span className="text-xs font-semibold text-[#E1DBC2]">Click or drop an image</span>
              <span className="text-[10px] text-[#7E88B7]">PNG · JPG · WEBP · GIF</span>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={onFileInput} data-testid={`${testPrefix}-file-input`} />
        </label>
      )}

      {/* Collapsed URL fallback */}
      <div className="flex items-center justify-end">
        {!urlMode ? (
          <button type="button" onClick={() => setUrlMode(true)} data-testid={`${testPrefix}-url-toggle`}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[#7E88B7] hover:text-[#B1EDE8] transition-colors">
            <LinkIcon className="w-2.5 h-2.5" />Use a URL instead
          </button>
        ) : (
          <div className="flex items-center gap-1 w-full">
            <ImageIcon className="w-3 h-3 text-[#7E88B7] shrink-0" />
            <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://…"
              data-testid={`${testPrefix}-url-input`}
              className="flex-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder:text-[#7E88B7] focus:outline-none focus:border-[#066DF7]" />
            <button type="button" onClick={() => setUrlMode(false)} className="p-1 rounded-full text-[#7E88B7] hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePicker;
