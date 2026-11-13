import type { Tool } from "@/lib/types";

/** Use cases: what you are trying to build, as opposed to the area a tool sits in. A tool's use cases
 *  come from its category, so a new row in the content sheet is filed without extra work; a category
 *  can serve several use cases. scripts check that every category maps to at least one. */
export interface UseCase { id: string; name: string; line: string }

export const useCases: UseCase[] = [
  { id: "assistants", name: "Assistants and chat", line: "Chat products and copilots: the model, the interface and what it remembers." },
  { id: "rag", name: "Search and Q&A over your data", line: "Answers grounded in your documents: parse, embed, retrieve and rerank." },
  { id: "agents", name: "Agents that take actions", line: "Agents that call tools, browse, use a computer and finish multi-step work." },
  { id: "coding", name: "Coding and developer tools", line: "Coding agents and what feeds them: context, repos, docs and sandboxes." },
  { id: "voice", name: "Voice and video agents", line: "Realtime speech, transcription and live avatars." },
  { id: "documents", name: "Documents and vision", line: "Reading documents, forms and images: OCR, parsing and vision models." },
  { id: "media", name: "Image and video generation", line: "Generating and editing images and video." },
  { id: "data", name: "Data and analytics", line: "The data under the AI: pipelines, catalogs, quality, labels and features." },
  { id: "training", name: "Training your own model", line: "Fine-tuning, training at scale, experiments and the compute for it." },
  { id: "production", name: "Running in production", line: "Serving, gateways, caching, cost, tracing and evals once real users arrive." },
  { id: "trust", name: "Safety and compliance", line: "Guardrails, security testing, privacy and the rules that apply." },
  { id: "field", name: "Following the field", line: "Benchmarks, research trackers, directories and the foundations behind open standards." },
];

const BY_CATEGORY: Record<string, string[]> = {
  "agent-ui": ["assistants", "agents"], "app-builders": ["assistants", "coding"], "model-apis": ["assistants", "agents"],
  "open-weights": ["assistants", "training"], "memory-systems": ["assistants", "agents"], "native-memory": ["assistants", "agents"],
  "agent-platforms": ["assistants", "agents"], "agent-builders": ["agents", "assistants"],

  "vector-db": ["rag"], "hybrid-search": ["rag"], "embeddings-rerankers": ["rag"], "parsing-ingestion": ["rag", "documents"],
  "managed-retrieval": ["rag"], "graph-retrieval": ["rag"], "rag-engines": ["rag"], "web-search": ["rag", "agents"], "long-context": ["rag", "production"],

  "frameworks": ["agents"], "protocols": ["agents"], "tool-integration": ["agents"], "sandboxes": ["agents", "coding"],
  "browser-use": ["agents"], "computer-use": ["agents"], "ui-grounding": ["agents"], "reliability": ["agents", "production"],
  "workflow-automation": ["agents"], "structured-output": ["agents"],

  "coding-assistants": ["coding"], "notebooks": ["coding", "data"], "context-management": ["coding", "production"],

  "realtime-voice": ["voice"], "speech": ["voice"], "avatars-video-agents": ["voice", "media"],
  "document-ai": ["documents"], "vision": ["documents"], "image-video-gen": ["media"],

  "data-pipelines": ["data"], "data-quality": ["data"], "data-versioning": ["data", "training"], "feature-stores": ["data"],
  "labeling": ["data", "training"], "annotation": ["data", "production"], "synthetic-data": ["data", "training"], "data-catalog": ["data", "trust"],

  "fine-tuning": ["training"], "distributed-training": ["training"], "dl-frameworks": ["training"], "automl": ["training"],
  "experiment-tracking": ["training"], "ml-platforms": ["training", "production"], "model-hubs": ["training", "field"], "rl-environments": ["training", "agents"],
  "gpu-clouds": ["training", "production"],

  "serving-engines": ["production"], "inference-platforms": ["production"], "gateways": ["production"], "kv-caching": ["production"],
  "provider-caching": ["production"], "compression": ["production"], "token-accounting": ["production", "coding"], "deployment": ["production"],
  "edge-runtimes": ["production"], "tracing": ["production"], "monitoring": ["production"], "eval-frameworks": ["production"],
  "prompt-optimization": ["production"], "benchmarks": ["production", "field"],

  "guardrails": ["trust"], "ai-security": ["trust"], "red-teaming": ["trust"], "privacy": ["trust"], "fairness": ["trust"],
  "governance-tooling": ["trust"], "regulation": ["trust"], "provenance": ["trust", "media"],

  "model-benchmarks": ["field"], "research-tracking": ["field"], "tool-directories": ["field"], "stack-detection": ["field"], "foundations": ["field"],
};

export const useCasesOf = (t: Tool): string[] => BY_CATEGORY[t.category] ?? [];
export const unmappedCategories = (tools: Tool[]) => [...new Set(tools.map((t) => t.category))].filter((c) => !BY_CATEGORY[c]);
