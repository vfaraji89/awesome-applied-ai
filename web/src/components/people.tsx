"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { T, useT } from "@/i18n/lang";
import { skills } from "@/data/framework";

/* The people directory: an abacus of skills on top (a rod per skill, a bead per person whose talks
   name it; touch a rod to filter), a search, and a card per person with their monogram bead. */
export type Person = { id: string; name: string; role: string | null; org: string | null; initials: string; talkCount: number; years: string[]; skills: string[]; topics: string[]; products: { id: string; name: string }[] };
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

export function Monogram({ p, size = 56 }: { p: Pick<Person, "initials" | "talkCount" | "name">; size?: number }) {
  return (
    <span className="mono-bead" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">
      {p.initials}
      <style>{`
        .mono-bead { flex: none; display: inline-grid; place-items: center; border-radius: 50%; color: #fff; font-weight: 800; letter-spacing: .02em;
          background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%);  }
      `}</style>
    </span>
  );
}

export function YearRod({ years, span }: { years: string[]; span: string[] }) {
  return (
    <span className="yr" aria-label={`Spoke in ${years.join(", ")}`}>
      {span.map((y) => <i key={y} className={years.includes(y) ? "on" : ""} title={y} />)}
      <style>{`
        .yr { position: relative; display: inline-flex; gap: 10px; align-items: center; padding: 0 4px; }
        .yr::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; background: var(--rod); }
        .yr i { position: relative; width: 9px; height: 9px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px; }
        .yr i.on { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
      `}</style>
    </span>
  );
}

export function PeopleBrowser({ people, span }: { people: Person[]; span: string[] }) {
  const t = useT();
  const [skill, setSkill] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const counts = useMemo(() => skills.map((s) => ({ id: s.id, n: people.filter((p) => p.skills.includes(s.id)).length })).filter((x) => x.n).sort((a, b) => b.n - a.n), [people]);
  const max = Math.max(1, ...counts.map((c) => c.n));
  const list = people.filter((p) => (!skill || p.skills.includes(skill)) && (!q || `${p.name} ${p.org ?? ""} ${p.role ?? ""} ${p.topics.join(" ")}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="pb">
      <div className="frame pb-abacus">
        <span className="kicker"><T k="pb.k">Who talks about what</T></span>
        <ul>
          {counts.map((c) => (
            <li key={c.id}>
              <button type="button" className={skill === c.id ? "on" : ""} onClick={() => setSkill(skill === c.id ? null : c.id)} aria-pressed={skill === c.id}>
                <span className="pb-lab"><T k={`skill.${c.id}`}>{skillName(c.id)}</T></span>
                <span className="pb-rod">{Array.from({ length: c.n }, (_, k) => <i key={k} style={{ ["--k" as string]: k, left: `${(k / max) * 100}%` }} />)}</span>
                <span className="count">{c.n}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="count"><T k="pb.hint">A bead per person whose talks name the skill. Touch a rod to see them.</T></p>
      </div>
      <div className="pb-bar">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("pb.search", "Search a name, company or topic")} aria-label={t("pb.search", "Search a name, company or topic")} />
        <span className="count"><T k="pb.n" vars={{ n: list.length, of: people.length }}>{"{n} of {of}"}</T>{skill && <> · <button type="button" className="pb-clear" onClick={() => setSkill(null)}><T k={`skill.${skill}`}>{skillName(skill)}</T> ×</button></>}</span>
      </div>
      <ul className="pb-grid">
        {list.map((p) => (
          <li key={p.id}>
            <Link href={`/people/${p.id}/`} className="frame pb-card">
              <div className="pb-top">
                <Monogram p={p} />
                <div className="pb-who">
                  <b>{p.name}</b>
                  <span className="muted">{[p.role, p.org].filter(Boolean).join(" · ")}</span>
                </div>
              </div>
              <div className="pb-sk">{p.skills.slice(0, 3).map((s) => <span key={s} className="chip"><T k={`skill.${s}`}>{skillName(s)}</T></span>)}</div>
              <div className="pb-foot"><YearRod years={p.years} span={span} /><span className="count"><T k="pb.talks" vars={{ n: p.talkCount }}>{"{n} talks"}</T></span></div>
            </Link>
          </li>
        ))}
      </ul>
      <style>{`
        .pb-abacus ul { list-style: none; margin: 12px 0 8px; padding: 0; display: grid; gap: 2px; }
        .pb-abacus button { width: 100%; display: grid; grid-template-columns: minmax(0, 190px) minmax(0, 1fr) 30px; gap: 14px; align-items: center; padding: 5px 6px; border: 0; background: none; cursor: pointer; border-radius: 8px; font: inherit; color: inherit; text-align: left; }
        .pb-abacus button:hover, .pb-abacus button.on { background: var(--paper); }
        .pb-lab { font-size: .82rem; color: var(--sec); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-abacus button.on .pb-lab { color: var(--ink); font-weight: 700; }
        .pb-rod { position: relative; height: 14px; } .pb-rod::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 3px; margin-top: -1.5px; border-radius: 2px; background: var(--rod); }
        .pb-rod i { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -2px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); animation: pb-in .5s var(--spring) both; animation-delay: calc(var(--k) * 18ms); }
        .pb-abacus button.on .pb-rod i { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        @keyframes pb-in { from { transform: translateX(-12px); opacity: 0; } to { transform: none; opacity: 1; } }
        .pb-bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin: 24px 0 14px; }
        .pb-bar input { flex: 1 1 260px; max-width: 420px; padding: 10px 14px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--card); font: inherit; color: var(--ink); }
        .pb-clear { border: 0; background: var(--paper); border-radius: 999px; padding: 2px 8px; font: inherit; cursor: pointer; color: var(--rust-deep); }
        .pb-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 14px; }
        .pb-card { display: grid; gap: 12px; height: 100%; padding: 18px 20px; }
        .pb-card:hover b { color: var(--rust-deep); }
        .pb-top { display: flex; gap: 14px; align-items: center; } .pb-who { display: grid; gap: 2px; min-width: 0; } .pb-who b { font-size: 1.05rem; } .pb-who .muted { font-size: .84rem; }
        .pb-sk { display: flex; flex-wrap: wrap; gap: 6px; } .pb-sk .chip { font-size: .72rem; }
        .pb-foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        @media (prefers-reduced-motion: reduce) { .pb-rod i { animation: none; } }
      `}</style>
    </div>
  );
}
