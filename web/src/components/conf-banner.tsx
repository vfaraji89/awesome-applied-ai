"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { T } from "@/i18n/lang";
import { skills } from "@/data/framework";

/* Stage against job: for every skill, one rod for the share of conference talks about it and one for
   the share of AI job ads that ask for it. Plays through the skills on its own while on screen; touch a
   row to stop on it. */
export type Pair = { id: string; talks: number; ads: number };
const name = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

export function ConfBanner({ rows, talks, ads, tSum, aSum }: { rows: Pair[]; talks: number; ads: number; tSum: number; aSum: number }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.2 });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (held || !vis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % rows.length), 3000);
    return () => clearInterval(t);
  }, [held, vis, rows.length]);
  const pick = (k: number) => { setHeld(true); setI(k); };
  const max = Math.max(...rows.flatMap((r) => [r.talks, r.ads]), 1);
  const r = rows[i];
  // compared as share of attention, since ads name many more skills than talks do
  const ratio = r.ads ? (r.talks / tSum) / (r.ads / aSum) : 0;
  return (
    <div ref={ref} className="cb">
      <div className="cb-key count"><span><i className="cb-sw talk" /><T k="cb.talks" vars={{ n: talks.toLocaleString("en-US") }}>{"{n} conference talks"}</T></span><span><i className="cb-sw ad" /><T k="cb.ads" vars={{ n: ads.toLocaleString("en-US") }}>{"{n} AI job ads"}</T></span></div>
      <ul className="cb-rows">
        {rows.map((x, k) => (
          <li key={x.id}>
            <button type="button" className={k === i ? "on" : ""} onClick={() => pick(k)} onMouseEnter={() => pick(k)} aria-pressed={k === i}>
              <span className="cb-lab"><T k={`skill.${x.id}`}>{name(x.id)}</T></span>
              <span className="cb-rods">
                <span className="rodbar ink"><i style={{ width: `${(x.talks / max) * 100}%` }} /></span>
                <span className="rodbar"><i style={{ width: `${(x.ads / max) * 100}%` }} /></span>
              </span>
              <span className="cb-n count">{Math.round(x.talks)}<br />{Math.round(x.ads)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="cb-read" key={r.id} aria-live="polite">
        <span className="count"><T k="cb.k">on stage against in the job</T></span>
        <b className="cb-big"><T k={`skill.${r.id}`}>{name(r.id)}</T></b>
        <p className="cb-line">
          <T k="cb.line" vars={{ t: Math.round(r.talks), a: Math.round(r.ads) }}>{"{t}% of talks, {a}% of AI job ads."}</T>{" "}
          {ratio >= 1.25 ? <T k="cb.more" vars={{ x: ratio.toFixed(1) }}>{"On stage it gets {x}× the attention it gets in job ads."}</T>
            : ratio && ratio <= 0.8 ? <T k="cb.less" vars={{ x: (1 / ratio).toFixed(1) }}>{"Job ads give it {x}× the attention it gets on stage."}</T>
            : <T k="cb.even">Stage and job give it about the same attention.</T>}
        </p>
        <Link href={`/skills/${r.id}/`} className="cb-go"><T k="rb.s_open">Open the skill</T> →</Link>
      </div>
      <style>{`
        .cb { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 34px; align-items: start; }
        @media (max-width: 860px) { .cb { grid-template-columns: 1fr; } }
        .cb-key { grid-column: 1 / -1; display: flex; gap: 18px; flex-wrap: wrap; }
        .cb-key span { display: inline-flex; gap: 8px; align-items: center; }
        .cb-sw { width: 22px; height: 6px; border-radius: 3px; display: inline-block; } .cb-sw.talk { background: var(--ink); } .cb-sw.ad { background: var(--rust); }
        .cb-rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
        .cb-rows button { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) 34px; gap: 12px; align-items: center; padding: 6px 6px; border: 0; background: none; text-align: left; cursor: pointer; border-radius: 8px; font: inherit; color: inherit; }
        .cb-rows button:hover { background: var(--paper); }
        .cb-rows button.on .cb-lab { color: var(--ink); font-weight: 700; }
        .cb-lab { font-size: .82rem; color: var(--sec); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cb-rods { display: grid; gap: 5px; }
        .cb-rows button:not(.on) .rodbar > i { opacity: .55; }
        .cb-n { text-align: right; font-size: .66rem; line-height: 1.25; }
        .cb-read { animation: rise .5s var(--ease) both; min-height: 160px; }
        .cb-big { display: block; font-size: clamp(1.6rem, 3vw, 2.3rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.1; margin-top: 6px; }
        .cb-line { margin-top: 10px; color: var(--sec); max-width: 44ch; }
        .cb-go { display: inline-block; margin-top: 12px; font-weight: 700; color: var(--rust-deep); text-decoration: none; }
      `}</style>
    </div>
  );
}
