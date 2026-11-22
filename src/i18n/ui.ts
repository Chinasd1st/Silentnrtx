export const languages = { en: "English", zh: "中文" } as const;
export type Lang = keyof typeof languages;
export type L10n = Record<Lang, string>;

/** Motto shown under the hero (same in every language — it's a quote). */
const motto = {
  text: "あぁ、馬鹿みたいに音楽を。",
  href: "https://x.com/muyu_pianoN/status/2124117157600690457",
};

const ui = {
  en: {
    motto,
    meta: {
      site: "Silentnrtx",
      description: "Silentnrtx — where to find me.",
    },
    skip: "Skip to content",
    nav: { label: "Main", home: "Home", about: "About", gallery: "Gallery", contact: "Contact" },
    lang: { label: "Language" },
    theme: { prefix: "Theme", system: "follow system", light: "light", dark: "dark" },
    hero: {
      eyebrow: "Personal site",
      ctaAbout: "About me",
      ctaContact: "Contact",
      avatarAlt: "Silentnrtx's avatar",
    },
    about: {
      title: "About",
      /** Each string is one line of the intro. */
      intro: ["A bored, post-modern internet lunatic.", "A maker of far-fetched ideas."],
      credit: { label: "Avatar illustration", by: "by" },
      hobbiesTitle: "Hobbies",
      hobbies: {
        svp: { title: "Synthesizer V tuning", note: "Plus a basic mixing workflow" },
        mmd: { title: "Blender", note: "MMD production" },
        photo: { title: "Photography", note: "Sony α7 IV" },
        music: { title: "Doujin music", note: "冰  苏  打", noteHref: "https://x.com/icesawder" },
        rhythm: { title: "Rhythm games", note: "Currently osu!mania & osu!standard" },
        video: { title: "Video editing", note: "The basics" },
        graphic: { title: "Graphic & book design", note: "The basics" },
      },
      skillsTitle: "Skills",
      skills: { english: "English (?)" },
      blogTitle: "Blog",
      blog: { url: "https://silentnrtx.top/", label: "silentnrtx.top", open: "Visit the blog" },
    },
    home: {
      pagesLabel: "Pages",
      pages: {
        about: "Who I am, briefly.",
        gallery: "Design and photographs.",
        contact: "Where to reach me.",
      },
    },
    gallery: {
      title: "Gallery",
      filterLabel: "Show",
      all: "All",
      design: "Design",
      photo: "Photography",
      empty: "Nothing here yet.",
      open: "Open full size",
      frames: "frames",
      latest: "Latest frame",
      spec: { date: "Date", camera: "Camera", lens: "Lens", exposure: "Exposure" },
      prev: "Previous",
      next: "Next",
      close: "Close",
    },
    footer: {
      licenseBefore: "Content licensed under",
      licenseAfter: "",
      licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    },
    contact: {
      title: "Contact",
      open: "Open",
      copy: "Copy",
      copied: "Copied {value}",
    },
    notFound: { title: "Nothing here.", back: "Home" },
  },
  zh: {
    motto,
    meta: {
      site: "Silentnrtx",
      description: "Silentnrtx 的联系方式。",
    },
    skip: "跳到正文",
    nav: { label: "主导航", home: "首页", about: "关于", gallery: "画廊", contact: "联系" },
    lang: { label: "语言" },
    theme: { prefix: "主题", system: "跟随系统", light: "浅色", dark: "深色" },
    hero: {
      eyebrow: "个人主页",
      ctaAbout: "关于我",
      ctaContact: "联系方式",
      avatarAlt: "Silentnrtx 的头像",
    },
    about: {
      title: "关于",
      /** 每个字符串是简介的一行。 */
      intro: ["百无聊赖的后现代互联网精神病。", "异想天开的创造者。"],
      credit: { label: "头像 illust", by: "：" },
      hobbiesTitle: "爱好",
      hobbies: {
        svp: { title: "Synthesizer V 调教", note: "以及基础混音 workflow" },
        mmd: { title: "Blender", note: "MMD 制作" },
        photo: { title: "摄影", note: "Sony α7 IV" },
        music: { title: "同人音乐", note: "冰  苏  打", noteHref: "https://x.com/icesawder" },
        rhythm: { title: "音游", note: "现主攻 osu!mania & osu!std" },
        video: { title: "视频剪辑", note: "基础" },
        graphic: { title: "平面设计与装帧设计", note: "基础" },
      },
      skillsTitle: "特长",
      skills: { english: "英语（？）" },
      blogTitle: "博客",
      blog: { url: "https://silentnrtx.top/", label: "silentnrtx.top", open: "去博客看看" },
    },
    home: {
      pagesLabel: "页面",
      pages: {
        about: "简单介绍一下我。",
        gallery: "设计与摄影作品。",
        contact: "在哪里能找到我。",
      },
    },
    gallery: {
      title: "画廊",
      filterLabel: "筛选",
      all: "全部",
      design: "设计",
      photo: "摄影",
      empty: "这里暂时还没有作品。",
      open: "查看原图",
      frames: "帧",
      latest: "最新一帧",
      spec: { date: "日期", camera: "机身", lens: "镜头", exposure: "参数" },
      prev: "上一张",
      next: "下一张",
      close: "关闭",
    },
    footer: {
      licenseBefore: "本站内容采用",
      licenseAfter: "许可协议",
      licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans",
    },
    contact: {
      title: "联系",
      open: "打开",
      copy: "复制",
      copied: "已复制 {value}",
    },
    notFound: { title: "这里什么也没有。", back: "返回首页" },
  },
} as const;

export type UI = (typeof ui)[Lang];
export const t = (lang: Lang): UI => ui[lang];

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** Build a link for a route ("" = home, "contact/") in a language. Respects astro `base`. */
export function href(lang: Lang, route = ""): string {
  const r = route.replace(/^\/+/, "");
  return lang === "en" ? `${BASE}${r}` : `${BASE}zh/${r}`;
}

/** Turn the current pathname back into a language-neutral route, so the language switch keeps you on the same page. */
export function routeOf(pathname: string): string {
  let p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\/+/, "");
  if (p === "zh") p = "";
  else if (p.startsWith("zh/")) p = p.slice(3);
  return p;
}
