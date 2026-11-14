"use client";
import { useState } from "react";
import Link from "next/link";
import { T, useT } from "@/i18n/lang";

/* The companies directory: who is hiring now on top as an abacus (a rod per company, its active AI roles
   as the bead's place; touch one to read what its ads ask for), then filters and a card per company. */
export type Company = { id: string; name: string; lab: boolean; initials: string; hiring: { open: number; roles: { id: string; share: number }[]; skills: { id: string; share: number }[] } | null; products: { id: string; name: string }[]; stage: { speakers: number; talks: number } | null; people: string[] };

export function Badge({ c, size = 52 }: { c: Pick<Company, "initials" | "lab">; size?: number }) {
  return (
    <span className={`co-badge${c.lab ? " lab" : ""}`} style={{ width: size, height: size, fontSize: size * 0.32 }} aria-hidden="true">
      {c.initials}
      <style>{`
        .co-badge { flex: none; display: inline-grid; place-items: center; border-radius: 14px; color: #fff; font-weight: 800; letter-spacing: .02em;
          background: radial-gradient(circle at 30% 25%, #6a6a70 0%, #1c1c1e 55%, #000 100%);  }
        .co-badge.lab { background: radial-gradient(circle at 30% 25%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); }
      `}</style>
    </span>
  );
}

const FILTERS = [
  { id: "all", k: "cp.f_all", en: "All" },
  { id: "lab", k: "cp.f_lab", en: "AI labs" },
  { id: "hiring", k: "cp.f_hiring", en: "Hiring now" },
  { id: "stage", k: "cp.f_stage", en: "On stage" },
  { id: "map", k: "cp.f_map", en: "On the tool map" },
] as const;

export function CompaniesBrowser({ companies, skillNames, roleNames }: { companies: Company[]; skillNames: Record<string, string>; roleNames: Record<string, string> }) {
  const t = useT();
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const hiring = companies.filter((c) => c.hiring).sort((a, b) => b.hiring!.open - a.hiring!.open).slice(0, 10);
  const max = Math.max(1, ...hiring.map((c) => c.hiring!.open));
  const [pick, setPick] = useState(0);
  const cur = hiring[pick];
  const list = companies.filter((c) => (f === "all" || (f === "lab" && c.lab) || (f === "hiring" && c.hiring) || (f === "stage" && c.stage) || (f === "map" && c.products.length)) && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="cpb">
      {cur && (
        <div className="frame cpb-ban">
          <ul className="cpb-rods">
            {hiring.map((c, k) => (
              <li key={c.id}>
                <button type="button" className={k === pick ? "on" : ""} onClick={() => setPick(k)} onMouseEnter={() => setPick(k)}>
                  <span className="cpb-lab">{c.name}</span>
                  <span className={`rodbar${k === pick ? "" : " ink"}`}><i style={{ width: `${(c.hiring!.open / max) * 100}%` }} /></span>
                  <span className="count">{c.hiring!.open}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="cpb-read" key={cur.id}>
            <span className="count"><T k="cp.open_k">Active AI roles on their career page now</T></span>
            <b className="cpb-big"><span className="cpb-num">{cur.hiring!.open}</span> {cur.name}</b>
            {cur.hiring!.roles.length > 0 && <p className="cpb-line"><T k="cp.mostly">Mostly</T> {cur.hiring!.roles.slice(0, 2).map((r) => `${roleNames[r.id] ?? r.id} (${r.share}%)`).join(", ")}.</p>}
            {cur.hiring!.skills.length > 0 && <p className="cpb-line"><T k="cp.asks">Their ads ask for</T> {cur.hiring!.skills.slice(0, 3).map((s) => `${(skillNames[s.id] ?? s.id).toLowerCase()} ${s.share}%`).join(", ")}.</p>}
            <Link href={`/companies/${cur.id}/`} className="cpb-go"><T k="cp.open">Open the company</T> →</Link>
          </div>
        </div>
      )}
      <div className="cpb-bar">
        <div className="cpb-f">{FILTERS.map((x) => <button key={x.id} type="button" className={`chip${f === x.id ? " on" : ""}`} onClick={() => setF(x.id)}><T k={x.k}>{x.en}</T></button>)}</div>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("cp.search", "Search a company")} aria-label={t("cp.search", "Search a company")} />
      </div>
      <ul className="cpb-grid">
        {list.map((c) => (
          <li key={c.id}>
            <Link href={`/companies/${c.id}/`} className="frame cpb-card">
              <div className="cpb-top"><Badge c={c} /><div><b>{c.name}</b>{c.lab && <span className="cpb-tag"><T k="cp.lab">AI lab</T></span>}</div></div>
              <dl className="cpb-stats">
                <div><dt className="count"><T k="cp.s_open">active AI roles</T></dt><dd>{c.hiring?.open ?? "–"}</dd></div>
                <div><dt className="count"><T k="cp.s_talks">talks on stage</T></dt><dd>{c.stage?.talks ?? "–"}</dd></div>
                <div><dt className="count"><T k="cp.s_map">on the map</T></dt><dd>{c.products.length || "–"}</dd></div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>
      <style>{`
        .cpb-ban { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 34px; padding: 26px 28px; }
        @media (max-width: 860px) { .cpb-ban { grid-template-columns: 1fr; } }
        .cpb-rods { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
        .cpb-rods button { width: 100%; display: grid; grid-template-columns: minmax(0, 150px) minmax(0, 1fr) 36px; gap: 12px; align-items: center; padding: 6px; border: 0; background: none; cursor: pointer; border-radius: 8px; font: inherit; color: inherit; text-align: left; }
        .cpb-rods button:hover { background: var(--paper); } .cpb-rods button.on .cpb-lab { color: var(--ink); font-weight: 700; }
        .cpb-lab { font-size: .84rem; color: var(--sec); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cpb-rods .count { text-align: right; }
        .cpb-read { animation: rise .5s var(--ease) both; }
        .cpb-big { display: block; font-size: clamp(1.6rem, 3vw, 2.3rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.1; margin-top: 6px; } .cpb-num { color: var(--rust); }
        .cpb-line { margin-top: 8px; color: var(--sec); }
        .cpb-go { display: inline-block; margin-top: 12px; font-weight: 700; color: var(--rust-deep); text-decoration: none; }
        .cpb-bar { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; margin: 24px 0 14px; }
        .cpb-f { display: flex; flex-wrap: wrap; gap: 6px; } .cpb-f .chip { cursor: pointer; font: inherit; font-size: .8rem; }
        .cpb-bar input { flex: 0 1 300px; padding: 9px 14px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--card); font: inherit; color: var(--ink); }
        .cpb-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 14px; }
        .cpb-card { display: grid; gap: 14px; height: 100%; padding: 18px 20px; } .cpb-card:hover b { color: var(--rust-deep); }
        .cpb-top { display: flex; gap: 14px; align-items: center; } .cpb-top b { display: block; font-size: 1.05rem; }
        .cpb-tag { display: inline-block; margin-top: 3px; font: .66rem var(--font-mono), monospace; text-transform: uppercase; letter-spacing: .08em; color: var(--rust-deep); }
        .cpb-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0; } .cpb-stats div { display: grid; gap: 2px; } .cpb-stats dt { font-size: .64rem; } .cpb-stats dd { margin: 0; font-weight: 800; font-size: 1.15rem; }
      `}</style>
    </div>
  );
}
