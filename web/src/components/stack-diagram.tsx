"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Glyph } from "@/lib/glyphs";

export type Band = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  question: string;
  color: string;
  count: number;
  categories: { id: string; name: string; count: number }[];
  formulaLabel: string;
  formulaHtml: string;
};

const ease = [0.22, 1, 0.36, 1] as const;
const step = 13;

function Corner({
  color,
  active,
  at,
}: {
  color: string;
  active: boolean;
  at: "tr" | "br";
}) {
  const anchor = at === "tr" ? "right-0 top-0" : "bottom-0 right-0";
  const transition = { duration: 0.3, ease };
  const background = active ? "var(--accent)" : color;

  return (
    <>
      <motion.span
        aria-hidden
        className={`absolute ${anchor} h-px`}
        style={{ background }}
        animate={{ width: active ? 40 : 16 }}
        transition={transition}
      />
      <motion.span
        aria-hidden
        className={`absolute ${anchor} w-px`}
        style={{ background }}
        animate={{ height: active ? 40 : 16 }}
        transition={transition}
      />
    </>
  );
}

export function StackDiagram({ bands }: { bands: Band[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      {bands.map((band, i) => {
        const active = open === band.id;
        const inset = (bands.length - 1 - i) * step;

        return (
          <motion.div
            key={band.id}
            style={{ ["--inset" as string]: `${inset}px` }}
            className="md:mx-[var(--inset)]"
            initial={reduced ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease }}
            onHoverStart={() => setOpen(band.id)}
            onHoverEnd={() => setOpen(null)}
          >
            <motion.div
              animate={{ y: active ? -3 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <Link
                href={`/layers/${band.id}/`}
                onFocus={() => setOpen(band.id)}
                onBlur={() => setOpen(null)}
                className={`group relative block overflow-hidden rounded-lg border bg-panel px-6 py-6 outline-none transition-colors duration-200 ${
                  active ? "border-line-bright" : "border-line"
                }`}
              >
                <Corner color={band.color} active={active} at="tr" />
                <Corner color={band.color} active={active} at="br" />
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-panel-2"
                  animate={{ opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.28 }}
                />

                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                  <div className="md:w-72 md:shrink-0">
                    <div className="relative inline-flex items-baseline gap-3 pb-1.5">
                      <span
                        className={`mono-data text-tag transition-colors duration-200 ${
                          active ? "text-accent" : "text-ink-faint"
                        }`}
                      >
                        {band.index}
                      </span>
                      <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink">
                        {band.name}
                      </h2>
                      <motion.span
                        aria-hidden
                        className="absolute bottom-0 left-0 h-px w-full origin-left bg-accent"
                        animate={{ scaleX: active ? 1 : 0 }}
                        transition={{ duration: 0.4, ease }}
                      />
                    </div>
                    <p className="mt-1.5 pl-8 text-meta text-ink-faint">
                      {band.tagline}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-wrap gap-2 pl-8 md:pl-0">
                    {band.categories.map((c) => (
                      <span
                        key={c.id}
                        className="mono-data flex items-center gap-1.5 rounded-sm border border-line bg-bg px-2.5 py-1.5 text-tag text-ink-dim transition-colors group-hover:border-line-bright group-hover:text-ink"
                      >
                        <Glyph name={c.id} className="size-3.5 shrink-0" />
                        {c.name}
                        <span className="text-ink-faint">{c.count}</span>
                      </span>
                    ))}
                  </div>

                  <div className="mono-data pl-8 text-ui text-ink-faint md:w-16 md:pl-0 md:text-right">
                    {band.count}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      key="detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="relative overflow-hidden"
                    >
                      <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 pl-8 md:flex-row md:items-center md:gap-8">
                        <p className="text-ui text-ink-dim md:w-72 md:shrink-0">
                          {band.question}
                        </p>
                        <div className="min-w-0 flex-1">
                          <div className="label">{band.formulaLabel}</div>
                          <div
                            className="mt-2 overflow-x-auto text-ink"
                            dangerouslySetInnerHTML={{ __html: band.formulaHtml }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
