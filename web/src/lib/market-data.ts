/* The market summary (pipeline/run.ts > web/src/data/market.json) with its shape spelled out, so
   every page that shows it (home, market, skills) reads the same fields the same way. */
import market from "@/data/market.json";
import type { Insights, TechStack, AffectedByAI } from "@/components/market-insights";

export type Row = { id?: string; name?: string; title?: string; month?: string; n: number; share?: number; inStack?: boolean; preferred?: number };
export type Market = {
  generatedAt: string | null; since?: string; sinceQuarter?: string;
  totals: { processed: number; listedNow: number; newToday: number; remoteShare: number };
  sources: { id: string; boards: number; ai: number }[];
  roles: Row[]; seniority: Row[]; titles: Row[]; skills: Row[]; tasks: Row[]; tools: Row[]; byMonth: Row[];
  years?: { asked: number; median: number; bands: Row[] }; insights?: Insights;
  byWeek?: { week: string; n: number; partial?: boolean }[];
  tech?: Parameters<typeof TechStack>[0]["tech"] | null; affected?: Parameters<typeof AffectedByAI>[0]["a"] | null;
};
export const M = market as unknown as Market;
export const sitesRead = M.sources.reduce((a, s) => a + s.boards, 0);
