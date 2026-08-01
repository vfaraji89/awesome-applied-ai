"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Fast in, hard stop — a nail drags, it does not glide. */
const rake = [0.7, 0, 0.2, 1] as const;
const DUR = 0.42;

/** Ragged vertical edge at `p`% — the torn line a nail leaves behind it. */
const kept = (p: number) =>
  `polygon(0% 0%, ${p + 3}% 0%, ${p - 2}% 17%, ${p + 5}% 34%, ${p - 3}% 52%, ${p + 4}% 68%, ${p - 2}% 85%, ${p + 2}% 100%, 0% 100%)`;

const torn = (p: number) =>
  `polygon(${p + 3}% 0%, 100% 0%, 100% 100%, ${p + 2}% 100%, ${p - 2}% 85%, ${p + 4}% 68%, ${p - 3}% 52%, ${p + 5}% 34%, ${p - 2}% 17%)`;

const claws = [
  { top: 21, end: 98 },
  { top: 39, end: 92 },
  { top: 57, end: 96 },
  { top: 75, end: 89 },
];

/** Gouges are background-coloured: they cut through the letterforms, not over them. */
function Claws() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: DUR * 1.9, times: [0, 0.5, 1], ease: "linear" }}
    >
      {claws.map((c, i) => (
        <motion.span
          key={c.top}
          className="absolute left-0 bg-bg"
          style={{ top: `${c.top}%`, height: "0.05em" }}
          initial={{ width: "0%" }}
          animate={{ width: `${c.end}%` }}
          transition={{ duration: DUR, ease: rake, delay: i * 0.02 }}
        />
      ))}
    </motion.span>
  );
}

export function WordWheel({
  words,
  dwell = 2400,
}: {
  words: string[];
  dwell?: number;
}) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), dwell);
    return () => clearInterval(t);
  }, [reduced, words.length, dwell]);

  if (reduced) {
    return (
      <>
        <span className="sr-only">{words.join(", ")}</span>
        <span aria-hidden className="block text-accent">
          {words[0]}
        </span>
      </>
    );
  }

  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>
      {/* Every word is stacked invisibly in one grid cell so the box holds the
          widest — clip percentages then map to the letterforms, not the page. */}
      <span aria-hidden className="relative grid w-fit overflow-hidden text-accent">
        {words.map((word) => (
          <span key={word} className="invisible col-start-1 row-start-1">
            {word}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={words[i]}
            className="col-start-1 row-start-1 block"
            initial={{ clipPath: kept(-8) }}
            animate={{ clipPath: kept(108) }}
            exit={{ clipPath: [torn(-8), torn(108)] }}
            transition={{ duration: DUR, ease: rake }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
        <Claws key={words[i]} />
      </span>
    </>
  );
}
