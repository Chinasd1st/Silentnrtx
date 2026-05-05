"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaLastfm } from "react-icons/fa";

interface LastFmTrack {
  name: string; artist: { "#text": string }; album: { "#text": string };
  image: Array<{ "#text": string; size: string }>;
  "@attr"?: { nowplaying: string };
  date?: { uts: string; "#text": string };
}
interface LastFmResponse { recenttracks: { track: LastFmTrack[] }; }

const CACHE_KEY = "lastfm";
const CACHE_TTL = 5 * 60 * 1000;

export function LastFmStatus() {
  const { t } = useTranslation();
  const [track, setTrack] = useState<LastFmTrack | null>(null);
  const [state, setState] = useState<"loading" | "playing" | "recent" | "error">("loading");

  const fetchTrack = useCallback(() => {
    const { apiKey, username } = siteConfig.lastfm;
    if (!apiKey || !username) { setState("error"); return; }

    const cached = getCache<{ track: LastFmTrack; state: string }>(CACHE_KEY, CACHE_TTL);
    if (cached) { setTrack(cached.track); setState(cached.state as any); return; }

    fetchWithTimeout(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`)
      .then((r) => r.json())
      .then((data: LastFmResponse) => {
        const tracks = data.recenttracks?.track;
        if (!tracks?.[0]) { setTrack(null); setState("error"); return; }
        const t = tracks[0];
        const s = t["@attr"]?.nowplaying === "true" ? "playing" : "recent";
        setTrack(t); setState(s);
        setCache(CACHE_KEY, { track: t, state: s });
      })
      .catch(() => { setTrack(null); setState("error"); });
  }, []);

  useEffect(() => { fetchTrack(); }, [fetchTrack]);

  const albumArt = track?.image?.find((i) => i.size === "medium")?.["#text"] || track?.image?.[2]?.["#text"] || null;

  if (state === "loading") return <CardSkeleton />;
  if (state === "error") return <ErrorCard title={t("lastfm.none")} onRetry={fetchTrack} />;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
          <FaLastfm style={{ color: "var(--md-primary)" }} />{t("lastfm.title")}
        </h3>
        <a href={siteConfig.social.lastfm.url} target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors" style={{ color: "var(--md-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
          {t("lastfm.profile")} &rarr;
        </a>
      </div>

      {track && (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {albumArt ? (
              <img src={albumArt} alt={track.album["#text"]} className="h-16 w-16 rounded-[16px] object-cover shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/[0.06] text-2xl opacity-40">&#9835;</div>}
            {state === "playing" && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500" style={{ boxShadow: "0 0 0 2px var(--md-card-bg)" }}>
                <span className="h-2 w-2 rounded-full bg-white animate-pulse-glow" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: state === "playing" ? "rgba(34,197,94,0.15)" : "var(--md-primary-012)", color: state === "playing" ? "#22c55e" : "var(--md-primary)" }}>
              {state === "playing" ? t("lastfm.now_playing") : t("lastfm.last_played")}
            </span>
            <p className="mt-1 truncate text-sm font-semibold" style={{ color: "var(--md-text-primary)" }}>{track.name}</p>
            <p className="truncate text-xs" style={{ color: "var(--md-text-secondary)" }}>{track.artist["#text"]}</p>
            {track.album["#text"] && <p className="truncate text-xs" style={{ color: "var(--md-text-muted)" }}>{track.album["#text"]}</p>}
            {track.date && (
              <p className="text-[10px] mt-0.5" style={{ color: "var(--md-text-muted)" }}>
                {track.date["#text"]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
