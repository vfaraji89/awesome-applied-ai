/* Tool discovery: finds candidates for the tool map, never publishes them.
   Weekly (Mondays): new and fast-rising open-source repos per area from GitHub topics,
   well-known repos the map still lacks, notable "Show HN" launches, and tools that job
   posts ask for but the map does not list. Monthly (first run of the month) it also checks
   every GitHub-hosted tool on the map for an archived repo or a year without a push.
   The result is a report for a person to read: each candidate comes as a row ready to paste
   into the content sheet's tools tab, so it goes through the same validation and pull
   request as every other edit, and only after someone has checked it.

   bun pipeline/discover.ts                 write market/tool-candidates.json and the report
   bun pipeline/discover.ts --dry           print the report, write nothing
   bun pipeline/discover.ts --health        also run the monthly health check now
   bun pipeline/discover.ts --areas=a,b     only these areas (quick tests)
   GITHUB_TOKEN (set by Actions) raises GitHub's rate limits; without it the run is slower. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { isoWeek } from "./weekly";

const root = path.resolve(import.meta.dir, "..");
const TOOLS = path.join(root, "web", "src", "data", "content", "tools.json");
const MARKET = path.join(root, "web", "src", "data", "market.json");
const STATE = path.join(root, "market", "tool-candidates.json");
const REPORT = path.join(root, "tool-candidates.md");
const dry = process.argv.includes("--dry");
const today = new Date().toISOString().slice(0, 10);
const week = isoWeek(today);
const health = process.argv.includes("--health") || Number(today.slice(8, 10)) <= 7;

// ---- where to look: GitHub topics per area, with the category a match most likely belongs to
const TOPICS: Record<string, [string, string][]> = {
  data: [["data-labeling", "labeling"], ["annotation-tool", "labeling"], ["synthetic-data", "synthetic-data"], ["feature-store", "feature-stores"], ["data-versioning", "data-versioning"]],
  models: [["large-language-models", "open-weight-models"], ["foundation-models", "open-weight-models"], ["small-language-models", "open-weight-models"]],
  training: [["fine-tuning", "fine-tuning"], ["llm-training", "distributed-training"], ["mlops", "mlops"], ["experiment-tracking", "experiment-tracking"], ["automl", "automl"]],
  inference: [["llm-inference", "serving-engines"], ["llm-serving", "serving-engines"], ["model-serving", "serving-engines"], ["edge-ai", "on-device"], ["llm-gateway", "gateways"]],
  retrieval: [["vector-database", "vector-db"], ["rag", "managed-retrieval"], ["embeddings", "embeddings-rerankers"], ["document-parsing", "parsing-ingestion"], ["graphrag", "graph-retrieval"]],
  agents: [["ai-agents", "frameworks"], ["agent-framework", "frameworks"], ["mcp", "protocols"], ["multi-agent", "frameworks"], ["browser-automation", "computer-use"], ["agent-memory", "memory-systems"]],
  evaluation: [["llm-evaluation", "eval-frameworks"], ["llm-observability", "tracing"], ["llmops", "tracing"], ["evals", "eval-frameworks"]],
  governance: [["guardrails", "guardrails"], ["llm-security", "ai-security"], ["prompt-injection", "ai-security"], ["ai-safety", "guardrails"]],
  modalities: [["speech-recognition", "speech"], ["text-to-speech", "speech"], ["ocr", "document-ai"], ["computer-vision", "vision"], ["image-generation", "image-video-generation"], ["video-generation", "image-video-generation"]],
  builders: [["ai-coding-assistant", "coding-assistants"], ["coding-agent", "coding-assistants"], ["ai-ide", "ai-ides"], ["low-code", "app-builders"]],
  landscape: [["technology-detection", "stack-detection"], ["llm-benchmark", "model-benchmarks"], ["leaderboard", "model-benchmarks"]],
};
const RISING_STARS = 300, KNOWN_STARS = 5000;
const AI_WORDS = /\b(AI|LLMs?|agents?|agentic|GPT|Claude|Gemini|RAG|embeddings?|inference|models?|fine-?tun\w*|MCP|voice|speech|OCR|vision|diffusion|text-to-\w+|transformers?|ML|neural|copilot)\b/i;

type Tool = { id: string; name: string; url: string; status?: string; github?: string };
type Cand = { key: string; name: string; area: string; category: string; url: string; summary: string; license: string; stars?: number; created?: string; source: string; signal: string };

const tools: Tool[] = JSON.parse(readFileSync(TOOLS, "utf8"));
const norm = (s: string) => s.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const onMap = new Set(tools.flatMap((t) => [norm(t.url), t.name.toLowerCase(), alnum(t.name)]));
const mapNames = [...onMap].filter((x) => /^[a-z0-9]+$/.test(x) && x.length >= 5);
const named = (n: string) => { const a = alnum(n); return onMap.has(a) || (a.length >= 5 && mapNames.some((m) => m.startsWith(a))); };
const host = (u: string) => norm(u).split("/")[0].replace(/^(docs|developers|www)\./, "");
const mapHosts = new Set(tools.map((t) => host(t.url)).filter((h) => h !== "github.com"));
// lists, courses and tutorials are not tools
const NOT_A_TOOL = /awesome|tutorial|course|guide|interview|roadmap|cookbook|examples?\b|techniques|curated|list of|learning path|from[- ]scratch|for[- ]beginners|\bbook\b|handbook|lecture|教程|面试|指南|课程/i;
// general-purpose languages and techniques that job posts name but the map does not list on purpose
const GENERAL = new Set(["python", "typescript", "javascript", "sql", "java", "go", "rust", "c++", "rag", "scala", "kotlin", "r"]);
const repoOf = (u: string) => u.match(/github\.com\/(?!(?:features|marketplace|orgs|topics|sponsors|apps|enterprise|solutions|about|pricing|security|collections|trending)\/)([^/]+\/[^/#?]+)/i)?.[1].toLowerCase().replace(/\.git$/, "");
const mapRepos = new Set(tools.flatMap((t) => [repoOf(t.url), t.github?.toLowerCase()]).filter(Boolean));
const state: { seen: Record<string, string>; weeks: { week: string; candidates: Cand[]; asked: string[]; health: string[] }[] } =
  existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { seen: {}, weeks: [] };
const clean = (s = "") => s.replace(/[–—]/g, ",").replace(/\s+/g, " ").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();

const H: Record<string, string> = { accept: "application/vnd.github+json", "user-agent": "awesome-applied-ai-discover" };
if (process.env.GITHUB_TOKEN) H.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const GAP = process.env.GITHUB_TOKEN ? 2200 : 6500; // search API: 30 a minute with a token, 10 without
async function gh(url: string) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: H, signal: AbortSignal.timeout(20000) });
    if (r.status === 403 || r.status === 429) { await sleep(20000); continue; }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  }
  throw new Error(`rate limited: ${url}`);
}
const ago = (days: number) => new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

const found = new Map<string, Cand>();
const errors: string[] = [];
function add(c: Cand) {
  if (onMap.has(norm(c.url)) || named(c.name) || mapHosts.has(host(c.url))) return;
  if (NOT_A_TOOL.test(c.name) || NOT_A_TOOL.test(c.summary)) return;
  for (const r of [repoOf(c.url), repoOf(c.source)]) if (r && mapRepos.has(r)) return;
  const prev = found.get(c.key);
  if (!prev || (c.stars ?? 0) > (prev.stars ?? 0)) found.set(c.key, c);
}

// ---- 1. GitHub: rising (created in the last 90 days) and known (big, active) repos per topic
const only = process.argv.find((a) => a.startsWith("--areas="))?.slice(8).split(",");
for (const [area, list] of Object.entries(TOPICS).filter(([a]) => !only || only.includes(a))) {
  for (const [topic, category] of list) {
    for (const [signal, q] of [
      ["rising", `topic:${topic} created:>${ago(90)} stars:>=${RISING_STARS}`],
      ["known", `topic:${topic} stars:>=${KNOWN_STARS} pushed:>${ago(60)} archived:false`],
    ] as const) {
      try {
        const d = await gh(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${signal === "rising" ? 8 : 6}`);
        for (const r of d.items ?? []) {
          if (r.fork || r.archived) continue;
          // a big repo found by topic must say it is about AI, so general software (databases, CMSs) stays out
          if (signal === "known" && !AI_WORDS.test(`${r.name} ${r.description ?? ""}`)) continue;
          add({ key: `gh:${r.full_name.toLowerCase()}`, name: r.name, area, category, url: r.homepage?.startsWith("https://") && !/github\.io|readthedocs|vercel\.app/.test(r.homepage) ? r.homepage : r.html_url,
            summary: clean(r.description ?? "").slice(0, 110), license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : "",
            stars: r.stargazers_count, created: r.created_at?.slice(0, 10), source: r.html_url, signal: signal === "rising" ? `new, ${r.stargazers_count.toLocaleString("en")} stars since ${r.created_at.slice(0, 10)}` : `${r.stargazers_count.toLocaleString("en")} stars, active` });
        }
      } catch (e) { errors.push(`github ${topic}: ${(e as Error).message.slice(0, 80)}`); }
      await sleep(GAP);
    }
  }
}

// ---- 2. Hacker News: Show HN launches about AI with real traction in the last 30 days
for (const q of ["AI", "LLM", "agent", "RAG", "voice AI", "open-source model"]) {
  try {
    const r = await fetch(`https://hn.algolia.com/api/v1/search?tags=show_hn&query=${encodeURIComponent(q)}&numericFilters=created_at_i>${Math.floor(Date.now() / 1000) - 30 * 86400},points>=150&hitsPerPage=20`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(String(r.status));
    for (const h of (await r.json()).hits ?? []) {
      if (!h.url?.startsWith("https://")) continue;
      const title = String(h.title).replace(/^Show HN:\s*/i, "");
      if (!AI_WORDS.test(title)) continue; // the search matches loosely; keep launches that are about AI
      const name = clean(title.split(/\s+[-\u2013\u2014:|]\s+|:\s|,\s/)[0]);
      if (name.split(/\s+/).length > 5) continue; // a sentence, not a product name
      add({ key: `hn:${norm(h.url)}`, name, area: "", category: "", url: h.url, summary: clean(title).slice(0, 110), license: "",
        source: `https://news.ycombinator.com/item?id=${h.objectID}`, signal: `Show HN, ${h.points} points` });
    }
  } catch (e) { errors.push(`hacker news "${q}": ${(e as Error).message.slice(0, 60)}`); }
}

// ---- 3. The job market: tools postings ask for that the map does not list
const market = existsSync(MARKET) ? JSON.parse(readFileSync(MARKET, "utf8")) : { tools: [] };
const asked = (market.tools ?? []).filter((t: { name: string }) => !named(t.name) && !GENERAL.has(t.name.toLowerCase())).slice(0, 12).map((t: { name: string; n: number }) => `${t.name} (${t.n} postings)`);

// ---- 4. Monthly: tools on the map whose GitHub repo was archived or has gone quiet
const healthNotes: string[] = [];
if (health) {
  for (const t of tools) {
    const r = repoOf(t.url); if (!r || t.status === "deprecated") continue;
    try {
      const d = await gh(`https://api.github.com/repos/${r}`);
      if (d.archived) healthNotes.push(`${t.name}: repo archived (status on the map: ${t.status ?? "none"})`);
      else if (d.pushed_at && d.pushed_at.slice(0, 10) < ago(365)) healthNotes.push(`${t.name}: no push since ${d.pushed_at.slice(0, 10)}`);
      if (d.full_name && d.full_name.toLowerCase() !== r) healthNotes.push(`${t.name}: repo moved to ${d.full_name}`);
    } catch (e) { healthNotes.push(`${t.name}: ${(e as Error).message.slice(0, 40)}`); }
    await sleep(process.env.GITHUB_TOKEN ? 150 : 1200);
  }
}

// ---- the report: new candidates only (never the same one twice), strongest first
const fresh = [...found.values()].filter((c) => !state.seen[c.key]).sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0)).slice(0, 40);
const esc = (s: string) => s.replace(/\|/g, "/");
const csvQ = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const idOf = (n: string) => n.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const row = (c: Cand) => ["id", "name", "area", "category", "layer", "summary", "license", "model", "maturity", "deployment", "kind", "status", "url", "icon", "emerging", "emerging_why", "emerging_source", "tags", "note"]
  .map((h) => ({ id: idOf(c.name), name: c.name, area: c.area, category: c.category, summary: c.summary, license: c.license, model: c.license ? "oss" : "", url: c.url,
    note: `${c.signal}; ${c.source}` } as Record<string, string>)[h] ?? "").map(csvQ).join(",");
const md = [
  `# Tool candidates, ${week.id} (${week.from} to ${week.to})`,
  "",
  "Found automatically. **Nothing here is on the site.** To add one: check it, copy its row from the block at the end into the content sheet's `tools` tab, fill in maturity, deployment and icon, and `launched` (YYYY-MM, checked against a source): a tool shows as emerging for six months after that month, and `emerging` TRUE with a reason and a source adds the why, and clear the `note` cell (it holds the signal), then run the sync. Untouched candidates are not shown again.",
  "",
  `## New this week (${fresh.length})`,
  "",
  fresh.length ? "| | Candidate | Area (a guess) | Signal | What it says it does |\n|---|---|---|---|---|\n" + fresh.map((c) => `| - [ ] | [${esc(c.name)}](${c.url}) | ${c.area || "?"} | [${esc(c.signal)}](${c.source}) | ${esc(c.summary)} |`).join("\n") : "Nothing new.",
  "",
  "## Asked for in job posts, not on the map",
  "",
  asked.length ? asked.map((a: string) => `- ${a}`).join("\n") : "Nothing.",
  ...(health ? ["", "## Monthly health check", "", healthNotes.length ? healthNotes.map((h) => `- ${h}`).join("\n") : "Every GitHub-hosted tool on the map is active."] : []),
  ...(errors.length ? ["", "<details><summary>Sources that did not answer</summary>", "", ...errors.map((e) => `- ${e}`), "", "</details>"] : []),
  "",
  "<details><summary>Rows for the content sheet (tools tab)</summary>",
  "",
  "```csv",
  ...fresh.map(row),
  "```",
  "",
  "</details>",
].join("\n");

if (dry) { console.log(md); process.exit(0); }
for (const c of fresh) state.seen[c.key] = today;
state.weeks = [{ week: week.id, candidates: fresh, asked, health: healthNotes }, ...state.weeks.filter((w) => w.week !== week.id)].slice(0, 26);
writeFileSync(STATE, JSON.stringify(state, null, 1) + "\n");
writeFileSync(REPORT, md + "\n");
console.log(`tool candidates ${week.id}: ${fresh.length} new, ${asked.length} asked for in jobs, ${healthNotes.length} health notes, ${errors.length} sources failed`);
