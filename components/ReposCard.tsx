"use client";

import { useEffect, useState, useMemo } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { githubApi } from "@/lib/githubApi";
import { fetchWithRetry, mapApiError } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaGithub, FaStar, FaCodeBranch, FaExclamationTriangle } from "react-icons/fa";

interface RepoData {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

interface RepoConfig {
  repo: string;
  desc?: string;
}

const CACHE_TTL = 30 * 60 * 1000;

function getCacheKey(list: RepoConfig[]): string {
  const hash = list.map(r => r.repo).join("|");
  let s = 0;
  for (let i = 0; i < hash.length; i++) s = ((s << 5) - s + hash.charCodeAt(i)) | 0;
  return `github_repos_${s}`;
}

export function ReposCard() {
  const { t } = useTranslation();
  const [repos, setRepos] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const list: RepoConfig[] = siteConfig.repos || [];

  const cacheKey = useMemo(() => getCacheKey(list), [list]);

  useEffect(() => {
    if (list.length === 0) { setLoading(false); return; }

    const cached = getCache<RepoData[]>(cacheKey, CACHE_TTL);
    if (cached) { setRepos(cached); setLoading(false); return; }

    Promise.allSettled(
      list.map((r) => fetchWithRetry(() => githubApi.get(`/repos/${r.repo}`)).then((x) => x.data))
    ).then((results) => {
      const data: RepoData[] = [];
      let hasError = false;
      let rateLimited = false;
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value?.name) data.push(r.value);
        else if (r.status === "rejected" || (r.status === "fulfilled" && !r.value?.name)) {
          hasError = true;
          const err = r.status === "rejected" ? r.reason : r.value;
          const code = mapApiError(err).message;
          if (code === "rate_limit") rateLimited = true;
        }
      });
      if (data.length > 0) { setRepos(data); setCache(cacheKey, data); }
      else setError(rateLimited ? "rate_limit" : "api_error");
      setLoading(false);
    });
  }, [cacheKey, list]);

  if (list.length === 0) return null;
  if (loading) return <CardSkeleton />;
  if (error) {
    const msg = error === "rate_limit" ? t("github.rate_limit") : error === "not_found" ? t("github.not_found") : t("github.error");
    return <ErrorCard title={t("github.repos")} message={msg} />;
  }
  if (repos.length === 0) return <ErrorCard title={t("github.repos")} />;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <FaGithub className="text-lg shrink-0" style={{ color: "var(--md-primary)" }} />
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>{t("github.repos")}</h2>
        </div>
      </div>

      <div className="space-y-3">
        {repos.map((repo) => {
          const cfg = list.find(l => l.repo === `Chinasd1st/${repo.name}` || l.repo.endsWith(`/${repo.name}`));
          const desc = cfg?.desc || repo.description || "—";
          return (
          <a key={repo.name} href={repo.html_url} target="_blank" rel="noopener noreferrer"
            className="block rounded-[16px] p-4 transition-all duration-200 hover:bg-white/[0.06] hover:translate-x-1">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--md-text-primary)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-primary)"}>
              {repo.name}
            </p>
            <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--md-text-muted)" }}>
              {desc}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: "var(--md-text-muted)" }}>
              {repo.language && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColor(repo.language) }} />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1"><FaStar size={9} />{repo.stargazers_count}</span>
              <span className="flex items-center gap-1"><FaCodeBranch size={9} />{repo.forks_count}</span>
            </div>
          </a>
          );
        })}
      </div>
    </div>
  );
}

function langColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572a5",
    HTML: "#e34c26", CSS: "#563d7c", Rust: "#dea584",
    Go: "#00add8", Ruby: "#701516", Java: "#b07219",
    C: "#555555", "C++": "#f34b7d", Shell: "#89e051",
  };
  return colors[lang] || "var(--md-text-muted)";
}
