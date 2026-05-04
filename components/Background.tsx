"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config";

export function Background() {
  const [bgUrl, setBgUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const cfg = siteConfig.background;

  useEffect(() => {
    if (!cfg.enabled) {
      document.body.style.backgroundColor = cfg.fallbackColor;
      setLoading(false);
      return;
    }

    if (cfg.imageUrl) {
      setBgUrl(cfg.imageUrl);
      setLoading(false);
      return;
    }

    if (cfg.usePixiv) {
      fetch("https://api.lolicon.app/setu/v2")
        .then((r) => r.json())
        .then((data) => {
          const illusts = data.illusts || data.data || [];
          if (illusts.length > 0) {
            const pick = illusts[Math.floor(Math.random() * Math.min(illusts.length, 10))];
            const url = pick.url || pick.original || pick.large || pick.image_url;
            if (url) setBgUrl(url);
            else document.body.style.backgroundColor = cfg.fallbackColor;
          } else {
            document.body.style.backgroundColor = cfg.fallbackColor;
          }
        })
        .catch(() => {
          document.body.style.backgroundColor = cfg.fallbackColor;
        })
        .finally(() => setLoading(false));
      return;
    }

    if (cfg.useBing) {
      fetch(cfg.bingApi)
        .then((r) => r.json())
        .then((data) => {
          let url = data.url || data.images?.[0]?.url;
          if (!url) {
            document.body.style.backgroundColor = cfg.fallbackColor;
            return;
          }
          if (url.startsWith("//")) url = `https:${url}`;
          else if (url.startsWith("/")) url = `https://www.bing.com${url}`;
          setBgUrl(url);
        })
        .catch(() => {
          document.body.style.backgroundColor = cfg.fallbackColor;
        })
        .finally(() => setLoading(false));
      return;
    }

    document.body.style.backgroundColor = cfg.fallbackColor;
    setLoading(false);
  }, [cfg.enabled, cfg.imageUrl, cfg.usePixiv, cfg.useBing, cfg.bingApi, cfg.fallbackColor]);

  if (loading || !bgUrl) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgUrl})`,
          filter: `blur(${cfg.blurAmount}px) brightness(0.6)`,
          transform: "scale(1.1)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--md-background)]/30 to-[var(--md-background)]" />
    </div>
  );
}
