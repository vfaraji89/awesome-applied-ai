"use client";
/* The shell every doc runs in. One idea per page, the animation on a big stage, very little text.
   - An abacus stepper on top: one bead per page on a wooden rod. Pages you have seen slide to the
     left like counted beads; the current one glows rust; click any bead to jump.
   - Each page opens from the centre like a score graphic; the title rises, then the animation,
     then one short caption. The comparison and hint are single lines; longer detail is folded.
   - Play runs the doc by itself, a rod filling while each page holds. Arrow keys and swipes move.
   No chips, no edge bars. Reduced motion: no autoplay, no transitions. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type DocPage = { title: string; caption: string; analogy: string; hint: string; more?: string[]; anim: ReactNode };

const HOLD = 9000;

export function DocShell({ pages, label, end }: { pages: DocPage[]; label: string; end?: ReactNode }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const still = useRef(false);
  const touch = useRef<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = Number(window.location.hash.replace("#lesson-", ""));
    if (n >= 1 && n <= pages.length) setI(n - 1);
  }, [pages.length]);

  const go = useCallback((n: number) => {
    const k = Math.max(0, Math.min(pages.length - 1, n));
    setI(k); setOpen(false);
    history.replaceState(null, "", `#lesson-${k + 1}`);
  }, [pages.length]);

  // autoplay: hold, then the next page; stop at the end
  useEffect(() => {
    if (!playing || still.current) return;
    if (i >= pages.length - 1) { const t = setTimeout(() => setPlaying(false), HOLD); return () => clearTimeout(t); }
    const t = setTimeout(() => go(i + 1), HOLD);
    return () => clearTimeout(t);
  }, [playing, i, pages.length, go]);

  // arrow keys while the doc is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!box.current) return;
      const r = box.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") { go(i + 1); setPlaying(false); }
      if (e.key === "ArrowLeft") { go(i - 1); setPlaying(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  const p = pages[i];
  return (
    <div className="ds" ref={box} onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); setPlaying(false); } }}>
      <nav className="ds-abacus" aria-label={`${label}: pages`}>
        <span className="ds-post l" aria-hidden="true" /><span className="ds-post r" aria-hidden="true" />
        <span className="ds-rod" aria-hidden="true" />
        {pages.map((x, k) => {
          // seen beads gather on the left, unseen ones wait on the right, the current one sits between
          const left = k < i ? 6 + k * 3.2 : k === i ? 6 + i * 3.2 + 8 + (i / Math.max(1, pages.length - 1)) * 40 : 100 - 6 - (pages.length - 1 - k) * 3.2;
          return (
            <button key={x.title} type="button" className={`ds-bead${k < i ? " seen" : k === i ? " on" : ""}`} style={{ left: `${left}%` }}
              onClick={() => { go(k); setPlaying(false); }} aria-label={`Page ${k + 1}: ${x.title}`} aria-current={k === i ? "step" : undefined}>
              <span className="ds-tip">{String(k + 1).padStart(2, "0")} · {x.title}</span>
            </button>
          );
        })}
      </nav>

      <article key={i} className="ds-stage">
        <header className="ds-head">
          <span className="mono ds-n">{String(i + 1).padStart(2, "0")}<i>/{String(pages.length).padStart(2, "0")}</i></span>
          <h2>{p.title}<span className="dot">.</span></h2>
        </header>
        <div className="ds-anim">{p.anim}</div>
        <p className="ds-cap">{p.caption}</p>
        <div className="ds-lines">
          <p><span className="ds-ico ink" aria-hidden="true">≈</span>{p.analogy}</p>
          <p><span className="ds-ico" aria-hidden="true">✦</span>{p.hint}</p>
        </div>
        {p.more && p.more.length > 0 && (
          <div className="ds-more">
            <button type="button" className="ds-more-b" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "Less" : "The detail"} <span aria-hidden="true">{open ? "↑" : "↓"}</span></button>
            {open && <div className="ds-more-t">{p.more.map((t) => <p key={t}>{t}</p>)}</div>}
          </div>
        )}
        {playing && !still.current && <span className="ds-hold" key={`h${i}`} aria-hidden="true"><i /></span>}
      </article>

      <div className="ds-ctrl">
        <button type="button" className="ds-btn" onClick={() => { go(i - 1); setPlaying(false); }} disabled={i === 0} aria-label="Previous page">←</button>
        <button type="button" className={`ds-btn play${playing ? " on" : ""}`} onClick={() => { if (i === pages.length - 1 && !playing) go(0); setPlaying((x) => !x); }} aria-label={playing ? "Pause" : "Play the doc"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="ds-btn" onClick={() => { go(i + 1); setPlaying(false); }} disabled={i === pages.length - 1} aria-label="Next page">→</button>
        <span className="count ds-keys">← → or swipe</span>
      </div>

      {end && <div className="ds-end">{end}</div>}

      <style>{css}</style>
    </div>
  );
}

const css = `
  .ds { position: relative; }
  .ds-abacus { position: relative; height: 54px; margin: 0 4px 18px; }
  .ds-rod { position: absolute; left: 0; right: 0; top: 25px; height: 4px; border-radius: 2px; background: var(--rod); }
  .ds-post { position: absolute; top: 4px; bottom: 4px; width: 8px; border-radius: 4px; background: var(--dowel); }
  .ds-post.l { left: -4px; } .ds-post.r { right: -4px; }
  .ds-bead { all: unset; cursor: pointer; position: absolute; top: 15px; width: 24px; height: 24px; margin-left: -12px; border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #fff 0%, #f1ede8 45%, #d6cfc7 100%); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px;
    transition: left .8s cubic-bezier(.77,0,.18,1), transform .25s var(--spring), background .4s; }
  .ds-bead.seen { background: radial-gradient(circle at 34% 30%, #6a6a70 0%, #1c1c1e 50%, #000 100%); }
  .ds-bead.on { width: 30px; height: 30px; top: 12px; margin-left: -15px; background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); outline: 6px solid var(--mark); outline-offset: 0; }
  .ds-bead:hover, .ds-bead:focus-visible { transform: scale(1.18); }
  .ds-bead:focus-visible { outline: 2px solid var(--rust); outline-offset: 3px; }
  .ds-tip { position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translate(-50%, 4px); white-space: nowrap; padding: 5px 10px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: .76rem; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 3; }
  .ds-bead:hover .ds-tip, .ds-bead:focus-visible .ds-tip { opacity: 1; transform: translate(-50%, 0); }

  .ds-stage { position: relative; display: flex; flex-direction: column; padding: 30px 34px 34px; border-radius: var(--radius); background: var(--card);
    border: 1px solid var(--line);
    animation: ds-open .8s cubic-bezier(.77,0,.18,1) both; }
  @keyframes ds-open { from { clip-path: inset(0 50% 0 50% round var(--radius)); } to { clip-path: inset(0 0 0 0 round var(--radius)); } }
  .ds-stage > * { animation: ds-in .55s var(--ease) both; }
  .ds-head { animation-delay: .35s; } .ds-anim { animation-delay: .5s; } .ds-cap { animation-delay: .7s; } .ds-lines { animation-delay: .85s; } .ds-more { animation-delay: .95s; }
  @keyframes ds-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .ds-head { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
  .ds-head h2 { font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
  .ds-n { font-size: .9rem; color: var(--rust); } .ds-n i { font-style: normal; color: var(--muted); }
  .ds-anim { margin: 22px 0 18px; padding: 30px; border-radius: 16px; background: var(--paper); min-height: 300px; display: flex; align-items: center; }
  .ds-anim > * { width: 100%; }
  .ds-cap { font-size: clamp(1.1rem, 1.8vw, 1.3rem); font-weight: 600; max-width: 60ch; line-height: 1.45; }
  .ds-lines { display: grid; gap: 8px; margin-top: 14px; max-width: 72ch; }
  .ds-lines p { display: grid; grid-template-columns: 28px 1fr; gap: 10px; align-items: start; color: var(--sec); font-size: .98rem; margin: 0; }
  .ds-ico { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: .8rem; color: #fff; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
  .ds-ico.ink { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
  .ds-more { margin-top: 14px; }
  .ds-more-b { all: unset; cursor: pointer; font-size: .86rem; font-weight: 600; color: var(--rust-deep); } .ds-more-b:hover { text-decoration: underline; } .ds-more-b:focus-visible { outline: 2px solid var(--rust); }
  .ds-more-t { margin-top: 10px; display: grid; gap: 8px; max-width: 70ch; animation: ds-in .4s var(--ease) both; } .ds-more-t p { margin: 0; color: var(--sec); }
  .ds-hold { position: absolute; left: 34px; right: 34px; bottom: 14px; height: 3px; border-radius: 2px; background: var(--rod); overflow: hidden; }
  .ds-hold i { display: block; height: 100%; background: var(--rust); transform-origin: left; animation: ds-hold ${HOLD}ms linear forwards; }
  @keyframes ds-hold { from { transform: scaleX(0); } to { transform: none; } }

  .ds-ctrl { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
  .ds-btn { all: unset; cursor: pointer; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: var(--ink);
    background: radial-gradient(circle at 34% 30%, #fff 0%, #f1ede8 45%, #d6cfc7 100%); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px; transition: transform .2s var(--spring); }
  .ds-btn:hover:not(:disabled) { transform: scale(1.08); } .ds-btn:disabled { opacity: .35; cursor: default; }
  .ds-btn:focus-visible { outline: 2px solid var(--rust); outline-offset: 3px; }
  .ds-btn.play { width: 56px; height: 56px; color: #fff; font-size: .9rem; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
  .ds-btn.play.on { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
  .ds-keys { margin-left: 8px; }
  .ds-end { margin-top: 26px; animation: ds-in .6s var(--ease) both; }
  @media (max-width: 640px) { .ds-stage { padding: 22px 20px 26px; } .ds-anim { padding: 18px; min-height: 0; } .ds-keys { display: none; } .ds-bead { width: 18px; height: 18px; margin-left: -9px; top: 18px; } .ds-bead.on { width: 24px; height: 24px; margin-left: -12px; top: 15px; } }
  @media (prefers-reduced-motion: reduce) { .ds-stage, .ds-stage > *, .ds-more-t, .ds-end { animation: none; } .ds-bead { transition: none; } }
`;
