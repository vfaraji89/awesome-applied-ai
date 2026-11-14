"use client";
import { useEffect, useState } from "react";
import { DocShell, type DocPage } from "./doc-shell";

/* MCP, the Model Context Protocol, as an animated doc. Free and open to everyone.
   Facts follow the specification at modelcontextprotocol.io (dated versions such as 2025-06-18);
   every page has an everyday comparison, an animation and a hint. */

type Lesson = { title: string; teaser: string };
export const MCP_LESSONS: Lesson[] = [
  { title: "What it is: one plug for every tool", teaser: "Without a standard, every app needs its own cable to every tool. MCP is the one plug." },
  { title: "Host, client and server", teaser: "The app you use, the connector inside it, and the program that does the work." },
  { title: "What a server offers", teaser: "Tools the model can use, resources it can read, and prompts you can pick." },
  { title: "What the app offers back", teaser: "A server can ask the app's model to write, ask which folders it may touch, and ask you a question." },
  { title: "The handshake", teaser: "Before any work, both sides say which version they speak and what they can do." },
  { title: "The messages", teaser: "Every message is a small JSON note: a request, its reply, or a heads-up that needs no reply." },
  { title: "Local or remote", teaser: "A server on your own machine talks over standard input and output; a remote one over HTTP." },
  { title: "Who may call: authorization", teaser: "Remote servers use OAuth: you sign in once, the app gets a token, the token goes with every call." },
  { title: "Staying safe", teaser: "Tools can act in the real world. Keep a person in the loop and trust no description blindly." },
  { title: "Build your first server", teaser: "Ten lines of Python, a test in the Inspector, and one entry in your app's settings." },
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

/* 1: from a tangle of custom cables to one plug */
const APPS = ["Chat app", "Code editor", "Your agent"], TOOLS = ["Files", "GitHub", "Database", "Calendar"];
function Tangle() {
  const s = useTicker(3, 1700, 1);
  const ay = (i: number) => 40 + i * 70, ty = (i: number) => 25 + i * 60;
  const hub = s >= 1;
  return (
    <div className="tg">
      <svg viewBox="0 0 560 260" role="img" aria-label={hub ? "Each app and each tool connects once, to MCP" : "Every app wired to every tool"}>
        {APPS.flatMap((_, a) => TOOLS.map((__, t) => (
          <line key={`x${a}${t}`} x1="120" y1={ay(a)} x2="440" y2={ty(t)} className={`tg-x${hub ? " off" : ""}`} />
        )))}
        {APPS.map((_, a) => <line key={`a${a}`} x1="120" y1={ay(a)} x2="280" y2="130" className={`tg-h${hub ? " on" : ""}`} style={{ transitionDelay: `${a * 90}ms` }} />)}
        {TOOLS.map((_, t) => <line key={`t${t}`} x1="280" y1="130" x2="440" y2={ty(t)} className={`tg-h${hub ? " on" : ""}`} style={{ transitionDelay: `${300 + t * 90}ms` }} />)}
        <g className={`tg-hub${hub ? " on" : ""}`}><circle cx="280" cy="130" r="30" /><text x="280" y="135" textAnchor="middle">MCP</text></g>
        {APPS.map((n, a) => <g key={n}><rect x="8" y={ay(a) - 16} width="112" height="32" rx="9" className="tg-box" /><text x="64" y={ay(a) + 5} textAnchor="middle" className="tg-t">{n}</text></g>)}
        {TOOLS.map((n, t) => <g key={n}><rect x="440" y={ty(t) - 16} width="112" height="32" rx="9" className="tg-box" /><text x="496" y={ty(t) + 5} textAnchor="middle" className="tg-t">{n}</text></g>)}
      </svg>
      <div className="tg-count">
        <span className={hub ? "" : "on"}><b>{APPS.length * TOOLS.length}</b> custom cables, one per app and tool</span>
        <span className={hub ? "on" : ""}><b>{APPS.length + TOOLS.length}</b> plugs, one per app and one per tool</span>
      </div>
    </div>
  );
}

/* 2: the host holds one client per server */
const SERVERS = [["Files server", "reads your folders"], ["GitHub server", "opens issues, reads code"], ["Database server", "runs read-only queries"]];
function Roles() {
  const s = useTicker(SERVERS.length, 1400, 2);
  return (
    <div className="rl">
      <div className="rl-host">
        <span className="kicker">Host: the app you use</span>
        <b>Claude Desktop, an IDE, your own agent</b>
        <div className="rl-clients">{SERVERS.map(([n], i) => <span key={n} className={`rl-client${i === s ? " on" : ""}`}>client {i + 1}</span>)}</div>
      </div>
      <div className="rl-wires">{SERVERS.map((_, i) => <span key={i} className={`rl-wire${i === s ? " on" : ""}`}><i /></span>)}</div>
      <div className="rl-servers">{SERVERS.map(([n, w], i) => <div key={n} className={`rl-server${i === s ? " on" : ""}`}><b>{n}</b><span className="muted">{w}</span></div>)}</div>
    </div>
  );
}

/* 3: the three things a server can offer, and who decides when they are used */
const PRIMS: [string, string, string, string][] = [
  ["Tools", "The model decides", "Actions with typed inputs. The model picks one when a task needs it.", "create_issue(title, body)"],
  ["Resources", "The app decides", "Read-only context with an address, like a file or a record, that the app chooses to attach.", "file:///notes/today.md"],
  ["Prompts", "You decide", "Ready-made templates you pick, often as a slash command.", "/summarise-pull-request"],
];
function Primitives() {
  const s = useTicker(PRIMS.length, 1600, 3);
  return (
    <div className="pm">
      {PRIMS.map(([n, who, what, ex], i) => (
        <div key={n} className={`pm-card${i === s ? " on" : ""}`}>
          <span className="pm-who">{who}</span>
          <b>{n}</b>
          <span className="muted">{what}</span>
          <code className="mono">{ex}</code>
        </div>
      ))}
    </div>
  );
}

/* 4: requests that go the other way, from server to app */
const BACK: [string, string, string][] = [
  ["Sampling", "Server → app's model", "“Summarise these 40 log lines for me.” The server borrows the app's model, with your approval, instead of bringing its own."],
  ["Roots", "App → server", "“You may work in ~/projects/site and nothing else.” The app tells the server which folders or addresses are in bounds."],
  ["Elicitation", "Server → you", "“Which repository do you mean?” The server asks you a short question in the middle of a task, through the app."],
];
function BackChannel() {
  const s = useTicker(BACK.length, 1700, 4);
  return (
    <div className="bc">
      <div className="bc-row"><span className="bc-node">App</span><span className="bc-lane"><i className={`bc-bead s${s}`} /></span><span className="bc-node">Server</span></div>
      <div className="bc-cards">
        {BACK.map(([n, dir, ex], i) => (
          <div key={n} className={`bc-card${i === s ? " on" : ""}`}><span className="kicker">{dir}</span><b>{n}</b><span className="muted">{ex}</span></div>
        ))}
      </div>
    </div>
  );
}

/* 5: the handshake, message by message */
const HANDSHAKE: [string, "r" | "l", string, string][] = [
  ["initialize", "r", "Client: here is my version and what I can do", `{ "method": "initialize",\n  "params": { "protocolVersion": "2025-06-18",\n    "capabilities": { "roots": {}, "sampling": {} },\n    "clientInfo": { "name": "my-app" } } }`],
  ["result", "l", "Server: agreed, and here is what I offer", `{ "result": { "protocolVersion": "2025-06-18",\n    "capabilities": { "tools": {}, "resources": {} },\n    "serverInfo": { "name": "files" } } }`],
  ["initialized", "r", "Client: ready, let us work", `{ "method": "notifications/initialized" }`],
  ["tools/list", "r", "Now normal work begins", `{ "method": "tools/list" }`],
];
function Handshake() {
  const s = useTicker(HANDSHAKE.length, 1500, 5);
  return (
    <div className="hs">
      <div className="hs-seq">
        <div className="hs-heads"><b>Client</b><b>Server</b></div>
        {HANDSHAKE.map(([m, dir, say], i) => (
          <div key={m} className={`hs-msg ${dir}${i <= s ? " on" : ""}${i === s ? " cur" : ""}`}>
            <span className="hs-arrow"><i /></span>
            <span className="mono hs-m">{m}</span>
            <span className="hs-say">{say}</span>
          </div>
        ))}
      </div>
      <pre className="hs-code mono" key={s}>{HANDSHAKE[s][3]}</pre>
    </div>
  );
}

/* 6: three kinds of message */
const MSGS: [string, string, string][] = [
  ["Request", "has an id, wants a reply", `{ "jsonrpc": "2.0", "id": 7,\n  "method": "tools/call",\n  "params": { "name": "create_issue",\n    "arguments": { "title": "Fix login" } } }`],
  ["Response", "same id, carries the result", `{ "jsonrpc": "2.0", "id": 7,\n  "result": { "content": [\n    { "type": "text", "text": "Opened issue #42" } ] } }`],
  ["Notification", "no id, no reply expected", `{ "jsonrpc": "2.0",\n  "method": "notifications/tools/list_changed" }`],
];
function Messages() {
  const s = useTicker(MSGS.length, 1800, 6);
  return (
    <div className="ms">
      <div className="ms-tabs">{MSGS.map(([n, w], i) => <span key={n} className={`ms-tab${i === s ? " on" : ""}`}><b>{n}</b><span className="count">{w}</span></span>)}</div>
      <pre className="ms-code mono" key={s}>{MSGS[s][2]}</pre>
    </div>
  );
}

/* 7: the two transports */
function Transports() {
  const s = useTicker(4, 1200, 7);
  return (
    <div className="tp">
      <div className={`tp-lane${s < 2 ? " on" : ""}`}>
        <div className="tp-head"><b>stdio</b><span className="count">a server on your own machine</span></div>
        <div className="tp-track"><span className="tp-end">App starts the program</span><span className="tp-rod"><i className={`tp-bead${s === 0 ? " go" : s === 1 ? " back" : ""}`} /></span><span className="tp-end">Server reads stdin, writes stdout</span></div>
      </div>
      <div className={`tp-lane${s >= 2 ? " on" : ""}`}>
        <div className="tp-head"><b>Streamable HTTP</b><span className="count">a server anywhere on the web</span></div>
        <div className="tp-track"><span className="tp-end">App sends POST /mcp</span><span className="tp-rod"><i className={`tp-bead${s === 2 ? " go" : s === 3 ? " back" : ""}`} /></span><span className="tp-end">Server replies, or streams the reply</span></div>
        <code className="mono tp-note">Mcp-Session-Id: keeps a conversation together across requests</code>
      </div>
    </div>
  );
}

/* 8: OAuth for remote servers, step by step */
const AUTH: [string, string][] = [
  ["The app calls the server", "No token yet, so the server answers 401 and says where its sign-in details live."],
  ["The app finds the sign-in service", "It reads the server's protected-resource metadata, which names the authorization server."],
  ["You sign in and agree", "In your browser, with your own account. The app never sees your password."],
  ["The app receives a token", "Short-lived, and meant for this one server only."],
  ["Every call carries the token", "Authorization: Bearer <token>, until it expires and the app quietly refreshes it."],
];
function Auth() {
  const s = useTicker(AUTH.length, 1300, 8);
  return (
    <div className="au">
      {AUTH.map(([t, d], i) => (
        <div key={t} className={`au-row${i <= s ? " on" : ""}${i === s ? " cur" : ""}`}>
          <span className="au-n">{i + 1}</span>
          <div><b>{t}</b><span className="muted">{d}</span></div>
        </div>
      ))}
    </div>
  );
}

/* 9: a person in the loop */
const RULES = ["Ask before anything that changes or deletes", "Give each server the least access it needs", "Treat tool descriptions and results as untrusted text", "Install servers only from sources you trust", "Read annotations as hints, never as guarantees"];
function Safety() {
  const s = useTicker(RULES.length, 1200, 9);
  return (
    <div className="sf">
      <div className={`sf-ask${s % 2 === 0 ? " pulse" : ""}`}>
        <span className="kicker">The agent wants to run a tool</span>
        <code className="mono">delete_branch(name: "main")</code>
        <span className="muted">from the GitHub server · marked destructive</span>
        <div className="sf-btns"><span className="sf-b deny">Deny</span><span className="sf-b">Allow once</span></div>
      </div>
      <ul className="sf-rules">{RULES.map((r, i) => <li key={r} className={i <= s ? "on" : ""}><i className="bead" />{r}</li>)}</ul>
    </div>
  );
}

/* 10: a first server */
const CODE = [
  "from mcp.server.fastmcp import FastMCP",
  "",
  "mcp = FastMCP(\"notes\")",
  "notes: list[str] = []",
  "",
  "@mcp.tool()",
  "def add_note(text: str) -> str:",
  "    \"\"\"Save a note; return its number.\"\"\"",
  "    notes.append(text)",
  "    return f\"Saved note {len(notes)}\"",
  "",
  "mcp.run()  # stdio by default",
];
function Build() {
  const s = useTicker(CODE.length + 2, 420, 10);
  return (
    <div className="bd">
      <pre className="bd-code mono">{CODE.map((l, i) => <span key={i} className={i <= s ? "on" : ""}>{l || " "}{"\n"}</span>)}</pre>
      <div className="bd-side">
        <div className={`bd-step${s >= CODE.length ? " on" : ""}`}><span className="kicker">Test it</span><code className="mono">npx @modelcontextprotocol/inspector</code></div>
        <div className={`bd-step${s >= CODE.length + 1 ? " on" : ""}`}><span className="kicker">Plug it into your app</span><pre className="mono">{`{ "mcpServers": {\n    "notes": { "command": "python",\n               "args": ["server.py"] } } }`}</pre></div>
      </div>
    </div>
  );
}

const PAGES: DocPage[] = [
  { title: MCP_LESSONS[0].title, caption: "MCP is one open standard that lets any AI app use any tool or data source.", analogy: "Like USB-C: one plug instead of a drawer full of cables.", hint: "If a tool already has an MCP server, every MCP app can use it. No glue code.",
    more: ["MCP, the Model Context Protocol, is an open standard for connecting AI applications to tools and data: your files, your code host, your database, your calendar.",
      "Without it, every app needs a custom connector for every tool, so three apps and four tools mean twelve pieces of glue to build and keep working. With it, each app speaks MCP once and each tool speaks MCP once.",
      "Anthropic introduced it in November 2024 and published it openly, with a specification and official SDKs, so any app or tool maker can use it."], anim: <Tangle /> },
  { title: MCP_LESSONS[1].title, caption: "Your app is the host. Inside it, one client per server. Each server does one job.", analogy: "A laptop, its ports, and the devices you plug in.", hint: "Something broke? Ask which of the three: the host, the client or the server.",
    more: ["The host is the AI application you work in, such as Claude Desktop, an IDE or your own agent. It decides what the model sees and asks you for permission.",
      "Inside the host, a client keeps one connection to one server. Three servers means three clients, each in its own lane, so one server cannot read another's traffic.",
      "A server is a program that offers capabilities: it can be a small script on your laptop or a service run by a company."], anim: <Roles /> },
  { title: MCP_LESSONS[2].title, caption: "A server offers tools to act, resources to read and prompts to pick.", analogy: "Tools on the wall, books on the shelf, order forms at the desk.", hint: "Write tool descriptions for the model: when to use it and what each input means.",
    more: ["Tools are actions, each with a name, a description and a JSON Schema for its inputs. The model chooses when to call one, and the host can ask you first.",
      "Resources are context the app can read, each with an address such as file:///notes/today.md. The app decides which ones to attach.",
      "Prompts are templates you choose, often shown as slash commands, that fill in a well-made request for a common job."], anim: <Primitives /> },
  { title: MCP_LESSONS[3].title, caption: "Requests can flow back too: borrow the model, set the bounds, ask you a question.", analogy: "A contractor borrows your ladder, asks which rooms, checks the colour with you.", hint: "Rely on these only when the app declared them in the handshake.",
    more: ["Sampling lets a server ask the host's model to write something, so the server needs no model or API key of its own. The host stays in control and can show you the request first.",
      "Roots let the host tell a server which folders or addresses it may work within, so a files server does not wander through your whole disk.",
      "Elicitation, added in the 2025-06-18 version of the specification, lets a server ask you a short structured question in the middle of a task, through the host's own interface."], anim: <BackChannel /> },
  { title: MCP_LESSONS[4].title, caption: "Before any work, both sides agree a version and say what they can do.", analogy: "Agree the language first, then start the project.", hint: "Declare only the capabilities you really implement.",
    more: ["The client opens with initialize: the protocol version it speaks, the features it supports and its name. The server answers with the version it will use and its own features.",
      "The client confirms with an initialized notification, and normal work begins: listing tools, reading resources, calling tools.",
      "Versions are dates, such as 2025-06-18. If the two sides cannot agree on a version, they should stop rather than guess."], anim: <Handshake /> },
  { title: MCP_LESSONS[5].title, caption: "Every message is a small JSON note: a request, its reply, or a heads-up.", analogy: "Numbered order slips, matching receipts, a note on the door.", hint: "A failing tool still answers, error marked, so the model can try another way.",
    more: ["MCP messages use JSON-RPC 2.0, a small and widely used format for remote calls.",
      "A request has an id and a method, such as tools/call. Its response carries the same id with either a result or an error.",
      "A notification has a method and no id, and gets no reply. Servers use one to say, for example, that their list of tools has changed."], anim: <Messages /> },
  { title: MCP_LESSONS[6].title, caption: "Local servers talk over stdin and stdout; remote ones over one HTTP address.", analogy: "A colleague at the next desk, or one in another office.", hint: "On stdio, log to stderr. Anything else on stdout breaks the conversation.",
    more: ["With stdio, the host starts the server as a program on your machine and they exchange messages over its standard input and output. It is simple, fast and needs no network.",
      "With Streamable HTTP, the server lives at one web address. The client sends each message as an HTTP POST, and the server can answer directly or stream its answer back as it works.",
      "Streamable HTTP replaced the older HTTP plus Server-Sent Events transport in the 2025-03-26 version of the specification."], anim: <Transports /> },
  { title: MCP_LESSONS[7].title, caption: "Remote servers use OAuth: sign in once, and the app carries a token for that one server.", analogy: "A hotel key card: show your ID once, then tap the door.", hint: "Accept only tokens issued for your server, and never pass one on.",
    more: ["Remote servers use OAuth 2.1, the same sign-in standard behind “Sign in with…” buttons. The MCP server acts as a resource server and accepts tokens issued by an authorization server.",
      "The client discovers where to sign in from the server's protected-resource metadata, sends you to sign in and agree, and receives a token meant for that one server.",
      "Local stdio servers do not use this flow. They usually read their credentials, such as an API key, from the environment the host starts them in."], anim: <Auth /> },
  { title: MCP_LESSONS[8].title, caption: "Tools act in the real world, so a person approves what matters.", analogy: "A new assistant gets only the keys they need.", hint: "Start read-only, one folder, a test database. Widen it later.",
    more: ["Tools can send emails, change code and delete data. The specification asks hosts to keep a person in the loop: show what will run and let you approve or deny it.",
      "A tool's description and its results are text the model reads, so a malicious or compromised server can hide instructions in them. Treat everything a server sends as untrusted.",
      "Servers can mark tools with annotations such as read-only or destructive. They help the host decide what to ask, but they come from the server, so they are hints, not promises."], anim: <Safety /> },
  { title: MCP_LESSONS[9].title, caption: "Ten lines of Python, a test in the Inspector, one entry in your app's settings.", analogy: "Set up the stall, label what you sell, try it with a friend first.", hint: "Start with one read-only tool, then add the ones that change things.",
    more: ["Official SDKs exist for many languages, including Python and TypeScript. In Python, FastMCP turns a normal function into a tool: the type hints become the input schema and the docstring becomes the description.",
      "The MCP Inspector, a free tool you run with npx, connects to your server and lets you list and call its tools by hand before any model touches them.",
      "To use it in an app, add the server to the app's MCP settings: a name, the command that starts it, and its arguments. Restart the app and its tools appear."], anim: <Build /> },
];

export function McpCourse({ end }: { end?: React.ReactNode }) {
  return (
    <>
      <DocShell pages={PAGES} label="MCP" end={end} />
      <style>{animCss}</style>
    </>
  );
}

const animCss = `
        .bead-r { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }

        .tg svg { width: 100%; height: auto; display: block; }
        .tg-x { stroke: var(--muted); stroke-width: 1.4; opacity: .55; transition: opacity .6s ease; } .tg-x.off { opacity: 0; }
        .tg-h { stroke: var(--rust); stroke-width: 2.4; stroke-dasharray: 220; stroke-dashoffset: 220; opacity: 0; transition: stroke-dashoffset .9s var(--ease), opacity .3s; } .tg-h.on { stroke-dashoffset: 0; opacity: 1; }
        .tg-hub circle { fill: #e0301e; transform-box: fill-box; transform-origin: center; transform: scale(0); transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
        .tg-hub text { fill: #fff; font: 700 13px var(--font-mono), monospace; opacity: 0; transition: opacity .4s .3s; }
        .tg-hub.on circle { transform: scale(1); } .tg-hub.on text { opacity: 1; }
        .tg-box { fill: var(--card); stroke: var(--line-strong); } .tg-t { fill: var(--ink); font: 600 12.5px var(--font-sans), sans-serif; }
        .tg-count { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; font-size: .92rem; }
        .tg-count span { opacity: .35; transition: opacity .4s; } .tg-count span.on { opacity: 1; } .tg-count b { font-size: 1.4rem; color: var(--rust); margin-right: 4px; }

        .rl { display: grid; grid-template-columns: minmax(0, 1.1fr) 80px minmax(0, 1fr); gap: 0; align-items: center; }
        .rl-host { padding: 18px; border-radius: 14px; background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px; }
        .rl-clients { display: grid; gap: 8px; margin-top: 8px; }
        .rl-client { font: .76rem var(--font-mono), monospace; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--line-strong); transition: all .35s; }
        .rl-client.on { border-color: var(--rust); color: var(--rust-deep); background: var(--paper); }
        .rl-wires { display: grid; gap: 8px; align-self: end; padding-bottom: 6px; }
        .rl-wire { position: relative; height: 26px; } .rl-wire::before { content: ""; position: absolute; left: 0; right: 0; top: 11px; height: 4px; border-radius: 2px; background: var(--rod); }
        .rl-wire i { position: absolute; top: 5px; left: 0; width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); opacity: 0; }
        .rl-wire.on i { opacity: 1; animation: rl-go 1.3s var(--ease) infinite alternate; }
        @keyframes rl-go { from { left: 0; } to { left: calc(100% - 16px); } }
        .rl-servers { display: grid; gap: 8px; }
        .rl-server { display: flex; flex-direction: column; padding: 10px 14px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); font-size: .88rem; opacity: .45; transition: all .35s var(--ease); }
        .rl-server.on { opacity: 1; border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; }
        @media (max-width: 640px) { .rl { grid-template-columns: 1fr; gap: 12px; } .rl-wires { display: none; } }

        .pm { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; } @media (max-width: 700px) { .pm { grid-template-columns: 1fr; } }
        .pm-card { display: flex; flex-direction: column; gap: 6px; padding: 16px; border-radius: 14px; background: var(--card); border: 1px solid var(--line); opacity: .4; transform: translateY(6px); transition: all .5s var(--spring); }
        .pm-card.on { opacity: 1; transform: none; border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; }
        .pm-card b { font-size: 1.15rem; } .pm-card .muted { font-size: .88rem; }
        .pm-who { align-self: flex-start; font: .64rem var(--font-mono), monospace; letter-spacing: .08em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; border: 1px dashed var(--rust); color: var(--rust-deep); }
        .pm-card code { font-size: .74rem; color: var(--rust-deep); margin-top: auto; }

        .bc-row { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; }
        .bc-node { font-weight: 700; padding: 8px 14px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); }
        .bc-lane { position: relative; height: 18px; } .bc-lane::before { content: ""; position: absolute; left: 0; right: 0; top: 7px; height: 4px; border-radius: 2px; background: var(--rod); }
        .bc-bead { position: absolute; top: 0; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); transition: left 1.2s var(--ease); }
        .bc-bead.s0 { left: 0; } .bc-bead.s1 { left: calc(100% - 18px); } .bc-bead.s2 { left: 0; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .bc-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 16px; } @media (max-width: 700px) { .bc-cards { grid-template-columns: 1fr; } }
        .bc-card { display: flex; flex-direction: column; gap: 4px; padding: 14px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); font-size: .88rem; opacity: .35; transition: all .45s var(--ease); }
        .bc-card.on { opacity: 1; border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; } .bc-card b { font-size: 1.05rem; }

        .hs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; align-items: start; } @media (max-width: 760px) { .hs { grid-template-columns: 1fr; } }
        .hs-heads { display: flex; justify-content: space-between; font-size: .9rem; padding: 0 2px 8px; border-bottom: 1px solid var(--line); }
        .hs-msg { position: relative; display: grid; gap: 2px; padding: 10px 0; opacity: .15; transition: opacity .4s; } .hs-msg.on { opacity: 1; }
        .hs-arrow { position: relative; display: block; height: 10px; } .hs-arrow::before { content: ""; position: absolute; left: 0; right: 0; top: 4px; height: 2px; background: var(--line-strong); }
        .hs-arrow i { position: absolute; top: -1px; width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); opacity: 0; }
        .hs-msg.cur.r .hs-arrow i { opacity: 1; animation: hs-r 1s var(--ease) forwards; } .hs-msg.cur.l .hs-arrow i { opacity: 1; animation: hs-l 1s var(--ease) forwards; }
        @keyframes hs-r { from { left: 0; } to { left: calc(100% - 12px); } } @keyframes hs-l { from { left: calc(100% - 12px); } to { left: 0; } }
        .hs-msg.l { text-align: right; } .hs-m { font-size: .8rem; color: var(--rust-deep); } .hs-say { font-size: .86rem; color: var(--sec); }
        .hs-code, .ms-code, .bd-code { margin: 0; padding: 16px; border-radius: 12px; background: #1c1c1e; color: #e9e6e1; font-size: .78rem; line-height: 1.55; overflow-x: auto; white-space: pre; animation: rise .45s var(--ease) both; }

        .ms-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .ms-tab { display: flex; flex-direction: column; padding: 8px 14px; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--card); opacity: .45; transition: all .35s; }
        .ms-tab.on { opacity: 1; border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; } .ms-tab .count { font-size: .68rem; }

        .tp { display: grid; gap: 14px; }
        .tp-lane { padding: 14px 16px; border-radius: 14px; background: var(--card); border: 1px solid var(--line); opacity: .45; transition: all .4s var(--ease); }
        .tp-lane.on { opacity: 1; border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; }
        .tp-head { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; }
        .tp-track { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr); gap: 12px; align-items: center; margin-top: 12px; font-size: .84rem; }
        .tp-end { color: var(--sec); } .tp-end:last-child { text-align: right; }
        .tp-rod { position: relative; height: 18px; } .tp-rod::before { content: ""; position: absolute; left: 0; right: 0; top: 7px; height: 4px; border-radius: 2px; background: var(--rod); }
        .tp-bead { position: absolute; top: 0; left: 0; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); transition: left 1s var(--ease); }
        .tp-bead.go { left: calc(100% - 18px); } .tp-bead.back { left: 0; }
        .tp-note { display: block; margin-top: 10px; font-size: .72rem; color: var(--rust-deep); }
        @media (max-width: 640px) { .tp-track { grid-template-columns: 1fr; } .tp-end:last-child { text-align: left; } }

        .au { display: grid; gap: 8px; }
        .au-row { display: grid; grid-template-columns: 30px 1fr; gap: 12px; align-items: start; padding: 10px 12px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); opacity: .3; transition: all .4s var(--ease); }
        .au-row div { display: flex; flex-direction: column; gap: 2px; font-size: .9rem; }
        .au-row.on { opacity: 1; } .au-row.cur { border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; }
        .au-n { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: .8rem; color: #fff; background: var(--line-strong); transition: background .4s; }
        .au-row.on .au-n { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }

        .sf { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; align-items: center; } @media (max-width: 760px) { .sf { grid-template-columns: 1fr; } }
        .sf-ask { display: flex; flex-direction: column; gap: 8px; padding: 18px; border-radius: 14px; background: var(--card); border: 1.5px solid var(--rust); }
        .sf-ask.pulse { outline: 8px solid var(--mark); outline-offset: 0; } .sf-ask code { font-size: .86rem; color: var(--rust-deep); } .sf-ask .muted { font-size: .82rem; }
        .sf-btns { display: flex; gap: 8px; margin-top: 6px; }
        .sf-b { padding: 6px 14px; border-radius: 999px; border: 1px solid var(--line-strong); font-size: .84rem; } .sf-b.deny { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .sf-rules { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .sf-rules li { display: flex; gap: 10px; align-items: center; font-size: .9rem; opacity: .3; transform: translateX(-6px); transition: all .4s var(--ease); }
        .sf-rules li.on { opacity: 1; transform: none; } .sf-rules .bead { width: 12px; height: 12px; }

        .bd { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; align-items: start; } @media (max-width: 760px) { .bd { grid-template-columns: 1fr; } }
        .bd-code { animation: none; } .bd-code span { opacity: .12; transition: opacity .3s; } .bd-code span.on { opacity: 1; }
        .bd-side { display: grid; gap: 10px; }
        .bd-step { padding: 12px 14px; border-radius: 12px; background: var(--card); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px; opacity: .3; transition: all .4s var(--ease); }
        .bd-step.on { opacity: 1; border-color: var(--rust); outline: 4px solid var(--mark); outline-offset: 0; }
        .bd-step code, .bd-step pre { margin: 0; font-size: .76rem; color: var(--rust-deep); white-space: pre; overflow-x: auto; }
        @media (prefers-reduced-motion: reduce) { .rl-wire.on i, .hs-msg.cur .hs-arrow i { animation: none; } }
`;
