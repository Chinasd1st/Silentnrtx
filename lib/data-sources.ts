/**
 * Every remote feed the homepage reads from, rendered by `/sources`.
 * Keep this in sync with `config.ts` and the cards that consume each API.
 */
export type SourceCategory = "coding" | "music" | "weather" | "seismic" | "content" | "analytics";

export type SourceAuth = "public" | "key" | "none";

export interface DataSource {
  id: string;
  /** Proper noun — stays untranslated. */
  name: string;
  url: string;
  category: SourceCategory;
  auth: SourceAuth;
  /** Cache TTL in minutes; omit for live or static feeds. */
  cacheMin?: number;
  descKey: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: "github",
    name: "GitHub REST API",
    url: "https://api.github.com",
    category: "coding",
    auth: "public",
    cacheMin: 10,
    descKey: "sources.desc_github",
  },
  {
    id: "wakatime",
    name: "WakaTime Embed JSON",
    url: "https://wakatime.com/share",
    category: "coding",
    auth: "none",
    cacheMin: 5,
    descKey: "sources.desc_wakatime",
  },
  {
    id: "monkeytype",
    name: "Monkeytype API",
    url: "https://api.monkeytype.com",
    category: "coding",
    auth: "public",
    cacheMin: 5,
    descKey: "sources.desc_monkeytype",
  },
  {
    id: "lastfm",
    name: "Last.fm API",
    url: "https://www.last.fm/api",
    category: "music",
    auth: "key",
    cacheMin: 5,
    descKey: "sources.desc_lastfm",
  },
  {
    id: "meting",
    name: "Meting API",
    url: "https://api.moeyao.cn/meting/",
    category: "music",
    auth: "public",
    cacheMin: 30,
    descKey: "sources.desc_meting",
  },
  {
    id: "itunes",
    name: "iTunes Search API",
    url: "https://itunes.apple.com/search",
    category: "music",
    auth: "public",
    cacheMin: 5,
    descKey: "sources.desc_itunes",
  },
  {
    id: "osu",
    name: "osu! Signature",
    url: "https://osu-sig.s23.moe",
    category: "music",
    auth: "public",
    descKey: "sources.desc_osu",
  },
  {
    id: "wttr",
    name: "wttr.in",
    url: "https://wttr.in",
    category: "weather",
    auth: "public",
    cacheMin: 30,
    descKey: "sources.desc_wttr",
  },
  {
    id: "openmeteo",
    name: "Open-Meteo",
    url: "https://open-meteo.com",
    category: "weather",
    auth: "none",
    cacheMin: 30,
    descKey: "sources.desc_openmeteo",
  },
  {
    id: "wolfx",
    name: "JMA / CENC · wolfx.jp",
    url: "https://api.wolfx.jp",
    category: "seismic",
    auth: "public",
    cacheMin: 5,
    descKey: "sources.desc_wolfx",
  },
  {
    id: "typhoon",
    name: "JMA Typhoon",
    url: "https://www.jma.go.jp/bosai/typhoon/",
    category: "seismic",
    auth: "none",
    cacheMin: 15,
    descKey: "sources.desc_typhoon",
  },
  {
    id: "feed",
    name: "JSON Feed",
    url: "https://silentnrtx.top/feed.json",
    category: "content",
    auth: "none",
    cacheMin: 30,
    descKey: "sources.desc_feed",
  },
  {
    id: "vercount",
    name: "Vercount",
    url: "https://vercount.one",
    category: "analytics",
    auth: "none",
    descKey: "sources.desc_vercount",
  },
  {
    id: "analytics",
    name: "Umami · Clarity",
    url: "https://umami.is",
    category: "analytics",
    auth: "none",
    descKey: "sources.desc_analytics",
  },
];

export const SOURCE_CATEGORIES: SourceCategory[] = [
  "coding",
  "music",
  "weather",
  "seismic",
  "content",
  "analytics",
];
