"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaCloudSun, FaSun, FaTint, FaWind } from "react-icons/fa";
import { ErrorCard } from "@/components/ErrorCard";
import { CardSkeleton } from "@/components/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";
import { loadSettings } from "@/lib/settings";

interface WData {
  temp_C: string;
  FeelsLikeC: string;
  humidity: string;
  lang_zh: { value: string }[];
  weatherDesc: { value: string }[];
  winddir16Point: string;
  windspeedKmph: string;
  localObsDateTime: string;
  precipMM: string;
  uvIndex: string;
}
interface AData {
  areaName: { value: string }[];
  region: { value: string }[];
}

const CACHE_KEY = "weather";
const CACHE_TTL = 30 * 60 * 1000;

function windDirShort(en: string): string {
  const m: Record<string, string> = {
    N: "N",
    NNE: "NNE",
    NE: "NE",
    ENE: "ENE",
    E: "E",
    ESE: "ESE",
    SE: "SE",
    SSE: "SSE",
    S: "S",
    SSW: "SSW",
    SW: "SW",
    WSW: "WSW",
    W: "W",
    WNW: "WNW",
    NW: "NW",
    NNW: "NNW",
  };
  return m[en] || en;
}

function windDisplay(en: string, speed: string): { value: string; label: string } {
  return { value: `${windDirShort(en)} ${speed}`, label: "km/h" };
}

export function WeatherCard() {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<WData | null>(null);
  const [area, setArea] = useState<AData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cfg = siteConfig.weather;
  const isZh = i18n.language === "zh-CN";
  const prevCityRef = useRef("");

  const fetchWeather = useCallback(() => {
    const settings = loadSettings();
    let city = "";
    if (settings.weatherSource === "manual") {
      city = settings.manualCity || cfg.city || "";
    }
    const effective = city || "__auto__";

    // Force refresh if city changed
    if (prevCityRef.current !== effective) {
      setWeather(null);
      setArea(null);
      prevCityRef.current = effective;
    }

    const ck = `${CACHE_KEY}_${effective}`;
    const cached = getCache<{ w: WData; a: AData }>(ck, CACHE_TTL);
    if (cached) {
      setWeather(cached.w);
      setArea(cached.a);
      setLoading(false);
      return;
    }

    const enc = city ? encodeURIComponent(city) : "";
    setLoading(true);
    setError(false);
    fetchWithRetry(() => api.get(`https://wttr.in/${enc}?format=j1${isZh ? "&lang=zh" : ""}`))
      .then(({ data }) => data)
      .then((data: any) => {
        if (data.current_condition?.[0]) {
          setWeather(data.current_condition[0]);
          if (data.nearest_area?.[0]) setArea(data.nearest_area[0]);
          setCache(ck, { w: data.current_condition[0], a: data.nearest_area?.[0] });
        } else throw new Error("no data");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isZh]);

  useEffect(() => {
    if (!cfg.enabled) {
      setLoading(false);
      return;
    }
    fetchWeather();
    const interval = setInterval(() => fetchWeather(), 300_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchWeather();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchWeather]);

  const desc = isZh ? weather?.lang_zh?.[0]?.value || "" : weather?.weatherDesc?.[0]?.value || "";
  const cityName = area?.areaName?.[0]?.value || cfg.city;
  const _regionName = area?.region?.[0]?.value || "";

  if (!cfg.enabled) return null;
  if (loading) return <CardSkeleton />;
  if (error || !weather) return <ErrorCard title={t("weather.title")} onRetry={fetchWeather} />;

  const w = weather;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <FaCloudSun className="shrink-0" style={{ color: "var(--md-primary)" }} />
          <span
            className="text-sm font-semibold truncate max-w-[140px] sm:max-w-[220px]"
            style={{ color: "var(--md-text-primary)" }}
          >
            {cityName}
          </span>
        </div>
        <span className="text-[10px] shrink-0 ml-auto" style={{ color: "var(--md-text-muted)" }}>
          {w.localObsDateTime}
        </span>
      </div>

      <div className="text-center mb-5">
        <div
          className="text-5xl font-bold font-heading leading-none"
          style={{ color: "var(--md-primary)" }}
        >
          {w.temp_C}°C
        </div>
        <p
          className="text-xs mt-2"
          style={{ color: "var(--md-text-secondary)" }}
          suppressHydrationWarning
        >
          {t("weather.feels_like")} {w.FeelsLikeC}°C{desc ? ` · ${desc}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat icon={<FaTint size={13} />} value={`${w.humidity}%`} label={t("weather.humidity")} />
        <WindStat dir={w.winddir16Point} speed={w.windspeedKmph} />
        <Stat
          icon={<FaTint size={13} />}
          value={w.precipMM ? `${w.precipMM}mm` : "0mm"}
          label={t("weather.precip")}
        />
        <Stat icon={<FaSun size={13} />} value={w.uvIndex || "0"} label={t("weather.uv")} />
      </div>
    </div>
  );
}

function WindStat({ dir, speed }: { dir: string; speed: string }) {
  const { value, label } = windDisplay(dir, speed);
  return (
    <div
      className="rounded-md3-sm p-2.5 text-center"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <div className="flex justify-center mb-1" style={{ color: "var(--md-text-muted)" }}>
        <FaWind size={13} />
      </div>
      <p
        className="text-sm font-semibold leading-snug truncate"
        style={{ color: "var(--md-text-primary)" }}
      >
        {value}
      </p>
      <p className="text-[9px] leading-tight mt-0.5" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      className="rounded-md3-sm p-2.5 text-center"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <div className="flex justify-center mb-1" style={{ color: "var(--md-text-muted)" }}>
        {icon}
      </div>
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--md-text-primary)" }}>
        {value}
      </p>
      <p className="text-[9px] leading-tight mt-0.5" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
