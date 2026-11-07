import type { LayerId } from "@/lib/types";

/** The applied AI roles, as they show up in hiring today. Tools are ids from tools.ts. */
export interface Role {
  id: string;
  name: string;
  oneLine: string;
  owns: string[];
  layers: LayerId[];
  tools: string[];
}

export const roles: Role[] = [
  {
    id: "ai-native-architect",
    name: "AI-Native Architect",
    oneLine: "Designs the whole system so AI is part of it from the start, not bolted on.",
    owns: ["The path from spec to production", "Context and token strategy", "Trade-offs between cost, latency and reliability"],
    layers: ["orchestration", "caching", "governance"],
    tools: ["claude-agent-sdk", "mcp", "langgraph", "langfuse", "anthropic-prompt-caching", "litellm"],
  },
  {
    id: "applied-ai-engineer",
    name: "Applied AI Engineer",
    oneLine: "Turns a business problem into a model-backed feature that ships.",
    owns: ["Framing the problem and finding the data", "Retrieval and prompts that hold up", "Evals built from real tasks"],
    layers: ["retrieval", "evaluation", "orchestration"],
    tools: ["pgvector", "docling", "cohere", "instructor", "ragas", "promptfoo"],
  },
  {
    id: "agentic-ai-engineer",
    name: "Agentic AI Engineer",
    oneLine: "Builds agent harnesses: the loop, the tools, the context and the memory.",
    owns: ["Execution loops and tool calling", "Multi-agent orchestration", "Long-running tasks that survive tool failures"],
    layers: ["orchestration", "memory", "evaluation"],
    tools: ["langgraph", "claude-agent-sdk", "openai-agents-sdk", "temporal", "mem0", "inspect-ai"],
  },
  {
    id: "ai-platform-engineer",
    name: "AI Platform Engineer",
    oneLine: "Runs the shared rails every AI team builds on.",
    owns: ["Model gateway and routing", "Serving and caching", "Tracing and cost attribution"],
    layers: ["caching", "evaluation", "governance"],
    tools: ["litellm", "vllm", "lmcache", "langfuse", "otel-genai", "helicone"],
  },
  {
    id: "ai-solutions-architect",
    name: "AI Solutions Architect",
    oneLine: "Fits AI into the systems and data a company already has.",
    owns: ["Integration with existing data and systems", "Build versus buy", "Governance and compliance sign-off"],
    layers: ["governance", "retrieval", "orchestration"],
    tools: ["azure-ai-search", "vertex-ai-search", "bedrock-kb", "presidio", "nist-ai-rmf", "eu-ai-act"],
  },
  {
    id: "rd-researcher",
    name: "R&D Researcher",
    oneLine: "Finds out what actually works, and publishes how.",
    owns: ["Benchmarks and ablations", "Prompt optimisation against a metric", "Reading the long-context evidence"],
    layers: ["evaluation", "caching", "orchestration"],
    tools: ["dspy", "gepa", "inspect-ai", "nolima", "lost-in-the-middle", "openai-evals"],
  },
];
