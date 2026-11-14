"use client";
import { useCallback, useEffect, useState } from "react";
import { pickRole, useRolePick } from "@/components/role-banners";
import Link from "next/link";
import { T } from "@/i18n/lang";
import { LEVELS, skills, type FRole } from "@/data/framework";
import type { StackGroup } from "@/data/stack";

/* Pick a role: every skill is an abacus rod with four beads, and the red beads slide over to its level. */
export function SkillsExplorer({ roles, stack, layerNames }: { roles: FRole[]; stack: StackGroup[]; layerNames: Record<string, string> }) {
  const [id, setId] = useState(roles[0].id);
  useRolePick(useCallback((x: string) => setId(x), []));
  useEffect(() => { const q = new URLSearchParams(location.search).get("role"); if (q && roles.some((r) => r.id === q)) pickRole(q); }, [roles]);
  const r = roles.find((x) => x.id === id) ?? roles[0];
  const logo = (name: string) => stack.flatMap((g) => g.tools).find((t) => t.name === name);
  const families = Array.from(new Set(roles.map((x) => x.family)));
  return (
    <div className="se">
      <div className="se-pick">
        {families.map((f) => (
          <div key={f} className="se-fam">
            <span className="kicker"><T k={`fam.${f.toLowerCase()}`}>{f}</T></span>
            <div className="chips">
              {roles.filter((x) => x.family === f).map((x) => (
                <button key={x.id} type="button" className={`chip${x.id === id ? " on" : ""}`} onClick={() => { setId(x.id); pickRole(x.id); }} aria-pressed={x.id === id}>{x.name}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="se-card frame">
        <div className="se-top">
          <div key={r.id} className="se-left">
            <span className="kicker"><T k={`fam.${r.family.toLowerCase()}`}>{r.family}</T></span>
            <h2 style={{ marginTop: 8 }}>{r.name}<span className="dot">.</span></h2>
            <p className="lead" style={{ marginTop: 8, fontSize: "1.05rem" }}><T k={`role.${r.id}.line`}>{r.oneLine}</T></p>
            <div className="kicker" style={{ marginTop: 18 }}><T k="se.titles">Job titles you will see</T></div>
            <div className="chips" style={{ marginTop: 8 }}>{r.titles.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <div className="kicker" style={{ marginTop: 18 }}><T k="se.tasks">Core tasks</T></div>
            <ul className="se-list">{r.tasks.map((t, i) => <li key={t}><span className="bead" /><T k={`role.${r.id}.task.${i}`}>{t}</T></li>)}</ul>
            <div className="kicker" style={{ marginTop: 18 }}><T k="se.stack">Stack</T></div>
            <div className="se-stack">
              {r.stack.map((n) => {
                const t = logo(n);
                return <span key={n} className="se-tool">{t && <span className="se-ball" dangerouslySetInnerHTML={{ __html: t.svg }} />}{n}</span>;
              })}
            </div>
            <div className="kicker" style={{ marginTop: 18 }}><T k="se.layers">Layers</T></div>
            <div className="chips" style={{ marginTop: 8 }}>{r.layers.map((l) => <Link key={l} href={`/architecture/#${l}`} className="chip"><T k={`layer.${l}`}>{layerNames[l]}</T></Link>)}</div>
          </div>
          <div>
            <div className="kicker"><T k="se.skills">Skills, by level</T></div>
            <ul className="se-skills">
              {skills.map((s, i) => {
                const lv = r.levels[s.id] ?? 0;
                return (
                  <li key={s.id} title={`${s.name}: ${LEVELS[lv]}. ${s.what}`}>
                    <span className="se-sname"><T k={`skill.${s.id}`}>{s.name}</T></span>
                    <span className="se-rod" aria-label={`${LEVELS[lv]}`}>
                      {[0, 1, 2, 3].map((b) => (
                        <span key={b} className={`se-b${b < lv ? " on" : ""}`} style={{ left: b < lv ? `${b * 18}px` : `calc(100% - ${(4 - b) * 18}px)`, transitionDelay: `${i * 25 + b * 30}ms` }} />
                      ))}
                    </span>
                    <span className="se-lv mono"><T k={`lv.${lv}`}>{LEVELS[lv]}</T></span>
                  </li>
                );
              })}
            </ul>
            <div className="kicker" style={{ marginTop: 22 }}><T k="ar.grows">How it grows</T></div>
            <ol className="se-grow">
              {r.growth.map((g, i) => <li key={g.level}><span className="bead white" /><b><T k={`lvl.${g.level.toLowerCase()}`}>{g.level}</T></b><span className="muted"><T k={`role.${r.id}.grow.${i}`}>{g.scope}</T></span></li>)}
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
        .se-b { position: absolute; top: 0; width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); outline: 1px solid rgba(0,0,0,.06); outline-offset: -1px; transition: left .7s var(--spring), background .4s; }
        .se-b.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .se-lv { font-size: .72rem; color: var(--muted); }
        .se-grow { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; position: relative; }
        .se-grow li { display: grid; grid-template-columns: 14px 80px 1fr; gap: 10px; align-items: center; font-size: .92rem; }
        @media (max-width: 480px) { .se-skills li { grid-template-columns: minmax(0, 1fr) 110px; } .se-lv { display: none; } }
      `}</style>
    </div>
  );
}
