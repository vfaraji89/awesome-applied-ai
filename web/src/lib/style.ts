import type { GlyphName } from "@/lib/glyphs";
import type { LayerId, Maturity, SourceModel, Status, Tool } from "@/lib/types";

export const layerGlyph: Record<LayerId, GlyphName> = {
  retrieval: "hybrid-search",
  memory: "memory-systems",
  caching: "provider-caching",
  orchestration: "frameworks",
  evaluation: "eval-frameworks",
  governance: "guardrails",
};

const maturityRank: Record<Maturity, number> = {
  "production-common": 0,
  "production-viable": 1,
  early: 2,
  research: 3,
  fragile: 4,
};

const statusRank: Record<Status, number> = {
  active: 0,
  slowing: 1,
  stalled: 2,
  deprecated: 3,
};

export type SortKey = "maturity" | "name" | "status";

export const sortLabel: Record<SortKey, string> = {
  maturity: "Maturity",
  name: "A–Z",
  status: "Upkeep",
};

const comparators: Record<SortKey, (a: Tool, b: Tool) => number> = {
  maturity: (a, b) =>
    (a.maturity ? maturityRank[a.maturity] : 9) -
      (b.maturity ? maturityRank[b.maturity] : 9) ||
    a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
  status: (a, b) =>
    (a.status ? statusRank[a.status] : 0) - (b.status ? statusRank[b.status] : 0) ||
    a.name.localeCompare(b.name),
};

export function sortTools(list: Tool[], key: SortKey): Tool[] {
  return [...list].sort(comparators[key]);
}

export const ramp = [
  "var(--ramp-1)",
  "var(--ramp-2)",
  "var(--ramp-3)",
  "var(--ramp-4)",
  "var(--ramp-5)",
  "var(--ramp-6)",
];

export const layerInk: Record<LayerId, string> = {
  retrieval: "var(--ramp-1)",
  memory: "var(--ramp-2)",
  caching: "var(--ramp-3)",
  orchestration: "var(--ramp-4)",
  evaluation: "var(--ramp-5)",
  governance: "var(--ramp-6)",
};

export const maturityLabel: Record<Maturity, string> = {
  "production-common": "widely deployed",
  "production-viable": "production viable",
  early: "early",
  research: "research",
  fragile: "fragile",
};

export const modelLabel: Record<SourceModel, string> = {
  oss: "open source",
  "source-available": "source available",
  commercial: "commercial",
  hybrid: "open core",
};

export const statusLabel: Record<Status, string> = {
  active: "active",
  slowing: "slowing",
  stalled: "stalled",
  deprecated: "deprecated",
};

export const statusTone: Record<Status, string> = {
  active: "text-ink-faint",
  slowing: "text-ink-dim",
  stalled: "text-accent",
  deprecated: "text-accent",
};
