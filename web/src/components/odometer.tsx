"use client";
import { useEffect, useRef, useState } from "react";

/* Broadcast numbers (brand/broadcast.html, A): each digit rolls on its own reel and the last one
   settles last, like a mechanical counter. Sized in em, so it takes the font size of its parent.
   Commas, % and other symbols stay still. Reduced motion shows the number at rest. */
export function Odometer({ value, run, delay = 0 }: { value: string; run: boolean; delay?: number }) {
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  const digits = [...value].map((ch) => /\d/.test(ch));
  let k = -1;
  return (
    <span className="odo">
      <span className="odo-sr">{value}</span>
      {[...value].map((ch, i) => {
        if (!digits[i]) return <span key={i} className="odo-sym" aria-hidden="true">{ch}</span>;
        k += 1;
        const to = 10 + Number(ch);
        const style = still ? { transform: `translateY(-${to}em)`, transition: "none" }
          : { transform: run ? `translateY(-${to}em)` : "translateY(0)", transitionDuration: `${1000 + k * 120}ms`, transitionDelay: `${delay + k * 90}ms` };
        return (
          <span key={i} className="odo-reel" aria-hidden="true">
            <span className="odo-col" style={style}>{Array.from({ length: 20 }, (_, d) => <span key={d}>{d % 10}</span>)}</span>
          </span>
        );
      })}
      <style>{`
        .odo { display: inline-flex; align-items: flex-end; line-height: 1; font-variant-numeric: tabular-nums; }
        .odo-reel { display: inline-block; height: 1em; overflow: hidden; }
        .odo-col { display: block; transition-property: transform; transition-timing-function: cubic-bezier(.16, 1, .3, 1); will-change: transform; }
        .odo-col > span { display: block; height: 1em; }
        .odo-sym { display: inline-block; }
        .odo-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      `}</style>
    </span>
  );
}

/* true once the element has scrolled into view; it never goes back */
export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold });
    io.observe(el); return () => io.disconnect();
  }, [threshold]);
  return [ref, on] as const;
}
