/* The companies pages' data: applied AI companies seen from three sides, each with its source.
   - Hiring: the AI roles open on their own career page at the tracker's last run, and the roles and
     skills those ads ask for (web/src/data/sources.json, totals only).
   - Building: their products on the tool map (tools named like the company).
   - On stage: their speakers and talks at AI Engineer (conferences/orgs.json, from ai.engineer).
   A company is listed when at least two sides show it, when it has 10 or more AI roles open, or when it
   is an AI lab hiring now.
   web/src/data/companies-hidden.json lists ids to leave out.
   bun pipeline/companies.ts */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const read = (p: string) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
// one key for every spelling of a company: "Together AI", "togetherai" and "Together" meet at "together"
const norm = (s: string) => s.toLowerCase().replace(/\b(inc|llc|ltd|gmbh|corp|corporation|labs?|ai|hq|technologies|technology)\b/g, "").replace(/[^a-z0-9]/g, "").replace(/(.{3,})(ai|labs?|hq|inc)$/, "$1");
const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const pretty = (s: string) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type Board = { slug: string; url: string; ok: boolean | null; ai: number; name?: string; kind?: string; company?: string; roles?: { id: string; share: number }[]; skills?: { id: string; share: number }[] };
const sources = read("web/src/data/sources.json") as { generatedAt: string; providers: { id: string; name: string; boards?: Board[] }[] };
const orgs = (read("conferences/orgs.json") as { orgs: { id: string; name: string; source: string; speakers: number; talks: number }[] }).orgs;
const tools = read("web/src/data/content/tools.json") as { id: string; name: string; area: string; summary: string; url: string }[];
const people = (read("web/src/data/people.json") as { people: { id: string; name: string; role: string | null; org: string | null; initials: string; talkCount: number }[] }).people;
const hidden = new Set(existsSync(path.join(root, "web/src/data/companies-hidden.json")) ? read("web/src/data/companies-hidden.json").ids : []);

type Co = { key: string; name: string; lab: boolean; hiring: { open: number; boards: { url: string; platform: string; open: number }[]; roles: { id: string; share: number }[]; skills: { id: string; share: number }[] } | null;
  products: { id: string; name: string; area: string }[]; stage: { speakers: number; talks: number; source: string } | null; people: string[] };
const all = new Map<string, Co>();
const get = (name: string) => {
  const k = norm(name) || slug(name);
  if (!all.has(k)) all.set(k, { key: k, name, lab: false, hiring: null, products: [], stage: null, people: [] });
  return all.get(k)!;
};

for (const p of sources.providers) for (const b of p.boards ?? []) {
  if (!b.ok || b.ai <= 0) continue;
  const c = get(b.company || b.name || pretty(b.slug));
  if (b.name) c.name = b.name; else if (b.company && c.name === pretty(b.slug)) c.name = b.company;
  if (b.kind === "lab") c.lab = true;
  const h = c.hiring ?? { open: 0, boards: [], roles: [], skills: [] };
  h.open += b.ai; h.boards.push({ url: b.url, platform: p.name, open: b.ai });
  if (b.roles?.length && (!h.roles.length || b.ai > (h.boards[0]?.open ?? 0))) { h.roles = b.roles; h.skills = b.skills ?? []; }
  c.hiring = h;
}
for (const o of orgs) {
  const c = all.get(norm(o.name)) ?? (o.talks >= 3 ? get(o.name) : null);
  if (c) c.stage = { speakers: o.speakers, talks: o.talks, source: o.source };
}
// a product belongs to a company when it is named like it, or its website is the company's domain
const domainRoot = (u: string) => { try { const h = new URL(u).hostname.replace(/^www\./, "").split("."); return h.length >= 2 ? h[h.length - 2] : ""; } catch { return ""; } };
// hosting and publishing sites say nothing about who makes a tool
const HOSTS = new Set(["github", "gitlab", "npmjs", "pypi", "readthedocs", "medium", "substack", "youtube", "notion", "vercel", "netlify", "githubusercontent", "arxiv", "amazonaws"]);
const ALIAS: Record<string, string> = { claude: "anthropic", chatgpt: "openai", huggingface: "huggingface", deepmind: "googledeepmind" };
for (const t of tools) {
  const root = domainRoot(t.url), d = HOSTS.has(root) ? "" : norm(root);
  const c = all.get(norm(t.name)) ?? (d ? all.get(ALIAS[d] ?? d) : undefined);
  if (c && !c.products.some((x) => x.id === t.id)) c.products.push({ id: t.id, name: t.name, area: t.area });
}
for (const p of people) { const c = p.org ? all.get(norm(p.org)) : undefined; if (c) c.people.push(p.id); }

// boards whose platform gives only a slug for the company name
const NAMES: Record<string, string> = { andurilindustries: "Anduril Industries", scaleai: "Scale AI", boschgroup: "Bosch", doordashusa: "DoorDash", gleanwork: "Glean", snorkelai: "Snorkel AI", gitlab: "GitLab", livekit: "LiveKit" };
for (const c of all.values()) { const n = NAMES[c.name.toLowerCase().replace(/[^a-z0-9]/g, "")]; if (n) c.name = n; }
// the nicest spelling we have: AI Engineer's or the tool map's, else the board's if it is not just a slug
const proper = new Map<string, string>([...tools.map((t) => [norm(t.name), t.name] as const), ...orgs.map((o) => [norm(o.name), o.name] as const)]);
for (const c of all.values()) {
  const better = proper.get(c.key);
  if (better && (c.name === c.name.toLowerCase() || /^[A-Z][a-z]+$/.test(c.name) || c.name.replace(/\s/g, "").toLowerCase() === c.key)) c.name = better;
  else if (c.name === c.name.toLowerCase()) c.name = c.name.replace(/\b\w/g, (x) => x.toUpperCase());
}
const list = [...all.values()].filter((c) => {
  const sides = (c.hiring && c.hiring.open >= 5 ? 1 : 0) + (c.products.length ? 1 : 0) + (c.stage && c.stage.talks >= 3 ? 1 : 0);
  return (sides >= 2 || (c.lab && c.hiring) || (c.hiring?.open ?? 0) >= 10) && !hidden.has(slug(c.name));
}).map((c) => ({
  id: slug(c.name), name: c.name, lab: c.lab, hiring: c.hiring, products: c.products, stage: c.stage, people: c.people,
  initials: ((i) => (i === "AI" ? c.name.slice(0, 2) : i))(c.name.split(/[\s.-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()).toUpperCase(),
})).sort((a, b) => (b.hiring?.open ?? 0) + (b.stage?.talks ?? 0) - ((a.hiring?.open ?? 0) + (a.stage?.talks ?? 0)));

writeFileSync(path.join(root, "web/src/data/companies.json"), JSON.stringify({ updated: sources.generatedAt?.slice(0, 10) ?? null, companies: list }, null, 1) + "\n");
console.log(`companies: ${list.length} (${list.filter((c) => c.lab).length} labs, ${list.filter((c) => c.hiring).length} hiring, ${list.filter((c) => c.products.length).length} on the map, ${list.filter((c) => c.stage).length} on stage)`);
console.log(list.slice(0, 15).map((c) => `${c.name} ${c.hiring?.open ?? 0}/${c.stage?.talks ?? 0}/${c.products.length}`).join(", "));
