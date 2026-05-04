"use client";

import i18next from "i18next";
import { initReactI18next, useTranslation as useOrigTranslation } from "react-i18next";
import zh from "@/locales/zh-CN.json";
import en from "@/locales/en-US.json";

function detectLang(): string {
  if (typeof window === "undefined") return "zh-CN";
  try {
    const saved = localStorage.getItem("md-lang");
    if (saved) return saved;
    const nav = navigator.language || (navigator as any).userLanguage || "";
    if (nav.startsWith("zh")) return "zh-CN";
    return "en-US";
  } catch { return "zh-CN"; }
}
const lang = detectLang();

i18next.use(initReactI18next).init({
  resources: {
    "zh-CN": { translation: zh },
    "en-US": { translation: en },
  },
  lng: lang,
  fallbackLng: "zh-CN",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function changeLang(lng: string) {
  i18next.changeLanguage(lng);
  try { localStorage.setItem("md-lang", lng); } catch {}
}

export function useTranslation() {
  return useOrigTranslation();
}

export { i18next };
