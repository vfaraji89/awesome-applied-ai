/* The open dataset: one row per AI job ad, derived fields only, from the store the tracker keeps.
   No title, company, link or ad text: only what was read from each ad (role, level, skills, tasks,
   tools, stack, years asked) and when it was seen. Rows come only from company career pages read
   through their hiring platforms; ads from public job boards and Hacker News are counted in the
   monthly totals but not published row by row, since those boards' terms limit redistribution.
   Licensed CC BY 4.0 (dataset/LICENSE), cited through CITATION.cff and, once Zenodo is linked, a DOI.
   bun pipeline/dataset.ts                    through the last day of last month
   bun pipeline/dataset.ts --through 2026-11-13 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { SEEKER } from "./taxonomy";
import type { Job } from "./types";

const root = path.resolve(import.meta.dir, "..");
const OUT = path.join(root, "dataset");
const arg = (k: string) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : "");
const lastOfPrevMonth = () => { const d = new Date(); d.setUTCDate(0); return d.toISOString().slice(0, 10); };
const through = arg("--through") || lastOfPrevMonth();
const version = through.slice(0, 7) === new Date(Date.parse(through) + 864e5).toISOString().slice(0, 7) ? through : through.slice(0, 7);

/** Company career pages read through their hiring platform: published row by row. */
export const ROW_SOURCES = ["greenhouse", "lever", "ashby", "workday", "smartrecruiters", "workable", "recruitee", "personio"];

const store = (JSON.parse(readFileSync(path.join(root, "market", "jobs.json"), "utf8")) as Job[])
  .filter((j) => !(j.source === "hackernews" && SEEKER.test(j.title)));
const when = (j: Job) => (j.posted && j.posted <= j.lastSeen ? j.posted : j.firstSeen);
const inRange = store.filter((j) => j.firstSeen <= through);
const rowsJobs = inRange.filter((j) => ROW_SOURCES.includes(j.source)).sort((a, b) => when(a).localeCompare(when(b)) || a.key.localeCompare(b.key));

const COLS = ["id", "platform", "posted", "first_seen", "last_seen", "role", "seniority", "remote", "ai_lab", "years_asked", "skills", "tasks", "tools", "tools_preferred", "stack"] as const;
const rows = rowsJobs.map((j) => ({
  id: j.key, platform: j.source, posted: j.posted ?? "", first_seen: j.firstSeen, last_seen: j.lastSeen > through ? through : j.lastSeen,
  role: j.role, seniority: j.seniority, remote: j.remote, ai_lab: !!j.lab, years_asked: j.years ?? null,
  skills: j.skills, tasks: j.tasks ?? null, tools: j.tools, tools_preferred: j.toolsPreferred ?? [], stack: j.tech ?? null,
}));
const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join(";") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [COLS.join(","), ...rows.map((r) => COLS.map((c) => cell(r[c])).join(","))].join("\n") + "\n";

// every source, row-published or not: ads per month, by role
const months = new Map<string, Map<string, number>>();
const FROM = "2026-10"; // the site's window; ads first published before it are kept as one "earlier" row
for (const j of inRange) {
  const m = when(j).slice(0, 7) < FROM ? "earlier" : when(j).slice(0, 7);
  const r = months.get(m) ?? new Map<string, number>();
  r.set(j.role, (r.get(j.role) ?? 0) + 1); r.set("all", (r.get("all") ?? 0) + 1);
  months.set(m, r);
}
const roleIds = [...new Set(inRange.map((j) => j.role))].sort();
const totals = ["month,all," + roleIds.join(","), ...[...months.entries()].sort((a, b) => (a[0] === "earlier" ? -1 : b[0] === "earlier" ? 1 : a[0].localeCompare(b[0]))).map(([m, r]) => [m, r.get("all") ?? 0, ...roleIds.map((x) => r.get(x) ?? 0)].join(","))].join("\n") + "\n";

mkdirSync(OUT, { recursive: true });
const metaPath = path.join(OUT, "meta.json");
const prev = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : {};
const span = rows.length ? [rows.map((r) => r.posted || r.first_seen).sort()[0], through] : [through, through];
const meta = {
  title: "Applied AI job ads: what employers ask for",
  version, through, rows: rows.length, allAds: inRange.length,
  rowPlatforms: ROW_SOURCES.filter((s) => rows.some((r) => r.platform === s)),
  span, generatedAt: new Date().toISOString(), licence: "CC-BY-4.0",
  doi: prev.doi ?? null, conceptDoi: prev.conceptDoi ?? null, ...(prev.zenodoId ? { zenodoId: prev.zenodoId } : {}),
  site: "https://vfaraji89.github.io/awesome-applied-ai/market/method/",
};
writeFileSync(path.join(OUT, "applied-ai-job-ads.csv"), csv);
writeFileSync(path.join(OUT, "applied-ai-job-ads.json"), JSON.stringify(rows));
writeFileSync(path.join(OUT, "monthly-totals.csv"), totals);
writeFileSync(metaPath, JSON.stringify(meta, null, 1) + "\n");
// the method page shows the version, counts and DOI
writeFileSync(path.join(root, "web/src/data/dataset-meta.json"), JSON.stringify(meta, null, 1) + "\n");

const count = (f: (r: (typeof rows)[number]) => string) => { const m = new Map<string, number>(); for (const r of rows) m.set(f(r), (m.get(f(r)) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
const cite = `Faraji, V. (${through.slice(0, 4)}). Applied AI job ads: what employers ask for (version ${version}) [Data set].${meta.conceptDoi ? ` https://doi.org/${meta.conceptDoi}` : " https://github.com/vfaraji89/awesome-applied-ai/tree/main/dataset"}`;
const size = rows.length < 1e4 ? "1K<n<10K" : rows.length < 1e5 ? "10K<n<100K" : "100K<n<1M";
// the front matter is for Hugging Face, which reads the licence and the data files from it
writeFileSync(path.join(OUT, "README.md"), `---
license: cc-by-4.0
pretty_name: "Applied AI job ads: what employers ask for"
language: [en]
tags: [jobs, labour-market, applied-ai, skills, ai-engineering]
size_categories: ["${size}"]
configs:
  - config_name: default
    data_files: applied-ai-job-ads.csv
---

# Applied AI job ads: what employers ask for

One row per AI job ad, with what the ad asks for: the role, the level, the skills, the tasks, the
tools, the general stack and the years of experience, read from public company career pages every
day by the tracker behind [awesome-applied-ai](https://vfaraji89.github.io/awesome-applied-ai/market/).

**Version ${version}** · ${rows.length.toLocaleString("en-US")} ads published row by row, ${inRange.length.toLocaleString("en-US")} ads in the monthly totals · seen up to ${through}
${meta.doi ? `\nDOI: https://doi.org/${meta.doi}\n` : ""}
## Files

| File | What |
|---|---|
| \`applied-ai-job-ads.csv\` | one row per ad (lists joined with \`;\`) |
| \`applied-ai-job-ads.json\` | the same rows as JSON, lists as arrays |
| \`monthly-totals.csv\` | ads per month and role, from every source including job boards |
| \`meta.json\` | version, counts, span and DOI |

## Columns

| Column | Meaning |
|---|---|
| \`id\` | a hash of the platform and the ad's own id, stable across versions; not reversible to the ad |
| \`platform\` | the hiring platform the company's career page runs on |
| \`posted\` | the publish date the platform gives, when it gives one |
| \`first_seen\`, \`last_seen\` | the first and last day the tracker found the ad listed |
| \`role\` | one of eight applied AI roles, set from the job title |
| \`seniority\` | Junior, Mid, Senior, Staff+ or Lead, set from the job title |
| \`remote\` | the platform marks the ad remote |
| \`ai_lab\` | read from an AI lab's or model provider's own career page |
| \`years_asked\` | the smallest years of experience the ad asks for, when it says |
| \`skills\` | which of twelve applied AI skills the requirements ask for |
| \`tasks\` | what the ad asks you to do, from twelve tasks (empty when the ad had no readable description) |
| \`tools\` | named tools and products (models, frameworks, clouds, vector stores...) |
| \`tools_preferred\` | the tools named only as nice to have |
| \`stack\` | the general stack, as \`category:name\` (\`lang:Python\`, \`front:React\`...) |

Roles, skills and tasks are defined on the [method page](${meta.site}), with how each is read and how
often the reading is wrong, measured by hand on a sample every month.

## What is not here, and why

- **No title, company, link or ad text.** The tracker never stores ad text; titles and companies stay out
  so the data describes the market, not single employers or people.
- **Job boards and Hacker News appear only in \`monthly-totals.csv\`.** Their terms limit redistribution,
  so their ads are counted but not published row by row.

## Rows by platform

${count((r) => r.platform).map(([k, n]) => `- ${k}: ${n.toLocaleString("en-US")}`).join("\n")}

## Known limits

- Mostly English-language ads, from companies whose career pages run on the platforms above: tech
  companies and the US are over-represented.
- Role and level come from the title alone; skills and tasks from keyword rules on the requirements.
  The error rates are on the method page.
- Tracking began on 7 November 2026; earlier ads are included only if they were still listed then.
- Some platforms give an evergreen ad's original publish date, years back; \`posted\` keeps it as given,
  so filter on \`first_seen\` for what was open in a period.

## Licence and citation

[CC BY 4.0](LICENSE): use it for anything, including commercial work, with credit. Please cite:

> ${cite}

The website, its text and its code are not covered by this licence.
`);
// keep the citation file's version and date in step
const cffPath = path.join(root, "CITATION.cff");
if (existsSync(cffPath)) writeFileSync(cffPath, readFileSync(cffPath, "utf8").replace(/^version: .*$/m, `version: "${version}"`).replace(/^date-released: .*$/m, `date-released: "${new Date().toISOString().slice(0, 10)}"`)
  .replace(/^doi: .*\n/m, "") + (meta.conceptDoi ? `doi: "${meta.conceptDoi}"\n` : ""));
console.log(`dataset ${version}: ${rows.length} rows (${inRange.length} ads in totals), through ${through}`);
