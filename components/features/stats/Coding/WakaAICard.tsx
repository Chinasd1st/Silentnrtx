"use client";

import { useEffect, useMemo, useState } from "react";
import { FaLightbulb } from "react-icons/fa";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/api/fetchWithTimeout";
import { fetchJsonp } from "@/lib/api/jsonp";
import { getCache, setCache } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";

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
    ai_agent_costs?: Record<string, number>;
    human_additions?: number;
    human_deletions?: number;
  };
  range: { date: string; text: string };
}

type WakaResponse = DayEntry[] | { data: DayEntry[] };

const CACHE_KEY = "wakatime";
const CACHE_TTL = 30 * 60 * 1000;

export function WakaAICard() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cfg = siteConfig.wakatime;

  const cacheTime = useMemo(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return (JSON.parse(raw) as { ts: number }).ts;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!cfg.enabled || !cfg.embedId) {
      setLoading(false);
      return;
    }
    const cached = getCache<DayEntry[]>(CACHE_KEY, CACHE_TTL);
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
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        if (Array.isArray(data) && data.length > 0) {
          setEntries(data);
          setCache(CACHE_KEY, data);
        } else throw new Error("invalid");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!cfg.enabled || !cfg.embedId) return null;
  if (loading) return <CardSkeleton />;
  if (error)
    return <ErrorCard title={t("wakatime.title")} onRetry={() => window.location.reload()} />;

  const aiSum = entries.reduce(
    (s, e) => {
      const gt = e.grand_total;
      const agentCosts = gt?.ai_agent_costs;
      const dayCost = agentCosts ? Object.values(agentCosts).reduce((sum, v) => sum + v, 0) : 0;
      const agents = agentCosts ? Object.keys(agentCosts) : [];
      for (const name of agents) {
        s.agents[name] = (s.agents[name] || 0) + (agentCosts?.[name] || 0);
      }
      return {
        add: s.add + (gt?.ai_additions || 0),
        del: s.del + (gt?.ai_deletions || 0),
        prompts: s.prompts + (gt?.ai_prompt_events || 0),
        inTokens: s.inTokens + (gt?.ai_input_tokens || 0),
        outTokens: s.outTokens + (gt?.ai_output_tokens || 0),
        cost: s.cost + dayCost,
        humanAdd: s.humanAdd + (gt?.human_additions || 0),
        humanDel: s.humanDel + (gt?.human_deletions || 0),
        agents: s.agents,
      };
    },
    {
      add: 0,
      del: 0,
      prompts: 0,
      inTokens: 0,
      outTokens: 0,
      cost: 0,
      humanAdd: 0,
      humanDel: 0,
      agents: {} as Record<string, number>,
    }
  );

  const fmtNum = (n: number) => n.toLocaleString();

  return (
    <Card>
      <CardHeader icon={<FaLightbulb />} title="Vibe Coding" />
      <div className="space-y-2">
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
      {cacheTime && (
        <p className="text-[9px] text-right mt-0.5" style={{ color: "var(--md-text-secondary)" }}>
          {t("wakatime.cached_at")}{" "}
          {new Date(cacheTime).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
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
