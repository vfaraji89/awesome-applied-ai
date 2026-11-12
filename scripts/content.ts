/* The content sheet: Google Sheets as the editor for this site's data.
 *
 *   bun scripts/content.ts export [dir]        write one CSV per sheet tab from the repo's data
 *   bun scripts/content.ts pull [--dry]        read the sheet, validate, write the JSON files
 *   bun scripts/content.ts pull --from <dir>   same, from local CSVs (tests, offline edits)
 *
 * `pull` reads CONTENT_SHEET_ID (a GitHub Actions secret, never committed). The sheet is
 * shared "anyone with the link can view"; editing rights stay in Google. Every row is
 * validated before anything is written: unknown enum values, duplicate ids, missing
 * required cells and non-https links stop the sync with the tab and row named.
 * See CONTENT.md. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const P = {
  companies: path.join(root, "pipeline/companies.json"),
  radar: path.join(root, "web/src/data/content/radar.json"),
  tools: path.join(root, "web/src/data/content/tools.json"),
  jargon: path.join(root, "web/src/data/content/jargon.json"),
  types: path.join(root, "web/src/lib/types.ts"),
  layers: path.join(root, "web/src/data/layers.ts"),
};
const readJSON = (p: string) => JSON.parse(readFileSync(p, "utf8"));
type Row = Record<string, string>;

// ---------------------------------------------------------------- CSV
function toCSV(head: string[], rows: Row[]) {
  const q = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [head.join(","), ...rows.map((r) => head.map((h) => q(r[h] ?? "")).join(","))].join("\n") + "\n";
}
function parseCSV(text: string): Row[] {
  const out: string[][] = []; let row: string[] = [], cell = "", inq = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inq) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inq = false; } else cell += c; }
    else if (c === '"') inq = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); out.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); out.push(row); }
  const [head, ...body] = out.filter((r) => r.some((c) => c.trim() !== ""));
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

// ---------------------------------------------------------------- list cells
// Lists of words: comma separated. Lists of links: one per line, "label | url".
const words = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);
const joinWords = (xs?: string[]) => (xs ?? []).join(", ");
const links = (v: string) => v.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => {
  const i = l.lastIndexOf("|"); return i < 0 ? { label: l, url: "" } : { label: l.slice(0, i).trim(), url: l.slice(i + 1).trim() };
});
const joinLinks = (xs: { label?: string; name?: string; url?: string; href?: string }[] = []) =>
  xs.map((x) => `${x.label ?? x.name} | ${x.url ?? x.href}`).join("\n");

// ---------------------------------------------------------------- allowed values, read from the code
const union = (src: string, name: string) => {
  const m = src.match(new RegExp(`export type ${name}\\s*=([^;]+);`));
  return new Set((m?.[1].match(/"([^"]+)"/g) ?? []).map((x) => x.slice(1, -1)));
};
const typesSrc = readFileSync(P.types, "utf8");
const radarSrc = readFileSync(path.join(root, "web/src/data/radar.ts"), "utf8");
const layerIds = new Set([...readFileSync(P.layers, "utf8").matchAll(/^\s{2,4}id: "([a-z-]+)"/gm)].map((m) => m[1]));
const ALLOWED = {
  area: union(radarSrc, "Area"), ring: union(radarSrc, "Ring"), field: union(typesSrc, "FieldId"),
  model: union(typesSrc, "SourceModel"), maturity: union(typesSrc, "Maturity"), deployment: union(typesSrc, "Deployment"),
  kind: union(typesSrc, "Kind"), status: union(typesSrc, "Status"), layer: layerIds, toolArea: union(typesSrc, "ToolArea"),
  ats: new Set(["greenhouse", "lever", "ashby", "workday"]),
};

// ---------------------------------------------------------------- the tabs
interface Tab { name: string; head: string[]; required: string[]; enums?: Record<string, keyof typeof ALLOWED>; unique?: string; urls?: string[]; linkCols?: string[] }
const TABS: Tab[] = [
  { name: "companies", head: ["ats", "slug", "host", "site", "note"], required: ["ats", "slug"], enums: { ats: "ats" } },
  { name: "radar", head: ["id", "name", "area", "ring", "short", "what", "why", "use", "avoid", "examples", "sources", "more"],
    required: ["id", "name", "area", "ring", "short", "what", "why", "use", "avoid", "sources"], enums: { area: "area", ring: "ring" }, unique: "id", linkCols: ["examples", "sources"] },
  { name: "radar_quarter", head: ["quarter", "title", "line", "href"], required: ["quarter", "title", "line", "href"] },
  { name: "settings", head: ["key", "value"], required: ["key"] },
  { name: "tools", head: ["id", "name", "area", "category", "layer", "summary", "license", "model", "maturity", "deployment", "kind", "status", "url", "github", "launched", "icon", "emerging", "emerging_why", "emerging_source", "tags", "note"],
    required: ["id", "name", "area", "category", "summary", "license", "model", "url"],
    enums: { area: "toolArea", layer: "layer", model: "model", maturity: "maturity", deployment: "deployment", kind: "kind", status: "status" }, unique: "id", urls: ["url", "emerging_source"] },
  { name: "jargon", head: ["id", "term", "field", "short", "detail", "asked", "also", "tags", "link_label", "link_href"],
    required: ["id", "term", "field", "short", "detail"], enums: { field: "field" }, unique: "id", urls: ["link_href"] },
  { name: "jargon_fields", head: ["id", "name", "tagline", "intro"], required: ["id", "name", "tagline", "intro"], enums: { id: "field" }, unique: "id" },
];

// ---------------------------------------------------------------- repo -> rows
function exportRows(): Record<string, Row[]> {
  const comp = readJSON(P.companies), radar = readJSON(P.radar), tools = readJSON(P.tools), jargon = readJSON(P.jargon);
  return {
    companies: [
      ...["greenhouse", "lever", "ashby"].flatMap((ats) => (comp[ats] ?? []).map((slug: string) => ({ ats, slug }))),
      ...(comp.workday ?? []).map((b: { tenant: string; host: string; site: string }) => ({ ats: "workday", slug: b.tenant, host: b.host, site: b.site })),
    ],
    radar: radar.items.map((r: any) => ({ ...r, examples: joinLinks(r.examples), sources: joinLinks(r.sources), more: joinLinks(r.more) })),
    radar_quarter: radar.quarter.points.map((p: any) => ({ quarter: radar.quarter.name, ...p })),
    settings: [{ key: "radar_checked", value: radar.checked }, { key: "companies_note", value: comp._note ?? "" }],
    tools: tools.map((t: any) => ({ ...t, tags: joinWords(t.tags), emerging: t.emerging ? "TRUE" : "", emerging_why: t.emergingWhy ?? "", emerging_source: t.emergingSource ?? "" })),
    jargon: jargon.terms.map((t: any) => ({ ...t, also: joinWords(t.also), tags: joinWords(t.tags), link_label: t.link?.label ?? "", link_href: t.link?.href ?? "" })),
    jargon_fields: jargon.fields,
  };
}

// ---------------------------------------------------------------- rows -> repo
function validate(tab: Tab, rows: Row[], errs: string[]) {
  const seen = new Set<string>();
  rows.forEach((r, i) => {
    const at = `${tab.name} row ${i + 2}`;
    for (const k of tab.required) if (!r[k]) errs.push(`${at}: "${k}" is empty`);
    for (const [col, set] of Object.entries(tab.enums ?? {})) if (r[col] && !ALLOWED[set].has(r[col])) errs.push(`${at}: ${col} "${r[col]}" is not one of ${[...ALLOWED[set]].join(", ")}`);
    if (tab.unique) { const id = r[tab.unique]; if (id && seen.has(id)) errs.push(`${at}: duplicate ${tab.unique} "${id}"`); seen.add(id); }
    if (tab.unique === "id" && r.id && !/^[a-z0-9][a-z0-9-]*$/.test(r.id)) errs.push(`${at}: id "${r.id}" must be lowercase letters, digits and hyphens`);
    for (const col of tab.urls ?? []) if (r[col] && !/^(https:\/\/|\/)/.test(r[col])) errs.push(`${at}: ${col} must be https://… or a path on this site (/…)`);
    for (const col of tab.linkCols ?? []) for (const l of links(r[col] ?? "")) if (!/^https:\/\//.test(l.url)) errs.push(`${at}: ${col} line "${l.label}" needs "label | https://…"`);
    for (const l of links(r.more ?? "")) if (!l.url.startsWith("/")) errs.push(`${at}: more line "${l.label}" needs "label | /path/on/this/site/"`);
    if (tab.name === "tools") {
      if (r.emerging && !YES.test(r.emerging) && !NO.test(r.emerging)) errs.push(`${at}: emerging "${r.emerging}" must be TRUE or FALSE`);
      if (YES.test(r.emerging ?? "") && (!r.emerging_why || !r.emerging_source)) errs.push(`${at}: an emerging tool needs emerging_why (with a date) and emerging_source`);
      if (r.github && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r.github)) errs.push(`${at}: github "${r.github}" must be owner/repo`);
      if (r.launched && !/^20\d\d-(0[1-9]|1[0-2])$/.test(r.launched)) errs.push(`${at}: launched "${r.launched}" must be YYYY-MM`);
      if (r.icon && !/^[a-z0-9]+$/.test(r.icon)) errs.push(`${at}: icon "${r.icon}" must be a Simple Icons slug (lowercase letters and digits)`);
    }
  });
}
const YES = /^(true|yes|1|x)$/i, NO = /^(false|no|0)$/i;
const opt = <T,>(v: string, f: (s: string) => T) => (v ? f(v) : undefined);
const compact = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && !v.length && v !== null)));

function build(d: Record<string, Row[]>) {
  const setting = (k: string) => d.settings.find((r) => r.key === k)?.value ?? "";
  const by = (ats: string) => d.companies.filter((r) => r.ats === ats).map((r) => r.slug);
  const companies = {
    _note: setting("companies_note") || "Company job boards to watch. Edited in the content sheet (tab: companies).",
    greenhouse: by("greenhouse"), lever: by("lever"), ashby: by("ashby"),
    workday: d.companies.filter((r) => r.ats === "workday").map((r) => ({ tenant: r.slug, host: r.host, site: r.site })),
  };
  const q = d.radar_quarter;
  const radar = {
    checked: setting("radar_checked"),
    quarter: { name: q[0]?.quarter ?? "", points: q.map((r) => ({ title: r.title, line: r.line, href: r.href })) },
    items: d.radar.map((r) => compact({
      id: r.id, name: r.name, area: r.area, ring: r.ring, short: r.short, what: r.what, why: r.why, use: r.use, avoid: r.avoid,
      examples: links(r.examples ?? "").map((l) => ({ name: l.label, url: l.url })),
      sources: links(r.sources).map((l) => ({ label: l.label, url: l.url })),
      more: opt(r.more, (v) => links(v).map((l) => ({ label: l.label, href: l.url }))),
    })),
  };
  const tools = d.tools.map((t) => compact({
    id: t.id, name: t.name, area: t.area, layer: t.layer, category: t.category, summary: t.summary, license: t.license, model: t.model,
    maturity: t.maturity, deployment: t.deployment, url: t.url, github: t.github, launched: t.launched, icon: t.icon, emerging: YES.test(t.emerging ?? "") ? true : undefined,
    emergingWhy: YES.test(t.emerging ?? "") ? t.emerging_why : undefined, emergingSource: YES.test(t.emerging ?? "") ? t.emerging_source : undefined,
    tags: words(t.tags ?? ""), note: t.note, status: t.status, kind: t.kind,
  }));
  const jargon = {
    fields: d.jargon_fields.map((f) => ({ id: f.id, name: f.name, tagline: f.tagline, intro: f.intro })),
    terms: d.jargon.map((t) => compact({
      id: t.id, term: t.term, field: t.field, short: t.short, detail: t.detail, asked: t.asked,
      tags: words(t.tags ?? ""), also: opt(t.also, words), link: t.link_href ? { label: t.link_label || t.link_href, href: t.link_href } : undefined,
    })),
  };
  // tools and terms always carry a tags array, even when empty
  for (const t of tools as any[]) t.tags ??= [];
  for (const t of jargon.terms as any[]) t.tags ??= [];
  return { companies, radar, tools, jargon };
}

async function fetchTab(id: string, tab: string) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`tab "${tab}": HTTP ${r.status}. Is the sheet shared "anyone with the link can view"?`);
  const text = await r.text();
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error(`tab "${tab}": got a web page, not CSV. Check the sheet id and sharing.`);
  return text;
}

// ---------------------------------------------------------------- main
const [cmd, ...args] = process.argv.slice(2);
if (cmd === "export") {
  const dir = path.resolve(args[0] ?? path.join(root, "content-export"));
  mkdirSync(dir, { recursive: true });
  const rows = exportRows();
  for (const t of TABS) writeFileSync(path.join(dir, `${t.name}.csv`), toCSV(t.head, rows[t.name]));
  console.log(`Wrote ${TABS.length} tabs to ${path.relative(process.cwd(), dir) || dir}: ` + TABS.map((t) => `${t.name} (${rows[t.name].length})`).join(", "));
} else if (cmd === "pull") {
  const from = args.includes("--from") ? path.resolve(args[args.indexOf("--from") + 1]) : null;
  const dry = args.includes("--dry");
  const id = process.env.CONTENT_SHEET_ID;
  if (!from && !id) { console.error("Set CONTENT_SHEET_ID (the id in the sheet's URL), or pass --from <dir> with CSVs."); process.exit(2); }
  const data: Record<string, Row[]> = {}, errs: string[] = [];
  for (const t of TABS) {
    const text = from ? (existsSync(path.join(from, `${t.name}.csv`)) ? readFileSync(path.join(from, `${t.name}.csv`), "utf8") : "") : await fetchTab(id!, t.name);
    const rows = parseCSV(text);
    const missing = t.head.filter((h) => !(rows[0] && h in rows[0]) && t.required.includes(h));
    if (!rows.length) errs.push(`${t.name}: the tab is empty or missing`);
    else if (missing.length) errs.push(`${t.name}: missing column(s) ${missing.join(", ")}`);
    else validate(t, rows, errs);
    data[t.name] = rows;
  }
  if (!errs.length && data.radar_quarter.some((r) => r.quarter !== data.radar_quarter[0].quarter)) errs.push("radar_quarter: every row must name the same quarter");
  if (!errs.length && !/^\d{4}-\d{2}-\d{2}$/.test(data.settings.find((r) => r.key === "radar_checked")?.value ?? "")) errs.push('settings: radar_checked must be a date like 2026-11-11');
  if (errs.length) { console.error(`Content sheet: ${errs.length} problem(s), nothing written.\n` + errs.slice(0, 60).map((e) => "  " + e).join("\n")); process.exit(1); }
  const out = build(data);
  const files: [string, unknown][] = [[P.companies, out.companies], [P.radar, out.radar], [P.tools, out.tools], [P.jargon, out.jargon]];
  let changed = 0;
  for (const [p, v] of files) {
    const next = p === P.companies ? JSON.stringify(v, null, 1) + "\n" : JSON.stringify(v, null, 1) + "\n";
    const prev = existsSync(p) ? readFileSync(p, "utf8") : "";
    if (prev !== next) { changed++; if (!dry) writeFileSync(p, next); console.log(`${dry ? "would change" : "changed"}: ${path.relative(root, p)}`); }
  }
  console.log(`Content sheet: ${Object.entries(data).map(([k, v]) => `${k} ${v.length}`).join(", ")}. ${changed} file(s) ${dry ? "would change" : "changed"}.`);
} else {
  console.error("Usage: bun scripts/content.ts export [dir] | pull [--dry] [--from dir]"); process.exit(2);
}
