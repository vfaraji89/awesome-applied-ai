"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { ToolRow } from "@/components/tool-row";
import {
  layerInk,
  maturityLabel,
  modelLabel,
  sortLabel,
  sortTools,
  statusLabel,
  type SortKey,
} from "@/lib/style";
import type { Deployment, LayerId, Maturity, SourceModel, Status, Tool } from "@/lib/types";

type Facets = {
  layer: LayerId[];
  model: SourceModel[];
  status: Status[];
  deployment: Deployment[];
  maturity: Maturity[];
  topic: string[];
};

const empty: Facets = {
  layer: [],
  model: [],
  status: [],
  deployment: [],
  maturity: [],
  topic: [],
};

const modelOptions: SourceModel[] = ["oss", "hybrid", "source-available", "commercial"];
const statusOptions: Status[] = ["active", "slowing", "stalled", "deprecated"];
const deploymentOptions: Deployment[] = ["self-host", "saas", "both"];
const maturityOptions: Maturity[] = [
  "production-common",
  "production-viable",
  "early",
  "research",
  "fragile",
];

const facetLabel: Record<keyof Facets, string> = {
  layer: "Layer",
  model: "License",
  maturity: "Maturity",
  deployment: "Deployment",
  status: "Upkeep",
  topic: "Topic",
};

function chipText(key: keyof Facets, value: string) {
  if (key === "layer") return layers.find((l) => l.id === value)?.name ?? value;
  if (key === "model") return modelLabel[value as SourceModel];
  if (key === "maturity") return maturityLabel[value as Maturity];
  if (key === "status") return statusLabel[value as Status];
  return value;
}

function Chip({
  active,
  onClick,
  children,
  dot,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mono-data flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-tag transition-colors ${
        active
          ? "border-line-bright bg-panel-2 text-ink"
          : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim"
      }`}
    >
      {dot && (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ background: dot }}
        />
      )}
      {children}
      {count !== undefined && (
        <span className="tabular-nums text-ink-faint">{count}</span>
      )}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 label">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function ToolBrowser() {
  const [query, setQuery] = useState("");
  const [facets, setFacets] = useState<Facets>(empty);
  const [sort, setSort] = useState<SortKey>("maturity");
  const [topicQuery, setTopicQuery] = useState("");
  const [allTopics, setAllTopics] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) setFacets((f) => ({ ...f, topic: [topic] }));
  }, []);

  function toggle<K extends keyof Facets>(key: K, value: Facets[K][number]) {
    setFacets((f) => {
      const list = f[key] as Facets[K][number][];
      return {
        ...f,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  }

  const { results, topicCounts } = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = (t: Tool) => {
      if (facets.layer.length && !facets.layer.includes(t.layer)) return false;
      if (facets.model.length && !facets.model.includes(t.model)) return false;
      if (facets.status.length && !facets.status.includes(t.status ?? "active"))
        return false;
      if (
        facets.deployment.length &&
        (!t.deployment || !facets.deployment.includes(t.deployment))
      )
        return false;
      if (facets.maturity.length && (!t.maturity || !facets.maturity.includes(t.maturity)))
        return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.license.toLowerCase().includes(q) ||
        (t.note?.toLowerCase().includes(q) ?? false) ||
        t.tags.some((tag) => tag.includes(q))
      );
    };

    const pool = tools.filter(base);
    const counts = new Map<string, number>();
    for (const t of pool) {
      for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }

    const matched = facets.topic.length
      ? pool.filter((t) => facets.topic.every((tag) => t.tags.includes(tag)))
      : pool;

    return {
      results: sortTools(matched, sort),
      topicCounts: [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    };
  }, [query, facets, sort]);

  const active = (Object.keys(facets) as (keyof Facets)[]).flatMap((key) =>
    (facets[key] as string[]).map((value) => ({ key, value })),
  );
  const filtered = query.trim().length > 0 || active.length > 0;

  const tq = topicQuery.trim().toLowerCase();
  const visibleTopics = topicCounts
    .filter((t) => (tq ? t.tag.includes(tq) : true))
    .slice(0, tq || allTopics ? 60 : 14);

  const signature = active.map((a) => `${a.key}:${a.value}`).join("|");

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <button
        type="button"
        onClick={() => setDrawer((v) => !v)}
        aria-expanded={drawer}
        className="mono-data flex items-center justify-between rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ui text-ink-dim transition-colors hover:border-line-bright hover:text-ink lg:hidden"
      >
        <span>Filters</span>
        <span className="tabular-nums text-accent">
          {active.length > 0 ? active.length : ""}
        </span>
      </button>

      <aside
        className={`${drawer ? "flex" : "hidden"} flex-col gap-6 lg:flex lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-2`}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools"
          className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ui text-ink outline-none placeholder:text-ink-faint focus:border-line-bright"
        />

        <Group label="Layer">
          {layers.map((l) => (
            <Chip
              key={l.id}
              dot={layerInk[l.id]}
              active={facets.layer.includes(l.id)}
              onClick={() => toggle("layer", l.id)}
            >
              {l.name.split(" ")[0].replace("&", "")}
            </Chip>
          ))}
        </Group>

        <div>
          <div className="mb-2.5 flex items-baseline justify-between gap-2">
            <span className="label">Topics</span>
            <span className="label">{topicCounts.length}</span>
          </div>
          <input
            value={topicQuery}
            onChange={(e) => setTopicQuery(e.target.value)}
            placeholder="Filter topics"
            className="mono-data mb-2.5 w-full rounded-sm border border-line bg-panel px-2.5 py-1.5 text-tag text-ink outline-none placeholder:text-ink-faint focus:border-line-bright"
          />
          <div className="flex flex-wrap gap-1.5">
            {visibleTopics.map((t) => (
              <Chip
                key={t.tag}
                count={t.count}
                active={facets.topic.includes(t.tag)}
                onClick={() => toggle("topic", t.tag)}
              >
                {t.tag}
              </Chip>
            ))}
            {visibleTopics.length === 0 && (
              <span className="mono-data text-tag text-ink-faint">No match</span>
            )}
          </div>
          {!tq && topicCounts.length > 14 && (
            <button
              type="button"
              onClick={() => setAllTopics((v) => !v)}
              className="label mt-2.5 hover:text-ink"
            >
              {allTopics ? "Show fewer" : `All ${topicCounts.length}`}
            </button>
          )}
        </div>

        <Group label="License">
          {modelOptions.map((m) => (
            <Chip
              key={m}
              active={facets.model.includes(m)}
              onClick={() => toggle("model", m)}
            >
              {modelLabel[m]}
            </Chip>
          ))}
        </Group>

        <Group label="Maturity">
          {maturityOptions.map((m) => (
            <Chip
              key={m}
              active={facets.maturity.includes(m)}
              onClick={() => toggle("maturity", m)}
            >
              {maturityLabel[m]}
            </Chip>
          ))}
        </Group>

        <Group label="Deployment">
          {deploymentOptions.map((d) => (
            <Chip
              key={d}
              active={facets.deployment.includes(d)}
              onClick={() => toggle("deployment", d)}
            >
              {d}
            </Chip>
          ))}
        </Group>

        <Group label="Project status">
          {statusOptions.map((s) => (
            <Chip
              key={s}
              active={facets.status.includes(s)}
              onClick={() => toggle("status", s)}
            >
              {statusLabel[s]}
            </Chip>
          ))}
        </Group>
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mono-data text-meta tabular-nums text-ink">
            {results.length}
            <span className="text-ink-faint"> / {tools.length}</span>
          </span>
          {active.map((a) => (
            <button
              key={`${a.key}:${a.value}`}
              type="button"
              onClick={() => toggle(a.key, a.value as never)}
              className="mono-data flex items-center gap-1.5 rounded-sm border border-accent bg-accent-bg py-1 pl-2 pr-1.5 text-tag text-accent"
            >
              <span className="opacity-70">{facetLabel[a.key].toLowerCase()}</span>
              {chipText(a.key, a.value)}
              <span aria-hidden className="opacity-70">
                ×
              </span>
            </button>
          ))}
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFacets(empty);
              }}
              className="label hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-line pb-2.5 pl-5 pr-2 md:grid-cols-[2.5rem_minmax(0,1fr)_11rem] md:gap-x-8">
          <span className="label">№</span>
          <SortHead k="name" sort={sort} setSort={setSort} />
          <div className="hidden justify-end gap-4 md:flex">
            <SortHead k="status" sort={sort} setSort={setSort} />
            <SortHead k="maturity" sort={sort} setSort={setSort} />
          </div>
        </div>

        {results.length === 0 ? (
          <p className="mt-4 rounded-lg border border-line bg-panel p-6 text-ui text-ink-dim">
            Nothing matches those filters.
          </p>
        ) : (
          <motion.div
            key={`${signature}-${sort}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col border-b border-line"
          >
            {results.map((tool, i) => (
              <ToolRow
                key={tool.id}
                tool={tool}
                n={i + 1}
                showLayer
                activeTags={facets.topic}
                onTag={(tag) => toggle("topic", tag)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SortHead({
  k,
  sort,
  setSort,
}: {
  k: SortKey;
  sort: SortKey;
  setSort: (k: SortKey) => void;
}) {
  const on = sort === k;
  return (
    <button
      type="button"
      onClick={() => setSort(k)}
      className={`label flex items-center gap-1 transition-colors hover:text-ink ${
        on ? "!text-ink" : ""
      }`}
    >
      {k === "name" ? "Entry" : sortLabel[k]}
      <span aria-hidden className={on ? "opacity-100" : "opacity-0"}>
        ↓
      </span>
    </button>
  );
}
