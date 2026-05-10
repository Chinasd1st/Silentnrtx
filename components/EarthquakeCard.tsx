"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { api, fetchWithRetry, mapApiError } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaEarthAsia } from "react-icons/fa6";

interface EqBase {
  time: string; location: string; magnitude: string;
  depth: string; latitude: string; longitude: string;
}
interface JmaItem extends EqBase {
  shindo: string; info?: string;
}
interface CmaItem extends EqBase {
  intensity: string;
}

const CACHE_TTL = 5 * 60 * 1000;

function useEq<T>(cacheKey: string, url: string, mapFn: (r: any) => T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mapRef = useRef(mapFn);
  mapRef.current = mapFn;

  const fetchData = useCallback(() => {
    const cached = getCache<T>(cacheKey, CACHE_TTL);
    if (cached) { setData(cached); setLoading(false); return; }
    fetchWithRetry(() => api.get(url)).then(({ data }) => data)
      .then((raw: Record<string, any>) => {
        const keys = Object.keys(raw).filter((k) => /^No\d+$/.test(k)).sort();
        if (keys.length > 0) { const d = mapRef.current(raw[keys[0]]); setData(d); setCache(cacheKey, d); }
        else throw new Error("no data");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cacheKey, url]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, retry: fetchData };
}

export function EarthquakeCard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"jma" | "cma">("jma");

  const jma = useEq<JmaItem>("eq_jma", "https://api.wolfx.jp/jma_eqlist.json", (r) => r);
  const cma = useEq<CmaItem>("eq_cma", "https://api.wolfx.jp/cenc_eqlist.json", (r) => r);

  if (jma.loading && cma.loading) return <CardSkeleton />;

  const active = tab === "jma" ? jma : cma;
  const eq = active.data;

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <FaEarthAsia className="text-lg shrink-0" style={{ color: "var(--md-primary)" }} />
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>
            {t("earthquake.title")}
          </h2>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setTab("jma")} aria-label="JMA"
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{ backgroundColor: tab === "jma" ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: tab === "jma" ? "var(--md-primary)" : "var(--md-text-muted)" }}>
            JMA
          </button>
          <button onClick={() => setTab("cma")} aria-label="CMA"
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{ backgroundColor: tab === "cma" ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: tab === "cma" ? "var(--md-primary)" : "var(--md-text-muted)" }}>
            CMA
          </button>
        </div>
      </div>

      {active.error && !eq && <ErrorCard title={t("earthquake.title")} onRetry={active.retry} />}

      {eq && (
        <div className="rounded-[16px] p-3 mb-3" style={{ backgroundColor: "var(--md-primary-008)", minHeight: "115px" }}>
          <p className="text-sm font-semibold leading-snug min-h-[1.25em]" style={{ color: "var(--md-text-primary)" }}>
            {(eq as EqBase).location}
          </p>
          <div className="mt-2 flex items-baseline gap-3 min-h-8">
            <span className="text-3xl font-bold font-heading leading-none" style={{ color: "var(--md-primary)" }}>
              M{(eq as EqBase).magnitude}
            </span>
            <span className="text-xs leading-none" style={{ color: "var(--md-text-muted)" }}>
              {tab === "jma"
                ? `${t("earthquake.shindo")} ${(eq as JmaItem).shindo} · ${t("earthquake.depth")} ${(eq as JmaItem).depth}`
                : `${t("earthquake.intensity")} ${(eq as CmaItem).intensity} · ${t("earthquake.depth")} ${(eq as CmaItem).depth}km`}
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug min-h-[1.25em]" style={{ color: "var(--md-text-secondary)" }}>
            {(eq as EqBase).time}
          </p>
          <p className="mt-1 text-[10px] leading-snug min-h-[1.25em]" style={{ color: "var(--md-text-muted)" }}>
            {(eq as EqBase).latitude}, {(eq as EqBase).longitude}
          </p>

        </div>
      )}
    </div>
  );
}
