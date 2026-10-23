"use client";

import { useEffect, useRef } from "react";
import { SettingsCard } from "@/components/dialogs/SettingsCard";
import { MusicButton } from "@/components/header/MusicButton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { siteConfig } from "@/config";
import { highlight } from "@/lib/highlight";
import { changeLang, useTranslation } from "@/lib/i18n";

export function Hero() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleLang = () => {
    const next = lang === "zh-CN" ? "en-US" : "zh-CN";
    changeLang(next);
  };

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
        <button
          type="button"
          onClick={toggleLang}
          aria-label={t(lang === "zh-CN" ? "lang.zh_aria" : "lang.en_aria")}
          className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium cursor-pointer transition-colors duration-200 hover:bg-white/6 active:scale-[0.97]"
          style={{ color: "var(--md-text-primary)" }}
        >
          {t(lang === "zh-CN" ? "lang.zh" : "lang.en")}
        </button>
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
