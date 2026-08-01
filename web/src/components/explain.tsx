"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FlowStep, Plain } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function ConceptFlow({ steps }: { steps: FlowStep[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (held || reduced) return;
    const t = setInterval(() => setActive((i) => (i + 1) % steps.length), 5000);
    return () => clearInterval(t);
  }, [held, reduced, steps.length]);

  return (
    <div
      className="rounded-lg border border-line bg-panel p-6 sm:p-8"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-1">
        {steps.map((step, i) => {
          const on = i === active;
          const done = i < active;
          const last = i === steps.length - 1;
          return (
            <div key={step.id} className="flex flex-1 items-center gap-3 sm:block">
              <div className="relative flex items-center sm:h-7">
                {!last && (
                  <>
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-7 h-5 w-px sm:left-0 sm:top-1/2 sm:h-px sm:w-full"
                      style={{ background: "var(--color-line)" }}
                    />
                    {!reduced && (
                      <motion.span
                        aria-hidden
                        className="absolute left-0 top-1/2 hidden h-px w-full origin-left sm:block"
                        style={{ background: "var(--color-accent)" }}
                        animate={{ scaleX: done ? 1 : 0, opacity: done ? 1 : 0 }}
                        transition={{ duration: 0.5, ease }}
                      />
                    )}
                  </>
                )}
                <motion.button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                  className="mono-data relative z-10 flex size-7 items-center justify-center rounded-full border text-tag tabular-nums outline-none"
                  style={{
                    borderColor: on
                      ? "var(--color-accent)"
                      : "var(--color-line-bright)",
                    background: on ? "var(--color-accent)" : "var(--color-bg)",
                    color: on ? "#fff" : "var(--color-ink-faint)",
                  }}
                  animate={{ scale: on ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  aria-label={step.label}
                  aria-current={on}
                >
                  {i + 1}
                </motion.button>
                {on && !reduced && (
                  <motion.span
                    aria-hidden
                    className="absolute left-0 z-0 size-7 rounded-full"
                    style={{ background: "var(--color-accent)" }}
                    initial={{ opacity: 0.35, scale: 1 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setHeld(true);
                }}
                className="block text-left text-meta leading-snug transition-colors sm:mt-4 sm:pr-4"
                style={{ color: on ? "var(--color-ink)" : "var(--color-ink-faint)" }}
              >
                {step.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-7 min-h-[5.5rem] border-t border-line pt-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={steps[active].id}
            initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease }}
            className="max-w-3xl text-ui leading-relaxed text-ink-dim"
          >
            {steps[active].plain}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function PlainToggle({
  technical,
  plain,
}: {
  technical: string;
  plain: Plain;
}) {
  const [mode, setMode] = useState<"plain" | "technical">("plain");
  const reduced = useReducedMotion();

  return (
    <div>
      <div className="inline-flex rounded-sm border border-line bg-panel p-0.5">
        {(["plain", "technical"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="relative rounded-sm px-4 py-1.5 text-meta font-medium outline-none transition-colors"
            style={{ color: mode === m ? "#fff" : "var(--color-ink-dim)" }}
          >
            {mode === m && (
              <motion.span
                layoutId="plain-toggle"
                className="absolute inset-0 rounded-sm"
                style={{ background: "var(--color-accent)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">
              {m === "plain" ? "In plain English" : "For engineers"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduced ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.3, ease }}
          className="mt-6"
        >
          {mode === "plain" ? (
            <>
              <p className="max-w-3xl font-serif text-h3 font-medium leading-snug tracking-tight text-ink">
                {plain.headline}
              </p>
              <p className="mt-4 max-w-3xl text-ui leading-relaxed text-ink-dim">
                {plain.body}
              </p>
            </>
          ) : (
            <p className="max-w-3xl font-serif text-h3 font-medium leading-snug tracking-tight text-ink">
              {technical}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
