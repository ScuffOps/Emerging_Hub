import React, { useEffect, useState } from 'react';
import { ExternalLink, Twitch, Radio, Play } from 'lucide-react';

/** Free public uptime endpoint — no API key needed. */
const DECAPI = (channel) => `https://decapi.me/twitch/uptime/${encodeURIComponent(channel)}`;
const PREVIEW = (channel) =>
  `https://static-cdn.jtvnw.net/previews-ttv/live_user_${encodeURIComponent(channel)}-1280x720.jpg`;

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
  const channelUrl = `https://www.twitch.tv/${channel}`;
  // Cache-bust the preview every minute while live so it stays fresh
  const [bust, setBust] = useState(Date.now());
  useEffect(() => {
    if (!live) return;
    const i = setInterval(() => setBust(Date.now()), 60000);
    return () => clearInterval(i);
  }, [live]);

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
              Live{uptime ? ` · ${uptime}` : ''}
            </>
          ) : (
            <><Radio className="w-3 h-3" />Offline</>
          )}
        </span>
      </div>

      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative aspect-video bg-black overflow-hidden block"
        data-testid="twitch-preview"
      >
        {live ? (
          <>
            <img
              src={`${PREVIEW(channel)}?ts=${bust}`}
              alt="Live preview"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff0033]/90 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Live
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black font-bold text-sm shadow-xl">
                <Play className="w-4 h-4 fill-current" />Watch Live
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0e0e2e] via-[#1a0e2e] to-[#0e0e1e]">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, #9146FF 0%, transparent 40%), radial-gradient(circle at 70% 70%, #066DF7 0%, transparent 40%)'
            }} />
            <Twitch className="w-12 h-12 text-[#9146FF] relative" />
            <p className="text-[#7E88B7] text-sm relative">Currently offline · click to follow</p>
          </div>
        )}
      </a>

      <a href={channelUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs text-[#B1EDE8] hover:bg-white/5 transition-all border-t border-white/5"
        data-testid="twitch-open-channel"
      >
        Open channel <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default TwitchWidget;
