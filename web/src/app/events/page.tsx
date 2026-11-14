import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { EventsCalendar, type Ev } from "@/components/events-calendar";
import data from "@/data/events.json";
import conf from "@/data/conferences.json";

export const metadata: Metadata = { ...share("events"), title: "Events calendar", description: "The major AI engineering, AI software and AI platform events coming up, with official dates only: a year at a glance, a month calendar, and add-to-calendar for each." };

export default function Events() {
  const today = new Date().toISOString().slice(0, 10);
  // AI Engineer's own upcoming editions, from its published list, unless already in the calendar
  const aie = (conf as { upcoming: { name: string; start: string; end: string; location: string; url: string }[] }).upcoming
    .filter((u) => !data.events.some((e) => e.name === u.name))
    .map((u) => ({ name: u.name, type: "aieng", start: u.start, end: u.end, city: u.location, region: /london|paris|europe|berlin|amsterdam/i.test(`${u.location} ${u.name}`) ? "eu" : /singapore|shanghai|tokyo|sydney/i.test(u.location) ? "apac" : "na", url: u.url, note: "An AI Engineer conference: talks and workshops for engineers building with AI." }));
  const events = [...(data.events as Ev[]), ...aie].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="market" page="Events calendar" />
        <h1 style={{ marginTop: 12 }}><TH k="ev.h1">The year in <mark>applied AI events</mark></TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><T k="ev.lead">The major AI engineering, AI software and AI platform events coming up. Official dates only: if an organiser has not published them, the event waits below until it does.</T></p>
        <div style={{ marginTop: 30 }}><EventsCalendar events={events} recent={data.recent as Ev[]} types={data.types} today={today} /></div>

        <div className="ev-wait">
          <span className="kicker"><T k="ev.k_wait">Announced, not yet dated</T></span>
          <ul>
            {data.notDated.map((e) => (
              <li key={e.name} className="frame"><span className={`ev-dot t-${e.type}`} /><div><a href={e.url} target="_blank" rel="noreferrer"><b>{e.name}</b> ↗</a><span className="count"><T k="ev.last" vars={{ d: e.last }}>{"Last edition: {d}"}</T></span></div></li>
            ))}
          </ul>
        </div>
        <p className="muted" style={{ marginTop: 26, maxWidth: "78ch", fontSize: ".9rem" }}>
          <T k="ev.how" vars={{ d: data.checked }}>{"Dates from each organiser's official page, checked on {d}; AI Engineer editions come in automatically from its published list. Where an organiser's pages disagree, the note on the event says so."}</T>{" "}
          <Link href="/market/conferences/"><T k="ev.to_conf">What these conferences talk about</T> →</Link> · <Link href="/contribute/"><T k="ev.suggest">Suggest an event</T></Link>
        </p>
      </div>
      <style>{`
        .ev-wait { margin-top: 34px; } .ev-wait ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 12px; }
        .ev-wait li { display: flex; gap: 12px; align-items: center; padding: 14px 18px; } .ev-wait li div { display: grid; gap: 2px; } .ev-wait a { text-decoration: none; } .ev-wait a:hover b { color: var(--rust-deep); }
        .ev-dot { width: 12px; height: 12px; border-radius: 50%; flex: none; background: var(--b, var(--rust)); }
        .ev-dot.t-aieng { --b: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); } .ev-dot.t-dev { --b: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
        .ev-dot.t-platform { --b: radial-gradient(circle at 34% 30%, #9db7dc, #3f66a3 50%, #1f3a66); } .ev-dot.t-data { --b: radial-gradient(circle at 34% 30%, #f6d79a, #d39a3a 50%, #8f5f14); }
      `}</style>
    </section>
  );
}
