"use client";

import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";

export function ProfileCard() {
  const { t } = useTranslation();
  const profile = siteConfig.profile;

  return (
    <div className="md-card group relative overflow-hidden">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-[24px]" style={{ boxShadow: "0 0 0 2px var(--md-primary)" }}>
            <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6750a4&color=fff`; }} />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-heading text-2xl font-bold tracking-tight" style={{ color: "var(--md-text-primary)" }}>
            {profile.name}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--md-text-secondary)" }}>
            {t("profile.location")}
          </p>
          <p className="mt-1 text-base" style={{ color: "var(--md-primary)" }}>
            @{profile.username}
          </p>
        </div>
      </div>
    </div>
  );
}
