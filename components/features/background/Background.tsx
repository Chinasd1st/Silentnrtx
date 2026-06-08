"use client";

import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/cache-config";

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

  const fetchBg = useCallback(() => {
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

    const cached = getCache<string>(CACHE_KEYS.BG_URL, CACHE_TTL.BG_URL);
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
              setCache(CACHE_KEYS.BG_URL, url);
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
          const list = Array.isArray(data) ? data : [];
          const pick = list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
          if (!pick?.wallpaper) {
            document.body.style.backgroundColor = cfg.fallbackColor;
            return;
          }
          setBgUrl(pick.wallpaper);
          setCache(CACHE_KEYS.BG_URL, pick.wallpaper);
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

  useEffect(() => {
    fetchBg();
    const onClear = () => fetchBg();
    window.addEventListener("cache-cleared", onClear);
    return () => window.removeEventListener("cache-cleared", onClear);
  }, [fetchBg]);

  if (loading || !bgUrl) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ transform: "scale(1.15)" }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgUrl})`,
          filter: `blur(${cfg.blurAmount}px)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isLight
            ? `rgba(255,255,255,${(1 - cfg.opacity) * 0.35})`
            : "rgba(0,0,0,0.4)",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-(--md-background)/15 to-(--md-background)" />
    </div>
  );
}
