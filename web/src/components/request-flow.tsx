"use client";
import { useEffect, useState } from "react";
import { T } from "@/i18n/lang";

/* One request, animated through the six layers: down to fetch, back up to answer.
   Each step lights its layer and says, in one sentence, what happens there. */
const LAYERS = [
  { id: "governance", name: "Guardrails & governance", say: "Checks the request: injection, personal data, policy." },
  { id: "evaluation", name: "Evaluation & observability", say: "Opens a trace, so every step can be measured later." },
  { id: "orchestration", name: "Orchestration", say: "Plans the steps and decides which tools to call." },
  { id: "caching", name: "Caching & context", say: "Reuses what it has seen; trims the rest to fit the budget." },
  { id: "memory", name: "Memory & state", say: "Recalls what matters from earlier turns." },
  { id: "retrieval", name: "Retrieval", say: "Finds the passages that belong in the window." },
];
const UP = [
  { id: "orchestration", say: "The model answers, grounded in what was retrieved." },
  { id: "evaluation", say: "The trace records cost, latency and quality." },
  { id: "governance", say: "The answer is checked once more on the way out." },
];
const SEQ = [...LAYERS.map((l) => ({ id: l.id, say: l.say, dir: "down" as const })), ...UP.map((u) => ({ ...u, dir: "up" as const }))];

export function RequestFlow() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % SEQ.length), 1900);
    return () => clearInterval(t);
  }, [auto]);
  const cur = SEQ[step];
  const row = LAYERS.findIndex((l) => l.id === cur.id);
  return (
    <div className="rf">
      <div className="rf-stack" role="list">
        {LAYERS.map((l, i) => (
          <button key={l.id} role="listitem" type="button" className={`rf-layer${i === row ? " on" : ""}`} onClick={() => { setAuto(false); setStep(i); }}>
            <span className="mono rf-n">{String(6 - i).padStart(2, "0")}</span>
            <span><T k={`rf2.${l.id}`}>{l.name}</T></span>
          </button>
        ))}
        <span className="rf-bead" style={{ top: `calc(${row} * (100% / 6) + (100% / 12) - 11px)` }} aria-hidden="true" />
      </div>
      <div className="rf-say" aria-live="polite">
        <span className="kicker">{cur.dir === "down" ? <T k="rf2.down" vars={{ n: step + 1 }}>{"Step {n} · going down"}</T> : <T k="rf2.up" vars={{ n: step + 1 }}>{"Step {n} · coming back up"}</T>}</span>
        <p key={step} className="rf-text"><T k={`rf2.say.${step}`}>{cur.say}</T></p>
        <div className="rf-ctl">
          <button type="button" className="chip" onClick={() => { setAuto(false); setStep((s) => (s + SEQ.length - 1) % SEQ.length); }}>← <T k="rf2.back">Back</T></button>
          <button type="button" className="chip" onClick={() => setAuto((a) => !a)}>{auto ? <T k="rf2.pause">Pause</T> : <T k="rf2.play">Play</T>}</button>
          <button type="button" className="chip" onClick={() => { setAuto(false); setStep((s) => (s + 1) % SEQ.length); }}><T k="rf2.next">Next</T> →</button>
        </div>
      </div>
      <style>{`
        .rf { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 32px; align-items: center; }
        .rf-stack { position: relative; display: grid; grid-template-rows: repeat(6, 1fr); gap: 8px; padding-left: 34px; }
        .rf-stack::before { content: ""; position: absolute; left: 13px; top: 6px; bottom: 6px; width: 4px; border-radius: 4px; background: var(--rod); }
        .rf-layer { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: 12px; border: 1px solid var(--line); background: var(--card); color: var(--sec); font: inherit; text-align: left; cursor: pointer; transition: all .45s var(--ease); }
        .rf-layer.on { color: var(--ink); border-color: var(--rust); background: var(--paper); transform: translateX(6px);  }
        .rf-n { font-size: .75rem; color: var(--muted); } .rf-layer.on .rf-n { color: var(--rust-deep); }
        .rf-bead { position: absolute; left: 4px; width: 22px; height: 22px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c);  transition: top .7s var(--spring); }
        .rf-say { display: flex; flex-direction: column; gap: 14px; }
        .rf-text { font-size: clamp(1.3rem, 2.4vw, 1.8rem); font-weight: 700; letter-spacing: -.02em; line-height: 1.25; animation: rise .6s var(--ease) both; }
        .rf-ctl { display: flex; gap: 8px; } .rf-ctl .chip { cursor: pointer; }
        @media (max-width: 820px) { .rf { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
