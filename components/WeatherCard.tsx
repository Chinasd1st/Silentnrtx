"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { loadSettings } from "@/lib/settings";
import { FaCloudSun, FaTint, FaWind, FaSun } from "react-icons/fa";

interface WData {
  temp_C: string; FeelsLikeC: string; humidity: string;
  lang_zh: { value: string }[]; weatherDesc: { value: string }[];
  winddir16Point: string; windspeedKmph: string; localObsDateTime: string;
  precipMM: string; uvIndex: string;
}
interface AData { areaName: { value: string }[]; region: { value: string }[]; }

const CACHE_KEY = "weather";
const CACHE_TTL = 30 * 60 * 1000;

function windDir(en: string, isZh: boolean): string {
  const zh: Record<string, string> = {
    N: "北", NNE: "东北偏北", NE: "东北", ENE: "东北偏东",
    E: "东", ESE: "东南偏东", SE: "东南", SSE: "东南偏南",
    S: "南", SSW: "西南偏南", SW: "西南", WSW: "西南偏西",
    W: "西", WNW: "西北偏西", NW: "西北", NNW: "西北偏北",
  };
  const dir = isZh ? (zh[en] || en) : en;
  return dir;
}

function windDirShort(en: string): string {
  const m: Record<string, string> = {
    N: "N", NNE: "NNE", NE: "NE", ENE: "ENE",
    E: "E", ESE: "ESE", SE: "SE", SSE: "SSE",
    S: "S", SSW: "SSW", SW: "SW", WSW: "WSW",
    W: "W", WNW: "WNW", NW: "NW", NNW: "NNW",
  };
  return m[en] || en;
}

function windDisplay(en: string, speed: string, isZh: boolean): { value: string; label: string } {
  const s = parseInt(speed) || 0;
  if (isZh) {
    const dir = windDir(en, true);
    let level = "1级";
    if (s >= 5 && s < 12) level = "2级";
    else if (s >= 12 && s < 20) level = "3级";
    else if (s >= 20 && s < 29) level = "4级";
    else if (s >= 29 && s < 39) level = "5级";
    else if (s >= 39) level = "6+";
    return { value: `${dir}风 ${level}`, label: `${speed} km/h` };
  }
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

    const ck = CACHE_KEY + "_" + effective;
    const cached = getCache<{ w: WData; a: AData }>(ck, CACHE_TTL);
    if (cached) { setWeather(cached.w); setArea(cached.a); setLoading(false); return; }

    const enc = city ? encodeURIComponent(city) : "";
    setLoading(true);
    setError(false);
    fetchWithTimeout(`https://wttr.in/${enc}?format=j1${isZh ? "&lang=zh" : ""}`)
      .then((r) => r.json())
      .then((data: any) => {
        if (data.current_condition?.[0]) {
          setWeather(data.current_condition[0]);
          if (data.nearest_area?.[0]) setArea(data.nearest_area[0]);
          setCache(ck, { w: data.current_condition[0], a: data.nearest_area?.[0] });
        } else throw new Error("no data");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cfg.city, isZh]);

  useEffect(() => {
    if (!cfg.enabled) { setLoading(false); return; }
    // Re-fetch whenever settings change (city switch)
    const interval = setInterval(() => fetchWeather(), 500);
    fetchWeather();
    return () => clearInterval(interval);
  }, [cfg.enabled, fetchWeather]);

  const desc = isZh ? (weather?.lang_zh?.[0]?.value || "") : (weather?.weatherDesc?.[0]?.value || "");
  const cityName = area?.areaName?.[0]?.value || cfg.city;
  const regionName = area?.region?.[0]?.value || "";

  if (!cfg.enabled) return null;
  if (loading) return <CardSkeleton />;
  if (error || !weather) return <ErrorCard title={t("weather.title")} onRetry={fetchWeather} />;

  const w = weather;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <FaCloudSun className="shrink-0" style={{ color: "var(--md-primary)" }} />
          <span className="text-sm font-semibold truncate max-w-[140px] sm:max-w-[220px]" style={{ color: "var(--md-text-primary)" }}>
            {cityName}
          </span>
        </div>
        <span className="text-[10px] shrink-0 ml-auto" style={{ color: "var(--md-text-muted)" }}>{w.localObsDateTime}</span>
      </div>

      <div className="text-center mb-5">
        <div className="text-5xl font-bold font-heading leading-none" style={{ color: "var(--md-primary)" }}>
          {w.temp_C}°C
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--md-text-secondary)" }}>
          {t("weather.feels_like")} {w.FeelsLikeC}°C{desc ? ` · ${desc}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat icon={<FaTint size={13} />} value={`${w.humidity}%`} label={t("weather.humidity")} />
        <WindStat dir={w.winddir16Point} speed={w.windspeedKmph} isZh={isZh} />
        <Stat icon={<FaTint size={13} />} value={w.precipMM ? `${w.precipMM}mm` : "0mm"} label={isZh ? "降水量" : "Precip"} />
        <Stat icon={<FaSun size={13} />} value={w.uvIndex || "0"} label="UV" />
      </div>
    </div>
  );
}

function WindStat({ dir, speed, isZh }: { dir: string; speed: string; isZh: boolean }) {
  const { value, label } = windDisplay(dir, speed, isZh);
  return (
    <div className="rounded-[12px] p-2.5 text-center" style={{ backgroundColor: "var(--md-primary-008)" }}>
      <div className="flex justify-center mb-1" style={{ color: "var(--md-text-muted)" }}><FaWind size={13} /></div>
      <p className="text-sm font-semibold leading-snug truncate" style={{ color: "var(--md-text-primary)" }} title={value}>{value}</p>
      <p className="text-[9px] leading-tight mt-0.5" style={{ color: "var(--md-text-muted)" }}>{label}</p>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-[12px] p-2.5 text-center" style={{ backgroundColor: "var(--md-primary-008)" }}>
      <div className="flex justify-center mb-1" style={{ color: "var(--md-text-muted)" }}>{icon}</div>
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--md-text-primary)" }}>{value}</p>
      <p className="text-[9px] leading-tight mt-0.5" style={{ color: "var(--md-text-muted)" }}>{label}</p>
    </div>
  );
}
