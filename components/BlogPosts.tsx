"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "@/lib/i18n";
import { getCache, setCache } from "@/lib/cache";
import { ErrorCard } from "@/components/ErrorCard";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

interface RssItem {
  title: string;
  pubDate: string;
  link: string;
  description?: string;
  categories?: string[];
  thumbnail?: string;
}

interface RssResponse {
  status: string;
  feed: { title: string; url: string };
  items: RssItem[];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function descText(description: string) {
  const text = stripHtml(description);
  if (!text || /^<img/i.test(description.trim())) return "";
  return text;
}

export function BlogPosts() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const rssUrl = siteConfig.blog.rssUrl;
    if (!rssUrl) { setLoading(false); setError(true); return; }

    const cached = getCache<RssItem[]>("blog_rss", 30 * 60 * 1000);
    if (cached) { setPosts(cached); setLoading(false); return; }

    fetchWithTimeout(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
      .then((r) => r.json())
      .then((data: RssResponse) => {
        if (data.status === "ok") { const items = data.items.slice(0, siteConfig.blog.postLimit); setPosts(items); setCache("blog_rss", items); }
        else throw new Error("RSS parse failed");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [retryKey]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
          <FaGlobe style={{ color: "var(--md-primary)" }} />
          {t("blog.title")}
        </h2>
        <a href={siteConfig.social.blog.url} target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors" style={{ color: "var(--md-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
          {t("blog.view_all")} &rarr;
        </a>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-3/4 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-white/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <ErrorCard title={t("blog.error")} onRetry={() => setRetryKey((k) => k + 1)} />
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm" style={{ color: "var(--md-text-secondary)" }}>{t("blog.empty")}</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <a key={idx} href={post.link} target="_blank" rel="noopener noreferrer"
              className="block rounded-[16px] p-4 transition-all duration-200 hover:bg-white/[0.06] hover:translate-x-1">
              <h3 className="font-medium text-sm leading-snug line-clamp-2" style={{ color: "var(--md-text-primary)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-primary)"}>
                {post.title}
              </h3>
              {post.description && descText(post.description) && (
                <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--md-text-muted)" }}>
                  {descText(post.description)}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs" style={{ color: "var(--md-text-secondary)" }}>{formatDate(post.pubDate)}</span>
                {post.categories && post.categories.length > 0 && (
                  <>
                    <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>&middot;</span>
                    {post.categories.slice(0, 2).map((cat, i) => (
                      <span key={i} className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: "rgba(208,188,255,0.1)", color: "var(--md-primary)" }}>
                        {cat}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
