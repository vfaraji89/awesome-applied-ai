"use client";
import { useState } from "react";
import type { StackGroup } from "@/data/stack";

/* The daily stack as an abacus: one rod per group, post to post, a white bead per tool.
   Tap a bead: it slides along its rod and the card underneath says what it is and where it is used. */
export function StackRows({ groups }: { groups: StackGroup[] }) {
  const [sel, setSel] = useState<{ g: number; t: number }>({ g: 0, t: 0 });
  const tool = groups[sel.g].tools[sel.t];
  return (
    <div className="sr">
      <div className="sr-frame">
        {groups.map((g, gi) => (
          <div key={g.id} className="sr-row">
            <span className="sr-label kicker">{g.name}</span>
            <ul className="sr-beads">
              {g.tools.map((t, ti) => {
                const on = sel.g === gi && sel.t === ti;
                return (
                  <li key={t.name} style={{ ["--k" as string]: gi * 11 + ti }}>
                    <button type="button" className={`sr-bead${on ? " on" : ""}`} onClick={() => setSel({ g: gi, t: ti })} aria-pressed={on} aria-label={t.name}>
                      <span className="sr-ball" dangerouslySetInnerHTML={{ __html: t.svg }} />
                      <span className="sr-name">{t.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div key={tool.name} className="sr-card frame">
        <span className="kicker">{groups[sel.g].name}</span>
        <h3 className="sr-title"><span className="sr-ball sm" dangerouslySetInnerHTML={{ __html: tool.svg }} />{tool.name}<span className="dot">.</span></h3>
        <p>{tool.what}</p>
        {tool.used && <p className="sr-used"><span className="bead" />Where I use it: <b>{tool.used}</b></p>}
        <a href={tool.url} target="_blank" rel="noreferrer" className="count">{tool.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗</a>
      </div>
      <style>{`
        .sr-frame { position: relative; padding: 8px 26px; border-radius: 4px; background-image: var(--rod), var(--rod); background-size: 100% 3px, 100% 3px; background-position: center top, center bottom; background-repeat: no-repeat; }
        .sr-frame::before, .sr-frame::after { content: ""; position: absolute; top: -5px; bottom: -5px; width: 7px; border-radius: 4px; background: var(--dowel); pointer-events: none; } .sr-frame::before { left: -4px; } .sr-frame::after { right: -4px; }
        .sr-row { position: relative; display: grid; grid-template-columns: 170px 1fr; gap: 12px; padding: 14px 0; }
        .sr-row + .sr-row { border-top: 1px dashed var(--line); }
        .sr-row::before { content: ""; position: absolute; left: -19px; right: -19px; top: calc(14px + 20px); height: 4px; margin-top: -2px; border-radius: 4px; background: var(--rod); }
        .sr-label { position: relative; z-index: 1; justify-self: start; align-self: start; margin-top: 12px; background: var(--bg); padding-right: 10px; }
        .sr-beads { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 2px; position: relative; z-index: 1; }
        .sr-beads li { animation: sr-drop .7s var(--spring) both; animation-delay: calc(var(--k) * 30ms); }
        @keyframes sr-drop { from { transform: translateY(-10px); opacity: 0; } to { transform: none; opacity: 1; } }
        .sr-bead { all: unset; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; width: 78px; }
        .sr-ball { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #1c1c1e; background: radial-gradient(circle at 34% 28%, #fff 0%, #f6f3f0 40%, #dcd6d0 100%);  transition: transform .5s var(--spring); }
        .sr-ball svg { width: 19px; height: 19px; }
        .sr-ball.sm { width: 34px; height: 34px; margin-right: 10px; vertical-align: -8px; } .sr-ball.sm svg { width: 17px; height: 17px; }
        .sr-name { font-family: var(--font-mono), monospace; font-size: .62rem; line-height: 1.25; color: var(--sec); text-align: center; }
        .sr-bead:hover .sr-ball { transform: translateX(6px) rotate(20deg); }
        .sr-bead.on .sr-ball { transform: translateX(8px); outline: 3px solid var(--rust); outline-offset: 0; }
        .sr-bead.on .sr-name { color: var(--rust-deep); }
        .sr-bead:focus-visible .sr-ball { outline: 2px solid var(--rust); outline-offset: 3px; }
        .sr-card { margin-top: 18px; display: flex; flex-direction: column; gap: 8px; animation: rise .5s var(--ease) both; }
        .sr-title { font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; }
        .sr-used { display: flex; align-items: center; gap: 10px; } .sr-used .bead { width: 10px; height: 10px; }
        .sr-card a { text-decoration: none; } .sr-card a:hover { color: var(--rust-deep); }
        @media (max-width: 760px) { .sr-row { grid-template-columns: 1fr; } .sr-row::before { display: none; } .sr-label { margin-top: 0; } .sr-bead { width: 25%; min-width: 72px; } .sr-beads { gap: 10px 0; } }
      `}</style>
    </div>
  );
}
