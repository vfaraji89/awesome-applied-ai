"use client";
/* The tool atlas: every tool on the map across ten areas of applied AI.
   An area rail on top (one bead per area), search and two toggles (emerging, open source),
   then cards grouped by area and category. Each card carries the brand icon (Simple Icons)
   or a monogram bead, the licence and how proven it is; an emerging tool says why, with a
   dated source. Filters live in the URL so a view can be shared. */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Tool, ToolArea } from "@/lib/types";
import { areas, catName } from "@/data/areas";
import icons from "@/data/tool-icons.json";
import { useT } from "@/i18n/lang";

const ICONS = icons as Record<string, { hex: string; path: string }>;
const MAT: Record<string, string> = { "production-common": "widely used", "production-viable": "production-ready", early: "early", research: "research", fragile: "fragile" };
const DEP: Record<string, string> = { "self-host": "self-host", saas: "cloud", both: "cloud or self-host" };
const OPEN = new Set(["oss", "hybrid", "source-available"]);

function lum(hex: string) {
  const n = parseInt(hex, 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function Icon({ t }: { t: Tool }) {
  const i = t.icon ? ICONS[t.icon] : undefined;
  if (!i) {
    const mono = t.name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || t.name[0];
    return <span className="ta-ic ta-mono" aria-hidden="true">{mono}<i /></span>;
  }
  const L = lum(i.hex), fill = L < 0.06 || L > 0.85 ? "var(--ink)" : `#${i.hex}`;
  return (
    <span className="ta-ic" aria-hidden="true" style={{ background: `color-mix(in srgb, #${i.hex} 11%, var(--card))` }}>
      <svg viewBox="0 0 24 24" width="22" height="22"><path d={i.path} fill={fill} /></svg>
    </span>
  );
}

function Card({ t, why, setWhy }: { t: Tool; why: string | null; setWhy: (id: string | null) => void }) {
  const tr = useT();
  const open = why === t.id;
  return (
    <li className={`ta-card${t.emerging ? " is-new" : ""}`}>
      <div className="ta-top">
        <Icon t={t} />
        <div className="ta-head">
          <a href={t.url} target="_blank" rel="noreferrer" className="ta-name">{t.name}<span className="ta-ext" aria-hidden="true">↗</span></a>
          <span className="ta-cat mono">{catName(t.category)}</span>
        </div>
        {t.emerging && (
          <button type="button" className={`ta-new${open ? " on" : ""}`} aria-expanded={open} onClick={() => setWhy(open ? null : t.id)}>
            <span className="bead" />{tr("tools.emerging", "Emerging")}
          </button>
        )}
      </div>
      <p className="ta-sum">{t.summary}</p>
      {open && t.emergingWhy && (
        <p className="ta-why">{t.emergingWhy} {t.emergingSource && <a href={t.emergingSource} target="_blank" rel="noreferrer">{tr("tools.source", "Source")} ↗</a>}</p>
      )}
      <div className="ta-meta mono">
        <span className={OPEN.has(t.model) ? "ta-open" : ""}>{t.license}</span>
        {t.maturity && <span>{tr(`tools.mat.${t.maturity}`, MAT[t.maturity] ?? t.maturity)}</span>}
        {t.deployment && <span>{tr(`tools.dep.${t.deployment}`, DEP[t.deployment])}</span>}
      </div>
    </li>
  );
}

export function ToolIndex({ tools }: { tools: Tool[] }) {
  const tr = useT();
  const [q, setQ] = useState("");
  const [area, setArea] = useState<ToolArea | "all">("all");
  const [fresh, setFresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState<string | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  // read the view from the URL once; ?layer= from older links maps onto its area
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) setQ(p.get("q") ?? "");
    const a = p.get("area") ?? ({ retrieval: "retrieval", memory: "agents", caching: "inference", orchestration: "agents", evaluation: "evaluation", governance: "governance" } as Record<string, string>)[p.get("layer") ?? ""];
    if (a && areas.some((x) => x.id === a)) setArea(a as ToolArea);
    if (p.get("emerging") === "1") setFresh(true);
    if (p.get("open") === "1") setOpen(true);
    const key = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); search.current?.focus(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  // and write it back, so a filtered view can be shared
  useEffect(() => {
    const p = new URLSearchParams();
    if (area !== "all") p.set("area", area);
    if (q.trim()) p.set("q", q.trim());
    if (fresh) p.set("emerging", "1");
    if (open) p.set("open", "1");
    const s = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (s ? `?${s}` : "") + window.location.hash);
  }, [area, q, fresh, open]);

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tools.filter((t) => (!fresh || t.emerging) && (!open || OPEN.has(t.model)) &&
      (!s || [t.name, t.summary, t.category, catName(t.category), t.license, ...t.tags].join(" ").toLowerCase().includes(s)));
  }, [q, fresh, open, tools]);
  const hits = area === "all" ? base : base.filter((t) => t.area === area);
  const nNew = tools.filter((t) => t.emerging).length;
  const spotlight = area === "all" && !q.trim() && !fresh && !open ? tools.filter((t) => t.emerging) : [];

  const pick = (a: ToolArea | "all") => setArea(a);
  // keep the chosen area in view on the rail (scrolls the rail only, never the page)
  useEffect(() => {
    const r = rail.current, el = r?.querySelector<HTMLElement>(`[data-a="${area}"]`);
    if (r && el) r.scrollTo({ left: el.offsetLeft - (r.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  }, [area]);
  const max = Math.max(1, ...areas.map((a) => base.filter((t) => t.area === a.id).length));

  return (
    <div className="ta">
      <div className="ta-bar">
        <div className="ta-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <input ref={search} type="search" placeholder={tr("tools.search", "Search {n} tools: labeling, vLLM, guardrails, voice…", { n: tools.length })} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tr("tools.search_aria", "Search tools")} />
          <kbd className="mono" aria-hidden="true">/</kbd>
        </div>
        <div className="ta-toggles">
          <button type="button" className={`ta-tog${fresh ? " on" : ""}`} aria-pressed={fresh} onClick={() => setFresh(!fresh)}><span className="bead" />{tr("tools.emerging", "Emerging")} <span className="count">{nNew}</span></button>
          <button type="button" className={`ta-tog${open ? " on" : ""}`} aria-pressed={open} onClick={() => setOpen(!open)}><span className="bead ink" />{tr("tools.open_only", "Open source")}</button>
        </div>
        <div className="ta-rail" ref={rail} role="tablist" aria-label={tr("tools.areas", "Areas")}>
          {[{ id: "all" as const, name: tr("tools.all", "All") }, ...areas.map((a) => ({ id: a.id, name: tr(`tarea.${a.id}`, a.name) }))].map((a) => {
            const n = a.id === "all" ? base.length : base.filter((t) => t.area === a.id).length;
            const at = a.id === "all" ? 100 : (n / max) * 100;
            return (
              <button key={a.id} data-a={a.id} type="button" role="tab" aria-selected={area === a.id} className={`ta-area${area === a.id ? " on" : ""}${n ? "" : " empty"}`} onClick={() => pick(a.id)}>
                <b>{a.name}</b><span className="mono">{n}</span>
                <span className="ta-rod" aria-hidden="true"><i style={{ left: `${at}%` }} /></span>
              </button>
            );
          })}
        </div>
      </div>

      {spotlight.length > 0 && (
        <section className="ta-spot" aria-label={tr("tools.spot", "Emerging now")}>
          <div className="ta-spot-h"><span className="bead" /><h3>{tr("tools.spot", "Emerging now")}<span className="dot">.</span></h3><span className="muted">{tr("tools.spot_p", "Launched recently and gaining adoption. Tap the tag to see why.")}</span></div>
          <ul className="ta-strip">{spotlight.map((t) => <Card key={t.id} t={t} why={why} setWhy={setWhy} />)}</ul>
        </section>
      )}

      <p className="count" style={{ margin: "22px 0 4px" }} aria-live="polite">{tr("tools.n", "{n} tools", { n: hits.length })}</p>
      {!hits.length && <p className="muted" style={{ marginTop: 12 }}>{tr("tools.none", "Nothing matches. Try a shorter word, or clear a filter.")}</p>}
      {areas.filter((a) => area === "all" || a.id === area).map((a) => {
        const at = hits.filter((t) => t.area === a.id);
        if (!at.length) return null;
        const cats = [...new Set(at.map((t) => t.category))].sort((x, y) => at.filter((t) => t.category === y).length - at.filter((t) => t.category === x).length);
        return (
          <section key={a.id} className="ta-area-sec" id={`area-${a.id}`}>
            <div className="ta-area-h">
              <h3>{tr(`tarea.${a.id}`, a.name)}<span className="dot">.</span></h3>
              <p className="muted">{tr(`tarea.${a.id}.line`, a.line)}</p>
            </div>
            {cats.map((c) => (
              <div key={c} className="ta-cat-sec">
                <div className="kicker">{catName(c)} <span className="count">{at.filter((t) => t.category === c).length}</span></div>
                <ul className="ta-grid">{at.filter((t) => t.category === c).sort((x, y) => Number(!!y.emerging) - Number(!!x.emerging) || x.name.localeCompare(y.name)).map((t) => <Card key={t.id} t={t} why={why} setWhy={setWhy} />)}</ul>
              </div>
            ))}
          </section>
        );
      })}
      <style>{`
        .ta-bar { position: sticky; top: 64px; z-index: 5; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 12px 0 10px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; border-bottom: 1px solid var(--line); }
        .ta-search { display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: 12px; background: var(--card); color: var(--muted); transition: border-color .3s var(--ease), box-shadow .3s var(--ease); }
        .ta-search:focus-within { border-color: var(--rust); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rust) 14%, transparent); }
        .ta-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; font-size: .95rem; color: var(--ink); }
        .ta-search kbd { font-size: .72rem; border: 1px solid var(--line-strong); border-radius: 6px; padding: 1px 6px; }
        .ta-toggles { display: flex; gap: 8px; }
        .ta-tog { display: inline-flex; align-items: center; gap: 7px; height: 44px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--card); font: inherit; font-size: .86rem; font-weight: 600; color: var(--sec); cursor: pointer; white-space: nowrap; transition: border-color .3s var(--ease), background .3s var(--ease), color .3s var(--ease); }
        .ta-tog .bead { width: 11px; height: 11px; opacity: .45; transition: opacity .3s var(--ease), transform .45s var(--ease); }
        .ta-tog.on { border-color: var(--rust); background: var(--paper); color: var(--rust-deep); }
        .ta-tog.on .bead { opacity: 1; transform: translateX(2px); }
        .ta-rail { position: relative; grid-column: 1 / -1; display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; padding: 2px 1px 4px; }
        .ta-rail::-webkit-scrollbar { display: none; }
        .ta-area { scroll-snap-align: start; flex: none; display: grid; grid-template-columns: auto auto; justify-content: space-between; align-items: baseline; column-gap: 10px; row-gap: 8px; min-width: 104px; padding: 9px 13px 11px; border-radius: 12px; border: 1px solid var(--line); background: var(--card); font: inherit; color: var(--ink); cursor: pointer; text-align: left; transition: border-color .3s var(--ease), background .3s var(--ease), transform .45s var(--ease); }
        .ta-area b { font-size: .9rem; font-weight: 700; } .ta-area .mono { font-size: .74rem; color: var(--muted); }
        .ta-area:hover { border-color: var(--line-strong); transform: translateY(-1px); }
        .ta-area.on { background: var(--ink); border-color: var(--ink); color: var(--bg); } .ta-area.on .mono { color: color-mix(in srgb, var(--bg) 70%, transparent); }
        .ta-area.on .ta-rod { background: color-mix(in srgb, var(--bg) 30%, transparent); }
        .ta-area.empty { opacity: .45; }
        .ta-rod { grid-column: 1 / -1; position: relative; height: 2px; border-radius: 2px; background: var(--line-strong); }
        .ta-rod i { position: absolute; top: -3px; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); transition: left .7s var(--ease); }
        .ta-spot { margin-top: 26px; padding: 18px; border-radius: 18px; background: var(--paper); border: 1px solid color-mix(in srgb, var(--rust) 22%, transparent); }
        .ta-spot-h { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .ta-spot-h h3 { font-size: 1.15rem; font-weight: 800; } .ta-spot-h .muted { font-size: .86rem; }
        .ta-strip { list-style: none; margin: 14px 0 0; padding: 0 0 6px; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(270px, 300px); gap: 10px; overflow-x: auto; scroll-snap-type: x proximity; }
        .ta-strip > li { scroll-snap-align: start; }
        .ta-area-sec { margin-top: 40px; scroll-margin-top: 180px; }
        .ta-area-h { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; padding-bottom: 10px; border-bottom: 2px solid var(--ink); }
        .ta-area-h h3 { font-size: 1.7rem; font-weight: 800; letter-spacing: -.02em; } .ta-area-h p { font-size: .92rem; }
        .ta-cat-sec { margin-top: 20px; } .ta-cat-sec .kicker { display: flex; gap: 8px; align-items: baseline; }
        .ta-grid { list-style: none; margin: 10px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 10px; }
        .ta-card { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--card); animation: rise .5s var(--ease) both; transition: border-color .35s var(--ease), box-shadow .35s var(--ease), transform .45s var(--ease); }
        .ta-card:hover { border-color: var(--line-strong); box-shadow: 0 14px 28px -22px rgba(28,28,30,.45); transform: translateY(-2px); }
        .ta-card.is-new { border-color: color-mix(in srgb, var(--rust) 30%, var(--line)); }
        .ta-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: start; }
        .ta-top .ta-new { margin-top: 2px; }
        .ta-ic { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; border: 1px solid var(--line); flex: none; }
        .ta-mono { position: relative; background: var(--paper); font-weight: 800; font-size: .86rem; letter-spacing: -.02em; color: var(--ink); }
        .ta-mono i { position: absolute; right: 4px; bottom: 4px; width: 6px; height: 6px; border-radius: 50%; background: var(--rust); }
        .ta-head { min-width: 0; display: flex; flex-direction: column; }
        .ta-name { font-weight: 750; line-height: 1.25; text-decoration: none; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
        .ta-name:hover { color: var(--rust-deep); } .ta-ext { font-size: .75em; margin-left: 4px; color: var(--muted); }
        .ta-cat { font-size: .7rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ta-new { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--rust) 45%, transparent); background: var(--paper); color: var(--rust-deep); font: inherit; font-size: .7rem; font-weight: 700; cursor: pointer; }
        .ta-new .bead { width: 7px; height: 7px; } .ta-new.on { background: var(--rust); color: #fff; border-color: var(--rust); }
        .ta-sum { font-size: .88rem; color: var(--sec); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ta-why { font-size: .82rem; line-height: 1.45; padding: 8px 10px; border-radius: 10px; background: var(--paper); color: var(--ink); }
        .ta-why a { color: var(--rust-deep); font-weight: 600; }
        .ta-meta { margin-top: auto; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: .7rem; color: var(--muted); }
        .ta-meta .ta-open { color: #15803d; }
        @media (max-width: 760px) { .ta-bar { grid-template-columns: 1fr; top: 96px; } .ta-toggles .ta-tog { flex: 1; justify-content: center; } .ta-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .ta-card, .ta-rod i, .ta-area { animation: none; transition: none; } }
      `}</style>
    </div>
  );
}
