/* The job-market tracker. Read public job boards, keep AI roles, classify and tag them,
   merge into the all-time store, and write the summary the site renders.
   It is not a job board: no posting, link, description or company is published or stored,
   only what the market summary needs.
   bun pipeline/run.ts            fetch, merge, write
   bun pipeline/run.ts --dry      fetch and report only, write nothing */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { greenhouse, lever, ashby, remotive, arbeitnow, hackerNews } from "./sources";
import { isAI, role, seniority, skillsOf, toolsOf, inStack } from "./taxonomy";
import { writeWeekly } from "./weekly";
import type { Job, RawJob } from "./types";

const root = path.resolve(import.meta.dir, "..");
const STORE = path.join(root, "market", "jobs.json");
const SUMMARY = path.join(root, "web", "src", "data", "market.json");
const dry = process.argv.includes("--dry");
const today = new Date().toISOString().slice(0, 10);
const companies = JSON.parse(readFileSync(path.join(import.meta.dir, "companies.json"), "utf8"));

const report: { source: string; ok: boolean; jobs: number; ai: number; note?: string }[] = [];
async function take(source: string, fn: () => Promise<RawJob[]>): Promise<RawJob[]> {
  try {
    const all = await fn();
    const ai = all.filter((j) => isAI(j.title));
    report.push({ source, ok: true, jobs: all.length, ai: ai.length });
    return ai;
  } catch (e) {
    report.push({ source, ok: false, jobs: 0, ai: 0, note: String((e as Error).message).slice(0, 120) });
    return [];
  }
}

const tasks: Promise<RawJob[]>[] = [
  ...companies.greenhouse.map((s: string) => take(`greenhouse:${s}`, () => greenhouse(s))),
  ...companies.lever.map((s: string) => take(`lever:${s}`, () => lever(s))),
  ...companies.ashby.map((s: string) => take(`ashby:${s}`, () => ashby(s))),
  take("remotive", remotive),
  take("arbeitnow", arbeitnow),
  take("hackernews", hackerNews),
];
const raw = (await Promise.all(tasks)).flat();

/** Keep the role and its qualifier ("Software Engineer, Agents"); drop brackets and trailing locations or notes. */
const ROLEISH = /engineer|architect|scientist|research|developer|agent|ai\b|ml\b|llm|platform|infrastructure|applied|inference|deployed/i;
const normTitle = (t: string) => {
  const parts = t.replace(/\(.*?\)|\[.*?\]/g, "").split(/\s+[-–|]\s+/).map((x) => x.trim()).filter(Boolean);
  const keep = [parts[0], ...parts.slice(1).filter((x) => ROLEISH.test(x) && x.length < 40)];
  return keep.join(", ").replace(/\s+/g, " ").replace(/\s+,/g, ",").trim().slice(0, 80);
};
const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const fresh: Job[] = raw.map((j) => {
  const text = `${j.title} ${j.text}`;
  return { key: hash(`${j.source}:${j.id}`), source: j.source, title: normTitle(j.title), role: role(j.title), seniority: seniority(j.title),
    remote: j.remote, skills: skillsOf(text), tools: toolsOf(text), firstSeen: today, lastSeen: today };
});

const store: Job[] = existsSync(STORE) ? JSON.parse(readFileSync(STORE, "utf8")) : [];

// Safety: a network outage or a broken source must not wipe the summary. If far fewer roles
// came back than were open at the last run, stop without writing and fail the run.
const lastDay = store.map((j) => j.lastSeen).sort().at(-1);
const openBefore = lastDay ? store.filter((j) => j.lastSeen === lastDay).length : 0;
const okSources = report.filter((r) => r.ok).length;
if (!dry && (okSources === 0 || (openBefore >= 50 && fresh.length < openBefore * 0.5))) {
  for (const r of report.filter((x) => !x.ok)) console.log(`FAIL ${r.source}  ${r.note ?? ""}`);
  console.error(`Stopped: ${fresh.length} AI roles from ${okSources}/${report.length} sources, against ${openBefore} open at the last run. Nothing written.`);
  process.exit(1);
}
const byKey = new Map(store.map((j) => [j.key, j]));
let added = 0;
for (const j of fresh) {
  const old = byKey.get(j.key);
  if (old) byKey.set(j.key, { ...j, firstSeen: old.firstSeen, lastSeen: today });
  else { byKey.set(j.key, j); added++; }
}
const all = [...byKey.values()].sort((a, b) => b.firstSeen.localeCompare(a.firstSeen));
const open = all.filter((j) => j.lastSeen === today);

const count = <T,>(xs: T[], f: (x: T) => string | string[]) => {
  const m = new Map<string, number>();
  for (const x of xs) for (const k of ([] as string[]).concat(f(x))) if (k) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const months = count(all, (j) => j.firstSeen.slice(0, 7)).sort((a, b) => a[0].localeCompare(b[0]));

const summary = {
  generatedAt: new Date().toISOString(),
  totals: { allTime: all.length, openNow: open.length, newToday: added, remoteShare: open.length ? Math.round((open.filter((j) => j.remote).length / open.length) * 100) : 0 },
  sources: count(report.filter((r) => r.ok), (r) => r.source.split(":")[0]).map(([k]) => ({ id: k, boards: report.filter((r) => r.ok && r.source.split(":")[0] === k).length, ai: report.filter((r) => r.ok && r.source.split(":")[0] === k).reduce((a, r) => a + r.ai, 0) })),
  failed: report.filter((r) => !r.ok).length,
  roles: count(open, (j) => j.role).map(([k, n]) => ({ id: k, n })),
  seniority: count(open, (j) => j.seniority).map(([k, n]) => ({ id: k, n })),
  titles: count(open, (j) => j.title).slice(0, 30).map(([k, n]) => ({ title: k, n })),
  skills: count(open, (j) => j.skills).map(([k, n]) => ({ id: k, n, share: open.length ? Math.round((n / open.length) * 100) : 0 })),
  tools: count(open, (j) => j.tools).slice(0, 40).map(([k, n]) => ({ name: k, n, inStack: inStack(k) })),
  byMonth: months.map(([m, n]) => ({ month: m, n })),
};

console.log(`AI postings: ${fresh.length} now, ${added} new, ${all.length} all time`);
for (const r of report) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.source.padEnd(24)} jobs ${String(r.jobs).padStart(5)}  ai ${String(r.ai).padStart(4)}  ${r.note ?? ""}`);
console.log("roles:", summary.roles.map((r) => `${r.id} ${r.n}`).join(", "));
console.log("skills:", summary.skills.map((s) => `${s.id} ${s.share}%`).join(", "));
console.log("tools:", summary.tools.slice(0, 20).map((t) => `${t.name} ${t.n}`).join(", "));
if (!dry) {
  writeFileSync(STORE, JSON.stringify(all));
  writeFileSync(SUMMARY, JSON.stringify(summary, null, 1));
  console.log("wrote", path.relative(root, STORE), "and", path.relative(root, SUMMARY));
  console.log("weekly snapshot:", writeWeekly(all, today).join(", "));
}
