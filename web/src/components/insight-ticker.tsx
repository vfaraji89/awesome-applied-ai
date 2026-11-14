"use client";
/* A broadcast-style insight bar, like a score graphic on match night: the two abacus posts start
   together at the centre and slide out to the edges, opening the bar; the insight rises in; a rod
   fills while it holds; then the bar closes back to the centre and opens on the next one.
   Pauses on hover or focus. With reduced motion it simply cross-fades. */
import { useEffect, useRef, useState, type ReactNode } from "react";

export type TickerItem = { k: string; big: string; lead: ReactNode; what: ReactNode };

const OPEN = 700, HOLD = 4200, CLOSE = 520;

export function InsightTicker({ items, label }: { items: TickerItem[]; label: string }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"open" | "hold" | "close">("open");
  const paused = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  // start when the bar scrolls into view, so the first opening is seen
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen || items.length === 0) return;
    let t: ReturnType<typeof setTimeout>;
    const wait = (ms: number, fn: () => void) => { t = setTimeout(function tick() { if (paused.current) { t = setTimeout(tick, 300); return; } fn(); }, ms); };
    if (phase === "open") wait(OPEN, () => setPhase("hold"));
    else if (phase === "hold") wait(HOLD, () => setPhase(items.length > 1 ? "close" : "hold"));
    else wait(CLOSE, () => { setI((x) => (x + 1) % items.length); setPhase("open"); });
    return () => clearTimeout(t);
  }, [phase, seen, items.length]);

  if (!items.length) return null;
  const it = items[i];
  return (
    <div
      ref={box}
      className={`itk ${seen ? phase : "idle"}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      tabIndex={0}
    >
      <span className="itk-post l" aria-hidden="true" />
      <span className="itk-post r" aria-hidden="true" />
      <div className="itk-body" aria-live="polite" key={it.k}>
        <b className="itk-big">{it.big}</b>
        <span className="itk-text"><span className="itk-lead">{it.lead}</span> <span className="itk-what">{it.what}</span></span>
        <span className="itk-n mono">{String(i + 1).padStart(2, "0")}<i>/{String(items.length).padStart(2, "0")}</i></span>
      </div>
      <span className="itk-rod" aria-hidden="true"><span key={`${it.k}-${phase}`} /></span>
      <style>{css}</style>
    </div>
  );
}

const css = `
  .itk { position: relative; height: 92px; margin-top: 26px; border-radius: var(--radius); outline: none; isolation: isolate; }
  .itk::before { content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: -1;
    background: linear-gradient(180deg, color-mix(in oklab, var(--ink) 92%, var(--rust)), var(--ink));
    
    clip-path: inset(0 50% 0 50% round var(--radius)); transition: clip-path ${OPEN}ms cubic-bezier(.77,0,.18,1); }
  .itk.open::before, .itk.hold::before { clip-path: inset(0 0 0 0 round var(--radius)); }
  .itk.close::before { clip-path: inset(0 50% 0 50% round var(--radius)); transition-duration: ${CLOSE}ms; }
  .itk-post { position: absolute; top: -6px; bottom: -6px; width: 8px; border-radius: 4px; background: var(--dowel); 
    left: calc(50% - 4px); transition: left ${OPEN}ms cubic-bezier(.77,0,.18,1); }
  .itk.open .itk-post.l, .itk.hold .itk-post.l { left: -4px; }
  .itk.open .itk-post.r, .itk.hold .itk-post.r { left: calc(100% - 4px); }
  .itk.close .itk-post { left: calc(50% - 4px); transition-duration: ${CLOSE}ms; }
  .itk-body { position: absolute; inset: 0; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 22px; padding: 0 34px;
    color: #f4efe8; opacity: 0; transform: translateY(10px); transition: opacity .35s ease, transform .45s var(--ease); }
  .itk.hold .itk-body { opacity: 1; transform: none; }
  .itk.close .itk-body { opacity: 0; transform: translateY(-6px); transition-duration: .2s; }
  .itk-big { font-size: 2.5rem; font-weight: 800; letter-spacing: -.04em; color: #ff6a55; line-height: 1; }
  .itk-text { font-size: 1.02rem; line-height: 1.35; }
  .itk-lead { color: #c9c2b8; } .itk-what { font-weight: 700; color: #fff; }
  .itk-n { font-size: .78rem; color: #ff6a55; } .itk-n i { font-style: normal; color: #8f887f; }
  .itk-rod { position: absolute; left: 34px; right: 34px; bottom: 12px; height: 3px; border-radius: 2px; background: rgba(255,255,255,.12); overflow: hidden; opacity: 0; transition: opacity .3s; }
  .itk.hold .itk-rod { opacity: 1; }
  .itk-rod span { display: block; height: 100%; width: 100%; background: var(--rust); transform: scaleX(0); transform-origin: left; }
  .itk.hold .itk-rod span { animation: itk-fill ${HOLD}ms linear forwards; }
  .itk:is(:hover, :focus-visible) .itk-rod span { animation-play-state: paused; }
  @keyframes itk-fill { to { transform: none; } }
  @media (max-width: 640px) { .itk { height: auto; min-height: 112px; } .itk-body { position: relative; grid-template-columns: auto 1fr; padding: 18px 24px 26px; gap: 14px; } .itk-n { display: none; } .itk-big { font-size: 2rem; } }
  @media (prefers-reduced-motion: reduce) {
    .itk::before { clip-path: none !important; transition: none; }
    .itk-post.l { left: -4px !important; } .itk-post.r { left: calc(100% - 4px) !important; }
    .itk-post { transition: none; } .itk-body { transform: none !important; transition: opacity .4s; }
    .itk.hold .itk-rod span { animation: none; transform: none; }
  }
`;
