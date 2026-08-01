"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WindowSize = { id: string; tokens: number; dip: number };

/**
 * `dip` is how far mid-prompt recall falls at the worst position. It widens with
 * the window because the same haystack tests degrade further as the haystack grows.
 */
const windows: WindowSize[] = [
  { id: "32k", tokens: 32_000, dip: 0.22 },
  { id: "128k", tokens: 128_000, dip: 0.36 },
  { id: "200k", tokens: 200_000, dip: 0.44 },
  { id: "1M", tokens: 1_000_000, dip: 0.62 },
];

const segments = [
  { id: "system", name: "system + tools", layer: "orchestration", ink: "var(--ramp-4)" },
  { id: "retrieved", name: "retrieved", layer: "retrieval", ink: "var(--ramp-2)" },
  { id: "history", name: "history", layer: "memory", ink: "var(--ramp-3)" },
  { id: "task", name: "task", layer: "orchestration", ink: "var(--ramp-1)" },
];

const MIN = 0.02;
const DEFAULT_CUTS = [0.1, 0.62, 0.94];

const recall = (p: number, dip: number) => 1 - dip * Math.sin(Math.PI * p) ** 1.4;

/** Mean recall across a span — the fraction of those tokens the model still reaches. */
function retained(a: number, b: number, dip: number) {
  const n = 96;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += recall(a + ((i + 0.5) / n) * (b - a), dip);
  return sum / n;
}

function si(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n < 1e7 ? 2 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n < 1e4 ? 1 : 0)}k`;
  return n.toFixed(0);
}

/** Plotted against a fixed 100%–30% axis so windows stay comparable to each other. */
const FLOOR = 0.7;

const curve = (dip: number) =>
  Array.from({ length: 65 }, (_, i) => {
    const p = i / 64;
    const y = ((1 - recall(p, dip)) / FLOOR) * 30;
    return `${i ? "L" : "M"}${(p * 100).toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");

export function ContextWindow() {
  const [win, setWin] = useState(windows[1]);
  const [cuts, setCuts] = useState(DEFAULT_CUTS);
  const [drag, setDrag] = useState<number | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  const move = useCallback((i: number, value: number) => {
    setCuts((prev) => {
      const lo = (prev[i - 1] ?? 0) + MIN;
      const hi = (prev[i + 1] ?? 1) - MIN;
      const next = [...prev];
      next[i] = Math.min(hi, Math.max(lo, value));
      return next;
    });
  }, []);

  useEffect(() => {
    if (drag === null) return;
    const onMove = (e: PointerEvent) => {
      const box = bar.current?.getBoundingClientRect();
      if (box) move(drag, (e.clientX - box.left) / box.width);
    };
    const stop = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [drag, move]);

  const edges = [0, ...cuts, 1];
  const rows = segments.map((s, i) => {
    const a = edges[i];
    const b = edges[i + 1];
    const share = b - a;
    const keep = retained(a, b, win.dip);
    return { ...s, a, b, share, keep, paid: win.tokens * share, read: win.tokens * share * keep };
  });

  const read = rows.reduce((sum, r) => sum + r.read, 0);
  const lost = 1 - read / win.tokens;

  return (
    <div className="rounded-lg border border-line bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="label">Window</h2>
        <div className="flex flex-wrap gap-1.5">
          {windows.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWin(w)}
              aria-pressed={w.id === win.id}
              className={`mono-data rounded-sm border px-2 py-1 text-tag transition-colors ${
                w.id === win.id
                  ? "border-line-bright bg-panel-2 text-ink"
                  : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim"
              }`}
            >
              {w.id}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mono-data flex items-baseline justify-between text-tag text-ink-faint">
          <span>recall by position — 100% to 30%</span>
          <span>worst {((1 - win.dip) * 100).toFixed(0)}%</span>
        </div>
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          aria-hidden
          className="mt-1.5 h-20 w-full"
        >
          <line
            x1={0}
            y1={0.5}
            x2={100}
            y2={0.5}
            stroke="var(--line-strong)"
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
          {cuts.map((c, i) => (
            <line
              key={segments[i].id}
              x1={c * 100}
              y1={0}
              x2={c * 100}
              y2={30}
              stroke="var(--line)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={curve(win.dip)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div ref={bar} className="relative mt-2 select-none">
        <div className="flex h-11 overflow-hidden rounded-sm">
          {rows.map((r) => (
            <div
              key={r.id}
              style={{ width: `${r.share * 100}%`, background: r.ink }}
              title={`${r.name} — ${si(r.paid)} tokens`}
            />
          ))}
        </div>

        {cuts.map((c, i) => (
          <button
            key={segments[i].id}
            type="button"
            role="slider"
            aria-label={`Boundary after ${segments[i].name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(c * 100)}
            aria-valuetext={`${Math.round(c * 100)} percent of the window`}
            onPointerDown={() => setDrag(i)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.05 : 0.01;
              if (e.key === "ArrowLeft") move(i, cuts[i] - step);
              else if (e.key === "ArrowRight") move(i, cuts[i] + step);
              else return;
              e.preventDefault();
            }}
            style={{ left: `${c * 100}%` }}
            className="absolute -top-1 h-[3.25rem] w-4 -translate-x-1/2 cursor-ew-resize touch-none before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-bg after:absolute after:left-1/2 after:top-1/2 after:size-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-accent focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent focus-visible:after:ring-offset-2"
          />
        ))}

        <div className="mt-1.5 flex h-4 overflow-hidden rounded-sm bg-panel-2">
          {rows.map((r) => (
            <div
              key={r.id}
              style={{ width: `${r.share * r.keep * 100}%`, background: r.ink }}
            />
          ))}
        </div>
        <p className="mono-data mt-1.5 text-tag text-ink-faint">
          paid above, reached below
        </p>
      </div>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="mono-data text-tag text-ink-faint">
            <th className="pb-2 font-normal">segment</th>
            <th className="pb-2 pl-3 text-right font-normal">paid</th>
            <th className="pb-2 pl-3 text-right font-normal">reached</th>
            <th className="hidden pb-2 pl-3 text-right font-normal sm:table-cell">
              retained
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line">
              <td className="py-2">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-[1px]"
                    style={{ background: r.ink }}
                  />
                  <span className="whitespace-nowrap text-meta text-ink">{r.name}</span>
                  <span className="mono-data hidden text-tag text-ink-faint sm:inline">
                    {r.layer}
                  </span>
                </span>
              </td>
              <td className="mono-data py-2 pl-3 text-right text-meta tabular-nums text-ink-dim">
                {si(r.paid)}
              </td>
              <td className="mono-data py-2 pl-3 text-right text-meta tabular-nums text-ink">
                {si(r.read)}
              </td>
              <td className="mono-data hidden py-2 pl-3 text-right text-meta tabular-nums text-ink-faint sm:table-cell">
                {(r.keep * 100).toFixed(0)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-panel-2 sm:grid-cols-3">
        <div className="p-3">
          <dt className="mono-data text-tag text-ink-faint">billed</dt>
          <dd className="mono-data mt-1 text-lead tabular-nums text-ink">
            {si(win.tokens)}
          </dd>
        </div>
        <div className="border-l border-line p-3">
          <dt className="mono-data text-tag text-ink-faint">reached</dt>
          <dd className="mono-data mt-1 text-lead tabular-nums text-ink">{si(read)}</dd>
        </div>
        <div className="col-span-2 border-t border-line p-3 sm:col-span-1 sm:border-l sm:border-t-0">
          <dt className="mono-data text-tag text-ink-faint">paid per token read</dt>
          <dd className="mono-data mt-1 text-lead tabular-nums text-accent">
            {(win.tokens / read).toFixed(2)}×
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-meta leading-relaxed text-ink-faint">
        {(lost * 100).toFixed(0)}% of this window is bought and not reached. Moving a
        segment towards either end is free; the middle is where tokens go to be
        ignored. The curve is a stylised reading of published needle-in-a-haystack
        results, not a measurement of any one model — treat the shape as the claim
        and the numbers as illustration.
      </p>
    </div>
  );
}
