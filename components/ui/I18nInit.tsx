"use client";

import { useEffect } from "react";
import { buildTime, commitSha } from "@/lib/buildTime";
import { clearAllCache } from "@/lib/cache";
import { getDetectedLang, i18next } from "@/lib/i18n";

const CACHE_VERSION_KEY = "cache_ver";

export function I18nInit() {
  useEffect(() => {
    const lang = getDetectedLang();
    if (lang !== i18next.language) {
      i18next.changeLanguage(lang);
    }
  }, []);

  useEffect(() => {
    const ver = commitSha || buildTime;
    if (!ver) return;
    try {
      const cached = localStorage.getItem(CACHE_VERSION_KEY);
      if (cached && cached !== ver) {
        clearAllCache();
      }
      localStorage.setItem(CACHE_VERSION_KEY, ver);
    } catch {
      /* noop */
    }
  }, []);

  return null;
}
