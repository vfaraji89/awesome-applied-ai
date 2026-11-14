import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { RoleBanner } from "@/components/role-banners";
import { RolesNav } from "@/components/roles-nav";
import { Heatmap, insightCss } from "@/components/market-insights";
import { fRoles } from "@/data/framework";
import { M } from "@/lib/market-data";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("roles/tasks"), title: "Tasks", description: "What applied AI roles do all day: the tasks real job ads ask for, which role asks for each one most, and the daily work of each role." };

const taskName = (id: string) => (M.tasks.find((t) => t.id === id)?.name as string) ?? id;

export default function Tasks() {
  const g = M.insights?.roleTask;
  const max = Math.max(...M.tasks.map((t) => t.share ?? 0), 1);
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="Tasks" />
          <h1 style={{ marginTop: 12 }}><TH k="rt.h1">What the work <mark>actually is</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><T k="rt.lead" vars={{ n: M.totals.processed.toLocaleString("en-US") }}>{"The tasks {n} AI job ads since 1 October ask you to do, which role asks for each one most, and the daily work of every role."}</T></p>
          <div className="frame" style={{ marginTop: 30, padding: "28px 30px" }}><RoleBanner kind="tasks" size="hero" /></div>
        </div>
      </section>

      <section className="section" id="all" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="rt.k_all">Every task in the ads</T></span>
          <h2 style={{ marginTop: 10 }}><T k="rt.h_all">Share of AI job ads that ask for each task</T><span className="dot">.</span></h2>
          <ul className="rt-bars">
            {M.tasks.map((t) => (
              <li key={t.id} id={`task-${t.id}`}>
                <span><T k={`task.${t.id}`}>{t.name ?? ""}</T></span>
                <span className="rodbar"><i style={{ width: `${((t.share ?? 0) / max) * 100}%` }} /></span>
                <span className="count">{t.share}% · {t.n}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {g && (
        <section className="section" id="by-role">
          <div className="wrap">
            <span className="kicker"><T k="rt.k_heat">Role by task</T></span>
            <h2 style={{ marginTop: 10 }}><T k="rt.h_heat">Which roles do which work</T><span className="dot">.</span></h2>
            <p className="muted" style={{ marginTop: 8, maxWidth: "70ch" }}><T k="rt.heat_p">Read across a row to see what a role spends its days on, down a column to see who does a task most. Hover a cell for the number.</T></p>
            <Heatmap g={g} col="task" colLabel={(id) => <T k={`task.${id}`}>{taskName(id)}</T>} />
          </div>
        </section>
      )}

      <section className="section" id="daily" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="rl.tasks">Tasks</T></span>
          <h2 style={{ marginTop: 10 }}><T k="rl.tasks_h">What each role does all day</T><span className="dot">.</span></h2>
          <div className="grid grid-2" style={{ marginTop: 26 }}>
            {fRoles.map((r) => (
              <div key={r.id} className="frame">
                <span className="count"><T k={`fam.${r.family.toLowerCase()}`}>{r.family}</T></span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: 6 }}><Link href={`/roles/families/?role=${r.id}`} style={{ color: "inherit", textDecoration: "none" }}>{r.name}</Link><span className="dot">.</span></h3>
                <ul className="ed">{r.tasks.map((t, i) => <li key={t}><span className="bead" /><T k={`role.${r.id}.task.${i}`}>{t}</T></li>)}</ul>
              </div>
            ))}
          </div>
          <p className="count" style={{ marginTop: 22 }}><T k="rl.certs">Certificates and degrees have their own page:</T> <Link href="/certificates/"><T k="page.certificates">Certificates</T></Link>.</p>
        </div>
      </section>
      <RolesNav here="tasks" />
      <style>{`
        ${insightCss}
        .rt-bars { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 10px; max-width: 900px; }
        .rt-bars li { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) 90px; gap: 14px; align-items: center; scroll-margin-top: 90px; }
        .rt-bars .count { text-align: right; }
        .ed { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; } .ed li { display: flex; gap: 10px; align-items: baseline; } .ed .bead { width: 10px; height: 10px; flex: none; }
      `}</style>
    </>
  );
}
