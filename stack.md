# Context Engineering Stack

Tools for deciding what goes into an LLM's context window, what persists across turns, and how to verify any of it works. Scoped to what an enterprise architect would actually evaluate. Last verified July 2026.

Deprecated and stalled projects are listed where they still appear in popular roundups, marked as such.

---

## 1. Retrieval

### Vector databases

| Tool | What it does | License | Link |
|---|---|---|---|
| pgvector | Postgres extension: HNSW/IVFFlat vector indexes in your existing DB | PostgreSQL | https://github.com/pgvector/pgvector |
| pgvectorscale | StreamingDiskANN index layered on pgvector | PostgreSQL | https://github.com/timescale/pgvectorscale |
| VectorChord | Postgres extension, disk-friendly IVF/RaBitQ; successor to pgvecto.rs | AGPL-3.0 + commercial | https://vectorchord.ai |
| Qdrant | Rust vector DB; payload filtering, quantization, on-disk HNSW | Apache-2.0 + cloud | https://qdrant.tech |
| Weaviate | Native BM25+dense hybrid, multi-tenancy, module system | BSD-3 + cloud | https://weaviate.io |
| Milvus / Zilliz | Distributed, billion-scale; LF AI & Data project | Apache-2.0 + cloud | https://milvus.io |
| Chroma | Embedded/single-node store, Rust core | Apache-2.0 + cloud | https://trychroma.com |
| LanceDB | Serverless vector DB on Lance columnar format, reads from object storage | Apache-2.0 + cloud | https://lancedb.com |
| Turbopuffer | Object-storage-native search; SPFresh index, BM25, sparse vectors | Commercial | https://turbopuffer.com |
| Pinecone | Serverless managed vector DB; hybrid search, namespaces | Commercial | https://pinecone.io |
| Vespa | Search + ranking engine with tensor compute and ML ranking phases | Apache-2.0 + cloud | https://vespa.ai |
| MongoDB Atlas Vector Search | Vector index inside MongoDB; native embedding/rerank API | Commercial / SSPL core | https://mongodb.com/products/platform/atlas-vector-search |
| FAISS | ANN index library, not a database; baseline for offline search | MIT | https://github.com/facebookresearch/faiss |

### Search and hybrid retrieval

| Tool | What it does | License | Link |
|---|---|---|---|
| Elasticsearch | BM25 + dense/sparse (ELSER), RRF hybrid, retrievers API | AGPL-3.0 / ELv2 / SSPL | https://elastic.co |
| OpenSearch | Apache-2.0 fork; k-NN, RRF hybrid, neural sparse | Apache-2.0 (Linux Foundation) | https://opensearch.org |
| ParadeDB | Postgres extension adding Tantivy-backed BM25 for in-DB hybrid | AGPL-3.0 + commercial | https://paradedb.com |
| Typesense | Typo-tolerant keyword search with vector fields | GPL-3.0 + cloud | https://typesense.org |
| Meilisearch | Lightweight full-text + hybrid search for in-app search | MIT + cloud | https://meilisearch.com |
| Tantivy | Rust full-text search library; embedded in many of the above | MIT | https://github.com/quickwit-oss/tantivy |

### Embeddings and rerankers

| Tool | What it does | License | Link |
|---|---|---|---|
| Qwen3-Embedding / Reranker | Open-weight models topping MTEB in 2026 | Apache-2.0 | https://github.com/QwenLM/Qwen3-Embedding |
| BGE (BAAI) | Open-weight embeddings; bge-reranker-v2-m3 is the common self-host default | MIT / Apache-2.0 | https://github.com/FlagOpen/FlagEmbedding |
| Cohere Embed v4 / Rerank 4 | Multimodal embeddings, Matryoshka dims; cross-encoder reranking API | Commercial | https://cohere.com/rerank |
| Voyage AI | Domain-tuned embeddings and rerankers (legal, code, finance); MongoDB-owned | Commercial | https://voyageai.com |
| Jina AI | Open-weight embeddings and multimodal rerankers scoring page images | Mixed OSS + API | https://jina.ai |
| ZeroEntropy | zerank reranker models, top of several 2026 leaderboards | OSS weights + API | https://zeroentropy.dev |
| Mixedbread | Open-weight embedding and reranker models plus hosted API | Apache-2.0 + API | https://mixedbread.com |
| ColBERT / PLAID | Late-interaction retrieval, token-level MaxSim; higher index cost | Apache-2.0 | https://github.com/stanford-futuredata/ColBERT |
| FlashRank | Small CPU-only reranker for latency-constrained pipelines | Apache-2.0 | https://github.com/PrithivirajDamodaran/FlashRank |

### Parsing, chunking, ingestion

| Tool | What it does | License | Link |
|---|---|---|---|
| Docling | IBM Research layout/table pipeline; local PDF-to-Markdown, no per-page cost | MIT | https://github.com/docling-project/docling |
| Unstructured | 30+ formats to normalized elements; connectors, VPC deployment | Apache-2.0 core + managed | https://unstructured.io |
| LlamaParse | VLM-based PDF parsing to Markdown; best-in-class on messy documents | Commercial | https://cloud.llamaindex.ai |
| Reducto | Agentic OCR-correction parsing; on-prem, SOC 2 Type II, HIPAA | Commercial | https://reducto.ai |
| Marker | PDF/EPUB to Markdown, GPU-accelerated, batch-oriented | GPL-3.0 + commercial | https://github.com/datalab-to/marker |
| Chunkr | Parsing + semantic chunking API, self-hostable | AGPL-3.0 + managed | https://chunkr.ai |
| Chonkie | Chunking library: token, semantic, recursive, late chunking | MIT | https://github.com/chonkie-inc/chonkie |
| Firecrawl | Crawls sites to clean Markdown/JSON; handles JS rendering | AGPL-3.0 core + managed | https://firecrawl.dev |

### Managed retrieval

| Tool | What it does | License | Link |
|---|---|---|---|
| Azure AI Search | Hybrid BM25+vector+semantic reranker with integrated vectorization | Commercial | https://azure.microsoft.com/products/ai-services/ai-search |
| Vertex AI Search | Managed retrieval and grounding with connectors and ranking API | Commercial | https://cloud.google.com/enterprise-search |
| Bedrock Knowledge Bases | Managed ingestion + retrieval over OpenSearch/Aurora/Neptune | Commercial | https://aws.amazon.com/bedrock/knowledge-bases |
| Ragie | Managed ingestion + retrieval API with connectors and citations | Commercial | https://ragie.ai |
| Vectara | Managed RAG with HHEM hallucination scoring; enterprise-only since 2026 | Commercial | https://vectara.com |

### Graph retrieval

| Tool | What it does | License | Link |
|---|---|---|---|
| Microsoft GraphRAG | Entity extraction, community detection, hierarchical summaries | MIT | https://github.com/microsoft/graphrag |
| LightRAG | Flat dual-level graph index; far cheaper indexing than GraphRAG | MIT | https://github.com/HKUDS/LightRAG |
| Graphiti | Temporal knowledge graph with edge validity intervals; hybrid graph+vector | Apache-2.0 | https://github.com/getzep/graphiti |
| neo4j-graphrag-python | Official Neo4j retrievers and KG construction pipeline | Apache-2.0 | https://github.com/neo4j/neo4j-graphrag-python |
| Cognee | Pipeline turning documents into a queryable memory graph | Apache-2.0 | https://github.com/topoteretes/cognee |

**Notes**

- What enterprises actually run is Elasticsearch/OpenSearch, pgvector, or a hyperscaler retrieval service. Most "which vector DB" debates resolve to "the one your database or cloud vendor already ships."
- Postgres covers workloads into the tens of millions of vectors. Move to a dedicated engine past that, or when filter-heavy QPS demands it.
- Adding a cross-encoder rerank stage usually beats swapping vector databases. Open weights are competitive with commercial APIs, so lock-in here is low.
- Object-storage-native architectures (Turbopuffer, LanceDB, Vespa) have cut cost-per-vector by roughly an order of magnitude against in-memory HNSW.
- Licensing moved toward openness, unusually: Elasticsearch added AGPL-3.0 in 2024. But VectorChord, ParadeDB, Chunkr and Firecrawl are AGPL — check policy before embedding.
- Standalone vector DBs are consolidating. Voyage AI went to MongoDB, Quickwit to Datadog. Assume further absorption.
- Superseded: pgvecto.rs (use VectorChord). Verify RAGatouille's maintenance before adopting.

---

## 2. Memory and state

### Third-party memory systems

| Tool | What it does | License | Status | Link |
|---|---|---|---|---|
| Mem0 | Extracts facts into vector+graph+KV store, scoped user/session/agent | Apache-2.0 + hosted | Active | https://github.com/mem0ai/mem0 |
| Graphiti | Bi-temporal graph; edges carry valid-from/invalid-at so facts expire | Apache-2.0 | Active | https://github.com/getzep/graphiti |
| Zep | Async summarization and entity extraction over Graphiti | Apache-2.0 + cloud | Active | https://github.com/getzep/zep |
| Cognee | ECL pipeline building an ontology-typed graph plus vector index | Apache-2.0 | Active | https://github.com/topoteretes/cognee |
| MemOS | OS-style abstraction over plaintext, activation (KV) and parametric memory | Apache-2.0 | Active | https://github.com/MemTensor/MemOS |
| Hindsight | Retain/recall/reflect over memory banks; fact extraction, MCP server | MIT | Active | https://github.com/vectorize-io/hindsight |
| Supermemory | Memory API and RAG over user context; router SDK, MCP | MIT client | Active | https://github.com/supermemoryai/supermemory |
| Letta (ex-MemGPT) | LLM-as-OS paging between main context, recall and archival stores | Apache-2.0 + cloud | Slowing — dev moved to sibling repos | https://github.com/letta-ai/letta |
| LangMem | Extracts and updates memories into a LangGraph store | MIT | Slowing — dependency bumps only | https://github.com/langchain-ai/langmem |

### Native platform features

| Feature | What it does | Link |
|---|---|---|
| Anthropic memory tool | Claude issues CRUD against a `/memories` directory; you own the storage backend | https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool |
| Anthropic context editing | Server-side clearing of stale tool results and thinking blocks before token counting | https://platform.claude.com/docs/en/build-with-claude/context-editing |
| OpenAI Responses API state | Server-stored response items chained via `previous_response_id`; 30-day retention | https://developers.openai.com/api/docs/guides/conversation-state |
| Gemini context caching | Explicit cached-content handles or implicit auto-cache on repeated prefixes | https://ai.google.dev/gemini-api/docs/caching |

**Notes**

- Native features have absorbed the easy half. If the requirement is "remember this user's preferences," a third-party memory layer is now hard to justify.
- Third-party layers still earn their place on three axes: cross-provider portability, temporal fact invalidation (Graphiti's valid-from/invalid-at), and queryable graph structure for multi-hop recall.
- Anthropic's memory tool stores nothing. Claude emits filesystem commands and you implement the backend, including path-traversal defenses, per-tenant isolation and retention policy. It is an interface, not a service.
- Letta and LLMLingua are still recommended in roundups despite stalling. Check commit recency before adopting anything in this category.
- Vendor benchmark claims here (LongMemEval and similar) are self-published. Treat as directional.

---

## 3. Caching and context optimization

| Tool | What it does | License | Link |
|---|---|---|---|
| Anthropic prompt caching | Up to 4 `cache_control` breakpoints; 5-min or 1-hr TTL, refreshed on read | Commercial | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| OpenAI automatic caching | Zero-config prefix cache, 1,024-token minimum, no write surcharge | Commercial | https://developers.openai.com/api/docs/guides/prompt-caching |
| Gemini explicit caching | Declared cache object, 60-min default TTL, ~32,768-token minimum | Commercial | https://ai.google.dev/gemini-api/docs/caching |
| vLLM prefix caching | Block-level content-hashed KV reuse; on by default in V1 | Apache-2.0 | https://github.com/vllm-project/vllm |
| SGLang RadixAttention | Radix tree over token sequences, longest-prefix KV match; on by default | Apache-2.0 | https://github.com/sgl-project/sglang |
| LMCache | Cross-instance KV cache sharing and offload to CPU/NVMe | Apache-2.0 | https://github.com/LMCache/LMCache |
| LLMLingua | Token-classification prompt compressor, 2-5x | MIT — **stalled**, last release Apr 2024 | https://github.com/microsoft/LLMLingua |
| tiktoken | OpenAI BPE tokenizer; exact counts for OpenAI models only | MIT | https://github.com/openai/tiktoken |
| Anthropic count_tokens | Free endpoint, billing-accurate, includes system prompt and tool definitions | Commercial (free) | https://platform.claude.com/docs/en/build-with-claude/token-counting |
| LiteLLM | Gateway normalizing token accounting and cache headers across providers | MIT | https://github.com/BerriAI/litellm |

**Economics**

All three major providers discount cached input reads by roughly 90%. Anthropic charges 1.25x input to write a 5-minute cache and 2.0x for 1-hour, putting break-even at about 0.28 and 1.11 reads respectively. Gemini explicit caching adds storage cost per token-hour. OpenAI has no write surcharge.

**Notes**

- Caching is the largest single cost lever and it is mostly free. The discipline: put static content — system prompt, tool definitions, few-shot examples, retrieved corpus — first, and never mutate it. One changed token above a breakpoint invalidates everything below.
- Context editing and caching interact. Edits apply after cache lookup but before token counting, so clearing preserves the cached prefix but forces a new cache write. Tune trigger thresholds so you are not paying write multipliers every few turns.
- Self-hosting inverts the trade. Prefix caching is on by default in vLLM and SGLang; the real work is cache-aware routing so a session lands on the node holding its KV.
- Sub-agent context isolation — spawning agents with private windows and returning only summaries — is a pattern, not a product, and is often more effective than a compression library.

### Long-context evidence

| Source | Finding | Link |
|---|---|---|
| Chroma, Context Rot | 18 models degrade non-uniformly as input grows; includes replication toolkit | https://research.trychroma.com/context-rot |
| NoLiMa | Needle-in-haystack without lexical overlap; scores collapse where standard NIAH saturates | https://arxiv.org/abs/2502.05167 |
| Liu et al., Lost in the Middle | U-shaped positional accuracy, >30% drop for mid-context evidence | https://arxiv.org/abs/2307.03172 |
| LongFuncEval | Long-context degradation specific to tool and function calling | https://arxiv.org/abs/2505.10570 |

Effective context is materially shorter than the advertised window. Retrieve into a focused 50-200K window, place strongest evidence at head and tail, and cite Chroma or NoLiMa rather than NIAH, which saturates.

---

## 4. Orchestration and protocols

### Frameworks

| Tool | What it does | License | Maturity | Link |
|---|---|---|---|---|
| LangGraph | Graph runtime: checkpointed state machines, durable execution, human-in-the-loop | MIT | Production-common | https://github.com/langchain-ai/langgraph |
| Temporal | General durable execution; agents as replayable workflows | MIT + cloud | Production-common | https://temporal.io |
| Microsoft Agent Framework | AutoGen and Semantic Kernel merged; .NET/Python agents plus workflow graphs | MIT | Production-viable | https://github.com/microsoft/agent-framework |
| OpenAI Agents SDK | Minimal agent loop: handoffs, guardrails, tracing, sessions | MIT | Production-viable | https://github.com/openai/openai-agents-python |
| Claude Agent SDK | Harness behind Claude Code: subagents, hooks, compaction, MCP-native | Anthropic | Production-viable | https://github.com/anthropics/claude-agent-sdk-python |
| Google ADK | Agent SDK with evaluation and a deployment path into Vertex Agent Engine | Apache-2.0 | Production-viable | https://github.com/google/adk-python |
| Pydantic AI | Type-safe agent layer; schema validation and DI as first-class | MIT | Production-viable | https://github.com/pydantic/pydantic-ai |
| Mastra | TypeScript-native agents, workflows, RAG, evals | Apache-2.0 | Production-viable (TS) | https://github.com/mastra-ai/mastra |
| LangChain 1.x | Integration layer, now a thin façade over the LangGraph runtime | MIT | Production-viable | https://github.com/langchain-ai/langchain |
| LlamaIndex | Ingestion, parsing, indexing, retrieval; agent features added later | MIT | Production-viable (RAG) | https://github.com/run-llama/llama_index |
| CrewAI | Role-based multi-agent crews with LLM-driven task routing | MIT + commercial | Fragile in production | https://github.com/crewAIInc/crewAI |
| DBOS | Durable execution using Postgres as workflow source of truth | MIT | Early | https://github.com/dbos-inc/dbos-transact-py |
| AutoGen | Research multi-agent framework — superseded by Agent Framework | MIT | Deprecated | https://github.com/microsoft/autogen |
| Semantic Kernel | .NET agent/plugin SDK — folded into Agent Framework | MIT | Deprecated | https://github.com/microsoft/semantic-kernel |

### Prompt optimization

| Tool | What it does | License | Maturity | Link |
|---|---|---|---|---|
| DSPy | Declarative signatures and modules; compiles prompts against a metric | MIT | Research-strong, production-niche | https://github.com/stanfordnlp/dspy |
| GEPA | Reflective evolutionary prompt optimization; ships inside DSPy | MIT | Early | https://github.com/gepa-ai/gepa |
| Ax | TypeScript equivalent of DSPy's signature-driven programs | Apache-2.0 | Early | https://github.com/ax-llm/ax |
| TextGrad | Backpropagates natural-language gradients through LLM pipelines | MIT | Research-only | https://github.com/zou-group/textgrad |

### Protocols and conventions

| Spec | What it does | Governance | Link |
|---|---|---|---|
| MCP | Client/server protocol for tools, resources, prompts | Linux Foundation AAIF (donated Dec 2025) | https://modelcontextprotocol.io |
| A2A | Peer agent discovery via Agent Cards, and task delegation | Linux Foundation, 150+ orgs | https://a2a-protocol.org |
| AGNTCY | Directory, identity, messaging, observability for agent meshes | Cisco → Linux Foundation | https://agntcy.org |
| AGENTS.md | Tells coding agents how to build, test and style a repo | AAIF; 60k+ repos | https://agents.md |
| CLAUDE.md | Anthropic equivalent; hierarchical, imports, per-directory scoping | Anthropic | https://docs.claude.com/en/docs/claude-code/memory |
| llms.txt | Site-level markdown index for LLM consumers | Proposal, no governing body | https://llmstxt.org |

### Structured output

| Tool | What it does | License | Link |
|---|---|---|---|
| XGrammar | Pushdown-automaton constrained decoding; default in vLLM, SGLang, TRT-LLM | Apache-2.0 | https://github.com/mlc-ai/xgrammar |
| llguidance | Low-latency grammar engine, strongest measured JSON validity | MIT | https://github.com/guidance-ai/llguidance |
| Outlines | FSM-based structured generation; largely displaced by XGrammar | Apache-2.0 | https://github.com/dottxt-ai/outlines |
| Instructor | Pydantic validation plus retry loop around any provider | MIT | https://github.com/567-labs/instructor |

**Notes**

- Stars do not equal standardization. CrewAI and LangChain dominate GitHub metrics; production tends to be LangGraph, a vendor SDK, or a hand-rolled loop on Temporal. CrewAI's LLM-driven routing makes cost and latency non-deterministic and failures hard to reproduce.
- The category is converging on durable execution, not on agent abstractions. Pick your durability substrate first — the agent library is the replaceable part.
- LangChain's rewrite churn is a procurement risk. If adopting, adopt LangGraph directly and treat LangChain integrations as optional glue.
- LlamaIndex is a retrieval library with agent features. Use it for parsing and indexing, not as the orchestration spine.
- DSPy is intellectually correct and operationally awkward: offline optimizers, Python-only, no gateway or observability story. Treat as a prompt-compilation step for narrow well-evaluated tasks, not a runtime.
- MCP has won the tool layer and is now vendor-neutral under the Linux Foundation, which removes the main enterprise objection.
- MCP's security model is the weakest link. Tool poisoning — malicious instructions in tool descriptions and parameter metadata that users never see — is an OWASP-catalogued attack class, with cross-tool poisoning and rug-pull server updates as variants. Mandate a private registry, pin server versions by digest, review tool metadata as code, run least-privilege, and gate write-capable tools behind human approval.
- The protocol layer is consolidating rather than fragmenting: MCP for tools, A2A for agent-to-agent, both under one foundation.
- Constrained decoding is solved; tool-calling reliability is not. Grammar-level JSON validity is a non-issue, but wrong tool selection and plausible-but-wrong arguments remain. Evaluate tool selection, not just schema conformance.

---

## 5. Evaluation and observability

### Tracing

| Tool | What it does | Deployment | License | Link |
|---|---|---|---|---|
| Langfuse | Tracing, prompt management, evals, datasets; strongest self-host story | Both | MIT core + EE | https://langfuse.com |
| Arize Phoenix | OTel-native tracing and eval workflow; runs fully local | Both | Elastic-2.0 | https://phoenix.arize.com |
| Comet Opik | Tracing, eval, guardrail hooks; no EE gating | Both | Apache-2.0 | https://github.com/comet-ml/opik |
| Braintrust | Eval-first workflow, scoring, prompt playground; data plane in VPC | Both (hybrid) | Proprietary | https://braintrust.dev |
| LangSmith | Trace and debug LangChain/LangGraph agents, datasets, online evals | Both (self-host = Enterprise) | Proprietary | https://smith.langchain.com |
| W&B Weave | Trace and eval layer atop W&B | Both | Apache-2.0 SDK | https://wandb.ai/site/weave |
| MLflow Tracing | GenAI tracing inside an existing MLflow registry estate | Both | Apache-2.0 | https://mlflow.org |
| HoneyHive | Tracing, eval, dataset curation; VPC deployment | Both | Proprietary | https://honeyhive.ai |
| Datadog LLM Observability | LLM spans inside existing APM; correlates with infra telemetry | SaaS | Proprietary | https://datadoghq.com |
| Helicone | Proxy-based logging and caching — **maintenance mode** since Mar 2026 | Both | Apache-2.0 | https://helicone.ai |

OpenTelemetry GenAI semantic conventions live at https://github.com/open-telemetry/semantic-conventions-genai. Every document is still marked Development as of July 2026, despite vendor blogs claiming stability. Emit OTel anyway — attribute churn is cheaper than a proprietary schema migration. Put a translation shim between your app and the SDK.

### Evaluation

| Tool | What it does | License | Link |
|---|---|---|---|
| RAGAS | RAG-component metrics: faithfulness, context precision/recall, answer relevancy | Apache-2.0 | https://github.com/explodinggradients/ragas |
| DeepEval | Pytest-style LLM unit tests; RAG, conversational and agent metrics | Apache-2.0 | https://deepeval.com |
| promptfoo | Declarative YAML eval matrices plus automated red-teaming | MIT | https://promptfoo.dev |
| Inspect AI | UK AI Security Institute harness; solvers and scorers, strong for safety | MIT | https://inspect.aisi.org.uk |
| OpenAI Evals | Registry-based eval templates, OpenAI-centric | MIT | https://github.com/openai/evals |

RAG-component evals score a single retrieve-then-generate turn. Agent evals must score the trajectory — plan decomposition, tool selection, argument correctness, retry behavior, termination — because a correct final answer can hide broken tool calls. DeepEval, Inspect AI and LangSmith have trajectory primitives; RAGAS does not.

### LLM-as-judge

Position, verbosity and self-preference biases are all replicated at scale, and frontier judges fail a majority of bias probes. High inter-run consistency is routinely mistaken for accuracy — a judge can be reliably wrong.

Minimum viable calibration: a human-labelled gold set, agreement measured with Cohen's or Krippendorff's kappa rather than raw accuracy, and position-swap plus length-controlled runs. Report corrected pass-rates; naive judge estimates are statistically biased. Binary and rubric criteria beat 1-10 Likert scales. Never ship a judge without a kappa figure.

---

## 6. Guardrails and governance

| Tool | What it does | Deployment | License | Link |
|---|---|---|---|---|
| Microsoft Presidio | NER and regex PII detection, redaction, anonymisation | Self-host | MIT | https://microsoft.github.io/presidio |
| NeMo Guardrails | Colang dialog-flow rails, topic control; orchestrates other classifiers | Self-host | Apache-2.0 | https://github.com/NVIDIA/NeMo-Guardrails |
| Guardrails AI | Output validators and schema enforcement via a validator hub | Self-host | Apache-2.0 | https://guardrailsai.com |
| Llama Guard / Prompt Guard | Hazard-taxonomy classifier and fast injection pre-filter | Self-host | Meta community | https://llama.meta.com |
| LLM Guard | Scanner suite: PII, toxicity, injection heuristics | Self-host | MIT | https://llm-guard.com |
| Lakera Guard | Commercial injection and jailbreak detection API | SaaS | Proprietary | https://lakera.ai |
| Azure Prompt Shields | Managed moderation and injection filters | SaaS | Proprietary | https://azure.microsoft.com |

**Efficacy, stated plainly.** Prompt-injection classifiers are filters, not boundaries. Published 2025-2026 work shows character-injection and algorithmic evasion approaching total evasion against several commercial and open detectors, and over-length prompt-overflow inputs defeat detectors that catch the same payload in short context. Layered defenses cut naive attack success substantially, but adaptive attackers still exceed 85% success.

Put the real control at the architecture layer: least-privilege tool scopes, human approval on state-changing actions, no implicit trust in retrieved content. Deterministic components — Presidio redaction, schema validation, allow-lists — are the only parts that behave predictably. Anything sold as blocking prompt injection is theatre.

### Regulation

| Item | Status and dates |
|---|---|
| EU AI Act (Reg. 2024/1689) | In force 1 Aug 2024. Prohibitions and AI literacy live 2 Feb 2025. GPAI obligations live 2 Aug 2025 |
| Digital Omnibus on AI (Reg. (EU) 2026/1744) | First AI Act amendment. In force 27 Jul 2026 |
| GPAI enforcement powers | 2 Aug 2026 — explicitly not deferred |
| Art. 50 synthetic-content marking | Deferred to 2 Dec 2026 for systems placed on market before 2 Aug 2026 |
| NCII/CSAM generation prohibition | From 2 Dec 2026 |
| National regulatory sandboxes | Deferred to 2 Aug 2027 |
| High-risk, Annex III (hiring, credit, education, law enforcement) | Deferred from 2 Aug 2026 to 2 Dec 2027 |
| High-risk, Annex I (embedded in regulated products) | Deferred to 2 Aug 2028 |
| NIST AI RMF 1.0 + GenAI Profile | Voluntary. Cheapest credible starting point; maps onto ISO 42001 |
| ISO/IEC 42001:2023 | Certifiable today. The only auditable certificate in this space |

Governance tooling that produces compliance artifacts: Credo AI, Holistic AI, Trustible, IBM watsonx.governance, OneTrust.

**Notes**

- The Annex III deferral to Dec 2027 is a resequencing opportunity, not a cancellation.
- Start ISO 42001 now if you sell to enterprise or government. It takes 6-12 months and increasingly appears in due-diligence questionnaires. NIST AI RMF first is the standard on-ramp.
- Verify regulatory dates against primary sources before citing them internally. This table is a starting point, not legal advice.
