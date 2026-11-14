/** Where on this site to learn each of the twelve framework skills. Used by the
 *  fit check to turn a gap into a learning path. Every href is checked at build
 *  time (web/scripts/build-fit.ts) against the pages, layers, problems and jargon
 *  that exist, so a renamed page cannot leave a dead link. */
import { terms as dictionary } from "./dictionary";
import { problems } from "./problems";
import { layers } from "./layers";

export type LearnKind = "Layer" | "Problem" | "Concept" | "Doc" | "Page";
export interface LearnLink { kind: LearnKind; label: string; href: string }

const term = (id: string, label: string): LearnLink => ({ kind: "Concept", label, href: `/jargon/#${id}` });
const layer = (id: string, label: string): LearnLink => ({ kind: "Layer", label, href: `/architecture/#${id}` });
const problem = (id: string, label: string): LearnLink => ({ kind: "Problem", label, href: `/problems/${id}/` });

export const learn: Record<string, LearnLink[]> = {
  software: [
    term("idempotency", "Idempotency"), term("retry-backoff", "Retry with backoff and jitter"),
    term("circuit-breaker", "Circuit breakers"), { kind: "Page", label: "The daily stack", href: "/tools/" },
  ],
  data: [
    term("text-to-sql", "Text-to-SQL"), term("etl-elt", "ETL and ELT"),
    term("data-contract", "Data contracts"), term("lineage", "Lineage"),
  ],
  retrieval: [
    layer("retrieval", "The retrieval layer"), problem("catalog-retrieval-at-scale", "Retrieval at 500M rows"),
    term("hybrid-search", "Hybrid search"), term("chunking", "Chunking"),
  ],
  agents: [
    layer("orchestration", "The orchestration layer"), problem("when-multi-agent-is-wrong", "When multi-agent is wrong"),
    term("mcp", "Model Context Protocol"), { kind: "Doc", label: "Claude Platform, animated", href: "/docs/claude-platform/" },
  ],
  context: [
    layer("caching", "The caching layer"), problem("the-long-context-trade-point", "The long-context trade point"),
    term("context-engineering", "Context engineering"), term("cost-per-request", "Cost per request"),
  ],
  evals: [
    layer("evaluation", "The evaluation layer"), problem("proving-the-pipeline-is-better", "Proving a pipeline is better"),
    term("golden-set", "Golden sets"), term("llm-as-judge", "LLM as judge"),
  ],
  security: [
    layer("governance", "The governance layer"), term("prompt-injection", "Prompt injection"),
    term("pii-handling", "PII handling"), term("eu-ai-act", "EU AI Act"),
  ],
  models: [
    term("lora", "LoRA"), term("quantization", "Quantization"),
    term("kv-cache", "KV cache"), term("vllm", "vLLM"), { kind: "Page", label: "Emerging tech radar", href: "/radar/" },
  ],
  "ai-dev": [
    { kind: "Doc", label: "Claude Platform, animated", href: "/docs/claude-platform/" },
    { kind: "Page", label: "Coding agents in the stack", href: "/tools/" }, term("context-engineering", "Context engineering"),
  ],
  product: [
    problem("when-multi-agent-is-wrong", "Deciding what not to build"), term("human-in-the-loop", "Human in the loop"),
    { kind: "Page", label: "What each role does all day", href: "/roles/tasks/" },
  ],
  customer: [
    { kind: "Page", label: "What the labs ask for", href: "/labs/" }, { kind: "Page", label: "Forward deployed tasks", href: "/roles/tasks/" },
    term("cost-per-request", "Cost per request, for ROI"),
  ],
  architecture: [
    { kind: "Page", label: "Six layers, one request", href: "/architecture/" }, problem("handoff-contracts", "Handoff contracts"),
    term("durable-execution", "Durable execution"), { kind: "Page", label: "All 20 design problems", href: "/problems/" },
  ],
};

/** Does an internal href point at a real page, layer, problem or jargon card? */
export function linkOk(href: string): boolean {
  const terms = new Set(dictionary.map((t) => t.id));
  const probs = new Set(problems.map((p) => p.id));
  const lays = new Set<string>(layers.map((l) => l.id));
  const pages = new Set(["/tools/", "/roles/", "/market/method/", "/market/conferences/", "/roles/families/", "/roles/matrix/", "/roles/tasks/", "/docs/mcp/", "/labs/", "/architecture/", "/problems/", "/docs/claude-platform/", "/fit/", "/market/", "/certificates/", "/radar/", "/skills/"]);
  const [path, hash] = href.split("#");
  return path === "/jargon/" ? terms.has(hash) :
    path === "/architecture/" && hash ? lays.has(hash) :
    path.startsWith("/problems/") && path !== "/problems/" ? probs.has(path.split("/")[2]) :
    pages.has(path);
}

/** Returns the learning links that point at nothing. */
export function checkLearnLinks(): string[] {
  const bad: string[] = [];
  for (const [skill, links] of Object.entries(learn)) for (const l of links) if (!linkOk(l.href)) bad.push(`${skill}: ${l.href}`);
  return bad;
}
