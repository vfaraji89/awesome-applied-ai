// Builds public/llms.txt (the short index, per llmstxt.org) and public/llms-full.txt (everything on
// the site as plain markdown) from the same data the pages render, so answer engines and agents can
// read the whole map in one request and cite the right page. Runs in the data step before every
// build. Generated, not committed.
import { writeFileSync } from "node:fs";
import { structure } from "../src/lib/structure";
import { tools } from "../src/data/tools";
import { areas, catName } from "../src/data/areas";
import { useCases, useCasesOf } from "../src/data/usecases";
import { certs, courses, changes, CHECKED, LEVELS, TRACKS } from "../src/data/certificates";
import { fRoles, skills } from "../src/data/framework";
import { layers } from "../src/data/layers";
import { problems } from "../src/data/problems";
import { docs } from "../src/data/docs";
import { signals, statsDate, fmtStars } from "../src/lib/tool-signals";
import jargon from "../src/data/content/jargon.json";
import market from "../src/data/market.json";

const SITE = "https://vfaraji89.github.io/awesome-applied-ai";
const u = (p: string) => SITE + p;
const day = String(market.generatedAt).slice(0, 10);
const mtasks = (market.tasks ?? []) as { name: string; share: number }[];
const emerging = tools.filter((t) => signals(t).isNew);
const roleName = Object.fromEntries(fRoles.map((r) => [r.id, r.name]));
const skillName = Object.fromEntries(skills.map((s) => [s.id, s.name]));

const about = `> A plain-language map of applied AI in seven steps: what the job market asks for, the roles and skills, the AI-native architect, a tool map, industry certificates, technical docs in motion, and feedback. Independent and non-commercial: no company pays to be listed. Curated by Vahid Faraji (https://vfaraji89.github.io/) as the companion to the book Applied AI, Simplified. Readable in English, Turkish, Spanish, Dutch and Japanese.`;

const facts = [
  `- Job tracker: ${market.totals.processed} applied AI job ads processed since ${market.since}, read from public company career pages and job boards (as of ${day}; every site read: ${u("/market/sources/")}). Most common role family: ${roleName[market.roles[0].id] ?? market.roles[0].id}. Most asked-for skill: ${skillName[market.skills[0].id] ?? market.skills[0].id} (${market.skills[0].share}% of postings). Most named tool: ${market.tools[0].name}.${mtasks.length ? ` Most asked-for task: ${mtasks[0].name} (${mtasks[0].share}% of ads).` : ""}`,
  `- Tool map: ${tools.length} tools in ${areas.length} areas and ${new Set(tools.map((t) => t.category)).size} categories, filterable by ${useCases.length} use cases; ${emerging.length} emerging (launched in the last six months, as of ${statsDate}).`,
  `- Certificates: ${certs.length} industry certificates and ${courses.length} courses, each checked against the provider's own page on ${CHECKED}.`,
  `- Roles: ${fRoles.length} applied AI roles across ${skills.length} skills. Architecture: ${layers.length} layers and ${problems.length} common problems with worked answers. Jargon: ${jargon.terms.length} terms.`,
];

const short = [
  "# awesome-applied-ai", "", about, "", "## Key facts", "", ...facts, "",
  "## Sections", "",
  ...structure.map((s) => `- [${s.title}](${u(s.href)}): ${s.line}`), "",
  "## Pages", "",
  ...structure.flatMap((s) => s.pages.filter((p) => !p.soon && !p.href.includes("#")).map((p) => `- [${p.label}](${u(p.href)}): ${p.note}`))
    .filter((l, i, a) => a.indexOf(l) === i), "",
  "## Full text", "",
  `- [llms-full.txt](${u("/llms-full.txt")}): every tool, certificate, role, term and problem on the site, as markdown.`, "",
  "## Citing", "",
  "- Cite the page a fact comes from, with its date. Content is © Vahid Faraji, all rights reserved; quoting with a link is welcome. Names and logos belong to their owners.", "",
].join("\n");

const md = (s: string) => s.replace(/\s+/g, " ").trim();
const full: string[] = [
  "# awesome-applied-ai (full text)", "", about, "", `Generated ${day}. Short index: ${u("/llms.txt")}`, "", "## Key facts", "", ...facts, "",
  "## Job market", "", `Source: ${u("/market/")}. Job ads published since ${market.since}. Aggregate counts only; no ad, link or description is stored. Sites read: ${u("/market/sources/")}.`, "",
  "Job ads by role family: " + market.roles.slice(0, 8).map((r: { id: string; n: number }) => `${roleName[r.id] ?? r.id} ${r.n}`).join(", ") + ".",
  "Skills asked for (share of postings): " + market.skills.slice(0, 12).map((s: { id: string; share: number }) => `${skillName[s.id] ?? s.id} ${s.share}%`).join(", ") + ".",
  ...(mtasks.length ? ["Tasks asked for (share of ads): " + mtasks.map((t) => `${t.name} ${t.share}%`).join(", ") + "."] : []),
  "Most named tools: " + market.tools.slice(0, 15).map((t: { name: string; n: number }) => `${t.name} (${t.n})`).join(", ") + ".",
  "Common titles: " + market.titles.slice(0, 10).map((t: { title: string }) => t.title).join("; ") + ".", "",
  "## Roles", "", `Source: ${u("/roles/")}`, "",
  ...fRoles.flatMap((r) => [`### ${r.name}`, "", md(r.oneLine), "", `- Also called: ${r.titles.join(", ")}`, `- Tasks: ${r.tasks.join("; ")}`, `- Stack: ${r.stack.join(", ")}`, ""]),
  "## Architecture layers", "", `Source: ${u("/architecture/")}`, "",
  ...layers.map((l) => `- ${l.name}: ${md(l.tagline ?? "")} ${md(l.question ?? "")}`.trim()), "",
  "## Problems with worked answers", "",
  ...problems.map((p) => `- [${p.title}](${u(`/problems/${p.id}/`)})`), "",
  "## Tool map", "", `Source: ${u("/tools/")}. Stars from GitHub as of ${statsDate}. Emerging = launched in the last six months.`, "",
  ...areas.flatMap((a) => {
    const at = tools.filter((t) => t.area === a.id);
    const cats = [...new Set(at.map((t) => t.category))];
    return [`### ${a.name}`, "", md(a.line), "", ...cats.flatMap((c) => [`#### ${catName(c)}`, "", ...at.filter((t) => t.category === c).map((t) => {
      const g = signals(t);
      const bits = [t.license, t.maturity, g.stars !== undefined ? `${fmtStars(g.stars)} stars` : "", g.isNew ? `emerging, ${g.quarter}` : ""].filter(Boolean).join(", ");
      return `- [${t.name}](${t.url}): ${md(t.summary)}${bits ? ` (${bits})` : ""}. Use cases: ${useCasesOf(t).map((x) => useCases.find((y) => y.id === x)!.name.toLowerCase()).join(", ")}.`;
    }), ""])];
  }),
  "## Certificates", "", `Source: ${u("/certificates/")}. Checked against each provider's page on ${CHECKED}. Fees in US dollars before tax, only where the provider states them.`, "",
  ...TRACKS.flatMap((tr) => [`### ${tr.name}`, "", ...certs.filter((c) => c.track === tr.id).sort((a, b) => a.level - b.level).map((c) =>
    `- [${c.name}](${c.url}) (${c.provider}${c.code ? `, ${c.code}` : ""}, ${LEVELS[c.level]}${c.fee ? `, ${c.fee}` : ""}${c.length ? `, ${c.length}` : ""}): ${c.what}${c.statusNote ? ` ${c.statusNote}` : ""}`), ""]),
  "### Courses that end in a certificate", "", ...courses.map((c) => `- [${c.name}](${c.url}) (${c.provider}, ${c.cost}): ${c.what}`), "",
  "### Recently changed", "", ...changes.map((c) => `- ${c.was} → ${c.now} (${c.when})`), "",
  "## Docs", "", ...docs.map((d) => `- ${d.name}${d.status === "live" && d.href ? ` (${u(d.href)})` : " (coming)"}: ${d.oneLine}`), "",
  "## Jargon", "", `Source: ${u("/jargon/")}`, "",
  ...(jargon.terms as { term: string; short: string }[]).map((t) => `- ${t.term}: ${md(t.short)}`), "",
];

writeFileSync(new URL("../public/llms.txt", import.meta.url), short);
writeFileSync(new URL("../public/llms-full.txt", import.meta.url), full.join("\n"));
console.log(`llms.txt: ${short.length} chars; llms-full.txt: ${full.join("\n").length} chars`);
