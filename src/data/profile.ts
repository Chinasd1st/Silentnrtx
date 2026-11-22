import type { L10n } from "../i18n/ui";

export type Tone = "primary" | "secondary" | "inverse" | "tertiary" | "neutral";
export type PlatformId = "x" | "github" | "osu" | "bilibili" | "lastfm";

export interface ContactLink {
  id: PlatformId;
  platform: L10n;
  handle: string;
  /** Small line under the handle. */
  note?: string;
  /** What the copy button puts on the clipboard. */
  copy: string;
  href: string;
  tone: Tone;
}

export const profile = {
  name: "Silentnrtx",
  links: [
    {
      id: "x",
      platform: { en: "X", zh: "X" },
      handle: "@Silentnrtx",
      copy: "@Silentnrtx",
      href: "https://x.com/Silentnrtx",
      tone: "primary",
    },
    {
      id: "github",
      platform: { en: "GitHub", zh: "GitHub" },
      handle: "Silentnrtx",
      note: "github.com/chinasd1st",
      copy: "chinasd1st",
      href: "https://github.com/chinasd1st",
      tone: "inverse",
    },
    {
      id: "osu",
      platform: { en: "osu!", zh: "osu!" },
      handle: "Silentnrtx",
      copy: "Silentnrtx",
      href: "https://osu.ppy.sh/users/Silentnrtx",
      tone: "tertiary",
    },
    {
      id: "bilibili",
      platform: { en: "Bilibili", zh: "哔哩哔哩" },
      handle: "UID 520682236",
      copy: "520682236",
      href: "https://space.bilibili.com/520682236",
      tone: "neutral",
    },
    {
      id: "lastfm",
      platform: { en: "Last.fm", zh: "Last.fm" },
      handle: "Silentnrtx",
      copy: "Silentnrtx",
      href: "https://www.last.fm/user/Silentnrtx",
      tone: "secondary",
    },
  ] satisfies ContactLink[],
};
