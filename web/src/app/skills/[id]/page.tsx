/* One page per skill: how often AI job ads ask for it, who asks, what comes with it, the tools that
   stand out, the tasks around it, the problems that test it, and where to go next on this site.
   Every number comes from the market summary (pipeline/run.ts > insights.skills[].detail). */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumb } from "@/components/section-intro";
import { T } from "@/i18n/lang";
import { skills, fRoles, LEVELS as SKILL_LEVELS } from "@/data/framework";
import { M } from "@/lib/market-data";
import { SKILL_LINKS } from "@/data/skill-links";
import { useCases, useCasesOf } from "@/data/usecases";
import { tools } from "@/data/tools";
import { TRACKS, certs } from "@/data/certificates";
import { problems } from "@/data/problems";
import { layers } from "@/data/layers";
import jargon from "@/data/content/jargon.json";
import { InsightTicker, type TickerItem } from "@/components/insight-ticker";
import { insightCss } from "@/components/market-insights";
import { abs } from "@/lib/seo";

type Detail = {
  withAll: { id: string; share: number; lift: number }[];
  tools: { name: string; share: number; lift: number }[];
  tasks: { id: string; share: number; lift: number }[];
  years: { asked: number; median: number } | null;
  remote: number;
  levels: { id: string; share: number }[];
  byRole: { id: string; share: number }[];
};
type Profile = { id: string; n: number; share: number; topRole: { id: string; share: number } | null; detail?: Detail };

const profiles = (M.insights?.skills ?? []) as unknown as Profile[];
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? id;
const taskName = (id: string) => (M.tasks.find((t) => t.id === id)?.name as string) ?? id;
const Sk = ({ id }: { id: string }) => <T k={`skill.${id}`}>{skillName(id)}</T>;

export function generateStaticParams() {
  return skills.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const s = skills.find((x) => x.id === id);
  if (!s) return {};
  const p = profiles.find((x) => x.id === s.id);
  const desc = `${s.name} in applied AI job ads${p ? `: asked for in ${p.share}% of ${M.totals.processed.toLocaleString("en-US")} ads since 1 October 2026` : ""}. Who asks for it, what comes with it, the tools that stand out, and where to learn and prove it.`;
  const img = { url: "/og/pages/skills.png", width: 1200, height: 630, alt: `${s.name}: the skill in applied AI job ads` };
  return { title: `${s.name}: the skill`, description: desc, alternates: { canonical: abs(`/skills/${s.id}/`) },
    openGraph: { type: "article", url: "./", siteName: "awesome-applied-ai", title: `${s.name}, in the ads`, description: desc, images: [img] },
    twitter: { card: "summary_large_image", creator: "@vfaraji89", title: `${s.name}, in the ads`, description: desc, images: [img] } };
}

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const s = skills.find((x) => x.id === id);
  if (!s) notFound();
  const i = skills.findIndex((x) => x.id === id);
  const prev = skills[(i + skills.length - 1) % skills.length], next = skills[(i + 1) % skills.length];
  const p = profiles.find((x) => x.id === id);
  const d = p?.detail;
  const rank = [...profiles].sort((a, b) => b.share - a.share).findIndex((x) => x.id === id) + 1;
  const links = SKILL_LINKS[id];
  const useIds = links?.use ?? [];
  const toolCount = tools.filter((t) => useCasesOf(t).some((u) => useIds.includes(u))).length;
  const track = TRACKS.find((t) => t.id === links?.track);
  const certCount = certs.filter((c) => c.track === links?.track).length;
  const jFields = (jargon as { fields: { id: string; name: string }[] }).fields.filter((f) => links?.jargon.includes(f.id));
  const termCount = (jargon as { terms: { field: string }[] }).terms.filter((t) => links?.jargon.includes(t.field)).length;
  const probs = problems.filter((x) => links?.layers.includes(x.layer)).slice(0, 4);
  const labs = M.insights?.labs?.skills.find((x) => x.id === id);
  const roleRows = fRoles.map((r) => ({ id: r.id, level: r.levels[id] ?? 0, share: d?.byRole.find((x) => x.id === r.id)?.share ?? null }))
    .sort((a, b) => (b.share ?? -1) - (a.share ?? -1));
  const topWith = d?.withAll.slice().sort((a, b) => b.lift - a.lift) ?? [];

  // the skill's own insight bar
  const items: TickerItem[] = [];
  if (p) items.push({ k: "share", big: `${p.share}%`, lead: <T k="sd.t_share">of AI job ads since 1 October ask for</T>, what: <Sk id={id} /> });
  if (p?.topRole) items.push({ k: "role", big: `${p.topRole.share}%`, lead: <T k="sd.t_role">of the ads for this role ask for it, the most of any:</T>, what: roleName(p.topRole.id) });
  if (topWith[0]) items.push({ k: "with", big: `${topWith[0].lift}×`, lead: <T k="sd.t_with">as often as usual, it comes with</T>, what: <Sk id={topWith[0].id} /> });
  if (d?.tools[0]) items.push({ k: "tool", big: `${d.tools[0].lift}×`, lead: <T k="sd.t_tool">the usual rate, the tool that stands out most next to it:</T>, what: d.tools[0].name });
  if (labs && Math.abs(labs.lab - labs.rest) >= 3) items.push({ k: "labs", big: `${labs.lab - labs.rest > 0 ? "+" : ""}${labs.lab - labs.rest}`, lead: <T k="sd.t_labs">points at the AI labs against everyone else:</T>, what: <T k="sd.t_labs_what" vars={{ a: labs.lab, b: labs.rest }}>{"{a}% against {b}%"}</T> });
  if (d?.years) items.push({ k: "yrs", big: String(d.years.median), lead: <T k="sd.t_yrs">years of experience is the median ask in these ads,</T>, what: <T k="sd.t_yrs_what" vars={{ p: d.years.asked }}>{"where {p}% say"}</T> });
  if (d?.tasks[0]) items.push({ k: "task", big: `${d.tasks[0].share}%`, lead: <T k="sd.t_task">of these ads ask you to</T>, what: <T k={`task.${d.tasks[0].id}`}>{taskName(d.tasks[0].id)}</T> });

  const glance = [
    { k: "sd.g_share", en: "of AI job ads ask for it", n: p ? `${p.share}%` : "–", sub: <T k="sd.g_rank" vars={{ r: rank, n: profiles.length }}>{"number {r} of {n} skills"}</T> },
    { k: "sd.g_ads", en: "AI job ads name it", n: p ? p.n.toLocaleString("en-US") : "–", sub: <T k="mk.since" vars={{ d: "1 Oct 2026" }}>{"since {d}"}</T> },
    ...(d?.years ? [{ k: "sd.g_years", en: "years, the median ask", n: String(d.years.median), sub: <T k="sd.g_years_sub" vars={{ p: d.years.asked }}>{"in the {p}% of these ads that say"}</T> }] : []),
    ...(d ? [{ k: "sd.g_remote", en: "are remote", n: `${d.remote}%`, sub: <T k="sd.g_remote_sub" vars={{ p: M.totals.remoteShare }}>{"against {p}% of all AI ads"}</T> }] : []),
  ];

  const ctas = [
    { href: "/fit/", k: "sd.c_fit", en: "Check your fit", line: <T k="sd.c_fit_l">Paste your CV and see how it scores on this skill and the rest, with what to learn next.</T>, primary: true },
    ...(links?.doc ? [{ href: links.doc.href, k: "sd.c_doc", en: "Read the doc", line: <T k="sd.c_doc_l" vars={{ d: links.doc.name, n: links.doc.pages }}>{"{d}: {n} short animated pages, each linked to its sources."}</T> }] : []),
    ...(useIds.length ? [{ href: `/tools/?use=${useIds[0]}`, k: "sd.c_tools", en: "Practise with the tools", line: <T k="sd.c_tools_l" vars={{ n: toolCount, u: useCases.find((u) => u.id === useIds[0])?.name ?? "" }}>{"{n} tools on the map for this, starting with {u}."}</T> }] : []),
    ...(track ? [{ href: `/certificates/?track=${track.id}`, k: "sd.c_cert", en: "Prove it", line: <T k="sd.c_cert_l" vars={{ n: certCount, t: track.name }}>{"{n} certificates in the track {t}, each checked on the provider's page."}</T> }] : []),
    ...(jFields.length ? [{ href: `/jargon/?field=${jFields[0].id}`, k: "sd.c_jargon", en: "Learn the words", line: <T k="sd.c_jargon_l" vars={{ n: termCount, f: jFields.map((f) => f.name).join(", ") }}>{"{n} terms in plain words: {f}."}</T> }] : []),
    { href: "/roles/", k: "sd.c_roles", en: "See the roles", line: <T k="sd.c_roles_l">What each role does all day, and the level of this skill it expects.</T> },
    { href: "/market/", k: "sd.c_market", en: "Read the market", line: <T k="sd.c_market_l">The heatmap, the labs, the stack and how AI reaches other jobs.</T> },
  ];

  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="Skill map" />
          <p style={{ marginTop: 12 }}><span className="sd-tag">{M.sinceQuarter ?? "2026 Q4"}</span> <span className="count"><T k="sd.kicker" vars={{ i: String(i + 1).padStart(2, "0"), n: skills.length }}>{"skill {i} of {n}"}</T></span></p>
          <h1 style={{ marginTop: 8 }}><Sk id={id} /><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 14, maxWidth: "62ch" }}><T k={`skillwhat.${id}`}>{s.what}</T></p>
          <div className="sd-actions">
            <Link href="/fit/" className="btn"><T k="sd.c_fit">Check your fit</T> →</Link>
            <a href="#next" className="btn ghost"><T k="sd.next_steps">Where to learn it</T></a>
            <Link href="/skills/" className="sd-back"><T k="sd.all">All twelve skills</T></Link>
          </div>
          {items.length > 0 && <InsightTicker items={items} label={`${s.name}: insights from the AI job ads`} />}
          <div className="sd-glance">
            {glance.map((g) => (
              <div key={g.k} className="frame sd-g"><b>{g.n}</b><span className="sd-g-l"><T k={g.k}>{g.en}</T></span><span className="count">{g.sub}</span><span className="rod" /></div>
            ))}
          </div>
        </div>
      </section>

      {d && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="wrap">
            <span className="kicker"><T k="sd.k_roles">Who asks for it</T></span>
            <h2 style={{ marginTop: 10 }}><T k="sd.h_roles">Role by role, the ads and the expected level</T><span className="dot">.</span></h2>
            <p className="muted" style={{ marginTop: 8, maxWidth: "72ch" }}><T k="sd.roles_p">The rod is the share of each role&apos;s ads that ask for this skill. The beads are the level the role framework expects, from aware to expert.</T></p>
            <ul className="sd-roles">
              {roleRows.map((r) => (
                <li key={r.id}>
                  <Link href="/roles/" className="sd-role">{roleName(r.id)}</Link>
                  <span className="rodbar">{r.share !== null && <i style={{ width: `${r.share}%` }} />}</span>
                  <span className="mono sd-n">{r.share !== null ? `${r.share}%` : "–"}</span>
                  <span className="sd-level" title={SKILL_LEVELS[r.level]}>
                    {[1, 2, 3, 4].map((k) => <i key={k} className={`bead${k <= r.level ? "" : " white"}`} />)}
                    <span className="count"><T k={`lv.${r.level}`}>{SKILL_LEVELS[r.level]}</T></span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {d && (
        <section className="section">
          <div className="wrap grid grid-2" style={{ gap: 40 }}>
            <div>
              <span className="kicker"><T k="sd.k_with">What comes with it</T></span>
              <h2 style={{ marginTop: 10 }}><T k="sd.h_with">The skills it travels with</T><span className="dot">.</span></h2>
              <p className="muted" style={{ marginTop: 8 }}><T k="sd.with_p">How much more often each skill appears in these ads than in all AI ads. Above 1× they go together; below, they rarely do.</T></p>
              <ul className="sd-with">
                {topWith.map((w) => (
                  <li key={w.id}>
                    <Link href={`/skills/${w.id}/`}><Sk id={w.id} /></Link>
                    <span className="sd-lift"><span className="rodbar"><i style={{ width: `${Math.min(100, (w.lift / Math.max(2, topWith[0].lift)) * 100)}%` }} /></span><em style={{ left: `${(1 / Math.max(2, topWith[0].lift)) * 100}%` }} /></span>
                    <span className="mono sd-n">{w.lift}×</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="kicker"><T k="sd.k_tools">Tools that stand out</T></span>
              <h2 style={{ marginTop: 10 }}><T k="sd.h_tools">Named far more often here</T><span className="dot">.</span></h2>
              <p className="muted" style={{ marginTop: 8 }}><T k="sd.tools_p">Tools named in at least five of these ads, ranked by how much more often than in all AI ads.</T></p>
              <div className="sd-chips">
                {d.tools.map((t) => (
                  <Link key={t.name} href={`/tools/?q=${encodeURIComponent(t.name)}`} className="chip" title={`${t.share}% of these ads`}>{t.name} <i className="mono">{t.lift}×</i></Link>
                ))}
              </div>
              {d.tasks.length > 0 && (
                <>
                  <span className="kicker" style={{ display: "block", marginTop: 30 }}><T k="sd.k_tasks">The work around it</T></span>
                  <ul className="sd-bars">
                    {d.tasks.slice(0, 6).map((t) => (
                      <li key={t.id}><span><T k={`task.${t.id}`}>{taskName(t.id)}</T></span><span className="rodbar ink"><i style={{ width: `${t.share}%` }} /></span><span className="mono sd-n">{t.share}%</span></li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {d && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="wrap grid grid-2" style={{ gap: 40 }}>
            <div>
              <span className="kicker"><T k="sd.k_levels">At what level</T></span>
              <h2 style={{ marginTop: 10 }}><T k="sd.h_levels">The seniority of these ads</T><span className="dot">.</span></h2>
              <ul className="sd-bars">
                {d.levels.map((l) => (
                  <li key={l.id}><span><T k={`lvl.${l.id.toLowerCase()}`}>{l.id}</T></span><span className="rodbar"><i style={{ width: `${l.share}%` }} /></span><span className="mono sd-n">{l.share}%</span></li>
                ))}
              </ul>
            </div>
            {labs && (
              <div>
                <span className="kicker"><T k="mi.k_labs">The labs against everyone else</T></span>
                <h2 style={{ marginTop: 10 }}><T k="sd.h_labs">At the AI labs</T><span className="dot">.</span></h2>
                <div className="mi-legend count"><span><i className="bead mi-b" /><T k="sd.labs_l">AI labs</T> {labs.lab}%</span><span><i className="bead ink mi-b" /><T k="sd.rest_l">everyone else</T> {labs.rest}%</span></div>
                <div className="sd-dumb"><span className="mi-dumb-t" style={{ display: "block" }}>
                  <span className="mi-dumb-bar" style={{ left: `${Math.min(labs.lab, labs.rest)}%`, width: `${Math.abs(labs.lab - labs.rest)}%` }} />
                  <i className="bead ink mi-b" style={{ left: `${labs.rest}%` }} /><i className="bead mi-b" style={{ left: `${labs.lab}%` }} />
                </span></div>
                <p className="muted" style={{ marginTop: 14 }}>
                  {labs.lab - labs.rest >= 3 ? <T k="sd.labs_more">The labs ask for this skill more than other employers do.</T>
                    : labs.rest - labs.lab >= 3 ? <T k="sd.labs_less">Other employers ask for this skill more than the labs do.</T>
                    : <T k="sd.labs_same">The labs and other employers ask for it about as often.</T>}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {probs.length > 0 && (
        <section className="section">
          <div className="wrap">
            <span className="kicker"><T k="sd.k_probs">Problems that test it</T></span>
            <h2 style={{ marginTop: 10 }}><T k="sd.h_probs">Where this skill earns its keep</T><span className="dot">.</span></h2>
            <div className="grid grid-2" style={{ marginTop: 22 }}>
              {probs.map((x) => (
                <Link key={x.id} href={`/problems/${x.id}/`} className="frame sd-prob">
                  <span className="kicker">{String(x.n).padStart(2, "0")} · {layers.find((l) => l.id === x.layer)?.name}</span>
                  <b>{x.title}</b>
                  <span className="rod" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" id="next" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="sd.k_next">Next steps</T></span>
          <h2 style={{ marginTop: 10 }}><T k="sd.h_next">Learn it, practise it, prove it</T><span className="dot">.</span></h2>
          <div className="sd-ctas">
            {ctas.map((c) => (
              <Link key={c.k} href={c.href} className={`frame sd-cta${c.primary ? " primary" : ""}`}>
                <b><T k={c.k}>{c.en}</T> <span aria-hidden="true">→</span></b>
                <span className="muted">{c.line}</span>
                <span className="rod" />
              </Link>
            ))}
          </div>
          <nav className="sd-pager" aria-label="Skills">
            <Link href={`/skills/${prev.id}/`} className="frame"><span className="count">← <T k="sd.prev">previous skill</T></span><b><Sk id={prev.id} /></b><span className="rod" /></Link>
            <Link href={`/skills/${next.id}/`} className="frame" style={{ textAlign: "right" }}><span className="count"><T k="sd.next">next skill</T> →</span><b><Sk id={next.id} /></b><span className="rod" /></Link>
          </nav>
        </div>
      </section>

      <style>{insightCss}</style>
      <style>{`
        .sd-tag { display: inline-block; font: .66rem var(--font-mono), monospace; letter-spacing: .1em; text-transform: uppercase; padding: 1px 9px; border-radius: 999px; border: 1px dashed var(--rust); color: var(--rust-deep); }
        .sd-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 22px; }
        .sd-back { font-size: .9rem; color: var(--sec); margin-left: 6px; } .sd-back:hover { color: var(--rust-deep); }
        .sd-glance { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 14px; margin-top: 18px; }
        .sd-g { display: flex; flex-direction: column; gap: 2px; padding: 20px 24px 30px; }
        .sd-g b { font-size: clamp(1.8rem, 3.4vw, 2.5rem); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; color: var(--rust); }
        .sd-g-l { font-weight: 700; } .sd-g .count { font-size: .74rem; }
        .sd-roles { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 12px; }
        .sd-roles li { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr) 50px minmax(0, 190px); gap: 16px; align-items: center; }
        .sd-role { text-decoration: none; font-weight: 600; } .sd-role:hover { color: var(--rust-deep); }
        .sd-roles .rodbar { margin-right: 6px; }
        .sd-n { font-size: .78rem; color: var(--muted); text-align: right; }
        .sd-level { display: inline-flex; align-items: center; gap: 4px; } .sd-level .bead { width: 12px; height: 12px; } .sd-level .count { margin-left: 6px; font-size: .72rem; }
        .sd-with, .sd-bars { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
        .sd-with li, .sd-bars li { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 50px; gap: 12px; align-items: center; font-size: .92rem; }
        .sd-with a { text-decoration: none; } .sd-with a:hover { color: var(--rust-deep); }
        .sd-lift { position: relative; margin-right: 6px; } .sd-lift em { position: absolute; top: -6px; bottom: -6px; width: 2px; border-radius: 1px; background: var(--ink); opacity: .35; }
        .sd-bars .rodbar { margin-right: 6px; }
        .sd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
        .sd-chips .chip i { font-style: normal; font-size: .7rem; color: var(--rust-deep); }
        .sd-dumb { margin-top: 26px; max-width: 520px; position: relative; }
        .sd-prob { display: flex; flex-direction: column; gap: 6px; padding-bottom: 30px; } .sd-prob b { font-size: 1.05rem; }
        .sd-ctas { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 14px; margin-top: 24px; }
        .sd-cta { display: flex; flex-direction: column; gap: 6px; padding: 22px 26px 32px; }
        .sd-cta b { font-size: 1.15rem; } .sd-cta b span { color: var(--rust); transition: margin .3s var(--ease); } .sd-cta:hover b span { margin-left: 6px; }
        .sd-cta .muted { font-size: .9rem; }
        .sd-cta.primary { background: var(--ink); color: var(--bg); } .sd-cta.primary .muted { color: color-mix(in oklab, var(--bg) 75%, transparent); }
        .sd-pager { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 30px; }
        .sd-pager a { display: flex; flex-direction: column; gap: 4px; padding-bottom: 30px; } .sd-pager b { font-size: 1.1rem; }
        @media (max-width: 760px) { .sd-roles li { grid-template-columns: minmax(0, 1fr) 50px; } .sd-roles .rodbar, .sd-level { grid-column: 1 / -1; } }
      `}</style>
    </>
  );
}
