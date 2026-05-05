"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaCloudSun } from "react-icons/fa";

interface WData { temp_C: string; FeelsLikeC: string; humidity: string; lang_zh: { value: string }[]; weatherDesc: { value: string }[]; winddir16Point: string; windspeedKmph: string; localObsDateTime: string; }
interface AData { areaName: { value: string }[]; region: { value: string }[]; }

const CACHE_KEY = "weather";
const CACHE_TTL = 30 * 60 * 1000;

export function WeatherCard() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WData | null>(null);
  const [area, setArea] = useState<AData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cfg = siteConfig.weather;

  const fetchWeather = useCallback(() => {
    const cached = getCache<{ w: WData; a: AData }>(CACHE_KEY, CACHE_TTL);
    if (cached) { setWeather(cached.w); setArea(cached.a); setLoading(false); return; }

    // Auto IP: no city param, fallback to configured city
    const url = `https://wttr.in/${cfg.city ? encodeURIComponent(cfg.city) : ""}?format=j1`;
    fetchWithTimeout(url)
      .then((r) => r.json())
      .then((data: any) => {
        if (data.current_condition?.[0]) {
          setWeather(data.current_condition[0]);
          if (data.nearest_area?.[0]) setArea(data.nearest_area[0]);
          setCache(CACHE_KEY, { w: data.current_condition[0], a: data.nearest_area?.[0] });
        } else throw new Error("no data");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cfg.city]);

  useEffect(() => { if (!cfg.enabled) { setLoading(false); return; } fetchWeather(); }, [cfg.enabled, fetchWeather]);

  const desc = weather?.lang_zh?.[0]?.value || weather?.weatherDesc?.[0]?.value || "";
  const cityName = area?.areaName?.[0]?.value || cfg.city;

  if (!cfg.enabled) return null;
  if (loading) return <CardSkeleton />;
  if (error || !weather) return <ErrorCard title={t("weather.title")} onRetry={fetchWeather} />;

  return (
    <div className="md-card">
      <div className="flex items-center gap-4 mb-4 rounded-[16px] p-3" style={{ backgroundColor: "var(--md-primary-008)" }}>
        <span className="text-4xl font-bold font-heading shrink-0 leading-none" style={{ color: "var(--md-primary)" }}>{weather.temp_C}°C</span>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--md-text-primary)" }}>{desc || cityName}</p>
          <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--md-text-muted)" }}>
            <FaCloudSun className="inline mr-1" style={{ color: "var(--md-primary)" }} />
            {t("weather.feels_like")} {weather.FeelsLikeC}°C
          </p>
        </div>
        <span className="text-[10px] shrink-0 self-center" style={{ color: "var(--md-text-muted)" }}>{weather.localObsDateTime}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat value={`${weather.humidity}%`} label={t("weather.humidity")} />
        <MiniStat value={weather.windspeedKmph} label={weather.winddir16Point} />
        <MiniStat value={`${weather.FeelsLikeC}°C`} label={t("weather.feels_like")} />
      </div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[12px] p-3 text-center" style={{ backgroundColor: "var(--md-primary-008)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--md-text-primary)" }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--md-text-muted)" }}>{label}</p>
    </div>
  );
}
