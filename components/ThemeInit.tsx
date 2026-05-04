"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config";

export function ThemeInit() {
  useEffect(() => {
    const hue = siteConfig.theme?.hue ?? 270;
    document.documentElement.style.setProperty("--md-hue", String(hue));

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
