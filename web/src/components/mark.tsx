"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

/**
 * An isopleth: three scales, a straightedge laid across them, the answer where
 * it crosses the middle.
 *
 * Only the two outer crossings are state. The straightedge and the diamond are
 * both derived from them, so the diamond sits on the line by construction at
 * every frame rather than by matching two animations — and it lands on the mean,
 * which is the relation a parallel-scale nomogram actually encodes.
 */
/**
 * Pairs are chosen so the two crossings swing across most of the scales while
 * their mean stays near 14 — the outer readings visibly move, the mark's optical
 * centre does not. Pairs with a lopsided mean drag the whole figure into one
 * corner and leave the rest of the emblem as bare rules.
 */
const readings: [number, number][] = [
  [19, 9],
  [7, 19],
  [22, 8],
  [10, 16],
  [17, 7],
  [6, 20],
];

/** How far the straightedge overhangs the outer scales, as a share of their gap. */
const OVER = 0.15;
const DWELL = 2800;

export function Mark({ className = "size-10" }: { className?: string }) {
  const reduced = useReducedMotion();
  const yA = useMotionValue(readings[0][0]);
  const yB = useMotionValue(readings[0][1]);

  const y1 = useTransform([yA, yB], ([a, b]: number[]) => a - (b - a) * OVER);
  const y2 = useTransform([yA, yB], ([a, b]: number[]) => b + (b - a) * OVER);
  const dy = useTransform([yA, yB], ([a, b]: number[]) => (a + b) / 2 - 14);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % readings.length;
      const spring = { type: "spring", stiffness: 120, damping: 17 } as const;
      animate(yA, readings[i][0], spring);
      animate(yB, readings[i][1], spring);
    }, DWELL);
    return () => clearInterval(t);
  }, [reduced, yA, yB]);

  return (
    <svg viewBox="0 0 28 28" aria-hidden className={className}>
      {[4, 14, 24].map((x) => (
        <line
          key={x}
          x1={x}
          y1={2}
          x2={x}
          y2={26}
          stroke="var(--ink-faint)"
          strokeWidth={1}
        />
      ))}

      <motion.line
        x1={1}
        x2={27}
        y1={y1}
        y2={y2}
        stroke="var(--ink)"
        strokeWidth={1.5}
      />

      <motion.circle cx={4} cy={yA} r={1.4} fill="var(--ink)" />
      <motion.circle cx={24} cy={yB} r={1.4} fill="var(--ink)" />

      <motion.g style={{ y: dy }}>
        <path d="M14 11 L17 14 L14 17 L11 14 Z" fill="var(--accent)" />
      </motion.g>
    </svg>
  );
}
