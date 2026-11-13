"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LessonCardPlayer } from "./remotion/players";

gsap.registerPlugin(useGSAP);

/* How your app talks to Claude: the Claude Platform course, animated. Free and open to everyone.
   Facts come from the official Claude API overview; every lesson has an everyday comparison, an animation and a hint. */

type Lesson = { title: string; ready: boolean; teaser: string };
const LESSONS: Lesson[] = [
  { title: "What it is: an order window", ready: true, teaser: "Your app asks, Claude answers." },
  { title: "The doors, and which to use", ready: true, teaser: "Six doors open today, three still being built." },
  { title: "The label on every request", ready: true, teaser: "Four lines that say who you are and what you sent." },
  { title: "Let a helper do the paperwork", ready: true, teaser: "Ready-made code libraries that fill in the label, retry when something fails, and stream answers as they are written." },
  { title: "Buy direct, or through your cloud", ready: true, teaser: "Use Claude straight from Anthropic, or through Amazon, Google or Microsoft: what changes, and how to choose." },
  { title: "Reading a long list, page by page", ready: true, teaser: "How to get through a long list of results without loading it all at once." },
  { title: "Speed limits and spending caps", ready: true, teaser: "How much you can ask per minute, how much you can spend per month, and how to raise both." },
  { title: "The receipt that comes back", ready: true, teaser: "The numbers on every answer, and which one to send when you ask for help." },
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
function Headers({ lines = HEADERS, top = ["POST /v1/messages HTTP/1.1", "Host: api.anthropic.com"], k = 3 }: { lines?: [string, string, string][]; top?: string[]; k?: number }) {
  const s = useTicker(lines.length, 2300, k);
  return (
    <div className="hd">
      <pre className="hd-req mono">
        {top.map((t) => <span key={t} className="hd-line dim">{t}</span>)}
        {lines.map(([h], i) => <span key={h} className={`hd-line${i <= s ? " on" : ""}${i === s ? " cur" : ""}`}>{h}</span>)}
      </pre>
      <div key={s} className="hd-say">
        <span className="kicker">{lines[s][1]}</span>
        <p>{lines[s][2]}</p>
      </div>
    </div>
  );
}

/* 4: the helper (SDK) ticks off the paperwork */
const CHORES: [string, string][] = [
  ["Writes the label", "Your key, the rulebook date and the format line go on every request for you."],
  ["Checks the shapes", "Your editor warns you before you send a question in the wrong shape, and knows the shape of each answer."],
  ["Tries again", "If the line is busy or something fails on the way, it waits a moment and sends again."],
  ["Streams the answer", "Shows the answer word by word as Claude writes it, instead of all at the end."],
  ["Keeps time", "Stops waiting after a set time and keeps connections tidy, so your app never hangs."],
];
function Helper() {
  const s = useTicker(CHORES.length, 1500, 4);
  return (
    <div className="hp">
      {CHORES.map(([t, d], i) => (
        <div key={t} className={`hp-row${i <= s ? " on" : ""}${i === s ? " cur" : ""}`}>
          <span className="hp-tick" aria-hidden="true">{i <= s ? "✓" : ""}</span>
          <div><b>{t}</b><span className="muted">{d}</span></div>
        </div>
      ))}
      <div className={`hp-left${s === CHORES.length - 1 ? " on" : ""}`}><span className="kicker">Still yours to add</span> The team line, when your key needs it.</div>
    </div>
  );
}

/* 5: direct, or through a cloud */
const PLACES: [string, string, "anthropic" | "partner"][] = [
  ["Claude API", "Straight from Anthropic", "anthropic"],
  ["Claude Platform on AWS", "Amazon cloud · run by Anthropic", "anthropic"],
  ["Claude Models on Google Cloud (Anthropic managed)", "Google cloud · run by Anthropic", "anthropic"],
  ["Microsoft Foundry", "Microsoft Azure · run by Anthropic", "anthropic"],
  ["Amazon Bedrock", "Amazon cloud · run by Amazon", "partner"],
  ["Claude Models on Google Cloud (Google managed)", "Google cloud · run by Google", "partner"],
];
function Places() {
  const s = useTicker(PLACES.length, 1100, 5);
  return (
    <div className="pl">
      {(["anthropic", "partner"] as const).map((g) => (
        <div key={g} className="pl-col">
          <span className="kicker">{g === "anthropic" ? "Run by Anthropic" : "Run by the cloud company"}</span>
          {PLACES.map(([n, d, gg], i) => gg === g && (
            <div key={n} className={`pl-card${i <= s ? " on" : ""}${i === 0 ? " home" : ""}`}><b>{n}</b><span className="muted">{d}</span></div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* 6: a long list, one page at a time */
const PAGES: { items: string[]; next: string | null }[] = [
  { items: ["item 1", "item 2", "item 3"], next: "\"pg_2\"" },
  { items: ["item 4", "item 5", "item 6"], next: "\"pg_3\"" },
  { items: ["item 7", "item 8"], next: null },
];
function Pages() {
  const s = useTicker(PAGES.length, 1800, 6);
  const p = PAGES[s];
  return (
    <div className="pg">
      <div className="pg-ask mono">GET /v1/sessions?limit=3{s > 0 ? `&page=pg_${s + 1}` : ""}</div>
      <div key={s} className="pg-sheet">
        <span className="kicker">Page {s + 1}</span>
        <ul>{p.items.map((x) => <li key={x}><span className="bead" />{x}</li>)}</ul>
        <div className={`pg-next mono${p.next ? "" : " end"}`}>next_page: {p.next ?? "null"}</div>
        <span className="muted">{p.next ? "A bookmark for the next page." : "No bookmark: you have reached the end."}</span>
      </div>
    </div>
  );
}

/* 7: the bucket that refills */
function Bucket() {
  const s = useTicker(10, 650, 7);
  const levels = [100, 80, 60, 40, 20, 8, 30, 55, 80, 100];
  const notes = ["Full bucket", "A request takes some", "And another", "Busy minute", "Nearly empty", "Empty: wait a moment", "It refills at a steady pace", "Refilling", "Refilling", "Full again"];
  const lvl = levels[s];
  return (
    <div className="bk">
      <div className="bk-tub" aria-hidden="true"><span className={`bk-water${lvl < 15 ? " low" : ""}`} style={{ height: `${lvl}%` }} /></div>
      <div className="bk-say">
        <span className="kicker">{notes[s]}</span>
        <div className="bk-row"><span className="chip">Requests per minute</span><span className="chip">Tokens per minute</span></div>
        <div className="bk-row"><span className="chip on">Monthly spend cap</span></div>
        <p className="muted">Your tier sets the size of the bucket and the cap. Use the account more, and you move up a tier.</p>
      </div>
    </div>
  );
}

/* 8: the receipt, line by line */
const RECEIPT: [string, string, string][] = [
  ["request-id: req_018EeWyXxfu5pfWkrYcMdjWG", "Receipt number", "A unique id for this one request. This is the one to send when you ask support for help."],
  ["anthropic-organization-id: …", "Your company", "Which organization the key or token belongs to."],
  ["anthropic-workspace-id: wrkspc_…", "Your team", "Which workspace the request ran in, even if it is the Default Workspace. Missing when the request failed before it knew who you are."],
];

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
  3: { h: "Let a helper fill in the forms", anim: <Helper />,
    analogy: "Sending requests by hand is like doing your own tax forms. An SDK is the accountant: you say what you want, and it fills in every box the same careful way each time.",
    p: ["An SDK is a ready-made code library from Anthropic. You install it in your project and call Claude with one line, instead of writing the whole request yourself.",
      "It writes the label for you, checks that your question and the answer have the right shape, tries again when something fails on the way, shows answers as they are written, and stops waiting if a reply takes too long.",
      "There is an official SDK for each of the popular programming languages. The list lives on the SDKs, CLI and libraries page of the docs."],
    hint: "Use an SDK unless you have a strong reason not to. The one line it does not add for you is the team line (the workspace id): pass it yourself when your key is not tied to one team." },
  4: { h: "Buy direct, or through your cloud", anim: <Places />,
    analogy: "You can buy bread at the bakery, or at the supermarket you already shop at. The bakery has every loaf the day it comes out. The supermarket puts it on the bill you already pay, but may not stock every loaf yet.",
    p: ["Going direct, through the Claude API, gets you the newest models and features first, with Anthropic's own billing and support. It is the best start for something new.",
      "Going through Amazon, Google or Microsoft puts Claude on your existing cloud bill and uses that cloud's own logins and permissions. That suits a company that already has a cloud contract or strict compliance rules.",
      "Some cloud options are run by Anthropic itself, others by the cloud company. Which features you get depends on the option, so check its page first. Claude's managed assistants, for example, are only on the direct API, Claude Platform on AWS and the Anthropic-managed Google Cloud option."],
    hint: "The size of one request has a limit, and it changes with the door you use: up to 128 MB for a message going direct, 32 MB on the Anthropic-run cloud options, 30 MB on Google-managed Google Cloud and 20 MB on Bedrock. Go over it and you get a 413 \"request too large\" error." },
  5: { h: "A long list comes a page at a time", anim: <Pages />,
    analogy: "A shop catalogue is too heavy to post in one go, so the shop sends one page with a bookmark slip. Send the slip back and you get the next page. A blank slip means you have seen it all.",
    p: ["When you ask for a list, such as your past sessions, the answer comes in pages. You choose how many items per page with limit.",
      "Each page comes with next_page, the bookmark. Send it back as page to get the next one. When next_page is null, there is nothing left. You can also choose the order, oldest or newest first, but a bookmark only works with the order it was made for.",
      "Going backwards works only for sessions, which also send prev_page. A few older lists, such as Models and Message Batches, use a different bookmark: after_id and before_id, with has_more to say whether more is waiting."],
    hint: "The SDK can walk through every page for you, forwards only. To step back a page, read prev_page yourself and send it as page." },
  6: { h: "Speed limits and a monthly cap", anim: <Bucket />,
    analogy: "Think of a bucket under a tap. Every request scoops some water out. The tap refills it at a steady pace. Scoop faster than it fills and you wait a moment until there is enough again.",
    p: ["Each account has two kinds of limit. Rate limits say how much you can ask per minute: how many requests, and how many tokens, the small pieces of text Claude reads and writes. Spend limits cap how much you can spend in a month.",
      "Limits come in usage tiers. Your organization is put on a tier automatically and moves up over time as you use the platform.",
      "You can see your rate limits on the Rate limits page of the Claude Console, and your spend limit on the Billing page."],
    hint: "Need more room? Use Request tier increase on the Rate limits page in the Console. To stay under the cap, check what a question will cost first with Token Counting, or send big piles through Batches at half the price." },
  7: { h: "The receipt that comes back", anim: <Headers lines={RECEIPT} top={["HTTP/1.1 200 OK", "content-type: application/json"]} k={8} />,
    analogy: "Every order comes back with a receipt. You rarely read it, but when something goes wrong, the receipt number is the first thing the shop asks for.",
    p: ["Every answer from Claude carries a few lines on top, called response headers. The most useful is request-id, a unique number for that one request.",
      "Two more say whose request it was: the organization the key belongs to, and the workspace the request ran in.",
      "If you use Claude Platform on AWS, you get an extra Amazon receipt number, x-amzn-requestid, next to the usual one."],
    hint: "Log the request-id with every call. When something looks wrong, sending that one id to support saves everyone hours of searching." },
};

/** The course layout (page list, panel, comparison and hint boxes, nav), shared by every doc. */
export const courseBaseCss = `
        .cc { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; align-items: start; }
        @media (max-width: 900px) { .cc { grid-template-columns: 1fr; } }
        .cc-list { position: sticky; top: 84px; display: flex; flex-direction: column; gap: 4px; }
        .cc-item { all: unset; cursor: pointer; display: grid; grid-template-columns: 14px 24px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 12px; font-size: .95rem; color: var(--sec); }
        .cc-item:hover { background: var(--paper); color: var(--ink); }
        .cc-item.on { background: var(--paper); color: var(--ink); box-shadow: inset 3px 0 0 var(--rust); }
        .cc-item.later .cc-t { color: var(--muted); }
        .cc-item:focus-visible { outline: 2px solid var(--rust); }
        .cc-soon { margin-left: auto; font-family: var(--font-mono), monospace; font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
        .cc-panel { min-height: 520px; display: flex; flex-direction: column; }
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
        .cc-open { margin: -6px -6px 6px; box-shadow: 0 18px 30px -24px rgba(60,30,10,.5); border-radius: 14px; }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .cc-later { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; margin: 40px 0; }

`;

export function ClaudeApiCourse() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const n = Number(window.location.hash.replace("#lesson-", ""));
    if (n >= 1 && n <= LESSONS.length) setI(n - 1);
  }, []);
  const go = (n: number) => { setI(n); history.replaceState(null, "", `#lesson-${n + 1}`); };
  const l = LESSONS[i];
  const b = BODY[i];
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".cc-panel", { y: 24, autoAlpha: 0, duration: .5 })
        .from(".cc-panel .cc-step", { y: 22, autoAlpha: 0, duration: .55, stagger: .09 }, "-=.25")
        .from(".cc-item.on .bead", { scale: 0, duration: .6, ease: "expo.out" }, 0);
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [i] });
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".cc-item", { x: -16, autoAlpha: 0, stagger: .05, duration: .45, ease: "power2.out" });
    });
  }, { scope: root });
  return (
    <div className="cc" ref={root}>
      <nav className="cc-list" aria-label="Pages">
        {LESSONS.map((x, k) => (
          <button key={x.title} type="button" className={`cc-item${k === i ? " on" : ""}${x.ready ? "" : " later"}`} onClick={() => go(k)} aria-current={k === i ? "step" : undefined}>
            <span className={`bead${x.ready && k <= i ? "" : " white"}`} />
            <span className="mono count">{String(k + 1).padStart(2, "0")}</span>
            <span className="cc-t">{x.title}</span>
            {!x.ready && <span className="cc-soon">soon</span>}
          </button>
        ))}
        <p className="count" style={{ margin: "14px 0 0" }}>{LESSONS.length} pages · free, open to everyone</p>
      </nav>

      <article key={i} className="cc-panel frame">
        {l.ready && b ? (
          <>
            <div className="cc-step cc-open"><LessonCardPlayer n={i + 1} total={LESSONS.length} title={b.h} analogy={l.teaser} /></div>
            <h2 className="sr-only">Page {i + 1}: {b.h}</h2>
            <div className="cc-step cc-box analogy"><span className="cc-ico" aria-hidden="true">≈</span><div><span className="kicker">Think of it like this</span><p>{b.analogy}</p></div></div>
            <div className="cc-step cc-anim">{b.anim}</div>
            {b.p.map((t) => <p key={t} className="cc-step cc-p">{t}</p>)}
            <div className="cc-step cc-box hint"><span className="cc-ico" aria-hidden="true">✦</span><div><span className="kicker">Useful hint</span><p>{b.hint}</p></div></div>
          </>
        ) : (
          <div className="cc-later">
            <h2>{l.title}<span className="dot">.</span></h2>
            <p className="lead">{l.teaser}</p>
            <span className="soon">Free lesson · coming soon</span>
          </div>
        )}
        <div className="cc-nav">
          <button type="button" className="chip" disabled={i === 0} onClick={() => go(i - 1)}>← Previous</button>
          <button type="button" className="chip" disabled={i === LESSONS.length - 1} onClick={() => go(i + 1)}>Next →</button>
        </div>
      </article>

      <style>{`
        ${courseBaseCss}
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
        .hp { display: flex; flex-direction: column; gap: 8px; }
        .hp-row { display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: start; padding: 10px 12px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); opacity: .3; transition: all .4s var(--ease); }
        .hp-row div { display: flex; flex-direction: column; gap: 2px; font-size: .92rem; }
        .hp-row.on { opacity: 1; } .hp-row.cur { border-color: var(--rust); box-shadow: 0 0 0 4px var(--mark); }
        .hp-tick { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: .8rem; background: var(--line); transition: background .4s; }
        .hp-row.on .hp-tick { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .hp-left { margin-top: 6px; padding: 10px 12px; border-radius: 12px; border: 1.5px dashed var(--rust); font-size: .92rem; opacity: .3; transition: opacity .4s; } .hp-left.on { opacity: 1; }

        .pl { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; } @media (max-width: 640px) { .pl { grid-template-columns: 1fr; } }
        .pl-col { display: flex; flex-direction: column; gap: 8px; }
        .pl-card { display: flex; flex-direction: column; gap: 2px; padding: 10px 14px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); font-size: .9rem; opacity: .15; transform: translateY(8px); transition: all .5s var(--spring); }
        .pl-card.on { opacity: 1; transform: none; } .pl-card.home { border-color: var(--rust); }

        .pg { display: flex; flex-direction: column; gap: 12px; }
        .pg-ask { padding: 10px 14px; border-radius: 10px; background: #1c1c1e; color: #e9e6e1; font-size: .82rem; overflow-x: auto; white-space: nowrap; }
        .pg-sheet { animation: rise .5s var(--ease) both; display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); }
        .pg-sheet ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 14px; flex-wrap: wrap; } .pg-sheet li { display: flex; align-items: center; gap: 8px; }
        .pg-next { align-self: flex-start; padding: 4px 10px; border-radius: 8px; background: var(--mark); color: var(--rust-deep); font-size: .8rem; } .pg-next.end { background: var(--paper); color: var(--muted); }

        .bk { display: grid; grid-template-columns: 120px 1fr; gap: 24px; align-items: center; } @media (max-width: 520px) { .bk { grid-template-columns: 1fr; } }
        .bk-tub { position: relative; height: 150px; width: 110px; border: 4px solid var(--ink); border-top: none; border-radius: 0 0 22px 22px; overflow: hidden; background: var(--card); }
        .bk-water { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, #ff9d8f, #e0301e); transition: height .55s var(--ease); } .bk-water.low { background: var(--muted); }
        .bk-say { display: flex; flex-direction: column; gap: 10px; } .bk-row { display: flex; gap: 8px; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
