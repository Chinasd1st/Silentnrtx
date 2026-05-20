"use client";

import { useEffect, useState } from "react";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";

type Mode = "light" | "dark" | "auto";

export function ThemeSwitch() {
  const [mode, setMode] = useState<Mode>("auto");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("md-theme-mode") as Mode | null;
      if (saved) setMode(saved);
    } catch (e) {
      console.warn("Failed to read theme preference:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("md-theme-mode", mode);
    } catch (e) {
      console.warn("Failed to save theme preference:", e);
    }

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = (isLight: boolean) => document.documentElement.classList.toggle("light", isLight);

    if (mode === "light") apply(true);
    else if (mode === "dark") apply(false);
    else {
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [mode]);

  const next = { light: "dark", dark: "auto", auto: "light" } as const;

  return (
    <button
      type="button"
      onClick={() => setMode(next[mode])}
      className="flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all duration-200 hover:bg-white/6 active:scale-90"
      style={{ color: "var(--md-text-primary)" }}
      aria-label={`Theme: ${mode}`}
    >
      {mode === "light" ? (
        <FiSun size={15} />
      ) : mode === "dark" ? (
        <FiMoon size={15} />
      ) : (
        <FiMonitor size={15} />
      )}
    </button>
  );
}
