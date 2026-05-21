"use client";

import { FaGlobe } from "react-icons/fa";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { useSafeFetch } from "@/lib/hooks/useSafeFetch";
import { useTranslation } from "@/lib/i18n";

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
  const rssUrl = siteConfig.blog.rssUrl;
  const {
    data: posts,
    loading,
    error,
    execute,
  } = useSafeFetch<RssItem[]>({
    fetchFn: (signal) =>
      fetchWithRetry(() =>
        api.get<RssResponse>(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
          { signal }
        )
      ).then(({ data }) => {
        if (data.status === "ok") return data.items.slice(0, siteConfig.blog.postLimit);
        throw new Error("RSS parse failed");
      }),
    cacheKey: "blog_rss",
    cacheTTL: 30 * 60 * 1000,
    immediate: !!rssUrl,
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const hasPosts = posts && posts.length > 0;

  return (
    <Card>
      <CardHeader
        icon={<FaGlobe />}
        title={t("blog.title")}
        action={
          <ExternalLink href={siteConfig.social.blog.url}>{t("blog.view_all")} &rarr;</ExternalLink>
        }
      />

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-3/4 rounded-sm bg-white/6 animate-pulse" />
              <div className="h-3 w-1/3 rounded-sm bg-white/6 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && <ErrorCard title={t("blog.error")} onRetry={execute} />}

      {!loading && !error && !hasPosts && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p
            className="text-sm"
            style={{ color: "var(--md-text-secondary)" }}
            suppressHydrationWarning
          >
            {t("blog.empty")}
          </p>
        </div>
      )}

      {!loading && !error && hasPosts && (
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.link}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[16px] p-4 transition-all duration-200 hover:bg-white/6 hover:translate-x-1"
            >
              <h3
                className="font-medium text-sm leading-snug line-clamp-2"
                style={{ color: "var(--md-text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--md-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--md-text-primary)")}
              >
                {post.title}
              </h3>
              {post.description && descText(post.description) && (
                <p
                  className="mt-1 text-xs leading-relaxed line-clamp-2"
                  style={{ color: "var(--md-text-muted)" }}
                >
                  {descText(post.description)}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs" style={{ color: "var(--md-text-secondary)" }}>
                  {formatDate(post.pubDate)}
                </span>
                {post.categories && post.categories.length > 0 && (
                  <>
                    <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>
                      &middot;
                    </span>
                    {post.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: "rgba(208,188,255,0.1)",
                          color: "var(--md-primary)",
                        }}
                      >
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
    </Card>
  );
}
