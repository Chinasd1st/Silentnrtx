"use client";

import { useCallback, useEffect, useState } from "react";
import { WiHurricane } from "react-icons/wi";
import { CachedAt } from "@/components/ui/CachedAt";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";

const JMA_BASE = "https://www.jma.go.jp/bosai/typhoon/data";
const CACHE_KEY = "typhoon";
const CACHE_TTL = 15 * 60 * 1000;
/** Cards stay readable with a couple of storms; JMA rarely tracks more. */
const MAX_TYPHOONS = 3;

/** JMA reports the course in Japanese; show the usual 16-point abbreviation. */
const COURSE: Record<string, string> = {
  北: "N",
  北北東: "NNE",
  北東: "NE",
  東北東: "ENE",
  東: "E",
  東南東: "ESE",
  南東: "SE",
  南南東: "SSE",
  南: "S",
  南南西: "SSW",
  南西: "SW",
  西南西: "WSW",
  西: "W",
  西北西: "WNW",
  北西: "NW",
  北北西: "NNW",
};

const STRONG_CATEGORIES = new Set(["TY", "STY", "VSTY"]);

interface TargetTc {
  tropicalCyclone: string;
  typhoonNumber: string;
  category: string;
  issue: string;
}

interface SpecPart {
  part?: string | { jp?: string; en?: string };
  issue?: { JST?: string; UTC?: string };
  name?: { jp?: string; en?: string };
  category?: { jp?: string; en?: string };
  maximumWind?: { sustained?: { "m/s"?: string; kt?: string } };
  position?: { deg?: [number, number] };
  pressure?: string;
  course?: string;
  speed?: { note?: { jp?: string; en?: string }; "km/h"?: string };
  validtime?: { JST?: string; UTC?: string };
}

export interface Typhoon {
  id: string;
  number: string;
  nameEn: string;
  nameJp: string;
  category: string;
  pressure?: string;
  windMs?: string;
  course?: string;
  speed?: string;
  slow?: boolean;
  lat?: number;
  lon?: number;
  updated?: string;
}

function partName(part: SpecPart["part"]): string {
  return typeof part === "string" ? part : (part?.en ?? "");
}

function coord(value: number, axis: "lat" | "lon"): string {
  const hemi = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(1)}°${hemi}`;
}

async function fillDetails(target: TargetTc): Promise<Typhoon> {
  const base: Typhoon = {
    id: target.tropicalCyclone,
    number: target.typhoonNumber,
    nameEn: "",
    nameJp: "",
    category: target.category,
  };

  try {
    const { data: specs } = await api.get<SpecPart[]>(
      `${JMA_BASE}/${target.tropicalCyclone}/specifications.json`,
      { timeout: 8000 }
    );
    const title = specs.find((s) => partName(s.part) === "title");
    const analysis = specs.find((s) => partName(s.part) === "Analysis");
    if (!title) return base;

    const [lat, lon] = analysis?.position?.deg ?? [];
    const speedKmh = analysis?.speed?.["km/h"];
    const slow = analysis?.speed?.note?.en === "Slow";

    return {
      ...base,
      nameEn: title.name?.en ?? "",
      nameJp: title.name?.jp ?? "",
      category: analysis?.category?.en ?? title.category?.en ?? base.category,
      pressure: analysis?.pressure,
      windMs: analysis?.maximumWind?.sustained?.["m/s"],
      course: analysis?.course ? COURSE[analysis.course] : undefined,
      speed: speedKmh ? `${speedKmh} km/h` : undefined,
      slow,
      lat: lat ?? undefined,
      lon: lon ?? undefined,
      updated: analysis?.validtime?.JST ?? title.issue?.JST,
    };
  } catch {
    return base;
  }
}

async function loadTyphoons(): Promise<Typhoon[]> {
  const { data: list } = await api.get<TargetTc[]>(`${JMA_BASE}/targetTc.json`, { timeout: 8000 });
  if (!Array.isArray(list) || list.length === 0) return [];
  return Promise.all(list.slice(0, MAX_TYPHOONS).map(fillDetails));
}

export function TyphoonCard() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<Typhoon[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    const cached = getCache<Typhoon[]>(CACHE_KEY, CACHE_TTL);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    loadTyphoons()
      .then((list) => {
        setData(list);
        setCache(CACHE_KEY, list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onClear = () => load();
    window.addEventListener("cache-cleared", onClear);
    return () => window.removeEventListener("cache-cleared", onClear);
  }, [load]);

  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("typhoon.title")} onRetry={load} />;

  const list = data ?? [];

  return (
    <Card>
      <CardHeader
        icon={<WiHurricane />}
        title={t("typhoon.title")}
        action={
          list.length > 0 ? (
            <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>
              {list.length} {t("typhoon.active")}
            </span>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-panel p-3"
          style={{ backgroundColor: "var(--md-primary-008)", minHeight: 90 }}
        >
          <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>
            {t("typhoon.none")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((ty) => {
            const strong = STRONG_CATEGORIES.has(ty.category);
            const accent = strong ? "var(--md-accent-pink)" : "var(--md-accent-yellow)";
            const name = i18n.language === "ja" && ty.nameJp ? ty.nameJp : ty.nameEn;
            const speed =
              ty.slow && !ty.speed ? t("typhoon.slow") : (ty.speed ?? t("typhoon.slow"));

            return (
              <div
                key={ty.id}
                className="rounded-panel p-3"
                style={{ backgroundColor: "var(--md-primary-008)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs tabular-nums"
                    style={{ color: "var(--md-text-muted)" }}
                  >
                    {ty.number}
                  </span>
                  <span
                    className="truncate text-sm font-semibold"
                    style={{ color: "var(--md-text-primary)" }}
                  >
                    {name}
                  </span>
                  <span
                    className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                      color: accent,
                    }}
                  >
                    {ty.category}
                  </span>
                </div>

                <p className="mt-1 text-[10px]" style={{ color: "var(--md-text-muted)" }}>
                  {ty.lat !== undefined && ty.lon !== undefined
                    ? `${coord(ty.lat, "lat")} ${coord(ty.lon, "lon")}`
                    : "—"}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div
                    className="rounded-chip px-2 py-1.5"
                    style={{ backgroundColor: "var(--md-card-bg)" }}
                  >
                    <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
                      {t("typhoon.pressure")}
                    </p>
                    <p
                      className="text-xs font-semibold stat-num"
                      style={{ color: "var(--md-text-primary)" }}
                    >
                      {ty.pressure ? `${ty.pressure} hPa` : "—"}
                    </p>
                  </div>
                  <div
                    className="rounded-chip px-2 py-1.5"
                    style={{ backgroundColor: "var(--md-card-bg)" }}
                  >
                    <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
                      {t("typhoon.wind")}
                    </p>
                    <p
                      className="text-xs font-semibold stat-num"
                      style={{ color: "var(--md-text-primary)" }}
                    >
                      {ty.windMs ? `${ty.windMs} m/s` : "—"}
                    </p>
                  </div>
                </div>

                <p className="mt-1.5 text-[10px]" style={{ color: "var(--md-text-secondary)" }}>
                  {t("typhoon.moving")}
                  {ty.course ? ` ${ty.course}` : ""}
                  {speed ? ` · ${speed}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <CachedAt cacheKey={CACHE_KEY} />
    </Card>
  );
}
