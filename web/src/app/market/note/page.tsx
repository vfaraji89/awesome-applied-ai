import { T } from "@/i18n/lang";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { Crumb } from "@/components/section-intro";
import { Mark } from "@/components/mark";
import { fRoles, skills } from "@/data/framework";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("market/note"), title: "Weekly market note", description: "What changed this week in applied AI hiring: new roles, and the skills and tools they ask for." };

/* The weekly note, written at build time from the tracker's own store.
   "New" means a role first seen in the last seven days. The first day of tracking
   is left out, because on that day every open role looked new. */
type Job = { role: string; seniority: string; remote: boolean; skills: string[]; tools: string[]; firstSeen: string; lastSeen: string };

function load(): Job[] {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "..", "market", "jobs.json"), "utf8")) as Job[]; } catch { return []; }
}
type Week = { week: string; from: string; to: string; open: number; new: number; remoteShare: number };
function weeks(): Week[] {
  try {
    const dir = path.join(process.cwd(), "..", "market", "weekly");
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Week);
  } catch { return []; }
}
const top = (xs: string[], n: number) => {
  const m = new Map<string, number>();
  for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};
const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function Note() {
  const jobs = load();
  const hist = weeks();
  const days = [...new Set(jobs.map((j) => j.firstSeen))].sort();
  const first = days[0], last = jobs.map((j) => j.lastSeen).sort().at(-1) ?? days.at(-1);
  const from = last ? new Date(new Date(last + "T00:00:00Z").getTime() - 6 * 864e5).toISOString().slice(0, 10) : "";
  const fresh = jobs.filter((j) => j.firstSeen !== first && j.firstSeen >= from);
  const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? "";
  const roleEn = (id: string) => roleName(id) || "Other AI roles";
  const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
  const roles = top(fresh.map((j) => j.role), 4);
  const sk = top(fresh.flatMap((j) => j.skills), 4);
  const tl = top(fresh.flatMap((j) => j.tools), 5);
  const remote = fresh.length ? Math.round((fresh.filter((j) => j.remote).length / fresh.length) * 100) : 0;
  const pct = (n: number) => (fresh.length ? Math.round((n / fresh.length) * 100) : 0);
  const post = fresh.length
    ? `Applied AI hiring, ${fmt(from)} to ${fmt(last!)}: ${fresh.length} new technical AI job ads on the career pages and boards I read.\n\n` +
      `Most common: ${roles.map(([r, n]) => `${roleEn(r)} (${n})`).join(", ")}.\n` +
      `Skills asked for most: ${sk.map(([s, n]) => `${skillName(s)} ${pct(n)}%`).join(", ")}.\n` +
      `Tools named most: ${tl.map(([t]) => t).join(", ")}.\n\n` +
      `Updated weekly from public job boards: vfaraji89.github.io/awesome-applied-ai/market/`
    : "";
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="market" page="Weekly note" />
        <h1 style={{ marginTop: 12 }}><T k="wn.h1">This week in applied AI hiring</T><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><T k="wn.lead">Written from the tracker every time the site builds. Screenshot the card, or copy the text under it.</T></p>

        {fresh.length === 0 ? (
          <div className="frame" style={{ marginTop: 32 }}><p className="lead"><T k="wn.empty">Not enough history yet. The note appears once the tracker has run for a few days.</T></p></div>
        ) : (
          <>
            <div className="wn" aria-label="Weekly note card">
              <span className="wn-post l" /><span className="wn-post r" />
              <div className="wn-top"><Mark size={34} /><b>Applied AI<span className="dot">.</span></b><span className="kicker"><T k="wn.k" vars={{ from: fmt(from), to: fmt(last!) }}>{"market note · {from} to {to}"}</T></span></div>
              <div className="wn-big"><b>{fresh.length}</b><span><T k="wn.new2">new AI job ads this week</T><br /><em><T k="wn.remote" vars={{ n: remote }}>{"{n}% remote"}</T></em></span></div>
              <div className="wn-cols">
                <div><span className="kicker"><T k="mk.k_roles">Roles</T></span><ul>{roles.map(([r, n]) => <li key={r}><span className="bead" />{roleName(r) || <T k="mk.other">Other AI roles</T>}<i>{n}</i></li>)}</ul></div>
                <div><span className="kicker"><T k="wn.skills">Skills asked for</T></span><ul>{sk.map(([s, n]) => <li key={s}><span className="bead ink" /><T k={`skill.${s}`}>{skillName(s)}</T><i>{pct(n)}%</i></li>)}</ul></div>
                <div><span className="kicker"><T k="wn.tools">Tools named</T></span><ul>{tl.map(([t, n]) => <li key={t}><span className="bead white" />{t}<i>{n}</i></li>)}</ul></div>
              </div>
              <div className="wn-foot mono">vfaraji89.github.io/awesome-applied-ai/market</div>
            </div>
            <h2 style={{ marginTop: 44 }}><T k="wn.post">As a post, in English</T><span className="dot">.</span></h2>
            <pre className="wn-text">{post}</pre>
            {hist.length > 0 && (
              <>
                <h2 style={{ marginTop: 44 }}><T k="wn.weeks">Week by week</T><span className="dot">.</span></h2>
                <table className="wn-hist">
                  <thead><tr><th><T k="wn.th_week">Week</T></th><th><T k="wn.th_dates">Dates</T></th><th><T k="wn.th_open">Active roles</T></th><th><T k="wn.th_new">New</T></th><th><T k="mk.remote">Remote</T></th></tr></thead>
                  <tbody>{hist.slice().reverse().map((w) => <tr key={w.week}><td className="mono">{w.week}</td><td>{fmt(w.from)} – {fmt(w.to)}</td><td>{w.open}</td><td>{w.new}</td><td>{w.remoteShare}%</td></tr>)}</tbody>
                </table>
              </>
            )}
            <p className="count" style={{ marginTop: 14 }}><T k="wn.foot" vars={{ d: fmt(first) }}>{"New means first seen in the last seven days. Tracking began on {d}; that first day is left out because every open role looked new then."}</T></p>
          </>
        )}
      </div>
      <style>{`
        .wn { position: relative; margin-top: 34px; max-width: 880px; padding: 44px 64px 34px; border-radius: 22px; background: var(--paper); overflow: hidden; border: 1px solid var(--line);
          background-image: radial-gradient(rgba(28,28,30,.06) 1.3px, transparent 1.5px); background-size: 22px 22px; }
        .wn-post { position: absolute; top: 22px; bottom: 22px; width: 12px; border-radius: 99px; background: var(--dowel); } .wn-post.l { left: 22px; } .wn-post.r { right: 22px; }
        .wn-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .wn-top b { font-size: 1.25rem; font-weight: 800; letter-spacing: -.03em; }
        .wn-big { display: flex; align-items: center; gap: 18px; margin-top: 26px; }
        .wn-big b { font-size: clamp(4rem, 13vw, 7rem); font-weight: 800; letter-spacing: -.05em; line-height: .9; color: var(--rust); }
        .wn-big span { font-size: clamp(1.1rem, 2.6vw, 1.5rem); font-weight: 700; letter-spacing: -.02em; line-height: 1.25; } .wn-big em { font-style: normal; font-weight: 400; color: var(--sec); font-size: .8em; }
        .wn-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; margin-top: 30px; }
        .wn-cols ul { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; }
        .wn-cols li { display: grid; grid-template-columns: 12px 1fr auto; gap: 8px; align-items: center; font-size: .92rem; }
        .wn-cols .bead { width: 12px; height: 12px; } .wn-cols .bead.ink { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
        .wn-cols i { font-style: normal; font-family: var(--font-mono), monospace; font-size: .8rem; color: var(--sec); }
        .wn-foot { margin-top: 28px; font-size: .8rem; color: var(--rust-deep); }
        .wn-text { margin-top: 14px; max-width: 880px; white-space: pre-wrap; padding: 18px 20px; border-radius: 14px; border: 1px solid var(--line); background: var(--card); font-family: var(--font-sans), system-ui, sans-serif; font-size: .98rem; line-height: 1.55; user-select: all; }
        .wn-hist { margin-top: 14px; border-collapse: collapse; width: 100%; max-width: 880px; font-size: .92rem; }
        .wn-hist th, .wn-hist td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--line); }
        .wn-hist th { font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .06em; text-transform: uppercase; color: var(--sec); font-weight: 400; }
        @media (max-width: 720px) { .wn { padding: 34px 40px 26px; } .wn-cols { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
