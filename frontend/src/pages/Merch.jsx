import React, { useEffect, useState } from 'react';
import { ShoppingBag, ExternalLink, Tag } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/theme.css';

const API = (typeof window !== 'undefined' && window.location?.origin)
  ? window.location.origin
  : (process.env.REACT_APP_BACKEND_URL || '');

const fmtPrice = (val, cur = 'USD') => {
  const n = Number(val);
  if (!isFinite(n)) return '';
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD' }).format(n); }
  catch { return `$${n.toFixed(2)}`; }
};

const Merch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/merch`);
        if (!r.ok) throw new Error('Fetch failed');
        const d = await r.json();
        setData(d);
        if (d.error) setErr(d.error);
      } catch (e) { console.error(e); toast.error('Failed to load merch'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-8 lg:p-12 pb-32" data-testid="merch-page">
      <div className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9146FF]/10 border border-[#9146FF]/30 text-[#c9a0ff] text-[11px] uppercase tracking-[0.25em] mb-4">
          <ShoppingBag className="w-3 h-3" />Official Merch
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold mb-3 gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Shop</h1>
        <p className="text-lg text-[#B1EDE8] tracking-wide">
          Take a piece of Veri home. Powered by Fourthwall.
        </p>
        {data?.shop_url && (
          <a href={data.shop_url} target="_blank" rel="noopener noreferrer" data-testid="open-shop-link"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#7E88B7] hover:text-white transition-colors">
            <ExternalLink className="w-3 h-3" />{data.shop_url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      {loading ? (
        <p className="text-[#7E88B7] text-sm" data-testid="merch-loading">Loading the storefront…</p>
      ) : err && !data?.products?.length ? (
        <div className="glass-card rounded-[28px] p-10 max-w-xl text-center" data-testid="merch-error">
          <h3 className="text-base font-bold mb-1" style={{ color: '#E1DBC2' }}>Couldn't load products</h3>
          <p className="text-xs text-[#7E88B7]">{err}</p>
        </div>
      ) : data?.products?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl" data-testid="merch-grid">
          {data.products.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`merch-${p.slug || p.id}`}
              className="glass-card rounded-[24px] overflow-hidden group flex flex-col hover:ring-1 hover:ring-[#9146FF]/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-square bg-black/30 overflow-hidden relative">
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#7E88B7]"><Tag className="w-8 h-8" /></div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white border border-white/10">
                  {fmtPrice(p.price, p.currency)}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <h4 className="text-sm font-bold leading-tight line-clamp-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
                  {p.name}
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#B1EDE8] group-hover:text-white transition-colors">
                  Shop on Fourthwall <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-[#7E88B7]" data-testid="merch-empty">No products yet — once your Fourthwall shop has listings they'll appear here.</p>
      )}
    </div>
  );
};

export default Merch;
