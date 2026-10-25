"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FaCloudSun, FaSun, FaTint, FaWind } from "react-icons/fa";
import { FiSunrise, FiSunset } from "react-icons/fi";
import { CachedAt } from "@/components/ui/CachedAt";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";
import { getMoonPhase } from "@/lib/moon";
import { loadSettings } from "@/lib/settings";

interface WData {
  temp_C: string;
  FeelsLikeC: string;
  humidity: string;
  lang_zh: { value: string }[];
  lang_ja: { value: string }[];
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
  latitude: string;
  longitude: string;
}

interface WttrResponse {
  current_condition?: WData[];
  nearest_area?: AData[];
}

interface SunData {
  /** HH:MM in the location's own timezone. */
  sunrise: string;
  sunset: string;
}

const CACHE_KEY = "weather";
const CACHE_TTL = 30 * 60 * 1000;

/** Sunrise / sunset for one day, from Open-Meteo (no API key required). */
async function fetchSun(lat: string, lon: string): Promise<SunData | null> {
  try {
    const { data } = await api.get<{ daily?: { sunrise?: string[]; sunset?: string[] } }>(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`,
      { timeout: 8000 }
    );
    const rise = data.daily?.sunrise?.[0];
    const set = data.daily?.sunset?.[0];
    if (!rise || !set) return null;
    return { sunrise: rise.slice(11, 16), sunset: set.slice(11, 16) };
  } catch {
    return null;
  }
}

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
  const [sun, setSun] = useState<SunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cacheKey, setCacheKey] = useState("");
  const cfg = siteConfig.weather;
  const isZh = i18n.language.startsWith("zh");
  /** wttr.in localization code: `zh` covers both Chinese locales, `ja` for Japanese. */
  const wttrLang = i18n.language === "ja" ? "ja" : isZh ? "zh" : "";
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
      setSun(null);
      prevCityRef.current = effective;
    }

    const ck = `${CACHE_KEY}_${effective}_${wttrLang || "en"}`;
    setCacheKey(ck);
    const cached = getCache<{ w: WData; a: AData; sun?: SunData | null }>(ck, CACHE_TTL);
    if (cached) {
      setWeather(cached.w);
      setArea(cached.a);
      setSun(cached.sun ?? null);
      setLoading(false);
      return;
    }

    const enc = city ? encodeURIComponent(city) : "";
    setLoading(true);
    setError(false);
    fetchWithRetry(() =>
      api.get<WttrResponse>(
        `https://wttr.in/${enc}?format=j1${wttrLang ? `&lang=${wttrLang}` : ""}`
      )
    )
      .then(({ data }) => data)
      .then(async (data: WttrResponse) => {
        const current = data.current_condition?.[0];
        const nearest = data.nearest_area?.[0];
        if (!current) throw new Error("no data");
        const sunData =
          nearest?.latitude && nearest?.longitude
            ? await fetchSun(nearest.latitude, nearest.longitude)
            : null;
        setWeather(current);
        if (nearest) setArea(nearest);
        setSun(sunData);
        setCache(ck, { w: current, a: nearest, sun: sunData });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [wttrLang]);

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
    const onRefresh = () => fetchWeather();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("settings-changed", onRefresh);
    window.addEventListener("cache-cleared", onRefresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("settings-changed", onRefresh);
      window.removeEventListener("cache-cleared", onRefresh);
    };
  }, [fetchWeather]);

  const desc =
    wttrLang === "ja"
      ? weather?.lang_ja?.[0]?.value || ""
      : wttrLang === "zh"
        ? weather?.lang_zh?.[0]?.value || ""
        : weather?.weatherDesc?.[0]?.value || "";
  const cityName = area?.areaName?.[0]?.value || cfg.city;

  if (!cfg.enabled) return null;
  if (loading) return <CardSkeleton />;
  if (error || !weather) return <ErrorCard title={t("weather.title")} onRetry={fetchWeather} />;

  const w = weather;
  const moon = getMoonPhase();
  const moonPct = Math.round(moon.illumination * 100);

  return (
    <div className="md-card md-card--static">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <FaCloudSun className="shrink-0" style={{ color: "var(--md-primary)" }} />
          <span
            className="font-heading text-lg font-semibold truncate max-w-[140px] sm:max-w-[220px]"
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
          className="text-5xl font-bold font-heading stat-num leading-none"
          style={{ color: "var(--md-primary)" }}
        >
          {w.temp_C}°C
        </div>
        <p className="text-xs mt-2 stat-num" style={{ color: "var(--md-text-secondary)" }}>
          {t("weather.feels_like")} {w.FeelsLikeC}°C{desc ? ` · ${desc}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat icon={<FaTint size={13} />} value={`${w.humidity}%`} label={t("weather.humidity")} />
        <WindStat dir={w.winddir16Point} speed={w.windspeedKmph} />
        <Stat
          icon={<FaTint size={13} />}
          value={w.precipMM ? `${w.precipMM}mm` : "0mm"}
          label={t("weather.precip")}
        />
        <Stat icon={<FaSun size={13} />} value={w.uvIndex || "0"} label={t("weather.uv")} />
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-2 rounded-panel px-3 py-2"
        style={{ backgroundColor: "var(--md-primary-008)" }}
      >
        <span
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: "var(--md-text-muted)" }}
        >
          <FiSunrise size={12} aria-hidden="true" style={{ color: "var(--md-primary)" }} />
          {t("weather.sunrise")}
          <span
            className="text-xs font-semibold tabular-nums stat-num"
            style={{ color: "var(--md-text-primary)" }}
          >
            {sun?.sunrise ?? "--:--"}
          </span>
        </span>
        <span
          className="flex items-center gap-1.5 text-[10px]"
          style={{ color: "var(--md-text-muted)" }}
        >
          <FiSunset size={12} aria-hidden="true" style={{ color: "var(--md-primary)" }} />
          {t("weather.sunset")}
          <span
            className="text-xs font-semibold tabular-nums stat-num"
            style={{ color: "var(--md-text-primary)" }}
          >
            {sun?.sunset ?? "--:--"}
          </span>
        </span>
        <span
          role="img"
          className="flex items-center gap-1 text-[10px]"
          style={{ color: "var(--md-text-muted)" }}
          aria-label={`${t("weather.moon")} ${moonPct}%`}
          title={`${t("weather.moon")} ${moonPct}%`}
        >
          <MoonGlyph fraction={moon.fraction} />
          <span
            className="text-xs font-semibold tabular-nums stat-num"
            style={{ color: "var(--md-text-primary)" }}
          >
            {moonPct}%
          </span>
        </span>
      </div>
      {cacheKey && <CachedAt cacheKey={cacheKey} />}
    </div>
  );
}

/** Moon shape derived from the illuminated fraction — drawn, not an emoji. */
function MoonGlyph({ fraction, size = 13 }: { fraction: number; size?: number }) {
  const maskId = `moon-${useId().replace(/:/g, "")}`;
  const c = Math.cos(2 * Math.PI * fraction);
  const r = size / 2 - 0.5;
  const cx = size / 2;
  const cy = size / 2;
  const rx = Math.abs(c) * r;
  const waxing = fraction <= 0.5;
  const half = waxing
    ? `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`
    : `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect width={size} height={size} fill="black" />
          <path d={half} fill="white" />
          {rx > 0.01 && <ellipse cx={cx} cy={cy} rx={rx} ry={r} fill={c > 0 ? "black" : "white"} />}
        </mask>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="var(--md-text-primary)" opacity="0.22" />
      <circle cx={cx} cy={cy} r={r} fill="var(--md-primary)" mask={`url(#${maskId})`} />
    </svg>
  );
}

function WindStat({ dir, speed }: { dir: string; speed: string }) {
  const { value, label } = windDisplay(dir, speed);
  return (
    <div
      className="rounded-chip p-2.5 text-center"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <div className="flex justify-center mb-1" style={{ color: "var(--md-text-muted)" }}>
        <FaWind size={13} />
      </div>
      <p
        className="text-sm font-semibold leading-snug truncate stat-num"
        style={{ color: "var(--md-text-primary)" }}
      >
        {value}
      </p>
      <p className="text-[10px] leading-tight mt-0.5" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      className="rounded-chip p-2.5 text-center"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <div className="flex justify-center mb-1" style={{ color: "var(--md-text-muted)" }}>
        {icon}
      </div>
      <p
        className="text-sm font-semibold leading-snug stat-num"
        style={{ color: "var(--md-text-primary)" }}
      >
        {value}
      </p>
      <p className="text-[10px] leading-tight mt-0.5" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
