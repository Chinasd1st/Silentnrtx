export const siteConfig = {
  /** Theme hue (0-360). Affects primary color, surfaces, and card tones. */
  theme: {
    hue: 250,
  },

  seo: {
    title: "Silentnrtx",
    description: "Silentnrtx's personal homepage.",
    url: "https://silentnrtx.top",
    image: "https://silentnrtx.top/assets/avatar/SP6C_01.jpg",
    twitter: "@Silentnrtx",
  },

  profile: {
    name: "Silentnrtx",
    username: "silentnrtx",
    avatar: "SP6C_01.jpg",
    location: "Zhejiang, PRC",
    /** Signature shown in hero. Wrap text with !! to highlight in theme color. */
    signature: "Let Our Sounds !!Soar!! Through The Clouds!",
  },

  social: {
    bilibili: { url: "https://space.bilibili.com/520682236", username: "Silentnrtx_" },
    github: { url: "https://github.com/Chinasd1st", nickname: "Silentnrtx" },
    twitter: { url: "https://x.com/Silentnrtx", username: "Silentnrtx" },
    discord: { username: "silentnrtx" },
    osu: { url: "https://osu.ppy.sh/users/34040390", username: "Silentnrtx" },
    blog: { url: "https://silentnrtx.top", name: "Silentnrtx's Blog" },
    soundcloud: { url: "https://soundcloud.com/silentnrtx", username: "Silentnrtx" },
    bandcamp: { url: "https://bandcamp.com/silentnrtx", username: "Silentnrtx" },
    lastfm: { url: "https://www.last.fm/user/silentnrtx", username: "silentnrtx" },
  },

  lastfm: {
    apiKey: process.env.NEXT_PUBLIC_LAST_FM_API_KEY || "",
    username: process.env.NEXT_PUBLIC_LAST_FM_USERNAME || "silentnrtx",
  },

  github: { username: "Chinasd1st" },

  osu: {
    username: "Silentnrtx", mode: "mania",
    signatureUrl: "https://osu-sig.s23.moe/card?user=Silentnrtx&mode=mania&lang=en&animation=true&hue=200&flop=true",
  },

  blog: { rssUrl: "https://silentnrtx.top/rss", postLimit: 3 },

  background: {
    enabled: true, imageUrl: "", usePixiv: false, useBing: true,
    bingApi: "https://bing.biturl.top/", fallbackColor: "#0f0f14",
    blurAmount: 8, opacity: 0.4,
  },

  footer: {
    text: "Copyright © [year] Silentnrtx CC BY-NC-SA 4.0",
    customHtml: "",
  },

  gallery: {
    enabled: true, title: "Featured Gallery",
    images: [
      { url: "01.webp", description: "Feb 11, 2026", descriptionCn: "2026年2月11日" },
      { url: "02.webp", description: "Apr 30, 2026", descriptionCn: "2026年4月30日" },
    ],
  },

  music: {
    enabled: true, title: "Netease Playlist",
    api: "https://api.injahow.cn/meting/",
    params: { server: "netease", type: "playlist", id: "8374084247" },
  },

  busuanzi: { enabled: true },

  weather: { enabled: true, city: "Tongxiang" },

  /** Featured GitHub repos to showcase */
  repos: [
    { repo: "Chinasd1st/Silentnrtx", desc: "Personal homepage with MD3 style" },
    { repo: "Chinasd1st/Chinasd1st.github.io", desc: "Personal blog built with VuePress Theme Hope" },
  ],

  wakatime: {
    enabled: true,
    /** Embed ID for Coding Activity chart */
    embedId: "56247b3f-2af8-4855-95f6-0258665b4197",
    /** Embed ID for Languages chart (create from wakatime.com/share) */
    langEmbedId: "5882c88d-c8a5-45cd-b536-821a27c2ad55",
    username: "Silentnrtx",
  },

  monkeytype: {
    enabled: true,
    username: "Silentnrtx",
  },

};

export type SiteConfig = typeof siteConfig;
