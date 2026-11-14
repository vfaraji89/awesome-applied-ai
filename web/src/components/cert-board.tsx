"use client";
import { useEffect, useState } from "react";
import { T, useT } from "@/i18n/lang";
import { certs, TRACKS, LEVELS, type Track } from "@/data/certificates";

/* Certificates by track, foundational first. Each card links to the provider's own page. */
export function CertBoard() {
  const [track, setTrack] = useState<Track | "all">("all");
  // ?track=build (from a skill page) opens on that track
  useEffect(() => { const t = new URLSearchParams(window.location.search).get("track"); if (t && TRACKS.some((x) => x.id === t)) setTrack(t as Track); }, []);
  const tr = useT();
  const shown = certs.filter((c) => track === "all" || c.track === track).sort((a, b) => a.level - b.level);
  const line = TRACKS.find((t) => t.id === track);
  return (
    <div>
      <div className="chips" role="group" aria-label={tr("ce.tracks", "Tracks")}>
        <button type="button" className={`chip${track === "all" ? " on" : ""}`} aria-pressed={track === "all"} onClick={() => setTrack("all")}>
          <T k="ce.all">All</T> <span className="count">{certs.length}</span>
        </button>
        {TRACKS.map((t) => (
          <button key={t.id} type="button" className={`chip${track === t.id ? " on" : ""}`} aria-pressed={track === t.id} onClick={() => setTrack(t.id)}>
            <T k={`ce.track.${t.id}`}>{t.name}</T> <span className="count">{certs.filter((c) => c.track === t.id).length}</span>
          </button>
        ))}
      </div>
      <p className="muted cb-line">{line ? <T k={`ce.track.${line.id}.line`}>{line.line}</T> : <T k="ce.all_line">Foundational first. Every card links to the provider's own page.</T>}</p>
      <div className="grid grid-3 cb-grid">
        {shown.map((c) => (
          <article key={c.id} className="frame cb-card">
            <div className="cb-top">
              <span className="kicker">{c.provider}</span>
              <span className="cb-level" data-l={c.level}>{[1, 2, 3, 4].map((b) => <i key={b} className={b <= c.level ? "on" : ""} />)}<T k={`ce.level.${c.level}`}>{LEVELS[c.level]}</T></span>
            </div>
            <h3 className="cb-name">{c.name}</h3>
            <p className="cb-what"><T k={`ce.${c.id}.what`}>{c.what}</T></p>
            {(c.code || c.fee || c.length || c.valid) && (
              <p className="mono cb-facts">
                {[c.code, c.fee, c.length && tr(`ce.len.${c.length}`, c.length), c.valid && tr("ce.valid", "valid {v}", { v: tr(`ce.len.${c.valid}`, c.valid) })].filter(Boolean).join(" · ")}
              </p>
            )}
            {c.status && (
              <p className={`cb-status ${c.status}`}>
                {c.status === "new" ? <T k="ce.new">New in 2026</T> : <T k="ce.changing">Exam changing</T>}
                {c.statusNote && <span> · <T k={`ce.${c.id}.note`}>{c.statusNote}</T></span>}
              </p>
            )}
            <a className="cb-link" href={c.url} target="_blank" rel="noreferrer"><T k="ce.official">Official page</T> ↗</a>
          </article>
        ))}
      </div>
      <style>{`
        .cb-line { margin-top: 14px; font-size: .95rem; }
        .cb-grid { margin-top: 22px; }
        .cb-card { display: flex; flex-direction: column; gap: 10px; }
        .cb-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .cb-level { display: inline-flex; align-items: center; gap: 3px; font-family: var(--font-mono), monospace; font-size: .7rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
        .cb-level i { width: 9px; height: 9px; border-radius: 50%; background: var(--bead-white); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px; }
        .cb-level i.on { background: var(--bead-red); outline: 0; }
        .cb-level i:last-of-type { margin-right: 6px; }
        .cb-name { font-size: 1.12rem; font-weight: 800; line-height: 1.25; margin: 0; }
        .cb-what { font-size: .92rem; color: var(--sec); margin: 0; line-height: 1.5; }
        .cb-facts { font-size: .76rem; color: var(--muted); margin: 0; }
        .cb-status { font-size: .8rem; margin: 0; color: var(--rust-deep); }
        .cb-status.changing { color: #a5650a; }
        .cb-link { margin-top: auto; padding-top: 6px; font-weight: 700; font-size: .88rem; color: var(--rust-deep); text-decoration: none; }
        .cb-link:hover { text-decoration: underline; text-underline-offset: 3px; }
      `}</style>
    </div>
  );
}
