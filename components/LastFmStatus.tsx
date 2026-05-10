"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { api, fetchWithRetry, mapApiError } from "@/lib/api";
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

interface Album {
  name: string; playcount: string;
  artist: { name: string };
  image: Array<{ "#text": string; size: string }>;
}
interface TopAlbumsResponse { topalbums: { album: Album[] }; }

type Tab = "nowplaying" | "top";

export function LastFmStatus() {
  const { t } = useTranslation();
  const [track, setTrack] = useState<LastFmTrack | null>(null);
  const [state, setState] = useState<"loading" | "playing" | "recent" | "error">("loading");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tab, setTab] = useState<Tab>("nowplaying");
  const albumsCache = useRef<{ data: Album[]; time: number } | null>(null);

  const fetchTrack = useCallback(() => {
    const { apiKey, username } = siteConfig.lastfm;
    if (!apiKey || !username) { setState("error"); return; }
    fetchWithRetry(() => api.get<LastFmResponse>(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`)).then(({ data }) => data)
      .then((data: LastFmResponse) => {
        const tracks = data.recenttracks?.track;
        if (!tracks?.[0]) { setTrack(null); setState("error"); return; }
        const t = tracks[0];
        setTrack(t); setState(t["@attr"]?.nowplaying === "true" ? "playing" : "recent");
      })
      .catch(() => { setTrack(null); setState("error"); });
  }, []);

  const fetchAlbums = useCallback(() => {
    const { apiKey, username } = siteConfig.lastfm;
    if (!apiKey || !username) return;
    const now = Date.now();
    if (albumsCache.current && now - albumsCache.current.time < 5 * 60 * 1000) {
      setAlbums(albumsCache.current.data);
      return;
    }
    fetchWithRetry(() => api.get<TopAlbumsResponse>(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&period=7day&limit=5`)).then(({ data }) => data)
      .then((data: TopAlbumsResponse) => {
        if (data?.topalbums?.album) {
          const albums = data.topalbums.album.slice(0, 5);
          setAlbums(albums);
          albumsCache.current = { data: albums, time: now };
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchTrack(); fetchAlbums(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const albumArt = track?.image?.find((i) => i.size === "medium")?.["#text"] || track?.image?.[2]?.["#text"] || null;

  if (state === "loading") return <CardSkeleton />;
  if (state === "error") return <ErrorCard title={t("lastfm.none")} onRetry={fetchTrack} />;

  const c = "var(--md-primary)";
  const activeBg = "var(--md-primary-020)";
  const inactiveBg = "rgba(255,255,255,0.05)";
  const activeFg = c;
  const inactiveFg = "var(--md-text-muted)";

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <FaLastfm className="text-lg shrink-0" style={{ color: c }} />
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }} suppressHydrationWarning>{t("lastfm.title")}</h2>
        </div>
        <a href={siteConfig.social.lastfm.url} target="_blank" rel="noopener noreferrer"
          className="text-xs shrink-0 transition-colors" style={{ color: "var(--md-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = c} suppressHydrationWarning
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
          {t("lastfm.profile")} &rarr;
        </a>
      </div>

      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab("nowplaying")} suppressHydrationWarning
          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
          style={{ backgroundColor: tab === "nowplaying" ? activeBg : inactiveBg, color: tab === "nowplaying" ? activeFg : inactiveFg }}>
          {t("lastfm.recent")}
        </button>
        <button onClick={() => setTab("top")} suppressHydrationWarning
          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
          style={{ backgroundColor: tab === "top" ? activeBg : inactiveBg, color: tab === "top" ? activeFg : inactiveFg }}>
          {t("lastfm.top_albums")}
        </button>
      </div>

      {tab === "nowplaying" && track && (
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <div className="absolute inset-0 flex items-center justify-center rounded-[16px] bg-white/6 text-2xl opacity-40">&#9835;</div>
            {albumArt && (
              <img src={albumArt} alt={track.album["#text"]} loading="lazy" className="absolute inset-0 w-full h-full rounded-[16px] object-cover shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            {state === "playing" && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500" style={{ boxShadow: "0 0 0 2px var(--md-card-bg)" }}>
                <span className="h-2 w-2 rounded-full bg-white animate-pulse-glow" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: state === "playing" ? "color-mix(in srgb, var(--md-accent-green) 15%, transparent)" : "var(--md-primary-012)", color: state === "playing" ? "var(--md-accent-green)" : c }}>
              {state === "playing" ? t("lastfm.now_playing") : t("lastfm.last_played")}
            </span>
            <p className="mt-1.5 text-base font-bold leading-snug truncate" style={{ color: "var(--md-text-primary)" }}>{track.name}</p>
            <p className="text-sm leading-snug truncate" style={{ color: "var(--md-text-secondary)" }}>{track.artist["#text"]}</p>
            {track.album["#text"] && (
              <p className="text-xs leading-snug truncate" style={{ color: "var(--md-text-muted)" }}>{track.album["#text"]}</p>
            )}
            {track.date?.uts && (
              <p className="text-[10px] mt-1" style={{ color: "var(--md-text-muted)" }}>
                {new Date(Number(track.date.uts) * 1000).toLocaleString(undefined, {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "top" && albums.length > 0 && (
        <div className="space-y-2">
          {albums.map((album, i) => {
            const art = album.image?.find((img) => img.size === "medium")?.["#text"] || album.image?.[2]?.["#text"] || "";
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] w-4 shrink-0 text-center" style={{ color: "var(--md-text-muted)" }}>{i + 1}</span>
                {art ? (
                  <img src={art} alt="" className="w-8 h-8 rounded-[8px] object-cover shrink-0" aria-hidden="true" />
                ) : (
                  <div className="w-8 h-8 rounded-[8px] bg-white/6 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--md-text-primary)" }}>{album.name}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--md-text-muted)" }}>{album.artist.name}</p>
                </div>
                <span className="text-[10px] shrink-0" style={{ color: "var(--md-text-muted)" }}>{album.playcount}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "top" && albums.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: "var(--md-text-muted)" }} suppressHydrationWarning>{t("lastfm.none")}</p>
      )}
    </div>
  );
}
