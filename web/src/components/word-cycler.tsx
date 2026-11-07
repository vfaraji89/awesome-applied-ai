"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/* A rotating jargon card: one term at a time, its plain meaning underneath. */
export function WordCycler({ terms }: { terms: { id: string; term: string; short: string }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % terms.length), 4200);
    return () => clearInterval(t);
  }, [terms.length]);
  const w = terms[i];
  return (
    <Link href={`/jargon/#${w.id}`} className="frame wc">
      <span className="kicker">Word of the moment</span>
      <div key={w.id} className="wc-body">
        <h3 className="wc-term">{w.term}<span className="dot">.</span></h3>
        <p className="muted">{w.short}</p>
      </div>
      <span className="count">{i + 1} / {terms.length} · tap to read more</span>
      <span className="rod" />
      <style>{`
        .wc { display: flex; flex-direction: column; gap: 12px; min-height: 230px; padding-bottom: 34px; }
        .wc-body { animation: rise .6s var(--ease) both; flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .wc-term { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; letter-spacing: -.035em; }
      `}</style>
    </Link>
  );
}
