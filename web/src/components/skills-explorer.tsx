"use client";
import { useState } from "react";
import Link from "next/link";
import { LEVELS, skills, type FRole } from "@/data/framework";
import type { StackGroup } from "@/data/stack";

/* Pick a role: every skill is an abacus rod with four beads, and the red beads slide over to its level. */
export function SkillsExplorer({ roles, stack, layerNames }: { roles: FRole[]; stack: StackGroup[]; layerNames: Record<string, string> }) {
  const [id, setId] = useState(roles[0].id);
  const r = roles.find((x) => x.id === id) ?? roles[0];
  const logo = (name: string) => stack.flatMap((g) => g.tools).find((t) => t.name === name);
  const families = Array.from(new Set(roles.map((x) => x.family)));
  return (
    <div className="se">
      <div className="se-pick">
        {families.map((f) => (
          <div key={f} className="se-fam">
            <span className="kicker">{f}</span>
            <div className="chips">
              {roles.filter((x) => x.family === f).map((x) => (
                <button key={x.id} type="button" className={`chip${x.id === id ? " on" : ""}`} onClick={() => setId(x.id)} aria-pressed={x.id === id}>{x.name}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="se-card frame">
        <div className="se-top">
          <div key={r.id} className="se-left">
            <span className="kicker">{r.family}</span>
            <h2 style={{ marginTop: 8 }}>{r.name}<span className="dot">.</span></h2>
            <p className="lead" style={{ marginTop: 8, fontSize: "1.05rem" }}>{r.oneLine}</p>
            <div className="kicker" style={{ marginTop: 18 }}>Job titles you will see</div>
            <div className="chips" style={{ marginTop: 8 }}>{r.titles.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <div className="kicker" style={{ marginTop: 18 }}>Core tasks</div>
            <ul className="se-list">{r.tasks.map((t) => <li key={t}><span className="bead" />{t}</li>)}</ul>
            <div className="kicker" style={{ marginTop: 18 }}>Stack</div>
            <div className="se-stack">
              {r.stack.map((n) => {
                const t = logo(n);
                return <span key={n} className="se-tool">{t && <span className="se-ball" dangerouslySetInnerHTML={{ __html: t.svg }} />}{n}</span>;
              })}
            </div>
            <div className="kicker" style={{ marginTop: 18 }}>Layers</div>
            <div className="chips" style={{ marginTop: 8 }}>{r.layers.map((l) => <Link key={l} href={`/architecture/#${l}`} className="chip">{layerNames[l]}</Link>)}</div>
          </div>
          <div>
            <div className="kicker">Skills, by level</div>
            <ul className="se-skills">
              {skills.map((s, i) => {
                const lv = r.levels[s.id] ?? 0;
                return (
                  <li key={s.id} title={`${s.name}: ${LEVELS[lv]}. ${s.what}`}>
                    <span className="se-sname">{s.name}</span>
                    <span className="se-rod" aria-label={`${LEVELS[lv]}`}>
                      {[0, 1, 2, 3].map((b) => (
                        <span key={b} className={`se-b${b < lv ? " on" : ""}`} style={{ left: b < lv ? `${b * 18}px` : `calc(100% - ${(4 - b) * 18}px)`, transitionDelay: `${i * 25 + b * 30}ms` }} />
                      ))}
                    </span>
                    <span className="se-lv mono">{LEVELS[lv]}</span>
                  </li>
                );
              })}
            </ul>
            <div className="kicker" style={{ marginTop: 22 }}>How it grows</div>
            <ol className="se-grow">
              {r.growth.map((g) => <li key={g.level}><span className="bead white" /><b>{g.level}</b><span className="muted">{g.scope}</span></li>)}
            </ol>
          </div>
        </div>
      </div>
      <style>{`
        .se-pick { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); }
        .se-fam { display: flex; flex-direction: column; gap: 8px; }
        .se-pick .chip { cursor: pointer; font: inherit; font-size: .85rem; }
        .se-card { margin-top: 24px; } .se-left { animation: rise .5s var(--ease) both; }
        .se-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 36px; }
        @media (max-width: 860px) { .se-top { grid-template-columns: 1fr; } }
        .se-list { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; }
        .se-list li { display: flex; gap: 10px; align-items: center; } .se-list .bead { width: 10px; height: 10px; }
        .se-stack { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .se-tool { display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px 4px 4px; border-radius: 999px; border: 1px solid var(--line-strong); font-size: .85rem; }
        .se-ball { width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #1c1c1e; background: radial-gradient(circle at 34% 28%, #fff, #f6f3f0 40%, #dcd6d0); }
        .se-ball svg { width: 14px; height: 14px; }
        .se-skills { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 9px; }
        .se-skills li { display: grid; grid-template-columns: minmax(0, 1fr) 150px 74px; gap: 12px; align-items: center; font-size: .92rem; }
        .se-rod { position: relative; height: 16px; } .se-rod::before { content: ""; position: absolute; left: 0; right: 0; top: 6px; height: 4px; border-radius: 4px; background: var(--rod); }
        .se-b { position: absolute; top: 0; width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); transition: left .7s var(--spring), background .4s; }
        .se-b.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .se-lv { font-size: .72rem; color: var(--muted); }
        .se-grow { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; position: relative; }
        .se-grow li { display: grid; grid-template-columns: 14px 80px 1fr; gap: 10px; align-items: center; font-size: .92rem; }
        @media (max-width: 480px) { .se-skills li { grid-template-columns: minmax(0, 1fr) 110px; } .se-lv { display: none; } }
      `}</style>
    </div>
  );
}
