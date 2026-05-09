"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { loadSettings, saveSettings, type Settings } from "@/lib/settings";
import { FiSettings, FiX } from "react-icons/fi";

export function SettingsCard() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Settings>(loadSettings);

  useEffect(() => { saveSettings(s); }, [s]);

  useEffect(() => {
    if (s.hueEnabled && s.customHue !== null) {
      document.documentElement.style.setProperty("--md-hue", String(s.customHue));
    }
  }, [s.hueEnabled, s.customHue]);

  const update = (partial: Partial<Settings>) => setS((prev) => ({ ...prev, ...partial }));

  const parseHex = (hex: string) => {
    const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
    if (m) {
      const r = parseInt(m[1].slice(0, 2), 16);
      const g = parseInt(m[1].slice(2, 4), 16);
      const b = parseInt(m[1].slice(4, 6), 16);
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let hue = 0;
      if (max !== min) {
        const d = max - min;
        if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        else if (max === g) hue = ((b - r) / d + 2) * 60;
        else hue = ((r - g) / d + 4) * 60;
      }
      return Math.round(hue);
    }
    return null;
  };

  const hueToHex = (h: number): string => {
    const c = 180;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (n: number) => Math.round((n / 180) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={t("settings.title")}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/[0.06] active:scale-90"
        style={{ color: "var(--md-text-primary)" }}>
        <FiSettings size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}
          role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(false); } }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
          <div className="relative rounded-[24px] p-5 w-full max-w-sm" style={{ backgroundColor: "var(--md-card-bg)", border: "1px solid var(--md-card-border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>
                <FiSettings className="inline mr-2" size={16} />{t("settings.title")}
              </h2>
              <button onClick={() => setOpen(false)} aria-label={t("gallery.close")} className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/[0.06]"
                style={{ color: "var(--md-text-muted)" }}><FiX size={16} /></button>
            </div>

            <div className="space-y-5">
              {/* Weather source */}
              <div>
                <p className="text-xs font-medium mb-2.5" style={{ color: "var(--md-text-secondary)" }}>{t("settings.weather_source")}</p>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => update({ weatherSource: "manual" })}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{ backgroundColor: s.weatherSource === "manual" ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: s.weatherSource === "manual" ? "var(--md-primary)" : "var(--md-text-muted)" }}>
                    {t("settings.weather_manual")}
                  </button>
                  <button onClick={() => update({ weatherSource: "auto" })}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{ backgroundColor: s.weatherSource === "auto" ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: s.weatherSource === "auto" ? "var(--md-primary)" : "var(--md-text-muted)" }}>
                    {t("settings.weather_auto")}
                  </button>
                </div>
                {s.weatherSource === "manual" && (
                  <input type="text" value={s.manualCity} placeholder="Tongxiang"
                    onChange={(e) => update({ manualCity: e.target.value })}
                    className="w-full rounded-[12px] px-3 py-2 text-xs outline-none border"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "var(--md-text-primary)", borderColor: "var(--md-card-border)" }} />
                )}
              </div>

              {/* HUE */}
              <div>
                <p className="text-xs font-medium mb-2.5" style={{ color: "var(--md-text-secondary)" }}>{t("settings.hue")}</p>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => update({ hueEnabled: true })}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{ backgroundColor: s.hueEnabled ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: s.hueEnabled ? "var(--md-primary)" : "var(--md-text-muted)" }}>
                    {t("settings.hue_on")}
                  </button>
                  <button onClick={() => update({ hueEnabled: false, customHue: null })}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{ backgroundColor: !s.hueEnabled ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: !s.hueEnabled ? "var(--md-primary)" : "var(--md-text-muted)" }}>
                    {t("settings.hue_off")}
                  </button>
                </div>
                {s.hueEnabled && (
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="360" value={s.customHue ?? 250}
                      onChange={(e) => update({ customHue: parseInt(e.target.value) })}
                      className="flex-1 h-1.5 cursor-pointer accent-current" style={{ accentColor: "var(--md-primary)" }} />
                    <input type="text" maxLength={7} placeholder="#165DFF"
                      value={s.customHue !== null ? hueToHex(s.customHue) : ""}
                      onChange={(e) => { const h = parseHex(e.target.value); if (h !== null) update({ customHue: h }); }}
                      className="w-20 rounded-[8px] px-2 py-1 text-xs font-mono text-center outline-none border"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "var(--md-text-primary)", borderColor: "var(--md-card-border)" }} />
                    <span className="text-xs font-mono" style={{ color: "var(--md-text-muted)" }}>{s.customHue ?? 250}°</span>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-[10px] text-center" style={{ color: "var(--md-text-muted)" }}>{t("settings.persist")}</p>
          </div>
        </div>
      )}
    </>
  );
}
