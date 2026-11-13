import type { Tool } from "@/lib/types";
import stats from "@/data/github-stats.json";

/* Signals the tool map shows next to each tool, all computed from numbers GitHub returned
   (pipeline/github-stats.ts, weekly) or dates in the content sheet; nothing is typed by hand.
   - popular:  20,000 stars or more
   - trending: gained at least max(250, 1.5% of its stars) since last week's run, or, before
               there is a week to compare, a repo under six months old averaging 20 stars a day
   - emerging: launched in the last six months, by the sheet's `launched` month (checked against a
               source). Counted from the weekly stats date, so a tool ages out on its own. A repo's
               creation date is not used: repos get moved and recreated long after launch. */
type Stat = { stars: number; prev?: number; created: string; pushed: string; archived?: boolean };
const S = stats as { updated: string; repos: Record<string, Stat> };
export const statsDate = S.updated;
const ref = new Date((S.updated || "2026-11-12") + "T00:00:00Z").getTime();

export const repoOf = (t: Tool) =>
  (t.github || t.url.match(/github\.com\/(?!(?:features|marketplace|orgs|topics|sponsors|apps|enterprise|solutions|about|pricing|security|collections|trending)\/)([^/]+\/[^/#?]+)/i)?.[1] || "").replace(/\.git$/, "").toLowerCase();

export interface Signals { repo: string; stars?: number; gain?: number; launched?: string; quarter?: string; popular: boolean; trending: boolean; isNew: boolean }

const quarterOf = (ym: string) => `Q${Math.floor((Number(ym.slice(5, 7)) - 1) / 3) + 1} ${ym.slice(0, 4)}`;

export function signals(t: Tool): Signals {
  const repo = repoOf(t), s = repo ? S.repos[repo] : undefined;
  const launched = t.launched;
  const ageDays = launched ? (ref - new Date(launched + "-15T00:00:00Z").getTime()) / 864e5 : Infinity;
  const gain = s && s.prev !== undefined ? s.stars - s.prev : undefined;
  const createdDays = s ? (ref - new Date(s.created + "T00:00:00Z").getTime()) / 864e5 : Infinity;
  const trending = !!s && !s.archived && (gain !== undefined ? gain >= Math.max(250, s.stars * 0.015) : createdDays < 182 && s.stars / Math.max(1, createdDays) >= 20);
  const isNew = ageDays >= -31 && ageDays <= 183;
  return { repo, stars: s?.stars, gain, launched, quarter: launched ? quarterOf(launched) : undefined, popular: (s?.stars ?? 0) >= 20000, trending, isNew };
}

export const fmtStars = (n: number) => (n >= 1e5 ? `${Math.round(n / 1e3)}k` : n >= 1e3 ? `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k` : String(n));
