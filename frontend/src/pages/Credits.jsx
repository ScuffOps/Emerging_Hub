import React, { useEffect, useState } from 'react';
import { HeartHandshake, Twitter, MessageCircle, Palette, Globe, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { fetchCredits } from '../api';
import '../styles/theme.css';

const PLATFORM_LINKS = [
  { key: 'twitter',   label: 'Twitter/X', icon: Twitter,       prefix: (v) => v.startsWith('@') ? `https://twitter.com/${v.slice(1)}` : (v.startsWith('http') ? v : `https://twitter.com/${v}`) },
  { key: 'vgen',      label: 'VGen',      icon: Palette,       prefix: (v) => v.startsWith('http') ? v : `https://vgen.co/${v.replace(/^@/, '')}` },
  { key: 'discord',   label: 'Discord',   icon: MessageCircle, prefix: (v) => v.startsWith('http') ? v : null },
  { key: 'portfolio', label: 'Portfolio', icon: Globe,         prefix: (v) => v },
];

const initials = (name) =>
  (name || '')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || '')
    .join('')
    .toUpperCase();

const ArtistCard = ({ a, delay }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setIsLoaded(true), delay); return () => clearTimeout(t); }, [delay]);

  const availableLinks = PLATFORM_LINKS.filter((l) => a[l.key]);

  return (
    <div
      className={`glass-card rounded-[28px] p-6 relative transition-all duration-700 hover:ring-1 hover:ring-[#066DF7]/40 hover:-translate-y-0.5 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      data-testid={`credit-card-${a.name.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#066DF7]/40 to-[#D477FF]/30 blur-sm opacity-70" />
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-[#0c0c0d] flex items-center justify-center">
            {a.avatar_url ? (
              <img src={a.avatar_url} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-lg font-bold text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {initials(a.name) || '?'}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-lg font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            {a.name}
          </h3>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7E88B7] mt-0.5">
            {a.pieces.length} {a.pieces.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </div>

      {/* Platform links */}
      {availableLinks.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 mb-4">
          {availableLinks.map((l) => {
            const Icon = l.icon;
            const href = l.prefix(a[l.key]);
            const label = a[l.key];
            if (!href) {
              // Discord username without URL — show as pill, not a link
              return (
                <span key={l.key} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#B1EDE8]" title={`Discord: ${label}`}>
                  <Icon className="w-3 h-3" />{label}
                </span>
              );
            }
            return (
              <a
                key={l.key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-${l.key}-${a.name.replace(/\s+/g, '-').toLowerCase()}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#B1EDE8] hover:bg-[#066DF7]/15 hover:border-[#066DF7]/40 hover:text-white transition-all"
              >
                <Icon className="w-3 h-3" />
                {l.key === 'portfolio' ? 'Portfolio' : label}
              </a>
            );
          })}
        </div>
      )}

      {/* Works preview strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {a.pieces.slice(0, 6).map((p) => (
          <div
            key={p.id}
            title={`${p.title}${p.finished_date ? ` · ${p.finished_date}` : ''}`}
            className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-black/30 relative group"
          >
            {p.thumbnail ? (
              <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#7E88B7]"><ImageIcon className="w-4 h-4" /></div>
            )}
          </div>
        ))}
        {a.pieces.length > 6 && (
          <span className="shrink-0 w-14 h-14 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[11px] text-[#7E88B7]">
            +{a.pieces.length - 6}
          </span>
        )}
      </div>
    </div>
  );
};

const Credits = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchCredits();
        setData(d);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load credits');
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-8 lg:p-12 pb-32" data-testid="credits-page">
      {/* Header */}
      <div className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D477FF]/10 border border-[#D477FF]/30 text-[#D477FF] text-[11px] uppercase tracking-[0.25em] mb-4">
          <HeartHandshake className="w-3 h-3" />Credits & Thanks
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold mb-3 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          The Artists
        </h1>
        <p className="text-lg text-[#B1EDE8] tracking-wide leading-relaxed">
          Every piece of Veri you see was shaped by the talented hands below. Please give them your support, follows, and commissions — they deserve it.
        </p>
      </div>

      {/* Stats strip */}
      {data && (
        <div className="flex items-center gap-3 flex-wrap mb-10" data-testid="credits-stats">
          <div className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#066DF7]" />
            <span className="text-sm font-bold text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{data.total_artists}</span>
            <span className="text-xs text-[#7E88B7]">artists</span>
          </div>
          <div className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#D477FF]" />
            <span className="text-sm font-bold text-[#E1DBC2]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{data.total_pieces}</span>
            <span className="text-xs text-[#7E88B7]">pieces completed</span>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#7E88B7] text-sm" data-testid="credits-loading">Loading the gallery of greats…</div>
      ) : data?.artists?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl" data-testid="credits-grid">
          {data.artists.map((a, idx) => (
            <ArtistCard key={a.name} a={a} delay={idx * 80} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[28px] p-10 text-center max-w-xl" data-testid="credits-empty">
          <ExternalLink className="w-6 h-6 text-[#7E88B7] mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>No completed commissions yet</h3>
          <p className="text-sm text-[#7E88B7]">Once commissions are marked <span className="text-[#4ADE80]">Completed</span> with Public visibility, their artists will appear here automatically.</p>
        </div>
      )}
    </div>
  );
};

export default Credits;
