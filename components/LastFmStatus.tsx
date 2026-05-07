"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
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

export function LastFmStatus() {
  const { t } = useTranslation();
  const [track, setTrack] = useState<LastFmTrack | null>(null);
  const [state, setState] = useState<"loading" | "playing" | "recent" | "error">("loading");

  const fetchTrack = useCallback(() => {
    const { apiKey, username } = siteConfig.lastfm;
    if (!apiKey || !username) { setState("error"); return; }

    fetchWithTimeout(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`)
      .then((r) => r.json())
      .then((data: LastFmResponse) => {
        const tracks = data.recenttracks?.track;
        if (!tracks?.[0]) { setTrack(null); setState("error"); return; }
        const t = tracks[0];
        const s = t["@attr"]?.nowplaying === "true" ? "playing" : "recent";
        setTrack(t); setState(s);
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
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
          <FaLastfm style={{ color: "var(--md-primary)" }} />{t("lastfm.title")}
        </h2>
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
              <img src={albumArt} alt={track.album["#text"]} loading="lazy" className="h-16 w-16 rounded-[16px] object-cover shadow-md"
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
              style={{ backgroundColor: state === "playing" ? "color-mix(in srgb, var(--md-accent-green) 15%, transparent)" : "var(--md-primary-012)", color: state === "playing" ? "var(--md-accent-green)" : "var(--md-primary)" }}>
              {state === "playing" ? t("lastfm.now_playing") : t("lastfm.last_played")}
            </span>
            <p className="mt-1.5 text-base font-bold leading-snug truncate" style={{ color: "var(--md-text-primary)" }}>{track.name}</p>
            <p className="text-sm leading-snug truncate" style={{ color: "var(--md-text-secondary)" }}>{track.artist["#text"]}</p>
            {track.album["#text"] && (
              <p className="text-xs leading-snug truncate" style={{ color: "var(--md-text-muted)" }}>
{track.album["#text"]}
              </p>
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
    </div>
  );
}
