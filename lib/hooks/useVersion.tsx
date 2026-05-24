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

    fetchWithRetry(() => githubApi.get("/repos/Chinasd1st/Silentnrtx/releases/latest"))
      .then(({ data }) => {
        if (data?.tag_name) { setVer(data.tag_name); setCache(CACHE_KEYS.GH_VERSION, data.tag_name); }
      })
      .catch((err) => { console.warn(mapApiError(err).message); });
  }, []);

  return ver;
}
