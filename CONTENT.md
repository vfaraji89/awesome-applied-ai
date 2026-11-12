# Content sheet: editing the site from Google Sheets

The radar, the tool map, the jargon and the tracker's list of company job boards are
edited in one Google Sheet. A GitHub Action reads it daily (or on demand), validates
every row, runs the site's own checks, and opens a pull request. **Nothing reaches the
site until that pull request is merged**, so a typo in the sheet can never break it.

```
Google Sheet ──(daily or "Run workflow")──▶ validate rows ──▶ typecheck + link checks ──▶ pull request ──▶ merge ──▶ site
```

## Tabs
| Tab | Becomes | Notes |
| --- | --- | --- |
| `companies` | `pipeline/companies.json` | `ats`: greenhouse, lever, ashby or workday. `slug`: the board name in its public URL. Workday rows also need `host` (e.g. wd5) and `site`. |
| `radar` | `web/src/data/content/radar.json` | `area`, `ring` are dropdowns. `examples`, `sources`: one link per line, `label \| https://…`. `more`: links on this site, `label \| /path/`. |
| `radar_quarter` | the "in brief" panel | One row per point; every row names the same quarter. |
| `settings` | | `radar_checked`: the date the radar was last reviewed, `YYYY-MM-DD`. |
| `tools` | `web/src/data/content/tools.json` | `layer`, `model`, `maturity`, `deployment`, `kind`, `status` are dropdowns. `tags`: comma separated. |
| `jargon` | `web/src/data/content/jargon.json` | `field` is a dropdown. `also`, `tags`: comma separated. `link_href`: https://… or /path/. |
| `jargon_fields` | the groups on /jargon/ | |

Rules the sync enforces: required cells filled, dropdown values valid, ids unique and
lowercase-with-hyphens, links https or a path on this site. A failure names the tab and row,
and nothing is written. The site's own checks then confirm every internal link resolves.

## One-time setup
1. In Google Sheets: **File → Import → Upload** `awesome-applied-ai-content.xlsx`
   (or regenerate the CSVs with `bun scripts/content.ts export`), "Create new spreadsheet".
2. **Share → General access → Anyone with the link → Viewer.** Editors are only the people you add.
3. Copy the sheet id: the long part of its URL between `/d/` and `/edit`.
4. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**,
   name `CONTENT_SHEET_ID`, value the id. It is stored encrypted and never appears in the repo or logs.
5. **Settings → Actions → General → Workflow permissions:** tick
   "Allow GitHub Actions to create and approve pull requests".
6. **Actions → Sync content from the Google Sheet → Run workflow** to try it.

## Commands
```bash
bun scripts/content.ts export [dir]          # repo -> one CSV per tab
CONTENT_SHEET_ID=… bun scripts/content.ts pull --dry   # validate the sheet, write nothing
bun scripts/content.ts pull --from <dir>     # import local CSVs (offline edits, tests)
```

## What stays in code
Layers, problems, roles, the skills framework, learning paths and the labs page are still
edited in `web/src/data/*.ts`: they are fewer, change rarely, and lean on code (formulas,
diagrams). Job postings are collected by the tracker, never typed in.
