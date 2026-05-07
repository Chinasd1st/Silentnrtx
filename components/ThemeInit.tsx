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
      // Use config default
      const defaultHue = siteConfig.theme?.hue ?? 270;
      document.documentElement.style.setProperty("--md-hue", String(defaultHue));
    }

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = (isLight: boolean) => {
      document.documentElement.classList.toggle("light", isLight);
    };
    apply(mq.matches);
    mq.addEventListener("change", (e) => apply(e.matches));
    return () => mq.removeEventListener("change", (e) => apply(e.matches));
  }, []);
  return null;
}
