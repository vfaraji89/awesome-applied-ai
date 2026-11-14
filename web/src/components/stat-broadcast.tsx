"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Odometer } from "./odometer";

/* The main numbers, played like a broadcast score graphic: two wooden posts start together at the
   centre and slide out to the edges, the panel opens between them, then the number counts up and a
   short label rises. Few words on the tile; the longer note is the tile's hover title. Plays once
   when the strip scrolls into view; reduced motion shows it at rest. */
export type Stat = { n: string; label: React.ReactNode; note?: string; href?: string; hot?: boolean };

export function StatBroadcast({ items, cols = 4 }: { items: Stat[]; cols?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`sb${on ? " on" : ""}`} style={{ ["--cols" as string]: cols }}>
      {items.map((x, i) => {
        const face = (
          <>
            <span className="sb-post l" aria-hidden="true" /><span className="sb-post r" aria-hidden="true" />
            <span className="sb-face">
              <b className={x.hot || i === 0 ? "hot" : ""}><Odometer value={x.n} run={on} delay={i * 90 + 380} /></b>
              <span className="sb-l">{x.label}</span>
            </span>
          </>
        );
        const style = { ["--i" as string]: i };
        return x.href
          ? <Link key={i} href={x.href} className="sb-tile" style={style} title={x.note}>{face}</Link>
          : <div key={i} className="sb-tile" style={style} title={x.note}>{face}</div>;
      })}
      <style>{`
        .sb { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 22px 18px; }
        @media (max-width: 900px) { .sb { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .sb-tile { position: relative; display: block; text-decoration: none; color: inherit; }
        .sb-post { position: absolute; top: -5px; bottom: -5px; width: 7px; border-radius: 4px; background: var(--dowel); left: calc(50% - 3.5px); z-index: 1;
          transition: left .65s cubic-bezier(.77, 0, .18, 1); transition-delay: calc(var(--i) * 90ms); }
        .sb-face { display: grid; gap: 4px; padding: 20px 24px 22px; border-radius: 4px; background-color: var(--card);
          background-image: var(--rod), var(--rod); background-size: 100% 3px, 100% 3px; background-position: center top, center bottom; background-repeat: no-repeat;
          clip-path: inset(0 50% 0 50%); transition: clip-path .65s cubic-bezier(.77, 0, .18, 1); transition-delay: calc(var(--i) * 90ms); }
        .sb-face > * { opacity: 0; transform: translateY(8px); transition: opacity .45s ease, transform .55s var(--ease); transition-delay: calc(var(--i) * 90ms + 380ms); }
        .sb.on .sb-post.l { left: -4px; } .sb.on .sb-post.r { left: calc(100% - 3px); }
        .sb.on .sb-face { clip-path: inset(0 0 0 0); } .sb.on .sb-face > * { opacity: 1; transform: none; }
        .sb-face b { font-size: clamp(1.9rem, 3.4vw, 2.6rem); font-weight: 800; letter-spacing: -.04em; line-height: 1; color: var(--ink); font-variant-numeric: tabular-nums; }
        .sb-face b.hot { color: var(--rust); }
        .sb-l { font-weight: 700; font-size: .92rem; line-height: 1.3; }
        a.sb-tile:hover .sb-face { background-image: linear-gradient(var(--rust), var(--rust)), var(--rod); }
        @media (prefers-reduced-motion: reduce) {
          .sb-post, .sb-face, .sb-face > * { transition: none; }
          .sb .sb-post.l { left: -4px; } .sb .sb-post.r { left: calc(100% - 3px); } .sb .sb-face { clip-path: none; } .sb .sb-face > * { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
