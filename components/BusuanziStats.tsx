"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { FaEye, FaUsers } from "react-icons/fa";

export function BusuanziStats() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!siteConfig.busuanzi.enabled) return;
    const script = document.createElement("script");
    script.defer = true;
    script.src = "//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js";
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, []);

  const isZh = i18n.language === "zh-CN";

  return (
    <div className="md-card animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>{t("stats.title")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-white/[0.03] p-4 text-center border border-transparent" style={{ borderColor: "var(--md-card-border)" }}>
          <FaEye className="mx-auto mb-2" style={{ color: "var(--md-accent-blue)" }} />
          <p className="text-2xl font-bold font-heading" style={{ color: "var(--md-accent-blue)" }}>
            <span id="busuanzi_site_pv">--</span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--md-text-muted)" }}>{t("stats.pv")}</p>
        </div>
        <div className="rounded-[16px] bg-white/[0.03] p-4 text-center border border-transparent" style={{ borderColor: "var(--md-card-border)" }}>
          <FaUsers className="mx-auto mb-2" style={{ color: "var(--md-accent-purple)" }} />
          <p className="text-2xl font-bold font-heading" style={{ color: "var(--md-accent-purple)" }}>
            <span id="busuanzi_site_uv">--</span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--md-text-muted)" }}>{t("stats.uv")}</p>
        </div>
      </div>
    </div>
  );
}
