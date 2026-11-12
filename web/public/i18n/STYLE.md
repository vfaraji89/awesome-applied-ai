# Translations: rules and status

One folder per language (`en`, `tr`, `es`, `nl`, `ja`), each with one `site.json`.
`en/site.json` is the reference: the code renders the same English on the server, so it is
never fetched, and a key missing from a translation falls back to English, never to a blank.
Keys starting with `_` are notes and are never shown. `{n}`-style placeholders are filled in
by the page; keep every placeholder and every `<b>`, `<mark>`, `<a>` tag in the translation.

The language choice is stored under the same key as vfaraji89.github.io (`vf-lang`), so a
language picked on one site carries over to the other.

Translated: navigation, section and page names, every page heading and lead, the footer, the
consent pill, the "more" toggles, the radar's labels, the skill map and the whole Role fit check.
Radar entries, tools, jargon, problems and docs stay in English for now (a note under the
language picker says so). Role titles stay in English: they are the job titles used in postings.
The Role fit check reads **English** text, and each language says so.

## Principle: meaning, not words
Each string is rewritten the way a native speaker in tech would say it, not translated word for
word: natural collocations (TR *iş piyasası*, ES *mercado laboral*, NL *arbeidsmarkt*, JA
*採用市場*), each language's usual headline rhythm, and the terms practitioners actually use.
Where a field keeps the English word (harness, evals, embeddings, forward deployed engineer),
it stays in English rather than being forced into a literal coinage. No em dashes, and nothing
is added that the English does not say.

## Review flags
Each translation file has a `_review` block: the keys where a judgment call was made (a term,
a register, an idiom), each with a one-line note. It is never shown on the site. Confirm or
change the value, then delete that line; when the block is empty, delete it and set `_status`.

## Status
| Language | Standard followed | Register | Review |
| --- | --- | --- | --- |
| Türkçe | [TDK Yazım Kılavuzu](https://tdk.gov.tr) | siz | Draft. Vahid reviews as a native speaker. |
| Español | [RAE y ASALE, *Ortografía* (2010)](https://www.rae.es) | tú, neutral international | Draft. Vahid reviews. |
| Nederlands | [Taalunie *Woordenlijst*](https://woordenlijst.org), [Taaladvies](https://taaladvies.net) | je | Draft. **Needs a native Dutch reviewer.** |
| 日本語 | 文化庁「公用文作成の考え方」(2022), JTF日本語標準スタイルガイド | です・ます調 | Draft. **Needs a native Japanese reviewer.** |

These drafts were written string by string for their context by an AI assistant (Claude),
following the standards above, and use the same terms as the portfolio's translations. That is
not a review: change a file's `_status` only once a native speaker has signed it off.

## Rules applied
- **Türkçe:** apostrophe before suffixes on abbreviations (*API'ler*, *YZ'ye*); *yapay zekâ*;
  the percent sign before the number (*%40*); no suffix is attached directly to a `{placeholder}`.
- **Español:** opening ¿ and ¡; sentence case; a space before % (*40 %*), per the RAE;
  *IA* for the acronym, *costo*, *ajuste fino*; quotation marks « ».
- **Nederlands:** compounds in one word, a hyphen after an acronym (*AI-functies*, *applied-AI-rol*);
  *cv* in lower case; plural *API's*.
- **日本語:** です・ます調。全角の句読点と括弧、和文と英数字の間にスペースを入れない、
  外来語はカタカナ、AI・MCP・ROIなどの略語は半角英字。列挙は「、」で区切る（`rf.and`）。

## Adding a key or a language
1. Use `<T k="…">English</T>`, `<TH k="…">English with <b>markup</b></TH>` or `t("…", "English")`
   from `src/i18n/lang.tsx`, add the key to `en/site.json`, then to each language.
2. For a new language, copy `en/`, translate, and add it to `LANGS` in `src/i18n/lang.tsx`
   and in the portfolio's `assets/brand/i18n.js`, with its sign letter.
