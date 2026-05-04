"use client";

import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { SiOsu } from "react-icons/si";

export function OsuSignature() {
  const { t } = useTranslation();

  return (
    <div className="md-card flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
          <SiOsu style={{ color: "var(--md-accent-pink)" }} />{t("osu.title")}
        </h3>
        <a href={siteConfig.social.osu.url} target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors" style={{ color: "var(--md-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
          {t("osu.profile")} &rarr;
        </a>
      </div>

      <a href="https://osu.ppy.sh/community/forums/topics/1502604?n=1" target="_blank" rel="noopener noreferrer"
        className="overflow-hidden rounded-[16px] bg-black/40 transition-all duration-300 hover:scale-[1.02]">
        <img src={siteConfig.osu.signatureUrl} alt="osu! Stats Signature" className="w-full h-auto" style={{ display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </a>

      <p className="mt-3 text-xs text-center" style={{ color: "var(--md-text-muted)" }}>
        @{siteConfig.osu.username} &middot; {siteConfig.osu.mode}
      </p>
    </div>
  );
}
