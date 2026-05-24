export const CACHE_KEYS = {
  WAKATIME: "wakatime",
  GITHUB_STATS: "github_stats",
  GITHUB_GRASS: "github_grass",
  MONKEYTYPE: "monkeytype",
  WEATHER: "weather",
  BG_URL: "bg_url",
  GH_VERSION: "gh_version_v2",
  BLOG_RSS: "blog_rss",
} as const;

export const CACHE_TTL = {
  WAKATIME: 15 * 60 * 1000,
  GITHUB_STATS: 30 * 60 * 1000,
  GITHUB_GRASS: 60 * 60 * 1000,
  MONKEYTYPE: 30 * 60 * 1000,
  WEATHER: 30 * 60 * 1000,
  EARTHQUAKE: 5 * 60 * 1000,
  REPOS: 30 * 60 * 1000,
  BG_URL: 720 * 60 * 1000,
  GH_VERSION: 120 * 60 * 1000,
  BLOG_RSS: 30 * 60 * 1000,
  LASTFM_ALBUMS: 5 * 60 * 1000,
} as const;

export const CACHE_PREFIXES = [
  "blog_",
  "github_",
  "monkeytype",
  "wakatime",
  "weather",
  "bg_",
  "gh_version",
  "gh_etag_",
  "eq_",
] as const;
