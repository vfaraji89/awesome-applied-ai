import type { ToolArea } from "@/lib/types";

/** The eleven areas of the tool map, in the order work flows through an applied AI system:
 *  data in, models trained and served, products built on them, then checked and governed;
 *  last, the landscape: tools for seeing what everyone else builds with. */
export interface AreaDef { id: ToolArea; name: string; line: string }

export const areas: AreaDef[] = [
  { id: "data", name: "Data", line: "Labeling, pipelines, synthetic data and quality: what every model is built on." },
  { id: "models", name: "Models", line: "Model providers, open-weight families and the hubs that host them." },
  { id: "training", name: "Training", line: "Fine-tuning, distributed training, experiment tracking and AutoML." },
  { id: "inference", name: "Inference", line: "Serving engines, GPU clouds, edge runtimes, gateways and caching." },
  { id: "retrieval", name: "Retrieval", line: "Vector databases, search, embeddings, rerankers and document parsing." },
  { id: "agents", name: "Agents", line: "Frameworks, protocols, memory, computer use and sandboxes." },
  { id: "evaluation", name: "Evaluation", line: "Evals, tracing, observability and drift monitoring." },
  { id: "governance", name: "Governance", line: "Guardrails, AI security, privacy and the rules that apply." },
  { id: "modalities", name: "Modalities", line: "Speech, vision, document AI, and image and video generation." },
  { id: "builders", name: "Builders", line: "AI coding assistants, app builders, notebooks and AI IDEs." },
  { id: "landscape", name: "Landscape", line: "See what others build with, compare models and prices, and track the field." },
];

/** Category ids are free text in the content sheet (lowercase-with-hyphens); these give the
 *  ones that need more than title case a proper name. */
const CAT_NAMES: Record<string, string> = {
  "vector-db": "Vector databases", "embeddings-rerankers": "Embeddings and rerankers", "parsing-ingestion": "Parsing and ingestion",
  "managed-retrieval": "Managed retrieval", "graph-retrieval": "Graph retrieval", "hybrid-search": "Hybrid search",
  "memory-systems": "Memory systems", "native-memory": "Built-in memory", "provider-caching": "Provider caching", "kv-caching": "KV caching",
  "token-accounting": "Token accounting", "long-context": "Long context", "prompt-optimization": "Prompt optimization",
  "structured-output": "Structured output", "eval-frameworks": "Eval frameworks", "governance-tooling": "Governance tooling",
  "llm-apis": "LLM APIs", "ai-ide": "AI IDEs", "ai-ides": "AI IDEs", "gpu-clouds": "GPU clouds", "ai-security": "AI security",
  "automl": "AutoML", "rag-engines": "RAG engines", "dl-frameworks": "Deep learning frameworks", "image-video-gen": "Image and video generation", "agent-ui": "Agent UI kits", "ml-platforms": "ML platforms", "model-apis": "Model APIs", "open-weights": "Open-weight models", "browser-use": "Browser use", "web-search": "Web search for agents", "red-teaming": "Red teaming", "stack-detection": "Stack detection", "model-benchmarks": "Model benchmarks", "tool-directories": "Tool directories", "research-tracking": "Research tracking", "mlops": "MLOps", "ocr": "OCR", "tts": "Text to speech", "stt": "Speech to text", "asr": "Speech to text",
};
export const catName = (id: string) =>
  CAT_NAMES[id] ?? id.split("-").map((w, i) => (i ? w : w[0].toUpperCase() + w.slice(1))).join(" ").replace(/\b(ai|llm|llms|gpu|ml|api|apis|ocr|etl|sdk|ide)\b/gi, (m) => m.toUpperCase().replace("LLMS", "LLMs").replace("APIS", "APIs"));
