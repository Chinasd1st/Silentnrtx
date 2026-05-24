"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaLightbulb } from "react-icons/fa";
import { CachedAt } from "@/components/ui/CachedAt";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/api/fetchWithTimeout";
import { fetchJsonp } from "@/lib/api/jsonp";
import { getCache, getCacheTime, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";
import {
  CACHE_KEY,
  CACHE_TTL,
  computeAiSum,
  type DayEntry,
  extractWakaData,
  type WakaResponse,
} from "./wakatime-shared";

export function WakaAICard() {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [_retryCount, setRetryCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void _retryCount;
  const skipCacheRef = useRef(false);
  const cfg = siteConfig.wakatime;

  const retry = useCallback(() => {
    skipCacheRef.current = true;
    setError(false);
    setLoading(true);
    setRetryCount((c) => c + 1);
  }, []);

  const _cacheTime = getCacheTime(CACHE_KEY);

  const fetchData = useCallback(() => {
    if (!cfg.enabled || !cfg.embedId) {
      setLoading(false);
      return;
    }
    const cached = skipCacheRef.current ? null : getCache<DayEntry[]>(CACHE_KEY, CACHE_TTL);
    skipCacheRef.current = false;
    if (cached) {
      setEntries(cached);
      setLoading(false);
      return;
    }
    const url = `https://wakatime.com/share/@${cfg.username}/${cfg.embedId}.json`;
    fetchWithRetry(() => api.get<WakaResponse>(url))
      .then(({ data }) => data)
      .catch(() =>
        fetchWithTimeout(url)
          .then((r) => r.json())
          .catch(() => fetchJsonp<WakaResponse>(url))
      )
      .then((raw) => {
        const data = extractWakaData(raw);
        if (Array.isArray(data) && data.length > 0) {
          setEntries(data);
          setCache(CACHE_KEY, data);
        } else throw new Error("invalid");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    const onClear = () => fetchData();
    window.addEventListener("cache-cleared", onClear);
    return () => window.removeEventListener("cache-cleared", onClear);
  }, [fetchData]);

  const aiSum = useMemo(() => computeAiSum(entries), [entries]);

  const fmtNum = (n: number) => n.toLocaleString(i18n.language);

  if (!cfg.enabled || !cfg.embedId) return null;
  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("wakatime.title")} onRetry={retry} />;

  return (
    <Card>
      <CardHeader icon={<FaLightbulb />} title="Vibe Coding" />
      <div className="space-y-2" aria-live="polite">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label={t("wakatime.ai_additions")} value={fmtNum(aiSum.add)} />
          <StatBox label={t("wakatime.ai_deletions")} value={fmtNum(aiSum.del)} />
          <StatBox label={t("wakatime.prompts")} value={fmtNum(aiSum.prompts)} />
          <StatBox label={t("wakatime.output_tokens")} value={fmtNum(aiSum.outTokens)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatBox label={t("wakatime.input_tokens")} value={fmtNum(aiSum.inTokens)} />
          <StatBox
            label={t("wakatime.output_ratio")}
            value={
              aiSum.inTokens > 0
                ? `${((aiSum.outTokens / aiSum.inTokens) * 100).toFixed(1)}%`
                : "\u2014"
            }
          />
        </div>
        <CostBox
          label={t("wakatime.agent_cost")}
          value={`$${aiSum.cost > 0 ? aiSum.cost.toFixed(2) : "0.00"}`}
        />
      </div>
      <CachedAt cacheKey={CACHE_KEY} />
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[16px] p-4 text-center transition-all duration-200 hover:bg-white/6 hover:scale-[1.02]"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <p className="text-lg font-bold font-heading" style={{ color: "var(--md-primary)" }}>
        {value}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function CostBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[16px] p-4 text-center transition-all duration-200 hover:bg-white/6 hover:scale-[1.02]"
      style={{ backgroundColor: "var(--md-primary-008)" }}
    >
      <p className="text-xl font-bold font-heading" style={{ color: "var(--md-primary)" }}>
        {value}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--md-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
