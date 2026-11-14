# Checking the tracker by hand

The tracker classifies job ads with rules (`pipeline/taxonomy.ts`, `pipeline/extract.ts`). This folder
measures how often those rules are wrong, so the numbers on the site come with an error rate.

## The monthly loop

1. **Sample.** The *Eval sample* workflow draws ads to check: 80% from the ads the rules kept as AI
   job ads, spread across roles, and 20% from tech ads the AI rule left out. Run it by hand for the
   first 200 (Actions → Eval sample → Run workflow); on the 2nd of each month it draws 50 more.
   It writes `sample-YYYY-MM.json`: each ad's title, company, link and what the rules decided.
   No ad text is stored; you read each ad at its source.
2. **Label.** `bun eval/label.ts` opens a page on http://localhost:4321. It is blind: it never shows
   what the rules decided. For each ad: is it an AI job ad, its role, its level, the skills its
   requirements ask for and the tasks it describes. Keys: Y, N, G (ad gone), Enter to save and move on.
   Answers are saved at once to `labels-YYYY-MM.json`.
3. **Score.** Push the labels to main: the workflow runs `bun pipeline/eval-score.ts`, which writes
   `web/src/data/eval.json`, and the method page shows the rates with their 95% ranges.

## What is measured

- **Kept correctly**: of the ads kept as AI job ads, the share that really are.
- **Missed**: of the tech ads the AI rule left out, the share that were AI job ads after all.
- **Role** and **level**: the share the rules got right, and the most common mix-ups.
- **Skills** and **tasks**: precision (what the rules found was really asked) and recall (what was
  asked and the rules found), overall and per skill or task.

Ads that are gone by the time you read them are left out of every rate.
