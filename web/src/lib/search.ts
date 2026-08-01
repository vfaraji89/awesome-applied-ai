import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { domains } from "@/data/domains";
import { problems } from "@/data/problems";
import { kit, shelves } from "@/data/kit";
import { fields, terms } from "@/data/dictionary";
import { commands, toolboxes } from "@/data/commands";
import { builds, stages } from "@/data/cycle";
import { shipped } from "@/data/shipped";
import type { LayerId } from "@/lib/types";

export type HitKind =
  | "stage"
  | "domain"
  | "layer"
  | "problem"
  | "category"
  | "kit"
  | "term"
  | "command"
  | "build"
  | "shipped"
  | "tool"
  | "topic";

export interface Hit {
  id: string;
  kind: HitKind;
  label: string;
  detail: string;
  href: string;
  external?: boolean;
  count?: number;
  haystack: string;
}

export const tagCounts: { tag: string; count: number; layers: LayerId[] }[] =
  Object.values(
    tools.reduce<Record<string, { tag: string; count: number; layers: LayerId[] }>>(
      (acc, tool) => {
        for (const tag of tool.tags) {
          const entry = (acc[tag] ??= { tag, count: 0, layers: [] });
          entry.count += 1;
          if (!entry.layers.includes(tool.layer)) entry.layers.push(tool.layer);
        }
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

export const searchIndex: Hit[] = [
  ...stages.map((s) => ({
    id: `stage:${s.id}`,
    kind: "stage" as const,
    label: `${s.n} ${s.name}`,
    detail: s.question,
    href: `/cycle/#${s.id}`,
    haystack: `${s.name} ${s.question} ${s.decides} ${s.trap}`.toLowerCase(),
  })),
  ...domains.map((d) => ({
    id: `domain:${d.id}`,
    kind: "domain" as const,
    label: d.name,
    detail: `Domain ${d.numeral} · ${d.status}`,
    href: d.href ?? "/",
    haystack: `${d.name} ${d.scope.join(" ")} ${d.question}`.toLowerCase(),
  })),
  ...layers.map((l) => ({
    id: `layer:${l.id}`,
    kind: "layer" as const,
    label: l.name,
    detail: l.tagline,
    href: `/layers/${l.id}/`,
    count: tools.filter((t) => t.layer === l.id).length,
    haystack: `${l.name} ${l.tagline} ${l.question}`.toLowerCase(),
  })),
  ...problems.map((p) => ({
    id: `problem:${p.id}`,
    kind: "problem" as const,
    label: p.title,
    detail: p.asked,
    href: `/problems/${p.id}/`,
    haystack: `${p.title} ${p.asked}`.toLowerCase(),
  })),
  ...layers.flatMap((l) =>
    l.categories.map((c) => ({
      id: `category:${c.id}`,
      kind: "category" as const,
      label: c.name,
      detail: `${l.name} · ${c.blurb}`,
      href: `/layers/${l.id}/#${c.id}`,
      count: tools.filter((t) => t.category === c.id).length,
      haystack: `${c.name} ${c.blurb} ${l.name}`.toLowerCase(),
    })),
  ),
  ...kit.map((k) => ({
    id: `kit:${k.id}`,
    kind: "kit" as const,
    label: k.name,
    detail: k.summary,
    href: `/kit/#${k.id}`,
    haystack:
      `${k.name} ${k.summary} ${k.reach} ${k.install ?? ""} ${k.tags.join(" ")} ${
        shelves.find((s) => s.id === k.shelf)?.name ?? ""
      }`.toLowerCase(),
  })),
  ...terms.map((t) => ({
    id: `term:${t.id}`,
    kind: "term" as const,
    label: t.term,
    detail: t.short,
    href: `/dictionary/#${t.id}`,
    haystack:
      `${t.term} ${(t.also ?? []).join(" ")} ${t.short} ${t.detail} ${t.asked ?? ""} ${t.tags.join(" ")} ${
        fields.find((f) => f.id === t.field)?.name ?? ""
      }`.toLowerCase(),
  })),
  ...commands.map((c) => ({
    id: `command:${c.id}`,
    kind: "command" as const,
    label: c.cmd,
    detail: c.what,
    href: `/commands/#${c.id}`,
    haystack: `${c.cmd} ${c.what} ${c.when} ${c.tags.join(" ")} ${
      toolboxes.find((b) => b.id === c.box)?.name ?? ""
    }`.toLowerCase(),
  })),
  ...builds.map((b) => ({
    id: `build:${b.id}`,
    kind: "build" as const,
    label: b.name,
    detail: b.builds,
    href: "/cycle/#build",
    haystack: `${b.name} ${b.builds} ${b.teaches} ${b.measure}`.toLowerCase(),
  })),
  ...shipped.map((s) => ({
    id: `shipped:${s.id}`,
    kind: "shipped" as const,
    label: s.name,
    detail: `${s.sector} · ${s.year}`,
    href: `/shipped/#${s.id}`,
    haystack:
      `${s.name} ${s.sector} ${s.problem} ${s.approach} ${s.stack.join(" ")}`.toLowerCase(),
  })),
  ...tagCounts.map((t) => ({
    id: `topic:${t.tag}`,
    kind: "topic" as const,
    label: t.tag,
    detail: `${t.count} ${t.count === 1 ? "entry" : "entries"}`,
    href: `/tools/?topic=${encodeURIComponent(t.tag)}`,
    count: t.count,
    haystack: t.tag.toLowerCase(),
  })),
  ...tools.map((t) => ({
    id: `tool:${t.id}`,
    kind: "tool" as const,
    label: t.name,
    detail: t.summary,
    href: t.url,
    external: true,
    haystack: `${t.name} ${t.summary} ${t.license} ${t.tags.join(" ")}`.toLowerCase(),
  })),
];

const order: Record<HitKind, number> = {
  stage: 0,
  domain: 1,
  layer: 2,
  problem: 3,
  term: 4,
  command: 5,
  kit: 6,
  build: 7,
  shipped: 8,
  category: 9,
  topic: 10,
  tool: 11,
};

export const kindLabel: Record<HitKind, string> = {
  stage: "Stage",
  domain: "Domain",
  layer: "Layer",
  problem: "Problem",
  term: "Term",
  command: "Command",
  kit: "Kit",
  build: "Build",
  shipped: "Shipped",
  category: "Category",
  topic: "Topic",
  tool: "Entry",
};

export function search(query: string, limit = 24): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return searchIndex.filter(
      (h) => h.kind === "stage" || h.kind === "layer" || h.kind === "domain",
    );
  }

  return searchIndex
    .map((hit) => {
      const label = hit.label.toLowerCase();
      if (label === q) return { hit, score: 0 };
      if (label.startsWith(q)) return { hit, score: 1 };
      if (label.includes(q)) return { hit, score: 2 };
      if (hit.haystack.includes(q)) return { hit, score: 3 };
      return null;
    })
    .filter((r): r is { hit: Hit; score: number } => r !== null)
    .sort(
      (a, b) =>
        a.score - b.score ||
        order[a.hit.kind] - order[b.hit.kind] ||
        (b.hit.count ?? 0) - (a.hit.count ?? 0),
    )
    .slice(0, limit)
    .map((r) => r.hit);
}
