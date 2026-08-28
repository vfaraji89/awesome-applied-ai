import type { Layer } from "@/lib/types";

export const layers: Layer[] = [
  {
    id: "governance",
    name: "Guardrails & Governance",
    tagline: "Constrain it and prove it",
    question: "What stops this from causing harm, and who signs off?",
    categories: [
      { id: "guardrails", name: "Guardrails & PII", blurb: "Filters for injection, toxicity and personal data." },
      { id: "governance-tooling", name: "Governance tooling", blurb: "Platforms that emit risk registers and compliance artifacts." },
      { id: "regulation", name: "Regulation & frameworks", blurb: "Obligations and certifications an enterprise roadmap must absorb." },
    ],
    formulas: [
      {
        id: "layered-asr",
        label: "Layered defense, attack success rate",
        tex: "\\mathrm{ASR}_{\\text{total}} \\;=\\; \\prod_{i=1}^{k} \\mathrm{ASR}_i \\quad \\text{only if } \\mathrm{ASR}_i \\perp \\mathrm{ASR}_j",
        note: "Three filters at 30% ASR each multiply to 2.7% — on paper. Independence is the assumption that fails: an adaptive attacker who defeats one classifier usually defeats correlated ones, which is why measured layered ASR against adaptive attacks stays above 85% instead of collapsing.",
      },
      {
        id: "fpr-volume",
        label: "False blocks per day",
        tex: "B_{\\text{false}} \\;=\\; \\mathrm{FPR} \\times Q_{\\text{day}}",
        note: "A filter with 1% FPR on a million-request/day product blocks 10,000 legitimate requests. Guardrail vendors quote recall; the number that decides whether you can ship is FPR at your traffic volume.",
      },
    ],
    notes: [
      "Prompt-injection classifiers are filters, not boundaries. Published 2025-2026 work shows character injection and algorithmic evasion approaching total evasion against several commercial and open detectors.",
      "Over-length prompt-overflow inputs defeat detectors that catch the same payload in short context. Layered defenses cut naive attack success substantially, but adaptive attackers still exceed 85% success.",
      "Put the real control at the architecture layer: least-privilege tool scopes, human approval on state-changing actions, no implicit trust in retrieved content.",
      "Deterministic components — Presidio redaction, schema validation, allow-lists — are the only parts that behave predictably. Anything sold as blocking prompt injection is theatre.",
      "The Annex III deferral to December 2027 is a resequencing opportunity, not a cancellation.",
      "Start ISO 42001 now if you sell to enterprise or government. It takes 6-12 months and increasingly appears in due-diligence questionnaires. NIST AI RMF first is the standard on-ramp.",
      "Verify regulatory dates against primary sources before citing them internally. This is a starting point, not legal advice.",
    ],
  },
  {
    id: "evaluation",
    name: "Evaluation & Observability",
    tagline: "Know whether any of it works",
    question: "How do you tell a good trajectory from a lucky answer?",
    categories: [
      { id: "tracing", name: "Tracing", blurb: "Span-level visibility into agent runs, cost and latency." },
      { id: "eval-frameworks", name: "Evaluation frameworks", blurb: "Harnesses for scoring retrieval, output and trajectories." },
    ],
    formulas: [
      {
        id: "kappa",
        label: "Judge agreement — Cohen's κ",
        tex: "\\kappa \\;=\\; \\frac{p_o - p_e}{1 - p_e}",
        note: "Observed agreement with human labels, corrected for chance. On a balanced binary task a judge that agrees 80% of the time scores κ ≈ 0.6; at 60% it scores κ ≈ 0.2 and is close to noise. Never ship an LLM judge without this number.",
      },
      {
        id: "swap-consistency",
        label: "Position-swap consistency",
        tex: "C_{\\text{swap}} \\;=\\; \\Pr\\big[\\, j(a,b) = j(b,a) \\,\\big]",
        note: "Run every pairwise comparison in both orders. High C_swap is what teams mistake for accuracy — a judge can be perfectly self-consistent and consistently wrong. κ measures correctness, C_swap only measures stability.",
      },
      {
        id: "faithfulness",
        label: "Faithfulness",
        tex: "\\text{faithfulness} \\;=\\; \\frac{\\big|\\{\\, c \\in C \\;:\\; R \\models c \\,\\}\\big|}{|C|}",
        note: "Fraction of claims C in the answer entailed by retrieved context R. Scores one retrieve-then-generate turn, which is why RAG metrics are commoditised and agent trajectory scoring is not.",
      },
      {
        id: "trajectory",
        label: "Trajectory vs outcome",
        tex: "\\Pr[\\text{path correct}] \\;\\le\\; \\Pr[\\text{answer correct}]",
        note: "Outcome accuracy is an upper bound on trajectory accuracy, never a proxy for it. The gap is where broken tool calls hide behind lucky answers.",
      },
    ],
    notes: [
      "Survives enterprise procurement: Langfuse, Arize Phoenix, Braintrust, HoneyHive, Datadog. LangSmith self-host is gated behind Enterprise pricing.",
      "Do not build on Helicone — acquired by Mintlify in March 2026 and now in maintenance mode.",
      "OpenTelemetry GenAI semantic conventions are NOT stable. Every document in the spec repo is still marked Development as of July 2026, and the spec moved to its own repository. Vendor blogs claiming otherwise are wrong.",
      "Emit OTel anyway. It is the only credible lock-in hedge, and attribute churn is cheaper than a proprietary schema migration. Put a translation shim between your app and the SDK.",
      "RAG-component metrics are commoditised and solid. Agent trajectory evaluation is not — no tool convincingly scores multi-step plan quality, and everyone is quietly reusing an LLM judge underneath.",
      "A correct final answer can hide broken tool calls, and a wrong answer may come from one bad step in fifteen. Score the trajectory, not just the output.",
      "LLM-as-judge: position, verbosity and self-preference biases are replicated at scale. High inter-run consistency is routinely mistaken for accuracy — a judge can be reliably wrong.",
      "Never ship a judge without a kappa figure against human labels, plus position-swap and length-controlled runs. Binary and rubric criteria beat 1-10 Likert scales.",
    ],
  },
  {
    id: "orchestration",
    name: "Orchestration & Protocols",
    tagline: "Assemble context, coordinate tools",
    question: "What runs the loop, and how does it survive a crash?",
    categories: [
      { id: "frameworks", name: "Agent frameworks", blurb: "Runtimes that hold state across steps and failures." },
      { id: "prompt-optimization", name: "Prompt optimization", blurb: "Compiling prompts against a metric instead of hand-tuning." },
      { id: "protocols", name: "Protocols & conventions", blurb: "How tools, agents and repos describe themselves." },
      { id: "structured-output", name: "Structured output", blurb: "Constrained decoding and schema enforcement." },
    ],
    formulas: [
      {
        id: "compounding",
        label: "Reliability compounds multiplicatively",
        tex: "P_{\\text{success}} \\;=\\; \\prod_{i=1}^{n} p_i \\;=\\; p^{\\,n}",
        note: "A 20-step agent whose every step is 99% reliable succeeds 81.8% of the time. At 95% per step it succeeds 35.8%. This single line is the entire argument for durable execution — you cannot reach acceptable end-to-end reliability by improving prompts.",
      },
      {
        id: "checkpointing",
        label: "Expected steps executed, with and without checkpoints",
        tex: "E[S]_{\\text{retry-all}} = \\frac{n}{p^{\\,n}} \\qquad E[S]_{\\text{checkpoint}} = \\frac{n}{p}",
        note: "At n = 20 and p = 0.95, restarting the whole run costs ~56 step-executions; resuming from the last checkpoint costs ~21. The gap widens exponentially in n, which is why the durability substrate is the decision and the agent library is the replaceable part.",
      },
      {
        id: "constrained-decoding",
        label: "Grammar-constrained decoding",
        tex: "p'(t) \\;=\\; \\frac{p(t)\\,\\mathbb{1}\\!\\left[t \\in V_{\\text{valid}}\\right]}{\\displaystyle\\sum_{t' \\in V_{\\text{valid}}} p(t')}",
        note: "Mask invalid tokens, renormalise. Schema conformance becomes 100% by construction — which is why JSON validity is a solved non-issue. The mask says nothing about whether the model picked the right tool or plausible-but-wrong arguments.",
      },
    ],
    notes: [
      "Stars do not equal standardization. CrewAI and LangChain dominate GitHub metrics; production tends to be LangGraph, a vendor SDK, or a hand-rolled loop on Temporal.",
      "The category is converging on durable execution, not on agent abstractions. Pick your durability substrate first — the agent library is the replaceable part.",
      "LangChain's rewrite churn is a procurement risk. If adopting, adopt LangGraph directly and treat LangChain integrations as optional glue.",
      "LlamaIndex is a retrieval library with agent features. Use it for parsing and indexing, not as the orchestration spine.",
      "DSPy is intellectually correct and operationally awkward: offline optimizers, Python-only, no gateway or observability story. Treat it as a prompt-compilation step for narrow well-evaluated tasks, not a runtime.",
      "MCP has won the tool layer and is now vendor-neutral under the Linux Foundation, which removes the main enterprise objection.",
      "MCP's security model is the weakest link. Tool poisoning — malicious instructions in tool descriptions and parameter metadata that users never see — is an OWASP-catalogued attack class, with cross-tool poisoning and rug-pull server updates as variants.",
      "Mandate a private MCP registry, pin server versions by digest, review tool metadata as code, run least-privilege, and gate write-capable tools behind human approval.",
      "The protocol layer is consolidating rather than fragmenting: MCP for tools, A2A for agent-to-agent, both under one foundation.",
      "Revision 2026-07-28 moved Tasks out of the experimental core and into the io.modelcontextprotocol/tasks extension, polled through tasks/get and tasks/update. Extensions is now where Tasks, MCP Apps and Enterprise Managed Authorization live, so capability negotiation happens per extension instead of per protocol version.",
      "The same revision set a twelve month minimum deprecation window, then used it: Roots, Sampling, Logging and the legacy HTTP+SSE transport are all deprecated. Migration planning now runs on that clock rather than on whenever the next release lands.",
      "Mcp-Method and Mcp-Name travel as HTTP headers from 2026-07-28, so a gateway, rate limiter or WAF can route and meter on headers instead of parsing a JSON body. This is the change that makes MCP traffic manageable with ordinary infrastructure.",
      "Authorization hardened in the same revision: authorization servers must return iss per RFC 9207 and clients must validate it, client credentials bind to their issuing server, and Dynamic Client Registration is formally deprecated in favour of CIMD with backward compatibility retained.",
      "Constrained decoding is solved; tool-calling reliability is not. Grammar-level JSON validity is a non-issue, but wrong tool selection and plausible-but-wrong arguments remain. Evaluate tool selection, not just schema conformance.",
    ],
  },
  {
    id: "caching",
    name: "Caching & Context Optimization",
    tagline: "Make the window cheaper and denser",
    question: "What does each token cost, and is it earning its place?",
    plain: {
      headline:
        "You pay by the word, every single time. Caching is refusing to pay twice for the words that never change.",
      body: "Most of what you send a model is the same on every request — the instructions, the company style guide, the tool descriptions. You are billed for all of it, again, on every call. Caching lets the provider keep the unchanging opening section warm so the repeat visits are far cheaper and faster. The catch is that it only works if that section is byte-for-byte identical, so a timestamp in the wrong place quietly costs you the whole discount.",
    },
    flow: [
      {
        id: "prefix",
        label: "Freeze the opening",
        plain:
          "Put everything that never changes at the very front: instructions, tool definitions, examples. Anything that varies — the user's actual question, today's date — goes last.",
      },
      {
        id: "hit",
        label: "Reuse it on the next call",
        plain:
          "The provider recognises the identical opening and skips re-reading it. Typical saving is 75-90% on those tokens, plus a real drop in the time to the first word appearing.",
      },
      {
        id: "trim",
        label: "Cut what is not earning its place",
        plain:
          "Whatever is left gets compressed: drop the retrieved passages nobody used, summarise old conversation turns, strip boilerplate. Every token you delete is a token you never pay for.",
      },
      {
        id: "measure",
        label: "Count it honestly",
        plain:
          "Attribute spend per feature and per customer, not per month in aggregate. Teams routinely discover one unloved endpoint is half the bill.",
      },
    ],
    categories: [
      { id: "provider-caching", name: "Provider caching", blurb: "Prefix caching offered by the model vendors." },
      { id: "kv-caching", name: "Self-hosted KV cache", blurb: "Prefix and KV reuse in your own serving layer." },
      { id: "compression", name: "Compression & pruning", blurb: "Reducing tokens before they reach the model." },
      { id: "token-accounting", name: "Token accounting", blurb: "Counting and attributing spend accurately." },
      { id: "long-context", name: "Long-context evidence", blurb: "What actually happens as inputs grow." },
    ],
    formulas: [
      {
        id: "breakeven",
        label: "Cache break-even, in reads",
        tex: "n^{*} \\;=\\; \\frac{w - 1}{1 - r}",
        note: "w is the write multiplier on input price, r the read multiplier. Anthropic's 5-minute cache (w = 1.25, r = 0.1) breaks even at 0.28 reads; the 1-hour cache (w = 2.0) at 1.11. Both are below one read, so caching pays from the first reuse. OpenAI charges no write premium, so n* = 0.",
      },
      {
        id: "effective-cost",
        label: "Effective input cost at hit rate h",
        tex: "C_{\\text{eff}} \\;=\\; C_{\\text{base}}\\left[(1-h)\\,w + h\\,r\\right]",
        note: "At h = 0.9 with Anthropic's 5-minute cache: 0.1(1.25) + 0.9(0.1) = 0.215 — a 78.5% reduction on input spend. Hit rate, not model choice, is the largest single lever available to you.",
      },
      {
        id: "kv-cache",
        label: "KV cache footprint",
        tex: "M_{\\text{KV}} \\;=\\; 2 \\cdot L \\cdot n \\cdot h_{kv} \\cdot d_h \\cdot b \\ \\text{ bytes}",
        note: "Two tensors (K and V) per layer L, per token n. A 70B model with L = 80, h_kv = 8, d_h = 128, fp16 holds ~327 KB per token — 21 GB at 64K context, before weights. This is the number that decides your batch size, and the reason prefix reuse dominates self-hosted economics.",
      },
      {
        id: "attention",
        label: "Prefill vs decode cost",
        tex: "\\underbrace{\\mathcal{O}(n^2 d)}_{\\text{prefill}} \\qquad \\underbrace{\\mathcal{O}(n d)}_{\\text{per decoded token}}",
        note: "Prefill is quadratic in input length, decode is linear. Doubling the prompt quadruples time-to-first-token but leaves throughput roughly untouched — which is why long-context latency complaints are almost always a prefill problem that prefix caching fixes.",
      },
    ],
    notes: [
      "Caching is the largest single cost lever and it is mostly free. All three major providers discount cached input reads by roughly 90%.",
      "The discipline: put static content — system prompt, tool definitions, few-shot examples, retrieved corpus — first, and never mutate it. One changed token above a breakpoint invalidates everything below.",
      "Anthropic charges 1.25x input to write a 5-minute cache and 2.0x for 1-hour, putting break-even at roughly 0.28 and 1.11 reads. Gemini adds storage cost per token-hour. OpenAI has no write surcharge.",
      "Context editing and caching interact. Edits apply after cache lookup but before token counting, so clearing preserves the cached prefix but forces a new cache write. Tune trigger thresholds accordingly.",
      "Self-hosting inverts the trade. Prefix caching is on by default in vLLM and SGLang; the real work is cache-aware routing so a session lands on the node holding its KV.",
      "Sub-agent context isolation — spawning agents with private windows and returning only summaries — is a pattern, not a product, and is often more effective than a compression library.",
      "Effective context is materially shorter than the advertised window. Retrieve into a focused 50-200K window and place strongest evidence at head and tail.",
      "Cite Chroma's context rot work or NoLiMa rather than needle-in-a-haystack, which saturates.",
    ],
  },
  {
    id: "memory",
    name: "Memory & State",
    tagline: "Decide what survives the turn",
    question: "What should the system still know tomorrow?",
    categories: [
      { id: "memory-systems", name: "Memory systems", blurb: "Third-party stores for facts, sessions and entities." },
      { id: "native-memory", name: "Native platform state", blurb: "Memory and state primitives shipped by model vendors." },
    ],
    formulas: [
      {
        id: "bitemporal",
        label: "Bi-temporal fact",
        tex: "f \\;=\\; \\big(s,\\, p,\\, o,\\; [\\,t_{\\text{valid}},\\, t_{\\text{invalid}}\\,),\\; t_{\\text{ingest}}\\big)",
        note: "Two independent time axes: when the fact was true in the world, and when the system learned it. Drop the second and you cannot reconstruct what the agent believed at the moment it acted — which is exactly what an incident review asks for. This interval is Graphiti's actual differentiator over flat fact stores.",
      },
      {
        id: "recency",
        label: "Recency-weighted recall",
        tex: "\\mathrm{score}(m) \\;=\\; \\lambda\\,\\mathrm{sim}(q, m) \\;+\\; (1-\\lambda)\\,e^{-\\Delta t / \\tau}",
        note: "Almost every memory layer implements some version of this. The failure mode is structural: a stale fact with high similarity outranks a fresh correction, because exponential decay only discounts age — it never marks the old fact false. Temporal invalidation does.",
      },
      {
        id: "budget",
        label: "Memory selection is a knapsack",
        tex: "\\max \\sum_i v_i x_i \\quad \\text{s.t.} \\quad \\sum_i c_i x_i \\le B,\\;\\; x_i \\in \\{0,1\\}",
        note: "B is the token budget you allocate to memory, not the model's advertised window. Every memory system is solving this approximately and none of them will tell you what B is — set it yourself.",
      },
    ],
    notes: [
      "Native features have absorbed the easy half. If the requirement is 'remember this user's preferences', a third-party memory layer is now hard to justify.",
      "Third-party layers still earn their place on three axes: cross-provider portability, temporal fact invalidation, and queryable graph structure for multi-hop recall.",
      "Anthropic's memory tool stores nothing. Claude emits filesystem commands and you implement the backend, including path-traversal defenses, per-tenant isolation and retention policy. It is an interface, not a service.",
      "Letta and LLMLingua are still recommended in roundups despite stalling. Check commit recency before adopting anything in this category.",
      "Vendor benchmark claims here are self-published. Treat as directional.",
    ],
  },
  {
    id: "retrieval",
    name: "Retrieval",
    tagline: "Find what belongs in the window",
    question: "Where does the evidence come from, and is it the right evidence?",
    plain: {
      headline:
        "A model has no filing cabinet. Retrieval is the clerk who fetches the right folder before anyone asks the question.",
      body: "A language model only knows what is put in front of it. It cannot go and look something up. So before you ask it anything, something has to walk into your company's documents, find the handful of paragraphs that matter, and paste them into the question. That fetching job is retrieval. Get it wrong and the model answers confidently from nothing — which is what people mean when they say it made something up.",
    },
    flow: [
      {
        id: "ingest",
        label: "Read the documents",
        plain:
          "PDFs, wikis, tickets and spreadsheets get turned into clean text. It is the boring step that quietly decides everything after it — a table mangled here becomes a wrong answer later.",
      },
      {
        id: "chunk",
        label: "Cut into passages",
        plain:
          "Long documents are sliced into paragraph-sized pieces, because you want to hand the model the relevant page, not the entire policy manual.",
      },
      {
        id: "embed",
        label: "Turn meaning into numbers",
        plain:
          "Each passage becomes a long list of numbers that stands for what it is about. Passages on the same subject end up with similar numbers, even when they share no words at all.",
      },
      {
        id: "search",
        label: "Find the closest few",
        plain:
          "The question gets the same treatment, then the system looks for passages whose numbers sit nearest to it. Old-fashioned keyword matching usually runs alongside, because exact terms like part numbers still matter.",
      },
      {
        id: "rerank",
        label: "Put the best on top",
        plain:
          "A second, slower model re-reads the shortlist and reorders it properly. You fetch thirty candidates and keep five. This is where a surprising amount of the accuracy comes from.",
      },
    ],
    categories: [
      { id: "vector-db", name: "Vector databases", blurb: "Approximate nearest-neighbour storage and filtering." },
      { id: "hybrid-search", name: "Search & hybrid retrieval", blurb: "Lexical and dense retrieval fused." },
      { id: "embeddings-rerankers", name: "Embeddings & rerankers", blurb: "Turning text into vectors, then reordering results." },
      { id: "parsing-ingestion", name: "Parsing & ingestion", blurb: "Getting messy documents into clean chunks." },
      { id: "managed-retrieval", name: "Managed retrieval", blurb: "Retrieval as a hosted service." },
      { id: "graph-retrieval", name: "Graph retrieval", blurb: "Entity and relationship structure over a corpus." },
    ],
    formulas: [
      {
        id: "rrf",
        label: "Reciprocal rank fusion",
        tex: "\\mathrm{RRF}(d) \\;=\\; \\sum_{r \\in R} \\frac{1}{k + r(d)}, \\qquad k = 60",
        note: "How Elasticsearch and OpenSearch fuse BM25 with dense results. It uses ranks, not scores, so you never have to normalise incomparable similarity scales. k = 60 comes from Cormack et al. 2009 and damps top-rank dominance — a document ranked 1st lexically and 50th semantically still surfaces.",
      },
      {
        id: "maxsim",
        label: "Late interaction — MaxSim",
        tex: "S_{q,d} \\;=\\; \\sum_{i \\in |q|} \\max_{j \\in |d|} \\; E_{q_i} \\cdot E_{d_j}^{\\top}",
        note: "ColBERT scores every query token against its best-matching document token instead of collapsing both to one vector. Recall improves; the index stores a vector per token, so it runs one to two orders of magnitude larger. That storage bill is the whole trade.",
      },
      {
        id: "hnsw-ram",
        label: "HNSW resident memory",
        tex: "M \\;\\approx\\; N\\,(4d + 8m)",
        note: "N vectors of d float32 dimensions plus roughly m graph links per node. Ten million 1536-dim vectors at m = 16 need ~63 GB of RAM. That figure — not query latency — is what pushes teams to quantization or to object-storage-native engines.",
      },
      {
        id: "efsearch",
        label: "Recall / latency knob",
        tex: "\\text{recall} \\nearrow \\text{ saturating},\\quad \\text{latency} \\sim \\mathcal{O}(\\mathrm{efSearch}\\cdot \\log N)",
        note: "Recall saturates in efSearch while latency keeps climbing roughly linearly. Measure the knee on your own data; the defaults shipped by every vector database are tuned for benchmark recall, not your p99.",
      },
    ],
    notes: [
      "What enterprises actually run is Elasticsearch/OpenSearch, pgvector, or a hyperscaler retrieval service. Most 'which vector DB' debates resolve to 'the one your database or cloud vendor already ships'.",
      "Postgres covers workloads into the tens of millions of vectors. Move to a dedicated engine past that, or when filter-heavy QPS demands it.",
      "Adding a cross-encoder rerank stage usually beats swapping vector databases. Open weights are competitive with commercial APIs, so lock-in here is low.",
      "Object-storage-native architectures have cut cost-per-vector by roughly an order of magnitude against in-memory HNSW.",
      "Licensing moved toward openness, unusually: Elasticsearch added AGPL-3.0 in 2024. But VectorChord, ParadeDB, Chunkr and Firecrawl are AGPL — check policy before embedding.",
      "Standalone vector DBs are consolidating. Voyage AI went to MongoDB, Quickwit to Datadog. Assume further absorption.",
      "Superseded: pgvecto.rs, replaced by VectorChord.",
    ],
  },
];

export const layerById = Object.fromEntries(
  layers.map((l) => [l.id, l]),
) as Record<Layer["id"], Layer>;
