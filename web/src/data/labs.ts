/** What the model providers ask for in their own applied AI roles.
 *  Read from public job postings on 2026-11-11, through job boards that mirror them.
 *  Only what several postings repeat is listed; postings change, so each provider links
 *  to its own careers page. Pay is left out: the mirrored figures did not agree. */
export interface Lab {
  id: string;
  name: string;
  headline: string;
  careers: string;
  titles: string[];
  experience: string;
  asks: { skill: string; detail: string }[];
  stack: string[];
  notes: string[];
  sources: { label: string; url: string }[];
}

export const checked = "2026-11-11";

export const labs: Lab[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    headline: "Applied AI Engineer",
    careers: "https://www.anthropic.com/careers",
    titles: ["Applied AI Engineer (Startups, Enterprise Tech, Digital Natives, Beneficial Deployments)", "Forward Deployed Engineer, Applied AI", "Manager, Applied AI Engineering"],
    experience: "From 2+ years in a technical, customer-facing role (Beneficial Deployments) to 4+ years for most Applied AI Engineer roles, 7+ years for the manager role.",
    asks: [
      { skill: "Customers", detail: "Technical, customer-facing work: Customer Engineer, Forward Deployed Engineer, Sales Engineer or a technical founder, advising customers on deploying Claude." },
      { skill: "Production LLM patterns", detail: "Prompt engineering and context engineering, agent frameworks and retrieval, named together as common LLM implementation patterns." },
      { skill: "Evaluations", detail: "Building evaluation frameworks with customers; evals appear in nearly every applied AI posting." },
      { skill: "Software", detail: "Production Python; Python or TypeScript for the enterprise and manager roles." },
      { skill: "Architecture", detail: "Advising on architecture design decisions and scalable systems for fast-growing companies." },
    ],
    stack: ["Claude", "Python", "TypeScript", "Agents", "RAG", "Evals"],
    notes: [
      "Domain variants add the domain: the Life Sciences track asks for research experience there.",
      "A Bachelor's degree in a related field, or equivalent experience.",
    ],
    sources: [
      { label: "Applied AI Engineer, Startups (Greenhouse)", url: "https://job-boards.greenhouse.io/anthropic/jobs/5432575008" },
      { label: "Applied AI Engineer, Beneficial Deployments, Life Sciences (Greenhouse)", url: "https://job-boards.greenhouse.io/anthropic/jobs/5437172008" },
      { label: "Forward Deployed Engineer, Applied AI (Greenhouse)", url: "https://job-boards.greenhouse.io/anthropic/jobs/4985877008" },
      { label: "Manager, Applied AI Engineering (Greenhouse)", url: "https://job-boards.greenhouse.io/anthropic/jobs/5209711008" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    headline: "Forward Deployed Engineer",
    careers: "https://openai.com/careers",
    titles: ["Forward Deployed Engineer (FDE), by industry: Healthcare, Legal and others", "Forward Deployed Software Engineer", "Platform Engineer, Forward Deployed Engineering"],
    experience: "About 5 to 7+ years: 5+ years of engineering or technical deployment work for FDE roles, 7+ years of full-stack engineering for the software variant.",
    asks: [
      { skill: "Embedding with customers", detail: "Working inside strategic customers' teams and leading end-to-end deployments of frontier models into production." },
      { skill: "Full-stack building", detail: "Designing and building full-stack solutions: Python, JavaScript, relational databases such as Postgres or MySQL." },
      { skill: "LLM systems in production", detail: "Experience building or deploying systems powered by LLMs or generative models, some in regulated or high-stakes settings." },
      { skill: "Ownership", detail: "Operating as a senior engineer, tech lead or deployment owner trusted to decide in ambiguous situations; a bias for action." },
    ],
    stack: ["OpenAI API", "Python", "JavaScript", "Postgres / MySQL", "System design"],
    notes: [
      "Industry tracks (Healthcare, Legal) want the domain on top of the engineering.",
      "Founders and early startup engineers who built a product from scratch are called out as a plus.",
    ],
    sources: [
      { label: "Forward Deployed Engineer (FDE), SF", url: "https://openai.com/careers/forward-deployed-engineer-(fde)-sf-san-francisco/" },
      { label: "Forward Deployed Engineer (FDE), Healthcare", url: "https://openai.com/careers/forward-deployed-engineer-(fde)-healthcare-sf-san-francisco/" },
      { label: "Forward Deployed Software Engineer, SF", url: "https://openai.com/careers/forward-deployed-software-engineer-sf/" },
      { label: "Platform Engineer, Forward Deployed Engineering", url: "https://openai.com/careers/platform-engineer-forward-deployed-engineering-(fde)-sf-san-francisco/" },
    ],
  },
  {
    id: "google",
    name: "Google Cloud (Gemini)",
    headline: "Forward Deployed Engineer, Gen AI",
    careers: "https://www.google.com/about/careers/applications/jobs/results?q=forward%20deployed%20engineer",
    titles: ["Forward Deployed Engineer, Generative AI / Gen AI, Google Cloud", "Forward Deployed Engineer I to IV (Applied AI, Developer AI)", "Partner Forward Deployed Engineer"],
    experience: "Levelled roles: from 2 years of Python and ML packages at the entry level to 5+ years of software development, and 8 years in cloud or customer-facing work for senior roles.",
    asks: [
      { skill: "Agents", detail: "Multi-agent systems with frameworks such as LangGraph, CrewAI or Google's ADK, and patterns like ReAct, self-reflection and hierarchical delegation." },
      { skill: "Retrieval", detail: "Pipelines over structured and unstructured data with vector databases and RAG-like architectures." },
      { skill: "Cloud and production", detail: "Architecting AI systems on Google Cloud and taking them from prototype to launch; infrastructure as code with Terraform." },
      { skill: "Evals and observability", detail: "Tracing, and tracking latency and cost, as preferred qualifications." },
      { skill: "Customers", detail: "Technical customer-facing work, with significant travel on many roles (up to 50% on one)." },
    ],
    stack: ["Gemini", "Vertex AI", "Google ADK", "LangGraph", "Terraform", "Python"],
    notes: [
      "A Bachelor's in CS or engineering, or equivalent practical experience; a Master's or PhD is often preferred.",
      "Some roles focus on one product: Gemini Enterprise, Gemini Code Assist or Vertex AI. Regional roles add languages.",
    ],
    sources: [
      { label: "Forward Deployed Engineer, Gen AI, Google Cloud (mirror)", url: "https://jobs.anitab.org/companies/google-24698/jobs/83438288-forward-deployed-engineer-gen-ai-google-cloud" },
      { label: "Forward Deployed Engineer IV, Generative AI (mirror)", url: "https://jobs.anitab.org/companies/google-24698/jobs/81603989-forward-deployed-engineer-iv-generative-ai-google-cloud" },
      { label: "Forward Deployed Engineer I, Applied AI (mirror)", url: "https://jobs.anitab.org/companies/google-24698/jobs/80348707-forward-deployed-engineer-i-applied-ai-google-cloud" },
      { label: "Forward Deployed Engineer III (Google Careers)", url: "https://google.com/about/careers/applications/jobs/results/127965694384841414-forward-deployed-engineer-iii" },
    ],
  },
];

/** What all three ask for, in the framework's skill ids, for linking to the fit check. */
export const shared = [
  { id: "customer", why: "Every provider's applied AI role is customer-facing first." },
  { id: "agents", why: "Agent frameworks and tool use are named by all three." },
  { id: "evals", why: "Evaluation frameworks, tracing and cost tracking." },
  { id: "software", why: "Production Python; TypeScript or JavaScript for full-stack work." },
  { id: "retrieval", why: "RAG and vector search, explicitly at Anthropic and Google." },
];
