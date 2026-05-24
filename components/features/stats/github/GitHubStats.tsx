"use client";

import { FaBook, FaCodeBranch, FaGithub, FaStar, FaUsers } from "react-icons/fa";
import { CachedAt } from "@/components/ui/CachedAt";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { fetchWithRetry, mapApiError } from "@/lib/api";
import { githubApi } from "@/lib/api/github";
import { useSafeFetch } from "@/lib/hooks/useSafeFetch";
import { useTranslation } from "@/lib/i18n";

interface GU {
  public_repos: number;
  followers: number;
  html_url: string;
}
interface GR {
  stargazers_count: number;
  forks_count: number;
}

interface StatsData {
  user: GU;
  stars: number;
  forks: number;
}

const CACHE_KEY = "github_stats";
const CACHE_TTL = 10 * 60 * 1000;

export function GitHubStats() {
  const { t, i18n } = useTranslation();
  const username = siteConfig.github.username;
  const { data, loading, error, execute } = useSafeFetch<StatsData, string>({
    fetchFn: async (signal) => {
      const { data: user } = await fetchWithRetry(() =>
        githubApi.get<GU>(`/users/${username}`, { signal })
      );
      const { data: repos } = await fetchWithRetry(() =>
        githubApi.get<GR[]>(`/users/${username}/repos?per_page=100&sort=updated`, { signal })
      ).catch(() => ({ data: [] as GR[] }));
      const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
      const forks = repos.reduce((s, r) => s + r.forks_count, 0);
      return { user, stars, forks };
    },
    cacheKey: CACHE_KEY,
    cacheTTL: CACHE_TTL,
    errorMap: (err) => mapApiError(err).message,
    immediate: !!username,
  });

  if (!username) return null;
  if (loading) return <CardSkeleton />;
  if (error || !data)
    return <ErrorCard title={t("github.stats")} message={error || undefined} onRetry={execute} />;

  const { user, stars, forks } = data;

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
      </div>
      <div className="relative z-10">
        <CardHeader
          icon={<FaGithub />}
          title={t("github.stats")}
          action={
            <ExternalLink href={user.html_url}>@{siteConfig.github.username} &rarr;</ExternalLink>
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <SB
            icon={<FaBook />}
            label={t("github.repos")}
            value={user.public_repos}
            color="var(--md-accent-blue)"
            locale={i18n.language}
          />
          <SB
            icon={<FaStar />}
            label={t("github.stars")}
            value={stars}
            color="var(--md-accent-yellow)"
            locale={i18n.language}
          />
          <SB
            icon={<FaCodeBranch />}
            label={t("github.forks")}
            value={forks}
            color="var(--md-accent-green)"
            locale={i18n.language}
          />
          <SB
            icon={<FaUsers />}
            label={t("github.followers")}
            value={user.followers}
            color="var(--md-accent-purple)"
            locale={i18n.language}
          />
        </div>
      </div>
      <CachedAt cacheKey={CACHE_KEY} />
    </Card>
  );
}

function SB({
  icon,
  label,
  value,
  color,
  locale,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  locale: string;
}) {
  return (
    <div
      className="rounded-[16px] p-4 transition-all duration-200 hover:bg-white/6 hover:scale-[1.02]"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--md-text-muted)" }}>
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <p
        className="mt-1 text-2xl font-bold font-heading"
        style={{ color: "var(--md-text-primary)" }}
      >
        {value.toLocaleString(locale)}
      </p>
    </div>
  );
}
