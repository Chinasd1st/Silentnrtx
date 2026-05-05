"use client";

import { useEffect, useState } from "react";
import { getCache, setCache } from "@/lib/cache";

const CACHE_KEY = "gh_version";
const CACHE_TTL = 60 * 60 * 1000;

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
