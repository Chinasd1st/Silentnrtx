"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";

const CACHE_KEY = "bg_url";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function Background() {
  const [bgUrl, setBgUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isLight, setIsLight] = useState(false);
  const cfg = siteConfig.background;

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains("light"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

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

    const cached = getCache<string>(CACHE_KEY, CACHE_TTL);
    if (cached) {
      setBgUrl(cached);
      setLoading(false);
      return;
    }

    if (cfg.usePixiv) {
      fetchWithRetry(() => api.get("https://api.lolicon.app/setu/v2"))
        .then(({ data }) => data)
        .then((data) => {
          const illusts = data.illusts || data.data || [];
          if (illusts.length > 0) {
            const pick = illusts[Math.floor(Math.random() * Math.min(illusts.length, 10))];
            const url = pick.url || pick.original || pick.large || pick.image_url;
            if (url) {
              setBgUrl(url);
              setCache(CACHE_KEY, url);
            } else document.body.style.backgroundColor = cfg.fallbackColor;
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
      fetchWithRetry(() => api.get(cfg.bingApi))
        .then(({ data }) => data)
        .then((data) => {
          let url = data.url || data.images?.[0]?.url;
          if (!url) {
            document.body.style.backgroundColor = cfg.fallbackColor;
            return;
          }
          if (url.startsWith("//")) url = `https:${url}`;
          else if (url.startsWith("/")) url = `https://www.bing.com${url}`;
          setBgUrl(url);
          setCache(CACHE_KEY, url);
        })
        .catch(() => {
          document.body.style.backgroundColor = cfg.fallbackColor;
        })
        .finally(() => setLoading(false));
      return;
    }

    document.body.style.backgroundColor = cfg.fallbackColor;
    setLoading(false);
  }, []);

  if (loading || !bgUrl) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ transform: "scale(1.1)" }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${cfg.blurAmount}px)`,
          WebkitBackdropFilter: `blur(${cfg.blurAmount}px)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isLight ? `rgba(255,255,255,${1 - cfg.opacity})` : "rgba(0,0,0,0.4)",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-(--md-background)/30 to-(--md-background)" />
    </div>
  );
}
