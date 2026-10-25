"use client";

import i18next from "i18next";
import { initReactI18next, useTranslation as useOrigTranslation } from "react-i18next";
import en from "@/locales/en-US.json";
import ja from "@/locales/ja.json";
import zh from "@/locales/zh-CN.json";
import zhTW from "@/locales/zh-TW.json";

export const SUPPORTED_LANGS = ["zh-CN", "zh-TW", "en-US", "ja"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = "zh-CN";

/** Shape used by `document.documentElement.lang` / `og:locale`. */
export const LANG_META: Record<Lang, { htmlLang: string; ogLocale: string }> = {
  "zh-CN": { htmlLang: "zh-CN", ogLocale: "zh_CN" },
  "zh-TW": { htmlLang: "zh-Hant", ogLocale: "zh_TW" },
  "en-US": { htmlLang: "en", ogLocale: "en_US" },
  ja: { htmlLang: "ja", ogLocale: "ja_JP" },
};

const resources = {
  "zh-CN": { translation: zh },
  "zh-TW": { translation: zhTW },
  "en-US": { translation: en },
  ja: { translation: ja },
};

i18next.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
  returnNull: false,
});

/**
 * Map any BCP 47 tag (navigator.language, saved value, `zh-HK`, `ja-JP`, …)
 * onto one of the four shipped locales.
 */
export function normalizeLang(input: string | null | undefined): Lang {
  const tag = (input || "").toLowerCase().replace(/_/g, "-");
  if (tag.startsWith("zh")) {
    if (tag.includes("tw") || tag.includes("hk") || tag.includes("mo") || tag.includes("hant")) {
      return "zh-TW";
    }
    return "zh-CN";
  }
  if (tag.startsWith("ja")) return "ja";
  if (tag.startsWith("en")) return "en-US";
  return DEFAULT_LANG;
}

export function getDetectedLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const saved = localStorage.getItem("md-lang");
    if (saved) return normalizeLang(saved);
    return normalizeLang(navigator.language || (navigator as any).userLanguage);
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[i18n] getDetectedLang error");
    return DEFAULT_LANG;
  }
}

function syncDocumentLang(lng: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = LANG_META[lng].htmlLang;
  const meta = document.querySelector('meta[property="og:locale"]');
  if (meta) meta.setAttribute("content", LANG_META[lng].ogLocale);
}

export function changeLang(lng: string) {
  const next = normalizeLang(lng);
  i18next.changeLanguage(next);
  syncDocumentLang(next);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("md-lang", next);
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[i18n] changeLang error");
  }
}

export function useTranslation() {
  return useOrigTranslation();
}

export { i18next };
