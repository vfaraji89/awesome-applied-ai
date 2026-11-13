import { SectionIntro } from "@/components/section-intro";
import Link from "next/link";
import type { Metadata } from "next";
import { SkillsExplorer } from "@/components/skills-explorer";
import { fRoles, skills, LEVELS, SOURCES } from "@/data/framework";
import { stack } from "@/data/stack";
import { layers } from "@/data/layers";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";
import { JsonLd } from "@/components/json-ld";
import { rolesLd } from "@/lib/seo";

export const metadata: Metadata = { title: "Roles and skills", description: "A framework for AI-native developers, forward deployed engineers, applied AI and product engineering roles: titles, tasks, skills, stacks." };

export default function Roles() {
  const layerNames = Object.fromEntries(layers.map((l) => [l.id, l.name]));
  return (
    <>
      <JsonLd data={rolesLd()} />
      <section className="section" id="families">
        <div className="wrap">
          <SectionIntro id="roles" h1="Who builds it, and what they need" lead={"Eight role families across AI-native development, forward deployment, applied AI and product engineering. For each: the job titles you will see, the tasks, the stack, and twelve skills scored from aware to expert by what you can actually do."} />
          <div style={{ marginTop: 32 }}><SkillsExplorer roles={fRoles} stack={stack} layerNames={layerNames} /></div>
        </div>
      </section>

      <section className="section" id="matrix">
        <div className="wrap">
          <span className="kicker"><T k="rl.matrix">The whole matrix</T></span>
          <h2 style={{ marginTop: 10 }}><T k="rl.matrix_h">Eight roles, twelve skills</T><span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}><TH k="roles.p1"><b>Red beads</b> show the level each role needs.</TH></p>
          <More label="Levels and the skill map"><p className="lead" style={{ marginTop: 12 }}><TH k="roles.p2" vars={{ v1: LEVELS.slice(1).join(", ").toLowerCase() }}>The levels run {LEVELS.slice(1).join(", ").toLowerCase()}. To see which skills postings ask for <b>together</b>, and which one <b>opens the most doors</b>, open the <Link href="/skills/">skill map</Link>.</TH></p></More>
          <div className="mx-wrap">
            <table className="mx">
              <thead><tr><th><T k="rl.skill">Skill</T></th>{fRoles.map((r) => <th key={r.id}><span>{r.name}</span></th>)}</tr></thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.id}>
                    <th scope="row"><b><T k={`skill.${s.id}`}>{s.name}</T></b><span className="muted"><T k={`skillwhat.${s.id}`}>{s.what}</T></span></th>
                    {fRoles.map((r) => {
                      const lv = r.levels[s.id] ?? 0;
                      return <td key={r.id} title={`${r.name} · ${s.name}: ${LEVELS[lv]}`}><span className="mx-beads">{[0, 1, 2, 3].map((b) => <i key={b} className={b < lv ? "on" : ""} />)}</span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="tasks" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="rl.tasks">Tasks</T></span>
          <h2 style={{ marginTop: 10 }}><T k="rl.tasks_h">What each role does all day</T><span className="dot">.</span></h2>
          <div className="grid grid-2" style={{ marginTop: 26 }}>
            {fRoles.map((r) => (
              <div key={r.id} className="frame">
                <span className="count"><T k={`fam.${r.family.toLowerCase()}`}>{r.family}</T></span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: 6 }}>{r.name}<span className="dot">.</span></h3>
                <ul className="ed">{r.tasks.map((t, i) => <li key={t}><span className="bead" /><T k={`role.${r.id}.task.${i}`}>{t}</T></li>)}</ul>
              </div>
            ))}
          </div>
          <p className="count" style={{ marginTop: 22 }}><T k="rl.certs">Certificates and degrees have their own page:</T> <Link href="/certificates/"><T k="page.certificates">Certificates</T></Link>.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker"><T k="rl.sources">Sources</T></span>
          <p className="muted" style={{ marginTop: 10, maxWidth: "70ch" }}><T k="rl.sources_p">Built from 2026 job postings and role guides. The skill levels are an editorial synthesis of them, not an industry standard.</T></p>
          <ul className="src">{SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></li>)}</ul>
        </div>
      </section>
      <style>{`
        .mx-wrap { margin-top: 24px; overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; }
        .mx { border-collapse: collapse; width: 100%; min-width: 980px; font-size: .88rem; }
        .mx th, .mx td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
        .mx thead th { font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .04em; color: var(--sec); font-weight: 400; vertical-align: bottom; }
        .mx tbody th { display: flex; flex-direction: column; gap: 2px; font-weight: 400; min-width: 220px; } .mx tbody th .muted { font-size: .78rem; }
        .mx-beads { display: inline-flex; gap: 3px; } .mx-beads i { width: 10px; height: 10px; border-radius: 50%; background: var(--line-strong); }
        .mx-beads i.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .ed { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; } .ed li { display: flex; gap: 10px; align-items: baseline; } .ed .bead { width: 10px; height: 10px; flex: none; }
        .src { margin: 14px 0 0; padding-left: 18px; display: grid; gap: 6px; color: var(--sec); } .src a { text-decoration: none; } .src a:hover { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
