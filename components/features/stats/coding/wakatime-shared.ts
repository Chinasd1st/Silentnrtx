export interface DayEntry {
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

export type WakaResponse = DayEntry[] | { data: DayEntry[] };

export interface AiSum {
  add: number;
  del: number;
  prompts: number;
  inTokens: number;
  outTokens: number;
  cost: number;
  humanAdd: number;
  humanDel: number;
  agents: Record<string, number>;
}

export function computeAiSum(entries: DayEntry[]): AiSum {
  return entries.reduce(
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
}

export function extractWakaData(raw: WakaResponse): DayEntry[] {
  return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
}

export const CACHE_KEY = "wakatime";
export const CACHE_TTL = 30 * 60 * 1000;
