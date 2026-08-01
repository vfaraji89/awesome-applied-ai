"use client";

import { useState } from "react";
import { motion } from "motion/react";

type Preset = { id: string; name: string; write: number; read: number; note: string };

const presets: Preset[] = [
  { id: "anthropic-5m", name: "Anthropic 5-min", write: 1.25, read: 0.1, note: "Refreshed on every read." },
  { id: "anthropic-1h", name: "Anthropic 1-hour", write: 2.0, read: 0.1, note: "Pays off from the second read." },
  { id: "openai", name: "OpenAI automatic", write: 1.0, read: 0.25, note: "No write premium, 1024-token minimum." },
  { id: "gemini", name: "Gemini explicit", write: 1.0, read: 0.25, note: "Adds storage cost per token-hour, not modelled here." },
];

function fmt(n: number, digits = 2) {
  return n.toFixed(digits);
}

export function CacheEconomics() {
  const [preset, setPreset] = useState(presets[0]);
  const [hit, setHit] = useState(0.9);

  const { write: w, read: r } = preset;
  const breakEven = (w - 1) / (1 - r);
  const effective = (1 - hit) * w + hit * r;
  const saving = 1 - effective;

  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="label">
          Cache economics
        </h2>
        <span className="mono-data text-tag text-ink-faint">live</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p)}
            className={`mono-data rounded-sm border px-2 py-1 text-tag transition-colors ${
              p.id === preset.id
                ? "border-line-bright bg-panel-2 text-ink"
                : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-meta text-ink-faint">{preset.note}</p>

      <div className="mt-5">
        <div className="mono-data flex items-baseline justify-between text-tag text-ink-faint">
          <label htmlFor="hitrate">cache hit rate</label>
          <span className="text-ink">{(hit * 100).toFixed(0)}%</span>
        </div>
        <input
          id="hitrate"
          type="range"
          min={0}
          max={100}
          value={hit * 100}
          onChange={(e) => setHit(Number(e.target.value) / 100)}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-panel-2">
        <div className="p-3">
          <dt className="mono-data text-tag text-ink-faint">break-even reads</dt>
          <dd className="mono-data mt-1 text-lead text-ink">{fmt(breakEven)}</dd>
        </div>
        <div className="border-l border-line p-3">
          <dt className="mono-data text-tag text-ink-faint">effective input cost</dt>
          <dd className="mono-data mt-1 text-lead text-ink">{fmt(effective, 3)}×</dd>
        </div>
      </dl>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full"
          style={{ background: "var(--accent)" }}
          animate={{ width: `${Math.max(0, saving) * 100}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        />
      </div>
      <p className="mono-data mt-2 text-tag text-ink-faint">
        {saving >= 0
          ? `${(saving * 100).toFixed(1)}% off input spend`
          : `${(-saving * 100).toFixed(1)}% more than no cache`}
      </p>
    </div>
  );
}
