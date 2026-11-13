// Builds every share image for the site: one per section page (public/og/pages, with alt text in
// src/data/og-alts.json) and one per problem (public/og/problems).
// Numbers come from the data; counts that only grow are rounded down ("600+") so an image does not
// go stale within a week. Run after content changes: bun scripts/og/build.ts
import { writeFileSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tools } from "../../src/data/tools";
import { areas } from "../../src/data/areas";
import { useCases } from "../../src/data/usecases";
import { certs, courses } from "../../src/data/certificates";
import { fRoles, skills } from "../../src/data/framework";
import { layers } from "../../src/data/layers";
import { problems } from "../../src/data/problems";
import { docs } from "../../src/data/docs";
import radar from "../../src/data/content/radar.json";
import jargon from "../../src/data/content/jargon.json";
import market from "../../src/data/market.json";
import { signals } from "../../src/lib/tool-signals";

const WEB = new URL("../../", import.meta.url).pathname;
const URL_ = "vfaraji89.github.io/awesome-applied-ai";
const plus = (n: number) => { const p = 10 ** Math.max(0, String(n).length - 2); return `${(Math.floor(n / p) * p).toLocaleString("en")}+`; };
const boards = (market.sources ?? []).reduce((a: number, s: { boards?: number }) => a + (s.boards ?? 1), 0);
const providers = new Set(certs.map((c) => c.provider)).size;
const radarN = Array.isArray(radar) ? radar.length : (radar as { items?: unknown[] }).items?.length ?? 0;

type Card = { route: string; kicker: string; title: string; desc: string; stats: { n: string; l: string }[]; alt: string; rows?: string[] };
const R = (route: string, kicker: string, title: string, desc: string, stats: [string, string][], rows?: string[]): Card =>
  ({ route, kicker, title, desc, stats: stats.map(([n, l]) => ({ n, l })), alt: `${title.replace(/<[^>]+>/g, "")}: ${desc}`, rows });

const cards: Card[] = [
  R("", "Companion to the book Applied AI, Simplified", "Applied AI, <mark>mapped</mark>", "From what the market asks for to the docs you need to build it: seven steps, free, in five languages.",
    [[plus(tools.length), "tools"], [plus(market.totals.allTime), "roles tracked"], [String(certs.length), "certificates"]]),
  R("market", "01 · The market", "What applied AI jobs <mark>ask for</mark>", "Roles, levels, skills and tools, read from public job boards and summarised every week.",
    [[plus(market.totals.allTime), "roles tracked"], [String(boards), "job boards"], ["Weekly", "updates"]], ["wrrrw", "wwkkw", "wwwwk"]),
  R("market/note", "01 · The market · weekly note", "This week in applied AI <mark>hiring</mark>", "New roles, the skills they ask for and the tools they name, ready to share.",
    [[plus(market.totals.allTime), "roles tracked"], [String(boards), "job boards"], ["Weekly", "note"]]),
  R("fit", "01 · The market · role fit", "How ready are you for <mark>applied AI</mark>?", "Paste your CV or a job description. Scored against real postings, with what to learn next.",
    [[plus(market.totals.allTime), "postings"], [String(skills.length), "skills scored"], ["Free", "in your browser"]], ["rrrrw", "rrkww", "rwwww"]),
  R("labs", "01 · The market · the labs", "What the labs <mark>ask for</mark>", "Applied AI roles at Anthropic, OpenAI and Google, side by side, from their public postings.",
    [["3", "labs"], ["5", "shared asks"], ["Linked", "sources"]]),
  R("roles", "02 · Roles and skills", "Who does the work, and <mark>what it takes</mark>", "Eight applied AI roles: their titles, daily tasks, stack and how each one grows.",
    [[String(fRoles.length), "roles"], [String(skills.length), "skills"], ["5", "families"]], ["wkkkw", "wrrww", "kwwww"]),
  R("skills", "02 · Roles and skills · skill map", "Which skills <mark>travel together</mark>", "The skills applied AI postings ask for, how often they appear together, and which opens the most doors.",
    [[String(skills.length), "skills"], [plus(market.totals.allTime), "postings"], [String(fRoles.length), "roles"]]),
  R("architect", "03 · The AI-native architect", "The role that designs <mark>AI into systems</mark>", "The layers, the stack and the problems an AI-native architect owns.",
    [[String(layers.length), "layers"], [String(problems.length), "problems"], [plus(tools.length), "tools"]], ["wwrww", "wkkkw", "wwrww"]),
  R("architecture", "03 · Architecture", "Six layers of an <mark>AI system</mark>", "From guardrails to retrieval: one request animated through every layer, and the agent harness on top.",
    [[String(layers.length), "layers"], ["1", "harness"], [String(problems.length), "problems"]]),
  R("problems", "03 · Problems", "Problems teams <mark>actually hit</mark>", "Asked the way a team would ask them, with worked answers, layer by layer.",
    [[String(problems.length), "problems"], [String(layers.length), "layers"], ["Worked", "answers"]]),
  R("radar", "03 · Emerging tech radar", "What is new, and <mark>how far to trust it</mark>", "Emerging applied AI tech on four rings: use now, pilot, evaluate, watch.",
    [[String(radarN), "entries"], ["4", "rings"], ["Dated", "sources"]]),
  R("tools", "04 · The tool map", `${plus(tools.length)} tools across <mark>applied AI</mark>`, `${areas.length} areas, ${useCases.length} use cases, licence and maturity for each, and what launched in the last six months.`,
    [[plus(tools.length), "tools"], [String(areas.length), "areas"], [String(tools.filter((t) => signals(t).isNew).length), "emerging"]], ["rrrww", "wkkkw", "wwrkw"]),
  R("certificates", "05 · Industry certificates", "Certificates worth <mark>having</mark>", "By track and level, each checked against the provider's own page, with what changed recently.",
    [[String(certs.length), "certificates"], [String(providers), "providers"], [String(courses.length), "courses"]], ["wwwrw", "wkkrw", "rrrrw"]),
  R("docs", "06 · Technical docs, in motion", "The docs people <mark>skip</mark>, in motion", "Short animations, everyday comparisons, real examples and the code you need.",
    [[String(docs.filter((d) => d.status === "live").length), "live"], [String(docs.filter((d) => d.status !== "live").length), "coming"], [String(jargon.terms.length), "terms"]]),
  R("docs/claude-platform", "06 · Docs · Claude Platform", "How your app <mark>talks to Claude</mark>", "From the first request to the receipt that comes back, one animation at a time.",
    [["API", "requests"], ["Tools", "and agents"], ["Cost", "and caching"]]),
  R("jargon", "06 · Docs · jargon", `${jargon.terms.length} terms, in <mark>plain words</mark>`, "Flip cards: the plain meaning on the front, the deeper answer and the interview question on the back.",
    [[String(jargon.terms.length), "terms"], [String((jargon as { fields: unknown[] }).fields.length), "fields"], ["Interview", "questions"]]),
  R("contribute", "07 · Feedback", "Spot something wrong? <mark>Tell me</mark>", "Corrections, companies the tracker should follow, and terms or tools that are missing.",
    [["Credited", "fixes"], ["Weekly", "updates"], ["Open", "to all"]]),
];

const tmp = join(tmpdir(), "aai-og"); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const spec = [
  ...cards.map((c) => ({ file: `${c.route.replace(/\//g, "__") || "home"}.png`, brand: "aai", kicker: c.kicker, title: c.title, desc: c.desc, stats: c.stats, url: `${URL_}/${c.route}${c.route ? "/" : ""}`, rows: c.rows })),
  ...problems.map((p) => ({ file: `problem-${p.id}.png`, brand: "aai", kicker: `03 · Problem ${String(p.n).padStart(2, "0")} · ${layers.find((l) => l.id === p.layer)?.name ?? ""}`,
    title: p.title, desc: p.asked.length > 150 ? p.asked.slice(0, p.asked.lastIndexOf(" ", 147)) + "…" : p.asked, stats: [], url: `${URL_}/problems/${p.id}/`,
    visual: "number", number: String(p.n).padStart(2, "0"), numberLabel: "Problem", titleSize: 56 })),
];
writeFileSync(join(tmp, "cards.json"), JSON.stringify(spec));
execFileSync("node", [join(WEB, "scripts/og/render.mjs"), join(tmp, "cards.json"), tmp, join(WEB, "src/app/fonts")], { stdio: "inherit" });

// section images go to public/og/pages/<route>.png; lib/share.ts points each page at its own
mkdirSync(join(WEB, "public/og/pages"), { recursive: true });
const alts: Record<string, string> = {};
for (const c of cards) {
  const name = c.route.replace(/\//g, "__") || "home";
  copyFileSync(join(tmp, `${name}.png`), join(WEB, "public/og/pages", `${name}.png`));
  alts[c.route] = c.alt;
}
writeFileSync(join(WEB, "src/data/og-alts.json"), JSON.stringify(alts, null, 1) + "\n");
mkdirSync(join(WEB, "public/og/problems"), { recursive: true });
for (const p of problems) copyFileSync(join(tmp, `problem-${p.id}.png`), join(WEB, "public/og/problems", `${p.id}.png`));
console.log(`og: ${cards.length} section images, ${problems.length} problem images`);
