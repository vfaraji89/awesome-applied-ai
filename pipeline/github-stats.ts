/* GitHub numbers for the tool map: stars, when the repo was created, the last push, and the
   star count at the previous weekly run (for "trending"). Reads the `github` column of the
   tools tab and writes web/src/data/github-stats.json, which the site reads at build time.
   Runs weekly in the "Find new tools" workflow; a missing or renamed repo is reported and
   skipped, so the badges only ever show numbers GitHub returned.

   bun pipeline/github-stats.ts          fetch and write
   bun pipeline/github-stats.ts --dry    fetch and report only
   GITHUB_TOKEN raises GitHub's rate limits; without it the run takes a few minutes. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const TOOLS = path.join(root, "web", "src", "data", "content", "tools.json");
const OUT = path.join(root, "web", "src", "data", "github-stats.json");
const dry = process.argv.includes("--dry");
const today = new Date().toISOString().slice(0, 10);

type Stat = { stars: number; prev?: number; prevDate?: string; created: string; pushed: string; archived?: boolean };
type File = { updated: string; repos: Record<string, Stat> };
const tools: { id: string; github?: string; url: string }[] = JSON.parse(readFileSync(TOOLS, "utf8"));
const old: File = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { updated: "", repos: {} };

// the repo for each tool: its `github` cell, else a GitHub url
const repoOf = (t: { github?: string; url: string }) =>
  (t.github || t.url.match(/github\.com\/(?!(?:features|marketplace|orgs|topics|sponsors|apps|enterprise|solutions|about|pricing|security|collections|trending)\/)([^/]+\/[^/#?]+)/i)?.[1] || "").replace(/\.git$/, "").toLowerCase();
const repos = [...new Set(tools.map(repoOf).filter((r) => /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(r)))];

const H: Record<string, string> = { accept: "application/vnd.github+json", "user-agent": "awesome-applied-ai-stats" };
if (process.env.GITHUB_TOKEN) H.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const GAP = process.env.GITHUB_TOKEN ? 2200 : 6500;

// the search API answers many repos at once: "repo:a/b repo:c/d" (kept under its 256-character limit)
const batches: string[][] = [];
for (const r of repos) {
  const last = batches[batches.length - 1];
  if (last && [...last, r].map((x) => `repo:${x}`).join(" ").length < 240) last.push(r); else batches.push([r]);
}
const repos2: Record<string, Stat> = {};
const missing: string[] = [];
for (const b of batches) {
  const q = b.map((x) => `repo:${x}`).join(" ");
  let items: any[] = [];
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=100`, { headers: H, signal: AbortSignal.timeout(20000) });
    if (r.status === 403 || r.status === 429) { await sleep(20000); continue; }
    if (r.status === 422) break; // a repo in the batch does not exist; checked one by one below
    if (!r.ok) { await sleep(5000); continue; } // a 5xx from GitHub: wait and try again; still failing, the repos are checked one by one below
    items = (await r.json()).items ?? []; break;
  }
  const got = new Set(items.map((x) => x.full_name.toLowerCase()));
  for (const x of items) {
    const k = x.full_name.toLowerCase(), was = old.repos[k];
    // keep the previous weekly count for "trending": roll it forward once it is six days old
    const roll = !was?.prevDate || was.prevDate <= new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
    repos2[k] = { stars: x.stargazers_count, created: x.created_at.slice(0, 10), pushed: x.pushed_at.slice(0, 10), ...(x.archived ? { archived: true } : {}),
      ...(was ? (roll ? { prev: was.stars, prevDate: old.updated } : { prev: was.prev, prevDate: was.prevDate }) : {}) };
  }
  for (const r of b) if (!got.has(r)) missing.push(r);
  await sleep(GAP);
}
// repos the search did not return: renamed or moved repos still answer on /repos/
for (const r of missing.splice(0)) {
  try {
    const x = await (await fetch(`https://api.github.com/repos/${r}`, { headers: H, signal: AbortSignal.timeout(20000) })).json();
    if (x.full_name) repos2[r] = { stars: x.stargazers_count, created: x.created_at.slice(0, 10), pushed: x.pushed_at.slice(0, 10), ...(x.archived ? { archived: true } : {}) };
    else missing.push(r);
  } catch { missing.push(r); }
  await sleep(process.env.GITHUB_TOKEN ? 200 : 1500);
}
// a lookup that failed (rate limit, outage) keeps last week's numbers rather than dropping the badge
for (const r of missing) if (old.repos[r]) repos2[r] = old.repos[r];
const out: File = { updated: today, repos: Object.fromEntries(Object.entries(repos2).sort()) };
console.log(`github-stats: ${Object.keys(repos2).length} of ${repos.length} repos` + (missing.length ? `; not found: ${missing.join(", ")}` : ""));
if (!dry) writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
