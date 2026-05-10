"use client";

import { useEffect, useState } from "react";
import { getCache, setCache } from "@/lib/cache";
import { githubApi } from "@/lib/githubApi";
import { fetchWithRetry, mapApiError } from "@/lib/api";

const CACHE_KEY = "gh_version_v2";
const CACHE_TTL = 5 * 60 * 1000;

export function useVersion() {
  const [ver, setVer] = useState("");

  useEffect(() => {
    const cached = getCache<string>(CACHE_KEY, CACHE_TTL);
    if (cached) { setVer(cached); return; }

    fetchWithRetry(() => githubApi.get("/repos/Chinasd1st/Silentnrtx/releases/latest"))
      .then(({ data }) => {
        if (data?.tag_name) { setVer(data.tag_name); setCache(CACHE_KEY, data.tag_name); }
      })
      .catch((err) => { console.warn(mapApiError(err).message); });
  }, []);

  return ver;
}
