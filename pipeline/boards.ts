/* Find the public career pages of the companies behind the tools on the map, and of the AI labs
   and model providers, so the tracker reads them too. For each tool it tries the GitHub org and
   the website's name as a board slug on each hiring platform. A match is kept only when the slug
   is that strong signal (or, for a name-only guess, the board's own name matches the tool), so a
   stranger's board with the same word is not picked up.
   Writes pipeline/discovered.json; run.ts reads it next to companies.json.
   bun pipeline/boards.ts          probe and write
   bun pipeline/boards.ts --dry    probe and report only */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LABS } from "./labs";

const root = path.resolve(import.meta.dir, "..");
const OUT = path.join(import.meta.dir, "discovered.json");
const dry = process.argv.includes("--dry");
const UA = { "User-Agent": "awesome-applied-ai job-market collector (+https://github.com/vfaraji89/awesome-applied-ai)" };
const tools: { id: string; name: string; url: string; github?: string; model?: string }[] =
  JSON.parse(readFileSync(path.join(root, "web/src/data/content/tools.json"), "utf8"));
const companies = JSON.parse(readFileSync(path.join(import.meta.dir, "companies.json"), "utf8"));

type Hit = { provider: string; slug: string; name: string; tool?: string; kind?: string };
const PROBES: Record<string, (s: string) => Promise<string | null>> = {
  // each returns the board's display name (or the slug when the platform gives none) when the board exists
  greenhouse: async (s) => { const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${s}`, { headers: UA }); return r.ok ? ((await r.json()).name ?? s) : null; },
  lever: async (s) => { const r = await fetch(`https://api.lever.co/v0/postings/${s}?limit=1&mode=json`, { headers: UA }); return r.ok ? s : null; },
  ashby: async (s) => { const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${s}`, { headers: UA }); return r.ok ? s : null; },
  workable: async (s) => { const r = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${s}`, { headers: UA }); return r.ok ? ((await r.json()).name ?? s) : null; },
};
const known = new Set(Object.entries(companies).flatMap(([p, v]) => (Array.isArray(v) ? v.map((x) => `${p}:${typeof x === "string" ? x.toLowerCase() : x.tenant}`) : [])));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const GENERIC_HOSTS = /(^|\.)(github\.com|github\.io|huggingface\.co|pypi\.org|npmjs\.com|arxiv\.org|readthedocs\.io|gitlab\.com|google\.com|microsoft\.com|amazon\.com|aws\.amazon\.com|apple\.com|meta\.com|ibm\.com|nvidia\.com|medium\.com|substack\.com|vercel\.app|notion\.site)$/;

// candidates: [slug, strong?, tool?, label, kind?]
const cands: { slug: string; strong: boolean; tool?: string; name: string; kind?: string }[] = [];
for (const l of LABS) for (const s of l.slugs) cands.push({ slug: s, strong: true, name: l.name, kind: l.kind });
for (const t of tools) {
  const org = t.github?.split("/")[0];
  let host = ""; try { host = new URL(t.url).hostname.replace(/^www\./, ""); } catch { /* no url */ }
  const stem = host && !GENERIC_HOSTS.test(host) ? host.split(".").slice(-2, -1)[0] : "";
  const seen = new Set<string>();
  for (const [s, strong] of [[org, true], [stem, true], [norm(t.name), false]] as [string | undefined, boolean][]) {
    if (!s || s.length < 3 || seen.has(norm(s))) continue;
    seen.add(norm(s)); cands.push({ slug: s.toLowerCase(), strong, tool: t.id, name: t.name });
  }
}

const hits: Hit[] = [];
const jobs = cands.flatMap((c) => Object.keys(PROBES).filter((p) => !known.has(`${p}:${c.slug}`)).map((p) => ({ c, p })));
let i = 0, errors = 0;
async function worker() {
  while (i < jobs.length) {
    const { c, p } = jobs[i++];
    try {
      const name = await PROBES[p](c.slug);
      if (!name) continue;
      // a name-only guess counts only when the board calls itself by the tool's name
      if (!c.strong && !(norm(name).includes(norm(c.name)) && name !== c.slug)) continue;
      hits.push({ provider: p, slug: c.slug, name: name === c.slug ? c.name : name, ...(c.tool ? { tool: c.tool } : {}), ...(c.kind ? { kind: c.kind } : {}) });
    } catch { errors++; }
  }
}
await Promise.all(Array.from({ length: 24 }, worker));

// one board per provider and slug; prefer a lab entry, then the first tool that led to it
const uniq = new Map<string, Hit>();
for (const h of hits.sort((a, b) => (a.kind ? 0 : 1) - (b.kind ? 0 : 1))) if (!uniq.has(`${h.provider}:${h.slug}`)) uniq.set(`${h.provider}:${h.slug}`, h);
const found = [...uniq.values()].sort((a, b) => a.provider.localeCompare(b.provider) || a.slug.localeCompare(b.slug));
console.log(`probed ${jobs.length} slug x platform pairs for ${tools.length} tools and ${LABS.length} labs: ${found.length} new boards, ${errors} errors`);
for (const h of found) console.log(`  ${h.provider.padEnd(10)} ${h.slug.padEnd(22)} ${h.name}${h.tool ? `  (tool: ${h.tool})` : ""}${h.kind ? `  [${h.kind}]` : ""}`);
if (!dry) {
  writeFileSync(OUT, JSON.stringify({ _note: "Written by pipeline/boards.ts. Career pages found for the map's tools and the AI labs. Do not edit; add boards by hand in companies.json.",
    generatedAt: new Date().toISOString(), probed: jobs.length, boards: found }, null, 1) + "\n");
  console.log("wrote", path.relative(root, OUT));
}
