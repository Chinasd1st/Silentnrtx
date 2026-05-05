"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { SiMonkeytype } from "react-icons/si";
import { useTranslation } from "@/lib/i18n";

interface PBEntry { wpm: number; acc: number; language: string; numbers: boolean; punctuation: boolean; }
interface ProfileData {
  personalBests?: { time?: Record<string, PBEntry[]> };
  typingStats?: { completedTests: number; timeTyping: number };
  xp?: number;
}

const CACHE_KEY = "monkeytype";
const CACHE_TTL = 5 * 60 * 1000;

function bestOf(pbs: PBEntry[] | undefined): PBEntry | undefined {
  return pbs?.find((e) => e.language === "english" && !e.numbers && !e.punctuation);
}

export function MonkeytypeCard() {
  const { t } = useTranslation();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cfg = siteConfig.monkeytype;

  const fetchProfile = useCallback(async () => {
    if (!cfg.enabled) { setLoading(false); return; }
    const cached = getCache<ProfileData>(CACHE_KEY, CACHE_TTL);
    if (cached) { setData(cached); setLoading(false); return; }

    try {
      const res = await fetchWithTimeout(
        `https://api.monkeytype.com/users/${cfg.username}/profile`,
        { cache: "reload" }
      );
      const json = await res.json();
      if (json.message === "Profile retrieved" && json.data) {
        setData(json.data);
        setCache(CACHE_KEY, json.data);
      } else throw new Error("api error");
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [cfg.enabled, cfg.username]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("monkeytype.title")} onRetry={fetchProfile} />;

  const best15 = bestOf(data?.personalBests?.time?.["15"]);
  const best60 = bestOf(data?.personalBests?.time?.["60"]);
  const stats = data?.typingStats;
  const hours = stats ? Math.round(stats.timeTyping / 3600) : 0;
  const c = "var(--md-primary)";

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <SiMonkeytype className="text-lg shrink-0" style={{ color: c }} />
          <h3 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>{t("monkeytype.title")}</h3>
        </div>
        <a href={`https://monkeytype.com/profile/${cfg.username}`} target="_blank" rel="noopener noreferrer"
          className="text-xs shrink-0 transition-colors" style={{ color: "var(--md-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
          @{cfg.username} &rarr;
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Mini num={best15?.wpm} acc={best15?.acc} label="15s" color={c} unit={t("monkeytype.wpm")} />
        <Mini num={best60?.wpm} acc={best60?.acc} label="60s" color={c} unit={t("monkeytype.wpm")} />
      </div>

      {stats && (
        <div className="rounded-[12px] p-2 text-center" style={{ backgroundColor: "var(--md-primary-008)" }}>
          <span className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
            {stats.completedTests.toLocaleString()} {t("monkeytype.tests")} · {hours}{t("monkeytype.hours")} {t("monkeytype.typed")}
          </span>
        </div>
      )}
    </div>
  );
}

function Mini({ num, acc, label, color, unit }: { num?: number; acc?: number; label: string; color: string; unit: string }) {
  return (
    <div className="rounded-[12px] p-3 text-center" style={{ backgroundColor: "var(--md-primary-008)" }}>
      <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>{label}</p>
      <p className="text-xl font-bold font-heading mt-1" style={{ color }}>{num ?? "--"}</p>
      <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>{acc ? `${acc}%` : unit}</p>
    </div>
  );
}
