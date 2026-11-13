/** Industry certificates for applied AI. Every row was checked against the provider's own page on CHECKED;
 *  fees and lengths are filled in only where that page states them. Names stay in English (they are
 *  product names); `what` is translated as ce.<id>.what. */

export const CHECKED = "2026-11-13";

export type Track = "start" | "build" | "ml" | "gov";
export const TRACKS: { id: Track; name: string; line: string }[] = [
  { id: "start", name: "Start here", line: "No experience needed: the vocabulary and the main services." },
  { id: "build", name: "Build with LLMs and agents", line: "The applied AI core: RAG, tools, agents and evals on one stack." },
  { id: "ml", name: "Models and ML platforms", line: "Training, serving and running models in production." },
  { id: "gov", name: "Governance", line: "Laws, standards and risk, for the people who sign off." },
];

export const LEVELS = ["", "Foundational", "Associate", "Professional", "Expert"] as const;

export interface Cert {
  id: string; name: string; provider: string; code?: string; level: 1 | 2 | 3 | 4; track: Track;
  fee?: string; length?: string; valid?: string; what: string; url: string;
  status?: "new" | "changing"; statusNote?: string;
}

export const certs: Cert[] = [
  // start here
  { id: "google-gail", name: "Generative AI Leader", provider: "Google Cloud", level: 1, track: "start", fee: "$99", length: "90 min", valid: "3 years",
    what: "Gen AI concepts and Google Cloud's offerings, for any role, technical or not.", url: "https://cloud.google.com/learn/certification/generative-ai-leader" },
  { id: "aws-aip", name: "AWS Certified AI Practitioner", provider: "AWS", level: 1, track: "start",
    what: "AI, ML and generative AI basics on AWS, for any role.", url: "https://aws.amazon.com/certification/certified-ai-practitioner/" },
  { id: "ms-ai901", name: "Microsoft Certified: Azure AI Fundamentals", provider: "Microsoft", code: "AI-901", level: 1, track: "start",
    what: "AI concepts and building with Microsoft Foundry. AI-901 replaced AI-900 in June 2026.", url: "https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/" },
  { id: "nvidia-ncagenl", name: "NVIDIA-Certified Associate: Generative AI LLMs", provider: "NVIDIA", code: "NCA-GENL", level: 2, track: "start", fee: "$125", length: "1 hour", valid: "2 years",
    what: "An entry-level exam on generative AI and LLM fundamentals.", url: "https://www.nvidia.com/en-us/learn/certification/generative-ai-llm-associate/" },

  // build with LLMs and agents
  { id: "claude-ccaf", name: "Claude Certified Architect, Foundations", provider: "Anthropic", level: 2, track: "build", fee: "$125", status: "new",
    what: "Production apps on Claude: Claude Code, the Agent SDK, the Claude API and MCP. Run through Anthropic's partner academy.", url: "https://anthropic-partners.skilljar.com/page/partner-certifications" },
  { id: "ms-ai103", name: "Microsoft Certified: Azure AI Apps and Agents Developer Associate", provider: "Microsoft", code: "AI-103", level: 2, track: "build", length: "120 min", status: "new",
    what: "Generative AI and agent solutions on Microsoft Foundry, in Python. Replaced the Azure AI Engineer (AI-102).", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/" },
  { id: "databricks-genai", name: "Databricks Certified Generative AI Engineer Associate", provider: "Databricks", level: 2, track: "build", fee: "$200", length: "90 min", valid: "2 years",
    what: "RAG apps and LLM chains on Databricks, from data preparation to evaluation and governance.", url: "https://www.databricks.com/learn/certification/genai-engineer-associate" },
  { id: "salesforce-agentforce", name: "Salesforce Certified Agentforce Specialist", provider: "Salesforce", level: 2, track: "build",
    what: "Configuring and running Agentforce agents on the Salesforce platform.", url: "https://trailhead.salesforce.com/credentials/agentforcespecialist" },
  { id: "claude-ccap", name: "Claude Certified Architect, Professional", provider: "Anthropic", level: 3, track: "build", fee: "$175", status: "new",
    what: "Claude at enterprise scale: integration architecture, governance and evaluation.", url: "https://anthropic-partners.skilljar.com/page/partner-certifications" },
  { id: "aws-genai", name: "AWS Certified Generative AI Developer, Professional", provider: "AWS", code: "AIP-C01", level: 3, track: "build", fee: "$300", length: "180 min", status: "new",
    what: "Generative AI apps on Amazon Bedrock: RAG, vector stores, agents, safety and governance.", url: "https://aws.amazon.com/certification/certified-generative-ai-developer-professional/" },
  { id: "google-agentic", name: "Professional Agentic Architect", provider: "Google Cloud", level: 3, track: "build", fee: "$200", length: "2 hours + labs", valid: "1 year", status: "new",
    what: "Low-code and custom agents, coding agents, and evaluating, deploying and governing agent workflows. A proctored exam, then hands-on labs.", url: "https://cloud.google.com/learn/certification/agentic-architect" },
  { id: "nvidia-agentic", name: "NVIDIA-Certified Professional: Agentic AI", provider: "NVIDIA", level: 3, track: "build", fee: "$200", length: "120 min",
    what: "Designing, building, deploying and governing agentic systems.", url: "https://www.nvidia.com/en-us/learn/certification/agentic-ai-professional/" },
  { id: "ms-ab100", name: "Microsoft Certified: Agentic AI Business Solutions Architect Expert", provider: "Microsoft", code: "AB-100", level: 4, track: "build",
    what: "Designing agentic business solutions. Needs exam AB-100 plus a qualifying associate certification such as AI-103.", url: "https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-business-solutions-architect/" },

  // models and ML platforms
  { id: "aws-mla", name: "AWS Certified Machine Learning Engineer, Associate", provider: "AWS", level: 2, track: "ml", status: "changing", statusNote: "MLA-C02, which adds generative AI, is generally available from 14 Jan 2027.",
    what: "Building, deploying and operating ML workloads on AWS.", url: "https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/" },
  { id: "google-pmle", name: "Professional Machine Learning Engineer", provider: "Google Cloud", level: 3, track: "ml", fee: "$200", length: "2 hours",
    what: "Building, serving and monitoring ML on Google Cloud, now including generative AI solutions.", url: "https://cloud.google.com/learn/certification/machine-learning-engineer" },
  { id: "nvidia-ncpgenl", name: "NVIDIA-Certified Professional: Generative AI LLMs", provider: "NVIDIA", code: "NCP-GENL", level: 3, track: "ml", fee: "$200", length: "2 hours",
    what: "Designing, training and fine-tuning LLMs, including distributed training.", url: "https://www.nvidia.com/en-us/learn/certification/" },

  // governance
  { id: "iapp-aigp", name: "AIGP: Artificial Intelligence Governance Professional", provider: "IAPP", level: 3, track: "gov", length: "2 h 45 min", valid: "2 years",
    what: "AI governance across the lifecycle: AI laws and standards, risk and responsible AI. Content updated in February 2026.", url: "https://iapp.org/certify/aigp" },
];

/** Courses that end in a certificate of completion: proof of study, not a proctored exam. */
export const courses = [
  { id: "anthropic-academy", name: "Anthropic Academy", provider: "Anthropic", cost: "Free", what: "Courses on the Claude API, MCP, Agent Skills and Claude Code.", url: "https://anthropic.skilljar.com/" },
  { id: "hf-agents", name: "AI Agents Course", provider: "Hugging Face", cost: "Free", what: "Build agents from scratch; the certificate needs your agent to score 30% or more on a GAIA subset.", url: "https://huggingface.co/learn/agents-course/unit0/introduction" },
  { id: "langchain-academy", name: "LangChain Academy", provider: "LangChain", cost: "Free", what: "Courses on LangGraph and LangSmith: agent graphs, tracing and evals.", url: "https://academy.langchain.com/" },
  { id: "dlai-agentic", name: "Agentic AI", provider: "DeepLearning.AI", cost: "Pro membership", what: "Andrew Ng's course on agent design patterns, about 10 hours with graded assignments. Free to audit; the certificate needs Pro.", url: "https://www.deeplearning.ai/courses/agentic-ai" },
];

/** What changed recently, so an old study guide does not send anyone to a retired exam. */
export const changes = [
  { id: "ai102", was: "Azure AI Engineer Associate (AI-102)", now: "Azure AI Apps and Agents Developer Associate (AI-103)", when: "Retired 30 Jun 2026" },
  { id: "ai900", was: "Exam AI-900", now: "Exam AI-901, same Azure AI Fundamentals certificate", when: "Retired 30 Jun 2026" },
  { id: "awsmls", was: "AWS Machine Learning, Specialty", now: "Generative AI Developer, Professional or ML Engineer, Associate", when: "Last exam 31 Mar 2026" },
  { id: "mla", was: "AWS ML Engineer Associate, exam MLA-C01", now: "MLA-C02, which adds generative AI", when: "From 14 Jan 2027" },
];
