"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiGlobe } from "react-icons/fi";
import { SettingsCard } from "@/components/dialogs/SettingsCard";
import { MusicButton } from "@/components/header/MusicButton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { siteConfig } from "@/config";
import { highlight } from "@/lib/highlight";
import { changeLang, type Lang, normalizeLang, useTranslation } from "@/lib/i18n";

const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "zh-CN", label: "简体中文", short: "中" },
  { code: "zh-TW", label: "繁體中文", short: "繁" },
  { code: "en-US", label: "English", short: "EN" },
  { code: "ja", label: "日本語", short: "日" },
];

export function Hero() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGS.find((l) => l.code === normalizeLang(lang)) ?? LANGS[0];

  const pickLang = (next: Lang) => {
    changeLang(next);
    setLangOpen(false);
  };

  useEffect(() => {
    if (!langOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [langOpen]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0005})`;
          bgRef.current.style.opacity = `${Math.max(0, 1 - scrollY / 500)}`;
        }
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
          contentRef.current.style.opacity = `${Math.max(0, 1 - scrollY / 400)}`;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-20">
        <div className="hero-ambient absolute inset-0" />
        <div className="hero-scrim absolute inset-0" />
      </div>

      <div ref={contentRef} className="flex flex-col items-center gap-4 px-4 text-center">
        <div className="relative">
          <div
            className="h-28 w-28 overflow-hidden rounded-card"
            style={{
              boxShadow: "0 0 0 2px color-mix(in srgb, var(--md-primary) 30%, transparent)",
            }}
          >
            <OptimizedImage
              src={siteConfig.profile.avatar}
              alt={siteConfig.profile.name}
              fill
              objectFit="cover"
              sizes="7rem"
              className="h-full w-full"
              fallback={`https://ui-avatars.com/api/?name=${encodeURIComponent(siteConfig.profile.name)}&background=6750a4&color=fff`}
            />
          </div>
        </div>

        <div>
          <h1
            className="font-heading text-5xl font-bold sm:text-6xl lg:text-7xl tracking-tight leading-[1.15]"
            style={{ color: "var(--md-text-primary)" }}
          >
            {siteConfig.profile.name}
          </h1>
          <p
            className="hero-subtitle mt-3 text-sm font-medium leading-[1.4]"
            style={{ color: "var(--md-text-secondary)" }}
          >
            {t("profile.location")}
          </p>
          <p
            className="hero-subtitle mt-4 text-sm font-medium leading-[1.4] min-h-[1.4em]"
            style={{ color: "var(--md-text-secondary)" }}
          >
            {highlight(siteConfig.profile.signature)}
          </p>
        </div>
      </div>

      <div className="hero-toolbar absolute right-4 top-4 z-10 flex items-center gap-0.5 rounded-full p-1 sm:right-6 sm:top-6">
        <MusicButton />
        <ThemeSwitch />
        <SettingsCard />
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-label={t("lang.switch")}
            aria-haspopup="menu"
            aria-expanded={langOpen}
            className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium cursor-pointer transition-colors duration-200 hover:bg-white/6 active:scale-[0.97]"
            style={{ color: "var(--md-text-primary)" }}
          >
            <FiGlobe size={13} aria-hidden="true" />
            {currentLang.short}
          </button>
          {langOpen && (
            <div
              role="menu"
              aria-label={t("lang.switch")}
              className="animate-fade-in absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-panel p-1 shadow-lg"
              style={{
                backgroundColor: "var(--md-surface-variant)",
                border: "1px solid var(--md-outline-variant)",
              }}
            >
              {LANGS.map((item) => {
                const active = item.code === currentLang.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => pickLang(item.code)}
                    className="flex w-full items-center justify-between gap-2 rounded-micro px-3 py-2 text-xs cursor-pointer transition-colors duration-200 hover:bg-white/6"
                    style={{
                      color: active ? "var(--md-primary)" : "var(--md-text-primary)",
                      backgroundColor: active ? "var(--md-primary-008)" : "transparent",
                    }}
                  >
                    <span>{item.label}</span>
                    {active && <FiCheck size={12} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 flex w-full justify-center">
        <div className="hero-toolbar flex h-9 w-9 animate-bounce items-center justify-center rounded-full">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--md-text-secondary)" }}
            role="img"
            aria-label="Scroll down"
          >
            <title>Scroll down</title>
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
