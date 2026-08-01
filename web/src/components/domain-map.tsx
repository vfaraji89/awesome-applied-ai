"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Glyph } from "@/lib/glyphs";
import type { Domain } from "@/lib/types";

export type DomainNode = Domain & {
  segments?: { id: string; label: string; count: number; color: string }[];
};

const ease = [0.22, 1, 0.36, 1] as const;
const CELLS = 18;

export function DomainMap({ nodes }: { nodes: DomainNode[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="border-t border-line">
      {nodes.map((node, i) => {
        const active = open === node.id;
        const live = Boolean(node.href);

        const body = (
          <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[3.25rem_minmax(0,1fr)_11rem] md:gap-x-8">
            <div className="flex flex-col items-center gap-2.5">
              <span
                className={`flex size-11 items-center justify-center rounded-lg border bg-panel transition-colors duration-200 ${
                  active
                    ? "border-accent text-accent"
                    : "border-line text-ink-faint"
                }`}
              >
                <Glyph name={node.id} className="size-[22px]" />
              </span>
              <span
                className={`mono-data text-meta leading-none transition-colors duration-200 ${
                  active ? "text-accent" : live ? "text-ink-dim" : "text-ink-faint"
                }`}
              >
                {node.numeral}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3
                  className={`font-serif text-h3 font-semibold tracking-tight ${
                    live ? "text-ink" : "text-ink-dim"
                  }`}
                >
                  {node.name}
                </h3>
                <span
                  className={`mono-data text-tag uppercase tracking-widest ${
                    live ? "text-accent" : "text-ink-faint"
                  }`}
                >
                  {node.status}
                </span>
              </div>

              <p className="mt-2.5 max-w-2xl text-ui leading-relaxed text-ink-dim">
                {node.question}
              </p>

              <ul className="mono-data mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-tag text-ink-faint">
                {node.scope.map((s, j) => (
                  <li key={s} className="flex items-center gap-2">
                    {j > 0 && (
                      <span aria-hidden className="opacity-40">
                        /
                      </span>
                    )}
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              <AnimatePresence initial={false}>
                {active && live && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease }}
                    className="overflow-hidden"
                  >
                    <span className="mono-data mt-4 inline-block text-tag uppercase tracking-widest text-accent">
                      Open the stack →
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="col-span-2 mt-6 md:col-span-1 md:mt-1">
              <Meter node={node} />
            </div>
          </div>
        );

        return (
          <motion.div
            key={node.id}
            initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease }}
            onHoverStart={() => setOpen(node.id)}
            onHoverEnd={() => setOpen(null)}
            className="relative border-b border-line"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-px"
              style={{ background: live ? node.color : "var(--line)" }}
            />
            <motion.span
              aria-hidden
              className="absolute left-0 top-0 h-px w-full origin-left bg-accent"
              animate={{ scaleX: active ? 1 : 0 }}
              transition={{ duration: 0.45, ease }}
            />
            <motion.span
              aria-hidden
              className="absolute bottom-0 right-0 h-px w-full origin-right bg-accent"
              animate={{ scaleX: active ? 1 : 0 }}
              transition={{ duration: 0.45, ease }}
            />

            {live ? (
              <Link
                href={node.href!}
                onFocus={() => setOpen(node.id)}
                onBlur={() => setOpen(null)}
                className="block px-5 py-8 outline-none sm:px-7"
              >
                {body}
              </Link>
            ) : (
              <div className="px-5 py-8 sm:px-7">{body}</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function Meter({ node }: { node: DomainNode }) {
  if (node.segments) {
    const total = node.segments.reduce((n, s) => n + s.count, 0);
    return (
      <div className="md:text-right">
        <div className="flex h-2 w-full gap-px overflow-hidden">
          {node.segments.map((s) => (
            <div
              key={s.id}
              style={{ background: s.color, width: `${(s.count / total) * 100}%` }}
            />
          ))}
        </div>
        <ul className="mono-data mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-tag text-ink-faint md:justify-end">
          {node.segments.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span>{s.label}</span>
              <span className="tabular-nums text-ink-dim">{s.count}</span>
            </li>
          ))}
        </ul>
        <div className="mono-data mt-2 text-tag text-ink-faint">
          {total} entries · {node.segments.length} layers
        </div>
      </div>
    );
  }

  const filled = Math.round((node.entries / node.target) * CELLS);

  return (
    <div className="md:text-right">
      <div className="flex w-full gap-px">
        {Array.from({ length: CELLS }, (_, i) => (
          <div
            key={i}
            className="h-2 flex-1"
            style={
              i < filled
                ? { background: node.color }
                : { border: "1px solid var(--line)" }
            }
          />
        ))}
      </div>
      <div className="mono-data mt-2 text-tag text-ink-faint">
        {node.entries} of ~{node.target} planned
      </div>
    </div>
  );
}
