"use client";

import { SiMonkeytype } from "react-icons/si";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { useSafeFetch } from "@/lib/hooks/useSafeFetch";
import { useTranslation } from "@/lib/i18n";

interface PBEntry {
  wpm: number;
  acc: number;
  language: string;
  numbers: boolean;
  punctuation: boolean;
}
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
  const { t, i18n } = useTranslation();
  const cfg = siteConfig.monkeytype;
  const { data, loading, error, execute } = useSafeFetch<ProfileData>({
    fetchFn: (signal) =>
      fetchWithRetry(() =>
        api.get(`https://api.monkeytype.com/users/${cfg.username}/profile`, {
          signal,
          headers: { "Cache-Control": "no-cache" },
        })
      ).then((r) => {
        if (r.data?.message === "Profile retrieved" && r.data?.data) return r.data.data;
        throw new Error("api_error");
      }),
    cacheKey: CACHE_KEY,
    cacheTTL: CACHE_TTL,
    immediate: cfg.enabled,
  });

  if (!cfg.enabled) return null;
  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("monkeytype.title")} onRetry={execute} />;

  const best15 = bestOf(data?.personalBests?.time?.["15"]);
  const best60 = bestOf(data?.personalBests?.time?.["60"]);
  const stats = data?.typingStats;
  const hours = stats ? Math.round(stats.timeTyping / 3600) : 0;
  const c = "var(--md-primary)";

  return (
    <Card>
      <CardHeader
        icon={<SiMonkeytype />}
        title={t("monkeytype.title")}
        action={
          <ExternalLink href={`https://monkeytype.com/profile/${cfg.username}`}>
            @{cfg.username} &rarr;
          </ExternalLink>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Mini
          num={best15?.wpm}
          acc={best15?.acc}
          label="15s"
          color={c}
          unit={t("monkeytype.wpm")}
        />
        <Mini
          num={best60?.wpm}
          acc={best60?.acc}
          label="60s"
          color={c}
          unit={t("monkeytype.wpm")}
        />
      </div>

      {stats && (
        <div
          className="rounded-[16px] p-2 text-center"
          style={{ backgroundColor: "var(--md-primary-008)" }}
        >
          <span className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
            {t("monkeytype.stats", {
              tests: stats.completedTests.toLocaleString(i18n.language),
              hours,
            })}
          </span>
        </div>
      )}
    </Card>
  );
}

function Mini({
  num,
  acc,
  label,
  color,
  unit,
}: {
  num?: number;
  acc?: number;
  label: string;
  color: string;
  unit: string;
}) {
  return (
    <div
      className="rounded-[16px] p-3 text-center"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
      <p className="text-xl font-bold font-heading mt-1" style={{ color }}>
        {num ?? "--"}
      </p>
      <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
        {acc ? `${acc}%` : unit}
      </p>
    </div>
  );
}
