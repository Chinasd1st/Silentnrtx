"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaGithub } from "react-icons/fa";

interface D { contributionCount: number; contributionLevel: string; date: string; color: string; }
interface R { contributions: D[][]; totalContributions: number; }

const CACHE_KEY = "github_grass";
const CACHE_TTL = 60 * 60 * 1000;

export function GitHubGrass() {
  const { t, i18n } = useTranslation();
  const [weeks, setWeeks] = useState<D[][]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchGrass = useCallback(() => {
    const username = siteConfig.github.username;
    if (!username) { setLoading(false); return; }

    const cached = getCache<R>(CACHE_KEY, CACHE_TTL);
    if (cached) { setWeeks(cached.contributions); setTotal(cached.totalContributions); setLoading(false); return; }

    fetchWithTimeout(`https://github-contributions-api.deno.dev/${username}.json`)
      .then((r) => r.json())
      .then((data: R) => {
        setWeeks(data.contributions || []);
        setTotal(data.totalContributions || 0);
        setCache(CACHE_KEY, data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGrass(); }, [fetchGrass]);

  const lc = (level: string) => {
    const map: Record<string, string> = {
      NONE: "var(--md-grass-0)",
      FIRST_QUARTILE: "var(--md-grass-1)",
      SECOND_QUARTILE: "var(--md-grass-2)",
      THIRD_QUARTILE: "var(--md-grass-3)",
      FOURTH_QUARTILE: "var(--md-grass-4)",
    };
    return map[level] || "var(--md-grass-0)";
  };
  const isZh = i18n.language === "zh-CN";

  if (loading) return <CardSkeleton />;
  if (error || weeks.length === 0) return <ErrorCard title={t("github.contributions")} onRetry={fetchGrass} />;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
          <FaGithub style={{ color: "var(--md-primary)" }} />{t("github.contributions")}
        </h2>
        <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>
          {isZh ? `${t("github.last_year")} ${total.toLocaleString()}` : `${total.toLocaleString()} ${t("github.last_year")}`}
        </span>
      </div>

      <div className="overflow-x-auto pb-1 grass-scroll">
        <div className="flex gap-[2px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day, di) => (
                <div key={di} className="h-[10px] w-[10px] rounded-sm transition-colors duration-200 hover:scale-150 hover:z-10 relative"
                  style={{ backgroundColor: lc(day.contributionLevel) }}
                  title={`${day.date}: ${day.contributionCount} contributions`} />
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
