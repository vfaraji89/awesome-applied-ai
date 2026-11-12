# awesome-applied-ai

**Applied AI, mapped.** Learn how AI systems really work, one animation at a time.

The companion site to the book *Applied AI, Simplified* (in progress). This repository is private and all rights are reserved: see [LICENSE](LICENSE).

→ https://vfaraji89.github.io/awesome-applied-ai/

| Section | What is in it |
|---|---|
| **Learn** | Animated courses: applied AI from zero, data problems, the stack layer by layer (lessons going live one at a time) |
| **Jargon** | 121 terms in plain language, as flip cards: the meaning on the front, the deeper answer and the interview question on the back |
| **Architecture** | The six layers of an AI-native system, one request animated through them, and the agent harness |
| **Tools** | 133 tools per layer, with licence and production maturity |
| **Roles** | Six applied AI roles: what each owns, the layers it works on, the tools it reaches for |
| **Problems** | 20 common problems, asked the way a team would ask them, with worked answers |
| **Market** | What the applied AI job market asks for: roles, levels, titles, skills and tools, updated weekly |

## Run it

```bash
cd web
bun install
bun run dev      # http://localhost:3000
bun run build    # static export in web/out
```

Problems are written in `system-design.md` and compiled into `web/src/data/` on every build.
The radar, tools, jargon and the tracker's company list are edited in a Google Sheet and synced by pull request (see [CONTENT.md](CONTENT.md)). Roles, layers and courses live in `web/src/data/*.ts`.

## The market tracker

`pipeline/` reads public job boards once a day (company boards on Greenhouse, Lever, Ashby and Workday, listed in `pipeline/companies.json`; Remotive; Arbeitnow; Hacker News "Who is hiring?"), keeps the AI roles and reduces each to its role, level, skills and tools. It is not a job board: no posting, link, description or company is stored or shown. `bun pipeline/run.ts --dry` reports without writing.

© 2026 [Vahid Faraji](https://vfaraji89.github.io/). All rights reserved.
