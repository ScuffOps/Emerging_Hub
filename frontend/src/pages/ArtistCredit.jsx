import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Twitter, MessageCircle, Palette, Globe, Heart, Calendar, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { fetchArtistCredit } from '../api';
import '../styles/theme.css';

const PLATFORM_LINKS = [
  { key: 'twitter',   label: 'Twitter/X', icon: Twitter,       href: (v) => v.startsWith('@') ? `https://twitter.com/${v.slice(1)}` : (v.startsWith('http') ? v : `https://twitter.com/${v}`) },
  { key: 'vgen',      label: 'VGen',      icon: Palette,       href: (v) => v.startsWith('http') ? v : `https://vgen.co/${v.replace(/^@/, '')}` },
  { key: 'discord',   label: 'Discord',   icon: MessageCircle, href: (v) => v.startsWith('http') ? v : null },
  { key: 'portfolio', label: 'Portfolio', icon: Globe,         href: (v) => v },
];

const ArtistCredit = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchArtistCredit(slug);
        setData(d);
      } catch (e) {
        if (String(e?.message || '').includes('404')) setNotFound(true);
        else toast.error('Failed to load artist');
      } finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) return <div className="p-12 text-[#7E88B7] text-sm" data-testid="artist-loading">Loading…</div>;
  if (notFound || !data) {
    return (
      <div className="p-12 max-w-xl" data-testid="artist-not-found">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#E1DBC2' }}>Artist not found</h1>
        <p className="text-[#7E88B7] mb-4">No public commissions exist for this slug.</p>
        <button onClick={() => navigate('/credits')} className="text-[#B1EDE8] hover:text-white text-sm">← Back to Credits</button>
      </div>
    );
  }

  const links = PLATFORM_LINKS.filter((l) => data[l.key]);

  return (
    <div className="p-8 lg:p-12 pb-32" data-testid="artist-credit-page">
      <Link to="/credits" data-testid="back-to-credits" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#B1EDE8] text-xs hover:bg-white/10 transition-all mb-8">
        <ArrowLeft className="w-3.5 h-3.5" />Back to Credits
      </Link>

      {/* Header */}
      <div className="flex items-start gap-6 mb-10 max-w-3xl">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#066DF7]/40 to-[#D477FF]/30 blur opacity-80" />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border border-white/10 bg-[#0c0c0d] flex items-center justify-center">
            {data.avatar_url ? (
              <img src={data.avatar_url} alt={data.name} className="w-full h-full object-cover" data-testid="artist-avatar" />
            ) : (
              <span className="text-3xl font-bold text-[#E1DBC2]">{(data.name || '?').slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#D477FF] mb-1">Artist Spotlight</p>
          <h1 className="text-5xl lg:text-6xl font-bold mb-3 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{data.name}</h1>
          <p className="text-base text-[#B1EDE8]">
            <span className="text-[#E1DBC2] font-bold">{data.count}</span> piece{data.count === 1 ? '' : 's'} of Veri shaped by their hand.
          </p>
        </div>
      </div>

      {/* CTA + links */}
      <div className="glass-card rounded-[28px] p-6 mb-10 max-w-3xl flex items-start gap-4 flex-wrap" data-testid="artist-cta">
        <div className="flex-1 min-w-[260px]">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            <Heart className="w-4 h-4 text-[#D477FF]" />Commission them too
          </h3>
          <p className="text-sm text-[#7E88B7]">Loved their work on Veri? Show them love and book your own piece.</p>
        </div>
        <div className="flex items-center flex-wrap gap-1.5">
          {links.length > 0 ? links.map((l) => {
            const Icon = l.icon;
            const href = l.href(data[l.key]);
            const label = l.key === 'portfolio' ? 'Portfolio' : data[l.key];
            if (!href) return (
              <span key={l.key} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#B1EDE8]" title={`Discord: ${data[l.key]}`}>
                <Icon className="w-3.5 h-3.5" />{data[l.key]}
              </span>
            );
            return (
              <a key={l.key} href={href} target="_blank" rel="noopener noreferrer"
                data-testid={`artist-link-${l.key}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#B1EDE8] hover:bg-[#066DF7]/15 hover:border-[#066DF7]/40 hover:text-white transition-all">
                <Icon className="w-3.5 h-3.5" />{label}
              </a>
            );
          }) : (
            <span className="text-xs italic text-[#7E88B7]">Handles not yet on file — DM Veri for an intro.</span>
          )}
        </div>
      </div>

      {/* Pieces grid */}
      <div className="max-w-5xl">
        <h2 className="text-xs uppercase tracking-[0.25em] text-[#7E88B7] mb-4">Pieces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="artist-pieces-grid">
          {data.pieces.map((p) => (
            <div key={p.id} className="glass-card rounded-[22px] overflow-hidden group" data-testid={`piece-${p.id}`}>
              <div className="aspect-[4/5] bg-black/40 overflow-hidden relative">
                {p.image ? (
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#7E88B7]"><ImageIcon className="w-8 h-8" /></div>
                )}
                {p.image && (
                  <a href={p.image} target="_blank" rel="noopener noreferrer"
                     className="absolute top-3 right-3 p-2 rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                     aria-label="Open full image">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>{p.title || 'Untitled'}</h4>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#7E88B7] flex-wrap">
                  {p.type && <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{p.type}</span>}
                  {p.platform && <span>{p.platform}</span>}
                  {p.finished_date && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{p.finished_date}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistCredit;
