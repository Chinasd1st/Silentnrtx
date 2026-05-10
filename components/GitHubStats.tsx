"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { githubApi } from "@/lib/githubApi";
import { fetchWithRetry, mapApiError } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaGithub, FaStar, FaCodeBranch, FaUsers, FaBook } from "react-icons/fa";

interface GU { public_repos: number; followers: number; html_url: string; }
interface GR { stargazers_count: number; forks_count: number; }

const CACHE_KEY = "github_stats";
const CACHE_TTL = 10 * 60 * 1000;

export function GitHubStats() {
  const { t } = useTranslation();
  const [data, setData] = useState<{ user: GU; stars: number; forks: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const username = siteConfig.github.username;
    if (!username) { setLoading(false); return; }

    const cached = getCache<{ user: GU; stars: number; forks: number }>(CACHE_KEY, CACHE_TTL);
    if (cached) { setData(cached); setLoading(false); return; }

    try {
      const { data: user } = await fetchWithRetry(() => githubApi.get<GU>(`/users/${username}`));
      const { data: repos } = await fetchWithRetry(() => githubApi.get<GR[]>(`/users/${username}/repos?per_page=100&sort=updated`)).catch(() => ({ data: [] as GR[] }));
      const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
      const forks = repos.reduce((s, r) => s + r.forks_count, 0);
      const d = { user, stars, forks };
      setData(d);
      setCache(CACHE_KEY, d);
    } catch (err) { setError(mapApiError(err).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <CardSkeleton />;
  if (error || !data) return <ErrorCard title={t("github.stats")} message={error || undefined} onRetry={fetchData} />;

  const { user, stars, forks } = data;

  return (
    <div className="md-card overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
            <FaGithub />{t("github.stats")}
          </h2>
          <a href={user.html_url} target="_blank" rel="noopener noreferrer"
            className="text-xs transition-colors" style={{ color: "var(--md-text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
            @{siteConfig.github.username} &rarr;
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SB icon={<FaBook />} label={t("github.repos")} value={user.public_repos} color="var(--md-accent-blue)" />
          <SB icon={<FaStar />} label={t("github.stars")} value={stars} color="var(--md-accent-yellow)" />
          <SB icon={<FaCodeBranch />} label={t("github.forks")} value={forks} color="var(--md-accent-green)" />
          <SB icon={<FaUsers />} label={t("github.followers")} value={user.followers} color="var(--md-accent-purple)" />
        </div>
      </div>
    </div>
  );
}

function SB({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-[16px] p-4 transition-all duration-200 hover:bg-white/6 hover:scale-[1.02]" style={{ backgroundColor: "var(--md-primary-008)" }}>
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--md-text-muted)" }}>
        <span style={{ color }}>{icon}</span>{label}
      </div>
      <p className="mt-1 text-2xl font-bold font-heading" style={{ color: "var(--md-text-primary)" }}>{value.toLocaleString()}</p>
    </div>
  );
}
