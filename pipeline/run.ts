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
import { isAI, role, seniority, TASKS, inStack, SEEKER } from "./taxonomy";
import { writeWeekly } from "./weekly";
import { extract, jobPart } from "./extract";
import { TECH, familyOf, FAMILIES, BUILD_AI, USE_AI, AI_TERMS } from "./tech";
import { labOf } from "./labs";
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
// boards found for the map's tools and the labs (pipeline/boards.ts), read next to the hand-kept list
type Found = { provider: string; slug: string; name: string; tool?: string; kind?: string };
const discovered: Found[] = existsSync(path.join(import.meta.dir, "discovered.json")) ? JSON.parse(readFileSync(path.join(import.meta.dir, "discovered.json"), "utf8")).boards ?? [] : [];
const meta = new Map<string, Found>(discovered.map((d) => [`${d.provider}:${d.slug}`, d]));
for (const d of discovered) {
  companies[d.provider] ??= [];
  if (!companies[d.provider].some((s: string) => s.toLowerCase() === d.slug)) companies[d.provider].push(d.slug);
}
const decode = (t: string) => t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
// stored rows from before the fixes: Hacker News posts by people looking for work are dropped,
// and titles keep no HTML entities
const prevStore: Job[] = (existsSync(path.join(root, "market", "jobs.json")) ? JSON.parse(readFileSync(path.join(root, "market", "jobs.json"), "utf8")) as Job[] : [])
  .filter((j) => !(j.source === "hackernews" && SEEKER.test(j.title))).map((j) => ({ ...j, title: decode(j.title) }));
const today = fromStore ? (prevStore.map((j) => j.lastSeen).sort().at(-1) ?? "") : new Date().toISOString().slice(0, 10);

const report: { source: string; ok: boolean; jobs: number; ai: number; note?: string }[] = [];
/** Non-AI tech ads from company career pages, kept in memory only for "how AI reaches other jobs".
 *  Reduced to family and three flags right away; nothing about them is stored per ad. */
const others: { family: string; posted: string; build: boolean; use: boolean; terms: string[] }[] = [];
// EVAL_SAMPLE=200: also write a sample of this run's ads for checking by hand (eval/), see eval/README.md
const EVAL_N = Number(process.env.EVAL_SAMPLE ?? 0);
const NEAR = /engineer|scientist|research|developer|architect|data|platform|machine|model/i; // tech titles the AI rule left out
const AGG = new Set(["himalayas", "jobicy", "remotive", "arbeitnow", "hackernews"]);
const nearMiss: RawJob[] = [];
async function take(source: string, fn: () => Promise<RawJob[]>): Promise<RawJob[]> {
  try {
    const all = await fn();
    for (const j of all) {
      if (isAI(j.title) || ["himalayas", "jobicy", "remotive", "arbeitnow", "hackernews"].includes(j.source) || (j.text ?? "").length < 300) continue;
      const family = familyOf(j.title);
      if (!family) continue;
      const part = jobPart(j.text);
      others.push({ family, posted: j.posted, build: BUILD_AI.test(part), use: USE_AI.test(part), terms: AI_TERMS.filter(([, re]) => re.test(part)).map(([n]) => n) });
    }
    const ai = all.filter((j) => isAI(j.title)).map((j) => ({ ...j, board: source }));
    if (EVAL_N) for (const j of all) if (!isAI(j.title) && NEAR.test(j.title) && !AGG.has(j.source)) nearMiss.push(j);
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
// Boards that repost other companies' ads. When the company's own career page carries the same
// ad (same company and title), the repost is dropped so the ad is counted once.
const AGGREGATORS = new Set(["himalayas", "jobicy", "remotive", "arbeitnow", "hackernews"]);
const ckOf = (j: RawJob) => hash(`${j.company.toLowerCase().replace(/[^a-z0-9]/g, "")}|${normTitle(j.title).toLowerCase()}`);
const direct = new Set(raw.filter((j) => !AGGREGATORS.has(j.source)).map(ckOf));
const reposts = raw.filter((j) => AGGREGATORS.has(j.source) && direct.has(ckOf(j))).length;
const keptRaw = raw.filter((j) => !(AGGREGATORS.has(j.source) && direct.has(ckOf(j))));
// per career page: the company's own name and what its AI ads ask for, for the companies pages
// (totals only; nothing per ad is kept with a company)
const perBoard = new Map<string, { company: Map<string, number>; roles: Map<string, number>; skills: Map<string, number>; n: number }>();
const fresh: Job[] = keptRaw.map((j) => {
  const x = extract(j.title, j.text);
  if (j.board && !AGGREGATORS.has(j.source)) {
    const b = perBoard.get(j.board) ?? { company: new Map(), roles: new Map(), skills: new Map(), n: 0 };
    b.n++; b.company.set(j.company, (b.company.get(j.company) ?? 0) + 1);
    const r = role(j.title); b.roles.set(r, (b.roles.get(r) ?? 0) + 1);
    for (const s of x.skills) b.skills.set(s, (b.skills.get(s) ?? 0) + 1);
    perBoard.set(j.board, b);
  }
  return { key: hash(`${j.source}:${j.id}`), source: j.source, title: normTitle(j.title), role: role(j.title), seniority: seniority(j.title),
    remote: j.remote, skills: x.skills, tools: x.tools, tasks: x.tasks, ...(x.tech.length ? { tech: x.tech } : {}), ...(x.toolsPreferred.length ? { toolsPreferred: x.toolsPreferred } : {}),
    ...(x.years ? { years: x.years } : {}), ...(!AGGREGATORS.has(j.source) && labOf(j.company)?.kind === "lab" ? { lab: true } : {}), ck: ckOf(j), ...(j.posted ? { posted: j.posted } : {}), firstSeen: today, lastSeen: today };
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
  sinceQuarter: `${SINCE.slice(0, 4)} Q${Math.ceil(+SINCE.slice(5, 7) / 3)}`,
  totals: { processed: win.length, listedNow: open.length, newToday: added, allTime: all.length, openNow: open.length,
    remoteShare: pct(win.filter((j) => j.remote).length, win.length), dated: pct(win.filter((j) => j.posted).length, win.length) },
  sources: fromStore ? prev.sources : count(report.filter((r) => r.ok), (r) => r.source.split(":")[0]).map(([k]) => ({ id: k, boards: report.filter((r) => r.ok && r.source.split(":")[0] === k).length, ai: report.filter((r) => r.ok && r.source.split(":")[0] === k).reduce((a, r) => a + r.ai, 0) })),
  failed: report.filter((r) => !r.ok).length,
  roles: count(win, (j) => j.role).map(([k, n]) => ({ id: k, n })),
  seniority: count(win, (j) => j.seniority).map(([k, n]) => ({ id: k, n })),
  titles: count(win, (j) => j.title).slice(0, 30).map(([k, n]) => ({ title: k, n })),
  skills: count(win, (j) => j.skills).map(([k, n]) => ({ id: k, n, share: pct(n, win.length) })),
  tasks: count(win.filter((j) => j.tasks), (j) => j.tasks ?? []).map(([k, n]) => ({ id: k, name: TASKS.find((t) => t.id === k)?.name ?? k, n, share: pct(n, win.filter((j) => j.tasks).length) })),
  tools: count(win, (j) => j.tools).slice(0, 40).map(([k, n]) => ({ name: k, n, inStack: inStack(k),
    preferred: win.filter((j) => j.toolsPreferred?.includes(k)).length })),
  years: (() => { const ys = win.map((j) => j.years).filter((y): y is number => !!y).sort((a, b) => a - b);
    const band = (y: number) => (y <= 2 ? "0-2" : y <= 4 ? "3-4" : y <= 7 ? "5-7" : "8+");
    return { asked: pct(ys.length, win.length), median: ys.length ? ys[Math.floor(ys.length / 2)] : 0,
      bands: ["0-2", "3-4", "5-7", "8+"].map((b) => ({ id: b, n: ys.filter((y) => band(y) === b).length })) }; })(),
  byQuarter: count(win, (j) => { const [y, m] = when(j).split("-").map(Number); return `${y} Q${Math.ceil(m / 3)}`; }).sort((a, b) => a[0].localeCompare(b[0])).map(([q, n]) => ({ quarter: q, n })),
  reposts,
  insights: insights(win),
  byWeek: (() => { // AI job ads per week by publish date, Monday to Sunday, from the window's first week
    const monday = (d: string) => { const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); return t.toISOString().slice(0, 10); };
    const m = new Map<string, number>();
    for (const j of win) { const k = monday(when(j)); m.set(k, (m.get(k) ?? 0) + 1); }
    const out: { week: string; n: number; partial?: boolean }[] = [];
    for (let d = monday(SINCE); d <= today; d = new Date(Date.parse(d + "T00:00:00Z") + 7 * 864e5).toISOString().slice(0, 10))
      out.push({ week: d < SINCE ? SINCE : d, n: m.get(d) ?? 0, ...(Date.parse(d + "T00:00:00Z") + 6 * 864e5 > Date.parse(today + "T00:00:00Z") ? { partial: true } : {}) });
    return out; })(),
  tech: techSummary(win, when),
  affected: fromStore ? prev.affected ?? null : affectedSummary(),
  byMonth: months.map(([m, n]) => ({ month: m, n })),
};

/** The general stack by category, with what is new (first named in the last 30 days) and what is
 *  rising (share in the last 30 days against the 30 before). Only ads read with a description count. */
function techSummary(ads: Job[], when: (j: Job) => string) {
  const read = ads.filter((j) => j.tech !== undefined || j.tasks !== undefined);
  if (read.length < 20) return null;
  const cut = new Date(Date.parse(today + "T00:00:00Z") - 30 * 864e5).toISOString().slice(0, 10);
  const cut2 = new Date(Date.parse(today + "T00:00:00Z") - 60 * 864e5).toISOString().slice(0, 10);
  const recent = read.filter((j) => when(j) >= cut), before = read.filter((j) => when(j) >= cut2 && when(j) < cut);
  const pct = (n: number, of: number) => (of ? Math.round((n / of) * 1000) / 10 : 0);
  const cats = TECH.map((c) => ({ id: c.id, name: c.name, items: c.items.map(([name]) => {
    const key = `${c.id}:${name}`, hit = read.filter((j) => j.tech?.includes(key));
    const first = hit.map(when).sort()[0];
    const r = pct(recent.filter((j) => j.tech?.includes(key)).length, recent.length), b = pct(before.filter((j) => j.tech?.includes(key)).length, before.length);
    // "rising" needs 10 mentions; "new" needs a real baseline (500 ads read before the last 30
    // days), else a thin early window makes ordinary names look new
    const baseline = read.filter((j) => when(j) < cut).length;
    return { name, n: hit.length, share: pct(hit.length, read.length), first, ...(before.length >= 20 && hit.length >= 10 ? { change: Math.round((r - b) * 10) / 10 } : {}),
      ...(baseline >= 500 && hit.length >= 3 && first >= cut ? { isNew: true } : {}) };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n) }));
  return { read: read.length, cats };
}

/** How AI is reaching traditional tech jobs: of the non-AI ads in each family published in the
 *  window, the share that ask to build with AI, to work with AI tools, or either. */
function affectedSummary() {
  const win2 = others.filter((o) => o.posted >= SINCE);
  const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
  const rows = FAMILIES.map((f) => {
    const g = win2.filter((o) => o.family === f.id);
    const terms = new Map<string, number>();
    for (const o of g) for (const t of o.terms) terms.set(t, (terms.get(t) ?? 0) + 1);
    return { id: f.id, name: f.name, n: g.length, any: pct(g.filter((o) => o.build || o.use).length, g.length), build: pct(g.filter((o) => o.build).length, g.length),
      use: pct(g.filter((o) => o.use).length, g.length), terms: [...terms.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t) };
  }).filter((r) => r.n >= 20).sort((a, b) => b.any - a.any);
  return { since: SINCE, ads: win2.length, any: pct(win2.filter((o) => o.build || o.use).length, win2.length), rows };
}

/** Cross-cuts for the market page: what each role asks, which skills travel together, what labs
 *  ask that others do not, and a profile per skill. Shares are whole percentages of the ads in
 *  each group; groups under MIN ads are left out so a handful of ads cannot make a headline. */
function insights(ads: Job[]) {
  const MIN = 20;
  const share = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
  const has = (j: Job, s: string) => j.skills.includes(s);
  const skillIds = count(ads, (j) => j.skills).map(([k]) => k);
  const roleIds = count(ads, (j) => j.role).map(([k]) => k).filter((r) => r !== "other-ai" && ads.filter((j) => j.role === r).length >= MIN);
  const grid = (rows: string[], cols: string[], pick: (j: Job) => string[]) => ({
    rows, cols,
    n: rows.map((r) => ads.filter((j) => j.role === r).length),
    cells: rows.map((r) => { const g = ads.filter((j) => j.role === r); return cols.map((c) => share(g.filter((j) => pick(j).includes(c)).length, g.length)); }),
  });
  const withTasks = ads.filter((j) => j.tasks);
  const taskIds = count(withTasks, (j) => j.tasks ?? []).map(([k]) => k);
  // pairs: how much more often two skills appear together than if they were independent (lift)
  const pairs: { a: string; b: string; n: number; share: number; lift: number }[] = [];
  for (let i = 0; i < skillIds.length; i++) for (let k = i + 1; k < skillIds.length; k++) {
    const a = skillIds[i], b = skillIds[k];
    const na = ads.filter((j) => has(j, a)).length, nb = ads.filter((j) => has(j, b)).length, nab = ads.filter((j) => has(j, a) && has(j, b)).length;
    if (nab < MIN || !na || !nb) continue;
    pairs.push({ a, b, n: nab, share: share(nab, ads.length), lift: Math.round(((nab * ads.length) / (na * nb)) * 100) / 100 });
  }
  const labAds = ads.filter((j) => j.lab), rest = ads.filter((j) => !j.lab);
  const AI_DEV = ["Cursor", "Claude Code", "GitHub Copilot", "Codex", "Windsurf", "Devin", "Aider", "Cline"];
  return {
    perAd: { skills: Math.round((ads.reduce((a, j) => a + j.skills.length, 0) / (ads.length || 1)) * 10) / 10,
      wide: share(ads.filter((j) => j.skills.length >= 5).length, ads.length) },
    aiDev: { share: share(ads.filter((j) => j.tools.some((t) => AI_DEV.includes(t))).length, ads.length), tools: AI_DEV.filter((t) => ads.some((j) => j.tools.includes(t))) },
    junior: share(ads.filter((j) => /^(intern|junior)$/i.test(j.seniority)).length, ads.length),
    roleSkill: grid(roleIds, skillIds, (j) => j.skills),
    roleTask: withTasks.length >= MIN ? { ...grid(roleIds.filter((r) => withTasks.filter((j) => j.role === r).length >= MIN), taskIds, (j) => j.tasks ?? []) } : null,
    pairs: pairs.sort((x, y) => y.lift - x.lift).slice(0, 8),
    remoteByRole: roleIds.map((r) => { const g = ads.filter((j) => j.role === r); return { id: r, n: g.length, share: share(g.filter((j) => j.remote).length, g.length) }; }).sort((a, b) => b.share - a.share),
    yearsByLevel: count(ads.filter((j) => j.years), (j) => j.seniority).filter(([, n]) => n >= MIN).map(([lvl]) => {
      const ys = ads.filter((j) => j.seniority === lvl && j.years).map((j) => j.years!).sort((a, b) => a - b);
      return { id: lvl, n: ys.length, median: ys[Math.floor(ys.length / 2)], low: ys[Math.floor(ys.length / 4)], high: ys[Math.floor((ys.length * 3) / 4)] };
    }),
    labs: labAds.length >= MIN ? { n: labAds.length, rest: rest.length,
      skills: skillIds.map((s) => ({ id: s, lab: share(labAds.filter((j) => has(j, s)).length, labAds.length), rest: share(rest.filter((j) => has(j, s)).length, rest.length) })) } : null,
    skills: skillIds.map((s) => {
      const g = ads.filter((j) => has(j, s));
      const byRole = roleIds.map((r) => { const rg = ads.filter((j) => j.role === r); return { id: r, share: share(rg.filter((j) => has(j, s)).length, rg.length) }; }).sort((a, b) => b.share - a.share);
      // what comes with this skill more than it comes with any ad: lift over the overall share
      const lift = (inG: number, overall: number) => (overall ? Math.round(((inG / (g.length || 1)) / (overall / ads.length)) * 10) / 10 : 0);
      const withSkill = skillIds.filter((o) => o !== s).map((o) => { const k = g.filter((j) => has(j, o)).length;
        return { id: o, share: share(k, g.length), lift: lift(k, ads.filter((j) => has(j, o)).length), k }; })
        .filter((x) => x.k >= MIN).sort((a, b) => b.lift - a.lift);
      const toolLift = count(g, (j) => j.tools).filter(([, k]) => k >= 5).map(([t, k]) => ({ name: t, share: share(k, g.length), lift: lift(k, ads.filter((j) => j.tools.includes(t)).length) }))
        .sort((a, b) => b.lift - a.lift);
      // detail for the skill's own page: every co-skill, more tools, tasks, years, remote, levels
      const gt = g.filter((j) => j.tasks);
      const allT = ads.filter((j) => j.tasks);
      const taskShare = count(gt, (j) => j.tasks ?? []).slice(0, 8).map(([t, k]) => {
        const base = allT.filter((j) => j.tasks!.includes(t)).length / (allT.length || 1); // share of all ads read with tasks
        return { id: t, share: share(k, gt.length), lift: base ? Math.round(((k / gt.length) / base) * 10) / 10 : 0 };
      });
      const ys = g.map((j) => j.years).filter((y): y is number => !!y).sort((a, b) => a - b);
      return { id: s, n: g.length, share: share(g.length, ads.length), topRole: byRole[0] ?? null,
        with: withSkill.slice(0, 2).map(({ id, share: sh, lift: l }) => ({ id, share: sh, lift: l })), tools: toolLift.slice(0, 4).map((t) => t.name), toolLift: toolLift.slice(0, 4),
        detail: {
          withAll: withSkill.map(({ id, share: sh, lift: l }) => ({ id, share: sh, lift: l })),
          tools: toolLift.slice(0, 10),
          tasks: gt.length >= MIN ? taskShare : [],
          years: ys.length >= 10 ? { asked: share(ys.length, g.length), median: ys[Math.floor(ys.length / 2)] } : null,
          remote: share(g.filter((j) => j.remote).length, g.length),
          levels: count(g, (j) => j.seniority).map(([lvl, k]) => ({ id: lvl, share: share(k, g.length) })),
          byRole,
        } };
    }),
  };
}

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
      const m = meta.get(`${p.id}:${slug}`), lab = labOf(slug);
      const pb = perBoard.get(`${p.id}:${slug}`), top = (m2?: Map<string, number>, k = 3) => m2 ? [...m2.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, k).map(([id, n]) => ({ id, share: Math.round((100 * n) / (pb?.n || 1)) })) : [];
      return { slug, url: boardUrl(p.id, slug, wd), ok: fromStore ? null : (r?.ok ?? false), ai: r?.ai ?? 0,
        ...(pb ? { company: [...pb.company.entries()].sort((a, b2) => b2[1] - a[1])[0]?.[0], roles: top(pb.roles), skills: top(pb.skills, 5) } : {}),
        ...(lab ? { name: lab.name, kind: lab.kind } : m ? { name: m.name, ...(m.kind ? { kind: m.kind } : {}) } : {}), ...(m?.tool ? { tool: m.tool } : {}) }; });
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
console.log("affected:", summary.affected ? summary.affected.rows.map((r: { id: string; any: number; n: number }) => `${r.id} ${r.any}% of ${r.n}`).join(", ") : "none");
console.log(`reposts dropped: ${reposts}; years asked in ${summary.years.asked}% (median ${summary.years.median})`);
console.log("tasks:", summary.tasks.map((t) => `${t.id} ${t.share}%`).join(", "));
console.log("tools:", summary.tools.slice(0, 20).map((t) => `${t.name} ${t.n}`).join(", "));
if (EVAL_N) writeEvalSample();
// --out DIR: also write what a real run would write, into DIR (for a dry run's artifact)
const outDir = process.argv.includes("--out") ? process.argv[process.argv.indexOf("--out") + 1] : "";
if (outDir) {
  const { mkdirSync } = await import("node:fs");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "market.json"), JSON.stringify(summary, null, 1));
  writeFileSync(path.join(outDir, "sources.json"), JSON.stringify(sources, null, 1) + "\n");
  writeFileSync(path.join(outDir, "jobs.json"), JSON.stringify(all));
  console.log("wrote the would-be outputs to", outDir);
}
if (!dry) {
  if (!fromStore) writeFileSync(STORE, JSON.stringify(all));
  writeFileSync(SUMMARY, JSON.stringify(summary, null, 1));
  writeFileSync(SOURCES, JSON.stringify(sources, null, 1) + "\n");
  console.log("wrote", path.relative(root, STORE), path.relative(root, SUMMARY), "and", path.relative(root, SOURCES));
  console.log("weekly snapshot:", writeWeekly(all, fromStore ? undefined : today).join(", "));
}

/** A sample for checking by hand: ads the rules kept (spread across roles) and tech ads the AI rule
 *  left out, each with a link to read it at the source and what the rules decided. No ad text. */
function writeEvalSample() {
  const { mkdirSync } = require("node:fs") as typeof import("node:fs");
  const month = today.slice(0, 7);
  let seed = [...month].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const shuffle = <T,>(xs: T[]) => { const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; };
  const kept = keptRaw.map((r, i) => ({ r, j: fresh[i] })).filter((x) => x.r.url && !AGG.has(x.r.source));
  const nKept = Math.round(EVAL_N * 0.8), nNear = EVAL_N - nKept;
  const byRole = new Map<string, typeof kept>();
  for (const x of shuffle(kept)) byRole.set(x.j.role, [...(byRole.get(x.j.role) ?? []), x]);
  // every role at least a few, the rest in proportion
  const pick: typeof kept = [];
  const floor = Math.min(6, Math.floor(nKept / Math.max(1, byRole.size)));
  for (const xs of byRole.values()) pick.push(...xs.slice(0, floor));
  const rest = shuffle(kept.filter((x) => !pick.includes(x)));
  pick.push(...rest.slice(0, Math.max(0, nKept - pick.length)));
  const near = shuffle(nearMiss.filter((j) => j.url)).slice(0, nNear);
  const items = [
    ...pick.map(({ r, j }) => ({ key: j.key, source: r.source, company: r.company, title: r.title, url: r.url, pred: { ai: true, role: j.role, seniority: j.seniority, skills: j.skills, tasks: j.tasks ?? [] } })),
    ...near.map((r) => ({ key: hash(`${r.source}:${r.id}`), source: r.source, company: r.company, title: r.title, url: r.url, pred: { ai: false, role: "", seniority: seniority(r.title), skills: [], tasks: [] } })),
  ];
  const dir = path.join(root, "eval");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `sample-${month}.json`);
  writeFileSync(file, JSON.stringify({ month, created: today, kept: pick.length, nearMiss: near.length, items: shuffle(items) }, null, 1) + "\n");
  console.log(`eval sample: ${pick.length} kept and ${near.length} left out, to ${path.relative(root, file)}`);
}
