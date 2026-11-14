/* The people pages' data: only the people in web/src/data/people-curated.json, from the candidates the
   conference tracker keeps (conferences/people.json, from ai.engineer's public speaker pages).
   Each fact keeps its source: role and organisation as their AI Engineer page states them, their
   talks with links, the topics AI Engineer tags them with, the skills those talks name (same rules as
   the job ads), and their organisation's products on the tool map. Nothing is inferred beyond that.
   bun pipeline/people.ts */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { skillsOf } from "./taxonomy";

const root = path.resolve(import.meta.dir, "..");
const read = (p: string) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
type Cand = { id: string; name: string; role: string | null; org: string | null; source: string; links: Record<string, string>; talks: number; editions: string[]; lastEdition: string | null; topics: string[]; talkList: { title: string; url: string; event: string | null }[] };
const cands = read("conferences/people.json") as { updated: string; people: Cand[] };
const curated = read("web/src/data/people-curated.json") as { builders: string[]; quiet: string[] };
const picks = [...curated.builders.map((id) => ({ id, group: "builders" as const })), ...curated.quiet.map((id) => ({ id, group: "quiet" as const }))];
const conf = read("web/src/data/conferences.json") as { editions: { name: string; start: string; url: string }[] };
const tools = read("web/src/data/content/tools.json") as { id: string; name: string; area: string; summary: string }[];
const norm = (s: string | null) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const toolsByOrg = new Map<string, { id: string; name: string; area: string }[]>();
for (const t of tools) toolsByOrg.set(norm(t.name), [...(toolsByOrg.get(norm(t.name)) ?? []), { id: t.id, name: t.name, area: t.area }]);
const start = new Map(conf.editions.map((e) => [e.name, e.start]));
// the archive sometimes names an event by its slug ("worldsfair-2024"): use the edition's own name
const eventName = (ev: string | null) => {
  const m = ev?.match(/^([a-z]+)-(\d{4})$/);
  return m ? conf.editions.find((e) => e.url.replace(/\/$/, "").endsWith(`/${m[1]}/${m[2]}`))?.name ?? ev : ev;
};
const yearOf = (ev: string | null) => (ev ? start.get(ev)?.slice(0, 4) ?? ev.match(/\d{4}/)?.[0] ?? null : null);

const byId = new Map(cands.people.map((p) => [p.id, p]));
const missing = picks.filter(({ id }) => !byId.has(id)).map(({ id }) => id);
const people = picks.filter(({ id }) => byId.has(id)).map(({ id, group }) => {
  const p = byId.get(id)!;
  const talks = p.talkList.map((t) => ({ ...t, event: eventName(t.event), year: yearOf(eventName(t.event)) })).sort((a, b) => (b.year ?? "").localeCompare(a.year ?? ""));
  const skillCount = new Map<string, number>();
  for (const t of talks) for (const s of skillsOf(t.title)) skillCount.set(s, (skillCount.get(s) ?? 0) + 1);
  for (const s of skillsOf(p.topics.join(" "))) skillCount.set(s, (skillCount.get(s) ?? 0) + 1);
  const years = [...new Set(talks.map((t) => t.year).filter((y): y is string => !!y))].sort();
  return {
    // "Developer Experience, OpenAI" at OpenAI: keep the role without the company repeated
    id, group, name: p.name, role: p.role && p.org ? p.role.replace(new RegExp(`[,@]?\\s*(at\\s+)?${p.org.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "").trim() || null : p.role, org: p.org, source: p.source, links: p.links,
    // a quiet builder is shown by their idea: the title of their talk, without the "— Name, Company" tail
    idea: group === "quiet" && talks[0] ? talks[0].title.replace(/\s+[—–-]\s+[^—–-]*$/, "").trim() : null,
    talks, talkCount: p.talks, editions: [...new Set(p.editions.map((e) => eventName(e) ?? e))], years, topics: p.topics,
    skills: [...skillCount.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s).slice(0, 5),
    products: toolsByOrg.get(norm(p.org)) ?? [],
    initials: p.name.split(/\s+/).filter((w) => /^[\p{L}]/u.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || p.name.slice(0, 2).toUpperCase(),
  };
});
writeFileSync(path.join(root, "web/src/data/people.json"), JSON.stringify({ updated: cands.updated, source: "https://ai.engineer/speakers", people }, null, 1) + "\n");
console.log(`people: ${people.length} published${missing.length ? `; not among the candidates: ${missing.join(", ")}` : ""}`);
