import type { KitEntry, Shelf } from "@/lib/types";

export const shelves: Shelf[] = [
  {
    id: "agents",
    name: "Coding agents",
    tagline: "The ones that hold a terminal",
    intro:
      "All of these read files, run commands and edit code. They differ on who owns the model, how the sandbox works, and whether you can point them at a model you already pay for. Benchmark position moves every few weeks and is the least useful thing to choose on.",
  },
  {
    id: "terminal",
    name: "Terminal",
    tagline: "What the agent is actually calling",
    intro:
      "An agent is only as good as the commands available to it. Every one of these is faster or more structured than what the agent would otherwise reach for, and each saves tokens by returning less: a scoped grep instead of a file read, a diff instead of a file, a count instead of a dump.",
  },
  {
    id: "apps",
    name: "Apps & local runners",
    tagline: "When the weights stay on your machine",
    intro:
      "Two different jobs get confused here. Ollama, LM Studio and Jan are experience layers over llama.cpp or MLX, sized for one user on a laptop. They are not serving infrastructure — the moment you have concurrent users, the engine underneath is the thing you are choosing.",
  },
  {
    id: "mcp",
    name: "MCP",
    tagline: "Servers, registries, and what is no longer maintained",
    intro:
      "The reference repository now maintains seven servers. Everything else that used to live there — GitHub, Postgres, Slack, Google Drive — moved to an archive, and most roundups still link at the dead copies. Where an official first-party server exists, use that instead.",
  },
  {
    id: "corpora",
    name: "Corpora & benchmarks",
    tagline: "What you measure against, and what it does not tell you",
    intro:
      "A public benchmark tells you a model generalises. It does not tell you it works on your corpus, and models released after 2023 have very likely seen these datasets. Use them to rule things out, then build a set from your own traffic to rule things in.",
  },
];

export const kit: KitEntry[] = [
  // ------------------------------------------------------------------ agents
  {
    id: "claude-code",
    name: "Claude Code",
    shelf: "agents",
    summary:
      "Anthropic's agent for the terminal, with hooks, subagents, skills and MCP client support.",
    reach:
      "The deepest extension surface of the group — hooks fire on tool events, skills load as plain markdown, and subagents get their own context window. That last one is the reason to pick it for long tasks: research can be delegated without the findings landing in the main transcript.",
    install: "npm install -g @anthropic-ai/claude-code",
    url: "https://github.com/anthropics/claude-code",
    tags: ["agent", "mcp-client", "hooks", "subagents"],
    pick: true,
  },
  {
    id: "codex-cli",
    name: "Codex CLI",
    shelf: "agents",
    summary:
      "OpenAI's terminal agent, written in Rust, with OS-level sandboxing on macOS and Linux.",
    reach:
      "The sandbox is the differentiator: seatbelt on macOS, Landlock on Linux, enforced by the kernel rather than by the agent agreeing to behave. Reach for it when you are running something you have not read.",
    install: "npm install -g @openai/codex",
    url: "https://github.com/openai/codex",
    tags: ["agent", "sandbox", "rust"],
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    shelf: "agents",
    summary:
      "Google's open-source terminal agent, with the most generous free tier of the group.",
    reach:
      "The free quota makes it the cheapest way to put an agent in CI or in a cron job where you do not want to meter a subscription. Large context window helps on whole-repo questions.",
    install: "npm install -g @google/gemini-cli",
    url: "https://github.com/google-gemini/gemini-cli",
    tags: ["agent", "free-tier", "oss"],
  },
  {
    id: "opencode",
    name: "opencode",
    shelf: "agents",
    summary:
      "Model-agnostic terminal agent with a client/server split, so the TUI and the session can be on different machines.",
    reach:
      "The one to pick when you refuse to be tied to a vendor — it will drive whatever key you supply, including a local endpoint. The server split also means you can start a session on a workstation and attach from a laptop.",
    install: "curl -fsSL https://opencode.ai/install | bash",
    url: "https://github.com/sst/opencode",
    tags: ["agent", "oss", "model-agnostic", "byok"],
  },
  {
    id: "aider",
    name: "Aider",
    shelf: "agents",
    summary:
      "Pair programming in the terminal with automatic git commits for every change.",
    reach:
      "The git integration is the point: every edit lands as a commit, so undo is `git revert` rather than hope. Reach for it on a repo where you want a reviewable trail more than you want autonomy.",
    install: "uv tool install aider-chat",
    url: "https://github.com/Aider-AI/aider",
    tags: ["agent", "git", "oss", "python"],
  },
  {
    id: "copilot-cli",
    name: "GitHub Copilot CLI",
    shelf: "agents",
    summary:
      "Copilot in the terminal, billed through an existing Copilot seat.",
    reach:
      "Worth it only if the seats are already bought. Its advantage is org policy and audit landing in the same place as the rest of your GitHub estate.",
    install: "npm install -g @github/copilot",
    url: "https://github.com/github/copilot-cli",
    tags: ["agent", "github", "commercial"],
  },
  {
    id: "goose",
    name: "goose",
    shelf: "agents",
    summary:
      "Block's open-source agent, extension-based, runs on any model including local ones.",
    reach:
      "Its extension model is MCP end to end, so anything you build for it is portable to other clients. Good default if you are standardising on MCP rather than on a vendor.",
    url: "https://github.com/block/goose",
    tags: ["agent", "oss", "mcp-client", "local-models"],
  },
  {
    id: "crush",
    name: "Crush",
    shelf: "agents",
    summary:
      "Charm's terminal agent, LSP-aware, model-agnostic, with session switching.",
    reach:
      "The LSP integration means it reads your project the way your editor does — real symbol resolution instead of grep. Notable on large typed codebases.",
    url: "https://github.com/charmbracelet/crush",
    tags: ["agent", "oss", "lsp", "model-agnostic"],
  },

  // ---------------------------------------------------------------- terminal
  {
    id: "ripgrep",
    name: "ripgrep",
    shelf: "terminal",
    summary: "Recursive line search that respects .gitignore and is fast enough to be interactive.",
    reach:
      "The single highest-leverage tool on this shelf. An agent that greps for a symbol reads a few hundred tokens; an agent that reads three candidate files reads twenty thousand. Make sure it is installed before you tune anything else.",
    install: "brew install ripgrep",
    url: "https://github.com/BurntSushi/ripgrep",
    tags: ["search", "rust", "token-saver"],
    pick: true,
  },
  {
    id: "ast-grep",
    name: "ast-grep",
    shelf: "terminal",
    summary: "Structural search and rewrite on the syntax tree rather than on lines.",
    reach:
      "Where ripgrep finds the string, this finds the construct — every call with a particular argument shape, every unawaited promise. Reach for it on mechanical refactors that a regex would get subtly wrong.",
    install: "brew install ast-grep",
    url: "https://github.com/ast-grep/ast-grep",
    tags: ["search", "refactor", "rust", "ast"],
  },
  {
    id: "fd",
    name: "fd",
    shelf: "terminal",
    summary: "A find replacement with sane defaults and gitignore awareness.",
    reach:
      "Mostly a quality-of-life win over `find`, but the gitignore default matters when an agent is walking a repo with a 400 MB node_modules in it.",
    install: "brew install fd",
    url: "https://github.com/sharkdp/fd",
    tags: ["files", "rust"],
  },
  {
    id: "jq",
    name: "jq",
    shelf: "terminal",
    summary: "Command-line JSON processor.",
    reach:
      "The correct answer to 'the API returned 4 MB of JSON'. Filtering server-side of the context window is the cheapest token optimisation available.",
    install: "brew install jq",
    url: "https://github.com/jqlang/jq",
    tags: ["json", "token-saver"],
    pick: true,
  },
  {
    id: "yq",
    name: "yq",
    shelf: "terminal",
    summary: "jq for YAML, XML and TOML.",
    reach:
      "Editing a Helm values file or a CI workflow in place, without an agent rewriting the whole document and reformatting half of it.",
    install: "brew install yq",
    url: "https://github.com/mikefarah/yq",
    tags: ["yaml", "config"],
  },
  {
    id: "gh",
    name: "GitHub CLI",
    shelf: "terminal",
    summary: "GitHub from the terminal: PRs, issues, checks, releases, raw API.",
    reach:
      "`gh api` is the part that matters for agents — it is an authenticated HTTP client for anything the web UI can do, which means no scraping and no personal access token in a config file.",
    install: "brew install gh",
    url: "https://github.com/cli/cli",
    tags: ["git", "github", "api"],
  },
  {
    id: "delta",
    name: "delta",
    shelf: "terminal",
    summary: "Syntax-highlighted pager for git diffs with word-level highlighting.",
    reach:
      "For humans reviewing what the agent changed. Word-level highlighting is what makes a 200-line diff scannable rather than a wall.",
    install: "brew install git-delta",
    url: "https://github.com/dandavison/delta",
    tags: ["git", "diff", "review"],
  },
  {
    id: "difftastic",
    name: "difftastic",
    shelf: "terminal",
    summary: "Structural diff that compares syntax trees instead of lines.",
    reach:
      "Reach for it when a reformat has buried a one-line semantic change. It will tell you the only real change was a renamed variable; a line diff will show you 300 lines.",
    install: "brew install difftastic",
    url: "https://github.com/Wilfred/difftastic",
    tags: ["git", "diff", "ast"],
  },
  {
    id: "uv",
    name: "uv",
    shelf: "terminal",
    summary: "Python package and project manager, resolver and installer, in one Rust binary.",
    reach:
      "`uv run script.py` with inline dependency metadata means a throwaway script needs no virtualenv and no requirements file. That property is what makes it the right tool for agent-authored scripts.",
    install: "curl -LsSf https://astral.sh/uv/install.sh | sh",
    url: "https://github.com/astral-sh/uv",
    tags: ["python", "packaging", "rust"],
    pick: true,
  },
  {
    id: "mise",
    name: "mise",
    shelf: "terminal",
    summary: "Polyglot runtime version manager and task runner, with per-directory environments.",
    reach:
      "Replaces nvm, pyenv, rbenv and direnv with one config file. Worth it when an agent needs the right toolchain active without you remembering which shim is loaded.",
    install: "curl https://mise.run | sh",
    url: "https://github.com/jdx/mise",
    tags: ["versions", "env", "rust"],
  },
  {
    id: "just",
    name: "just",
    shelf: "terminal",
    summary: "A command runner with make's ergonomics and none of its build semantics.",
    reach:
      "The best way to give an agent a stable vocabulary: `just test`, `just lint`, `just deploy`. It stops the agent inventing a slightly wrong invocation every session.",
    install: "brew install just",
    url: "https://github.com/casey/just",
    tags: ["tasks", "rust", "agent-interface"],
  },
  {
    id: "watchexec",
    name: "watchexec",
    shelf: "terminal",
    summary: "Runs a command when files change.",
    reach:
      "Useful as a feedback loop the agent does not have to poll — tests re-run on save and the agent reads a result file rather than repeatedly invoking the suite.",
    install: "brew install watchexec",
    url: "https://github.com/watchexec/watchexec",
    tags: ["watch", "rust", "feedback-loop"],
  },
  {
    id: "hyperfine",
    name: "hyperfine",
    shelf: "terminal",
    summary: "Benchmarking tool with warmup runs, statistical outlier detection and export.",
    reach:
      "The answer to 'is this actually faster'. Reach for it before accepting any performance claim, including your own.",
    install: "brew install hyperfine",
    url: "https://github.com/sharkdp/hyperfine",
    tags: ["benchmark", "rust", "measurement"],
  },
  {
    id: "sqlite-utils",
    name: "sqlite-utils",
    shelf: "terminal",
    summary: "Build and query SQLite databases from the command line, including CSV and JSON import.",
    reach:
      "The fastest route from a pile of JSON to something queryable. For exploratory data work it beats loading a dataframe, and the result is a single file you can hand to anything.",
    install: "uv tool install sqlite-utils",
    url: "https://github.com/simonw/sqlite-utils",
    tags: ["sqlite", "data", "python"],
  },
  {
    id: "llm-cli",
    name: "llm",
    shelf: "terminal",
    summary: "CLI for prompting models, with plugins, logged conversations and embedding support.",
    reach:
      "The right shape for putting a model in a pipe. It logs every prompt and response to SQLite, which makes it the easiest way to keep a reproducible record of one-off model calls.",
    install: "uv tool install llm",
    url: "https://github.com/simonw/llm",
    tags: ["llm", "pipe", "python", "logging"],
  },
  {
    id: "files-to-prompt",
    name: "files-to-prompt",
    shelf: "terminal",
    summary: "Concatenates a directory of files into a single prompt-shaped blob.",
    reach:
      "For the case where you want the whole thing in the window on purpose. Pair it with a token counter before you paste, not after.",
    install: "uv tool install files-to-prompt",
    url: "https://github.com/simonw/files-to-prompt",
    tags: ["context", "python"],
  },
  {
    id: "repomix",
    name: "Repomix",
    shelf: "terminal",
    summary: "Packs a repository into one AI-friendly file, with token counting and secret redaction.",
    reach:
      "Better than a naive concatenation because it reports the token cost per file, so you can see which directory is eating the window before you send it.",
    install: "npx repomix",
    url: "https://github.com/yamadashy/repomix",
    tags: ["context", "token-accounting"],
  },
  {
    id: "fzf",
    name: "fzf",
    shelf: "terminal",
    summary: "General-purpose fuzzy finder that filters any list interactively.",
    reach:
      "A human tool, not an agent one. It is on this shelf because the review step — picking which of the agent's twelve changed files to read first — is where your time actually goes.",
    install: "brew install fzf",
    url: "https://github.com/junegunn/fzf",
    tags: ["fuzzy", "interactive", "review"],
  },
  {
    id: "tmux",
    name: "tmux",
    shelf: "terminal",
    summary: "Terminal multiplexer with detachable sessions.",
    reach:
      "The reason it belongs here: an agent run that takes forty minutes should not die because you closed a laptop. Detach, reattach, keep the transcript.",
    install: "brew install tmux",
    url: "https://github.com/tmux/tmux",
    tags: ["sessions", "long-running"],
  },
  {
    id: "direnv",
    name: "direnv",
    shelf: "terminal",
    summary: "Loads and unloads environment variables per directory.",
    reach:
      "Keeps project credentials out of your shell profile, which matters more when an agent can read your shell profile.",
    install: "brew install direnv",
    url: "https://github.com/direnv/direnv",
    tags: ["env", "secrets-hygiene"],
  },
  {
    id: "shellcheck",
    name: "ShellCheck",
    shelf: "terminal",
    summary: "Static analysis for shell scripts.",
    reach:
      "Agents write shell with unquoted variables and unhandled failures. This catches both, and it catches them before the script runs against something you care about.",
    install: "brew install shellcheck",
    url: "https://github.com/koalaman/shellcheck",
    tags: ["shell", "lint", "safety"],
  },
  {
    id: "pandoc",
    name: "Pandoc",
    shelf: "terminal",
    summary: "Universal document converter across roughly forty markup formats.",
    reach:
      "The unglamorous first step of most ingestion pipelines. Before reaching for a document-parsing service, check whether the corpus is DOCX and Pandoc solves it for nothing.",
    install: "brew install pandoc",
    url: "https://github.com/jgm/pandoc",
    tags: ["documents", "ingestion", "conversion"],
  },

  // -------------------------------------------------------------------- apps
  {
    id: "ollama",
    name: "Ollama",
    shelf: "apps",
    summary:
      "One-line local model runner wrapping llama.cpp, and MLX on Apple silicon, with an OpenAI-compatible endpoint.",
    reach:
      "The fastest path to a local model and the right default for one user on one machine. It is not a serving tier — concurrency is where it stops being the answer.",
    install: "brew install ollama",
    url: "https://github.com/ollama/ollama",
    tags: ["local", "runner", "openai-compatible"],
    pick: true,
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    shelf: "apps",
    summary: "Desktop app for discovering, running and serving local models, with a built-in server.",
    reach:
      "The most polished GUI of the group, and the one to hand to someone who is not going to use a terminal. Same engine underneath as Ollama; the difference is entirely the interface.",
    url: "https://lmstudio.ai",
    tags: ["local", "gui", "desktop"],
  },
  {
    id: "llama-cpp",
    name: "llama.cpp",
    shelf: "apps",
    summary: "The C++ inference engine that most local runners are wrapping.",
    reach:
      "Go direct when you need control over quantisation, thread count, batch size or memory mapping — the wrappers hide exactly the knobs that matter on constrained hardware.",
    install: "brew install llama.cpp",
    url: "https://github.com/ggml-org/llama.cpp",
    tags: ["engine", "quantisation", "cpp"],
  },
  {
    id: "mlx-lm",
    name: "MLX LM",
    shelf: "apps",
    summary: "Apple's array framework and its language-model package, built for unified memory.",
    reach:
      "On Apple silicon this is the native path — unified memory means no host-to-device copy, and large models fit where a discrete GPU of the same nominal size would not.",
    install: "uv tool install mlx-lm",
    url: "https://github.com/ml-explore/mlx-lm",
    tags: ["apple-silicon", "engine", "python"],
  },
  {
    id: "jan",
    name: "Jan",
    shelf: "apps",
    summary: "Open-source, offline-first desktop assistant with a local API server.",
    reach:
      "The pick when 'the data must not leave the machine' is a written requirement rather than a preference — it is designed to run fully offline and is auditable.",
    url: "https://github.com/menloresearch/jan",
    tags: ["local", "gui", "oss", "offline"],
  },
  {
    id: "open-webui",
    name: "Open WebUI",
    shelf: "apps",
    summary: "Self-hosted web interface for local and remote models, with users, RAG and tools.",
    reach:
      "Where you land when several people need to share one local model. It brings accounts and permissions, which is the thing the single-user apps deliberately do not have.",
    url: "https://github.com/open-webui/open-webui",
    tags: ["self-host", "multi-user", "web"],
  },
  {
    id: "librechat",
    name: "LibreChat",
    shelf: "apps",
    summary: "Self-hosted multi-provider chat interface with agents, MCP support and per-user keys.",
    reach:
      "The closest open equivalent to a commercial chat product. Reach for it when the requirement is 'our own ChatGPT' with real user management rather than a single shared key.",
    url: "https://github.com/danny-avila/LibreChat",
    tags: ["self-host", "multi-provider", "mcp-client"],
  },
  {
    id: "anythingllm",
    name: "AnythingLLM",
    shelf: "apps",
    summary: "All-in-one desktop and docker app bundling RAG, agents and a vector store.",
    reach:
      "Useful for a demo or a small internal tool where you want document chat working this afternoon. The bundled retrieval is a starting point, not a design.",
    url: "https://github.com/Mintplex-Labs/anything-llm",
    tags: ["rag", "desktop", "batteries-included"],
  },
  {
    id: "zed",
    name: "Zed",
    shelf: "apps",
    summary: "Rust editor with native agent support, multibuffer edits and collaborative sessions.",
    reach:
      "The multibuffer is the relevant feature: an agent's change set across nine files appears as one reviewable surface rather than nine tabs.",
    url: "https://github.com/zed-industries/zed",
    tags: ["editor", "rust", "agent-native"],
  },
  {
    id: "cline",
    name: "Cline",
    shelf: "apps",
    summary: "Open-source autonomous coding agent inside VS Code, model-agnostic, with plan and act modes.",
    reach:
      "The plan/act split is worth copying even if you use something else — an explicit read-only phase before an editing phase catches wrong premises while they are still cheap.",
    url: "https://github.com/cline/cline",
    tags: ["vscode", "agent", "oss", "byok"],
  },
  {
    id: "continue",
    name: "Continue",
    shelf: "apps",
    summary: "Open-source IDE assistant for VS Code and JetBrains, configurable down to the model per task.",
    reach:
      "Reach for it when you want autocomplete on a small local model and chat on a frontier one. Few tools let you split those two budgets.",
    url: "https://github.com/continuedev/continue",
    tags: ["vscode", "jetbrains", "oss", "byok"],
  },

  // --------------------------------------------------------------------- mcp
  {
    id: "mcp-registry",
    name: "Official MCP Registry",
    shelf: "mcp",
    summary:
      "The canonical, API-addressable index of MCP servers, backed by Anthropic, GitHub and Microsoft.",
    reach:
      "Use it for programmatic discovery — it is the only source with a stable API and a verification story. Treat the community directories as search engines over it, not as substitutes.",
    url: "https://github.com/modelcontextprotocol/registry",
    tags: ["registry", "discovery", "official"],
    pick: true,
  },
  {
    id: "mcp-reference-servers",
    name: "Reference servers",
    shelf: "mcp",
    summary:
      "The seven servers still maintained upstream: everything, fetch, filesystem, git, memory, sequential-thinking, time.",
    reach:
      "These are the ones to read when writing your own — they are the executable version of the specification. Filesystem and git are also genuinely useful in production configs.",
    url: "https://github.com/modelcontextprotocol/servers",
    tags: ["reference", "official", "filesystem", "git"],
  },
  {
    id: "mcp-servers-archived",
    name: "servers-archived",
    shelf: "mcp",
    summary:
      "Where the GitHub, GitLab, Postgres, SQLite, Slack, Redis and Google Drive servers went.",
    reach:
      "Listed here as a warning, not a recommendation. Most 'best MCP servers' roundups still link at these paths; they are unmaintained and several have been superseded by first-party servers.",
    url: "https://github.com/modelcontextprotocol/servers-archived",
    tags: ["archived", "deprecated", "warning"],
  },
  {
    id: "github-mcp-server",
    name: "GitHub MCP Server",
    shelf: "mcp",
    summary: "GitHub's own server, available as a remote OAuth endpoint or a local binary.",
    reach:
      "The correct replacement for the archived community GitHub server. Prefer the remote endpoint — it removes token handling from your machine entirely.",
    url: "https://github.com/github/github-mcp-server",
    tags: ["github", "official", "remote", "oauth"],
    pick: true,
  },
  {
    id: "playwright-mcp",
    name: "Playwright MCP",
    shelf: "mcp",
    summary:
      "Microsoft's browser automation server, driving pages through the accessibility tree rather than screenshots.",
    reach:
      "The accessibility-tree approach is why it works: structured page state costs a fraction of what a screenshot costs, and it is deterministic. The right tool for verifying a UI change actually rendered.",
    install: "npx @playwright/mcp@latest",
    url: "https://github.com/microsoft/playwright-mcp",
    tags: ["browser", "official", "testing", "accessibility-tree"],
    pick: true,
  },
  {
    id: "chrome-devtools-mcp",
    name: "Chrome DevTools MCP",
    shelf: "mcp",
    summary: "Exposes the DevTools protocol — performance traces, network, console — to an agent.",
    reach:
      "Where Playwright drives the page, this inspects it. Reach for it on 'why is this slow' rather than 'does this work'.",
    url: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    tags: ["browser", "performance", "debugging", "official"],
  },
  {
    id: "context7",
    name: "Context7",
    shelf: "mcp",
    summary: "Serves current, version-pinned library documentation into the context window.",
    reach:
      "Directly targets the failure where a model writes an API that was removed two versions ago. Worth it in proportion to how fast your dependencies move.",
    url: "https://github.com/upstash/context7",
    tags: ["documentation", "freshness", "grounding"],
  },
  {
    id: "mcp-inspector",
    name: "MCP Inspector",
    shelf: "mcp",
    summary: "Interactive tool for testing and debugging servers without wiring them into a client.",
    reach:
      "The first thing to run when a server 'does not work'. It separates a broken server from a broken client configuration, which is most of the debugging time.",
    install: "npx @modelcontextprotocol/inspector",
    url: "https://github.com/modelcontextprotocol/inspector",
    tags: ["debugging", "official", "development"],
  },
  {
    id: "fastmcp",
    name: "FastMCP",
    shelf: "mcp",
    summary: "Python framework for building servers and clients, now the official Python SDK lineage.",
    reach:
      "The shortest path from a Python function to a tool an agent can call. If you are writing a server rather than installing one, start here.",
    install: "uv add fastmcp",
    url: "https://github.com/jlowin/fastmcp",
    tags: ["sdk", "python", "authoring"],
    pick: true,
  },
  {
    id: "mcp-typescript-sdk",
    name: "TypeScript SDK",
    shelf: "mcp",
    summary: "The official TypeScript implementation of client and server sides of the protocol.",
    reach:
      "Use it when the server has to run in the same process as an existing Node service, or when you need the client side to embed MCP in your own product.",
    install: "npm install @modelcontextprotocol/sdk",
    url: "https://github.com/modelcontextprotocol/typescript-sdk",
    tags: ["sdk", "typescript", "authoring", "official"],
  },
  {
    id: "pulsemcp",
    name: "PulseMCP",
    shelf: "mcp",
    summary: "Hand-reviewed directory of servers with changelogs and use cases.",
    reach:
      "The editorial counterweight to registries that index everything. Useful precisely because a person looked at each entry.",
    url: "https://www.pulsemcp.com",
    tags: ["directory", "curated"],
  },
  {
    id: "smithery",
    name: "Smithery",
    shelf: "mcp",
    summary: "Registry plus hosting: install servers locally by CLI or run them as hosted remotes.",
    reach:
      "The hosting side is the interesting part — it removes 'every developer must install fourteen node processes' from the rollout plan.",
    url: "https://smithery.ai",
    tags: ["directory", "hosting", "remote"],
  },

  // ----------------------------------------------------------------- corpora
  {
    id: "mteb",
    name: "MTEB",
    shelf: "corpora",
    summary:
      "Massive Text Embedding Benchmark: retrieval, clustering, classification, reranking and STS across many languages.",
    reach:
      "Use the leaderboard to build a shortlist of three, never to pick one. Its retrieval half is dominated by general web corpora, so if your documents are contracts or scientific PDFs the ranking is directional at best.",
    url: "https://github.com/embeddings-benchmark/mteb",
    tags: ["embeddings", "leaderboard", "retrieval"],
    pick: true,
  },
  {
    id: "beir",
    name: "BEIR",
    shelf: "corpora",
    summary:
      "Heterogeneous zero-shot retrieval benchmark spanning eighteen datasets, now a subset of MTEB.",
    reach:
      "The zero-shot framing is what makes it useful — it measures generalisation to unseen domains. The catch is contamination: models trained after 2023 have very likely seen these corpora.",
    url: "https://github.com/beir-cellar/beir",
    tags: ["retrieval", "zero-shot", "contamination-risk"],
  },
  {
    id: "ms-marco",
    name: "MS MARCO",
    shelf: "corpora",
    summary: "Large-scale passage and document ranking dataset built from real Bing queries.",
    reach:
      "The training substrate under most open retrieval models. Worth knowing about mainly so you recognise that a model scoring well on it has probably trained on it.",
    url: "https://microsoft.github.io/msmarco/",
    tags: ["retrieval", "ranking", "training-data"],
  },
  {
    id: "hotpotqa",
    name: "HotpotQA",
    shelf: "corpora",
    summary: "Multi-hop question answering with supporting-fact supervision.",
    reach:
      "The standard evidence for 'does the pipeline actually chain facts'. Reach for it before approving a GraphRAG proposal — it is the cheapest way to test whether multi-hop is really your bottleneck.",
    url: "https://hotpotqa.github.io",
    tags: ["multi-hop", "qa", "graphrag-evidence"],
  },
  {
    id: "multihop-rag",
    name: "MultiHop-RAG",
    shelf: "corpora",
    summary: "Retrieval benchmark where answers require evidence from several documents.",
    reach:
      "Closer to enterprise reality than HotpotQA because the hops cross documents rather than paragraphs of the same encyclopaedia.",
    url: "https://github.com/yixuantt/MultiHop-RAG",
    tags: ["multi-hop", "rag", "evaluation"],
  },
  {
    id: "ruler",
    name: "RULER",
    shelf: "corpora",
    summary: "Synthetic long-context benchmark with configurable sequence lengths and task types.",
    reach:
      "The tool for checking a claimed context window against an effective one. Advertised length and usable length routinely differ by an order of magnitude.",
    url: "https://github.com/NVIDIA/RULER",
    tags: ["long-context", "synthetic", "window-claims"],
    pick: true,
  },
  {
    id: "longbench",
    name: "LongBench",
    shelf: "corpora",
    summary: "Bilingual multi-task benchmark for long-context understanding on realistic documents.",
    reach:
      "Pair it with RULER: RULER tells you where retrieval inside the window breaks, LongBench tells you whether comprehension survives on real text.",
    url: "https://github.com/THUDM/LongBench",
    tags: ["long-context", "bilingual", "evaluation"],
  },
  {
    id: "swe-bench",
    name: "SWE-bench",
    shelf: "corpora",
    summary: "Real GitHub issues with the tests that verify a fix, plus a human-validated subset.",
    reach:
      "The Verified subset is the only one worth quoting; the full set contains under-specified issues. Note that it measures patch generation on Python repositories, not general engineering.",
    url: "https://github.com/SWE-bench/SWE-bench",
    tags: ["agents", "coding", "verified-subset"],
  },
  {
    id: "terminal-bench",
    name: "Terminal-Bench",
    shelf: "corpora",
    summary: "Benchmark for agents operating in a real terminal against containerised tasks.",
    reach:
      "Measures the thing the agents on the first shelf actually do — run commands, read output, recover. Closer to your workload than a patch-generation score.",
    url: "https://github.com/laude-institute/terminal-bench",
    tags: ["agents", "terminal", "sandboxed"],
  },
  {
    id: "tau-bench",
    name: "τ-bench",
    shelf: "corpora",
    summary: "Tool-agent-user benchmark with domain policies and a simulated user.",
    reach:
      "The rare benchmark that scores policy compliance rather than task completion — it asks whether the agent followed the rules it was given, which is the governance question.",
    url: "https://github.com/sierra-research/tau-bench",
    tags: ["agents", "tool-use", "policy-compliance"],
  },
  {
    id: "bfcl",
    name: "Berkeley Function Calling Leaderboard",
    shelf: "corpora",
    summary: "Evaluates function and tool calling across single, parallel, multiple and irrelevance cases.",
    reach:
      "The irrelevance category is the useful one: it measures whether a model correctly declines to call anything. That failure mode costs more in production than a wrong argument.",
    url: "https://github.com/ShishirPatil/gorilla",
    tags: ["tool-use", "function-calling", "leaderboard"],
  },
  {
    id: "gaia",
    name: "GAIA",
    shelf: "corpora",
    summary: "General assistant benchmark of questions that are easy for humans and hard for models.",
    reach:
      "Its value is the asymmetry — near-ceiling human performance means a low score is a real capability gap rather than an ambiguous question.",
    url: "https://huggingface.co/datasets/gaia-benchmark/GAIA",
    tags: ["agents", "general", "tool-use"],
  },
  {
    id: "fineweb",
    name: "FineWeb",
    shelf: "corpora",
    summary: "Cleaned and deduplicated web corpus derived from Common Crawl, with an educational subset.",
    reach:
      "The reference for what serious web-scale filtering looks like. Read the filtering methodology even if you never touch the data — most in-house pipelines skip steps it proves matter.",
    url: "https://huggingface.co/datasets/HuggingFaceFW/fineweb",
    tags: ["pretraining", "web-scale", "filtering"],
  },
  {
    id: "common-crawl",
    name: "Common Crawl",
    shelf: "corpora",
    summary: "Petabyte-scale open web crawl, published monthly since 2008.",
    reach:
      "Almost never the right thing to use raw. It is the upstream of nearly every open corpus, which makes it the place to check provenance claims.",
    url: "https://commoncrawl.org",
    tags: ["web-scale", "raw", "provenance"],
  },
  {
    id: "the-stack-v2",
    name: "The Stack v2",
    shelf: "corpora",
    summary: "Permissively licensed source code across hundreds of languages, with opt-out honoured.",
    reach:
      "The licence-aware option for code data. The opt-out mechanism is the part that matters if anyone in legal is going to ask where the training data came from.",
    url: "https://huggingface.co/datasets/bigcode/the-stack-v2",
    tags: ["code", "licensing", "opt-out"],
  },
  {
    id: "pubmed-central",
    name: "PubMed Central OA",
    shelf: "corpora",
    summary: "Open-access subset of the biomedical literature, full text, bulk downloadable.",
    reach:
      "The standard corpus for biomedical retrieval work, and a good stress test for parsing — dense tables, figures and references break naive chunkers immediately.",
    url: "https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/",
    tags: ["biomedical", "domain-data", "full-text"],
  },
  {
    id: "sec-edgar",
    name: "SEC EDGAR",
    shelf: "corpora",
    summary: "Every filing by every US public company, with a documented full-text search API.",
    reach:
      "The best free corpus for financial retrieval, and a realistic one: structured XBRL alongside prose, with genuine numeric questions that a vector search alone will get wrong.",
    url: "https://www.sec.gov/edgar/sec-api-documentation",
    tags: ["financial", "domain-data", "structured", "api"],
  },
  {
    id: "courtlistener",
    name: "CourtListener",
    shelf: "corpora",
    summary: "Millions of US court opinions and dockets with a free API, from the Free Law Project.",
    reach:
      "Legal text is where citation grounding gets tested properly — the documents cite each other, so a hallucinated reference is checkable rather than plausible.",
    url: "https://www.courtlistener.com/help/api/rest/",
    tags: ["legal", "domain-data", "citations", "api"],
  },
  {
    id: "openalex",
    name: "OpenAlex",
    shelf: "corpora",
    summary: "Open catalogue of scholarly works, authors and institutions, with a full snapshot and API.",
    reach:
      "The citation graph is the draw. It is one of the few realistic public datasets where graph retrieval genuinely beats vector search, which makes it the honest place to test that claim.",
    url: "https://docs.openalex.org",
    tags: ["scholarly", "graph", "domain-data", "api"],
  },
  {
    id: "wikipedia-dumps",
    name: "Wikipedia dumps",
    shelf: "corpora",
    summary: "Complete, versioned exports of every Wikipedia language edition.",
    reach:
      "The default demo corpus, and the reason so many retrieval demos look better than they are: it is clean, well-structured and almost certainly in the model's weights already.",
    url: "https://dumps.wikimedia.org",
    tags: ["general", "demo-corpus", "contamination-risk"],
  },
];

export const kitByShelf = (id: string) => kit.filter((k) => k.shelf === id);
