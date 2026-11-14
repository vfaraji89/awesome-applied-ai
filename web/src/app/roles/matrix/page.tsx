import type { Metadata } from "next";
import { Crumb } from "@/components/section-intro";
import { RoleBanner } from "@/components/role-banners";
import { SkillsMatrix } from "@/components/skills-matrix";
import { RolesNav } from "@/components/roles-nav";
import { fRoles, skills } from "@/data/framework";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("roles/matrix"), title: "Skills matrix", description: "Twelve applied AI skills against eight roles, each scored from aware to expert by what you can actually do. Compare any two roles and see which skills change." };

export default function Matrix() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="Skills matrix" />
          <h1 style={{ marginTop: 12 }}><TH k="rm.h1" vars={{ r: fRoles.length, s: skills.length }}>{fRoles.length} roles, <mark>{skills.length} skills</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><T k="rm.lead">Each bead is one level, from aware to expert. Pick a role to light its column, then compare it with another to see what changes.</T></p>
          <div className="frame" style={{ marginTop: 30, padding: "28px 30px" }}><RoleBanner kind="matrix" size="hero" sync /></div>
          <div style={{ marginTop: 34 }}><SkillsMatrix /></div>
          <p className="muted" style={{ marginTop: 18, maxWidth: "70ch" }}><T k="rl.sources_p">Built from 2026 job postings and role guides. The skill levels are an editorial synthesis of them, not an industry standard.</T></p>
        </div>
      </section>
      <RolesNav here="matrix" />
    </>
  );
}
