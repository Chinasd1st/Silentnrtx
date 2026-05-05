"use client";

import { useEffect, useState } from "react";
import { getCache, setCache } from "@/lib/cache";

const CACHE_KEY = "gh_version_v2";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export function useVersion() {
  const [ver, setVer] = useState("");

  useEffect(() => {
    const cached = getCache<string>(CACHE_KEY, CACHE_TTL);
    if (cached) { setVer(cached); return; }

    fetch("https://api.github.com/repos/Chinasd1st/Silentnrtx/releases/latest")
      .then((r) => r.json())
      .then((d) => {
        if (d.tag_name) { setVer(d.tag_name); setCache(CACHE_KEY, d.tag_name); }
      })
      .catch(() => {});
  }, []);

  return ver;
}
