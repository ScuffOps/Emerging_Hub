import React, { useEffect, useState } from 'react';
import { ExternalLink, Twitch, Radio } from 'lucide-react';

/** Free public uptime endpoint — no API key needed. */
const DECAPI = (channel) => `https://decapi.me/twitch/uptime/${encodeURIComponent(channel)}`;

export const useTwitchLive = (channel) => {
  const [live, setLive] = useState(false);
  const [uptime, setUptime] = useState('');
  useEffect(() => {
    if (!channel) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(DECAPI(channel));
        const text = (await res.text()).trim();
        if (cancelled) return;
        const offline = /offline|never been live|not live/i.test(text);
        setLive(!offline);
        setUptime(offline ? '' : text);
      } catch { /* ignore */ }
    };
    tick();
    const i = setInterval(tick, 60000);
    return () => { cancelled = true; clearInterval(i); };
  }, [channel]);
  return { live, uptime };
};

const TwitchWidget = ({ channel }) => {
  const { live, uptime } = useTwitchLive(channel);
  const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="glass-card rounded-[28px] overflow-hidden flex flex-col" data-testid="twitch-widget">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <Twitch className="w-4 h-4 text-[#9146FF] shrink-0" />
          <span className="text-sm font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#E1DBC2' }}>
            twitch.tv/{channel}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] border ${
            live ? 'bg-[#ff0033]/15 text-[#ff5577] border-[#ff0033]/40' : 'bg-white/5 text-[#7E88B7] border-white/10'
          }`}
          data-testid="twitch-status-pill"
        >
          {live ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0033] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff0033]"></span>
              </span>
              Live · {uptime || ''}
            </>
          ) : (
            <><Radio className="w-3 h-3" />Offline</>
          )}
        </span>
      </div>

      <div className="aspect-video bg-black relative">
        <iframe
          title="Twitch player"
          src={`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&muted=true&autoplay=false`}
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <a href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs text-[#B1EDE8] hover:bg-white/5 transition-all border-t border-white/5"
        data-testid="twitch-open-channel"
      >
        Open channel <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default TwitchWidget;
