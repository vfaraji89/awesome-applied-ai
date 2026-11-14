import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { M, sitesRead } from "@/lib/market-data";
import { fRoles, skills } from "@/data/framework";
import ev from "@/data/eval.json";
import ds from "@/data/dataset-meta.json";

export const metadata: Metadata = { ...share("market/method"), title: "Method and data", description: "How the job-ad tracker reads, counts and classifies AI job ads, how often it is wrong (measured by hand every month), what it never stores, and the open dataset to download and cite." };

type Rate = { pct: number | null; low: number | null; high: number | null; k: number; n: number };
type Multi = { precision: Rate; recall: Rate; per: { id: string; precision: Rate; recall: Rate; asked: number }[] };
type Month = { month: string; sampled: number; labelled: number; gone: number; scored: boolean; kept?: Rate; missed?: Rate; role?: Rate & { confusions: { said: string; was: string; n: number }[] }; seniority?: Rate; skills?: Multi; tasks?: Multi };

const REPO = "https://github.com/vfaraji89/applied-ai-simplified";
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? (id === "other-ai" ? "Other AI role" : id);
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

function RateRow({ k, en, r, note }: { k: string; en: string; r?: Rate; note?: React.ReactNode }) {
  if (!r || r.pct === null) return null;
  return (
    <li className="md-rate">
      <span className="md-rate-l"><b><T k={k}>{en}</T></b>{note && <span className="muted">{note}</span>}</span>
      <span className="md-rate-bar" aria-hidden="true"><i className="md-range" style={{ left: `${r.low}%`, width: `${(r.high ?? 0) - (r.low ?? 0)}%` }} /><i className="md-dot" style={{ left: `${r.pct}%` }} /></span>
      <span className="md-rate-n"><b>{r.pct}%</b> <span className="count">{r.low}–{r.high}% · n {r.n}</span></span>
    </li>
  );
}

export default function Method() {
  const months = (ev as { months: Month[] }).months;
  const last = [...months].reverse().find((m) => m.scored);
  const pending = [...months].reverse().find((m) => !m.scored);
  const csv = `${REPO}/raw/main/dataset/applied-ai-job-ads.csv`;
  const steps = [
    { n: "01", k: "md.s1", en: "Read", line: <T k="md.s1_l" vars={{ n: sitesRead }}>{"{n} company career pages and job boards, once a day, through their public job feeds."}</T> },
    { n: "02", k: "md.s2", en: "Keep", line: <T k="md.s2_l">Only ads whose title names an AI role, and only technical ones: no sales, marketing, recruiting or legal titles.</T> },
    { n: "03", k: "md.s3", en: "Count once", line: <T k="md.s3_l" vars={{ n: (M as unknown as { reposts?: number }).reposts ?? 0 }}>{"An ad carried by a job board and the company's own page counts once: {n} reposts dropped in the latest run."}</T> },
    { n: "04", k: "md.s4", en: "Read the ad", line: <T k="md.s4_l">Role and level from the title; skills, tasks, tools, stack and years from the requirements, with benefits and boilerplate set aside.</T> },
    { n: "05", k: "md.s5", en: "Keep only the answers", line: <T k="md.s5_l">The ad text is read and dropped. What stays is the role, level, skills, tasks, tools and dates.</T> },
    { n: "06", k: "md.s6", en: "Check by hand", line: <T k="md.s6_l">Every month a sample is labelled by hand, blind to what the rules decided, and the error rates below are recomputed.</T> },
  ];
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="market" page="Method and data" />
          <h1 style={{ marginTop: 12 }}><TH k="md.h1">How the numbers are made, and <mark>how wrong they are</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><T k="md.lead">Every number on this site comes from rules that read job ads. Here is what they read, what they decide, what they never keep, how often they get it wrong, and the data itself to download and check.</T></p>
          <ol className="md-steps">
            {steps.map((s) => (
              <li key={s.n} className="frame"><span className="md-n">{s.n}</span><b><T k={s.k}>{s.en}</T></b><span className="muted">{s.line}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="accuracy" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="md.k_acc">Accuracy</T></span>
          <h2 style={{ marginTop: 10 }}><T k="md.h_acc">How often the rules are wrong</T><span className="dot">.</span></h2>
          {last ? (
            <>
              <p className="muted" style={{ marginTop: 8, maxWidth: "72ch" }}><T k="md.acc_p" vars={{ m: last.month, n: last.labelled }}>{"Checked by hand on {n} ads sampled in {m}. Each bar shows the rate and its 95% range: a wider range means a smaller sample."}</T></p>
              <ul className="md-rates frame">
                <RateRow k="md.r_kept" en="Kept correctly" r={last.kept} note={<T k="md.r_kept_n">ads kept as AI job ads that really are</T>} />
                <RateRow k="md.r_missed" en="Missed" r={last.missed} note={<T k="md.r_missed_n">tech ads left out that were AI job ads after all</T>} />
                <RateRow k="md.r_role" en="Role right" r={last.role} />
                <RateRow k="md.r_sen" en="Level right" r={last.seniority} />
                <RateRow k="md.r_skp" en="Skills found were asked" r={last.skills?.precision} note={<T k="md.r_prec">precision</T>} />
                <RateRow k="md.r_skr" en="Skills asked were found" r={last.skills?.recall} note={<T k="md.r_rec">recall</T>} />
                <RateRow k="md.r_tkp" en="Tasks found were asked" r={last.tasks?.precision} note={<T k="md.r_prec">precision</T>} />
                <RateRow k="md.r_tkr" en="Tasks asked were found" r={last.tasks?.recall} note={<T k="md.r_rec">recall</T>} />
              </ul>
              {!!last.role?.confusions.length && (
                <div style={{ marginTop: 20 }}>
                  <span className="kicker"><T k="md.k_conf">The most common role mix-ups</T></span>
                  <ul className="md-conf">{last.role.confusions.map((c) => <li key={c.said + c.was}><span>{roleName(c.said)}</span><span className="muted">→ <T k="md.was">was</T></span><span>{roleName(c.was)}</span><span className="count">{c.n}</span></li>)}</ul>
                </div>
              )}
              {last.skills && (
                <details className="md-per">
                  <summary><T k="md.per">Skill by skill</T></summary>
                  <ul>{last.skills.per.filter((x) => x.asked).map((x) => <li key={x.id}><Link href={`/skills/${x.id}/`}><T k={`skill.${x.id}`}>{skillName(x.id)}</T></Link><span className="count">P {x.precision.pct ?? "–"}% · R {x.recall.pct ?? "–"}% · n {x.asked}</span></li>)}</ul>
                </details>
              )}
            </>
          ) : (
            <div className="frame md-wait">
              <b><T k="md.wait_h">The first check is under way.</T></b>
              <p className="muted"><T k="md.wait_p" vars={{ n: pending?.sampled ?? 200, l: pending?.labelled ?? 0 }}>{"A sample of {n} ads is being labelled by hand ({l} done so far): 80% from the ads the rules kept, spread across roles, and 20% from tech ads they left out. The rates appear here as soon as it is scored, with every month after it."}</T></p>
              <p className="muted"><T k="md.wait_p2">Until then, read the numbers on this site as what the rules found, not yet as measured fact.</T></p>
            </div>
          )}
          <p className="count" style={{ marginTop: 14 }}><T k="md.how_label">How the labelling works:</T> <a href={`${REPO}/tree/main/eval`}>eval/README.md</a></p>
        </div>
      </section>

      <section className="section" id="rules">
        <div className="wrap">
          <span className="kicker"><T k="md.k_rules">The rules</T></span>
          <h2 style={{ marginTop: 10 }}><T k="md.h_rules">What decides each field</T><span className="dot">.</span></h2>
          <div className="grid grid-2" style={{ marginTop: 22 }}>
            <div className="frame"><b><T k="md.f_ai">AI job ad or not</T></b><p className="muted"><T k="md.f_ai_p">The title must name AI work (AI, ML, LLM, agents, RAG, NLP, computer vision, forward deployed, research scientist and similar), name a technical job (engineer, architect, scientist, researcher, developer) and not be a sales, marketing, recruiting, legal, finance or management title. The description alone is never enough.</T></p></div>
            <div className="frame"><b><T k="md.f_role">Role</T></b><p className="muted"><T k="md.f_role_p">Matched on the title in a fixed order, first match wins: forward deployed, AI-native architect, solutions architect, agentic, platform, research, AI-native developer, applied AI engineer. A title that matches none is "other AI role".</T></p></div>
            <div className="frame"><b><T k="md.f_sen">Level</T></b><p className="muted"><T k="md.f_sen_p">From words in the title: intern, junior, head, principal, staff, lead, senior. A title that says none of them counts as mid level.</T></p></div>
            <div className="frame"><b><T k="md.f_sk">Skills, tasks, tools and years</T></b><p className="muted"><T k="md.f_sk_p">The ad is split at its headings. Tasks come from what you will do, skills and required tools from what is asked of you, preferred tools from the nice-to-haves, and benefits, company pitch and legal text are ignored. Years are the smallest "N+ years of experience" in the requirements.</T></p></div>
          </div>
        </div>
      </section>

      <section className="section" id="stored" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <div className="grid grid-2">
            <div>
              <span className="kicker"><T k="md.k_kept">What is kept</T></span>
              <ul className="md-list"><li><T k="md.kept1">Role, level, remote or not, skills, tasks, tools, stack and years asked</T></li><li><T k="md.kept2">The platform it came from and the dates it was published, first seen and last seen</T></li><li><T k="md.kept3">A normalised job title, for counting titles</T></li></ul>
            </div>
            <div>
              <span className="kicker"><T k="md.k_never">What is never kept</T></span>
              <ul className="md-list no"><li><T k="md.never1">The ad text: it is read and dropped</T></li><li><T k="md.never2">Links to ads, and company names</T></li><li><T k="md.never3">Ads from people looking for work, which can carry a name</T></li></ul>
            </div>
          </div>
          <span className="kicker" style={{ display: "block", marginTop: 30 }}><T k="md.k_limits">Known limits</T></span>
          <ul className="md-list" style={{ maxWidth: "80ch" }}>
            <li><T k="md.lim1">Mostly English-language ads from companies whose career pages run on the platforms read: tech companies and the US are over-represented.</T></li>
            <li><T k="md.lim2">Role and level come from the title alone, so a vague title gives a vague answer.</T></li>
            <li><T k="md.lim3">Keyword rules miss skills that are described without the usual words, and can count a word used in passing.</T></li>
            <li><T k="md.lim4">Tracking began on 7 November 2026: earlier ads count only if they were still listed then. Some platforms give an old ad its original date, years back.</T></li>
          </ul>
          <p className="count" style={{ marginTop: 14 }}><Link href="/market/sources/"><T k="md.to_sources">Every site read, and the ones left out on purpose</T> →</Link></p>
        </div>
      </section>

      <section className="section" id="data">
        <div className="wrap">
          <span className="kicker"><T k="md.k_data">Open data</T></span>
          <h2 style={{ marginTop: 10 }}><T k="md.h_data">Download it, check it, cite it</T><span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12, maxWidth: "70ch" }}><T k="md.data_p" vars={{ n: ds.rows.toLocaleString("en-US"), v: ds.version }}>{"One row per AI job ad, derived fields only: {n} ads in version {v}, updated on the 1st of every month. Free to use with credit, under CC BY 4.0."}</T></p>
          <div className="md-data">
            <div className="frame md-dl">
              <span className="count"><T k="md.dl_k">Version</T> {ds.version}</span>
              <b className="md-big">{ds.rows.toLocaleString("en-US")}</b>
              <span className="muted"><T k="md.dl_rows" vars={{ a: ds.allAds.toLocaleString("en-US") }}>{"ads row by row, from company career pages; {a} in the monthly totals, job boards included"}</T></span>
              <div className="md-btns">
                <a className="btn" href={csv}><T k="md.dl_csv">Download CSV</T></a>
                <a className="chip" href={`${REPO}/tree/main/dataset`}><T k="md.dl_card">Data card and columns</T></a>
                <a className="chip" href={`${REPO}/releases`}><T k="md.dl_rel">Every version</T></a>
                {ds.conceptDoi && <a className="chip" href={`https://doi.org/${ds.conceptDoi}`}>DOI {ds.conceptDoi}</a>}
              </div>
            </div>
            <div className="frame">
              <span className="kicker"><T k="md.cite_k">How to cite</T></span>
              <p className="md-cite">Faraji, V. ({ds.through.slice(0, 4)}). <i>Applied AI job ads: what employers ask for</i> (version {ds.version}) [Data set]. {ds.conceptDoi ? `https://doi.org/${ds.conceptDoi}` : `${REPO}/tree/main/dataset`}</p>
              <p className="count"><T k="md.cite_n">Or use "Cite this repository" on GitHub. Licence: CC BY 4.0, for the dataset only.</T></p>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .md-steps { list-style: none; margin: 30px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 14px; }
        .md-steps li { display: grid; gap: 6px; }
        .md-n { font: 700 .74rem var(--font-mono), monospace; color: var(--rust); }
        .md-steps b { font-size: 1.15rem; }
        .md-steps .muted { font-size: .92rem; }
        .md-rates { list-style: none; margin: 20px 0 0; padding: 20px 26px; display: grid; gap: 14px; }
        .md-rate { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr) 150px; gap: 16px; align-items: center; }
        .md-rate-l { display: grid; } .md-rate-l .muted { font-size: .8rem; }
        .md-rate-bar { position: relative; height: 6px; border-radius: 3px; background: var(--rod); }
        .md-range { position: absolute; top: 0; height: 100%; border-radius: 3px; background: color-mix(in srgb, var(--rust) 35%, transparent); }
        .md-dot { position: absolute; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c);  }
        .md-rate-n { display: grid; justify-items: end; gap: 2px; } .md-rate-n b { font-size: 1.15rem; } .md-rate-n .count { font-size: .72rem; white-space: nowrap; }
        @media (max-width: 640px) { .md-rate { grid-template-columns: 1fr auto; } .md-rate-bar { grid-column: 1 / -1; grid-row: 2; } }
        .md-conf { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 6px; max-width: 720px; }
        .md-conf li { display: grid; grid-template-columns: 1fr auto 1fr auto; gap: 10px; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
        .md-per { margin-top: 18px; } .md-per summary { cursor: pointer; font-weight: 700; }
        .md-per ul { list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 6px; max-width: 720px; }
        .md-per li { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); padding-bottom: 6px; } .md-per a { text-decoration: none; }
        .md-wait { margin-top: 20px; display: grid; gap: 8px; max-width: 760px; }
        .md-list { margin: 12px 0 0; padding-left: 0; list-style: none; display: grid; gap: 8px; }
        .md-list li { padding-left: 22px; position: relative; } .md-list li::before { content: ""; position: absolute; left: 0; top: .45em; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
        .md-list.no li::before { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .md-data { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 18px; margin-top: 24px; }
        .md-dl { display: grid; gap: 6px; } .md-big { font-size: 2.6rem; font-weight: 800; color: var(--rust); line-height: 1; }
        .md-btns { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }
        .md-cite { font-family: var(--font-mono), monospace; font-size: .85rem; line-height: 1.6; margin: 10px 0; word-break: break-word; }
      `}</style>
    </>
  );
}
