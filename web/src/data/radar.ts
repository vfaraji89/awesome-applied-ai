/** The emerging tech radar: what is new in applied AI, and how far to trust it.
 *  Read on 2026-11-11 from papers, project pages and practitioner write-ups. Each entry
 *  links its sources. Vendor and blog figures are treated as claims, not results, and
 *  version numbers are left out where sources disagreed. */

export type Ring = "use" | "pilot" | "evaluate" | "watch";
export type Area = "models" | "agents" | "serving" | "evals";

export interface RadarItem {
  id: string;
  name: string;
  area: Area;
  ring: Ring;
  /** One line, shown first in bold. */
  short: string;
  what: string;
  why: string;
  use: string;
  avoid: string;
  examples: { name: string; url: string }[];
  sources: { label: string; url: string }[];
  /** Links into this site, for depth. */
  more?: { label: string; href: string }[];
}

export const checked = "2026-11-11";

/** The quarter in brief: what moved in Q3 2026. Hand-written; refresh each quarter. */
export const quarter = {
  name: "Q3 2026",
  points: [
    { title: "MCP went stateless", line: "The 2026-07-28 revision removed the session, so MCP servers scale like plain HTTP services.", href: "#r-mcp-stateless" },
    { title: "Evals became the release gate", line: "Agent pilots are common and production is rare; system-level evals are how teams close the gap.", href: "#r-agent-evals" },
    { title: "Caching is the cheapest win nobody takes", line: "System prompts dominate input tokens, yet most calls read nothing from cache.", href: "#r-prompt-caching" },
    { title: "Skills and sandboxes are the default kit", line: "Agents load SKILL.md packages and run code in disposable sandboxes; supply-chain review follows.", href: "#r-agent-skills" },
  ],
};

export const rings: { id: Ring; name: string; line: string }[] = [
  { id: "use", name: "Use now", line: "Proven in production; a sensible default." },
  { id: "pilot", name: "Pilot", line: "Worth a real project with a fallback." },
  { id: "evaluate", name: "Evaluate", line: "Promising; test it against your baseline first." },
  { id: "watch", name: "Watch", line: "Important direction, not yet for most products." },
];

export const areas: { id: Area; name: string }[] = [
  { id: "models", name: "Models & architectures" },
  { id: "agents", name: "Agents & protocols" },
  { id: "serving", name: "Serving & context" },
  { id: "evals", name: "Evals, ops & safety" },
];

export const radar: RadarItem[] = [
  // ---------------------------------------------------------------- models
  {
    id: "tabular-fm", name: "Tabular foundation models", area: "models", ring: "pilot",
    short: "Predictions on a new table with no training run.",
    what: "Models pre-trained on millions of synthetic tables that predict on a new table in one forward pass, by in-context learning: no training, no tuning loop.",
    why: "Most enterprise data is tables. For small and medium tables they now match or beat tuned gradient-boosted trees out of the box, and some give calibrated uncertainty.",
    use: "Churn, pricing, risk and demand on tables up to tens of thousands of rows; a strong baseline before you tune XGBoost.",
    avoid: "Very large tables, hard latency budgets, or commercial use under a non-commercial licence: check each model's licence, they differ.",
    examples: [
      { name: "TabPFN (Prior Labs)", url: "https://github.com/PriorLabs/TabPFN" },
      { name: "TabICL", url: "https://github.com/soda-inria/tabicl" },
      { name: "Mitra (Amazon)", url: "https://arxiv.org/pdf/2609.04540" },
      { name: "LimiX", url: "https://arxiv.org/pdf/2606.04485" },
    ],
    sources: [
      { label: "TALENT toolkit and benchmark (300 datasets)", url: "https://github.com/LAMDA-Tabular/TALENT" },
      { label: "Beyond IID: how general are tabular FMs?", url: "https://arxiv.org/pdf/2606.30410" },
      { label: "TabRelBench: beyond predictive accuracy", url: "https://arxiv.org/pdf/2610.13654" },
      { label: "AIM Tabular Index (third-party ranking)", url: "https://aimultiple.com/tabular" },
    ],
    more: [{ label: "Tabular foundation model (jargon)", href: "/jargon/#tabular-foundation-model" }, { label: "Text-to-SQL, for the other way into tables", href: "/jargon/#text-to-sql" }],
  },
  {
    id: "jepa", name: "JEPA world models", area: "models", ring: "watch",
    short: "Models that learn the world by predicting meaning, not pixels.",
    what: "Joint-embedding predictive architectures learn by predicting the representation of missing or future input, not its pixels or tokens. V-JEPA 2 learns from video and plans robot actions from it.",
    why: "A different route from next-token prediction: models that learn how the physical world behaves from unlabelled video, with very little robot data.",
    use: "Robotics, video understanding and planning research; following where non-LLM foundation models are going.",
    avoid: "Text, documents and chat products: there is no production JEPA language stack yet.",
    examples: [
      { name: "V-JEPA 2 (Meta)", url: "https://ai.meta.com/research/vjepa/" },
      { name: "V-JEPA 2 paper", url: "https://arxiv.org/abs/2506.09985" },
    ],
    sources: [
      { label: "Meta AI: V-JEPA 2", url: "https://ai.meta.com/research/vjepa/" },
      { label: "D-JEPA: a decision-aligned latent world model", url: "https://arxiv.org/pdf/2609.24749" },
      { label: "LLMs as a special case of world models", url: "https://arxiv.org/pdf/2606.28127" },
    ],
    more: [{ label: "JEPA (jargon)", href: "/jargon/#jepa" }],
  },
  {
    id: "diffusion-lm", name: "Diffusion language models", area: "models", ring: "evaluate",
    short: "Text written in parallel blocks, not token by token.",
    what: "Language models that write by refining a whole block of text in parallel over a few steps, instead of one token at a time.",
    why: "Several times the throughput of similar autoregressive models on some tasks, which changes the cost and latency of code completion and edits.",
    use: "Latency-bound generation: autocomplete, code edits, fast drafts; compare against a small autoregressive model on your own task.",
    avoid: "The hardest reasoning: leading autoregressive models still win there. Some offerings remain research previews.",
    examples: [
      { name: "Mercury (Inception)", url: "https://arxiv.org/pdf/2506.17298" },
      { name: "Gemini Diffusion (research preview)", url: "https://deepmind.google/models/gemini-diffusion/" },
      { name: "LLaDA (open weights)", url: "https://github.com/ML-GSAI/LLaDA" },
    ],
    sources: [
      { label: "Mercury: diffusion LMs at scale (paper)", url: "https://arxiv.org/pdf/2506.17298" },
      { label: "TWIML: production-grade diffusion LLMs", url: "https://twimlai.com/go/764" },
    ],
    more: [{ label: "Diffusion language model (jargon)", href: "/jargon/#diffusion-language-model" }],
  },
  {
    id: "hybrid-ssm", name: "Hybrid state-space models", area: "models", ring: "pilot",
    short: "Long context at a fraction of the memory.",
    what: "Models that mix Mamba-style state-space layers with a few attention layers, so memory grows far more slowly with context length.",
    why: "Long inputs and many concurrent requests on less GPU memory; small hybrids run on phones and laptops.",
    use: "Long-document and high-concurrency workloads on your own hardware; on-device assistants.",
    avoid: "Serving stacks that do not support the architecture yet: check your inference engine first.",
    examples: [
      { name: "IBM Granite 4.0", url: "https://www.ibm.com/new/announcements/ibm-granite-4-0-hyper-efficient-high-performance-hybrid-models" },
      { name: "NVIDIA Nemotron-H", url: "https://arxiv.org/abs/2504.03624" },
      { name: "AI21 Jamba (paper)", url: "https://arxiv.org/abs/2403.19887" },
    ],
    sources: [
      { label: "IBM: Granite 4.0 hybrid architecture", url: "https://www.ibm.com/think/news/hybrid-thinking-inside-architecture-granite-4-0" },
      { label: "Nemotron-H paper", url: "https://arxiv.org/abs/2504.03624" },
    ],
    more: [{ label: "Hybrid state-space model (jargon)", href: "/jargon/#hybrid-ssm" }],
  },
  // ---------------------------------------------------------------- agents
  {
    id: "agent-skills", name: "Agent Skills (SKILL.md)", area: "agents", ring: "use",
    short: "Know-how an agent loads only when a task needs it.",
    what: "A folder with a SKILL.md file: a name, a description and instructions, plus optional scripts. Agents read only the name and description until a task needs the rest.",
    why: "Anthropic opened the format on 18 December 2025 and dozens of agents now read it. It is the cheapest way to give an agent your team's procedures without filling its context.",
    use: "Repeatable procedures: report formats, review checklists, deploy steps. Pair with MCP for live data.",
    avoid: "Installing community skills unreviewed: researchers report security flaws in a large share of them.",
    examples: [{ name: "agentskills.io", url: "https://agentskills.io" }],
    sources: [
      { label: "Agent Skills explained (format and adoption)", url: "https://atlan.com/know/ai-agent/ai-agent-skills/what-are-agent-skills/" },
      { label: "Supply-chain security for agent skills", url: "https://arxiv.org/pdf/2603.00195" },
    ],
    more: [{ label: "Agent Skills (jargon)", href: "/jargon/#agent-skills" }, { label: "Context engineering", href: "/jargon/#context-engineering" }],
  },
  {
    id: "agent-protocols", name: "The agent protocol stack: MCP, A2A, AG-UI", area: "agents", ring: "pilot",
    short: "One plug for tools, one for agents, one for the UI.",
    what: "Three layers that complement each other: MCP connects an agent to tools and data, A2A lets agents delegate to agents, AG-UI streams an agent's work into a user interface.",
    why: "Build once, plug into many hosts. A2A reached a stable 1.0; AG-UI fills the gap between an agent and the screen.",
    use: "MCP for every tool you expose; A2A when separate teams own separate agents; AG-UI for live agent UIs.",
    avoid: "Adding A2A for agents that live in one codebase: a function call is simpler.",
    examples: [
      { name: "MCP", url: "https://modelcontextprotocol.io" },
      { name: "A2A", url: "https://a2a-protocol.org" },
      { name: "AG-UI", url: "https://github.com/ag-ui-protocol/ag-ui" },
    ],
    sources: [
      { label: "The state of agentic AI standards in 2026", url: "https://dev.to/alexmercedcoder/the-state-of-agentic-ai-standards-in-2026-mcp-a2a-webmcp-osi-and-the-protocol-stack-taking-3o2l" },
      { label: "Threat modelling MCP, A2A, Agora and ANP", url: "https://arxiv.org/pdf/2602.11327" },
    ],
    more: [{ label: "AG-UI (jargon)", href: "/jargon/#ag-ui" }, { label: "Model Context Protocol", href: "/jargon/#mcp" }, { label: "Agent-to-agent protocols", href: "/jargon/#a2a" }],
  },
  {
    id: "sandboxes", name: "Agent sandboxes", area: "agents", ring: "use",
    short: "A throwaway machine for code the model wrote.",
    what: "Isolated, short-lived machines where an agent runs code, installs packages and touches files, away from your systems.",
    why: "Any agent that executes code needs one. Startup in well under a second makes a sandbox per task affordable.",
    use: "Code interpreters, data analysis agents, coding agents, anything that runs model-written code.",
    avoid: "Running model-written code in your app server or CI runner directly.",
    examples: [
      { name: "E2B", url: "https://github.com/e2b-dev/E2B" },
      { name: "Daytona", url: "https://github.com/daytonaio/daytona" },
    ],
    sources: [{ label: "Towards a systems foundation for agentic skills (security, lifecycle)", url: "https://arxiv.org/pdf/2608.29596" }],
    more: [{ label: "Sandboxing", href: "/jargon/#sandboxing" }],
  },
  {
    id: "computer-use", name: "Computer-use and browser agents", area: "agents", ring: "evaluate",
    short: "Agents that click and type like a person.",
    what: "Agents that operate a screen: they look at screenshots and click, type and scroll, in a browser or a whole desktop.",
    why: "They reach systems that have no API, which is most legacy enterprise software.",
    use: "Internal back-office flows with no API, under human review, in a sandbox.",
    avoid: "Anything with money, credentials or irreversible actions without a human approval step; an API is faster and steadier when one exists.",
    examples: [
      { name: "Claude computer use", url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool" },
    ],
    sources: [{ label: "The AI agent stack in 2026", url: "https://thenuancedperspective.substack.com/p/the-ai-agent-stack-in-2026" }],
    more: [{ label: "Computer-use agent (jargon)", href: "/jargon/#computer-use-agent" }, { label: "Excessive agency", href: "/jargon/#excessive-agency" }, { label: "Human in the loop", href: "/jargon/#human-in-the-loop" }],
  },
  {
    id: "durable-agents", name: "Durable execution for agents", area: "agents", ring: "pilot",
    short: "Long agent runs that survive crashes and pauses.",
    what: "Workflow engines that record every step, so a long agent run survives crashes, deploys and days-long pauses for approval.",
    why: "Agents now run for minutes to days; a retry from scratch wastes tokens and repeats side effects.",
    use: "Long-running or multi-step agents with side effects, and human approvals in the middle.",
    avoid: "Short request-response agents: a plain retry is enough.",
    examples: [
      { name: "Temporal", url: "https://temporal.io" },
      { name: "DBOS", url: "https://github.com/dbos-inc/dbos-transact-py" },
      { name: "Restate", url: "https://github.com/restatedev/restate" },
    ],
    sources: [{ label: "AI agent landscape 2026: what reached production", url: "https://www.qualiasolutions.ai/blog/the-ai-agent-stack-in-2026-which-harnesses-and-frameworks-actually-made-it-to-production" }],
    more: [{ label: "Durable execution", href: "/jargon/#durable-execution" }, { label: "Approval across a three-day pause", href: "/problems/approval-across-a-long-pause/" }],
  },
  {
    id: "mcp-stateless", name: "Stateless MCP (2026-07-28 revision)", area: "agents", ring: "pilot",
    short: "MCP servers that scale like any web service.",
    what: "The July 2026 MCP revision drops the protocol session: no initialize handshake and no session id, so each request carries its own version and capabilities.",
    why: "An MCP server can now sit behind a plain load balancer like any HTTP service, and gateways can route on headers alone.",
    use: "New remote MCP servers, and existing ones you need to scale out. Read the migration notes first: the change breaks older clients.",
    avoid: "Rewriting a working local (stdio) server just to follow the new revision before your clients support it.",
    examples: [{ name: "MCP specification", url: "https://modelcontextprotocol.io/specification" }],
    sources: [
      { label: "MCP blog: the 2026-07-28 release", url: "https://blog.modelcontextprotocol.io/posts/2026-07-28/" },
      { label: "Google: scaling agent infrastructure with stateless MCP", url: "https://developers.googleblog.com/scaling-ai-agent-infrastructure-with-the-mcp-stateless-updates/" },
    ],
    more: [{ label: "Migrating to stateless MCP", href: "/problems/stateless-mcp-migration/" }, { label: "The MCP caching contract", href: "/problems/the-mcp-caching-contract/" }, { label: "Model Context Protocol", href: "/jargon/#mcp" }],
  },
  // ---------------------------------------------------------------- serving & context
  {
    id: "disaggregated-serving", name: "Disaggregated prefill and decode", area: "serving", ring: "evaluate",
    short: "Separate GPUs for reading the prompt and writing the answer.",
    what: "Running the prompt-reading phase (prefill) and the token-writing phase (decode) on separate GPU pools, routed by where the KV cache already lives.",
    why: "Each phase gets the hardware it needs; reported gains in latency and throughput at large scale.",
    use: "Large self-hosted fleets with long prompts and many users.",
    avoid: "Most teams: start with chunked prefill and prefix caching. Moving the KV cache between pools has a real cost.",
    examples: [
      { name: "llm-d (CNCF Sandbox)", url: "https://github.com/llm-d/llm-d" },
      { name: "SGLang", url: "https://github.com/sgl-project/sglang" },
    ],
    sources: [
      { label: "Thoughtworks Technology Radar: llm-d", url: "https://www.thoughtworks.com/radar/platforms/llm-d" },
      { label: "Disaggregation is a thousand-GPU problem", url: "https://towardsdatascience.com/disaggregation-is-a-thousand-gpu-problem/" },
    ],
    more: [{ label: "Disaggregated prefill and decode (jargon)", href: "/jargon/#disaggregated-serving" }, { label: "KV cache", href: "/jargon/#kv-cache" }, { label: "Chunked prefill", href: "/jargon/#chunked-prefill" }],
  },
  {
    id: "context-engineering", name: "Context engineering and memory layers", area: "serving", ring: "use",
    short: "Choosing what the model sees on every step.",
    what: "Deciding what goes into the model's window on each step: retrieved facts, memory, tool results, compacted history, and in what order, so it can be cached.",
    why: "Quality and cost now depend more on the context than on the model choice.",
    use: "Every agent: budget the window, cache the stable prefix, compact long runs, keep memory outside the prompt.",
    avoid: "Stuffing the whole history or every document into a long window: accuracy drops as inputs grow.",
    examples: [
      { name: "Letta", url: "https://github.com/letta-ai/letta" },
      { name: "Mem0", url: "https://github.com/mem0ai/mem0" },
    ],
    sources: [{ label: "Context Rot (Chroma research)", url: "https://research.trychroma.com/context-rot" }],
    more: [{ label: "The caching layer", href: "/architecture/#caching" }, { label: "The memory layer", href: "/architecture/#memory" }],
  },
  {
    id: "prompt-caching", name: "Prompt-caching discipline", area: "serving", ring: "use",
    short: "Keep the prompt's top identical and pay a tenth.",
    what: "Building prompts so the stable part (system prompt, tool list, guardrails) is a byte-identical prefix the provider can cache, and watching cache-read tokens in your traces.",
    why: "Datadog reports that system prompts were 69% of input tokens in its customers' traces in March 2026, and secondary write-ups of its report say only about a quarter of calls on caching-capable models read anything from cache.",
    use: "Every production prompt: fixed order for tools and instructions, variable content last, and a dashboard of cache hit rate.",
    avoid: "Timestamps, request ids or shuffled tool lists near the top of the prompt: one changed byte and the cache misses.",
    examples: [{ name: "Datadog: monitor prompt caching", url: "https://www.datadoghq.com/blog/monitor-prompt-caching-optimize-token-usage/" }],
    sources: [{ label: "Datadog: State of AI Engineering", url: "https://www.datadoghq.com/state-of-ai-engineering/" }],
    more: [{ label: "The caching layer", href: "/architecture/#caching" }, { label: "KV cache", href: "/jargon/#kv-cache" }, { label: "Cost per request", href: "/jargon/#cost-per-request" }],
  },
  // ---------------------------------------------------------------- evals, ops & safety
  {
    id: "agent-evals", name: "System-level agent evals", area: "evals", ring: "use",
    short: "Score the whole run, not one prompt.",
    what: "Scoring the whole agent run (trajectory, tool calls, final state, cost) on a shared, versioned eval set, not one prompt at a time.",
    why: "Many companies have agent pilots but few reach production; teams cite proving reliability as the gap. Eval suites are becoming the release gate.",
    use: "Any agent going to production: a golden set of tasks, trace-based checks on tool use, a judge model with human spot checks, run in CI.",
    avoid: "Public benchmark scores as a proxy for your task, and judge scores nobody has calibrated against people.",
    examples: [{ name: "Inspect (UK AISI)", url: "https://github.com/UKGovernmentBEIS/inspect_ai" }, { name: "OpenAI Evals", url: "https://github.com/openai/evals" }],
    sources: [
      { label: "InfoQ: reusable evaluation frameworks for agentic products (Elastic)", url: "https://www.infoq.com/presentations/elastic-ai-agent-evaluations/" },
      { label: "Agent evaluation: a detailed guide", url: "https://cameronrwolfe.substack.com/p/agent-evals" },
    ],
    more: [{ label: "The evaluation layer", href: "/architecture/#evaluation" }, { label: "Golden set", href: "/jargon/#golden-set" }, { label: "LLM as judge", href: "/jargon/#llm-as-judge" }, { label: "Proving a pipeline is better", href: "/problems/proving-the-pipeline-is-better/" }],
  },
  {
    id: "otel-genai", name: "OpenTelemetry GenAI conventions", area: "evals", ring: "pilot",
    short: "Traces of model and agent calls any tool can read.",
    what: "A shared vocabulary for tracing model calls, agents and tools (invoke_agent, execute_tool) and for attaching evaluation scores to traces.",
    why: "Traces that any backend can read, so you are not locked to one observability vendor.",
    use: "New tracing work: emit the GenAI attributes now. Keep prompt and output capture opt-in, since they hold sensitive data.",
    avoid: "Assuming stability: the conventions are still in development and moved to their own repository in 2026.",
    examples: [
      { name: "OTel GenAI semantic conventions", url: "https://github.com/open-telemetry/semantic-conventions-genai" },
      { name: "OpenInference", url: "https://github.com/Arize-ai/openinference" },
    ],
    sources: [{ label: "OpenTelemetry GenAI semantic conventions (2026 status)", url: "https://www.greptime.com/blogs/2026-05-09-opentelemetry-genai-semantic-conventions" }],
    more: [{ label: "Tracing", href: "/jargon/#tracing" }, { label: "The evaluation layer", href: "/architecture/#evaluation" }],
  },
  {
    id: "prompt-optimization", name: "Prompt optimization against evals", area: "evals", ring: "pilot",
    short: "Let an optimizer tune the prompt against your evals.",
    what: "Optimizers that rewrite prompts and few-shot examples to raise a metric on your own eval set, using the model's reflections on its failures.",
    why: "Turns prompt tuning into a measured loop, and makes switching models cheaper.",
    use: "Any prompt that has a golden set and a clear metric.",
    avoid: "Prompts without an eval set: the optimizer will overfit whatever you give it.",
    examples: [
      { name: "DSPy", url: "https://github.com/stanfordnlp/dspy" },
      { name: "GEPA", url: "https://github.com/gepa-ai/gepa" },
    ],
    sources: [{ label: "GEPA: reflective prompt evolution (paper)", url: "https://arxiv.org/abs/2507.19457" }],
    more: [{ label: "Golden set", href: "/jargon/#golden-set" }],
  },
  {
    id: "skill-supply-chain", name: "Agent supply-chain security", area: "evals", ring: "watch",
    short: "Treat skills and MCP servers as third-party code.",
    what: "Treating skills, MCP servers and agent plugins as third-party code: provenance, review, pinning and least privilege.",
    why: "Agents now install capabilities at run time; one malicious skill or server can reach everything the agent can.",
    use: "An allow-list of reviewed skills and MCP servers; pin versions; run untrusted ones in a sandbox.",
    avoid: "Letting an agent install skills or servers from public directories on its own.",
    examples: [{ name: "OWASP Top 10 for LLM applications", url: "https://genai.owasp.org" }],
    sources: [
      { label: "Formal analysis and supply-chain security for agent skills", url: "https://arxiv.org/pdf/2603.00195" },
      { label: "Security threat modelling for agent protocols", url: "https://arxiv.org/pdf/2602.11327" },
    ],
    more: [{ label: "AI supply chain risk", href: "/jargon/#supply-chain" }, { label: "Prompt injection", href: "/jargon/#prompt-injection" }],
  },
];
