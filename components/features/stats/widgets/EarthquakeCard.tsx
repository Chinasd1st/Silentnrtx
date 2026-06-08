"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaEarthAsia } from "react-icons/fa6";
import { MdDangerous, MdInfo, MdWarning } from "react-icons/md";
import { CachedAt } from "@/components/ui/CachedAt";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { PillButton } from "@/components/ui/PillButton";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { api, fetchWithRetry } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";

interface EqBase {
  time: string;
  location: string;
  magnitude: string;
  depth: string;
  latitude: string;
  longitude: string;
}
interface JmaItem extends EqBase {
  Title: string;
  shindo: string;
  info?: string;
}
interface CmaItem extends EqBase {
  intensity: string;
}

type TsunamiLevel = "advisory" | "warning" | "major" | null;

function getTsunamiLevel(info: string): TsunamiLevel {
  if (info.includes("大津波警報")) return "major";
  if (info.includes("津波警報")) return "warning";
  if (info.includes("津波注意報")) return "advisory";
  return null;
}

const LEVEL_CONFIG: Record<
  NonNullable<TsunamiLevel>,
  { cssVar: string; Icon: typeof MdWarning }
> = {
  major: { cssVar: "var(--md-tsunami-critical)", Icon: MdDangerous },
  warning: { cssVar: "var(--md-tsunami-warning)", Icon: MdWarning },
  advisory: { cssVar: "var(--md-tsunami-advisory)", Icon: MdInfo },
};

const CACHE_TTL = 5 * 60 * 1000;

function useEq<T>(cacheKey: string, url: string, mapFn: (r: unknown) => T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mapRef = useRef(mapFn);
  mapRef.current = mapFn;

  const fetchData = useCallback(() => {
    const cached = getCache<T>(cacheKey, CACHE_TTL);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    fetchWithRetry(() => api.get(url))
      .then(({ data }) => data)
      .then((raw: Record<string, unknown>) => {
        const keys = Object.keys(raw)
          .filter((k) => /^No\d+$/.test(k))
          .sort();
        if (keys.length > 0) {
          const d = mapRef.current(raw[keys[0]]);
          setData(d);
          setCache(cacheKey, d);
        } else throw new Error("no data");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cacheKey, url]);

  useEffect(() => {
    fetchData();
    const onClear = () => fetchData();
    window.addEventListener("cache-cleared", onClear);
    return () => window.removeEventListener("cache-cleared", onClear);
  }, [fetchData]);
  return { data, loading, error, retry: fetchData };
}

export function EarthquakeCard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"jma" | "cma">("jma");
  const cacheKey = tab === "jma" ? "eq_jma" : "eq_cma";

  const jma = useEq<JmaItem>("eq_jma", "https://api.wolfx.jp/jma_eqlist.json", (r) => r as JmaItem);
  const cma = useEq<CmaItem>(
    "eq_cma",
    "https://api.wolfx.jp/cenc_eqlist.json",
    (r) => r as CmaItem
  );

  if (jma.loading && cma.loading) return <CardSkeleton />;

  const active = tab === "jma" ? jma : cma;
  const eq = active.data;
  const jmaEq = tab === "jma" ? (eq as JmaItem | null) : null;
  const cmaEq = tab === "cma" ? (eq as CmaItem | null) : null;
  const info = jmaEq?.info || "";
  const level = info ? getTsunamiLevel(info) : null;
  const lvlCfg = level ? LEVEL_CONFIG[level] : null;

  return (
    <Card>
      <CardHeader
        icon={<FaEarthAsia />}
        title={t("earthquake.title")}
        action={
          <div className="flex gap-1">
            <PillButton active={tab === "jma"} onClick={() => setTab("jma")}>
              JMA
            </PillButton>
            <PillButton active={tab === "cma"} onClick={() => setTab("cma")}>
              CMA
            </PillButton>
          </div>
        }
      />

      {active.error && !eq && <ErrorCard title={t("earthquake.title")} onRetry={active.retry} />}

      {!active.error && !eq && (
        <div
          className="rounded-[16px] p-3 mb-3 flex items-center justify-center"
          style={{ backgroundColor: "var(--md-primary-008)", minHeight: "115px" }}
        >
          <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>
            {t("earthquake.no_data")}
          </p>
        </div>
      )}

      {eq && (
        <div
          className="rounded-[16px] p-3 mb-3"
          style={{ backgroundColor: "var(--md-primary-008)" }}
        >
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: "var(--md-text-primary)" }}
          >
            {(eq as EqBase).location}
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span
              className="text-3xl font-bold font-heading leading-none"
              style={{ color: "var(--md-primary)" }}
            >
              M{(eq as EqBase).magnitude}
            </span>
            <span className="text-xs leading-none" style={{ color: "var(--md-text-muted)" }}>
              {tab === "jma"
                ? `${t("earthquake.shindo")} ${jmaEq!.shindo} · ${t("earthquake.depth")} ${jmaEq!.depth}`
                : `${t("earthquake.intensity")} ${cmaEq!.intensity} · ${t("earthquake.depth")} ${cmaEq!.depth}km`}
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug" style={{ color: "var(--md-text-secondary)" }}>
            {(eq as EqBase).time}
          </p>
          <p className="mt-1 text-[10px] leading-snug" style={{ color: "var(--md-text-muted)" }}>
            {(eq as EqBase).latitude}, {(eq as EqBase).longitude}
          </p>
          {jmaEq?.Title && jmaEq.Title !== "震源・震度情報" && (
            <p
              className="mt-2 text-[10px] font-semibold"
              style={{ color: "var(--md-text-secondary)" }}
            >
              {jmaEq.Title}
            </p>
          )}
          {info && lvlCfg && (
            <div
              className="mt-2 flex items-start gap-1.5 rounded-[12px] p-2"
              style={{
                backgroundColor: `color-mix(in oklch, ${lvlCfg.cssVar} 12%, transparent)`,
              }}
            >
              <lvlCfg.Icon className="mt-0.5 shrink-0" size={14} style={{ color: lvlCfg.cssVar }} />
              <p className="text-[10px] leading-normal" style={{ color: lvlCfg.cssVar }}>
                {info}
              </p>
            </div>
          )}
        </div>
      )}
      <CachedAt cacheKey={cacheKey} />
    </Card>
  );
}
