"use client";
import { useMemo, useState } from "react";
import type { Field, Term } from "@/lib/types";

/* Flip cards: the plain meaning on the front, the deeper answer and the interview question on the back. */
export function JargonBrowser({ terms, fields }: { terms: Term[]; fields: Field[] }) {
  const [q, setQ] = useState("");
  const [field, setField] = useState("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return terms.filter((t) => (field === "all" || t.field === field) && (!s || [t.term, t.short, ...(t.also ?? []), ...t.tags].join(" ").toLowerCase().includes(s)));
  }, [q, field, terms]);
  return (
    <div>
      <div className="jb-bar">
        <input className="field" type="search" placeholder={`Search ${terms.length} terms: KV cache, RAG, eval, MCP…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jargon" />
        <div className="chips">
          <button type="button" className={`chip${field === "all" ? " on" : ""}`} onClick={() => setField("all")}>All <span className="count">{terms.length}</span></button>
          {fields.map((f) => (
            <button key={f.id} type="button" className={`chip${field === f.id ? " on" : ""}`} onClick={() => setField(f.id)}>
              {f.name} <span className="count">{terms.filter((t) => t.field === f.id).length}</span>
            </button>
          ))}
        </div>
      </div>
      {field !== "all" && <p className="lead" style={{ margin: "18px 0 0" }}>{fields.find((f) => f.id === field)?.intro}</p>}
      <p className="count" style={{ margin: "18px 0 14px" }}>{hits.length} terms · tap a card to turn it over</p>
      <div className="grid grid-3">
        {hits.map((t, i) => {
          const on = !!open[t.id];
          return (
            <button key={t.id} id={t.id} type="button" className={`jb-card${on ? " flipped" : ""}`} style={{ ["--i" as string]: Math.min(i, 12) }} onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))} aria-pressed={on}>
              <span className="jb-inner">
                <span className="jb-face jb-front frame">
                  <span className="kicker">{fields.find((f) => f.id === t.field)?.name}</span>
                  <b className="jb-term">{t.term}<span className="dot">.</span></b>
                  <span className="muted">{t.short}</span>
                  {t.also && <span className="count">also: {t.also.join(", ")}</span>}
                </span>
                <span className="jb-face jb-back frame">
                  <span className="kicker">Go deeper</span>
                  <span>{t.detail}</span>
                  {t.asked && <span className="jb-asked"><span className="count">Asked as</span> “{t.asked}”</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <style>{`
        .jb-bar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 64px; z-index: 5; background: var(--bg); padding: 12px 0; }
        .jb-bar .chip { cursor: pointer; font: inherit; font-size: .82rem; }
        .jb-card { all: unset; display: block; cursor: pointer; perspective: 1400px; min-height: 270px; animation: rise .55s var(--ease) both; animation-delay: calc(var(--i) * 35ms); }
        .jb-card:focus-visible { outline: 2px solid var(--rust); outline-offset: 4px; border-radius: 14px; }
        .jb-inner { position: relative; display: grid; height: 100%; min-height: 270px; transform-style: preserve-3d; transition: transform .7s var(--spring); }
        .jb-card.flipped .jb-inner { transform: rotateY(180deg); }
        .jb-face { grid-area: 1 / 1; display: flex !important; flex-direction: column; gap: 10px; backface-visibility: hidden; -webkit-backface-visibility: hidden; font-size: .95rem; line-height: 1.5; }
        .jb-back { transform: rotateY(180deg); background-color: var(--paper); }
        .jb-term { font-size: 1.45rem; font-weight: 800; letter-spacing: -.03em; }
        .jb-asked { font-style: italic; color: var(--ink); }
        @media (max-width: 640px) { .jb-bar { top: 96px; } }
      `}</style>
    </div>
  );
}
