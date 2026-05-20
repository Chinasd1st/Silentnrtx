"use client";

import i18next from "i18next";
import { initReactI18next, useTranslation as useOrigTranslation } from "react-i18next";
import en from "@/locales/en-US.json";
import zh from "@/locales/zh-CN.json";

const lang = getDetectedLang();

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

export function getDetectedLang(): string {
  if (typeof window === "undefined") return "zh-CN";
  try {
    const saved = localStorage.getItem("md-lang");
    if (saved) return saved;
    const nav = navigator.language || (navigator as any).userLanguage || "";
    if (nav.startsWith("zh")) return "zh-CN";
    return "en-US";
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[i18n] getDetectedLang error");
    return "zh-CN";
  }
}

export function changeLang(lng: string) {
  i18next.changeLanguage(lng);
  try {
    localStorage.setItem("md-lang", lng);
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[i18n] changeLang error");
  }
}

export function useTranslation() {
  return useOrigTranslation();
}

export { i18next };
