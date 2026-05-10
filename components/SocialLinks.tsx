"use client";

import { siteConfig } from "@/config";
import { FaGithub, FaDiscord, FaGlobe } from "react-icons/fa";
import { FaXTwitter, FaSoundcloud, FaBandcamp } from "react-icons/fa6";
import { SiBilibili, SiOsu } from "react-icons/si";
import { useTranslation } from "@/lib/i18n";

const socialItems = [
  { key: "bilibili", icon: SiBilibili, color: "#00A1D6", href: siteConfig.social.bilibili.url, username: siteConfig.social.bilibili.username },
  { key: "github", icon: FaGithub, color: "var(--md-text-primary)", href: siteConfig.social.github.url, username: siteConfig.social.github.nickname },
  { key: "twitter", icon: FaXTwitter, color: "var(--md-text-primary)", href: siteConfig.social.twitter.url, username: siteConfig.social.twitter.username },
  { key: "soundcloud", icon: FaSoundcloud, color: "#ff7700", href: siteConfig.social.soundcloud.url, username: siteConfig.social.soundcloud.username },
  { key: "bandcamp", icon: FaBandcamp, color: "#00a1c6", href: siteConfig.social.bandcamp.url, username: siteConfig.social.bandcamp.username },
  { key: "discord", icon: FaDiscord, color: "#5865F2", href: null, username: siteConfig.social.discord.username },
  { key: "osu", icon: SiOsu, color: "var(--md-accent-pink)", href: siteConfig.social.osu.url, username: siteConfig.social.osu.username },
  { key: "blog", icon: FaGlobe, color: "var(--md-primary)", href: siteConfig.social.blog.url, username: siteConfig.social.blog.name },
];

export function SocialLinks() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in">
      {socialItems.map((item) => {
        const Icon = item.icon;
        const card = (
          <div className="md-card p-4! h-full flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-(--md-primary)/20!">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] text-lg transition-transform duration-200 hover:scale-110"
              style={{ backgroundColor: `${item.color}18`, color: item.color }}>
              <Icon />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--md-text-secondary)" }} suppressHydrationWarning>{t(`social.${item.key}`)}</p>
              <p className="text-sm font-semibold truncate max-w-[100px]" style={{ color: "var(--md-text-primary)" }}>{item.username}</p>
            </div>
          </div>
        );
        if (item.href) return <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer">{card}</a>;
        return <div key={item.key}>{card}</div>;
      })}
    </div>
  );
}
