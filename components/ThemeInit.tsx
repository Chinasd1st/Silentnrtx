"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config";
import { loadSettings } from "@/lib/settings";

export function ThemeInit() {
  useEffect(() => {
    const s = loadSettings();
    if (s.hueEnabled && s.customHue !== null) {
      document.documentElement.style.setProperty("--md-hue", String(s.customHue));
    } else {
      const defaultHue = siteConfig.theme?.hue ?? 270;
      document.documentElement.style.setProperty("--md-hue", String(defaultHue));
    }

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = (isLight: boolean) => {
      document.documentElement.classList.toggle("light", isLight);
    };
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    apply(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return null;
}
