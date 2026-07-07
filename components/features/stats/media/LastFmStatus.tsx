"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaLastfm } from "react-icons/fa";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { CACHE_TTL } from "@/lib/cache-config";
import { useTranslation } from "@/lib/i18n";

interface LastFmTrack {
  name: string;
  artist: { "#text": string };
  album: { "#text": string };
  image: Array<{ "#text": string; size: string }>;
  "@attr"?: { nowplaying: string };
  date?: { uts: string; "#text": string };
}
interface LastFmResponse {
  recenttracks: { track: LastFmTrack[] };
}

interface Album {
  name: string;
  playcount: string;
  artist: { name: string };
  image: Array<{ "#text": string; size: string }>;
}
interface TopAlbumsResponse {
  topalbums: { album: Album[] };
}

type Tab = "nowplaying" | "top";

interface ItunesResponse {
  resultCount: number;
  results: Array<{ artworkUrl100?: string }>;
}

export function LastFmStatus() {
  const { t, i18n } = useTranslation();
  const trackCache = useRef<{ data: LastFmTrack; time: number } | null>(null);
  const albumsCache = useRef<{ data: Album[]; time: number } | null>(null);
  const coverCache = useRef<Map<string, string>>(new Map());
  const [fallbackCover, setFallbackCover] = useState<string | null>(null);

  const [track, setTrack] = useState<LastFmTrack | null>(() => trackCache.current?.data ?? null);
  const [state, setState] = useState<"loading" | "playing" | "recent" | "error">(() =>
    trackCache.current
      ? trackCache.current.data["@attr"]?.nowplaying === "true"
        ? "playing"
        : "recent"
      : "loading"
  );
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tab, setTab] = useState<Tab>("nowplaying");

  const fetchTrack = useCallback(() => {
    const { apiKey, username } = siteConfig.lastfm;
    if (!apiKey || !username) {
      setState("error");
      return;
    }
    fetchWithRetry(() =>
      api.get<LastFmResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`
      )
    )
      .then(({ data }) => data)
      .then((data: LastFmResponse) => {
        const tracks = data.recenttracks?.track;
        if (!tracks?.[0]) {
          if (!trackCache.current) {
            setTrack(null);
            setState("error");
          }
          return;
        }
        const t = tracks[0];
        setTrack(t);
        setState(t["@attr"]?.nowplaying === "true" ? "playing" : "recent");
        trackCache.current = { data: t, time: Date.now() };
      })
      .catch(() => {
        if (!trackCache.current) {
          setTrack(null);
          setState("error");
        }
      });
  }, []);

  const fetchAlbums = useCallback(() => {
    const { apiKey, username } = siteConfig.lastfm;
    if (!apiKey || !username) return;
    const now = Date.now();
    if (albumsCache.current && now - albumsCache.current.time < CACHE_TTL.LASTFM_ALBUMS) {
      setAlbums(albumsCache.current.data);
      return;
    }
    fetchWithRetry(() =>
      api.get<TopAlbumsResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&period=7day&limit=10`
      )
    )
      .then(({ data }) => data)
      .then((data: TopAlbumsResponse) => {
        if (data?.topalbums?.album) {
          const seen = new Set<string>();
          const unique = data.topalbums.album.filter((a) => {
            const key = `${a.name}|${a.artist.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          const albums = unique.slice(0, 5);
          setAlbums(albums);
          albumsCache.current = { data: albums, time: now };
        }
      })
      .catch(() => {
        if (process.env.NODE_ENV === "development")
          console.warn("[LastFmStatus] fetchAlbums failed");
      });
  }, []);

  useEffect(() => {
    const cached = trackCache.current;
    if (cached) {
      setTrack(cached.data);
      setState(cached.data["@attr"]?.nowplaying === "true" ? "playing" : "recent");
    }
    fetchTrack();
    fetchAlbums();
  }, [fetchTrack, fetchAlbums]);

  useEffect(() => {
    if (tab !== "nowplaying") return;
    const POLL_MS = 2 * 60 * 1000;
    let timer: ReturnType<typeof setInterval> | null = null;

    const poll = () => {
      if (document.visibilityState === "visible") fetchTrack();
    };

    poll();
    timer = setInterval(poll, POLL_MS);

    const onVisChange = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [tab, fetchTrack]);

  const lastfmCover =
    (
      track?.image?.find((i) => i.size === "medium")?.["#text"] ||
      track?.image?.[2]?.["#text"] ||
      null
    )?.replace(/^http:\/\//, "https://") ?? null;

  useEffect(() => {
    if (lastfmCover || !track) {
      setFallbackCover(null);
      return;
    }
    const key = `${track.artist["#text"]}|${track.name}`;
    const cached = coverCache.current.get(key);
    if (cached) {
      setFallbackCover(cached);
      return;
    }
    const query = encodeURIComponent(`${track.artist["#text"]} ${track.name}`);
    fetchWithRetry(() =>
      api.get<ItunesResponse>(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)
    )
      .then(({ data }) => {
        const url = data?.results?.[0]?.artworkUrl100?.replace(/100x100bb/, "300x300bb");
        if (url) {
          coverCache.current.set(key, url);
          setFallbackCover(url);
        }
      })
      .catch(() => {});
  }, [lastfmCover, track]);

  const albumArt = lastfmCover || fallbackCover;

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
          <h2
            className="font-heading text-lg font-semibold"
            style={{ color: "var(--md-text-primary)" }}
          >
            {t("lastfm.title")}
          </h2>
        </div>
        <a
          href={siteConfig.social.lastfm.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs shrink-0 transition-colors hover:text-[var(--md-primary)]"
          style={{ color: "var(--md-text-muted)" }}
        >
          {t("lastfm.profile")} &rarr;
        </a>
      </div>

      <div className="flex gap-1 mb-4">
        <button
          type="button"
          onClick={() => setTab("nowplaying")}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer hover:bg-[var(--md-primary-008)]"
          style={{
            backgroundColor: tab === "nowplaying" ? activeBg : inactiveBg,
            color: tab === "nowplaying" ? activeFg : inactiveFg,
          }}
        >
          {t("lastfm.now_playing")}
        </button>
        <button
          type="button"
          onClick={() => setTab("top")}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer hover:bg-[var(--md-primary-008)]"
          style={{
            backgroundColor: tab === "top" ? activeBg : inactiveBg,
            color: tab === "top" ? activeFg : inactiveFg,
          }}
        >
          {t("lastfm.top_albums")}
        </button>
      </div>

      {tab === "nowplaying" && track && (
        <div className="flex items-center gap-4" aria-live="polite">
          <div className="relative w-16 h-16 shrink-0">
            <div className="absolute inset-0 flex items-center justify-center rounded-[16px] bg-white/6 text-2xl opacity-40">
              &#9835;
            </div>
            {albumArt && (
              <img
                src={albumArt}
                alt={track.album["#text"]}
                loading="lazy"
                className="absolute inset-0 w-full h-full rounded-[16px] object-cover shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            {state === "playing" && (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500"
                style={{ boxShadow: "0 0 0 2px var(--md-card-bg)" }}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse-glow" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor:
                  state === "playing"
                    ? "color-mix(in srgb, var(--md-accent-green) 15%, transparent)"
                    : "var(--md-primary-012)",
                color: state === "playing" ? "var(--md-accent-green)" : c,
              }}
            >
              {state === "playing" ? t("lastfm.now_playing") : t("lastfm.last_played")}
            </span>
            <p
              className="mt-1.5 text-base font-bold leading-snug truncate"
              style={{ color: "var(--md-text-primary)" }}
            >
              {track.name}
            </p>
            <p
              className="text-sm leading-snug truncate"
              style={{ color: "var(--md-text-secondary)" }}
            >
              {track.artist["#text"]}
            </p>
            {track.album["#text"] && (
              <p
                className="text-xs leading-snug truncate"
                style={{ color: "var(--md-text-muted)" }}
              >
                {track.album["#text"]}
              </p>
            )}
            {track.date?.uts && (
              <p className="text-[10px] mt-1" style={{ color: "var(--md-text-muted)" }}>
                {new Date(Number(track.date.uts) * 1000).toLocaleString(i18n.language, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "top" && albums.length > 0 && (
        <div className="space-y-2">
          {albums.map((album, i) => {
            const art = (
              album.image?.find((img) => img.size === "medium")?.["#text"] ||
              album.image?.[2]?.["#text"] ||
              ""
            ).replace(/^http:\/\//, "https://");
            return (
              <div key={`${album.name}-${album.artist.name}`} className="flex items-center gap-3">
                <span
                  className="text-[10px] w-4 shrink-0 text-center"
                  style={{ color: "var(--md-text-muted)" }}
                >
                  {i + 1}
                </span>
                {art ? (
                  <img
                    src={art}
                    alt=""
                    loading="lazy"
                    className="w-8 h-8 rounded-[8px] object-cover shrink-0"
                    aria-hidden="true"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-[8px] bg-white/6 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--md-text-primary)" }}
                  >
                    {album.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "var(--md-text-muted)" }}>
                    {album.artist.name}
                  </p>
                </div>
                <span className="text-[10px] shrink-0" style={{ color: "var(--md-text-muted)" }}>
                  {album.playcount}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "top" && albums.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: "var(--md-text-muted)" }}>
          {t("lastfm.none")}
        </p>
      )}
    </div>
  );
}
