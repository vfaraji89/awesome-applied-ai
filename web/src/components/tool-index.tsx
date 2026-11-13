"use client";
/* The tool atlas: every tool on the map across eleven areas of applied AI.
   An area rail on top (one bead per area), search and two toggles (emerging, open source),
   then cards grouped by area and category. Each card carries the brand icon (Simple Icons)
   or a monogram bead, the licence and how proven it is. Emerging means launched in the last six
   months (lib/tool-signals.ts); where the sheet gives a reason, the tag opens it with its source. Filters live in the URL so a view can be shared. */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Tool, ToolArea } from "@/lib/types";
import { areas, catName } from "@/data/areas";
import icons from "@/data/tool-icons.json";
import { useT } from "@/i18n/lang";
import { signals, fmtStars, statsDate } from "@/lib/tool-signals";

const ICONS = icons as Record<string, { hex: string; path: string }>;
const MAT: Record<string, string> = { "production-common": "widely used", "production-viable": "production-ready", early: "early", research: "research", fragile: "fragile" };
const DEP: Record<string, string> = { "self-host": "self-host", saas: "cloud", both: "cloud or self-host" };
const OPEN = new Set(["oss", "hybrid", "source-available"]);
type Sort = "area" | "stars" | "trending" | "new";
type Tag = "trending" | "popular";

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

function Badges({ t }: { t: Tool }) {
  const tr = useT();
  const g = signals(t);
  if (!g.stars && !g.isNew) return null;
  return (
    <div className="ta-badges">
      {g.stars !== undefined && (
        <a className="ta-b ta-stars mono" href={`https://github.com/${g.repo}`} target="_blank" rel="noreferrer" title={tr("tools.stars_t", "Stars on GitHub")}>
          <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M8 .9l2.1 4.4 4.8.6-3.5 3.3.9 4.8L8 11.7 3.7 14l.9-4.8L1.1 5.9l4.8-.6z" fill="currentColor" /></svg>{fmtStars(g.stars)}
        </a>
      )}
      {g.trending && <span className="ta-b ta-trend">↑ {g.gain !== undefined ? tr("tools.gain", "+{n} this week", { n: fmtStars(g.gain) }) : tr("tools.trending", "Trending")}</span>}
      {g.popular && <span className="ta-b ta-pop">{tr("tools.popular", "Popular")}</span>}
      {g.isNew && g.launched && <span className="ta-b ta-q" title={tr("tools.launched", "Launched")}>{g.quarter}</span>}
    </div>
  );
}

function Card({ t, why, setWhy }: { t: Tool; why: string | null; setWhy: (id: string | null) => void }) {
  const tr = useT();
  const open = why === t.id;
  const g = signals(t);
  const label = tr("tools.emerging", "Emerging");
  return (
    <li className={`ta-card${g.isNew ? " is-new" : ""}`}>
      <div className="ta-top">
        <Icon t={t} />
        <div className="ta-head">
          <a href={t.url} target="_blank" rel="noreferrer" className="ta-name">{t.name}<span className="ta-ext" aria-hidden="true">↗</span></a>
          <span className="ta-cat mono">{tr(`tcat.${t.category}`, catName(t.category))}</span>
        </div>
        {g.isNew && (t.emergingWhy ? (
          <button type="button" className={`ta-new${open ? " on" : ""}`} aria-expanded={open} onClick={() => setWhy(open ? null : t.id)}>
            <span className="bead" />{label}
          </button>
        ) : <span className="ta-new"><span className="bead" />{label}</span>)}
      </div>
      <Badges t={t} />
      <p className="ta-sum">{t.summary}</p>
      {open && g.isNew && t.emergingWhy && (
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
  const [sort, setSort] = useState<Sort>("area");
  const [cat, setCat] = useState<string>("");
  const [tags, setTags] = useState<Set<Tag>>(new Set());
  const tog = (k: Tag) => setTags((o) => { const n = new Set(o); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const search = useRef<HTMLInputElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  // read the view from the URL once; ?layer= from older links maps onto its area
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) setQ(p.get("q") ?? "");
    const a = p.get("area") ?? ({ retrieval: "retrieval", memory: "agents", caching: "inference", orchestration: "agents", evaluation: "evaluation", governance: "governance" } as Record<string, string>)[p.get("layer") ?? ""];
    if (a && areas.some((x) => x.id === a)) setArea(a as ToolArea);
    if (p.get("cat")) setCat(p.get("cat") ?? "");
    if (p.get("emerging") === "1") setFresh(true);
    if (p.get("open") === "1") setOpen(true);
    const so = p.get("sort"); if (so === "stars" || so === "trending" || so === "new") setSort(so);
    const tg = (p.get("tags") ?? "").split(",");
    if (tg.includes("new")) setFresh(true); // the old "New" tag is the emerging toggle now
    const kept = tg.filter((x): x is Tag => x === "trending" || x === "popular"); if (kept.length) setTags(new Set(kept));
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
    if (cat) p.set("cat", cat);
    if (q.trim()) p.set("q", q.trim());
    if (fresh) p.set("emerging", "1");
    if (open) p.set("open", "1");
    if (sort !== "area") p.set("sort", sort);
    if (tags.size) p.set("tags", [...tags].join(","));
    const s = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (s ? `?${s}` : "") + window.location.hash);
  }, [area, q, fresh, open, sort, tags, cat]);

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tools.filter((t) => {
      const g = signals(t);
      return (!fresh || g.isNew) && (!open || OPEN.has(t.model)) && (!tags.has("trending") || g.trending) && (!tags.has("popular") || g.popular) &&
        (!s || [t.name, t.summary, t.category, catName(t.category), tr(`tcat.${t.category}`, ""), t.license, g.repo, ...t.tags].join(" ").toLowerCase().includes(s));
    });
  }, [q, fresh, open, tags, tools, tr]);
  const inArea = area === "all" ? base : base.filter((t) => t.area === area);
  const hits = cat ? inArea.filter((t) => t.category === cat) : inArea;
  const cats = area === "all" ? [] : [...new Set(inArea.map((t) => t.category))].map((c) => [c, inArea.filter((t) => t.category === c).length] as const).sort((x, y) => y[1] - x[1]);
  const nNew = tools.filter((t) => signals(t).isNew).length;
  const quiet = area === "all" && !q.trim() && !fresh && !open && !tags.size && sort === "area";
  const spotlight = quiet ? tools.filter((t) => signals(t).isNew).sort((a, b) => (signals(b).launched ?? "").localeCompare(signals(a).launched ?? "")) : [];
  // one row per repo: a feature of a project (say, vLLM prefix caching) does not take a second place
  const top = quiet ? tools.filter((t) => signals(t).stars).sort((a, b) => (signals(b).stars ?? 0) - (signals(a).stars ?? 0))
    .filter((t, i, a) => a.findIndex((x) => signals(x).repo === signals(t).repo) === i).slice(0, 10) : [];
  const topMax = top.length ? signals(top[0]).stars ?? 1 : 1;
  const ranked = sort === "area" ? [] : [...hits].filter((t) => sort === "new" ? !!signals(t).launched : sort === "stars" || sort === "trending" ? signals(t).stars !== undefined : true).sort((a, b) => {
    const x = signals(a), y = signals(b);
    if (sort === "stars") return (y.stars ?? 0) - (x.stars ?? 0);
    if (sort === "trending") return Number(y.trending) - Number(x.trending) || (y.gain ?? 0) - (x.gain ?? 0) || (y.stars ?? 0) - (x.stars ?? 0);
    return (y.launched ?? "").localeCompare(x.launched ?? "") || (y.stars ?? 0) - (x.stars ?? 0);
  });
  const nTag = (k: Tag) => tools.filter((t) => { const g = signals(t); return k === "trending" ? g.trending : g.popular; }).length;

  const pick = (a: ToolArea | "all") => { setArea(a); setCat(""); };
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
        <div className="ta-tags">
          {(["trending", "popular"] as Tag[]).filter((k) => tags.has(k) || nTag(k) > 0).map((k) => (
            <button key={k} type="button" className={`ta-chip ta-chip-${k}${tags.has(k) ? " on" : ""}`} aria-pressed={tags.has(k)} onClick={() => tog(k)}>
              {k === "trending" ? "↑ " : "★ "}{tr(`tools.tag.${k}`, k === "trending" ? "Trending" : "Popular")} <span className="count">{nTag(k)}</span>
            </button>
          ))}
          <label className="ta-sort">
            <span className="mono">{tr("tools.sort", "Sort")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="area">{tr("tools.sort.area", "By area")}</option>
              <option value="stars">{tr("tools.sort.stars", "Most stars on GitHub")}</option>
              <option value="trending">{tr("tools.sort.trending", "Trending")}</option>
              <option value="new">{tr("tools.sort.new", "Newest")}</option>
            </select>
          </label>
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
        {cats.length > 1 && (
          <div className="ta-cats" role="group" aria-label={tr("tools.subcats", "Subcategories")}>
            <button type="button" className={`ta-cat-chip${cat ? "" : " on"}`} onClick={() => setCat("")}>{tr("tools.all", "All")} <span className="count">{inArea.length}</span></button>
            {cats.map(([c, n]) => <button key={c} type="button" className={`ta-cat-chip${cat === c ? " on" : ""}`} aria-pressed={cat === c} onClick={() => setCat(cat === c ? "" : c)}>{tr(`tcat.${c}`, catName(c))} <span className="count">{n}</span></button>)}
          </div>
        )}
      </div>

      {spotlight.length > 0 && (
        <section className="ta-spot" aria-label={tr("tools.spot", "Emerging now")}>
          <div className="ta-spot-h"><span className="bead" /><h3>{tr("tools.spot", "Emerging now")}<span className="dot">.</span></h3><span className="muted">{tr("tools.spot_p", "Launched in the last six months, newest first. Tap a tag to see why.")}</span></div>
          <ul className="ta-strip">{spotlight.map((t) => <Card key={t.id} t={t} why={why} setWhy={setWhy} />)}</ul>
        </section>
      )}

      {top.length > 0 && (
        <section className="ta-top10" aria-label={tr("tools.top", "Most starred on GitHub")}>
          <div className="ta-spot-h"><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M8 .9l2.1 4.4 4.8.6-3.5 3.3.9 4.8L8 11.7 3.7 14l.9-4.8L1.1 5.9l4.8-.6z" fill="currentColor" /></svg><h3>{tr("tools.top", "Most starred on GitHub")}<span className="dot">.</span></h3><span className="muted">{tr("tools.top_p", "Open-source tools on the map, by GitHub stars on {d}.", { d: statsDate })}</span></div>
          <ol className="ta-lb">
            {top.map((t, i) => { const g = signals(t); return (
              <li key={t.id}>
                <span className="ta-lb-n mono">{String(i + 1).padStart(2, "0")}</span>
                <Icon t={t} />
                <a href={`https://github.com/${g.repo}`} target="_blank" rel="noreferrer" className="ta-lb-name">{t.name}<span className="mono">{g.repo}</span></a>
                <span className="ta-lb-rod" aria-hidden="true"><i style={{ width: `${((g.stars ?? 0) / topMax) * 100}%` }} /></span>
                <span className="ta-lb-s mono">{fmtStars(g.stars ?? 0)}</span>
              </li>
            ); })}
          </ol>
        </section>
      )}
      <p className="count" style={{ margin: "22px 0 4px" }} aria-live="polite">{tr("tools.n", "{n} tools", { n: hits.length })}</p>
      {!hits.length && <p className="muted" style={{ marginTop: 12 }}>{tr("tools.none", "Nothing matches. Try a shorter word, or clear a filter.")}</p>}
      {sort !== "area" && <ul className="ta-grid ta-ranked">{ranked.map((t) => <Card key={t.id} t={t} why={why} setWhy={setWhy} />)}</ul>}
      {sort === "area" && areas.filter((a) => area === "all" || a.id === area).map((a) => {
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
                <div className="kicker">{tr(`tcat.${c}`, catName(c))} <span className="count">{at.filter((t) => t.category === c).length}</span></div>
                <ul className="ta-grid">{at.filter((t) => t.category === c).sort((x, y) => Number(signals(y).isNew) - Number(signals(x).isNew) || x.name.localeCompare(y.name)).map((t) => <Card key={t.id} t={t} why={why} setWhy={setWhy} />)}</ul>
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
        .ta-tags { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .ta-chip { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--card); font: inherit; font-size: .8rem; font-weight: 650; color: var(--sec); cursor: pointer; transition: border-color .3s var(--ease), background .3s var(--ease), color .3s var(--ease); }
        .ta-chip.on { border-color: var(--ink); background: var(--ink); color: var(--bg); } .ta-chip.on .count { color: inherit; opacity: .7; }
        .ta-cats { grid-column: 1 / -1; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .ta-cats::-webkit-scrollbar { display: none; }
        .ta-cat-chip { flex: none; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 11px; border-radius: 8px; border: 1px dashed var(--line-strong); background: none; font: inherit; font-size: .78rem; color: var(--sec); cursor: pointer; white-space: nowrap; }
        .ta-cat-chip.on { border-style: solid; border-color: var(--rust); color: var(--rust-deep); background: var(--paper); }
        .ta-sort { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; font-size: .8rem; color: var(--muted); }
        .ta-sort select { height: 32px; padding: 0 28px 0 10px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--card); color: var(--ink); font: inherit; font-size: .82rem; font-weight: 600; cursor: pointer; }
        .ta-badges { display: flex; flex-wrap: wrap; gap: 5px; }
        .ta-b { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 6px; font-size: .68rem; font-weight: 700; white-space: nowrap; text-decoration: none; }
        .ta-stars { background: color-mix(in srgb, var(--ink) 7%, var(--card)); color: var(--ink); } .ta-stars:hover { background: var(--ink); color: var(--bg); }
        .ta-trend { background: color-mix(in srgb, #16a34a 14%, var(--card)); color: #15803d; }
        .ta-pop { background: color-mix(in srgb, #d4a017 18%, var(--card)); color: #8a6508; }
        .ta-q { background: color-mix(in srgb, #2563eb 12%, var(--card)); color: #1d4ed8; }
        .ta-top10 { margin-top: 14px; padding: 18px; border-radius: 18px; border: 1px solid var(--line); background: var(--card); }
        .ta-top10 .ta-spot-h svg { color: #d4a017; }
        .ta-lb { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
        .ta-lb li { display: grid; grid-template-columns: 22px 30px minmax(0, 1fr) 90px 44px; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
        .ta-lb .ta-ic { width: 30px; height: 30px; border-radius: 9px; } .ta-lb .ta-ic svg { width: 17px; height: 17px; } .ta-lb .ta-mono { font-size: .7rem; }
        .ta-lb-n { font-size: .72rem; color: var(--muted); }
        .ta-lb-name { min-width: 0; display: flex; flex-direction: column; font-weight: 700; font-size: .9rem; color: var(--ink); text-decoration: none; }
        .ta-lb-name span { font-size: .68rem; font-weight: 400; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ta-lb-name:hover { color: var(--rust-deep); }
        .ta-lb-rod { position: relative; height: 4px; border-radius: 4px; background: var(--line); } .ta-lb-rod i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: linear-gradient(90deg, #e0301e, #ff9d8f); }
        .ta-lb-s { font-size: .78rem; font-weight: 700; text-align: right; }
        .ta-ranked { margin-top: 14px; }
        @media (max-width: 760px) { .ta-lb { grid-template-columns: 1fr; } .ta-lb li { grid-template-columns: 22px 30px minmax(0, 1fr) 60px 40px; } .ta-sort { margin-left: 0; } }
        @media (max-width: 760px) { .ta-bar { grid-template-columns: 1fr; top: 96px; } .ta-toggles .ta-tog { flex: 1; justify-content: center; } .ta-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .ta-card, .ta-rod i, .ta-area { animation: none; transition: none; } }
      `}</style>
    </div>
  );
}
