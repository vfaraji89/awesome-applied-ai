# awesome-applied-ai

**Applied AI, mapped.** Learn how AI systems really work, one animation at a time.

→ https://vfaraji89.github.io/awesome-applied-ai/

| Section | What is in it |
|---|---|
| **Learn** | Animated courses: applied AI from zero, data problems, the stack layer by layer (lessons going live one at a time) |
| **Jargon** | 121 terms in plain language, as flip cards: the meaning on the front, the deeper answer and the interview question on the back |
| **Architecture** | The six layers of an AI-native system, one request animated through them, and the agent harness |
| **Tools** | 133 tools per layer, with licence and production maturity |
| **Roles** | Six applied AI roles: what each owns, the layers it works on, the tools it reaches for |
| **Problems** | 20 common problems, asked the way a team would ask them, with worked answers |

## Run it

```bash
cd web
bun install
bun run dev      # http://localhost:3000
bun run build    # static export in web/out
```

Problems are written in `system-design.md` and compiled into `web/src/data/` on every build.
Tools, jargon, roles and courses live in `web/src/data/*.ts`.

Curated by [Vahid Faraji](https://vfaraji89.github.io/).
