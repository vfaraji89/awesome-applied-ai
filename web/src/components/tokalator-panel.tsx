"use client";
import { useEffect, useRef, useState } from "react";
import { T, useT } from "@/i18n/lang";

/* Tokalator's VS Code sidebar, mirrored: the same header, meter, pills, cards, agent colours and
   labels as the extension's own webview (tokalator-extension-vs/src/webview), in VS Code's dark
   theme. It plays like a GIF through four views, one example session; dots, arrows and a swipe
   move it by hand, hovering pauses it, and reduced motion keeps it still. Example values only. */

const MS = 3600;
const SLIDES = [
  { k: "tp.s_context", en: "Context" },
  { k: "tp.s_turns", en: "Turns" },
  { k: "tp.s_agents", en: "Agents" },
  { k: "tp.s_files", en: "Files" },
] as const;

/* a number that counts up each time its slide comes into view */
function Num({ to, on, fmt }: { to: number; on: boolean; fmt: (n: number) => string }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!on) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const p = Math.min(1, (t - t0) / 900); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    setV(0); raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, to]);
  return <>{fmt(v)}</>;
}
const K = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : `${Math.round(n)}`);
const USD = (n: number) => `$${n.toFixed(2)}`;

function Icon() {
  // the extension's own header mark: an abacus that reads as a context meter
  return (
    <svg className="tp-ic" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0a0a0b" />
      <rect x="3" y="1.5" width="18" height="21" rx="3" fill="#ffffff" />
      <rect x="4.5" y="3" width="15" height="4.5" rx="1.5" fill="#cfe9d6" />
      <rect className="tp-fill" x="6" y="4.5" width="7.5" height="1.5" rx="0.75" fill="#00a544" />
      <circle cx="5.25" cy="9.75" r="0.9" fill="#00a544" /><rect className="tp-bar" x="7.5" y="9" width="12" height="1.5" rx="0.75" fill="#00a544" />
      <circle cx="5.25" cy="12.75" r="0.9" fill="#00a544" /><rect className="tp-bar" x="7.5" y="12" width="9" height="1.5" rx="0.75" fill="#00a544" style={{ animationDelay: ".12s" }} />
      <circle cx="5.25" cy="15.75" r="0.9" fill="#d4a017" /><rect className="tp-bar" x="7.5" y="15" width="4.5" height="1.5" rx="0.75" fill="#d4a017" style={{ animationDelay: ".24s" }} />
      <rect x="4.5" y="18" width="15" height="3" rx="1.5" fill="#e3120b" />
    </svg>
  );
}

const AGENTS = [
  { name: "Claude Code", color: "#d97757", v: 6.12, sub: "3 sessions · 41 turns" },
  { name: "Codex", color: "#10a37f", v: 2.47, sub: "1 session · 16 turns" },
  { name: "Copilot Chat", color: "#6e7681", v: 1.25, sub: "22 requests" },
];
const FILES = [
  { name: "auth.ts", rel: 0.94, pin: true }, { name: "session.ts", rel: 0.81, pin: true },
  { name: "auth.test.ts", rel: 0.66 }, { name: "routes.ts", rel: 0.47 },
];
const LOW = [{ name: "CHANGELOG.md", rel: 0.12 }, { name: "old-notes.md", rel: 0.05 }];
const relColor = (r: number) => (r >= 0.6 ? "var(--tp-low)" : r >= 0.3 ? "var(--tp-med)" : "var(--tp-high)");

export function TokalatorPanel() {
  const t = useT();
  const [at, setAt] = useState(0);
  const hold = useRef(false);
  const x0 = useRef<number | null>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => { if (!hold.current && document.visibilityState === "visible") setAt((a) => (a + 1) % SLIDES.length); }, MS);
    return () => clearInterval(id);
  }, []);
  const go = (i: number) => setAt((i + SLIDES.length) % SLIDES.length);
  const on = (i: number) => at === i;
  const max = AGENTS[0].v;
  return (
    <div className="tp" onMouseEnter={() => { hold.current = true; }} onMouseLeave={() => { hold.current = false; }}
      onPointerDown={(e) => { x0.current = e.clientX; }} onPointerUp={(e) => { if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) go(at + (e.clientX < x0.current ? 1 : -1)); x0.current = null; }}>
      <div className="tp-win" role="img" aria-label={t("tp.aria", "Tokalator in VS Code, an example session: context meter, turn analytics, agent usage today and file relevance")}>
        <div className="tp-bar-top"><span className="tp-dots" aria-hidden="true"><i /><i /><i /></span><span>TOKALATOR: CONTEXT</span><span className="tp-more" aria-hidden="true">···</span></div>
        <div className="tp-body">
          <div className="tp-act" aria-hidden="true"><span className="on"><Icon /></span><span className="ghost" /><span className="ghost" /><span className="ghost" /></div>
          <div className="tp-side">
            <div className="tp-hdr"><Icon /><b>Tokalator</b><span className="tp-badge">OPEN SOURCE</span></div>
            <div className="tp-stage" style={{ ["--at" as string]: at }}>
              {/* 1. context: meter, pills, model */}
              <section className={`tp-slide${on(0) ? " on" : ""}`}>
                <div className="tp-meter"><div className="tp-row"><span className="tp-level">LOW <span className="tp-src">Claude Code</span></span><span>~<Num to={212400} on={on(0)} fmt={K} /> / 1M</span></div><div className="tp-mbar"><i style={{ width: on(0) ? "21.2%" : 0 }} /></div></div>
                <div className="tp-pills"><span>7 open</span><span>2 pinned</span><span>18 turns</span></div>
                <div className="tp-card tp-model"><div><b>Claude Sonnet 5.5</b><small>Anthropic · 1M context</small></div><div className="tp-r"><small>Set via Settings</small><small>$2 / $10 per MTok</small></div></div>
                <div className="tp-card"><div className="tp-ct">Budget Breakdown</div>
                  <div className="tp-stack"><i style={{ width: on(0) ? "46%" : 0, background: "var(--tp-acc)" }} /><i style={{ width: on(0) ? "14%" : 0, background: "#bc8cff" }} /><i style={{ width: on(0) ? "28%" : 0, background: "var(--tp-med)" }} /><i style={{ width: on(0) ? "12%" : 0, background: "#8b949e" }} /></div>
                  <div className="tp-legend"><span><i style={{ background: "var(--tp-acc)" }} />Files</span><span><i style={{ background: "#bc8cff" }} />System</span><span><i style={{ background: "var(--tp-med)" }} />Conversation</span><span><i style={{ background: "#8b949e" }} />Output</span></div>
                </div>
              </section>
              {/* 2. turn analytics */}
              <section className={`tp-slide${on(1) ? " on" : ""}`}>
                <div className="tp-card tp-acc"><div className="tp-ct" style={{ color: "var(--tp-acc)" }}>Turn Analytics <span className="tp-n">(from 18 Claude Code turns)</span></div>
                  <div className="tp-stat"><span>Context now</span><b>~<Num to={212400} on={on(1)} fmt={K} /> / 1M (21.2%)</b></div>
                  <div className="tp-stat"><span>Growth per turn</span><b>~<Num to={9400} on={on(1)} fmt={K} /></b></div>
                  <div className="tp-stat"><span>Turns remaining</span><b>~<Num to={83} on={on(1)} fmt={(n) => `${Math.round(n)}`} /></b></div>
                  <div className="tp-stat"><span>Avg API-equivalent cost per turn</span><b><Num to={0.31} on={on(1)} fmt={(n) => `$${n.toFixed(3)}`} /></b></div>
                </div>
                <div className="tp-card tp-lowc"><div className="tp-ct" style={{ color: "var(--tp-low)" }}>Turn Cost <span className="tp-n">(input only)</span></div>
                  <div className="tp-big"><Num to={0.42} on={on(1)} fmt={(n) => `$${n.toFixed(3)}`} /></div><small className="tp-sub">last turn: ~212K input tokens</small>
                </div>
              </section>
              {/* 3. agents today */}
              <section className={`tp-slide${on(2) ? " on" : ""}`}>
                <div className="tp-card tp-red">
                  <div className="tp-tabs"><span className="on">All</span><span>Claude Code</span><span>Codex</span><span>Copilot Chat</span></div>
                  <div className="tp-ct tp-cc"><span>Today, all agents</span><b><Num to={9.84} on={on(2)} fmt={USD} /></b></div>
                  {AGENTS.map((a, i) => (
                    <div key={a.name} className="tp-agent">
                      <div className="tp-atop"><i style={{ background: a.color }} /><b>{a.name}</b>{i === 0 && <span className="tp-live" />}<span><Num to={a.v} on={on(2)} fmt={USD} /></span></div>
                      <div className="tp-abar"><i style={{ width: on(2) ? `${(a.v / max) * 100}%` : 0, background: a.color, transitionDelay: `${i * 120}ms` }} /></div>
                      <small>{a.sub}</small>
                    </div>
                  ))}
                  <small className="tp-sub">API-equivalent cost today. Tap an agent to see its details.</small>
                </div>
              </section>
              {/* 4. files by relevance */}
              <section className={`tp-slide${on(3) ? " on" : ""}`}>
                <div className="tp-sec">Files (4) · 2 pinned</div>
                <ul className="tp-files">{FILES.map((f, i) => <li key={f.name}><span className={`tp-pin${f.pin ? " on" : ""}`} aria-hidden="true">●</span><span className="tp-fn">{f.name}</span><span className="tp-rb"><i style={{ width: on(3) ? `${f.rel * 100}%` : 0, background: relColor(f.rel), transitionDelay: `${i * 90}ms` }} /></span><span className="tp-rv">{f.rel.toFixed(2)}</span></li>)}</ul>
                <div className="tp-sec">Low Relevance (2)</div>
                <ul className="tp-files tp-dim">{LOW.map((f) => <li key={f.name}><span className="tp-pin" aria-hidden="true">●</span><span className="tp-fn">{f.name}</span><span className="tp-rb"><i style={{ width: on(3) ? `${f.rel * 100}%` : 0, background: relColor(f.rel) }} /></span><span className="tp-rv">{f.rel.toFixed(2)}</span></li>)}</ul>
                <span className="tp-btn">Close 2 Low-Relevance Tabs</span>
              </section>
            </div>
          </div>
        </div>
        <div className="tp-status" aria-hidden="true"><span>⎇ main</span><span className="tp-sb">◔ 212K / 1M · $0.42</span></div>
      </div>
      <div className="tp-nav">
        <button type="button" className="tp-arrow" onClick={() => go(at - 1)} aria-label={t("tp.prev", "Previous view")}>‹</button>
        <div className="tp-steps" role="tablist" aria-label={t("tp.views", "Views")}>
          {SLIDES.map((s, i) => (
            <button key={s.k} type="button" role="tab" aria-selected={on(i)} className={on(i) ? "on" : ""} onClick={() => go(i)}>
              <span className="tp-dot" aria-hidden="true"><i style={on(i) ? { animationDuration: `${MS}ms` } : undefined} /></span><span className="tp-lab"><T k={s.k}>{s.en}</T></span>
            </button>
          ))}
        </div>
        <button type="button" className="tp-arrow" onClick={() => go(at + 1)} aria-label={t("tp.next", "Next view")}>›</button>
      </div>
      <style>{`
        .tp { --tp-bg: #181818; --tp-ed: #1f1f1f; --tp-fg: #cccccc; --tp-desc: #9d9d9d; --tp-line: rgba(128,128,128,.22); --tp-card: rgba(255,255,255,.035);
          --tp-low: #3fb950; --tp-med: #d29922; --tp-high: #f85149; --tp-acc: #58a6ff; --tp-red: #e3120b; user-select: none; touch-action: pan-y; }
        .tp-win { border-radius: 10px; overflow: hidden; background: var(--tp-bg); color: var(--tp-fg); border: 1px solid #2b2b2b;
          font: 12px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; font-variant-numeric: tabular-nums; }
        .tp-bar-top { display: flex; align-items: center; gap: 10px; height: 30px; padding: 0 10px; background: #1f1f1f; border-bottom: 1px solid #2b2b2b; font-size: 10.5px; font-weight: 600; letter-spacing: .4px; color: var(--tp-desc); }
        .tp-dots { display: inline-flex; gap: 5px; } .tp-dots i { width: 9px; height: 9px; border-radius: 50%; background: #3c3c3c; } .tp-dots i:first-child { background: #ff5f57; } .tp-dots i:nth-child(2) { background: #febc2e; } .tp-dots i:nth-child(3) { background: #28c840; }
        .tp-more { margin-left: auto; letter-spacing: 1px; }
        .tp-body { display: grid; grid-template-columns: 38px minmax(0, 1fr); height: 318px; }
        .tp-act { background: #181818; border-right: 1px solid #2b2b2b; display: flex; flex-direction: column; align-items: center; gap: 14px; padding-top: 10px; }
        .tp-act span { width: 20px; height: 20px; border-radius: 4px; position: relative; } .tp-act .ghost { background: #3a3a3a; opacity: .55; }
        .tp-act .on::before { content: ""; position: absolute; left: -9px; top: -2px; bottom: -2px; width: 2px; background: #fff; }
        .tp-side { min-width: 0; padding: 10px 12px; display: flex; flex-direction: column; }
        .tp-hdr { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; } .tp-hdr b { font-size: 13px; color: #e6e6e6; }
        .tp-ic { width: 20px; height: 20px; flex: none; }
        .tp-bar { animation: tp-grow .8s cubic-bezier(.2,.7,.2,1) both; transform-box: fill-box; transform-origin: left; }
        .tp-fill { animation: tp-grow 1s cubic-bezier(.2,.7,.2,1) .4s both; transform-box: fill-box; transform-origin: left; }
        @keyframes tp-grow { from { transform: scaleX(.1); } }
        .tp-badge { background: var(--tp-red); color: #fff; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 8px; letter-spacing: 1px; }
        .tp-stage { position: relative; flex: 1; min-height: 0; overflow: hidden; }
        .tp-slide { position: absolute; inset: 0; opacity: 0; transform: translateX(14px); transition: opacity .45s ease, transform .55s cubic-bezier(.2,.7,.2,1); pointer-events: none; }
        .tp-slide.on { opacity: 1; transform: none; }
        .tp-meter { padding: 8px; border-radius: 6px; margin-bottom: 8px; background: color-mix(in srgb, var(--tp-low) 12%, var(--tp-bg)); color: var(--tp-low); border: 1px solid color-mix(in srgb, var(--tp-low) 25%, transparent); }
        .tp-row { display: flex; justify-content: space-between; gap: 8px; } .tp-level { font-size: 11px; font-weight: 700; letter-spacing: 1px; } .tp-src { margin-left: 6px; font-weight: 500; letter-spacing: 0; opacity: .7; }
        .tp-mbar { height: 4px; border-radius: 2px; margin-top: 6px; background: color-mix(in srgb, currentColor 15%, transparent); overflow: hidden; }
        .tp-mbar i, .tp-abar i, .tp-rb i, .tp-stack i { display: block; height: 100%; border-radius: 2px; background: currentColor; transition: width .9s cubic-bezier(.2,.7,.2,1); }
        .tp-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; } .tp-pills span { background: var(--tp-card); border: 1px solid var(--tp-line); padding: 3px 7px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .tp-card { background: var(--tp-card); border: 1px solid var(--tp-line); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; }
        .tp-model { display: flex; justify-content: space-between; gap: 8px; border-color: color-mix(in srgb, var(--tp-acc) 50%, var(--tp-line)); }
        .tp-model b { display: block; font-size: 13px; color: #e6e6e6; } .tp-model small, .tp-r small { display: block; font-size: 10px; color: var(--tp-desc); } .tp-r { text-align: right; }
        .tp-ct { font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: var(--tp-desc); margin-bottom: 5px; } .tp-n { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--tp-desc); }
        .tp-stack { display: flex; height: 6px; border: 1px solid var(--tp-line); border-radius: 3px; overflow: hidden; } .tp-stack i { border-radius: 0; }
        .tp-legend { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 6px; font-size: 10px; color: var(--tp-desc); } .tp-legend i { display: inline-block; width: 7px; height: 7px; border-radius: 2px; margin-right: 4px; }
        .tp-acc { border-color: color-mix(in srgb, var(--tp-acc) 40%, var(--tp-line)); } .tp-lowc { border-color: color-mix(in srgb, var(--tp-low) 30%, var(--tp-line)); } .tp-red { border-color: color-mix(in srgb, var(--tp-red) 35%, var(--tp-line)); }
        .tp-stat { display: flex; justify-content: space-between; gap: 8px; padding: 2px 0; font-size: 11px; } .tp-stat span { color: var(--tp-desc); } .tp-stat b { font-weight: 600; color: var(--tp-fg); }
        .tp-big { font-size: 18px; font-weight: 700; color: #e6e6e6; } .tp-sub { display: block; font-size: 10px; color: var(--tp-desc); margin-top: 3px; }
        .tp-tabs { display: flex; gap: 2px; margin: -2px 0 6px; border-bottom: 1px solid var(--tp-line); font-size: 10px; color: var(--tp-desc); overflow: hidden; }
        .tp-tabs span { padding: 3px 6px; border-bottom: 2px solid transparent; white-space: nowrap; } .tp-tabs .on { color: var(--tp-fg); border-bottom-color: var(--tp-acc); font-weight: 600; }
        .tp-cc { display: flex; justify-content: space-between; } .tp-cc b { text-transform: none; color: var(--tp-fg); }
        .tp-agent { padding: 5px 0; } .tp-atop { display: flex; align-items: center; gap: 6px; font-size: 12px; } .tp-atop > i { width: 8px; height: 8px; border-radius: 50%; } .tp-atop b { font-weight: 600; color: #e6e6e6; } .tp-atop > span:last-child { margin-left: auto; font-weight: 600; }
        .tp-live { width: 6px; height: 6px; border-radius: 50%; background: var(--tp-low); animation: tp-pulse 1.6s ease-in-out infinite; } @keyframes tp-pulse { 50% { opacity: .3; } }
        .tp-abar { height: 4px; margin: 5px 0 3px 14px; border-radius: 2px; background: rgba(136,136,136,.14); overflow: hidden; } .tp-agent small { margin-left: 14px; font-size: 10.5px; color: var(--tp-desc); }
        .tp-sec { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: var(--tp-desc); border-top: 1px solid var(--tp-line); padding-top: 7px; margin: 2px 0 5px; }
        .tp-sec:first-child { border-top: 0; padding-top: 0; }
        .tp-files { list-style: none; margin: 0 0 6px; padding: 0; display: grid; gap: 4px; }
        .tp-files li { display: grid; grid-template-columns: 12px minmax(0, 1fr) 70px 30px; gap: 6px; align-items: center; font-size: 11.5px; }
        .tp-pin { font-size: 8px; color: #555; } .tp-pin.on { color: var(--tp-acc); } .tp-fn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tp-rb { height: 4px; border-radius: 2px; background: rgba(136,136,136,.14); overflow: hidden; } .tp-rv { text-align: right; color: var(--tp-desc); font-size: 10.5px; }
        .tp-dim .tp-fn { color: var(--tp-desc); }
        .tp-btn { display: block; text-align: center; padding: 5px; border-radius: 3px; background: #0078d4; color: #fff; font-size: 11.5px; margin-top: 4px; }
        .tp-status { display: flex; justify-content: space-between; height: 22px; padding: 0 10px; align-items: center; background: #181818; border-top: 1px solid #2b2b2b; font-size: 10.5px; color: var(--tp-desc); }
        .tp-sb { color: var(--tp-low); }
        .tp-nav { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 12px; }
        .tp-steps { display: flex; gap: 2px; flex-wrap: wrap; justify-content: center; }
        .tp-steps button { display: inline-flex; align-items: center; gap: 6px; border: 0; background: none; padding: 4px 6px; font: inherit; font-size: .78rem; color: var(--muted); cursor: pointer; border-radius: 6px; }
        .tp-steps button.on { color: var(--ink); font-weight: 700; }
        .tp-dot { position: relative; width: 9px; height: 9px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); outline: 1px solid rgba(0,0,0,.08); outline-offset: -1px; overflow: hidden; }
        .tp-steps .on .tp-dot { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .tp-arrow { width: 28px; height: 28px; flex: none; border-radius: 50%; border: 1px solid var(--line-strong); background: var(--card); color: var(--ink); cursor: pointer; font-size: 1.05rem; line-height: 1; }
        .tp-arrow:hover { border-color: var(--rust); color: var(--rust-deep); }
        @media (max-width: 480px) { .tp-steps button:not(.on) .tp-lab { display: none; } .tp-steps { flex-wrap: nowrap; } }
        @media (prefers-reduced-motion: reduce) { .tp-slide, .tp-mbar i, .tp-abar i, .tp-rb i, .tp-stack i { transition: none; } .tp-bar, .tp-fill, .tp-live { animation: none; } }
      `}</style>
    </div>
  );
}
