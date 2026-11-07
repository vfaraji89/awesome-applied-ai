import type { LayerId } from "@/lib/types";

/* The roles and skills framework.
   Skills are scored 0-4 by what someone can do, not by years:
   0 not needed · 1 aware · 2 working · 3 fluent · 4 expert.
   Sources: job postings and 2026 role guides (see SOURCES); levels are an editorial synthesis. */

export const LEVELS = ["Not needed", "Aware", "Working", "Fluent", "Expert"] as const;

export interface Skill { id: string; name: string; what: string }

export const skills: Skill[] = [
  { id: "software", name: "Software fundamentals", what: "Python or TypeScript, APIs, databases, cloud, CI/CD." },
  { id: "data", name: "Data and SQL", what: "Modelling, querying and cleaning the data the system runs on." },
  { id: "retrieval", name: "Retrieval and RAG", what: "Ingestion, chunking, embeddings, hybrid search, reranking." },
  { id: "agents", name: "Agents and tool use", what: "The loop, tool calling, MCP, multi-agent orchestration." },
  { id: "context", name: "Context and cost", what: "What goes in the window, caching, token budgets, latency." },
  { id: "evals", name: "Evals and observability", what: "Evals from real tasks, tracing, failure analysis." },
  { id: "security", name: "Security and governance", what: "Prompt injection, PII, policy, compliance, audit." },
  { id: "models", name: "Models and serving", what: "Model choice, fine-tuning, inference performance." },
  { id: "ai-dev", name: "AI-assisted development", what: "Building with coding agents and reviewing what they write." },
  { id: "product", name: "Product judgement", what: "Scoping, UX for AI, deciding what not to build." },
  { id: "customer", name: "Customers and adoption", what: "Discovery, stakeholders, training teams, measuring ROI." },
  { id: "architecture", name: "Architecture", what: "System design across the six layers, trade-offs, specs." },
];

export interface FRole {
  id: string;
  name: string;
  family: "Build" | "Deploy" | "Platform" | "Design" | "Research";
  oneLine: string;
  titles: string[];
  tasks: string[];
  levels: Record<string, number>;
  layers: LayerId[];
  stack: string[];
  growth: { level: string; scope: string }[];
}

const L = (a: number[]) => Object.fromEntries(skills.map((s, i) => [s.id, a[i]]));
//                 sw da re ag cx ev se mo ad pr cu ar

export const fRoles: FRole[] = [
  {
    id: "ai-native-developer", name: "AI-Native Developer", family: "Build",
    oneLine: "A product engineer who builds with coding agents as the main way of working, and owns a feature from idea to production.",
    titles: ["AI-Native Software Engineer", "AI-Native Product Engineer", "Product Engineer (AI)", "Founding Engineer"],
    tasks: ["Turn a vague goal into a shipped feature", "Drive changes with coding agents and custom skills", "Review AI-written code critically before it merges", "Add AI features to the product and measure them"],
    levels: L([3, 2, 2, 2, 2, 2, 1, 1, 4, 3, 1, 2]), layers: ["orchestration", "evaluation"],
    stack: ["Claude Code", "TypeScript", "Next.js", "Vercel AI SDK", "Python", "MCP"],
    growth: [{ level: "Junior", scope: "Ships tasks with agents, learns to review their output." }, { level: "Senior", scope: "Owns a product area end to end." }, { level: "Staff", scope: "Sets the team's agent workflow and quality bar." }],
  },
  {
    id: "applied-ai-engineer", name: "Applied AI Engineer", family: "Build",
    oneLine: "Ships and runs LLM-powered features in production, with evals deciding every release.",
    titles: ["Applied AI Engineer", "AI Engineer", "LLM Engineer", "Generative AI Engineer"],
    tasks: ["Frame the problem and find the data", "Build retrieval and prompts that hold up", "Write evals from real tasks and gate releases on them", "Control cost and latency in production"],
    levels: L([3, 3, 3, 3, 3, 4, 2, 2, 3, 2, 1, 2]), layers: ["retrieval", "evaluation", "orchestration"],
    stack: ["Python", "RAG", "Vector DB", "LangChain", "Langfuse", "SQL"],
    growth: [{ level: "Junior", scope: "Builds a RAG feature with a mentor's evals." }, { level: "Senior", scope: "Owns a feature, its evals and its costs." }, { level: "Staff", scope: "Sets eval and release standards across teams." }],
  },
  {
    id: "agentic-ai-engineer", name: "Agentic AI Engineer", family: "Build",
    oneLine: "Builds agent harnesses: the loop, the tools, the context and the memory, reliable enough to leave running.",
    titles: ["AI Agent Engineer", "Agentic AI Engineer", "AI Engineer (Agents)", "Agent Platform Engineer"],
    tasks: ["Design execution loops and tool interfaces", "Orchestrate multiple agents over MCP", "Make long-running tasks resumable and safe to fail", "Trace and analyse agent failures"],
    levels: L([3, 2, 2, 4, 3, 3, 2, 1, 3, 1, 1, 3]), layers: ["orchestration", "memory", "evaluation"],
    stack: ["Claude Agent SDK", "LangGraph", "Deep Agents", "Agno", "MCP", "Langfuse"],
    growth: [{ level: "Junior", scope: "Adds tools to an existing agent." }, { level: "Senior", scope: "Designs a harness that survives production." }, { level: "Staff", scope: "Owns the agent platform and its guardrails." }],
  },
  {
    id: "forward-deployed-engineer", name: "Forward Deployed Engineer", family: "Deploy",
    oneLine: "Embeds with a customer's team and infrastructure to take AI from discovery to production, then proves the impact.",
    titles: ["Forward Deployed Engineer (FDE)", "Forward Deployed AI Engineer", "Deployment Strategist", "AI Solutions Engineer"],
    tasks: ["Run discovery inside the customer's team", "Prototype fast, then harden for production", "Integrate with the customer's data and systems", "Train teams, drive adoption, measure ROI"],
    levels: L([3, 3, 3, 3, 2, 3, 2, 1, 3, 3, 4, 2]), layers: ["retrieval", "orchestration", "governance"],
    stack: ["Python", "SQL", "RAG", "LangGraph", "Azure AI Foundry", "Vertex AI"],
    growth: [{ level: "Junior", scope: "Delivers a scoped integration on site." }, { level: "Senior", scope: "Leads a deployment from prototype to impact." }, { level: "Staff", scope: "Turns field patterns into the product." }],
  },
  {
    id: "ai-solutions-architect", name: "AI Solutions Architect", family: "Design",
    oneLine: "Fits AI into the systems, data and rules a company already has, and gets it signed off.",
    titles: ["AI Solutions Architect", "Generative AI Architect", "AI Technical Consultant", "Customer Engineer (AI)"],
    tasks: ["Map the customer's systems and data", "Decide build versus buy", "Design for governance and compliance", "Write the reference architecture"],
    levels: L([2, 3, 3, 2, 2, 2, 3, 2, 2, 2, 4, 4]), layers: ["governance", "retrieval", "orchestration"],
    stack: ["Azure AI Foundry", "Vertex AI", "Copilot Studio", "Google Cloud", "BigQuery", "Power Automate"],
    growth: [{ level: "Mid", scope: "Designs single-team solutions." }, { level: "Senior", scope: "Owns enterprise-wide reference architectures." }, { level: "Principal", scope: "Shapes the company's AI platform strategy." }],
  },
  {
    id: "ai-native-architect", name: "AI-Native Architect", family: "Design",
    oneLine: "Designs the whole system around the model from day one: spec, context, cost and the evidence it works.",
    titles: ["AI-Native Architect", "AI Architect", "Principal AI Engineer", "Head of Applied AI"],
    tasks: ["Write the spec and the architecture", "Set the context and token strategy", "Trade off cost, latency and reliability", "Define how the system is evaluated and governed"],
    levels: L([3, 3, 3, 4, 4, 4, 3, 2, 3, 3, 3, 4]), layers: ["orchestration", "caching", "governance"],
    stack: ["Claude Agent SDK", "MCP", "LangGraph", "Langfuse", "DataHub", "Claude Code"],
    growth: [{ level: "Senior", scope: "Architects one product's AI system." }, { level: "Staff", scope: "Sets patterns across products." }, { level: "Principal", scope: "Owns the organisation's AI architecture." }],
  },
  {
    id: "ai-platform-engineer", name: "AI Platform Engineer", family: "Platform",
    oneLine: "Runs the shared rails every AI team builds on: gateways, serving, caching, tracing, cost.",
    titles: ["AI Platform Engineer", "ML Engineer", "LLMOps Engineer", "AI Infrastructure Engineer"],
    tasks: ["Run the model gateway and routing", "Serve and cache models efficiently", "Attribute cost to teams and features", "Keep tracing and evals running for everyone"],
    levels: L([4, 2, 2, 2, 3, 3, 3, 4, 2, 1, 1, 3]), layers: ["caching", "evaluation", "governance"],
    stack: ["Python", "Google Cloud", "Azure DevOps", "Langfuse", "Hugging Face", "MCP"],
    growth: [{ level: "Junior", scope: "Operates the gateway and dashboards." }, { level: "Senior", scope: "Owns serving, caching and cost." }, { level: "Staff", scope: "Designs the multi-team AI platform." }],
  },
  {
    id: "rd-researcher", name: "Applied AI Researcher", family: "Research",
    oneLine: "Finds out what actually works on real tasks, measures it, and publishes how.",
    titles: ["Research Engineer", "Applied Scientist", "R&D Researcher", "AI Research Scientist"],
    tasks: ["Design benchmarks and ablations", "Optimise prompts and pipelines against a metric", "Fine-tune or adapt models when it pays", "Publish and turn results into practice"],
    levels: L([3, 3, 3, 3, 3, 4, 2, 4, 2, 1, 1, 2]), layers: ["evaluation", "caching", "orchestration"],
    stack: ["Python", "Hugging Face", "Langfuse", "SQL", "Perplexity AI Search", "Claude Code"],
    growth: [{ level: "Junior", scope: "Runs experiments someone else designed." }, { level: "Senior", scope: "Leads a research line to a result." }, { level: "Principal", scope: "Sets the research agenda." }],
  },
];

/* Education and credentials that show up in hiring. Exam codes and tiers change often: check the provider. */
export const education = [
  { kind: "Degree", items: ["Computer science or software engineering", "Data science, statistics or mathematics", "Economics or other quantitative fields, for data and decision roles"] },
  { kind: "Anthropic", items: ["Claude Certified Architect, Foundations (agentic architecture, MCP, Claude Code)", "Anthropic Academy courses: Claude API, MCP, Agent Skills, Claude Code"] },
  { kind: "Google Cloud", items: ["Generative AI Leader (business and strategy)", "Professional Machine Learning Engineer (engineering)"] },
  { kind: "Microsoft", items: ["Azure AI Fundamentals (AI-900)", "Azure AI apps and agents developer (successor to AI-102)"] },
  { kind: "AWS", items: ["AI Practitioner", "Machine Learning Engineer Associate", "Generative AI Developer Professional"] },
  { kind: "Frameworks", items: ["LangChain Academy: LangGraph, LangSmith", "DeepLearning.AI short courses on agents, RAG and evals"] },
];

export const SOURCES = [
  { label: "What is a Forward Deployed Engineer? (Analytics Vidhya)", url: "https://www.analyticsvidhya.com/?p=257148" },
  { label: "7 steps to become a Forward Deployed Engineer in 2026 (KDnuggets)", url: "https://www.kdnuggets.com/7-steps-to-become-a-forward-deployed-engineer-in-2026" },
  { label: "AI Forward Deployed Engineer: skills and responsibilities (Second Talent)", url: "https://www.secondtalent.com/occupations/ai-forward-deployed-engineer/" },
  { label: "What applied-AI engineer interviews test in 2026", url: "https://www.techinterview.org/post/3233476824/ai-engineer-interview-rag-agents-evals/?format=md" },
  { label: "How to become an AI engineer in 2026 (Interview Query)", url: "https://www.interviewquery.com/p/ai-engineer-skills-roadmap" },
  { label: "AI Engineers talent framework (ProDevs)", url: "https://prodevs.io/en/ai-framework" },
  { label: "Job leveling matrix for AI career pathways (Coursera)", url: "https://www.coursera.org/resources/job-leveling-matrix-for-artificial-intelligence-career-pathways" },
  { label: "Human-AI collaboration and software engineering work (arXiv)", url: "https://arxiv.org/pdf/2606.03394" },
  { label: "AI-Native Product Engineer posting (IxDF)", url: "https://ixdf.org/jobs/ai-native-product-engineer-remote" },
  { label: "AI certifications landscape: Claude vs AWS vs Azure vs Google", url: "https://claudearchitectcertification.com/blog/claude-certified-architect-vs-aws-azure-google-ai-certifications.md" },
];
