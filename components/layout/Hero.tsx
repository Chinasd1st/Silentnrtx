"use client";

import { useEffect, useRef, useState } from "react";
import { SettingsCard } from "@/components/dialogs/SettingsCard";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ThemeSwitch } from "@/components/widgets/ThemeSwitch";
import { siteConfig } from "@/config";
import { highlight } from "@/lib/highlight";
import { changeLang, getDetectedLang, useTranslation } from "@/lib/i18n";

export function Hero() {
  const { t } = useTranslation();
  const [lang, setLang] = useState(getDetectedLang);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleLang = () => {
    const next = lang === "zh-CN" ? "en-US" : "zh-CN";
    setLang(next);
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
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 0%, rgba(208,188,255,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-(--md-background)/60 via-transparent to-(--md-background)" />
      </div>

      <div ref={contentRef} className="flex flex-col items-center gap-4 px-4 text-center">
        <div className="relative">
          <div
            className="h-28 w-28 overflow-hidden rounded-[32px] shadow-xl"
            style={{ boxShadow: "0 0 0 2px rgba(208,188,255,0.3)" }}
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
            className="font-heading text-5xl font-bold sm:text-6xl lg:text-7xl tracking-wide leading-[1.15]"
            style={{ color: "var(--md-text-primary)" }}
          >
            {siteConfig.profile.name}
          </h1>
          <p
            className="mt-3 text-sm leading-[1.4]"
            style={{ color: "var(--md-text-secondary)", letterSpacing: "0.08em" }}
            suppressHydrationWarning
          >
            {t("profile.location")}
          </p>
          <p
            className="mt-4 text-sm leading-[1.4] min-h-[1.4em]"
            style={{ color: "var(--md-text-secondary)", opacity: 0.65, letterSpacing: "0.04em" }}
          >
            {highlight(siteConfig.profile.signature)}
          </p>
        </div>
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <ThemeSwitch />
        <SettingsCard />
        <button
          type="button"
          onClick={toggleLang}
          aria-label={lang === "zh-CN" ? "当前语言：中文" : "Current: English"}
          suppressHydrationWarning
          className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium transition-all duration-200 hover:bg-white/6 active:scale-90"
          style={{ color: "var(--md-text-primary)" }}
        >
          {lang === "zh-CN" ? "ZH" : "EN"}
        </button>
      </div>

      <div className="absolute bottom-10 flex w-full justify-center animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: "var(--md-text-muted)" }}
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
    </section>
  );
}
