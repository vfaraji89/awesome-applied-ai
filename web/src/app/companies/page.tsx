import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { CompaniesBrowser, type Company } from "@/components/companies";
import { skills, fRoles } from "@/data/framework";
import data from "@/data/companies.json";

export const metadata: Metadata = { ...share("companies"), title: "Companies", description: "Applied AI companies seen three ways: the active AI roles on their career page and what those ads ask for, their products on the tool map, and their talks on the main stages." };

export default function Companies() {
  const companies = data.companies as unknown as Company[];
  const skillNames = Object.fromEntries(skills.map((s) => [s.id, s.name]));
  const roleNames = { ...Object.fromEntries(fRoles.map((r) => [r.id, r.name])), "other-ai": "other AI roles" };
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="people" page="Companies" />
        <h1 style={{ marginTop: 12 }}><TH k="cp.h1">The companies <mark>behind applied AI</mark></TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><T k="cp.lead" vars={{ n: companies.length }}>{"{n} companies seen three ways: who they are hiring, what they build, and what they bring to the stage."}</T></p>
        <div style={{ marginTop: 30 }}><CompaniesBrowser companies={companies} skillNames={skillNames} roleNames={roleNames} /></div>
        <p className="muted" style={{ marginTop: 30, maxWidth: "78ch", fontSize: ".9rem" }}>
          <T k="cp.how" vars={{ d: data.updated ?? "" }}>{"Listed when at least two of the three show them, when they have 10 or more active AI roles, or when an AI lab is hiring. Active roles: the AI job ads on their own career page at the tracker's last read ({d}). Products: tools on the map named like the company or on its website. Stage: their speakers and talks at AI Engineer."}</T>{" "}
          <Link href="/market/sources/"><T k="cp.to_sources">Every career page read</T> →</Link>
        </p>
      </div>
    </section>
  );
}
