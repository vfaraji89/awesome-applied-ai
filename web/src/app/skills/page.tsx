import type { Metadata } from "next";
import { Crumb } from "@/components/section-intro";
import { SkillMap } from "@/components/skill-map";
import { More } from "@/components/more";
import { TH } from "@/i18n/lang";

export const metadata: Metadata = { title: "Skill map", description: "Which applied AI skills employers ask for together, which pairs are rare, and which one skill would open the most job postings for you. Computed from real postings." };

export default function Skills() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="roles" page="Skill map" />
        <h1 style={{ marginTop: 12 }}><TH k="skills.h1">Skills are not a list. <mark>They are a map</mark></TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><TH k="skills.p1">Postings ask for skills <b>in packs</b>. Find <b>which skills travel together</b> and <b>which one opens the most doors</b> for you.</TH></p>
        <More>
          <p className="lead" style={{ marginTop: 12 }}><TH k="skills.p2">Everything here is read from real job postings: which skills employers ask for together, which pairs are <b>rare in one person</b>, and which single skill would open the most postings for you next.</TH></p>
        </More>
        <div style={{ marginTop: 34 }}><SkillMap /></div>
      </div>
    </section>
  );
}
