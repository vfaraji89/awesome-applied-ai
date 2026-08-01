"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { clamp, geometry, nomograms } from "@/lib/nomograms";

const H = 380;
const TOP = 30;
const BOTTOM = 28;
const GUTTER = 54;
const MIN_W = 140;

type Axis = "u" | "v";

/** `formulas` arrives typeset on the server so katex stays out of the client bundle. */
export function Nomogram({ formulas }: { formulas: ReactNode[] }) {
  const [index, setIndex] = useState(0);
  const n = nomograms[index];

  const [u, setU] = useState(n.defaults[0]);
  const [v, setV] = useState(n.defaults[1]);
  const [drag, setDrag] = useState<Axis | null>(null);

  const plot = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const select = (i: number) => {
    setIndex(i);
    setU(nomograms[i].defaults[0]);
    setV(nomograms[i].defaults[1]);
  };

  const W = Math.max(MIN_W, width - GUTTER * 2);
  const g = useMemo(() => geometry(n, H), [n]);

  const x0 = GUTTER;
  const x1 = GUTTER + g.tx * W;
  const x2 = GUTTER + W;

  const w = g.solve(u, v);
  const yU = g.yLeft(u);
  const yV = g.yRight(v);
  const yW = g.yMiddle(w);

  const setFromY = useCallback(
    (axis: Axis, y: number) => {
      const cy = clamp(y, 0, H);
      if (axis === "u") setU(clamp(g.fromYLeft(cy), n.left.lo, n.left.hi));
      else setV(clamp(g.fromYRight(cy), n.right.lo, n.right.hi));
    },
    [g, n],
  );

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const r = svg.current?.getBoundingClientRect();
      if (r) setFromY(drag, e.clientY - r.top - TOP);
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, setFromY]);

  const nudge = (axis: Axis, e: React.KeyboardEvent) => {
    const scale = axis === "u" ? n.left : n.right;
    const y = axis === "u" ? yU : yV;
    const d = e.shiftKey ? scale.step * 5 : scale.step;
    const keys: Record<string, number> = {
      ArrowUp: -d * H,
      ArrowRight: -d * H,
      ArrowDown: d * H,
      ArrowLeft: d * H,
      PageUp: -d * H * 5,
      PageDown: d * H * 5,
    };
    if (e.key in keys) {
      e.preventDefault();
      setFromY(axis, y + keys[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFromY(axis, H);
    } else if (e.key === "End") {
      e.preventDefault();
      setFromY(axis, 0);
    }
  };

  const axes = [
    { key: "u" as Axis, x: x0, y: yU, scale: n.left, value: u, anchor: "end" as const, off: -12 },
    { key: "v" as Axis, x: x2, y: yV, scale: n.right, value: v, anchor: "start" as const, off: 12 },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {nomograms.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => select(i)}
            aria-pressed={i === index}
            className={`mono-data rounded-sm border px-2.5 py-1 text-tag transition-colors ${
              i === index
                ? "border-accent bg-accent-bg text-accent"
                : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim"
            }`}
          >
            <span className="tabular-nums">{item.numeral}</span>
            <span className="ml-1.5">{item.layer}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-line bg-panel">
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3">
          <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink">
            {n.title}
          </h2>
          <span className="mono-data shrink-0 text-tag text-ink-faint">
            {n.numeral}
          </span>
        </div>

        <div ref={plot} className="overflow-hidden px-3 py-2">
          <svg
            ref={svg}
            width={Math.max(width, GUTTER * 2 + MIN_W)}
            height={H + TOP + BOTTOM}
            className="touch-none select-none"
            role="group"
            aria-label={`${n.title} alignment chart`}
          >
            <g transform={`translate(0 ${TOP})`}>
              {/* middle scale — the answer */}
              <line x1={x1} y1={0} x2={x1} y2={H} stroke="var(--line-bright)" />
              <text
                x={x1}
                y={-14}
                textAnchor="middle"
                className="mono-data"
                fontSize={11}
                fill="var(--ink-faint)"
              >
                {n.middle.unit}
              </text>
              {n.middle.ticks
                .map((t) => [t, g.yMiddle(t)] as const)
                .filter(([, y]) => y >= 0 && y <= H)
                .map(([t, y]) => (
                  <g key={t}>
                    <line x1={x1 - 4} y1={y} x2={x1 + 4} y2={y} stroke="var(--line)" />
                    {Math.abs(y - yW) > 11 && (
                      <text
                        x={x1 + 9}
                        y={y + 3.5}
                        className="mono-data"
                        fontSize={10}
                        fill="var(--ink-faint)"
                      >
                        {n.middle.format(t)}
                      </text>
                    )}
                  </g>
                ))}

              {/* outer scales */}
              {axes.map((a) => (
                <g key={a.key}>
                  <line x1={a.x} y1={0} x2={a.x} y2={H} stroke="var(--line-bright)" />
                  <text
                    x={a.x}
                    y={-14}
                    textAnchor="middle"
                    className="mono-data"
                    fontSize={11}
                    fill="var(--ink-faint)"
                  >
                    {a.scale.unit}
                  </text>
                  {a.scale.ticks.map((t) => {
                    const y = a.key === "u" ? g.yLeft(t) : g.yRight(t);
                    const dir = a.anchor === "end" ? -1 : 1;
                    return (
                      <g key={t}>
                        <line
                          x1={a.x}
                          y1={y}
                          x2={a.x + dir * 5}
                          y2={y}
                          stroke="var(--line)"
                        />
                        {Math.abs(y - a.y) > 11 && (
                          <text
                            x={a.x + dir * 9}
                            y={y + 3.5}
                            textAnchor={a.anchor}
                            className="mono-data"
                            fontSize={10}
                            fill="var(--ink-faint)"
                          >
                            {a.scale.format(t)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}

              {/* the isopleth */}
              <line
                x1={x0}
                y1={yU}
                x2={x2}
                y2={yV}
                stroke="var(--accent)"
                strokeWidth={1}
              />
              <path
                d={`M ${x1} ${yW - 5} L ${x1 + 5} ${yW} L ${x1} ${yW + 5} L ${x1 - 5} ${yW} Z`}
                fill="var(--accent)"
              />
              <text
                x={x1 + 11}
                y={yW - 8}
                className="mono-data"
                fontSize={12}
                fontWeight={600}
                fill="var(--accent)"
                stroke="var(--bg)"
                strokeWidth={3.5}
                paintOrder="stroke"
              >
                {n.middle.format(w)}
              </text>

              {/* handles */}
              {axes.map((a) => (
                <g
                  key={a.key}
                  role="slider"
                  tabIndex={0}
                  aria-label={a.scale.name}
                  aria-valuemin={Math.min(a.scale.lo, a.scale.hi)}
                  aria-valuemax={Math.max(a.scale.lo, a.scale.hi)}
                  aria-valuenow={a.value}
                  aria-valuetext={`${a.scale.format(a.value)} ${a.scale.name}`}
                  onKeyDown={(e) => nudge(a.key, e)}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.focus();
                    setDrag(a.key);
                  }}
                  className="cursor-ns-resize outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <rect
                    x={a.x - 14}
                    y={a.y - 11}
                    width={28}
                    height={22}
                    fill="transparent"
                  />
                  <rect
                    x={a.x - 5}
                    y={a.y - 5}
                    width={10}
                    height={10}
                    rx={2}
                    fill="var(--accent)"
                    stroke="var(--bg)"
                    strokeWidth={2}
                  />
                  <text
                    x={a.x + a.off}
                    y={a.y - 9}
                    textAnchor={a.anchor}
                    className="mono-data"
                    fontSize={12}
                    fontWeight={600}
                    fill="var(--accent)"
                    stroke="var(--bg)"
                    strokeWidth={3.5}
                    paintOrder="stroke"
                  >
                    {a.scale.format(a.value)}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        <div className="border-t border-line px-4 py-4">
          <div className="text-body text-ink">{formulas[index]}</div>
          <dl className="mono-data mt-3 flex flex-wrap gap-x-5 gap-y-1 text-tag text-ink-faint">
            {[n.left, n.middle, n.right].map((s) => (
              <div key={s.unit} className="flex gap-1.5">
                <dt className="text-ink-dim">{s.unit}</dt>
                <dd>{s.name}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-5 font-serif text-lead text-ink [font-variant-numeric:tabular-nums]"
      >
        {n.read(u, v, w)}
      </p>
      <p className="mt-2 max-w-prose text-meta text-ink-faint">{n.caveat}</p>
    </div>
  );
}
