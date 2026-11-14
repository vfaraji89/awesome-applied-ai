# Applied AI, Simplified

**Applied AI is made to sound harder than it is.** This site says it plainly: what the job market asks for, the roles and skills, the people who build it, the events, the tools and the docs.

The companion site to the book *Applied AI, Simplified* (in progress), in English, Turkish, Spanish, Dutch and Japanese.

→ https://vfaraji89.github.io/applied-ai-simplified/

This repository is private and not open source: all rights are reserved (see [LICENSE](LICENSE)). The one exception is the open dataset, under CC BY 4.0.

## What is on the site

| Section | What is in it |
|---|---|
| **Market** | What applied AI job ads ask for, read daily from company career pages and public job boards: roles, levels, skills, tasks and tools. Also Role fit (your CV against the market), the labs side by side, a weekly note, every source read, and the method and data page |
| **Roles & skills** | Role families, a skills matrix, the skill map and the tasks each role does |
| **People** | Builders and researchers, not famous names, plus Quiet builders: good ideas with little stage time. Also the companies hiring, building and on stage |
| **Events** | A calendar of applied AI events on official dates only (ACM conferences included), and what conference stages talk about against what jobs ask for |
| **AI-native architect** | The role, six architecture layers, problems teams hit with worked answers, and the emerging tech radar |
| **Tools** | The tool map: 600+ tools in eleven areas, with licence, maturity and what launched recently |
| **Learn** | Docs in motion (Claude Platform, MCP), jargon in plain words, Coined & decoded (who coined the new words), and industry certificates |

## Repository layout

| Path | What it holds |
|---|---|
| `web/` | The Next.js site, exported as static files to `web/out` |
| `web/src/data/` | Site data: hand-written `.ts` files, and `.json` files written by the pipelines |
| `web/public/i18n/` | Translations, one `site.json` per language; `_review` lists lines to confirm |
| `pipeline/` | The data pipelines: job market, dataset, eval scoring, conferences, people, companies, docs watch, tool discovery |
| `dataset/` | The open monthly dataset (CC BY 4.0): one row per ad, derived fields only |
| `eval/` | The hand-labelling tool and monthly samples used to measure error rates |
| `conferences/` | Speaker and organisation candidates from conference archives |
| `reports/` | Monthly report drafts, ready for Substack |
| `system-design.md` | The problems, compiled into the site on every build |
| `brand/` | Brand kit source |

## Run it

```bash
cd web
bun install
bun run dev      # http://localhost:3000
bun run build    # copies the dataset, builds data files, then a static export in web/out
```

## Automation

| Workflow | When | What it does |
|---|---|---|
| Sync content from the Google Sheet | daily | Tools, jargon, radar and the tracker's company list, by pull request ([CONTENT.md](CONTENT.md)) |
| Track job market | daily | Reads every source, classifies AI ads, refreshes the market and companies data |
| Find new tools | weekly | Suggests tools launched recently |
| Publish the dataset | 1st of the month | Builds the dataset and the monthly report; publishes to Zenodo, Hugging Face and Kaggle when their secrets are set |
| Eval sample | 2nd of the month | Draws ads to label by hand; scores them when labels are pushed |
| Watch the docs' sources | 2nd of the month | Flags docs whose sources changed |
| Track conferences | 3rd of the month | Conference talks and speakers, then the people pages |
| Deploy web | on push to `main` | Builds and publishes to GitHub Pages; the base path comes from the repo name |
| Secret scan | on push | Blocks committed secrets |

Secrets used: `ZENODO_TOKEN`, `HF_TOKEN`, `KAGGLE_USERNAME`, `KAGGLE_KEY` (all optional; each publish step is skipped without its secret).

## The market tracker

`pipeline/run.ts` reads company career pages (Greenhouse, Lever, Ashby, Workday and others, listed in `pipeline/companies.json`) and public job boards once a day, keeps technical AI roles, counts reposts once, and reduces each ad to its role, level, skills, tasks and tools. It is not a job board: ad text is never published, and the open dataset has no title, company or link columns. `bun pipeline/run.ts --dry` reports without writing. How ads are classified, and how often it is wrong, is on the site's method page.

## The open dataset

Monthly, one row per AI job ad from company career pages, derived fields only. Download it from the [method page](https://vfaraji89.github.io/applied-ai-simplified/market/method/) (served by the site under `/dataset/`), or from Zenodo, Hugging Face and Kaggle once published. Licence: CC BY 4.0, for the dataset only ([dataset/LICENSE](dataset/LICENSE)).

## More

- [MAINTAINING.md](MAINTAINING.md): the weekly and monthly routine
- [CONTENT.md](CONTENT.md): editing content in the Google Sheet
- [ANALYTICS.md](ANALYTICS.md): analytics and consent

© 2026 [Vahid Faraji](https://vfaraji89.github.io/). All rights reserved.
