# Maintaining awesome-applied-ai

## How it fits together

```
public job boards ──► pipeline/ (Bun, no dependencies) ──► market/jobs.json      all-time store
   daily, 05:17 UTC        │                              market/weekly/*.json  one file per ISO week
                           └────────────────────────────► web/src/data/market.json  summary the site shows
                                                                    │
web/ (Next.js static export) ◄──────────────────────────────────────┘
        │  bun run build
        ▼
GitHub Pages  https://vfaraji89.github.io/awesome-applied-ai/
```

Two workflows in `.github/workflows/`:

| Workflow | Runs | Does |
|---|---|---|
| `market.yml` (Track job market) | daily at 05:17 UTC, or by hand | reads the boards, updates the store, the summary and this week's snapshot, commits to `main` |
| `pages.yml` (Deploy web) | on a push to `main` that touches `web/`, and after every tracker run | builds the site and publishes it |

## How the data is collected

1. **Read.** `pipeline/sources.ts` calls public JSON endpoints: company boards on Greenhouse, Lever and Ashby (listed in `pipeline/companies.json`), plus Remotive, Arbeitnow and the Hacker News "Who is hiring?" thread. No scraping of pages, no logins. Boards that forbid automated reading are not used.
2. **Filter.** `pipeline/taxonomy.ts` keeps technical AI roles by title.
3. **Classify.** Each role gets a role family, a level, skills and tools.
4. **Reduce.** Only a hashed id, the normalised title, role, level, skills, tools, a remote flag and two dates are kept. No posting text, link or company name is stored. This is a tracker, not a job board.
5. **Merge.** New roles are added with `firstSeen`; roles still listed get `lastSeen` moved to today. A role that disappears keeps its last date, so history is never lost.
6. **Summarise.** The summary for the site and the snapshot for the current week are rewritten.
7. **Role fit.** At build time `web/scripts/build-fit.ts` turns `market/jobs.json` into per-role skill and tool shares for `/fit/` (`web/src/data/role-fit.json`, not committed). It reads CVs with the tracker's own patterns from `pipeline/taxonomy.ts`. The same page audits a pasted job description against similar postings. Gaps link to pages on this site listed in `web/src/data/learn.ts`; the build checks every one of those links and stops if one points at nothing.
8. **Skill map.** The same script writes `web/src/data/skill-graph.json` (not committed) for `/skills/`: each posting's skills as a 12-bit mask, pair counts and lift. Nothing to edit by hand; it follows the tracker.

`/radar/` (the emerging tech radar) is written by hand in `web/src/data/radar.ts`, with sources per entry; links from it into the site are checked at build time like the learning links. Review the rings every quarter: move what has proven itself inward, drop what stalled. Rewrite the `quarter` brief at the top of `radar.ts` at the same time.

`/labs/` (what Anthropic, OpenAI and Google ask for) is written by hand in `web/src/data/labs.ts` from public postings, with sources and a date. Refresh it every few months.

## Safety built in

- If no source answers, or fewer than half of yesterday's open roles come back, the run stops, writes nothing and fails. The site keeps yesterday's numbers.
- On a branch, the tracker only does a dry run. It commits only on `main`.
- Third-party build actions are pinned to exact commits.

## Routine

**Weekly, 5 minutes**
- Open the Actions tab. Seven green "Track job market" runs means all is well.
- Open the last run's log. Lines starting `FAIL` name a board that moved or closed. Fix or remove its slug in `pipeline/companies.json`.
- Read `/market/note/` and post it if you like.

**Monthly, 20 minutes**
- `cd web && bun update --latest && bun run build`, then `bun audit`. Commit if the build passes.
- Add two or three company boards to `pipeline/companies.json` to widen coverage.
- Skim the top titles on `/market/`. A title that is not a technical AI role means a filter in `pipeline/taxonomy.ts` needs tightening.

**When something breaks**
- *Tracker run failed with "Stopped":* a source or the network was down. Re-run it from the Actions tab.
- *Deploy stuck:* re-run "Deploy web". Deploys never cancel each other.
- *Numbers look wrong after a taxonomy change:* run `bun pipeline/weekly.ts` to rebuild the weekly files from the store.

## Run it yourself

```
bun pipeline/run.ts --dry   # read and report, write nothing
bun pipeline/run.ts         # read, merge, write
bun pipeline/weekly.ts      # rebuild every weekly snapshot from the store
cd web && bun install && bun run dev
```

## Where content lives

| To change | Edit |
|---|---|
| Sections, order and menu | `web/src/lib/structure.ts` |
| Roles, tasks, skills, certificates | `web/src/data/framework.ts` |
| Jargon terms | `web/src/data/dictionary.ts` |
| Tools | `web/src/data/tools.ts`, `web/src/data/stack.ts` |
| Problems | `web/src/data/problems.ts` |
| Docs | `web/src/data/docs.ts` and `web/src/components/` |
| Boards to track | `pipeline/companies.json` |
