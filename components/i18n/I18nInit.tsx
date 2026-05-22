"use client";

import { useEffect } from "react";
import { getDetectedLang, i18next } from "@/lib/i18n";

export function I18nInit() {
  useEffect(() => {
    const lang = getDetectedLang();
    if (lang !== i18next.language) {
      i18next.changeLanguage(lang);
    }
  }, []);

  return null;
}
