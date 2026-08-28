# awesome-applied-ai

A working map of the applied AI stack: six layers, the equations that decide an
architecture, and an index of what is actually in production.

**[vfaraji89.github.io/awesome-applied-ai](https://vfaraji89.github.io/awesome-applied-ai)**

Not a link dump. Every index entry carries a maturity rating and a deployment
model, most carry a note saying when the thing breaks, and the equations carry
the assumption that fails in practice rather than only the formula.

## What is in it

| | |
|---|---|
| 133 | index entries, rated for maturity and deployment |
| 130 | defined terms |
| 136 | commands |
| 20 | design problems, worked end to end |
| 20 | equations, each with its failure mode |
| 78 | kit entries |
| 16 | cycle stages |
| 6 | layers |
| 5 | case studies with measured numbers |

## The six layers

The spine of the taxonomy. Each answers one question.

| Layer | The question it answers |
|---|---|
| **Guardrails & Governance** | What stops this from causing harm, and who signs off? |
| **Evaluation & Observability** | How do you tell a good trajectory from a lucky answer? |
| **Orchestration & Protocols** | What runs the loop, and how does it survive a crash? |
| **Caching & Context Optimization** | What does each token cost, and is it earning its place? |
| **Memory & State** | What should the system still know tomorrow? |
| **Retrieval** | Where does the evidence come from, and is it the right evidence? |

## What it is opinionated about

The index records status, not just existence. A tool marked `deprecated` or
`stalled` stays listed, labelled, because knowing a thing is dead is worth more
than not finding it. Most MCP server roundups still link to archived
repositories; the GitHub, GitLab, Postgres, SQLite, Slack, Redis and Drive
reference servers were moved to an archive and several have first-party
replacements.

The equations are the part that earns the repo. Three examples:

- Ten million 1536-dimension vectors at m = 16 want roughly 63 GB resident.
  That figure picks your architecture. Query latency does not.
- At a 90 percent cache hit rate on a five minute window, input spend falls
  78.5 percent. Hit rate is a larger lever than the model you chose.
- Twenty steps at 99 percent each succeed 81.8 percent of the time. At 95
  percent each, 35.8 percent. No amount of prompting closes that.

Layered guardrails are written up the same way: three filters at 30 percent
attack success rate each multiply to 2.7 percent on paper, and independence is
the assumption that fails.

## Layout

```
system-design.md      the long-form design document
stack.md              the stack notes
web/                  Next.js app, deployed to GitHub Pages
  src/data/           the taxonomy: tools, dictionary, commands, kit,
                      layers, problems, cycle, shipped
  src/app/            17 routes
  scripts/            build-problems.mjs, runs before next build
```

The data files are plain TypeScript with typed records. `src/lib/types.ts` is
the schema.

## Running it

```bash
cd web
npm ci
npm run dev      # regenerates problem data, then next dev
npm run build    # static export to web/out
```

Deploys from `main` on any change under `web/` or to `system-design.md`.

## How an entry is judged

An index entry needs a maturity rating and a deployment model before it goes
in. `production-common` means it is boring and widely run; `fragile` means it
works and will surprise you. A note is expected wherever the summary would
otherwise read as an endorsement.

Corrections are more welcome than additions. If something here is out of date,
that is the bug.

## Author

Vahid Faraji, Applied AI. [vfaraji89.github.io](https://vfaraji89.github.io)
