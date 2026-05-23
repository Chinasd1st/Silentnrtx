"use client";

import { FaGithub } from "react-icons/fa";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { useSafeFetch } from "@/lib/hooks/useSafeFetch";
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
  const username = siteConfig.github.username;
  const { data, loading, error, execute } = useSafeFetch<R>({
    fetchFn: (signal) =>
      fetchWithRetry(() =>
        api.get<R>(`https://github-contributions-api.deno.dev/${username}.json`, { signal })
      ).then(({ data }) => data),
    cacheKey: CACHE_KEY,
    cacheTTL: CACHE_TTL,
    immediate: !!username,
  });

  const allDays = data?.contributions?.flat() ?? [];
  const total = data?.totalContributions ?? 0;

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

  if (!username) return null;
  if (loading) return <CardSkeleton />;
  if (error || allDays.length === 0)
    return <ErrorCard title={t("github.contributions")} onRetry={execute} />;

  return (
    <Card>
      <CardHeader
        icon={<FaGithub />}
        title={t("github.contributions")}
        className="mb-3"
        action={
          <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>
            {isZh
              ? `${t("github.last_year")} ${total.toLocaleString(i18n.language)}`
              : `${total.toLocaleString(i18n.language)} ${t("github.last_year")}`}
          </span>
        }
      />

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
    </Card>
  );
}
