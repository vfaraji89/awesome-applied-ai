import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { M } from "@/lib/market-data";
import { skills } from "@/data/framework";
import { ConfBanner } from "@/components/conf-banner";
import conf from "@/data/conferences.json";

export const metadata: Metadata = { ...share("market/conferences"), title: "Conferences", description: "What applied AI conferences talk about, set against what AI job ads ask for: the skills on stage and in the job, the tools, the topics over the years, and the official events coming up." };

type Row = { id?: string; name?: string; n: number; share: number };
type Ed = { id: string; series: string; name: string; start: string; end: string; location: string; url: string; source: string; talks: number; kinds: Record<string, number>; skills: Row[]; tasks: Row[]; tools: Row[]; tracks: Row[] };
type Conf = { updated: string; editions: Ed[]; recent: { from: string; editions: number; talks: number; skills: Row[]; tasks: Row[]; tools: Row[] }; upcoming: { name: string; series: string; start: string; end: string; location: string; url: string }[]; aieYears?: Record<string, number>; aieTopics: { id: string; name: string; n: number; byYear: Record<string, number> }[]; sources: string[] };
const C = conf as unknown as Conf;
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const when = (a: string, b: string) => {
  const f = (d: string, o: Intl.DateTimeFormatOptions) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  return a === b ? f(a, { day: "numeric", month: "short", year: "numeric" }) : a.slice(0, 7) === b.slice(0, 7) ? `${f(a, { day: "numeric" })}–${f(b, { day: "numeric", month: "short", year: "numeric" })}` : `${f(a, { day: "numeric", month: "short" })} – ${f(b, { day: "numeric", month: "short", year: "numeric" })}`;
};

export default function Conferences() {
  const ready = C.editions?.length > 0;
  const adShare = (id: string) => M.skills.find((s) => s.id === id)?.share ?? 0;
  const talkShare = (id: string) => C.recent?.skills.find((s) => s.id === id)?.share ?? 0;
  const pairs = skills.map((s) => ({ id: s.id, talks: talkShare(s.id), ads: adShare(s.id) })).sort((a, b) => b.talks + b.ads - (a.talks + a.ads));
  // ads list many requirements, talks focus on one or two: compare each skill's share of all the skills named (attention)
  const tSum = pairs.reduce((a, p) => a + p.talks, 0) || 1, aSum = pairs.reduce((a, p) => a + p.ads, 0) || 1;
  const gaps = pairs.map((p) => ({ ...p, tm: (100 * p.talks) / tSum, am: (100 * p.ads) / aSum })).map((p) => ({ ...p, d: p.tm - p.am })).sort((a, b) => b.d - a.d);
  const stage = gaps.filter((g) => g.d >= 2).slice(0, 4), job = gaps.filter((g) => g.d <= -2).reverse().slice(0, 4);
  const adTool = (n: string) => { const t = M.tools.find((x) => x.name === n); return t ? Math.round((t.n / Math.max(1, M.totals.processed)) * 1000) / 10 : 0; };
  const years = Object.keys(C.aieYears ?? {}).filter((y) => (C.aieYears?.[y] ?? 0) >= 30);
  const topicRows = C.aieTopics.slice(0, 10).map((t) => ({ ...t, shares: years.map((y) => ({ y, s: C.aieYears?.[y] ? Math.round(((t.byYear[y] ?? 0) / C.aieYears[y]) * 100) : 0 })) }));
  const topMax = Math.max(1, ...topicRows.flatMap((t) => t.shares.map((x) => x.s)));
  const latest = [...(C.editions ?? [])].sort((a, b) => b.start.localeCompare(a.start));
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="market" page="Conferences" />
          <h1 style={{ marginTop: 12 }}><TH k="cf.h1">On stage, and <mark>in the job</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><T k="cf.lead">What applied AI conferences talk about, set against what AI job ads ask for. Talks are read from official schedules and archives with the same rules as the ads.</T></p>
          {ready ? (
            <div className="frame" style={{ marginTop: 30, padding: "28px 30px" }}>
              <ConfBanner rows={pairs} tSum={tSum} aSum={aSum} talks={C.recent.talks} ads={M.totals.processed} />
            </div>
          ) : <div className="frame" style={{ marginTop: 30 }}><p className="muted"><T k="cf.wait">The first reading of the conference schedules is under way.</T></p></div>}
          {ready && <p className="count" style={{ marginTop: 12 }}><T k="cf.basis" vars={{ e: C.recent.editions, t: C.recent.talks.toLocaleString("en-US"), d: "June 2025" }}>{"Talks: {t} sessions at {e} conferences since {d}. Ads: AI job ads since 1 October 2026. A talk or an ad counts for every skill it names."}</T></p>}
        </div>
      </section>

      {ready && (
        <>
          <section className="section" id="gaps" style={{ background: "var(--paper)" }}>
            <div className="wrap">
              <span className="kicker"><T k="cf.k_gap">The gap</T></span>
              <h2 style={{ marginTop: 10 }}><T k="cf.h_gap">Where stage and job disagree</T><span className="dot">.</span></h2>
              <div className="grid grid-2" style={{ marginTop: 22 }}>
                <div className="frame">
                  <b><T k="cf.stage">More on stage than in the job</T></b>
                  <p className="muted" style={{ fontSize: ".88rem" }}><T k="cf.stage_p">What conferences are excited about before employers ask for it, or what is easier to talk about than to hire for.</T></p>
                  <ul className="cf-gap">{stage.map((g) => <li key={g.id}><Link href={`/skills/${g.id}/`}><T k={`skill.${g.id}`}>{skillName(g.id)}</T></Link><span className="count">{Math.round(g.tm)}% · {Math.round(g.am)}%</span><b>+{Math.round(g.d)}</b></li>)}</ul>
                  {!stage.length && <p className="count"><T k="cf.none">No gap of 2 points or more.</T></p>}
                </div>
                <div className="frame">
                  <b><T k="cf.job">More in the job than on stage</T></b>
                  <p className="muted" style={{ fontSize: ".88rem" }}><T k="cf.job_p">What employers ask for that conferences rarely cover: the quiet, everyday work.</T></p>
                  <ul className="cf-gap job">{job.map((g) => <li key={g.id}><Link href={`/skills/${g.id}/`}><T k={`skill.${g.id}`}>{skillName(g.id)}</T></Link><span className="count">{Math.round(g.tm)}% · {Math.round(g.am)}%</span><b>{Math.round(g.d)}</b></li>)}</ul>
                  {!job.length && <p className="count"><T k="cf.none">No gap of 2 points or more.</T></p>}
                </div>
              </div>
              <p className="count" style={{ marginTop: 12 }}><T k="cf.gap_n">Share of attention: each skill's part of all the skills named in talks · in ads, and the difference in points. Long ads and short talks compare fairly this way.</T></p>
            </div>
          </section>

          <section className="section" id="tools">
            <div className="wrap">
              <span className="kicker"><T k="cf.k_tools">Tools</T></span>
              <h2 style={{ marginTop: 10 }}><T k="cf.h_tools">The tools named most on stage</T><span className="dot">.</span></h2>
              <ul className="cf-tools">
                {C.recent.tools.slice(0, 14).map((t) => (
                  <li key={t.name}><span>{t.name}</span><span className="rodbar ink"><i style={{ width: `${(t.share / Math.max(1, C.recent.tools[0].share)) * 100}%` }} /></span><span className="count">{t.share}% <T k="cf.of_talks">of talks</T> · {adTool(t.name!)}% <T k="cf.of_ads">of ads</T></span></li>
                ))}
              </ul>
            </div>
          </section>

          {topicRows.length > 0 && years.length > 1 && (
            <section className="section" id="topics" style={{ background: "var(--paper)" }}>
              <div className="wrap">
                <span className="kicker"><T k="cf.k_topics">AI Engineer, year by year</T></span>
                <h2 style={{ marginTop: 10 }}><T k="cf.h_topics">How the topics moved</T><span className="dot">.</span></h2>
                <p className="muted" style={{ marginTop: 8, maxWidth: "70ch" }}><T k="cf.topics_p">The share of each year's recorded AI Engineer talks on each topic, as the conference tags them.</T></p>
                <div className="cf-topics">
                  <div className="cf-th"><span />{years.map((y) => <span key={y} className="count">{y}</span>)}</div>
                  {topicRows.map((t) => (
                    <div key={t.id} className="cf-tr">
                      <a href={`https://ai.engineer/topics/${t.id}`} target="_blank" rel="noreferrer">{t.name}</a>
                      {t.shares.map((x) => <span key={x.y} className="cf-cell" title={`${t.name}, ${x.y}: ${x.s}% of talks`}><i style={{ width: `${8 + (x.s / topMax) * 34}px`, height: `${8 + (x.s / topMax) * 34}px` }} /><span className="count">{x.s}%</span></span>)}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="section" id="events">
            <div className="wrap">
              <div className="grid grid-2">
                <div>
                  <span className="kicker"><T k="cf.k_next">Coming up</T></span>
                  <h2 style={{ marginTop: 10 }}><T k="cf.h_next">Official events</T><span className="dot">.</span></h2>
                  <ul className="cf-events">
                    {C.upcoming.map((u) => <li key={u.name}><a href={u.url} target="_blank" rel="noreferrer"><b>{u.name}</b> ↗</a><span className="count">{when(u.start, u.end)} · {u.location}</span></li>)}
                    {!C.upcoming.length && <li className="muted"><T k="cf.no_next">No upcoming editions announced in the sources read.</T></li>}
                  </ul>
                  <Link href="/events/" className="btn" style={{ marginTop: 16 }}><T k="cf.to_cal">The full events calendar</T> →</Link>
                </div>
                <div>
                  <span className="kicker"><T k="cf.k_read">Read so far</T></span>
                  <h2 style={{ marginTop: 10 }}><T k="cf.h_read">Every edition, with its source</T><span className="dot">.</span></h2>
                  <ul className="cf-events">
                    {latest.map((e) => <li key={e.id}><a href={e.url} target="_blank" rel="noreferrer"><b>{e.name}</b> ↗</a><span className="count">{when(e.start, e.end)} · {e.location} · {e.talks} <T k="cf.talks">talks</T> · <a href={e.source} target="_blank" rel="noreferrer"><T k="cf.data">data</T></a></span></li>)}
                  </ul>
                </div>
              </div>
              <p className="muted" style={{ marginTop: 26, maxWidth: "75ch" }}><T k="cf.method">Read once a month from each conference's own published schedule or talk archive. Breaks, registration and social events are left out. Only counts, titles, speaker names, organisations and links are kept, never descriptions, biographies or transcripts. The rules are the same as for the job ads, so their error rates apply here too.</T> <Link href="/market/method/"><T k="cf.to_method">The method</T> →</Link></p>
            </div>
          </section>
        </>
      )}
      <style>{`
        .cf-gap { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
        .cf-gap li { display: grid; grid-template-columns: 1fr auto 46px; gap: 12px; align-items: baseline; border-bottom: 1px solid var(--line); padding-bottom: 8px; }
        .cf-gap a { text-decoration: none; font-weight: 600; } .cf-gap b { text-align: right; color: var(--ink); } .cf-gap.job b { color: var(--rust-deep); }
        .cf-tools { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 10px; max-width: 900px; }
        .cf-tools li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) 230px; gap: 14px; align-items: center; }
        .cf-tools .count { text-align: right; white-space: nowrap; font-size: .74rem; }
        @media (max-width: 640px) { .cf-tools li { grid-template-columns: 1fr auto; } .cf-tools .rodbar { grid-column: 1 / -1; grid-row: 2; } }
        .cf-topics { margin-top: 20px; overflow-x: auto; }
        .cf-th, .cf-tr { display: grid; grid-template-columns: minmax(170px, 1.4fr) repeat(${Math.max(1, years.length)}, minmax(64px, 1fr)); gap: 8px; align-items: center; min-width: ${170 + years.length * 72}px; }
        .cf-th { padding-bottom: 6px; border-bottom: 1px solid var(--line); } .cf-th .count { text-align: center; }
        .cf-tr { padding: 6px 0; border-bottom: 1px solid var(--line); } .cf-tr a { text-decoration: none; font-size: .9rem; }
        .cf-cell { display: grid; justify-items: center; gap: 2px; } .cf-cell i { display: block; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .cf-cell .count { font-size: .66rem; }
        .cf-events { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 10px; }
        .cf-events li { display: grid; gap: 2px; border-bottom: 1px solid var(--line); padding-bottom: 8px; } .cf-events a { text-decoration: none; } .cf-events li > a:hover b { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
