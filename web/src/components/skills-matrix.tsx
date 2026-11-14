"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { T } from "@/i18n/lang";
import { fRoles, skills, LEVELS } from "@/data/framework";
import { pickRole, useRolePick } from "@/components/role-banners";

/* The whole matrix, interactive: pick a role to light its column, pick a second to compare,
   and the rows where they differ show by how much. Filter the columns by family. */
const FAMS = Array.from(new Set(fRoles.map((r) => r.family)));

export function SkillsMatrix() {
  const [a, setA] = useState<string>(fRoles[0].id);
  const [b, setB] = useState<string | null>(null);
  const [fam, setFam] = useState<string | null>(null);
  useRolePick(useCallback((id: string) => setA(id), []));
  const cols = fRoles.filter((r) => !fam || r.family === fam || r.id === a || r.id === b);
  const ra = fRoles.find((r) => r.id === a)!;
  const rb = b ? fRoles.find((r) => r.id === b) : null;
  const choose = (id: string) => {
    if (id === a) return;
    setA(id);
    if (id === b) setB(null);
    pickRole(id);
  };
  const diffs = rb ? skills.map((s) => ({ s, d: (rb.levels[s.id] ?? 0) - (ra.levels[s.id] ?? 0) })).filter((x) => x.d !== 0) : [];
  return (
    <div className="smx">
      <div className="smx-bar">
        <div>
          <span className="kicker"><T k="smx.fam">Families</T></span>
          <div className="chips">
            <button type="button" className={`chip${!fam ? " on" : ""}`} onClick={() => setFam(null)}><T k="ui.all">All</T></button>
            {FAMS.map((f) => <button key={f} type="button" className={`chip${fam === f ? " on" : ""}`} onClick={() => setFam(f)}><T k={`fam.${f.toLowerCase()}`}>{f}</T></button>)}
          </div>
        </div>
        <div>
          <span className="kicker"><T k="smx.compare" vars={{ r: ra.name }}>{"Compare {r} with"}</T></span>
          <div className="chips">
            <button type="button" className={`chip${!b ? " on" : ""}`} onClick={() => setB(null)}><T k="smx.none">Nobody</T></button>
            {fRoles.filter((r) => r.id !== a).map((r) => <button key={r.id} type="button" className={`chip${b === r.id ? " on" : ""}`} onClick={() => setB(r.id)}>{r.name}</button>)}
          </div>
        </div>
      </div>

      {rb && (
        <p className="smx-sum" key={`${a}-${b}`}>
          {diffs.length ? (
            <T k="smx.sum" vars={{ a: ra.name, b: rb.name, n: diffs.length }}>{"From {a} to {b}, {n} skills change level:"}</T>
          ) : <T k="smx.same" vars={{ a: ra.name, b: rb.name }}>{"{a} and {b} ask for the same levels."}</T>}{" "}
          {diffs.map(({ s, d }, j) => <span key={s.id} className={`smx-d ${d > 0 ? "up" : "down"}`}>{j ? " " : ""}<T k={`skill.${s.id}`}>{s.name}</T> {d > 0 ? `+${d}` : d}</span>)}
        </p>
      )}

      <div className="mx-wrap">
        <table className="mx">
          <thead>
            <tr>
              <th><T k="rl.skill">Skill</T></th>
              {cols.map((r) => (
                <th key={r.id} className={r.id === a ? "a" : r.id === b ? "b" : ""}>
                  <button type="button" onClick={() => choose(r.id)} aria-pressed={r.id === a}><span>{r.name}</span></button>
                </th>
              ))}
              {rb && <th className="b"><T k="smx.diff">Change</T></th>}
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => {
              const d = rb ? (rb.levels[s.id] ?? 0) - (ra.levels[s.id] ?? 0) : 0;
              return (
                <tr key={s.id} className={d ? "dif" : ""}>
                  <th scope="row"><Link href={`/skills/${s.id}/`}><b><T k={`skill.${s.id}`}>{s.name}</T></b></Link><span className="muted"><T k={`skillwhat.${s.id}`}>{s.what}</T></span></th>
                  {cols.map((r) => {
                    const lv = r.levels[s.id] ?? 0;
                    return (
                      <td key={r.id} className={r.id === a ? "a" : r.id === b ? "b" : ""} title={`${r.name} · ${s.name}: ${LEVELS[lv]}`}>
                        <span className="mx-beads">{[0, 1, 2, 3].map((k) => <i key={k} className={k < lv ? "on" : ""} style={{ ["--k" as string]: k }} />)}</span>
                      </td>
                    );
                  })}
                  {rb && <td className="b"><span className={`smx-d ${d > 0 ? "up" : d < 0 ? "down" : ""}`}>{d > 0 ? `+${d}` : d || "·"}</span></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="count" style={{ marginTop: 12 }}><T k="smx.legend" vars={{ l: LEVELS.slice(1).join(", ").toLowerCase() }}>{"Beads: {l}. Pick a column to light it; pick a skill to open it."}</T></p>
      <style>{`
        .smx-bar { display: grid; gap: 16px; }
        .smx-bar .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .smx-bar button.chip { cursor: pointer; }
        .smx-sum { margin-top: 18px; color: var(--sec); animation: rise .5s var(--ease) both; }
        .smx-d { font-family: var(--font-mono), monospace; font-size: .8rem; white-space: nowrap; }
        .smx-d.up { color: var(--rust-deep); } .smx-d.down { color: var(--ink); }
        .smx-sum .smx-d { display: inline-block; padding: 2px 8px; margin: 3px 2px 0 0; border-radius: 999px; background: var(--paper); }
        .mx-wrap { margin-top: 18px; overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; }
        .mx { border-collapse: collapse; width: 100%; min-width: 980px; font-size: .88rem; }
        .mx th, .mx td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; transition: background .3s; }
        .mx thead th { font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .04em; color: var(--sec); font-weight: 400; vertical-align: bottom; }
        .mx thead button { border: 0; background: none; padding: 0; font: inherit; color: inherit; text-align: left; cursor: pointer; }
        .mx thead button:hover { color: var(--rust-deep); }
        .mx th.a, .mx td.a { background: color-mix(in srgb, var(--rust) 7%, transparent); }
        .mx thead th.a { color: var(--rust-deep); font-weight: 700; }
        .mx th.b, .mx td.b { background: var(--paper); }
        .mx tbody tr:hover th, .mx tbody tr:hover td { background: color-mix(in srgb, var(--ink) 3%, transparent); }
        .mx tr.dif th b { color: var(--rust-deep); }
        .mx tbody th { display: flex; flex-direction: column; gap: 2px; font-weight: 400; min-width: 220px; } .mx tbody th a { text-decoration: none; color: inherit; } .mx tbody th .muted { font-size: .78rem; }
        .mx-beads { display: inline-flex; gap: 3px; } .mx-beads i { width: 10px; height: 10px; border-radius: 50%; background: var(--bead-white); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px; transition: background .35s calc(var(--k) * 60ms), transform .35s var(--spring) calc(var(--k) * 60ms); }
        .mx-beads i.on { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
        td.a .mx-beads i.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); transform: scale(1.15); }
      `}</style>
    </div>
  );
}
