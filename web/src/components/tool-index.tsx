"use client";
import { useMemo, useState, useEffect } from "react";
import type { Tool } from "@/lib/types";

type L = { id: string; name: string; categories: { id: string; name: string }[] };
const MAT: Record<string, string> = { "production-common": "widely used", "production-viable": "production-ready", early: "early", research: "research", fragile: "fragile" };

export function ToolIndex({ tools, layers }: { tools: Tool[]; layers: L[] }) {
  const [q, setQ] = useState("");
  const [layer, setLayer] = useState<string>("all");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) setQ(p.get("q") ?? "");
    if (p.get("layer")) setLayer(p.get("layer") ?? "all");
  }, []);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tools.filter((t) => (layer === "all" || t.layer === layer) && (!s || [t.name, t.summary, t.category, ...t.tags].join(" ").toLowerCase().includes(s)));
  }, [q, layer, tools]);
  return (
    <div>
      <div className="ti-bar">
        <input className="field" type="search" placeholder="Search 133 tools: vector database, tracing, guardrails…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tools" />
        <div className="chips">
          <button type="button" className={`chip${layer === "all" ? " on" : ""}`} onClick={() => setLayer("all")}>All <span className="count">{tools.length}</span></button>
          {layers.map((l) => (
            <button key={l.id} type="button" className={`chip${layer === l.id ? " on" : ""}`} onClick={() => setLayer(l.id)}>
              {l.name} <span className="count">{tools.filter((t) => t.layer === l.id).length}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="count" style={{ margin: "18px 0 10px" }}>{hits.length} tools</p>
      {layers.filter((l) => layer === "all" || l.id === layer).map((l) => {
        const lt = hits.filter((t) => t.layer === l.id);
        if (!lt.length) return null;
        return (
          <section key={l.id} className="ti-layer">
            <h3>{l.name}<span className="dot">.</span></h3>
            {l.categories.map((c) => {
              const ct = lt.filter((t) => t.category === c.id);
              if (!ct.length) return null;
              return (
                <div key={c.id} className="ti-cat">
                  <div className="kicker">{c.name}</div>
                  <ul className="ti-list">
                    {ct.map((t) => (
                      <li key={t.id} className="ti-row">
                        <span className="bead white" />
                        <div>
                          <a href={t.url} target="_blank" rel="noreferrer" className="ti-name">{t.name}</a>
                          <p className="muted">{t.summary}</p>
                        </div>
                        <div className="ti-meta mono">
                          <span>{t.license}</span>
                          {t.maturity && <span>{MAT[t.maturity] ?? t.maturity}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
      <style>{`
        .ti-bar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 64px; z-index: 5; background: var(--bg); padding: 12px 0; }
        .ti-bar .chip { cursor: pointer; font: inherit; font-size: .82rem; }
        .ti-layer { margin-top: 34px; } .ti-layer h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        .ti-cat { margin-top: 18px; }
        .ti-list { list-style: none; margin: 10px 0 0; padding: 0; border-top: 1px solid var(--line); }
        .ti-row { display: grid; grid-template-columns: 14px minmax(0, 1fr) auto; gap: 14px; align-items: start; padding: 14px 0; border-bottom: 1px solid var(--line); animation: rise .5s var(--ease) both; }
        .ti-row .bead { margin-top: 5px; }
        .ti-name { font-weight: 700; text-decoration: none; } .ti-name:hover { color: var(--rust-deep); }
        .ti-row p { font-size: .93rem; margin-top: 2px; }
        .ti-meta { display: flex; flex-direction: column; align-items: end; gap: 2px; font-size: .74rem; color: var(--muted); text-align: right; }
        @media (max-width: 640px) { .ti-row { grid-template-columns: 14px minmax(0, 1fr); } .ti-meta { grid-column: 2; align-items: start; flex-direction: row; gap: 10px; } .ti-bar { top: 96px; } }
      `}</style>
    </div>
  );
}
