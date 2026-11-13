/* The job-market tracker. Read public job boards, keep AI roles, classify and tag them,
   merge into the all-time store, and write the summary the site renders.
   It is not a job board: no posting, link, description or company is published or stored,
   only what the market summary needs.
   bun pipeline/run.ts            fetch, merge, write
   bun pipeline/run.ts --dry      fetch and report only, write nothing */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { greenhouse, lever, ashby, workday, remotive, arbeitnow, hackerNews, smartrecruiters, workable, recruitee, personio, himalayas, jobicy, boardUrl } from "./sources";
import { isAI, role, seniority, skillsOf, toolsOf, tasksOf, TASKS, inStack } from "./taxonomy";
import { writeWeekly } from "./weekly";
import type { Job, RawJob } from "./types";

const root = path.resolve(import.meta.dir, "..");
const STORE = path.join(root, "market", "jobs.json");
const SUMMARY = path.join(root, "web", "src", "data", "market.json");
const SOURCES = path.join(root, "web", "src", "data", "sources.json");
/** The window the site reports on: every AI job ad published (or first seen) since this day. */
const SINCE = "2026-10-01";
const dry = process.argv.includes("--dry");
// --from-store: read nothing, rebuild the summary and sources list from the store as of its last run
const fromStore = process.argv.includes("--from-store");
const companies = JSON.parse(readFileSync(path.join(import.meta.dir, "companies.json"), "utf8"));
const prevStore: Job[] = existsSync(path.join(root, "market", "jobs.json")) ? JSON.parse(readFileSync(path.join(root, "market", "jobs.json"), "utf8")) : [];
const today = fromStore ? (prevStore.map((j) => j.lastSeen).sort().at(-1) ?? "") : new Date().toISOString().slice(0, 10);

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
  ...(companies.workday ?? []).map((b: { tenant: string; host: string; site: string }) => take(`workday:${b.tenant}`, () => workday(b))),
  ...(companies.smartrecruiters ?? []).map((s: string) => take(`smartrecruiters:${s}`, () => smartrecruiters(s))),
  ...(companies.workable ?? []).map((s: string) => take(`workable:${s}`, () => workable(s))),
  ...(companies.recruitee ?? []).map((s: string) => take(`recruitee:${s}`, () => recruitee(s))),
  ...(companies.personio ?? []).map((s: string) => take(`personio:${s}`, () => personio(s))),
  take("himalayas", himalayas),
  take("jobicy", jobicy),
  take("remotive", remotive),
  take("arbeitnow", arbeitnow),
  take("hackernews", hackerNews),
];
const raw = fromStore ? [] : (await Promise.all(tasks)).flat();
const prev = existsSync(SUMMARY) ? JSON.parse(readFileSync(SUMMARY, "utf8")) : { sources: [] };
if (fromStore) { // the last run's per-source results, as far as the summary kept them
  report.length = 0;
  for (const s of prev.sources ?? []) report.push({ source: s.id, ok: true, jobs: 0, ai: s.ai });
}

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
    remote: j.remote, skills: skillsOf(text), tools: toolsOf(text), tasks: tasksOf(text), ...(j.posted ? { posted: j.posted } : {}), firstSeen: today, lastSeen: today };
});

const store: Job[] = prevStore;

// Safety: a network outage or a broken source must not wipe the summary. If far fewer roles
// came back than were open at the last run, stop without writing and fail the run.
const lastDay = store.map((j) => j.lastSeen).sort().at(-1);
const openBefore = lastDay ? store.filter((j) => j.lastSeen === lastDay).length : 0;
const okSources = report.filter((r) => r.ok).length;
if (!dry && !fromStore && (okSources === 0 || (openBefore >= 50 && fresh.length < openBefore * 0.5))) {
  for (const r of report.filter((x) => !x.ok)) console.log(`FAIL ${r.source}  ${r.note ?? ""}`);
  console.error(`Stopped: ${fresh.length} AI roles from ${okSources}/${report.length} sources, against ${openBefore} open at the last run. Nothing written.`);
  process.exit(1);
}
const byKey = new Map(store.map((j) => [j.key, j]));
let added = 0;
for (const j of fresh) {
  const old = byKey.get(j.key);
  if (old) byKey.set(j.key, { ...j, ...((old.posted ?? j.posted) ? { posted: old.posted ?? j.posted } : {}), firstSeen: old.firstSeen, lastSeen: today });
  else { byKey.set(j.key, j); added++; }
}
const all = [...byKey.values()].sort((a, b) => b.firstSeen.localeCompare(a.firstSeen));
const open = all.filter((j) => j.lastSeen === today);

const count = <T,>(xs: T[], f: (x: T) => string | string[]) => {
  const m = new Map<string, number>();
  for (const x of xs) for (const k of ([] as string[]).concat(f(x))) if (k) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
// The window: ads published since SINCE by the board's own date, or first seen since then when the
// board gives no date. Tracking began on 7 Nov 2026, so October ads count only if still listed then.
const when = (j: Job) => (j.posted && j.posted <= today ? j.posted : j.firstSeen);
const win = all.filter((j) => when(j) >= SINCE);
const months = count(win, (j) => when(j).slice(0, 7)).sort((a, b) => a[0].localeCompare(b[0]));
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);

const summary = {
  generatedAt: new Date().toISOString(),
  since: SINCE,
  totals: { processed: win.length, listedNow: open.length, newToday: added, allTime: all.length, openNow: open.length,
    remoteShare: pct(win.filter((j) => j.remote).length, win.length), dated: pct(win.filter((j) => j.posted).length, win.length) },
  sources: fromStore ? prev.sources : count(report.filter((r) => r.ok), (r) => r.source.split(":")[0]).map(([k]) => ({ id: k, boards: report.filter((r) => r.ok && r.source.split(":")[0] === k).length, ai: report.filter((r) => r.ok && r.source.split(":")[0] === k).reduce((a, r) => a + r.ai, 0) })),
  failed: report.filter((r) => !r.ok).length,
  roles: count(win, (j) => j.role).map(([k, n]) => ({ id: k, n })),
  seniority: count(win, (j) => j.seniority).map(([k, n]) => ({ id: k, n })),
  titles: count(win, (j) => j.title).slice(0, 30).map(([k, n]) => ({ title: k, n })),
  skills: count(win, (j) => j.skills).map(([k, n]) => ({ id: k, n, share: pct(n, win.length) })),
  tasks: count(win.filter((j) => j.tasks), (j) => j.tasks ?? []).map(([k, n]) => ({ id: k, name: TASKS.find((t) => t.id === k)?.name ?? k, n, share: pct(n, win.filter((j) => j.tasks).length) })),
  tools: count(win, (j) => j.tools).slice(0, 40).map(([k, n]) => ({ name: k, n, inStack: inStack(k) })),
  byMonth: months.map(([m, n]) => ({ month: m, n })),
};

// The reference list of every site read: provider, company board and its public career page, and
// whether it answered on the last run. Company names are already public in pipeline/companies.json.
const PROVIDERS: { id: string; name: string; kind: "ats" | "board"; site: string; how: string }[] = [
  { id: "greenhouse", name: "Greenhouse", kind: "ats", site: "https://www.greenhouse.com", how: "Job Board API" },
  { id: "lever", name: "Lever", kind: "ats", site: "https://www.lever.co", how: "Postings API" },
  { id: "ashby", name: "Ashby", kind: "ats", site: "https://www.ashbyhq.com", how: "Job Postings API" },
  { id: "workday", name: "Workday", kind: "ats", site: "https://www.workday.com", how: "career site search" },
  { id: "smartrecruiters", name: "SmartRecruiters", kind: "ats", site: "https://www.smartrecruiters.com", how: "Posting API" },
  { id: "workable", name: "Workable", kind: "ats", site: "https://www.workable.com", how: "careers widget" },
  { id: "recruitee", name: "Recruitee", kind: "ats", site: "https://recruitee.com", how: "Careers Site API" },
  { id: "personio", name: "Personio", kind: "ats", site: "https://www.personio.com", how: "XML job feed" },
  { id: "himalayas", name: "Himalayas", kind: "board", site: "https://himalayas.app", how: "public API" },
  { id: "jobicy", name: "Jobicy", kind: "board", site: "https://jobicy.com", how: "public API" },
  { id: "remotive", name: "Remotive", kind: "board", site: "https://remotive.com", how: "public API" },
  { id: "arbeitnow", name: "Arbeitnow", kind: "board", site: "https://www.arbeitnow.com", how: "public API" },
  { id: "hackernews", name: "Hacker News: Who is hiring", kind: "board", site: "https://news.ycombinator.com", how: "Algolia HN API" },
];
const status = new Map(report.map((r) => [r.source, r]));
const sources = {
  generatedAt: summary.generatedAt,
  providers: PROVIDERS.map((p) => {
    const slugs: { slug: string; wd?: { tenant: string; host: string; site: string } }[] =
      p.id === "workday" ? (companies.workday ?? []).map((b: { tenant: string; host: string; site: string }) => ({ slug: b.tenant, wd: b }))
      : (companies[p.id] ?? []).map((s: string) => ({ slug: s }));
    const boards = slugs.map(({ slug, wd }) => { const r = status.get(`${p.id}:${slug}`);
      return { slug, url: boardUrl(p.id, slug, wd), ok: fromStore ? null : (r?.ok ?? false), ai: r?.ai ?? 0 }; });
    const self = status.get(p.id);
    return { ...p, boards, ok: self ? self.ok : boards.some((b) => b.ok) || (fromStore && win.some((j) => j.source === p.id)), ai: self ? self.ai : boards.reduce((a, b) => a + b.ai, 0),
      processed: win.filter((j) => j.source === p.id).length };
  }),
  excluded: [
    { name: "LinkedIn", site: "https://www.linkedin.com/jobs", why: "Its user agreement forbids automated reading of the site." },
    { name: "Indeed", site: "https://www.indeed.com", why: "Its terms forbid scraping, and its job search API is closed to new users." },
    { name: "Glassdoor", site: "https://www.glassdoor.com", why: "Its terms forbid automated reading, and it has no public jobs API." },
  ],
};

console.log(`AI postings: ${fresh.length} listed now, ${added} new, ${win.length} processed since ${SINCE} (${summary.totals.dated}% with a board date), ${all.length} all time`);
for (const r of report) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.source.padEnd(24)} jobs ${String(r.jobs).padStart(5)}  ai ${String(r.ai).padStart(4)}  ${r.note ?? ""}`);
console.log("roles:", summary.roles.map((r) => `${r.id} ${r.n}`).join(", "));
console.log("skills:", summary.skills.map((s) => `${s.id} ${s.share}%`).join(", "));
console.log("tasks:", summary.tasks.map((t) => `${t.id} ${t.share}%`).join(", "));
console.log("tools:", summary.tools.slice(0, 20).map((t) => `${t.name} ${t.n}`).join(", "));
if (!dry) {
  if (!fromStore) writeFileSync(STORE, JSON.stringify(all));
  writeFileSync(SUMMARY, JSON.stringify(summary, null, 1));
  writeFileSync(SOURCES, JSON.stringify(sources, null, 1) + "\n");
  console.log("wrote", path.relative(root, STORE), path.relative(root, SUMMARY), "and", path.relative(root, SOURCES));
  console.log("weekly snapshot:", writeWeekly(all, fromStore ? undefined : today).join(", "));
}
