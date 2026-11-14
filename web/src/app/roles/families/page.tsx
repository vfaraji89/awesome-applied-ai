import type { Metadata } from "next";
import { Crumb } from "@/components/section-intro";
import { SkillsExplorer } from "@/components/skills-explorer";
import { RoleBanner } from "@/components/role-banners";
import { RolesNav } from "@/components/roles-nav";
import { fRoles } from "@/data/framework";
import { stack } from "@/data/stack";
import { layers } from "@/data/layers";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("roles/families"), title: "Role families", description: "Eight applied AI roles in five families: the titles they are posted under, what they do, the stack they use, twelve skills scored and how each role grows." };

export default function Families() {
  const layerNames = Object.fromEntries(layers.map((l) => [l.id, l.name]));
  const fams = new Set(fRoles.map((r) => r.family)).size;
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="Role families" />
          <h1 style={{ marginTop: 12 }}><TH k="rf.h1" vars={{ n: fRoles.length, f: fams }}>{fRoles.length} roles, <mark>{fams} families</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><T k="rf.lead">Touch a bead to meet a role. The page below follows: its titles, tasks, stack, skills and how it grows.</T></p>
          <div className="frame" style={{ marginTop: 30, padding: "28px 30px" }}><RoleBanner kind="families" size="hero" sync /></div>
          <div id="explorer" style={{ marginTop: 34 }}><SkillsExplorer roles={fRoles} stack={stack} layerNames={layerNames} /></div>
        </div>
      </section>
      <RolesNav here="families" />
    </>
  );
}
