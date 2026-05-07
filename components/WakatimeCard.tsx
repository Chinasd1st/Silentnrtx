"use client";

import { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { fetchJsonp } from "@/lib/jsonp";
import { getCache, setCache } from "@/lib/cache";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { SiWakatime } from "react-icons/si";
import { FaRobot } from "react-icons/fa";

interface DayEntry {
  grand_total: {
    text: string;
    total_seconds: number;
    hours: number;
    minutes: number;
    decimal: string;
    ai_additions?: number;
    ai_deletions?: number;
    ai_prompt_events?: number;
    ai_input_tokens?: number;
    ai_output_tokens?: number;
    human_additions?: number;
    human_deletions?: number;
  };
  range: { date: string; text: string };
}

type Tab = "activity" | "ai";

type WakaResponse = DayEntry[] | { data: DayEntry[] };

const CACHE_KEY = "wakatime";
const CACHE_TTL = 30 * 60 * 1000;

export function WakatimeCard() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("activity");
  const cfg = siteConfig.wakatime;

  const fetchStats = useCallback(async () => {
    if (!cfg.enabled || !cfg.embedId) { setLoading(false); return; }
    const cached = getCache<DayEntry[]>(CACHE_KEY, CACHE_TTL);
    if (cached) { setEntries(cached); setLoading(false); return; }
    try {
      const url = `https://wakatime.com/share/@${cfg.username}/${cfg.embedId}.json`;
      const raw = await fetchWithTimeout(url).then((r) => r.json()).catch(() => fetchJsonp<WakaResponse>(url));
      const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      if (Array.isArray(data) && data.length > 0) { setEntries(data); setCache(CACHE_KEY, data); }
      else throw new Error("invalid");
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [cfg.enabled, cfg.embedId, cfg.username]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!cfg.enabled || !cfg.embedId) return null;
  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("wakatime.title")} onRetry={fetchStats} />;

  const totalSec = entries.reduce((s, e) => s + (e.grand_total?.total_seconds || 0), 0);
  const totalH = Math.floor(totalSec / 3600);
  const totalM = Math.floor((totalSec % 3600) / 60);

  const aiSum = entries.reduce(
    (s, e) => ({
      add: s.add + (e.grand_total?.ai_additions || 0),
      del: s.del + (e.grand_total?.ai_deletions || 0),
      prompts: s.prompts + (e.grand_total?.ai_prompt_events || 0),
      inTokens: s.inTokens + (e.grand_total?.ai_input_tokens || 0),
      outTokens: s.outTokens + (e.grand_total?.ai_output_tokens || 0),
    }),
    { add: 0, del: 0, prompts: 0, inTokens: 0, outTokens: 0 }
  );

  const fmtNum = (n: number) => n.toLocaleString();

  return (
    <div className="md-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <SiWakatime className="text-lg shrink-0" style={{ color: "var(--md-primary)" }} />
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>{t("wakatime.title")}</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>{totalH}h {totalM}m</span>
          <a href={`https://wakatime.com/@${cfg.username}`} target="_blank" rel="noopener noreferrer"
            className="text-xs transition-colors" style={{ color: "var(--md-text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--md-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--md-text-muted)"}>
            @{cfg.username} &rarr;
          </a>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        <button onClick={() => setTab("activity")} aria-label={t("wakatime.activity")}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
          style={{ backgroundColor: tab === "activity" ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: tab === "activity" ? "var(--md-primary)" : "var(--md-text-muted)" }}>
          {t("wakatime.activity")}
        </button>
        <button onClick={() => setTab("ai")} aria-label="AI"
          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
          style={{ backgroundColor: tab === "ai" ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: tab === "ai" ? "var(--md-primary)" : "var(--md-text-muted)" }}>
          <FaRobot className="inline mr-1" size={10} />AI
        </button>
      </div>

      {tab === "activity" && (
        <div className="space-y-1">
          {entries.map((day, i) => {
            const g = day.grand_total;
            if (!g) return null;
            const pct = totalSec > 0 ? (g.total_seconds / totalSec) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate" style={{ color: "var(--md-text-muted)" }}>{day.range?.date || ""}</span>
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: "var(--md-primary)" }} />
                </div>
                <span className="w-16 text-right shrink-0" style={{ color: "var(--md-text-secondary)" }}>{g.text?.replace("hrs", "h").replace("hr", "h").replace("mins", "m") || ""}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "ai" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <AiBox label={t("wakatime.ai_additions")} value={fmtNum(aiSum.add)} color="var(--md-accent-green)" />
            <AiBox label={t("wakatime.ai_deletions")} value={fmtNum(aiSum.del)} color="var(--md-accent-yellow)" />
            <AiBox label={t("wakatime.prompts")} value={fmtNum(aiSum.prompts)} color="var(--md-accent-blue)" />
            <AiBox label={t("wakatime.output_tokens")} value={fmtNum(aiSum.outTokens)} color="var(--md-accent-pink)" />
          </div>
          <div className="rounded-[12px] p-3 text-xs" style={{ backgroundColor: "var(--md-primary-008)" }}>
            <div className="flex justify-between mb-1">
              <span style={{ color: "var(--md-text-muted)" }}>{t("wakatime.input_tokens")}</span>
              <span style={{ color: "var(--md-text-secondary)" }}>{fmtNum(aiSum.inTokens)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--md-text-muted)" }}>{t("wakatime.output_ratio")}</span>
              <span style={{ color: "var(--md-text-secondary)" }}>{aiSum.inTokens > 0 ? `${(aiSum.outTokens / aiSum.inTokens * 100).toFixed(1)}%` : "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AiBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[12px] p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
      <p className="text-lg font-bold font-heading" style={{ color }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--md-text-muted)" }}>{label}</p>
    </div>
  );
}
