/* The general tech stack named in job ads, by category: languages, frontend, backend, data, cloud,
   ML and GPU, docs and maths, testing. Separate from the tool map (taxonomy.ts), which covers AI
   tools; this answers "which languages and frameworks do these jobs ask for". Names that are also
   ordinary words or first names are matched case-sensitively and, where needed, only in context. */

type Item = [name: string, re: RegExp];
const w = (s: string, flags = "i") => new RegExp(`(?<![\\w.-])(?:${s})(?![\\w-])`, flags);

export const TECH: { id: string; name: string; items: Item[] }[] = [
  { id: "lang", name: "Programming languages", items: [
    ["Python", w("Python")], ["TypeScript", w("TypeScript")], ["JavaScript", w("JavaScript|ECMAScript")], ["SQL", w("SQL", "")],
    ["Go", /(?<![\w.-])(?:Golang|Go(?= ?[,/)]| and | or |-based)|in Go\b)/], ["Rust", w("Rust", "")], ["Java", w("Java", "")],
    ["C++", /(?<![\w])C\+\+(?![\w+])/], ["C", /(?<![\w/])C(?=\/C\+\+| ?, ?C\+\+| or C\+\+| and C\+\+)/], ["C#", /(?<![\w])C#(?![\w])/],
    ["Scala", w("Scala", "")], ["Kotlin", w("Kotlin")], ["Swift", w("Swift(?!UI)", "")], ["Ruby", w("Ruby", "")], ["PHP", w("PHP", "")],
    ["R", /(?:(?:Python|SQL)[,/] ?(?:or |and )?R(?![\w])|(?<![\w])R(?= ?[,/] ?(?:Python|SQL))|\bR programming|\bRStudio\b)/], ["Julia", /\bJulia(?= ?[,/)]| (?:or|and) (?:Python|R)\b)/],
    ["Elixir", w("Elixir", "")], ["Haskell", w("Haskell", "")], ["OCaml", w("OCaml")], ["Zig", w("Zig", "")], ["Dart", w("Dart", "")],
    ["Lua", w("Lua", "")], ["Bash", w("Bash|shell scripting")], ["CUDA", w("CUDA")], ["Mojo", w("Mojo", "")], ["Solidity", w("Solidity", "")],
    ["Verilog", w("Verilog|SystemVerilog")],
  ] },
  { id: "front", name: "Frontend and apps", items: [
    ["React", w("React(?:\\.?js)?(?! Native)", "")], ["Next.js", w("Next\\.?js")], ["Vue", w("Vue(?:\\.?js)?", "")], ["Nuxt", w("Nuxt")],
    ["Svelte", w("Svelte(?:Kit)?", "")], ["Angular", w("Angular", "")], ["SolidJS", w("SolidJS|Solid\\.js")], ["Remix", w("Remix", "")],
    ["Astro", w("Astro", "")], ["TanStack", w("TanStack(?: (?:Query|Router|Start|Table))?")], ["Tailwind", w("Tailwind(?: ?CSS)?")],
    ["shadcn/ui", w("shadcn(?:/ui)?")], ["Redux", w("Redux")], ["Zustand", w("Zustand")], ["Vite", w("Vite", "")], ["Webpack", w("Webpack")],
    ["React Native", w("React Native")], ["Flutter", w("Flutter", "")], ["SwiftUI", w("SwiftUI")], ["Electron", w("Electron(?:\\.js)?", "")],
    ["Tauri", w("Tauri")], ["Three.js", w("Three\\.js")], ["WebGPU", w("WebGPU")], ["WebGL", w("WebGL")], ["D3.js", w("D3(?:\\.js)?", "")],
    ["Storybook", w("Storybook")], ["htmx", w("htmx")],
  ] },
  { id: "back", name: "Backend and APIs", items: [
    ["Node.js", w("Node(?:\\.?js)?(?= |,|/|\\))", "")], ["FastAPI", w("FastAPI")], ["Django", w("Django")], ["Flask", w("Flask", "")],
    ["Express", w("Express(?:\\.js)?(?= ?[,/)]| and )", "")], ["NestJS", w("NestJS")], ["Spring", w("Spring(?: Boot)?(?= ?[,/)]| and | Boot)", "")],
    ["Rails", w("Rails|Ruby on Rails", "")], ["Laravel", w("Laravel")], [".NET", /(?<![\w])(?:\.NET|ASP\.NET)(?![\w])/], ["gRPC", w("gRPC")],
    ["GraphQL", w("GraphQL")], ["REST", w("REST(?:ful)?", "")], ["tRPC", w("tRPC")], ["Hono", w("Hono", "")], ["Bun", w("Bun", "")],
    ["Deno", w("Deno", "")], ["Celery", w("Celery")], ["WebSockets", w("WebSockets?")], ["Protobuf", w("Protobuf|protocol buffers")],
  ] },
  { id: "data", name: "Data and storage", items: [
    ["PostgreSQL", w("Postgres(?:QL)?")], ["MySQL", w("MySQL")], ["MongoDB", w("MongoDB|Mongo", "")], ["Snowflake", w("Snowflake", "")],
    ["Databricks", w("Databricks")], ["Spark", w("Spark|PySpark", "")], ["Kafka", w("Kafka")], ["Flink", w("Flink")], ["Airflow", w("Airflow")],
    ["dbt", w("dbt", "")], ["ClickHouse", w("ClickHouse")], ["DuckDB", w("DuckDB")], ["Pandas", w("Pandas", "")], ["Polars", w("Polars", "")],
    ["NumPy", w("NumPy")], ["Iceberg", w("Iceberg", "")], ["Delta Lake", w("Delta Lake")], ["Trino", w("Trino|Presto", "")], ["DynamoDB", w("DynamoDB")],
    ["Cassandra", w("Cassandra", "")], ["Redshift", w("Redshift")], ["Supabase", w("Supabase")], ["Firebase", w("Firebase")],
    ["Tableau", w("Tableau", "")], ["Power BI", w("Power ?BI")], ["Looker", w("Looker", "")],
  ] },
  { id: "cloud", name: "Cloud and infrastructure", items: [
    ["AWS", w("AWS|Amazon Web Services")], ["Azure", w("Azure", "")], ["GCP", w("GCP|Google Cloud(?: Platform)?")], ["Kubernetes", w("Kubernetes|K8s")],
    ["Docker", w("Docker")], ["Terraform", w("Terraform")], ["Pulumi", w("Pulumi")], ["Helm", w("Helm", "")], ["Argo", w("Argo(?:CD| CD| Workflows)?", "")],
    ["GitHub Actions", w("GitHub Actions")], ["Jenkins", w("Jenkins", "")], ["Prometheus", w("Prometheus", "")], ["Grafana", w("Grafana")],
    ["Datadog", w("Datadog")], ["OpenTelemetry", w("OpenTelemetry|OTel", "")], ["Linux", w("Linux")], ["Nginx", w("Nginx")],
    ["Cloudflare Workers", w("Cloudflare Workers")], ["AWS Lambda", w("AWS Lambda")], ["Ansible", w("Ansible")], ["Istio", w("Istio")],
    ["Slurm", w("Slurm", "")],
  ] },
  { id: "ml", name: "ML and GPU", items: [
    ["PyTorch", w("PyTorch")], ["TensorFlow", w("TensorFlow")], ["JAX", w("JAX", "")], ["Keras", w("Keras")], ["scikit-learn", w("scikit-learn|sklearn")],
    ["XGBoost", w("XGBoost|LightGBM")], ["ONNX", w("ONNX")], ["TensorRT", w("TensorRT(?:-LLM)?")], ["vLLM", w("vLLM")], ["SGLang", w("SGLang")],
    ["Triton", w("Triton", "")], ["MLflow", w("MLflow")], ["Weights & Biases", w("Weights (?:&|and) Biases|W&B|wandb")],
    ["Transformers", w("Hugging ?Face Transformers|transformers library")], ["Megatron", w("Megatron")], ["NCCL", w("NCCL")],
    ["llama.cpp", w("llama\\.cpp")], ["Ollama", w("Ollama")],
  ] },
  { id: "docs", name: "Docs and maths", items: [
    ["LaTeX", w("LaTeX")], ["TeX", w("TeX", "")], ["KaTeX", w("KaTeX")], ["MathJax", w("MathJax")], ["Markdown", w("Markdown")], ["MDX", w("MDX", "")],
    ["Jupyter", w("Jupyter")], ["Quarto", w("Quarto")], ["Docusaurus", w("Docusaurus")], ["Sphinx", w("Sphinx", "")], ["Typst", w("Typst")],
    ["Lean", w("Lean 4|Lean4|Lean theorem prover|Mathlib", "")],
  ] },
  { id: "test", name: "Testing and quality", items: [
    ["Playwright", w("Playwright")], ["Cypress", w("Cypress", "")], ["Jest", w("Jest", "")], ["Vitest", w("Vitest")], ["pytest", w("pytest")],
    ["Selenium", w("Selenium")],
  ] },
];

/** Every stack item named in a text, as "category:name". */
export const techOf = (text: string) => TECH.flatMap((c) => c.items.filter(([, re]) => re.test(text)).map(([n]) => `${c.id}:${n}`));

/* Traditional tech roles, for "how AI is reaching other jobs". Read from ads whose title is not an
   AI role. First match wins, so the specific families come before the generic one. */
export const FAMILIES: { id: string; name: string; re: RegExp }[] = [
  { id: "frontend", name: "Frontend", re: /front[- ]?end|\bui engineer|web (developer|engineer)/i },
  { id: "fullstack", name: "Full-stack", re: /full[- ]?stack/i },
  { id: "backend", name: "Backend", re: /back[- ]?end|server[- ]side|\bapi engineer/i },
  { id: "mobile", name: "Mobile", re: /\b(ios|android|mobile|react native|flutter)\b/i },
  { id: "devops", name: "DevOps and SRE", re: /devops|\bsre\b|site reliability|platform engineer|infrastructure engineer|cloud engineer|production engineer/i },
  { id: "data-eng", name: "Data engineering", re: /data engineer|analytics engineer|\betl\b|data platform/i },
  { id: "data-sci", name: "Data science", re: /data scien|research scientist|statistician|quantitative/i },
  { id: "analyst", name: "Data analysis", re: /data analyst|business intelligence|\bbi\b|analytics (manager|lead)|insights analyst/i },
  { id: "security", name: "Security", re: /secur|appsec|detection|threat/i },
  { id: "qa", name: "QA and testing", re: /\bqa\b|quality (assurance|engineer)|test (engineer|automation)|\bsdet\b/i },
  { id: "pm", name: "Product management", re: /product manager|product owner|product lead|\bpm\b/i },
  { id: "design", name: "Design", re: /designer|\bux\b|user experience|design (lead|manager)/i },
  { id: "software", name: "Software engineering (general)", re: /software (engineer|developer)|\bswe\b|developer|engineer(ing)? manager|staff engineer|principal engineer/i },
];
export const familyOf = (title: string) => FAMILIES.find((f) => f.re.test(title))?.id;

/** Asks the person to build AI into the product (LLMs, agents, RAG...). */
export const BUILD_AI = /\b(LLMs?|large language models?|generative AI|gen ?AI|AI agents?|agentic|RAG|retrieval[- ]augmented|prompt engineering|embeddings|vector (databases?|search|stores?)|fine[- ]tun(e|ing) (models|LLMs)|AI[- ](features?|products?|powered|native|capabilities)|OpenAI|Anthropic|Claude|GPT-?\d|ChatGPT|Gemini|model context protocol|MCP)\b/;
/** Asks the person to work with AI coding tools or AI-assisted ways of working. */
export const USE_AI = /\b(GitHub Copilot|Copilot|Cursor|Claude Code|Codex|Windsurf|AI[- ]assisted (coding|development|engineering)|AI (coding|developer) (tools|assistants?)|coding (agents?|assistants?)|AI tools|AI-first|AI-native (workflows?|engineering|development)|vibe coding)\b/;
/** The words that triggered either, to show what "AI" means in each family. */
export const AI_TERMS: [string, RegExp][] = [
  ["LLMs", /\b(LLMs?|large language models?)\b/i], ["Generative AI", /\b(generative AI|gen ?AI)\b/i], ["Agents", /\b(AI agents?|agentic)\b/i],
  ["RAG", /\b(RAG|retrieval[- ]augmented)\b/], ["Prompting", /\bprompt engineering\b/i], ["Embeddings", /\b(embeddings|vector (databases?|search|stores?))\b/i],
  ["AI features", /\bAI[- ](features?|products?|powered|native|capabilities)\b/i], ["Copilot", /\b(GitHub )?Copilot\b/], ["Cursor", /\bCursor\b/],
  ["Claude Code", /\bClaude Code\b/], ["AI coding tools", /\b(AI[- ]assisted (coding|development|engineering)|AI (coding|developer) (tools|assistants?)|coding (agents?|assistants?)|vibe coding)\b/i],
  ["AI tools", /\bAI tools\b/i], ["OpenAI or Claude", /\b(OpenAI|Anthropic|Claude(?! Code)|ChatGPT|GPT-?\d|Gemini)\b/], ["MCP", /\b(MCP|model context protocol)\b/],
];
