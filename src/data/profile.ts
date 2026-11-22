import type { L10n } from "../i18n/ui";

/**
 * Card tint, taken from the platform's brand colour. Every card uses the same lightness and
 * saturation (see .contact-card in global.css) — only the hue changes, so the set stays even.
 * hue: oklch hue of the brand colour. chroma: 1 = full tint, ~0.15 = near-neutral (black brands).
 */
export interface Brand {
  hue: number;
  chroma?: number;
}
export type PlatformId = "x" | "github" | "osu" | "bilibili" | "lastfm" | "discord";

export interface ContactLink {
  id: PlatformId;
  platform: L10n;
  handle: string;
  /** Small line under the handle. */
  note?: string;
  /** What the copy button puts on the clipboard. */
  copy: string;
  href: string;
  brand: Brand;
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
      // X and GitHub are black brands: a faint cool grey
      brand: { hue: 255, chroma: 0.15 },
    },
    {
      id: "github",
      platform: { en: "GitHub", zh: "GitHub" },
      handle: "Silentnrtx",
      note: "github.com/chinasd1st",
      copy: "chinasd1st",
      href: "https://github.com/chinasd1st",
      brand: { hue: 285, chroma: 0.15 },
    },
    {
      id: "osu",
      platform: { en: "osu!", zh: "osu!" },
      handle: "Silentnrtx",
      copy: "Silentnrtx",
      href: "https://osu.ppy.sh/users/Silentnrtx",
      // osu! pink #FF66AA
      brand: { hue: 355 },
    },
    {
      id: "bilibili",
      platform: { en: "Bilibili", zh: "哔哩哔哩" },
      handle: "Silentnrtx_",
      copy: "Silentnrtx_",
      href: "https://space.bilibili.com/520682236",
      // Bilibili blue #00A1D6
      brand: { hue: 232 },
    },
    {
      id: "lastfm",
      platform: { en: "Last.fm", zh: "Last.fm" },
      handle: "Silentnrtx",
      copy: "Silentnrtx",
      href: "https://www.last.fm/user/Silentnrtx",
      // Last.fm red #D51007
      brand: { hue: 28 },
    },
    {
      id: "discord",
      platform: { en: "Discord", zh: "Discord" },
      handle: "Silentnrtx",
      copy: "Silentnrtx",
      href: "https://discord.com/users/957082674399412224",
      // Discord blurple #5865F2
      brand: { hue: 275 },
    },
  ] satisfies ContactLink[],
};
