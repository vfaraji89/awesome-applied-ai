---
license: cc-by-4.0
pretty_name: "Applied AI job ads: what employers ask for"
language: [en]
tags: [jobs, labour-market, applied-ai, skills, ai-engineering]
size_categories: ["1K<n<10K"]
configs:
  - config_name: default
    data_files: applied-ai-job-ads.csv
---

# Applied AI job ads: what employers ask for

One row per AI job ad, with what the ad asks for: the role, the level, the skills, the tasks, the
tools, the general stack and the years of experience, read from public company career pages every
day by the tracker behind [Applied AI, Simplified](https://vfaraji89.github.io/applied-ai-simplified/market/).

**Version 2026-11-13** · 2,488 ads published row by row, 2,862 ads in the monthly totals · seen up to 2026-11-13

## Files

| File | What |
|---|---|
| `applied-ai-job-ads.csv` | one row per ad (lists joined with `;`) |
| `applied-ai-job-ads.json` | the same rows as JSON, lists as arrays |
| `monthly-totals.csv` | ads per month and role, from every source including job boards |
| `meta.json` | version, counts, span and DOI |

## Columns

| Column | Meaning |
|---|---|
| `id` | a hash of the platform and the ad's own id, stable across versions; not reversible to the ad |
| `platform` | the hiring platform the company's career page runs on |
| `posted` | the publish date the platform gives, when it gives one |
| `first_seen`, `last_seen` | the first and last day the tracker found the ad listed |
| `role` | one of eight applied AI roles, set from the job title |
| `seniority` | Junior, Mid, Senior, Staff+ or Lead, set from the job title |
| `remote` | the platform marks the ad remote |
| `ai_lab` | read from an AI lab's or model provider's own career page |
| `years_asked` | the smallest years of experience the ad asks for, when it says |
| `skills` | which of twelve applied AI skills the requirements ask for |
| `tasks` | what the ad asks you to do, from twelve tasks (empty when the ad had no readable description) |
| `tools` | named tools and products (models, frameworks, clouds, vector stores...) |
| `tools_preferred` | the tools named only as nice to have |
| `stack` | the general stack, as `category:name` (`lang:Python`, `front:React`...) |

Roles, skills and tasks are defined on the [method page](https://vfaraji89.github.io/applied-ai-simplified/market/method/), with how each is read and how
often the reading is wrong, measured by hand on a sample every month.

## What is not here, and why

- **No title, company, link or ad text.** The tracker never stores ad text; titles and companies stay out
  so the data describes the market, not single employers or people.
- **Job boards and Hacker News appear only in `monthly-totals.csv`.** Their terms limit redistribution,
  so their ads are counted but not published row by row.

## Rows by platform

- greenhouse: 1,029
- ashby: 668
- workday: 430
- smartrecruiters: 212
- lever: 144
- workable: 5

## Known limits

- Mostly English-language ads, from companies whose career pages run on the platforms above: tech
  companies and the US are over-represented.
- Role and level come from the title alone; skills and tasks from keyword rules on the requirements.
  The error rates are on the method page.
- Tracking began on 7 November 2026; earlier ads are included only if they were still listed then.
- Some platforms give an evergreen ad's original publish date, years back; `posted` keeps it as given,
  so filter on `first_seen` for what was open in a period.

## Licence and citation

[CC BY 4.0](LICENSE): use it for anything, including commercial work, with credit. Please cite:

> Faraji, V. (2026). Applied AI job ads: what employers ask for (version 2026-11-13) [Data set]. https://vfaraji89.github.io/applied-ai-simplified/market/method/

The website, its text and its code are not covered by this licence.
