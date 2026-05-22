"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";

export function BusuanziStats() {
  const { t } = useTranslation();

  useEffect(() => {
    if (!siteConfig.busuanzi.enabled) return;
    const script = document.createElement("script");
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.integrity = "sha384-mu6spjIrGX8WuulyGwMm8UgKagWrKWmjoMMnEvCSfs76HzzJfjGqbWW8REev9BBK";
    script.src = "//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js";
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-heading text-lg font-semibold"
          style={{ color: "var(--md-text-primary)" }}
        >
          {t("stats.title")}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-[16px] p-4 text-center"
          style={{ backgroundColor: "var(--md-primary-008)" }}
        >
          <p
            className="text-2xl font-bold font-heading"
            style={{ color: "var(--md-primary)" }}
            aria-live="polite"
            aria-atomic="true"
          >
            <span id="busuanzi_site_pv">--</span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--md-text-muted)" }}>
            {t("stats.pv")}
          </p>
        </div>
        <div
          className="rounded-[16px] p-4 text-center"
          style={{ backgroundColor: "var(--md-primary-008)" }}
        >
          <p
            className="text-2xl font-bold font-heading"
            style={{ color: "var(--md-primary)" }}
            aria-live="polite"
            aria-atomic="true"
          >
            <span id="busuanzi_site_uv">--</span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--md-text-muted)" }}>
            {t("stats.uv")}
          </p>
        </div>
      </div>
    </div>
  );
}
