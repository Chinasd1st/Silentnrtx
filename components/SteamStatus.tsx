"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaSteam } from "react-icons/fa";

interface Player {
  personaname: string;
  avatar: string;
  personastate: number;
  gameextrainfo?: string;
  gameid?: string;
}

const CACHE_KEY = "steam";
const CACHE_TTL = 2 * 60 * 1000;

export function SteamStatus() {
  const { t } = useTranslation();
  const STATE_LABELS: Record<number, string> = {
    0: t("steam.offline"), 1: t("steam.online"), 2: t("steam.busy"), 3: t("steam.away"), 4: t("steam.snooze"),
  };
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cfg = siteConfig.steam;

  const fetchStatus = useCallback(() => {
    if (!cfg.enabled || !cfg.apiKey || !cfg.steamid) { setLoading(false); return; }

    const cached = getCache<Player>(CACHE_KEY, CACHE_TTL);
    if (cached) { setPlayer(cached); setLoading(false); return; }

    fetchWithTimeout(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${cfg.apiKey}&steamids=${cfg.steamid}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data?.response?.players?.[0];
        if (p) { setPlayer(p); setCache(CACHE_KEY, p); }
        else throw new Error("no player");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cfg.enabled, cfg.apiKey, cfg.steamid]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("steam.title")} onRetry={fetchStatus} />;
  if (!player) return null;

  const inGame = !!player.gameextrainfo;
  const stateLabel = STATE_LABELS[player.personastate] || "Offline";
  const isOnline = player.personastate > 0;

  return (
    <div className="md-card">
      <div className="flex items-center gap-3 mb-4">
        <FaSteam className="text-lg shrink-0" style={{ color: inGame ? "var(--md-primary)" : "var(--md-text-muted)" }} />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold truncate" style={{ color: "var(--md-text-primary)" }}>
            {t("steam.title")}
          </h2>
        </div>
      </div>

      {inGame ? (
        <div className="rounded-[16px] p-3" style={{ backgroundColor: "var(--md-primary-012)" }}>
          <p className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>{t("steam.ingame")}</p>
          <p className="mt-1 text-sm font-semibold truncate" style={{ color: "var(--md-text-primary)" }}>
            {player.gameextrainfo}
          </p>
          <p className="mt-3 text-xs" style={{ color: "var(--md-text-muted)" }}>
            <a href={`https://steamcommunity.com/profiles/${cfg.steamid}`} target="_blank" rel="noopener noreferrer"
              className="hover:underline" style={{ color: "var(--md-text-muted)" }}>
              {t("steam.view_profile")} &rarr;
            </a>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? "animate-pulse-glow" : ""}`}
            style={{ backgroundColor: isOnline ? "#22c55e" : "var(--md-text-muted)" }} />
          <span className="text-sm" style={{ color: "var(--md-text-secondary)" }}>
            {stateLabel}
          </span>
        </div>
      )}
    </div>
  );
}
