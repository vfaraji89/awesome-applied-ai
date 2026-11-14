/* The conference tracker: what applied AI conferences talk about, to set against what job ads ask for.
   Reads official, machine-readable schedules and archives once a month:
   - AI Engineer (ai.engineer): every edition's recorded talks from its public data API, and the
     schedule (sessions.json) of editions published that way; dates and places from its llms.txt.
   - PyTorch Conference: the official Sched calendar export of each edition.
   - Microsoft Build: the official session catalogue.
   Each talk's title and description run through the same rules as the job ads (skills, tasks, tools).
   Kept: counts, talk titles, speaker names, organisations and links, each with its source URL.
   Not kept: descriptions, biographies, portraits or transcripts.
   Writes web/src/data/conferences.json (the page) and conferences/people.json and conferences/orgs.json
   (candidates for the curated people and companies pages).
   bun pipeline/conferences.ts */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { skillsOf, tasksOf, toolsOf } from "./taxonomy";

const root = path.resolve(import.meta.dir, "..");
const UA = { "User-Agent": "awesome-applied-ai conference tracker (+https://github.com/vfaraji89/awesome-applied-ai)" };
const AIE = "https://ai.engineer";
const get = async (url: string, accept = "application/json") => {
  const r = await fetch(url, { headers: { ...UA, Accept: accept }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return accept.includes("json") ? r.json() : r.text();
};
const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "2026-04-08 to 2026-04-10", "November 19-22, 2025", "February 17-19, 2027" or "June 3-5, 2025" -> ISO start and end. */
function dates(s: string): { start: string; end: string } | null {
  const iso = s.match(/(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})/);
  if (iso) return { start: iso[1], end: iso[2] };
  const m = s.toLowerCase().match(/([a-z]+)\s+(\d{1,2})(?:\s*-\s*(?:([a-z]+)\s+)?(\d{1,2}))?,?\s*(\d{4})/);
  if (!m) return null;
  const mo = MONTHS.indexOf(m[1]), mo2 = m[3] ? MONTHS.indexOf(m[3]) : mo;
  if (mo < 0) return null;
  const d = (y: string, mm: number, dd: string) => `${y}-${String(mm + 1).padStart(2, "0")}-${dd.padStart(2, "0")}`;
  return { start: d(m[5], mo, m[2]), end: d(m[5], mo2, m[4] ?? m[2]) };
}

type Talk = { edition: string; title: string; text: string; track?: string; kind: "talk" | "workshop" | "keynote" | "panel"; speakers: string[]; url?: string };
type Edition = { id: string; series: string; name: string; start: string; end: string; location: string; url: string; source: string; talks: Talk[] };
const editions = new Map<string, Edition>();
const upcoming: { name: string; series: string; start: string; end: string; location: string; url: string }[] = [];
const report: string[] = [];
const kindOf = (t: string) => (/workshop/i.test(t) ? "workshop" : /keynote/i.test(t) ? "keynote" : /panel/i.test(t) ? "panel" : "talk") as Talk["kind"];
const NOT_TALK = /\b(break|lunch|breakfast|dinner|registration|badge|expo|reception|party|networking|happy hour|coffee|closing remarks|opening remarks|doors open|welcome reception|meetup|orientation|overflow|viewing|exhibit|cocktail|social)\b/i;
const today = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------ AI Engineer
const llms = (await get(`${AIE}/llms.txt`, "text/plain")) as string;
const editionRows = [...llms.matchAll(/^\|\s*(AI Engineer[^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*<?(https?:\/\/[^|>\s]+)>?\s*\|/gm)]
  .map((m) => ({ name: m[1].trim(), when: dates(m[2]), location: m[3].trim(), url: m[4].trim() }))
  .filter((x) => x.when);
for (const e of editionRows) {
  const id = slug(e.name);
  editions.set(e.name, { id, series: "AI Engineer", name: e.name, start: e.when!.start, end: e.when!.end, location: e.location, url: e.url, source: `${AIE}/llms.txt`, talks: [] });
  if (e.when!.start > today) upcoming.push({ name: e.name, series: "AI Engineer", start: e.when!.start, end: e.when!.end, location: e.location, url: e.url });
}
report.push(`ai.engineer: ${editionRows.length} editions listed`);

// recorded talks, every edition
type ApiTalk = { slug: string; title: string; url: string; event: string | null; speakers: { name: string }[]; topics: { slug: string; name: string }[]; summary?: string };
const apiTalks = (await get(`${AIE}/api/data/talks?format=json`)) as ApiTalk[];
const aieTopics = new Map<string, { name: string; byYear: Map<string, number>; n: number }>();
const aieYears = new Map<string, number>();
for (const t of apiTalks) {
  const ed = t.event ? editions.get(t.event) : undefined;
  const year = ed?.start.slice(0, 4) ?? t.event?.match(/\d{4}/)?.[0];
  if (year) aieYears.set(year, (aieYears.get(year) ?? 0) + 1);
  for (const tp of t.topics ?? []) {
    const x = aieTopics.get(tp.slug) ?? { name: tp.name, byYear: new Map(), n: 0 };
    x.n++; if (year) x.byYear.set(year, (x.byYear.get(year) ?? 0) + 1);
    aieTopics.set(tp.slug, x);
  }
  if (!ed) continue;
  ed.talks.push({ edition: ed.name, title: t.title, text: `${t.title} ${t.summary ?? ""}`, kind: kindOf(t.title), speakers: t.speakers.map((s) => s.name), url: t.url });
}
report.push(`ai.engineer archive: ${apiTalks.length} recorded talks, ${aieTopics.size} topics`);

// published schedules: for an edition with one, the schedule replaces the recordings (it is complete)
for (const m of llms.matchAll(/https:\/\/ai\.engineer\/([a-z]+)\/(\d{4})\/sessions\.json/g)) {
  const url = m[0];
  try {
    const d = (await get(url)) as { conference: string; sessions: { title: string; description: string | null; type: string; track?: string; speakers: string[]; status?: string }[] };
    const ed = [...editions.values()].find((e) => e.url.replace(/\/$/, "").endsWith(`/${m[1]}/${m[2]}`)) ?? [...editions.values()].find((e) => e.name === d.conference);
    if (!ed) { report.push(`schedule without an edition: ${url}`); continue; }
    const talks = d.sessions.filter((s) => s.title && !NOT_TALK.test(s.title) && s.type !== "other" && (s.speakers?.length ?? 0) > 0 && s.status !== "cancelled");
    ed.talks = talks.map((s) => ({ edition: ed.name, title: s.title, text: `${s.title} ${s.description ?? ""}`, track: s.track || undefined, kind: kindOf(`${s.type} ${s.title}`), speakers: s.speakers }));
    ed.source = url;
    report.push(`${ed.name}: schedule, ${talks.length} of ${d.sessions.length} sessions are talks`);
  } catch (e) { report.push(`FAIL ${url} ${(e as Error).message}`); }
}

// speakers and organisations: candidates for the people and companies pages
type ApiSpeaker = { slug: string; name: string; url: string; jobTitle?: string; organization?: string; profiles?: { website?: string; github?: string; linkedin?: string; x?: string }; topics?: { slug: string; name: string }[]; talkSlugs?: string[] };
const apiSpeakers = (await get(`${AIE}/api/data/speakers?format=json`)) as ApiSpeaker[];
type ApiOrg = { slug: string; name: string; url: string; speakerSlugs?: string[]; talkSlugs?: string[] };
const apiOrgs = (await get(`${AIE}/api/data/organizations?format=json`)) as ApiOrg[];
const talkBySlug = new Map(apiTalks.map((t) => [t.slug, t]));
report.push(`ai.engineer: ${apiSpeakers.length} speakers, ${apiOrgs.length} organisations`);

// ------------------------------------------------------------------ PyTorch Conference (Sched)
const ICS = [
  { name: "PyTorch Conference 2025", url: "https://pytorchconference.sched.com/all.ics", location: "San Francisco", site: "https://events.linuxfoundation.org/pytorch-conference-2025/" },
  { name: "PyTorch Conference Europe 2026", url: "https://pytorchconferenceeu2026.sched.com/all.ics", location: "Paris", site: "https://events.linuxfoundation.org/pytorch-conference-europe/" },
];
const unfold = (s: string) => s.replace(/\r?\n[ \t]/g, "");
const icsText = (s: string) => s.replace(/\\n/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/&nbsp;?/g, " ").trim();
for (const c of ICS) {
  try {
    const body = unfold((await get(c.url, "text/calendar")) as string);
    const evs = body.split("BEGIN:VEVENT").slice(1).map((b) => {
      const f = (k: string) => icsText(b.match(new RegExp(`^${k}[^:]*:(.*)$`, "m"))?.[1] ?? "");
      return { summary: f("SUMMARY"), desc: f("DESCRIPTION"), cat: f("CATEGORIES"), start: f("DTSTART").slice(0, 8) };
    });
    const talks = evs.filter((e) => e.summary && !/BREAK|EXHIBIT|SPECIAL EVENT|CO-LOCATED/i.test(e.cat) && !NOT_TALK.test(e.summary));
    const days = evs.map((e) => e.start).filter(Boolean).sort();
    const iso = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    // "Title - Speaker, Role, Company" or "Keynote: Title - Speaker..."
    const ed: Edition = { id: slug(c.name), series: "PyTorch Conference", name: c.name, start: iso(days[0]), end: iso(days.at(-1)!), location: c.location, url: c.site, source: c.url,
      talks: talks.map((e) => { const [title, who] = e.summary.split(/\s+-\s+(?=[^-]+$)/); return { edition: c.name, title: title.replace(/^(Keynote|Lightning Talk|Panel( Discussion)?|Tutorial|Workshop):\s*/i, ""), text: `${e.summary} ${e.desc}`, track: e.cat ? e.cat.toLowerCase().replace(/(^|\s|&)\w/g, (x) => x.toUpperCase()) : undefined, kind: kindOf(`${e.cat} ${e.summary}`), speakers: who ? who.split(/;|\s&\s/).map((x) => x.split(",")[0].trim()).filter(Boolean) : [] }; }) };
    editions.set(c.name, ed);
    report.push(`${c.name}: ${talks.length} talks of ${evs.length} calendar entries`);
  } catch (e) { report.push(`FAIL ${c.url} ${(e as Error).message}`); }
}

// ------------------------------------------------------------------ Microsoft Build
try {
  const url = "https://build.microsoft.com/api/session/all/en-US";
  const all = (await get(url)) as { title: string; description?: string; speakerNames?: string; startDateTime?: string; sessionCode?: string; sessionType?: { displayValue?: string } | string; topic?: { displayValue?: string }[] }[];
  const talks = all.filter((s) => s.title && !/overflow|viewing|registration|break|lunch|expo|party/i.test(s.title) && !/-O\d+$/.test(s.sessionCode ?? ""));
  const days = talks.map((s) => s.startDateTime?.slice(0, 10)).filter((d): d is string => !!d).sort();
  editions.set("Microsoft Build 2026", { id: "microsoft-build-2026", series: "Microsoft Build", name: "Microsoft Build 2026", start: days[0] ?? "2026-06-02", end: days.at(-1) ?? "2026-06-04", location: "San Francisco", url: "https://build.microsoft.com/", source: url,
    talks: talks.map((s) => ({ edition: "Microsoft Build 2026", title: s.title, text: `${s.title} ${s.description ?? ""}`, kind: kindOf(`${typeof s.sessionType === "string" ? s.sessionType : s.sessionType?.displayValue ?? ""} ${s.title}`), speakers: (s.speakerNames ?? "").split(/,\s*/).filter(Boolean) })) });
  report.push(`Microsoft Build 2026: ${talks.length} sessions of ${all.length}`);
} catch (e) { report.push(`FAIL Microsoft Build ${(e as Error).message}`); }

// ------------------------------------------------------------------ classify and summarise
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 1000) / 10 : 0);
function profile(talks: Talk[]) {
  const sk = new Map<string, number>(), tk = new Map<string, number>(), tl = new Map<string, number>(), tr = new Map<string, number>();
  for (const t of talks) {
    for (const s of skillsOf(t.text)) sk.set(s, (sk.get(s) ?? 0) + 1);
    for (const s of tasksOf(t.text)) tk.set(s, (tk.get(s) ?? 0) + 1);
    for (const s of toolsOf(t.text)) tl.set(s, (tl.get(s) ?? 0) + 1);
    if (t.track) tr.set(t.track, (tr.get(t.track) ?? 0) + 1);
  }
  const rows = (m: Map<string, number>, k = "id") => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ [k]: id, n, share: pct(n, talks.length) }));
  return { talks: talks.length, skills: rows(sk), tasks: rows(tk), tools: rows(tl, "name").slice(0, 25), tracks: rows(tr, "name").slice(0, 30) };
}
const withTalks = [...editions.values()].filter((e) => e.talks.length >= 20).sort((a, b) => a.start.localeCompare(b.start));
const recent = withTalks.filter((e) => e.start >= "2025-06-01");
const out = {
  updated: today,
  editions: withTalks.map((e) => ({ id: e.id, series: e.series, name: e.name, start: e.start, end: e.end, location: e.location, url: e.url, source: e.source, kinds: Object.fromEntries(["talk", "workshop", "keynote", "panel"].map((k) => [k, e.talks.filter((t) => t.kind === k).length])), ...profile(e.talks) })),
  recent: { from: "2025-06-01", editions: recent.length, ...profile(recent.flatMap((e) => e.talks)) },
  upcoming: upcoming.sort((a, b) => a.start.localeCompare(b.start)),
  aieYears: Object.fromEntries([...aieYears.entries()].sort()),
  aieTopics: [...aieTopics.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 30).map(([id, x]) => ({ id, name: x.name, n: x.n, byYear: Object.fromEntries([...x.byYear.entries()].sort()) })),
  sources: [`${AIE}/llms.txt`, `${AIE}/api/data/talks?format=json`, ...ICS.map((c) => c.url), "https://build.microsoft.com/api/session/all/en-US"],
};
writeFileSync(path.join(root, "web/src/data/conferences.json"), JSON.stringify(out, null, 1) + "\n");

// candidates: everyone who spoke at AI Engineer, with what is public about them on its own pages
mkdirSync(path.join(root, "conferences"), { recursive: true });
const people = apiSpeakers.filter((s) => (s.talkSlugs ?? []).length).map((s) => {
  const talks = (s.talkSlugs ?? []).map((k) => talkBySlug.get(k)).filter((t): t is ApiTalk => !!t);
  const evs = [...new Set(talks.map((t) => t.event).filter(Boolean))] as string[];
  return {
    id: s.slug, name: s.name, role: s.jobTitle ?? null, org: s.organization ?? null, source: s.url,
    links: Object.fromEntries(Object.entries(s.profiles ?? {}).filter(([, v]) => v)),
    talks: talks.length, editions: evs, lastEdition: evs.map((e) => editions.get(e)?.start ?? "").sort().at(-1) || null,
    topics: (s.topics ?? []).slice(0, 8).map((t) => t.name),
    talkList: talks.slice(0, 12).map((t) => ({ title: t.title, url: t.url, event: t.event })),
  };
}).sort((a, b) => b.talks - a.talks || a.name.localeCompare(b.name));
writeFileSync(path.join(root, "conferences/people.json"), JSON.stringify({ updated: today, source: `${AIE}/api/data/speakers?format=json`, people }, null, 1) + "\n");
const orgs = apiOrgs.map((o) => ({ id: o.slug, name: o.name, source: o.url, speakers: (o.speakerSlugs ?? []).length, talks: (o.talkSlugs ?? []).length }))
  .filter((o) => o.talks > 0).sort((a, b) => b.talks - a.talks);
writeFileSync(path.join(root, "conferences/orgs.json"), JSON.stringify({ updated: today, source: `${AIE}/api/data/organizations?format=json`, orgs }, null, 1) + "\n");

for (const r of report) console.log(r);
for (const e of out.editions) console.log(`${e.start} ${e.name.padEnd(36)} ${String(e.talks).padStart(4)} talks  top: ${e.skills.slice(0, 4).map((s) => `${s.id} ${s.share}%`).join(", ")}`);
console.log(`recent (${out.recent.editions} editions, ${out.recent.talks} talks):`, out.recent.skills.map((s) => `${s.id} ${s.share}%`).join(", "));
console.log(`people candidates: ${people.length}; organisations: ${orgs.length}; upcoming: ${out.upcoming.map((u) => u.name).join(", ")}`);
