"use client";

import { useEffect, useState } from "react";
import { getCache, setCache } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/cache-config";
import { githubApi } from "@/lib/api/github";
import { fetchWithRetry, mapApiError } from "@/lib/api";

export function useVersion() {
  const [ver, setVer] = useState("");

  useEffect(() => {
    const cached = getCache<string>(CACHE_KEYS.GH_VERSION, CACHE_TTL.GH_VERSION);
    if (cached) { setVer(cached); return; }

    fetchWithRetry(() =>
        githubApi.get<{ tag_name: string }[]>("/repos/Chinasd1st/Silentnrtx/releases?per_page=1")
      )
      .then(({ data }) => {
        const latest = Array.isArray(data) ? data[0] : null;
        if (latest?.tag_name) { setVer(latest.tag_name); setCache(CACHE_KEYS.GH_VERSION, latest.tag_name); }
      })
      .catch((err) => { console.warn(mapApiError(err).message); });
  }, []);

  return ver;
}
