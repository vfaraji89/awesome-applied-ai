import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { PeopleBrowser, type Person } from "@/components/people";
import data from "@/data/people.json";

export const metadata: Metadata = { ...share("people"), title: "People", description: "The people building applied AI who keep showing up on its main stages: their role, where they work, what they build and what they talk about, each fact linked to its source." };

export default function People() {
  const people = data.people as unknown as Person[];
  const span = [...new Set(people.flatMap((p) => p.years))].sort();
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="roles" page="People" />
        <h1 style={{ marginTop: 12 }}><TH k="pp.h1">The people <mark>building applied AI</mark></TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><T k="pp.lead" vars={{ n: people.length }}>{"{n} builders who keep showing up on the main stages: who they are, where they work, what they build and what they talk about."}</T></p>
        <div style={{ marginTop: 30 }}><PeopleBrowser people={people} span={span} /></div>
        <p className="muted" style={{ marginTop: 30, maxWidth: "78ch", fontSize: ".9rem" }}>
          <T k="pp.how">Chosen from everyone who has spoken at AI Engineer: two or more editions or three or more talks, a talk since 2025, at most three people per company, then checked by hand. Role and company are as their AI Engineer speaker page states them; skills come from their talk titles, read with the same rules as the job ads.</T>{" "}
          <Link href="/contribute/"><T k="pp.fix">Something wrong, or want a profile removed?</T></Link>
        </p>
      </div>
    </section>
  );
}
