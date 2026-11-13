import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { SkillMap } from "@/components/skill-map";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { M } from "@/lib/market-data";
import { Aha, Heatmap, LabsVsRest, SkillProfiles, insightCss, insightCss2 } from "@/components/market-insights";

export const metadata: Metadata = { ...share("skills"), title: "Skill map", description: "Which applied AI skills employers ask for together, which pairs are rare, and which one skill would open the most job ads for you; each skill opened with who asks for it, what comes with it and the tools that stand out. Computed from real job ads." };

export default function Skills() {
  const ins = M.insights;
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="Skill map" />
          <h1 style={{ marginTop: 12 }}><TH k="skills.h1">Skills are not a list. <mark>They are a map</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><TH k="skills.p1">Postings ask for skills <b>in packs</b>. Find <b>which skills travel together</b> and <b>which one opens the most doors</b> for you.</TH></p>
          <More>
            <p className="lead" style={{ marginTop: 12 }}><TH k="skills.p2">Everything here is read from real job postings: which skills employers ask for together, which pairs are <b>rare in one person</b>, and which single skill would open the most postings for you next.</TH></p>
          </More>
          {ins && <Aha only="ticker" ins={ins} total={M.totals.processed} roles={M.roles} skillsTop={M.skills} tasks={M.tasks} affected={M.affected} tech={M.tech} years={M.years} />}
          <div style={{ marginTop: 34 }}><SkillMap /></div>
        </div>
      </section>

      {ins && (
        <>
          <section className="section" id="every-skill" style={{ background: "var(--paper)" }}>
            <div className="wrap">
              <span className="kicker"><T k="mi.k_prof">Every skill, opened</T></span>
              <h2 style={{ marginTop: 10 }}><T k="mi.h_prof">What each skill means in the ads</T><span className="dot">.</span></h2>
              <p className="muted" style={{ marginTop: 8, maxWidth: "75ch" }}><T k="sk.prof_p" vars={{ n: M.totals.processed.toLocaleString("en-US") }}>{"Share of {n} AI job ads since 1 October that ask for each skill, the role that asks most, the skills that come with it more than usual, and the tools that stand out next to it."}</T></p>
              <SkillProfiles list={ins.skills} />
            </div>
          </section>

          <section className="section" id="by-role">
            <div className="wrap">
              <span className="kicker"><T k="mi.k_heat">Role by skill</T></span>
              <h2 style={{ marginTop: 10 }}><T k="sk.h_heat">Which roles each skill opens</T><span className="dot">.</span></h2>
              <p className="muted" style={{ marginTop: 8, maxWidth: "70ch" }}><T k="mi.heat_p">Read across a row to see a role&apos;s profile, down a column to see which roles a skill opens. Hover a cell for the number.</T></p>
              <Heatmap g={ins.roleSkill} col="skill" />
            </div>
          </section>

          {ins.labs && (
            <section className="section" id="labs" style={{ background: "var(--paper)" }}>
              <div className="wrap">
                <span className="kicker"><T k="mi.k_labs">The labs against everyone else</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mi.h_labs">What AI labs ask for differently</T><span className="dot">.</span></h2>
                <p className="muted" style={{ marginTop: 8, maxWidth: "70ch" }}><T k="sk.labs_p">Each skill as a share of the ads read from AI labs&apos; own career pages, against every other ad. Sorted by the size of the gap.</T></p>
                <div style={{ maxWidth: 820 }}><LabsVsRest labs={ins.labs} /></div>
              </div>
            </section>
          )}

          <section className="section">
            <div className="wrap">
              <p className="count"><T k="sk.more">The roles, levels, tasks, stack and AI beyond AI jobs are on the market pulse.</T> <Link href="/market/"><T k="sk.more_go">Open the market pulse</T> →</Link></p>
            </div>
          </section>
        </>
      )}
      <style>{insightCss}</style>
      <style>{insightCss2}</style>
    </>
  );
}
