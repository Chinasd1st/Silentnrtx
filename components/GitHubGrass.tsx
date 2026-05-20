"use client";

import { useCallback, useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { ErrorCard } from "@/components/ErrorCard";
import { CardSkeleton } from "@/components/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";

interface D {
  contributionCount: number;
  contributionLevel: string;
  date: string;
  color: string;
}
interface R {
  contributions: D[][];
  totalContributions: number;
}

const CACHE_KEY = "github_grass";
const CACHE_TTL = 60 * 60 * 1000;

export function GitHubGrass() {
  const { t, i18n } = useTranslation();
  const [allDays, setAllDays] = useState<D[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchGrass = useCallback(() => {
    const username = siteConfig.github.username;
    if (!username) {
      setLoading(false);
      return;
    }

    const cached = getCache<R>(CACHE_KEY, CACHE_TTL);
    if (cached) {
      const flat = cached.contributions.flat();
      setAllDays(flat);
      setTotal(cached.totalContributions);
      setLoading(false);
      return;
    }

    fetchWithRetry(() => api.get<R>(`https://github-contributions-api.deno.dev/${username}.json`))
      .then(({ data }) => data)
      .then((data: R) => {
        const flat = data.contributions?.flat() || [];
        setAllDays(flat);
        setTotal(data.totalContributions || 0);
        setCache(CACHE_KEY, data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGrass();
  }, [fetchGrass]);

  const lc = (level: string) => {
    const hues = [
      "color-mix(in srgb, var(--md-primary) 0%, transparent)",
      "color-mix(in srgb, var(--md-primary) 20%, transparent)",
      "color-mix(in srgb, var(--md-primary) 40%, transparent)",
      "color-mix(in srgb, var(--md-primary) 65%, transparent)",
      "color-mix(in srgb, var(--md-primary) 100%, transparent)",
    ];
    const map: Record<string, string> = {
      NONE: "rgba(255,255,255,0.06)",
      FIRST_QUARTILE: hues[1],
      SECOND_QUARTILE: hues[2],
      THIRD_QUARTILE: hues[3],
      FOURTH_QUARTILE: hues[4],
    };
    return map[level] || "rgba(255,255,255,0.06)";
  };
  const isZh = i18n.language === "zh-CN";

  if (loading) return <CardSkeleton />;
  if (error || allDays.length === 0)
    return <ErrorCard title={t("github.contributions")} onRetry={fetchGrass} />;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-heading text-base font-semibold flex items-center gap-2"
          style={{ color: "var(--md-text-primary)" }}
        >
          <FaGithub style={{ color: "var(--md-primary)" }} />
          {t("github.contributions")}
        </h2>
        <span
          className="text-xs"
          style={{ color: "var(--md-text-muted)" }}
          suppressHydrationWarning
        >
          {isZh
            ? `${t("github.last_year")} ${total.toLocaleString()}`
            : `${total.toLocaleString()} ${t("github.last_year")}`}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(8px,1fr))] gap-[2px] sm:gap-[3px]">
        {allDays.map((day) => (
          <div
            key={day.date}
            className="aspect-square rounded-[1px] transition-colors duration-200 hover:scale-110 hover:z-10"
            style={{ backgroundColor: lc(day.contributionLevel) }}
            title={`${day.date}: ${day.contributionCount} contributions`}
          />
        ))}
      </div>
    </div>
  );
}
