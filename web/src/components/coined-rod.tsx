"use client";
import { useEffect, useRef, useState } from "react";
import { T } from "@/i18n/lang";
import type { Coined } from "@/data/coined";

/* The coinage rod: one bead per new word, in the order the words arrived. It plays through them while
   on screen; touch a bead to stop on it. The readout gives who, when, and the plain meaning. */
export function CoinedRod({ items }: { items: Coined[] }) {
  const [i, setI] = useState(items.length - 1);
  const [held, setHeld] = useState(false);
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.2 }); io.observe(el); return () => io.disconnect(); }, []);
  useEffect(() => { if (held || !vis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 3200); return () => clearInterval(t); }, [held, vis, items.length]);
  const c = items[i];
  return (
    <div ref={ref} className="cr">
      <div className="cr-rod">
        {items.map((x, k) => (
          <button key={x.id} type="button" className={`cr-bead${k === i ? " on" : ""}`} style={{ left: `${(k / (items.length - 1)) * 100}%` }} onClick={() => { setHeld(true); setI(k); }} onMouseEnter={() => { setHeld(true); setI(k); }} aria-label={`${x.term}, ${x.label}`}>
            <span className="cr-yr">{x.when.slice(0, 4)}</span>
          </button>
        ))}
      </div>
      <div className="cr-read" key={c.id} aria-live="polite">
        <span className="count"><T k={`cd.how_${c.how}`}>{c.how}</T> · {c.by} · {c.label}</span>
        <b className="cr-term">{c.term}</b>
        <p className="cr-plain">{c.plain}</p>
        <p className="cr-was"><span><T k="cd.was">Plainly</T></span> {c.was}</p>
      </div>
      <style>{`
        .cr { display: grid; gap: 34px; }
        .cr-rod { position: relative; height: 54px; margin: 0 14px; }
        .cr-rod::before { content: ""; position: absolute; left: -14px; right: -14px; top: 14px; height: 4px; border-radius: 2px; background: var(--rod); }
        .cr-bead { position: absolute; top: 4px; width: 24px; height: 24px; margin-left: -12px; border: 0; padding: 0; border-radius: 50%; cursor: pointer;
          background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); transition: transform .35s var(--spring), background .3s; }
        .cr-bead.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); transform: scale(1.3); }
        .cr-yr { position: absolute; top: 32px; left: 50%; transform: translateX(-50%); font: .66rem var(--font-mono), monospace; color: var(--muted); }
        .cr-bead.on .cr-yr { color: var(--rust-deep); font-weight: 700; }
        .cr-read { animation: rise .5s var(--ease) both; min-height: 170px; max-width: 760px; }
        .cr-term { display: block; font-size: clamp(1.7rem, 3.4vw, 2.5rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.1; margin-top: 8px; }
        .cr-plain { font-size: 1.15rem; margin-top: 12px; color: var(--ink); }
        .cr-was { margin-top: 10px; color: var(--sec); } .cr-was span { font: .7rem var(--font-mono), monospace; text-transform: uppercase; letter-spacing: .08em; color: var(--rust-deep); margin-right: 6px; }
        @media (max-width: 640px) { .cr-yr { display: none; } .cr-bead { width: 18px; height: 18px; margin-left: -9px; top: 7px; } }
        @media (prefers-reduced-motion: reduce) { .cr-read { animation: none; } }
      `}</style>
    </div>
  );
}
