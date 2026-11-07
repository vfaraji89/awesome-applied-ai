"use client";
import { useEffect, useState } from "react";

/* The Claude API, animated. Lessons 1-3 are free and their content ships here.
   Locked lessons ship only a title and a teaser: their content is not in this build. */

type Lesson = { title: string; free: boolean; teaser: string };
const LESSONS: Lesson[] = [
  { title: "What it is: an order window", free: true, teaser: "Your app asks, Claude answers." },
  { title: "The doors, and which to use", free: true, teaser: "Six doors open today, three still being built." },
  { title: "The label on every request", free: true, teaser: "Four lines that say who you are and what you sent." },
  { title: "Let a helper do the paperwork", free: false, teaser: "Ready-made code libraries that fill in the label, retry when something fails, and stream answers as they are written." },
  { title: "Buy direct, or through your cloud", free: false, teaser: "Use Claude straight from Anthropic, or through Amazon, Google or Microsoft: what changes, and how to choose." },
  { title: "Reading a long list, page by page", free: false, teaser: "How to get through a long list of results without loading it all at once." },
  { title: "Speed limits and spending caps", free: false, teaser: "How much you can ask per minute, how much you can spend per month, and how to raise both." },
  { title: "The receipt that comes back", free: false, teaser: "The numbers on every answer, and which one to send when you ask for help." },
];

function useTicker(steps: number, ms: number, key: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setI(steps - 1); return; }
    const t = setInterval(() => setI((x) => (x + 1) % (steps + 2)), ms);
    return () => clearInterval(t);
  }, [steps, ms, key]);
  return Math.min(i, steps - 1);
}

/* 1: a request goes out, an answer comes back */
function RoundTrip() {
  const s = useTicker(4, 1300, 1);
  return (
    <div className="rt">
      <div className="rt-node"><span className="kicker">Your app</span><b>Asks a question</b></div>
      <div className="rt-wire">
        <span className={`rt-bead${s === 1 ? " go" : s >= 2 ? " back" : ""}`} />
        <span className={`rt-tag up${s >= 1 ? " on" : ""}`}>The order goes in →</span>
        <span className={`rt-tag down${s >= 3 ? " on" : ""}`}>← The answer comes back, with a receipt number</span>
      </div>
      <div className={`rt-node api${s >= 1 && s <= 2 ? " busy" : ""}`}><span className="kicker">The order window</span><b>api.anthropic.com</b></div>
    </div>
  );
}

/* 2: the endpoints, one by one */
const ENDPOINTS: [string, string, string, boolean][] = [
  ["Messages", "/v1/messages", "Ask Claude something, get an answer. Start here.", false],
  ["Message Batches", "/v1/messages/batches", "Drop off a big pile of questions, collect the answers later, pay half.", false],
  ["Token Counting", "/v1/messages/count_tokens", "Check the price before you order.", false],
  ["Models", "/v1/models", "Read the menu of Claude models.", false],
  ["Files", "/v1/files", "Hand over a file once, use it many times.", false],
  ["Skills", "/v1/skills", "Teach Claude a routine it can reuse.", false],
  ["Agents", "/v1/agents", "Save an assistant's setup to use again.", true],
  ["Sessions", "/v1/sessions", "Let the assistant work on a task in its own room.", true],
  ["Environments", "/v1/environments", "Design that room.", true],
];
function EndpointMap() {
  const s = useTicker(ENDPOINTS.length, 700, 2);
  return (
    <div className="em">
      {ENDPOINTS.map(([n, path, what, beta], i) => (
        <div key={n} className={`em-card${i <= s ? " on" : ""}${beta ? " beta" : ""}`}>
          <div className="em-top"><b>{n}</b>{beta && <span className="soon">Being built</span>}</div>
          <code className="mono">{path}</code>
          <span className="muted">{what}</span>
        </div>
      ))}
    </div>
  );
}

/* 3: the request, header by header */
const HEADERS: [string, string, string][] = [
  ["Authorization: Bearer <your key>", "Who you are · always", "Your key, like a key card at a hotel. You get it from the Claude Console. Keep it secret."],
  ["anthropic-version: 2026-10-21", "Which rulebook · always", "A date that says which version of the rules you built for, so nothing changes under your feet."],
  ["anthropic-workspace-id: wrkspc_…", "Which team · only sometimes", "Which team's account pays for this. Only needed when your key is not already tied to one team."],
  ["content-type: application/json", "What is inside · always", "The letter is written in JSON, a standard format every program can read."],
];
function Headers() {
  const s = useTicker(HEADERS.length, 2300, 3);
  return (
    <div className="hd">
      <pre className="hd-req mono">
        <span className="hd-line dim">POST /v1/messages HTTP/1.1</span>
        <span className="hd-line dim">Host: api.anthropic.com</span>
        {HEADERS.map(([h], i) => <span key={h} className={`hd-line${i <= s ? " on" : ""}${i === s ? " cur" : ""}`}>{h}</span>)}
      </pre>
      <div key={s} className="hd-say">
        <span className="kicker">{HEADERS[s][1]}</span>
        <p>{HEADERS[s][2]}</p>
      </div>
    </div>
  );
}

const BODY: Record<number, { h: string; analogy: string; p: string[]; hint: string; anim: React.ReactNode }> = {
  0: { h: "Your app asks, Claude answers", anim: <RoundTrip />,
    analogy: "Think of a restaurant's order window. You hand in an order, the kitchen cooks, and you get your food back with a receipt number.",
    p: ["The Claude API is that window, at the address api.anthropic.com. Your app writes a short message, sends it, and Claude's answer comes back.",
      "The same window does two jobs: answering single questions, and running assistants that work on longer tasks for you."],
    hint: "Before your first order you need two things: an account in the Claude Console, and a key. The key is like a membership card: it proves the order is yours." },
  1: { h: "Six doors open, three being built", anim: <EndpointMap />,
    analogy: "Picture a building with labelled doors. Each door does one kind of job, so you walk to the one you need.",
    p: ["Most people only ever use the first door, Messages: ask something, get an answer.",
      "Batches is for when speed does not matter: leave a pile of questions and pick up the answers later, at half the price. Token Counting tells you what a question will cost before you send it.",
      "The three doors still being built are for assistants that work on their own: saving their setup, giving them a room to work in, and designing that room."],
    hint: "Start with Messages. Reach for Batches when you have hundreds of questions and can wait." },
  2: { h: "Four lines on the envelope", anim: <Headers />,
    analogy: "Every request is an envelope. Before anyone opens it, the label says who sent it, which rulebook applies, which team pays, and what is inside.",
    p: ["Those four label lines are called headers. Three are needed every time; the team line only when your key is not tied to one team.",
      "Get one wrong and the window sends the envelope back with a short note saying what was missing."],
    hint: "You rarely write the label yourself. Anthropic's ready-made code libraries fill it in for you, except the team line, which you add when you need it." },
};

const Lock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" /></svg>
);

export function ClaudeApiCourse() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const n = Number(window.location.hash.replace("#lesson-", ""));
    if (n >= 1 && n <= LESSONS.length) setI(n - 1);
  }, []);
  const go = (n: number) => { setI(n); history.replaceState(null, "", `#lesson-${n + 1}`); };
  const l = LESSONS[i];
  const b = BODY[i];
  const freeCount = LESSONS.filter((x) => x.free).length;
  return (
    <div className="cc">
      <nav className="cc-list" aria-label="Lessons">
        {LESSONS.map((x, k) => (
          <button key={x.title} type="button" className={`cc-item${k === i ? " on" : ""}${x.free ? "" : " locked"}`} onClick={() => go(k)} aria-current={k === i ? "step" : undefined}>
            <span className={`bead${x.free ? (k <= i ? "" : " white") : " white"}`} />
            <span className="mono count">{String(k + 1).padStart(2, "0")}</span>
            <span className="cc-t">{x.title}</span>
            {!x.free && <span className="cc-lock"><Lock /></span>}
          </button>
        ))}
        <p className="count" style={{ margin: "14px 0 0" }}>{freeCount} free · {LESSONS.length - freeCount} in the paid course</p>
      </nav>

      <article key={i} className="cc-panel frame">
        <span className="kicker">Lesson {String(i + 1).padStart(2, "0")} · {l.title}</span>
        {l.free && b ? (
          <>
            <h2 style={{ marginTop: 10 }}>{b.h}<span className="dot">.</span></h2>
            <div className="cc-box analogy"><span className="cc-ico" aria-hidden="true">≈</span><div><span className="kicker">Think of it like this</span><p>{b.analogy}</p></div></div>
            <div className="cc-anim">{b.anim}</div>
            {b.p.map((t) => <p key={t} className="cc-p">{t}</p>)}
            <div className="cc-box hint"><span className="cc-ico" aria-hidden="true">✦</span><div><span className="kicker">Useful hint</span><p>{b.hint}</p></div></div>
          </>
        ) : (
          <div className="cc-locked">
            <span className="cc-bigLock"><Lock /></span>
            <h2>{l.title}<span className="dot">.</span></h2>
            <p className="lead">{l.teaser}</p>
            <span className="soon">Paid course · coming soon</span>
          </div>
        )}
        <div className="cc-nav">
          <button type="button" className="chip" disabled={i === 0} onClick={() => go(i - 1)}>← Previous</button>
          <button type="button" className="chip" disabled={i === LESSONS.length - 1} onClick={() => go(i + 1)}>Next →</button>
        </div>
      </article>

      <style>{`
        .cc { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; align-items: start; }
        @media (max-width: 900px) { .cc { grid-template-columns: 1fr; } }
        .cc-list { position: sticky; top: 84px; display: flex; flex-direction: column; gap: 4px; }
        .cc-item { all: unset; cursor: pointer; display: grid; grid-template-columns: 14px 24px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 12px; font-size: .95rem; color: var(--sec); }
        .cc-item:hover { background: var(--paper); color: var(--ink); }
        .cc-item.on { background: var(--paper); color: var(--ink); box-shadow: inset 3px 0 0 var(--rust); }
        .cc-item.locked .cc-t { color: var(--muted); }
        .cc-item:focus-visible { outline: 2px solid var(--rust); }
        .cc-lock { color: var(--muted); }
        .cc-panel { min-height: 520px; animation: rise .5s var(--ease) both; display: flex; flex-direction: column; }
        .cc-anim { margin: 26px 0; padding: 26px; border-radius: 14px; background: var(--paper); min-height: 220px; display: flex; align-items: center; }
        .cc-anim > * { width: 100%; }
        .cc-p { color: var(--sec); font-size: 1.08rem; margin-top: 10px; max-width: 64ch; line-height: 1.6; }
        .cc-box { display: grid; grid-template-columns: 34px 1fr; gap: 12px; align-items: start; margin-top: 18px; padding: 14px 16px; border-radius: 12px; max-width: 70ch; }
        .cc-box p { margin-top: 4px; font-size: 1.02rem; }
        .cc-box.analogy { background: var(--paper); border: 1px solid var(--line); }
        .cc-box.hint { border: 1.5px dashed var(--rust); margin-top: 22px; }
        .cc-ico { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: #fff; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .cc-box.analogy .cc-ico { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
        .cc-nav { display: flex; justify-content: space-between; margin-top: auto; padding-top: 28px; }
        .cc-nav .chip { cursor: pointer; font: inherit; font-size: .85rem; } .cc-nav .chip:disabled { opacity: .35; cursor: default; }
        .cc-locked { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; margin: 40px 0; }
        .cc-bigLock { width: 64px; height: 64px; border-radius: 18px; display: grid; place-items: center; background: var(--paper); color: var(--rust-deep); }
        .cc-bigLock svg { width: 28px; height: 28px; }

        .rt { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 14px; align-items: center; }
        .rt-node { display: flex; flex-direction: column; gap: 6px; padding: 18px; border-radius: 14px; background: var(--card); border: 1px solid var(--line); transition: all .4s var(--ease); }
        .rt-node.api.busy { border-color: var(--rust); box-shadow: 0 0 0 5px var(--mark); }
        .rt-wire { position: relative; height: 90px; }
        .rt-wire::before { content: ""; position: absolute; left: 0; right: 0; top: 43px; height: 4px; border-radius: 4px; background: var(--rod); }
        .rt-bead { position: absolute; top: 34px; left: 0; width: 22px; height: 22px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); transition: left 1.1s var(--ease); }
        .rt-bead.go { left: calc(100% - 22px); } .rt-bead.back { left: 0; }
        .rt-tag { position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; font-family: var(--font-mono), monospace; font-size: .72rem; color: var(--muted); opacity: .25; transition: opacity .4s, color .4s; }
        .rt-tag.up { top: 0; } .rt-tag.down { bottom: 0; } .rt-tag.on { opacity: 1; color: var(--rust-deep); }
        @media (max-width: 640px) { .rt { grid-template-columns: 1fr; } .rt-wire { height: 110px; } }

        .em { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr)); gap: 10px; }
        .em-card { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); opacity: .15; transform: translateY(8px) scale(.97); transition: all .5s var(--spring); font-size: .88rem; }
        .em-card.on { opacity: 1; transform: none; }
        .em-card.beta { border-style: dashed; border-color: var(--rust); }
        .em-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .em-card code { font-size: .74rem; color: var(--rust-deep); }

        .hd { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 20px; align-items: center; }
        @media (max-width: 760px) { .hd { grid-template-columns: 1fr; } }
        .hd-req { margin: 0; padding: 18px; border-radius: 12px; background: #1c1c1e; color: #e9e6e1; font-size: .82rem; display: flex; flex-direction: column; gap: 6px; overflow-x: auto; }
        .hd-line { opacity: .15; transition: opacity .4s; white-space: pre; } .hd-line.dim { opacity: .5; } .hd-line.on { opacity: 1; }
        .hd-line.cur { color: #ff8f80; }
        .hd-say { animation: rise .5s var(--ease) both; display: flex; flex-direction: column; gap: 8px; } .hd-say p { font-size: 1.05rem; }
      `}</style>
    </div>
  );
}
