"use client";

import { useState } from "react";
import { SiOsu } from "react-icons/si";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";

export function OsuSignature() {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader
        icon={<SiOsu />}
        title={t("osu.title")}
        action={
          <ExternalLink href={siteConfig.social.osu.url}>{t("osu.profile")} &rarr;</ExternalLink>
        }
      />

      {imgFailed ? (
        <div className="flex items-center justify-center rounded-[16px] bg-black/40 py-12">
          <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>
            {t("osu.sig_failed")}
          </p>
        </div>
      ) : (
        <a
          href="https://osu.ppy.sh/community/forums/topics/1502604?n=1"
          target="_blank"
          rel="noopener noreferrer"
          className="overflow-hidden rounded-[16px] bg-black/40 transition-all duration-300 hover:scale-[1.02]"
        >
          <img
            src={siteConfig.osu.signatureUrl}
            alt={t("osu.sig_alt")}
            width={600}
            height={200}
            loading="lazy"
            className="w-full h-auto"
            style={{ display: "block" }}
            onError={() => setImgFailed(true)}
          />
        </a>
      )}

      <p className="mt-3 text-xs text-center" style={{ color: "var(--md-text-muted)" }}>
        @{siteConfig.osu.username} &middot; {siteConfig.osu.mode}
      </p>
    </Card>
  );
}
