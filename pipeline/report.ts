/* The monthly hiring report, ready to paste into Substack (or LinkedIn): what AI job ads asked for
   in a month against the month before, from the tracker's store. Writes reports/YYYY-MM.md.
   Only numbers the store supports; shares are of the month's ads, changes in percentage points.
   bun pipeline/report.ts              last month
   bun pipeline/report.ts 2026-11      a given month (a month still running is marked so) */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { SEEKER } from "./taxonomy";
import { TASKS } from "./taxonomy";
import { fRoles, skills } from "../web/src/data/framework";
import type { Job } from "./types";

const root = path.resolve(import.meta.dir, "..");
const SITE = "https://vfaraji89.github.io/applied-ai-simplified";
const prevMonth = (m: string) => { const [y, mo] = m.split("-").map(Number); return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`; };
const lastMonth = prevMonth(new Date().toISOString().slice(0, 7));
const month = process.argv[2] ?? lastMonth;
const before = prevMonth(month);
const running = month >= new Date().toISOString().slice(0, 7);

const store = (JSON.parse(readFileSync(path.join(root, "market", "jobs.json"), "utf8")) as Job[]).filter((j) => !(j.source === "hackernews" && SEEKER.test(j.title)));
const when = (j: Job) => (j.posted && j.posted <= j.lastSeen ? j.posted : j.firstSeen);
const inMonth = (m: string) => store.filter((j) => when(j).slice(0, 7) === m);
const now = inMonth(month), prev = inMonth(before);
if (now.length < 30) { console.log(`Only ${now.length} ads in ${month}: no report.`); process.exit(0); }

const share = (xs: Job[], f: (j: Job) => boolean) => (xs.length ? (100 * xs.filter(f).length) / xs.length : 0);
const r0 = (x: number) => Math.round(x);
const pp = (a: number, b: number) => { const d = Math.round(a - b); return d > 0 ? `+${d}` : d === 0 ? "±0" : `${d}`; };
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? "Other AI roles";
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const taskName = (id: string) => TASKS.find((t) => t.id === id)?.name ?? id;
const comparable = prev.length >= 30;
// the tracker started on its first day of reading; a month that began before it only holds the ads still listed then
const started = store.map((j) => j.firstSeen).sort()[0] ?? "";
const partialBefore = comparable && `${before}-01` < started;
const name = new Date(`${month}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const roleIds = [...new Set(now.map((j) => j.role))];
const roles = roleIds.map((id) => ({ id, s: share(now, (j) => j.role === id), p: share(prev, (j) => j.role === id) })).sort((a, b) => b.s - a.s);
const sk = skills.map((s) => ({ id: s.id, s: share(now, (j) => j.skills.includes(s.id)), p: share(prev, (j) => j.skills.includes(s.id)) })).sort((a, b) => b.s - a.s);
const withTasks = (xs: Job[]) => xs.filter((j) => j.tasks !== undefined);
const tk = TASKS.map((t) => ({ id: t.id, s: share(withTasks(now), (j) => !!j.tasks?.includes(t.id)), p: share(withTasks(prev), (j) => !!j.tasks?.includes(t.id)) })).sort((a, b) => b.s - a.s);
const toolCount = new Map<string, number>();
for (const j of now) for (const t of j.tools) toolCount.set(t, (toolCount.get(t) ?? 0) + 1);
const tools = [...toolCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
const movers = comparable ? sk.map((x) => ({ ...x, d: x.s - x.p })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 3) : [];
const remote = share(now, (j) => j.remote);
const labs = now.filter((j) => j.lab);
const years = now.map((j) => j.years).filter((y): y is number => !!y).sort((a, b) => a - b);

const lines = [
  `# Applied AI hiring, ${name}${running ? " (so far)" : ""}`,
  "",
  `*What ${now.length.toLocaleString("en-US")} AI job ads published in ${name}${running ? " so far" : ""} asked for, read from public company career pages and job boards.*`,
  "",
  "## The month in three numbers",
  "",
  `- **${now.length.toLocaleString("en-US")}** AI job ads${comparable ? `, against ${prev.length.toLocaleString("en-US")} the month before` : ""}`,
  `- **${r0(sk[0].s)}%** ask for ${skillName(sk[0].id).toLowerCase()}, the most asked-for skill`,
  `- **${r0(remote)}%** are remote${years.length >= 20 ? `; the median ad asks for **${years[Math.floor(years.length / 2)]} years** of experience` : ""}`,
  "",
  "## Who is being hired",
  "",
  ...roles.slice(0, 5).map((r) => `- ${roleName(r.id)}: ${r0(r.s)}% of ads${comparable ? ` (${pp(r.s, r.p)} pts)` : ""}`),
  "",
  "## The skills they ask for",
  "",
  ...sk.slice(0, 6).map((s) => `- ${skillName(s.id)}: ${r0(s.s)}%${comparable ? ` (${pp(s.s, s.p)} pts)` : ""}`),
  ...(movers.length ? ["", `**Biggest moves:** ${movers.map((m) => `${skillName(m.id)} ${pp(m.s, m.p)} pts`).join(", ")}.`] : []),
  "",
  "## What the job is",
  "",
  ...tk.slice(0, 5).map((t) => `- ${taskName(t.id)}: ${r0(t.s)}% of ads that describe the work`),
  "",
  "## The tools named most",
  "",
  tools.map(([n, c]) => `${n} (${c})`).join(" · "),
  ...(labs.length >= 20 ? ["", `## The AI labs`, "", `${labs.length} of the month's ads came from AI labs' own career pages. Their most asked-for skill: ${skillName([...skills].sort((a, b) => share(labs, (j) => j.skills.includes(b.id)) - share(labs, (j) => j.skills.includes(a.id)))[0].id).toLowerCase()}.`] : []),
  "",
  "---",
  "",
  `**Explore it yourself:** the [market pulse](${SITE}/market/), your [role fit](${SITE}/fit/), and the [open dataset](${SITE}/market/method/#data) (CC BY 4.0).`,
  "",
  ...(partialBefore ? [`**A caution on the changes:** tracking began on ${started}, so ${before} counts only the ads still listed that day. Changes against it are indicative, not exact.`, ""] : []),
  `**How it is made:** ads are classified by rules and checked by hand every month; the [method and error rates](${SITE}/market/method/) are public. A share is of the month's ads; "pts" is the change in percentage points from the month before.`,
  "",
];
mkdirSync(path.join(root, "reports"), { recursive: true });
const file = path.join(root, "reports", `${month}.md`);
writeFileSync(file, lines.join("\n"));
console.log(`report ${month}: ${now.length} ads${comparable ? `, ${prev.length} the month before` : ", no comparison"}, to ${path.relative(root, file)}`);
