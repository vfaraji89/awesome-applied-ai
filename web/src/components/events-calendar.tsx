"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "./icons";
import { Odometer, useInView } from "./odometer";
import { T, useT } from "@/i18n/lang";

/* The events calendar, in the abacus language:
   - a year rod: twelve months as ticks, a bead per event at its first day, coloured by type;
   - a month picker: a pill per month with its number of events;
   - a month grid: each event's days drawn as a rod across the week, its first day a bead; touch a day
     to see only what runs that day;
   - the agenda beside it: a date tile per event, its official page, and add-to-calendar (an .ics file
     made in the browser, or Google Calendar).
   All dates are whole days as the organiser publishes them; nothing is converted between time zones. */
export type Ev = { name: string; type: string; start: string; end: string; city: string; region: string; url: string; note?: string; tracks?: string[] };
type Props = { events: Ev[]; recent: Ev[]; types: Record<string, string>; today: string };

const REGIONS: Record<string, string> = { na: "North America", eu: "Europe", apac: "Asia-Pacific" };
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const d0 = (s: string) => new Date(`${s}T00:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => iso(new Date(d0(s).getTime() + n * 864e5));
const mKey = (s: string) => s.slice(0, 7);
const fmt = (s: string, o: Intl.DateTimeFormatOptions) => d0(s).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
const range = (e: Ev) => (e.start === e.end ? fmt(e.start, { day: "numeric", month: "short", year: "numeric" })
  : mKey(e.start) === mKey(e.end) ? `${fmt(e.start, { day: "numeric" })}–${fmt(e.end, { day: "numeric", month: "short", year: "numeric" })}`
  : `${fmt(e.start, { day: "numeric", month: "short" })} – ${fmt(e.end, { day: "numeric", month: "short", year: "numeric" })}`);
const days = (a: string, b: string) => Math.round((d0(b).getTime() - d0(a).getTime()) / 864e5);

function ics(e: Ev) {
  const z = (s: string) => s.replace(/-/g, "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//applied-ai-simplified//events//EN", "BEGIN:VEVENT",
    `UID:${z(e.start)}-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@applied-ai-simplified`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${z(e.start)}`, `DTEND;VALUE=DATE:${z(addDays(e.end, 1))}`, `SUMMARY:${esc(e.name)}`, `LOCATION:${esc(e.city)}`, `URL:${e.url}`,
    `DESCRIPTION:${esc(`${e.note ? `${e.note} ` : ""}Official page: ${e.url}`)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  a.download = `${e.name.replace(/[^\w]+/g, "-")}.ics`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const gcal = (e: Ev) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.name)}&dates=${e.start.replace(/-/g, "")}/${addDays(e.end, 1).replace(/-/g, "")}&location=${encodeURIComponent(e.city)}&details=${encodeURIComponent(`${e.note ?? ""}\n${e.url}`)}`;

export function EventsCalendar({ events: all, recent, types, today: built }: Props) {
  const t = useT();
  // the page is built ahead of time; on the visitor's screen, today is today
  const [today, setToday] = useState(built);
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);
  const events = all.filter((e) => e.end >= today);
  const [type, setType] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [track, setTrack] = useState<"demo" | "workshop" | null>(null);
  const [sel, setSel] = useState<string | null>(null); // selected event name
  const [day, setDay] = useState<string | null>(null);
  const shown = events.filter((e) => (!type || e.type === type) && (!region || e.region === region) && (!track || (e.tracks ?? []).some((x) => x.toLowerCase().includes(track)))).sort((a, b) => a.start.localeCompare(b.start));
  // twelve months from this one
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => { const d = d0(`${today.slice(0, 7)}-01`); d.setUTCMonth(d.getUTCMonth() + i); return iso(d).slice(0, 7); }), [today]);
  const firstWith = months.find((m) => shown.some((e) => mKey(e.start) <= m && mKey(e.end) >= m)) ?? months[0];
  const [month, setMonth] = useState<string>(firstWith);
  const inMonth = (e: Ev, m: string) => mKey(e.start) <= m && mKey(e.end) >= m;
  const next = shown.find((e) => e.end >= today);
  const yStart = d0(`${months[0]}-01`).getTime(), yEnd = d0(`${months[11]}-01`).getTime() + 31 * 864e5;
  const pos = (s: string) => Math.max(0, Math.min(100, ((d0(s).getTime() - yStart) / (yEnd - yStart)) * 100));
  // stack beads that fall close together
  const stack = new Map<string, number>();
  shown.forEach((e, i) => { const near = shown.slice(0, i).filter((x) => Math.abs(pos(x.start) - pos(e.start)) < 2.2).length; stack.set(e.name, near); });

  // the month grid: weeks Monday to Sunday
  const first = d0(`${month}-01`), lead = (first.getUTCDay() + 6) % 7;
  const nDays = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((lead + nDays) / 7) * 7 }, (_, i) => { const n = i - lead + 1; return n >= 1 && n <= nDays ? `${month}-${String(n).padStart(2, "0")}` : null; });
  const onDay = (d: string) => shown.filter((e) => e.start <= d && e.end >= d);
  const agenda = (day ? onDay(day) : shown.filter((e) => inMonth(e, month)));
  const pickEvent = (e: Ev) => { setSel(e.name); setMonth(mKey(e.start)); setDay(null); };
  const mi = months.indexOf(month);
  const [ltRef, ltOn] = useInView<HTMLDivElement>(0.4);

  return (
    <div className="ec">
      {next && (
        <div ref={ltRef} className={`ec-next${ltOn ? " on" : ""}`}>
          {/* the lower third (brand/broadcast.html, B): a post stands, the ink bar wipes out of it,
              the type bead runs in, the days roll, the words rise; one light sweep as it settles */}
          <div className="lt">
            <span className="lt-post" aria-hidden="true" />
            <div className="lt-main">
              <span className={`lt-bead t-${next.type}`} aria-hidden="true" />
              {next.start <= today
                ? <span className="lt-num lt-now"><T k="ec.now">On now</T></span>
                : <span className="lt-num"><Odometer value={String(days(today, next.start))} run={ltOn} delay={650} /><small><T k="ec.days">days</T></small></span>}
              <div className="lt-txt">
                <b><i>{next.name}</i></b>
                <span><i>{range(next)} · {next.city}</i></span>
              </div>
              <span className="lt-glint" aria-hidden="true" />
            </div>
            <span className="lt-tab"><T k="ec.next">Next up</T></span>
          </div>
          <div className="ec-acts">
            <button type="button" className="btn ec-addbtn" onClick={() => ics(next)}><Icon name="addcal" size={18} /><T k="ec.add">Add to calendar</T></button>
            <a className="chip" href={next.url} target="_blank" rel="noreferrer"><T k="ec.site">Official site</T> ↗</a>
          </div>
        </div>
      )}

      <div className="ec-filters">
        <div className="ec-fl">
          <button type="button" className={`chip${!type ? " on" : ""}`} onClick={() => setType(null)}><T k="ui.all">All</T></button>
          {Object.entries(types).filter(([id]) => events.some((e) => e.type === id)).map(([id, name]) => (
            <button key={id} type="button" className={`chip${type === id ? " on" : ""}`} onClick={() => setType(type === id ? null : id)}><span className={`ec-dot sm t-${id}`} /><T k={`ec.t_${id}`}>{name}</T></button>
          ))}
        </div>
        <div className="ec-fl">
          {([["demo", "ec.tr_demo", "Demos"], ["workshop", "ec.tr_workshop", "Workshops"]] as const).map(([id, k, en]) => <button key={id} type="button" className={`chip${track === id ? " on" : ""}`} onClick={() => setTrack(track === id ? null : id)}><T k={k}>{en}</T></button>)}
          <span className="ec-sep" aria-hidden="true" />
          {Object.entries(REGIONS).map(([id, name]) => <button key={id} type="button" className={`chip${region === id ? " on" : ""}`} onClick={() => setRegion(region === id ? null : id)}><T k={`ec.r_${id}`}>{name}</T></button>)}
        </div>
      </div>

      {/* the year rod */}
      <div className="frame ec-year" aria-label={t("ec.year", "The next twelve months")}>
        <div className="ec-rod">
          {months.map((m, i) => <span key={m} className={`ec-tick${m === month ? " on" : ""}`} style={{ left: `${(i / 12) * 100}%` }}><button type="button" onClick={() => { setMonth(m); setDay(null); }}>{fmt(`${m}-01`, { month: "short" })}{m.endsWith("-01") || i === 0 ? <i>{m.slice(0, 4)}</i> : null}</button></span>)}
          <span className="ec-today" style={{ left: `${pos(today)}%` }} title={t("ec.today", "Today")} />
          {shown.map((e) => (
            <button key={e.name} type="button" className={`ec-bead t-${e.type}${sel === e.name ? " on" : ""}`} style={{ left: `${pos(e.start)}%`, ["--s" as string]: stack.get(e.name) ?? 0 }} onClick={() => pickEvent(e)} aria-label={`${e.name}, ${range(e)}`}>
              <span className="ec-tip"><b>{e.name}</b>{range(e)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ec-main">
        <div className="frame ec-month">
          <div className="ec-mhead">
            <button type="button" className="ec-nav" onClick={() => mi > 0 && (setMonth(months[mi - 1]), setDay(null))} disabled={mi <= 0} aria-label={t("ec.prev", "Previous month")}>‹</button>
            <b>{fmt(`${month}-01`, { month: "long", year: "numeric" })}</b>
            <button type="button" className="ec-nav" onClick={() => mi < 11 && (setMonth(months[mi + 1]), setDay(null))} disabled={mi >= 11} aria-label={t("ec.nextm", "Next month")}>›</button>
          </div>
          <div className="ec-pills">
            {months.map((m) => { const n = shown.filter((e) => inMonth(e, m)).length; return (
              <button key={m} type="button" className={`ec-pill${m === month ? " on" : ""}${n ? " has" : ""}`} onClick={() => { setMonth(m); setDay(null); }}>
                {fmt(`${m}-01`, { month: "narrow" })}<span>{Array.from({ length: Math.min(n, 4) }, (_, k) => <i key={k} />)}</span>
              </button>
            ); })}
          </div>
          <div className="ec-grid" role="grid">
            {DOW.map((d) => <span key={d} className="ec-dow count"><T k={`ec.d_${d}`}>{d}</T></span>)}
            {cells.map((c, i) => {
              if (!c) return <span key={i} className="ec-cell empty" />;
              const evs = onDay(c);
              return (
                <button key={c} type="button" className={`ec-cell${c === today ? " today" : ""}${c === day ? " on" : ""}${evs.length ? " busy" : ""}`} onClick={() => setDay(day === c ? null : c)} aria-pressed={c === day} aria-label={`${fmt(c, { day: "numeric", month: "long" })}${evs.length ? `: ${evs.map((e) => e.name).join(", ")}` : ""}`}>
                  <span className="ec-n">{Number(c.slice(8))}</span>
                  <span className="ec-runs">{evs.slice(0, 3).map((e) => <i key={e.name} className={`t-${e.type}${e.start === c ? " s" : ""}${e.end === c ? " e" : ""}${sel === e.name ? " sel" : ""}`} />)}</span>
                </button>
              );
            })}
          </div>
          <p className="count ec-hint"><T k="ec.hint">Touch a day to see what runs that day; a bead on the rod or a pill picks a month.</T></p>
        </div>

        <div className="ec-agenda">
          <span className="kicker">{day ? fmt(day, { weekday: "long", day: "numeric", month: "long" }) : fmt(`${month}-01`, { month: "long", year: "numeric" })}{day && <button type="button" className="ec-clear" onClick={() => setDay(null)}><T k="ec.whole">whole month</T> ×</button>}</span>
          {agenda.length ? (
            <ul>
              {agenda.map((e) => (
                <li key={e.name} className={`frame ec-card${sel === e.name ? " on" : ""}`} onMouseEnter={() => setSel(e.name)}>
                  <div className={`ec-tile t-${e.type}`}><span>{fmt(e.start, { month: "short" })}</span><b>{fmt(e.start, { day: "numeric" })}</b>{e.end !== e.start ? <small>→ {fmt(e.end, mKey(e.end) === mKey(e.start) ? { day: "numeric" } : { day: "numeric", month: "short" })}</small> : null}<i aria-hidden="true" /></div>
                  <div className="ec-body">
                    <b>{e.name}</b>
                    <span className="muted">{range(e)} · {e.city}</span>
                    <span className="ec-type"><span className={`ec-dot sm t-${e.type}`} /><T k={`ec.t_${e.type}`}>{types[e.type] ?? e.type}</T></span>
                    {e.tracks && <span className="chips ec-tracks">{e.tracks.map((x) => <span key={x} className="chip">{x}</span>)}</span>}
                    {e.note && <p className="ec-note">{e.note}</p>}
                    <div className="ec-acts">
                      <a className="chip" href={e.url} target="_blank" rel="noreferrer"><T k="ec.site">Official site</T> ↗</a>
                      <button type="button" className="chip" onClick={() => ics(e)}><T k="ec.ics">.ics</T></button>
                      <a className="chip" href={gcal(e)} target="_blank" rel="noreferrer">Google Calendar ↗</a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="muted ec-none"><T k="ec.none">Nothing in the calendar for this choice. Try another month or clear a filter.</T></p>}
          {!day && recent.filter((e) => inMonth(e, month)).length > 0 && (
            <p className="count" style={{ marginTop: 10 }}><T k="ec.recent">Just happened:</T> {recent.filter((e) => inMonth(e, month)).map((e) => e.name).join(", ")}</p>
          )}
        </div>
      </div>

      <style>{`
        .t-data { --b: var(--t-data); --c: var(--c-data); } .t-infra { --b: var(--t-infra); --c: var(--c-infra); } .t-research { --b: var(--t-research); --c: var(--c-research); } .t-acm { --b: var(--t-acm); --c: var(--c-acm); }
        .ec-dot { display: inline-block; width: 18px; height: 18px; border-radius: 50%; background: var(--b); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px; flex: none; } .ec-dot.sm { width: 10px; height: 10px; }
        .ec-next { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px 24px; padding: 8px 0; }
        .lt { display: flex; align-items: stretch; min-height: 86px; max-width: 100%; }
        .lt-post { position: relative; z-index: 2; flex: none; width: 9px; margin: -8px 0; border-radius: 5px; background: var(--dowel); transform: scaleY(0); transition: transform .45s cubic-bezier(.16,1,.3,1); }
        .lt-main { position: relative; overflow: hidden; display: flex; align-items: center; gap: 18px; min-width: 0; padding: 12px 26px 12px 20px; color: #fff;
          background-color: #141312; background-image: linear-gradient(180deg, #1d1a19, #141312), var(--rod); background-size: 100% 100%, 100% 3px; background-position: 0 0, bottom; background-repeat: no-repeat;
          clip-path: inset(0 100% 0 0); transition: clip-path .7s cubic-bezier(.77,0,.18,1) .25s; }
        .lt-bead { flex: none; width: 18px; height: 18px; border-radius: 50%; background: var(--b); transform: translateX(-40px); opacity: 0; transition: transform .7s cubic-bezier(.16,1,.3,1) .55s, opacity .2s .55s; }
        .lt-num { display: inline-flex; align-items: baseline; gap: 6px; font-size: 2.6rem; font-weight: 800; letter-spacing: -.04em; line-height: 1; }
        .lt-num small { font: 600 .7rem var(--font-mono), monospace; letter-spacing: .1em; text-transform: uppercase; color: #bdb6ae; }
        .lt-now { font-size: 1.4rem; }
        .lt-txt { display: grid; gap: 3px; min-width: 0; }
        .lt-txt b, .lt-txt span { display: block; overflow: hidden; }
        .lt-txt i { display: block; font-style: normal; transform: translateY(110%); transition: transform .6s cubic-bezier(.16,1,.3,1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lt-txt b { font-size: 1.15rem; } .lt-txt b i { transition-delay: .7s; }
        .lt-txt span { font: .74rem var(--font-mono), monospace; color: #bdb6ae; } .lt-txt span i { transition-delay: .8s; }
        .lt-glint { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.14) 46%, rgba(255,255,255,.03) 54%, transparent 70%); transform: translateX(-120%); }
        .lt-tab { display: flex; align-items: center; flex: none; padding: 0 16px; background: #fff; color: var(--rust-deep); font: 600 .72rem var(--font-mono), monospace; letter-spacing: .12em; text-transform: uppercase;
          background-image: var(--rod), var(--rod); background-size: 100% 3px, 100% 3px; background-position: top, bottom; background-repeat: no-repeat; clip-path: inset(0 100% 0 0); transition: clip-path .55s cubic-bezier(.77,0,.18,1) .9s; }
        .ec-next.on .lt-post { transform: none; } .ec-next.on .lt-main, .ec-next.on .lt-tab { clip-path: inset(0 0 0 0); }
        .ec-next.on .lt-bead { transform: none; opacity: 1; } .ec-next.on .lt-txt i { transform: none; }
        .ec-next.on .lt-glint { animation: lt-glint 1.1s cubic-bezier(.16,1,.3,1) 1.3s both; }
        @keyframes lt-glint { to { transform: translateX(120%); } }
        @media (max-width: 680px) { .lt-tab { display: none; } .lt-num { font-size: 2rem; } .lt-main { gap: 12px; padding: 12px 16px; } }
        @media (prefers-reduced-motion: reduce) { .lt-post, .lt-main, .lt-bead, .lt-txt i, .lt-tab { transition: none; transform: none; opacity: 1; clip-path: none; } .ec-next .lt-glint { animation: none; } }
        .ec-acts { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; } .ec-acts .chip { cursor: pointer; } .ec-acts .btn { border: 0; cursor: pointer; font: inherit; }
        .ec-filters { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin: 22px 0 14px; }
        .ec-fl { display: flex; flex-wrap: wrap; gap: 6px; } .ec-fl .chip { cursor: pointer; } .ec-sep { width: 1px; background: var(--line); margin: 2px 4px; }
        .ec-year { padding: 30px 28px 26px; }
        .ec-rod { position: relative; height: 74px; margin: 0 8px; }
        .ec-rod::before { content: ""; position: absolute; left: 0; right: 0; top: 30px; height: 4px; border-radius: 2px; background: var(--rod); }
        .ec-tick { position: absolute; top: 46px; transform: translateX(-2px); } .ec-tick::before { content: ""; position: absolute; left: 1px; top: -12px; width: 1px; height: 8px; background: var(--line-strong); }
        .ec-tick button { border: 0; background: none; padding: 2px 4px; font: .72rem var(--font-mono), monospace; color: var(--muted); cursor: pointer; text-transform: uppercase; display: grid; }
        .ec-tick button i { font-style: normal; font-size: .62rem; } .ec-tick.on button { color: var(--rust-deep); font-weight: 700; }
        .ec-today { position: absolute; top: 18px; width: 2px; height: 28px; background: var(--rust); border-radius: 1px; } .ec-today::after { content: ""; position: absolute; top: -7px; left: -4px; width: 10px; height: 10px; border-radius: 50%; background: var(--bead-red); }
        .ec-bead { position: absolute; top: calc(22px - var(--s) * 14px); width: 20px; height: 20px; margin-left: -10px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; background: var(--b); outline: 1px solid rgba(0,0,0,.06); outline-offset: -1px; transition: transform .35s var(--spring); }
        .ec-bead:hover, .ec-bead.on { transform: scale(1.35); z-index: 3; } .ec-bead.on { outline: 4px solid color-mix(in srgb, var(--c) 25%, transparent); outline-offset: 0; }
        .ec-tip { position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translate(-50%, 4px); display: grid; gap: 1px; white-space: nowrap; font-size: .7rem; background: var(--ink); color: var(--bg); padding: 5px 9px; border-radius: 7px; opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s; }
        .ec-tip b { font-size: .76rem; } .ec-bead:hover .ec-tip, .ec-bead:focus-visible .ec-tip { opacity: 1; transform: translate(-50%, 0); }
        .ec-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 22px; margin-top: 18px; align-items: start; }
        @media (max-width: 900px) { .ec-main { grid-template-columns: 1fr; } }
        .ec-month { padding: 20px 22px; }
        .ec-mhead { display: flex; justify-content: space-between; align-items: center; } .ec-mhead b { font-size: 1.2rem; }
        .ec-nav { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line-strong); background: var(--card); font-size: 1.2rem; cursor: pointer; color: var(--ink); } .ec-nav:disabled { opacity: .35; cursor: default; }
        .ec-pills { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin: 14px 0 12px; }
        .ec-pill { display: grid; justify-items: center; gap: 3px; padding: 5px 0 6px; border-radius: 8px; border: 1px solid transparent; background: none; cursor: pointer; font: .7rem var(--font-mono), monospace; color: var(--muted); }
        .ec-pill.has { color: var(--ink); } .ec-pill.on { border-color: var(--rust); background: var(--paper); color: var(--rust-deep); font-weight: 700; }
        .ec-pill span { display: flex; gap: 2px; height: 7px; } .ec-pill i { width: 7px; height: 7px; border-radius: 50%; background: var(--bead-red); }
        .ec-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
        .ec-dow { text-align: center; font-size: .66rem; padding-bottom: 4px; }
        .ec-cell { position: relative; aspect-ratio: 1 / .92; border: 0; border-radius: 9px; background: none; cursor: pointer; display: grid; align-content: start; justify-items: center; padding: 6px 0 0; font: inherit; color: var(--ink); }
        .ec-cell.empty { cursor: default; } .ec-cell:not(.empty):hover { background: var(--paper); }
        .ec-cell.today .ec-n { outline: 1.5px solid var(--rust); outline-offset: -1.5px; color: var(--rust-deep); font-weight: 700; }
        .ec-cell.on .ec-n { background: var(--ink); color: var(--bg); outline: 0; }
        .ec-n { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; font-size: .84rem; }
        .ec-runs { position: absolute; left: 0; right: 0; bottom: 4px; display: flex; justify-content: center; gap: 3px; }
        .ec-runs i { width: 8px; height: 8px; border-radius: 50%; background: var(--b); }
        .ec-runs i.sel { transform: scale(1.4); }
        .ec-hint { margin-top: 10px; }
        .ec-agenda > .kicker { display: flex; gap: 10px; align-items: center; }
        .ec-clear { border: 0; background: var(--paper); border-radius: 999px; padding: 2px 9px; font: inherit; font-size: .7rem; cursor: pointer; color: var(--rust-deep); text-transform: none; letter-spacing: 0; }
        .ec-agenda ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 18px; }
        .ec-card { display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 16px; padding: 16px 18px; } .ec-card.on { outline: 1.5px solid var(--rust); outline-offset: 0; }
        /* the date card: a small calendar page hung from a wooden rod with two short posts, the
           frame in miniature. Month in rust mono, the day large, the end day after an arrow,
           and the event type as one bead. */
        .ec-tile { position: relative; align-self: start; display: grid; justify-items: center; width: 58px; padding: 10px 0 8px; margin-top: 3px;
          border: 1px solid var(--line); border-top: 0; border-radius: 2px 2px 12px 12px; background-color: var(--card);
          background-image: var(--rod); background-size: 100% 3px; background-position: top; background-repeat: no-repeat; }
        .ec-tile::before, .ec-tile::after { content: ""; position: absolute; top: -3px; height: 10px; width: 5px; border-radius: 3px; background: var(--dowel); }
        .ec-tile::before { left: -3px; } .ec-tile::after { right: -3px; }
        .ec-tile span { font: 500 .62rem var(--font-mono), monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--rust-deep); }
        .ec-tile b { font-size: 1.5rem; font-weight: 800; letter-spacing: -.04em; line-height: 1.05; }
        .ec-tile small { font: .62rem var(--font-mono), monospace; color: var(--muted); margin-top: 1px; white-space: nowrap; }
        .ec-tile i { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; background: var(--b); }
        .ec-body { display: grid; gap: 4px; min-width: 0; } .ec-body > b { font-size: 1.05rem; } .ec-body .muted { font-size: .86rem; }
        .ec-type { display: inline-flex; gap: 6px; align-items: center; font-size: .76rem; color: var(--sec); }
        .ec-tracks { gap: 6px; }
        .ec-addbtn { display: inline-flex; align-items: center; gap: 8px; } .ec-addbtn .ic { color: #fff; }
        .ec-note { font-size: .86rem; color: var(--sec); margin: 2px 0 4px; }
        .ec-none { margin-top: 14px; }
      `}</style>
    </div>
  );
}
