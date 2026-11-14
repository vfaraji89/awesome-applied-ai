"use client";
import { T } from "@/i18n/lang";
import { Odometer, useInView } from "./odometer";

/* The match centre (brand/broadcast.html, D): the AI labs against everyone else, as a broadcast
   stats panel. Scoreline, a possession-style split, head-to-head skill rows growing from the
   centre, weekly momentum, key moments and a player card, all computed from the tracker. */
export type MatchData = {
  lab: number; rest: number;
  skills: { id: string; name: string; lab: number; rest: number }[];
  weeks: { week: string; n: number; partial?: boolean }[];
};
const fmtDay = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function MatchCentre({ data }: { data: MatchData }) {
  const [ref, on] = useInView<HTMLDivElement>(0.2);
  const total = data.lab + data.rest;
  const labShare = Math.round((data.lab / total) * 100);
  const rows = [...data.skills].sort((a, b) => Math.abs(b.lab - b.rest) - Math.abs(a.lab - a.rest)).slice(0, 6);
  const lead = [...data.skills].sort((a, b) => (b.lab - b.rest) - (a.lab - a.rest))[0];
  const weeks = data.weeks;
  const full = weeks.filter((w) => !w.partial);
  const busiest = full.reduce((m, w) => (w.n > m.n ? w : m), full[0]);
  let jump = { i: 1, r: 0 };
  for (let i = 1; i < full.length; i++) { const r = full[i].n / Math.max(1, full[i - 1].n); if (i > 1 && r > jump.r) jump = { i, r }; }
  const jw = full[jump.i], jp = full[jump.i - 1];
  const now = weeks.find((w) => w.partial);
  const max = Math.max(...weeks.map((w) => w.n));
  const fade = (k: number) => ({ transitionDelay: `${450 + k * 90}ms` });
  return (
    <div ref={ref} className={`mc-wrap${on ? " on" : ""}`}>
      <span className="mc-post l" aria-hidden="true" /><span className="mc-post r" aria-hidden="true" />
      <div className="mc">
        <div className="mc-top fade" style={fade(0)}><span><T k="mc.top" vars={{ d: fmtDay(weeks[0].week) }}>{"AI job ads · since {d}"}</T></span><span className="live"><i /><T k="mc.live">Live</T></span></div>
        <div className="mc-score fade" style={fade(1)}>
          <div className="mc-team"><span className="mc-crest lab" /><div><b><T k="mc.labs">AI labs</T></b><small><T k="mc.labs_sub">OpenAI, Anthropic, DeepMind and more</T></small></div></div>
          <div className="mc-board"><Odometer value={data.lab.toLocaleString("en-US")} run={on} delay={700} /><span className="sep" /><Odometer value={data.rest.toLocaleString("en-US")} run={on} delay={850} /></div>
          <div className="mc-team r"><div><b><T k="mc.rest">Everyone else</T></b><small><T k="mc.rest_sub">career pages and boards</T></small></div><span className="mc-crest rest" /></div>
        </div>
        <div className="mc-split fade" style={fade(2)}>
          <div className="lbl"><b>{labShare}%</b><span><T k="mc.share">Share of AI job ads</T></span><b>{100 - labShare}%</b></div>
          <div className="mc-bar"><span className="a" style={{ width: on ? `${labShare}%` : 0 }} /><span className="b" style={{ width: on ? `${100 - labShare}%` : 0 }} /></div>
        </div>
        <div className="mc-rows">
          {rows.map((r, i) => {
            const a = r.lab > r.rest, b = r.rest > r.lab;
            return (
              <div key={r.id} className="mc-row fade" style={fade(3 + i)}>
                <span className="t"><T k={`skill.${r.id}`}>{r.name}</T></span>
                <span className={`v${a ? " win" : ""}`}>{r.lab}%</span>
                <span className="bars"><span><i className={a ? "win" : ""} style={{ width: on ? `${r.lab}%` : 0, transitionDelay: `${1400 + i * 90}ms` }} /></span><span><i className={b ? "win" : ""} style={{ width: on ? `${r.rest}%` : 0, transitionDelay: `${1400 + i * 90}ms` }} /></span></span>
                <span className={`v r${b ? " win" : ""}`}>{r.rest}%</span>
              </div>
            );
          })}
        </div>
        <div className="mc-low">
          <div className="fade" style={fade(9)}>
            <div className="mc-h"><T k="mc.mom">Momentum · new AI ads a week</T></div>
            <div className="mc-mom">
              {weeks.map((w, i) => (
                <div key={w.week} className={w === busiest ? "peak" : w.partial ? "part" : ""}>
                  <em>{w.n}</em>
                  <span className="col" style={{ height: on ? `${(w.n / max) * 78}%` : 0, transitionDelay: `${2100 + i * 70}ms` }} />
                  <small>{fmtDay(w.week)}{w.partial ? "*" : ""}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="fade" style={fade(10)}>
            <div className="mc-h"><T k="mc.moments">Key moments</T></div>
            <div className="mc-tl">
              <div><b><T k="mc.start">Tracking starts</T></b><small><T k="mc.start_s" vars={{ d: fmtDay(weeks[0].week), n: weeks[0].n }}>{"{d} · {n} ads that week"}</T></small></div>
              {jw && jp && <div className="hot"><b><T k="mc.jump" vars={{ p: Math.round((jump.r - 1) * 100) }}>{"Biggest jump, +{p}%"}</T></b><small><T k="mc.jump_s" vars={{ d: fmtDay(jw.week), a: jp.n, b: jw.n }}>{"week of {d} · {a} to {b}"}</T></small></div>}
              {busiest && <div><b><T k="mc.busy">Busiest full week</T></b><small><T k="mc.busy_s" vars={{ d: fmtDay(busiest.week), n: busiest.n }}>{"week of {d} · {n} ads"}</T></small></div>}
              {now && <div><b><T k="mc.now">This week, still counting</T></b><small><T k="mc.now_s" vars={{ d: fmtDay(now.week), n: now.n }}>{"{d} · {n} so far"}</T></small></div>}
            </div>
          </div>
        </div>
        {lead && lead.lab > lead.rest && (
          <div className="mc-card" style={{ transitionDelay: "2700ms" }}>
            <span className="big">+{lead.lab - lead.rest}</span>
            <div><b><T k={`skill.${lead.id}`}>{lead.name}</T></b><small><T k="mc.lead" vars={{ a: lead.lab, b: lead.rest }}>{"the labs' biggest lead · {a}% against {b}%"}</T></small></div>
          </div>
        )}
        <span className="mc-glint" aria-hidden="true" />
      </div>
      <p className="count mc-note"><T k="mc.note">* the current week is partial. Shares are of each side's own ads; momentum counts every AI ad.</T></p>
      <style>{`
        .mc-wrap { position: relative; padding: 8px 6px; }
        .mc-post { position: absolute; top: 0; bottom: 28px; width: 9px; border-radius: 5px; background: var(--dowel); z-index: 3; left: calc(50% - 4.5px); transition: left .9s cubic-bezier(.77,0,.18,1); }
        .mc { position: relative; overflow: hidden; border-radius: 6px; color: #f2efe9; padding: 26px 30px 28px; clip-path: inset(0 50% 0 50%); transition: clip-path .9s cubic-bezier(.77,0,.18,1);
          background-color: #141312; background-image: linear-gradient(180deg, #1d1a19 0%, #141312 60%), var(--rod), var(--rod); background-size: 100% 100%, 100% 3px, 100% 3px; background-position: 0 0, top, bottom; background-repeat: no-repeat; }
        .mc .fade { opacity: 0; transform: translateY(8px); transition: opacity .45s ease, transform .6s cubic-bezier(.16,1,.3,1); }
        .mc-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; font: .68rem var(--font-mono), monospace; letter-spacing: .12em; text-transform: uppercase; color: #a8a19a; }
        .mc-top .live { display: inline-flex; align-items: center; gap: 7px; color: #fff; } .mc-top .live i { width: 10px; height: 10px; border-radius: 50%; background: var(--bead-red); }
        .mc-score { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 22px; margin: 18px 0 6px; }
        .mc-team { display: flex; align-items: center; gap: 14px; min-width: 0; } .mc-team.r { justify-content: flex-end; text-align: right; }
        .mc-crest { width: 46px; height: 46px; border-radius: 50%; flex: none; } .mc-crest.lab { background: var(--bead-red); } .mc-crest.rest { background: radial-gradient(circle at 34% 30%, #fff 0%, #e8e2db 40%, #a59c92 100%); }
        .mc-team b { display: block; font-size: 1.15rem; font-weight: 800; letter-spacing: -.02em; } .mc-team small { font: .64rem var(--font-mono), monospace; color: #a8a19a; letter-spacing: .08em; text-transform: uppercase; }
        .mc-board { display: flex; align-items: center; gap: 12px; font-size: 2.9rem; font-weight: 800; letter-spacing: -.04em; color: #fff; }
        .mc-board .sep { width: 14px; height: 3px; border-radius: 2px; background: var(--rod); }
        .mc-split { margin: 20px 0 6px; } .mc-split .lbl { display: flex; justify-content: space-between; align-items: baseline; font: .68rem var(--font-mono), monospace; letter-spacing: .1em; text-transform: uppercase; color: #a8a19a; margin-bottom: 8px; }
        .mc-split .lbl b { font: 800 1.05rem var(--font-sans), sans-serif; letter-spacing: -.02em; color: #fff; }
        .mc-bar { display: flex; height: 10px; border-radius: 6px; overflow: hidden; background: #2a2624; }
        .mc-bar .a { background: linear-gradient(90deg, #9e1a0c, #e0301e); transition: width 1s cubic-bezier(.16,1,.3,1) 1.1s; } .mc-bar .b { margin-left: auto; background: linear-gradient(90deg, #d8d1c9, #f2efe9); transition: width 1s cubic-bezier(.16,1,.3,1) 1.1s; }
        .mc-rows { display: grid; gap: 12px; margin-top: 22px; }
        .mc-row { display: grid; grid-template-columns: 52px minmax(0, 1fr) 52px; gap: 12px; align-items: center; }
        .mc-row .t { grid-column: 1 / -1; text-align: center; font-size: .8rem; color: #cfc8c0; margin-bottom: -4px; }
        .mc-row .v { font-weight: 800; font-size: 1.05rem; font-variant-numeric: tabular-nums; color: #8a837c; } .mc-row .v.r { text-align: right; } .mc-row .v.win { color: #fff; }
        .mc-row .bars { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; height: 7px; }
        .mc-row .bars > span { position: relative; background: #2a2624; border-radius: 4px; overflow: hidden; }
        .mc-row .bars i { position: absolute; top: 0; bottom: 0; border-radius: 4px; transition: width .9s cubic-bezier(.16,1,.3,1); }
        .mc-row .bars > span:first-child i { right: 0; background: #6e2a22; } .mc-row .bars > span:last-child i { left: 0; background: #5d5853; }
        .mc-row .bars > span:first-child i.win { background: linear-gradient(270deg, #e0301e, #ff7a66); } .mc-row .bars > span:last-child i.win { background: linear-gradient(90deg, #d8d1c9, #fff); }
        .mc-low { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 28px; margin-top: 26px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.08); }
        .mc-h { font: .68rem var(--font-mono), monospace; letter-spacing: .12em; text-transform: uppercase; color: #a8a19a; margin-bottom: 12px; }
        .mc-mom { display: flex; align-items: flex-end; gap: 10px; height: 130px; }
        .mc-mom > div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%; }
        .mc-mom .col { position: relative; width: 100%; max-width: 26px; border-radius: 4px 4px 2px 2px; background: linear-gradient(180deg, #5d5853, #3a3633); transition: height .8s cubic-bezier(.16,1,.3,1); }
        .mc-mom .col::after { content: ""; position: absolute; left: 50%; top: -6px; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff 0%, #e8e2db 40%, #a59c92 100%); }
        .mc-mom .peak .col { background: linear-gradient(180deg, #e0301e, #7a1a10); } .mc-mom .peak .col::after { background: var(--bead-red); }
        .mc-mom .part .col { background: repeating-linear-gradient(180deg, #4a4542 0 4px, transparent 4px 7px); }
        .mc-mom small { font: .6rem var(--font-mono), monospace; color: #8a837c; white-space: nowrap; } .mc-mom em { font: normal 700 .74rem var(--font-sans), sans-serif; color: #fff; }
        .mc-tl { position: relative; padding-left: 22px; display: grid; gap: 14px; }
        .mc-tl::before { content: ""; position: absolute; left: 6px; top: 4px; bottom: 4px; width: 3px; border-radius: 2px; background: var(--rod); }
        .mc-tl > div { position: relative; } .mc-tl > div::before { content: ""; position: absolute; left: -22px; top: 3px; width: 15px; height: 15px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff 0%, #e8e2db 40%, #a59c92 100%); }
        .mc-tl > div.hot::before { background: var(--bead-red); }
        .mc-tl b { display: block; font-size: .9rem; } .mc-tl small { font: .64rem var(--font-mono), monospace; color: #a8a19a; letter-spacing: .06em; text-transform: uppercase; }
        .mc-card { display: flex; align-items: center; gap: 16px; margin-top: 22px; padding: 14px 18px; border-radius: 6px; background: linear-gradient(90deg, rgba(224,48,30,.22), rgba(224,48,30,.04)); transform: translateX(-24px); opacity: 0; transition: transform .7s cubic-bezier(.16,1,.3,1), opacity .4s; }
        .mc-card .big { font-size: 2.2rem; font-weight: 800; letter-spacing: -.04em; color: #ff7a66; } .mc-card b { display: block; } .mc-card small { font: .64rem var(--font-mono), monospace; color: #cfc8c0; letter-spacing: .08em; text-transform: uppercase; }
        .mc-glint { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.07) 48%, transparent 62%); transform: translateX(-120%); }
        .mc-note { margin-top: 10px; }
        .mc-wrap.on .mc-post.l { left: -2px; } .mc-wrap.on .mc-post.r { left: calc(100% - 7px); } .mc-wrap.on .mc { clip-path: inset(0 0 0 0); }
        .mc-wrap.on .mc .fade { opacity: 1; transform: none; } .mc-wrap.on .mc-card { transform: none; opacity: 1; } .mc-wrap.on .mc-glint { animation: mc-glint 1.4s cubic-bezier(.16,1,.3,1) 3s both; }
        @keyframes mc-glint { to { transform: translateX(120%); } }
        @media (max-width: 760px) { .mc { padding: 20px 16px; } .mc-score { grid-template-columns: 1fr; justify-items: center; text-align: center; } .mc-team, .mc-team.r { justify-content: center; text-align: center; } .mc-board { font-size: 2.2rem; } .mc-low { grid-template-columns: 1fr; } .mc-mom { gap: 6px; } }
        @media (prefers-reduced-motion: reduce) { .mc-post, .mc, .mc .fade, .mc-card, .mc-bar span, .mc-row i, .mc-mom .col { transition: none !important; } .mc-wrap .mc { clip-path: none; } .mc-wrap .mc .fade, .mc-wrap .mc-card { opacity: 1; transform: none; } .mc-wrap .mc-post.l { left: -2px; } .mc-wrap .mc-post.r { left: calc(100% - 7px); } }
      `}</style>
    </div>
  );
}
