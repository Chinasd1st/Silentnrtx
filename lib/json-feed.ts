/**
 * Minimal JSON Feed 1.x reader.
 * Spec: https://www.jsonfeed.org/version/1.1/
 */

export interface JsonFeedItem {
  id?: string;
  url?: string;
  external_url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  image?: string;
  date_published?: string;
  date_modified?: string;
  tags?: string[];
}

export interface JsonFeed {
  version?: string;
  title?: string;
  home_page_url?: string;
  feed_url?: string;
  items?: JsonFeedItem[];
}

export interface BlogPost {
  title: string;
  pubDate: string;
  link: string;
  description?: string;
  categories?: string[];
}

export function isJsonFeed(value: unknown): value is JsonFeed {
  if (!value || typeof value !== "object") return false;
  const feed = value as JsonFeed;
  return typeof feed.version === "string" && feed.version.includes("jsonfeed.org");
}

export function toBlogPosts(feed: JsonFeed, limit: number): BlogPost[] {
  const items = Array.isArray(feed.items) ? feed.items : [];
  return items
    .slice(0, limit)
    .map((item) => ({
      title: item.title?.trim() ?? "",
      pubDate: item.date_published ?? item.date_modified ?? "",
      link: item.url ?? item.external_url ?? item.id ?? "",
      description: item.summary || item.content_text || item.content_html || "",
      categories: item.tags?.filter(Boolean),
    }))
    .filter((post) => post.title && post.link);
}
