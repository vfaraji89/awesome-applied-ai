/** The site's structure, in reading order. Nav, home, hero path and footer all read from this. */
export interface SubPage { label: string; href: string; note: string; soon?: boolean }
export interface Section { n: string; id: string; label: string; title: string; line: string; href: string; match: string[]; pages: SubPage[] }

export const structure: Section[] = [
  {
    n: "01", id: "market", label: "Market", title: "The market", href: "/market/", match: ["/market/", "/fit/", "/labs/"],
    line: "What applied AI jobs ask for, tracked every day, and where you fit.",
    pages: [
      { label: "Market pulse", href: "/market/", note: "Roles, levels, skills and tools in demand" },
      { label: "Role fit", href: "/fit/", note: "Paste your CV, see your closest role and what to learn next" },
      { label: "What the labs ask for", href: "/labs/", note: "Anthropic, OpenAI and Google, side by side" },
      { label: "Weekly note", href: "/market/note/", note: "What changed this week, ready to share" },
    ],
  },
  {
    n: "02", id: "roles", label: "Roles & skills", title: "Roles, skills and tasks", href: "/roles/", match: ["/roles/"],
    line: "Who does the work, what they do all day, and the skills it takes.",
    pages: [
      { label: "Role families", href: "/roles/", note: "Titles, tasks, stack and growth path" },
      { label: "Skills matrix", href: "/roles/#matrix", note: "Twelve skills, scored aware to expert" },
      { label: "Tasks", href: "/roles/#tasks", note: "What each role does day to day" },
    ],
  },
  {
    n: "03", id: "architect", label: "AI-native architect", title: "The AI-native architect", href: "/architect/", match: ["/architect/", "/architecture/", "/tools/", "/problems/"],
    line: "The role that designs AI into real systems: the layers, the stack and the problems.",
    pages: [
      { label: "The role", href: "/architect/", note: "What an AI-native architect does" },
      { label: "Architecture", href: "/architecture/", note: "Six layers, one request" },
      { label: "Tools", href: "/tools/", note: "The daily stack and the wider map" },
      { label: "Problems", href: "/problems/", note: "What breaks, and the fix" },
    ],
  },
  {
    n: "04", id: "certificates", label: "Certificates", title: "Industry certificates", href: "/certificates/", match: ["/certificates/"],
    line: "The certificates the industry asks for most, and what each one proves.",
    pages: [{ label: "Certificates", href: "/certificates/", note: "By provider and by role", soon: true }],
  },
  {
    n: "05", id: "docs", label: "Docs", title: "Technical docs, in motion", href: "/docs/", match: ["/docs/", "/jargon/", "/learn/"],
    line: "The docs people skip, turned into short animations, examples and code.",
    pages: [
      { label: "Claude Platform", href: "/docs/claude-platform/", note: "How your app talks to Claude" },
      { label: "Vercel AI SDK", href: "/docs/#vercel-ai-sdk", note: "AI in a TypeScript app", soon: true },
      { label: "LangChain & Deep Agents", href: "/docs/#langchain", note: "Agents from building blocks", soon: true },
      { label: "MCP", href: "/docs/#mcp", note: "One plug for every tool", soon: true },
      { label: "Jargon", href: "/jargon/", note: "The words, in plain language" },
    ],
  },
  {
    n: "06", id: "contribute", label: "Contribute", title: "Contributions", href: "/contribute/", match: ["/contribute/"],
    line: "Open source: add a term, a company to track, a doc or a fix.",
    pages: [{ label: "How to contribute", href: "/contribute/", note: "Issues, pull requests and where things live" }],
  },
];
