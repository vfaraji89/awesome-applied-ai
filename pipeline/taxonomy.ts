import { stack } from "../web/src/data/stack";
import { tools } from "../web/src/data/tools";

/** Is this an AI role? The title decides; a description alone is not enough. */
const AI_TITLE = /\b(a\.?i\.?|ml|llm|llms|gen ?ai|generative|machine learning|deep learning|nlp|agent|agents|agentic|rag|prompt|applied scientist|research (engineer|scientist)|data scientist|forward[- ]deployed|computer vision|mlops|llmops)\b/i;
/** Scope: technical roles that build, deploy, design or research AI systems. Sales, marketing,
    recruiting, legal, finance, product and program management, and support titles are left out. */
const NOT_TECH = /account (executive|manager)|\bsales\b|seller|marketing|recruit|talent|counsel|legal|attorney|paralegal|finance|financial analyst|accountant|payroll|people partner|human resources|\bhr\b|business development|partnerships?|partner manager|customer success|outcomes manager|deployment manager|program manager|product manager|product marketing|community|communications|\bpolicy\b|operations manager|executive assistant|support (specialist|engineer)|\bdesigner\b|writer|editor/i;
const TECH_WORD = /engineer|engineering|architect|scientist|research|developer|technical staff|\b(head of|lead) (applied )?(ai|ml)\b|fellow/i;
export const isAI = (title: string) => AI_TITLE.test(title) && !NOT_TECH.test(title) && TECH_WORD.test(title);

/** Role families, matched on the title in this order. Ids match the site's framework. */
const ROLES: [string, RegExp][] = [
  ["forward-deployed-engineer", /forward[- ]deployed|deployment strategist|field engineer/i],
  ["ai-native-architect", /ai[- ]native architect|\bai architect|principal (ai|ml)|head of (applied )?ai|ai lead architect|chief ai/i],
  ["ai-solutions-architect", /solutions? architect|solutions? engineer|customer engineer|sales engineer|technical consultant|pre[- ]?sales/i],
  ["agentic-ai-engineer", /\bagent(s|ic)?\b/i],
  ["ai-platform-engineer", /platform|infrastructure|infra\b|mlops|llmops|inference|serving|ml engineer|machine learning engineer|ml systems/i],
  ["rd-researcher", /research|scientist|fellow/i],
  ["ai-native-developer", /ai[- ]native|product engineer|full[- ]?stack|founding engineer|software engineer.*\b(ai|llm)\b|\b(ai|llm)\b.*software engineer/i],
  ["applied-ai-engineer", /applied ai|ai engineer|llm engineer|gen ?ai engineer|generative ai|ai\/ml|ml\/ai|nlp engineer|prompt engineer/i],
];
export function role(title: string): string {
  for (const [id, re] of ROLES) if (re.test(title)) return id;
  return "other-ai";
}

export function seniority(title: string): string {
  const t = title.toLowerCase();
  if (/intern|internship|working student|werkstudent|apprentice/.test(t)) return "Intern";
  if (/\b(junior|jr\.?|graduate|new grad|entry|associate)\b/.test(t)) return "Junior";
  if (/\b(head|director|vp|chief)\b/.test(t)) return "Head";
  if (/\b(principal|distinguished)\b/.test(t)) return "Principal";
  if (/\b(staff)\b/.test(t)) return "Staff";
  if (/\b(lead|manager)\b/.test(t)) return "Lead";
  if (/\b(senior|sr\.?)\b/.test(t)) return "Senior";
  return "Mid";
}

/** The twelve framework skills, as phrases that show up in postings. */
const SKILLS: [string, RegExp][] = [
  ["software", /\b(python|typescript|javascript|golang|java|rust|rest apis?|graphql|backend|microservices|ci\/cd|kubernetes|docker)\b/i],
  ["data", /\b(sql|data model|data pipeline|etl|warehouse|bigquery|snowflake|spark|dbt|data engineering)\b/i],
  ["retrieval", /\b(rag|retrieval|vector (db|database|search|store)|embeddings?|semantic search|rerank|hybrid search|knowledge base)\b/i],
  ["agents", /\b(agents?|agentic|tool[- ]?(use|calling)|function calling|mcp|model context protocol|multi[- ]agent|orchestration)\b/i],
  ["context", /\b(context (window|engineering)|prompt caching|token (cost|budget|usage)|latency|cost optimi[sz]ation|prompt engineering)\b/i],
  ["evals", /\b(evals?|evaluation (framework|harness|pipeline|set)s?|model evaluation|llm evaluation|benchmark\w*|observability|tracing|a\/b test\w*|langsmith|langfuse)\b/i],
  ["security", /\b(guardrails?|prompt injection|jailbreak\w*|pii|red[- ]team\w*|threat model\w*|responsible ai|ai safety|trust (and|&) safety|security (engineering|best practices|review)|secure (coding|by design)|ai governance|model governance|gdpr|soc ?2|hipaa)\b/i],
  ["models", /\b(fine[- ]?tun\w*|model training|train(ing)? (large )?models|pre[- ]?training|post[- ]?training|inference|model serving|pytorch|tensorflow|jax|distillation|quantization|gpus?|cuda|rlhf)\b/i],
  ["ai-dev", /\b(cursor|copilot|claude code|coding agents?|ai[- ]assisted (coding|development)|codex|windsurf)\b/i],
  ["product", /\b(product sense|user experience|ux|product thinking|roadmap|prototype|mvp|user research|product[- ]minded)\b/i],
  ["customer", /\b(customer[- ]facing|client[- ]facing|work(ing)? (directly )?with customers|stakeholders?|discovery|adoption|roi|enablement|workshops?|pre[- ]?sales)\b/i],
  ["architecture", /\b(system (architecture|design)|software architecture|solution architecture|reference architecture|distributed systems|technical design|design docs?)\b/i],
];
export const skillsOf = (text: string) => SKILLS.filter(([, re]) => re.test(text)).map(([id]) => id);

/** Tools: the 30 in the daily stack plus the 133 on the map. Short or generic names need care. */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ALIASES: Record<string, string[]> = {
  "Claude Code": ["claude code"], "Claude Agent SDK": ["claude agent sdk", "agent sdk"], "Copilot Studio": ["copilot studio"],
  "Azure AI Foundry": ["azure ai foundry", "ai foundry", "azure openai"], "Vertex AI": ["vertex ai", "vertex"], "Deep Agents": ["deep agents", "deepagents"],
  "RAG": ["RAG", "retrieval-augmented", "retrieval augmented"], "Vector DB": ["vector database", "vector db", "vector store"],
  "Google Cloud": ["google cloud", "gcp"], "SQL": ["SQL"], "Text-to-SQL": ["text-to-sql", "text to sql", "nl2sql"], "Hugging Face": ["hugging face", "huggingface"],
  "Perplexity AI Search": ["Perplexity"], "Vercel AI SDK": ["vercel ai sdk", "ai sdk"], "Microsoft Agents SDK": ["agents sdk", "semantic kernel"],
  "MCP": ["MCP", "model context protocol"], "Power Automate": ["power automate"], "Next.js": ["next.js", "nextjs"],
  "Voyage": ["Voyage AI"], "Temporal": ["Temporal"], "Phoenix": ["Arize Phoenix"], "Weave": ["W&B Weave", "Weights & Biases Weave"],
};
/** Names that are also ordinary words or metrics: match the brand spelling only, or skip. */
const EXACT_CASE = new Set(["Perplexity AI Search", "Temporal", "Cohere", "Chroma", "Vespa"]);
const SKIP = new Set(["Unstructured", "Marker", "Outlines", "Instructor", "Hindsight", "Ax", "MemOS", "Context rot", "Lost in the middle"]);
type Matcher = { name: string; inStack: boolean; re: RegExp };
const stackNames = new Set(stack.flatMap((g) => g.tools.map((t) => t.name)));
const matchers: Matcher[] = [];
const seen = new Set<string>();
for (const name of [...stackNames, ...tools.map((t) => t.name)]) {
  if (seen.has(name.toLowerCase()) || SKIP.has(name)) continue;
  seen.add(name.toLowerCase());
  const alias = ALIASES[name] ?? [name];
  const caseSensitive = EXACT_CASE.has(name) || alias.some((a) => a.length <= 4 && a === a.toUpperCase());
  matchers.push({ name, inStack: stackNames.has(name), re: new RegExp(`(?<![\\w-])(${alias.map(esc).join("|")})(?![\\w-])`, caseSensitive ? "" : "i") });
}
export const toolsOf = (text: string) => matchers.filter((m) => m.re.test(text)).map((m) => m.name);
export const inStack = (name: string) => stackNames.has(name);

/** The same patterns, for the site's role-fit check (web/scripts/build-fit.ts), so a CV
    is read exactly the way a posting is. */
export const skillPatterns = () => SKILLS.map(([id, re]) => ({ id, source: re.source, flags: re.flags }));
export const toolPatterns = () => matchers.map((m) => ({ name: m.name, inStack: m.inStack, source: m.re.source, flags: m.re.flags }));
