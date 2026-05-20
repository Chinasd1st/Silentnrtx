"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiSettings, FiX } from "react-icons/fi";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { loadSettings, type Settings, saveSettings } from "@/lib/settings";

export function SettingsCard() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Settings>(loadSettings);

  useEffect(() => {
    const timer = setTimeout(() => saveSettings(s), 300);
    return () => clearTimeout(timer);
  }, [s]);

  useEffect(() => {
    if (s.hueEnabled && s.customHue !== null) {
      document.documentElement.style.setProperty("--md-hue", String(s.customHue));
    } else {
      const defaultHue = siteConfig.theme?.hue ?? 270;
      document.documentElement.style.setProperty("--md-hue", String(defaultHue));
    }
  }, [s.hueEnabled, s.customHue]);

  const update = (partial: Partial<Settings>) => setS((prev) => ({ ...prev, ...partial }));

  const commitHue = useCallback((val: number) => setS((prev) => ({ ...prev, customHue: val })), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("settings.title")}
        suppressHydrationWarning
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/6 active:scale-90"
        style={{ color: "var(--md-text-primary)" }}
      >
        <FiSettings size={15} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
          <div
            className="relative rounded-md3 p-5 w-full max-w-sm"
            style={{
              backgroundColor: "var(--md-card-bg)",
              border: "1px solid var(--md-card-border)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="font-heading text-lg font-semibold"
                style={{ color: "var(--md-text-primary)" }}
              >
                <FiSettings className="inline mr-2" size={16} />
                {t("settings.title")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("gallery.close")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/6"
                suppressHydrationWarning
                style={{ color: "var(--md-text-muted)" }}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Weather source */}
              <div>
                <p
                  className="text-xs font-medium mb-2.5"
                  style={{ color: "var(--md-text-secondary)" }}
                  suppressHydrationWarning
                >
                  {t("settings.weather_source")}
                </p>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => update({ weatherSource: "manual" })}
                    suppressHydrationWarning
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor:
                        s.weatherSource === "manual"
                          ? "var(--md-primary-020)"
                          : "rgba(255,255,255,0.05)",
                      color:
                        s.weatherSource === "manual" ? "var(--md-primary)" : "var(--md-text-muted)",
                    }}
                  >
                    {t("settings.weather_manual")}
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ weatherSource: "auto" })}
                    suppressHydrationWarning
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor:
                        s.weatherSource === "auto"
                          ? "var(--md-primary-020)"
                          : "rgba(255,255,255,0.05)",
                      color:
                        s.weatherSource === "auto" ? "var(--md-primary)" : "var(--md-text-muted)",
                    }}
                  >
                    {t("settings.weather_auto")}
                  </button>
                </div>
                <input
                  type="text"
                  value={s.manualCity || ""}
                  placeholder={siteConfig.weather.city}
                  disabled={s.weatherSource !== "manual"}
                  onChange={(e) => update({ manualCity: e.target.value })}
                  className="w-full rounded-md3-sm px-3 py-2 text-xs outline-hidden border bg-white/5 disabled:opacity-50 disabled:bg-white/[0.02]"
                  style={{
                    borderColor: "var(--md-card-border)",
                    color:
                      s.weatherSource === "manual"
                        ? "var(--md-text-primary)"
                        : "var(--md-text-secondary)",
                  }}
                />
              </div>

              {/* HUE */}
              <div>
                <p
                  className="text-xs font-medium mb-2.5"
                  style={{ color: "var(--md-text-secondary)" }}
                  suppressHydrationWarning
                >
                  {t("settings.hue")}
                </p>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => update({ hueEnabled: true })}
                    suppressHydrationWarning
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: s.hueEnabled
                        ? "var(--md-primary-020)"
                        : "rgba(255,255,255,0.05)",
                      color: s.hueEnabled ? "var(--md-primary)" : "var(--md-text-muted)",
                    }}
                  >
                    {t("settings.hue_on")}
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ hueEnabled: false })}
                    suppressHydrationWarning
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: s.hueEnabled
                        ? "rgba(255,255,255,0.05)"
                        : "var(--md-primary-020)",
                      color: s.hueEnabled ? "var(--md-text-muted)" : "var(--md-primary)",
                    }}
                  >
                    {t("settings.hue_off")}
                  </button>
                </div>
                {s.hueEnabled && <HueSlider value={s.customHue ?? 250} onCommit={commitHue} />}
              </div>
            </div>

            <p
              className="mt-4 text-[10px] text-center"
              style={{ color: "var(--md-text-muted)" }}
              suppressHydrationWarning
            >
              {t("settings.persist")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function HueSlider({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--md-hue", String(value));
  }, [value]);

  useEffect(() => {
    if (ref.current) ref.current.value = String(value);
  }, [value]);

  const commit = () => {
    if (!ref.current) return;
    const val = parseInt(ref.current.value, 10);
    document.documentElement.style.setProperty("--md-hue", String(val));
    onCommit(val);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={ref}
        type="range"
        min="0"
        max="360"
        defaultValue={value}
        onPointerUp={commit}
        onBlur={commit}
        className="hue-slider flex-1 cursor-pointer"
      />
      <span className="text-xs font-mono" style={{ color: "var(--md-text-muted)" }}>
        {value}°
      </span>
    </div>
  );
}
