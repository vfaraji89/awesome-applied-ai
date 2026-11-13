"use client";
import Link from "next/link";
import { T, TH } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mark } from "./mark";
import { site } from "@/lib/site";
import { structure } from "@/lib/structure";
import type { HarnessCounts } from "@/lib/harness-counts";

gsap.registerPlugin(useGSAP);

/* The footer is the logo, drawn large. The box is the harness, the red bead inside is the model,
   and each of the seven sections is a tool it can call. Every few seconds the model calls the next
   one: the bead lines up with it, a call runs out along the wire, the section lights up and the
   readout shows the call: the question that tool answers and what it returns, with live numbers.
   Point at a section to call it yourself. */

/* For each section: the function name the model would call, the question it answers, and what
   comes back. {n} and friends are filled from HarnessCounts. */
const UNITS: Record<string, string> = { market: "open", roles: "roles", architect: "layers", tools: "tools", certificates: "certs", docs: "live" };
const CALLS: Record<string, { fn: string; ask: string; ret: string }> = {
  market: { fn: "market.pulse()", ask: "What are applied AI jobs asking for right now?", ret: "{n} open AI roles by skill, tool and level, from {all} tracked" },
  roles: { fn: "roles.compare()", ask: "Who does the work, and what does each role take?", ret: "{n} roles across {s} skills, with daily tasks and how each one grows" },
  architect: { fn: "architect.design()", ask: "How do you design AI into a real system?", ret: "{n} layers, {p} problems with fixes, and the agent harness" },
  tools: { fn: "tools.search()", ask: "What should I build with?", ret: "{n} tools in eleven areas, filterable by use case; {e} emerging" },
  certificates: { fn: "certs.match()", ask: "Which certificate proves which stack?", ret: "{n} certificates by track and level, plus {c} courses" },
  docs: { fn: "docs.explain()", ask: "How does this actually work?", ret: "Animated docs ({n} live so far) and {j} terms in plain words" },
  contribute: { fn: "feedback.send()", ask: "Is something wrong, missing or out of date?", ret: "A correction that goes into the next update" },
};
const LI = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>;
const X = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>;

export function SiteFooter({ counts }: { counts: HarnessCounts }) {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState(0);
  const hold = useRef(false);
  const { contextSafe } = useGSAP({ scope: root });

  const call = contextSafe((i: number) => {
    setOn(i);
    const el = root.current;
    if (!el) return;
    const box = el.querySelector<HTMLElement>(".fh-box");
    const row = el.querySelectorAll<HTMLElement>(".fh-row")[i];
    if (!box || !row) return;
    const y = row.getBoundingClientRect().top + row.offsetHeight / 2 - box.getBoundingClientRect().top;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(".fh-model", { y }); return; }
    const wire = row.querySelector(".fh-wire");
    const dot = row.querySelector(".fh-call");
    gsap.timeline()
      .to(".fh-model", { y, duration: .45, ease: "expo.out" })
      .fromTo(dot, { left: "0%", autoAlpha: 1 }, { left: "100%", duration: .45, ease: "power2.in" }, ">-.05")
      .to(dot, { left: "0%", duration: .45, ease: "power2.out" })
      .to(dot, { autoAlpha: 0, duration: .15 })
      .fromTo(wire, { "--fill": 0 }, { "--fill": 1, duration: .6, ease: "power2.out" }, 0.45);
  });

  useEffect(() => {
    call(0);
    const t = setInterval(() => { if (!hold.current) setOn((o) => { const n = (o + 1) % structure.length; call(n); return n; }); }, 2600);
    return () => clearInterval(t);
  }, [call]);

  return (
    <footer className="ft" ref={root}>
      <div className="wrap fh">
        <div className="fh-say">
          <span className="kicker"><T k="ft.kicker">How this site is built</T></span>
          <h2 className="fh-title"><T k="ft.title">One harness, seven tools</T><span className="dot">.</span></h2>
          <p className="muted"><T k="ft.text">An AI agent is a model working in a loop inside a harness, calling tools to get what it needs. This site is built the same way: seven sections, each a tool that answers one question. Watch the model call them in turn, or point at one to call it yourself.</T></p>
          {(() => { const s = structure[on]; const c = CALLS[s.id]; return c && (
            <Link href={s.href} className="fh-read" aria-live="polite">
              <span className="fh-read-row"><span className="mono fh-read-k">call</span><code className="fh-fn">{c.fn}</code></span>
              <span className="fh-read-row"><span className="mono fh-read-k"><T k="ft.asks">asks</T></span><span><T k={`ft.${s.id}.ask`}>{c.ask}</T></span></span>
              <span className="fh-read-row"><span className="mono fh-read-k"><T k="ft.returns">returns</T></span><b><T k={`ft.${s.id}.ret`} vars={counts[s.id]}>{c.ret}</T></b></span>
              <span className="fh-read-go"><T k="ft.open">Open</T> <T k={`sec.${s.id}.label`}>{s.label}</T> →</span>
            </Link>
          ); })()}
        </div>
        <div className="fh-diagram" onMouseLeave={() => { hold.current = false; }}>
          <div className="fh-box" aria-hidden="true">
            <span className="fh-label mono">harness</span>
            <span className="fh-model" />
          </div>
          <ol className="fh-rows">
            {structure.map((s, i) => (
              <li key={s.id} className={`fh-row${i === on ? " on" : ""}`} onMouseEnter={() => { hold.current = true; call(i); }} onFocus={() => { hold.current = true; call(i); }}>
                <span className="fh-wire" aria-hidden="true"><span className="fh-call" /></span>
                <Link href={s.href} className="fh-tool">
                  <span className="mono fh-n">{s.n}</span>
                  <b><T k={`sec.${s.id}.label`}>{s.label}</T></b>
                  <span className="fh-line"><T k={`ft.${s.id}.ask`}>{CALLS[s.id]?.ask ?? s.line}</T></span>
                  {counts[s.id]?.n !== undefined && <span className="mono fh-count">{counts[s.id].n.toLocaleString("en")} <T k={`ft.${s.id}.unit`}>{UNITS[s.id] ?? ""}</T></span>}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section className="wrap ft-about" id="about" aria-labelledby="ft-about-h">
        <img className="ft-photo" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/vahid.jpg`} alt="Vahid Faraji" width={112} height={112} loading="lazy" />
        <div>
          <span className="kicker"><T k="ab.kicker">About</T></span>
          <h2 id="ft-about-h" className="ft-about-h"><T k="ab.title">Who makes this site</T><span className="dot">.</span></h2>
          <p className="ft-about-p"><TH k="ab.p1">I&apos;m <b>Vahid Faraji</b>, and I work in applied AI. I build <b>workflows, data pipelines and agents</b> that teams use in their daily work. I write the spec, build the tools the agent can use, and measure whether it actually helps.</TH></p>
          <p className="ft-about-p muted"><TH k="ab.p2">Eight years in industry and four in research. This site is the companion to <i>Applied AI, Simplified</i>, the book I&apos;m writing.</TH></p>
          <div className="ft-about-links">
            <a className="btn" href={site.author.site}><T k="ab.portfolio">My portfolio</T> →</a>
            <a className="btn ghost" href={`${site.author.site}#work`}><T k="ab.work">Case studies</T></a>
            <a className="btn ghost" href={`${site.author.site}fit.html`}><T k="ab.fit">How I fit your role</T></a>
            <a className="btn ghost" href={site.author.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </section>

      <div className="wrap ft-inner">
        <Link href="/" className="ft-brand" aria-label="Applied AI, home">
          <Mark size={30} spin />
          <span className="ft-name">Applied AI<b>.</b></span>
          <span className="ft-role">awesome-applied-ai</span>
        </Link>
        <nav className="ft-nav" aria-label="Footer">
          {structure.flatMap((s) => s.pages.filter((p) => !p.soon && !p.href.includes("#"))).filter((p, i, a) => a.findIndex((q) => q.href === p.href) === i).map((p) => <Link key={p.href} href={p.href}><T k={`page.${slug(p.label)}`}>{p.label}</T></Link>)}
        </nav>
        <div className="ft-social">
          <a href={site.author.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">{LI}</a>
          <a href="https://x.com/vfaraji89" target="_blank" rel="noopener" aria-label="X">{X}</a>
        </div>
      </div>
      <div className="wrap ft-meta">
        <span>© {new Date().getFullYear()} <a href={site.author.site}>Vahid Faraji</a> · <TH k="ft.meta">Istanbul, Türkiye · The companion to <i>{site.author.book}</i>, a book in progress · All rights reserved</TH></span>
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}><T k="ft.top">Back to top</T> ↑</a>
      </div>
      <div className="wrap ft-legal">
        <p><T k="ft.indep">Independent and non-commercial, made to help people understand applied AI. Not affiliated with, sponsored or endorsed by any company named here; no one pays to be listed. Names and logos belong to their owners.</T></p>
        <nav aria-label="Legal">
          <a href="/privacy.html"><T k="ft.privacy">Privacy</T></a>
          <a href="/terms.html"><T k="ft.terms">Terms and disclaimer</T></a>
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/llms.txt`}>llms.txt</a>
          <a href="#" onClick={(e) => { e.preventDefault(); try { localStorage.removeItem("vf-consent"); } catch { /* ignore */ } window.dispatchEvent(new Event("vf:consent-reset")); }}><T k="ft.consent">Analytics choice</T></a>
        </nav>
      </div>
      <div className="ft-word" aria-hidden="true">applied ai<span>.</span></div>

      <style>{`
        .ft { border-top: 1px solid var(--line); background: var(--paper); color: var(--sec); margin-top: 40px; overflow: hidden; }
        .ft a { text-decoration: none; color: inherit; }
        .ft-legal { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; padding-bottom: 18px; font-size: .74rem; color: var(--muted); }
        .ft-legal p { max-width: 62ch; line-height: 1.5; }
        .ft-legal nav { display: flex; gap: 14px; flex-wrap: wrap; } .ft-legal a { text-decoration: underline; text-underline-offset: 2px; } .ft-legal a:hover { color: var(--rust-deep); }
        .fh { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 48px; padding-top: 72px; padding-bottom: 56px; align-items: center; }
        @media (max-width: 900px) { .fh { grid-template-columns: minmax(0, 1fr); gap: 28px; } }
        .fh-title { font-size: clamp(1.8rem, 3.6vw, 2.6rem); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; color: var(--ink); margin: 8px 0 12px; }
        .fh-diagram { display: grid; grid-template-columns: 120px 1fr; }
        .fh-box { position: relative; border: 2px solid var(--ink); border-radius: 22px; background: var(--bg); }
        .fh-label { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; font-size: .66rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
        .fh-model { position: absolute; left: calc(50% - 20px); top: -20px; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); box-shadow: 0 8px 14px -6px rgba(158,26,12,.6); }
        .fh-rows { list-style: none; margin: 0; padding: 10px 0; display: grid; gap: 8px; }
        .fh-row { display: grid; grid-template-columns: 56px 1fr; align-items: center; margin-left: -2px; }
        .fh-wire { position: relative; height: 2px; background: var(--line-strong); --fill: 0; }
        .fh-wire::after { content: ""; position: absolute; inset: 0; background: var(--rust); transform-origin: left; transform: scaleX(var(--fill)); opacity: 0; transition: opacity .3s; }
        .fh-row.on .fh-wire::after { opacity: 1; }
        .fh-call { position: absolute; top: -4px; left: 0; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: #e0301e; opacity: 0; }
        .fh-tool { display: grid; grid-template-columns: 34px auto 1fr auto; gap: 12px; align-items: baseline; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); transition: border-color .3s, box-shadow .3s, background .3s; }
        .fh-row.on .fh-tool { border-color: var(--rust); box-shadow: 0 0 0 4px var(--mark); }
        .fh-n { font-size: .7rem; color: var(--muted); letter-spacing: .1em; } .fh-row.on .fh-n { color: var(--rust); }
        .fh-tool b { color: var(--ink); font-size: 1rem; white-space: nowrap; }
        .fh-line { font-size: .84rem; color: var(--sec); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fh-count { font-size: .78rem; color: var(--muted); } .fh-row.on .fh-count { color: var(--rust-deep); }
        .fh-read { display: grid; gap: 8px; margin-top: 22px; padding: 16px 18px; border-radius: 14px; border: 1px solid var(--line-strong); background: var(--bg); text-decoration: none; color: var(--ink); font-size: .9rem; line-height: 1.45; transition: border-color .3s; }
        .fh-read:hover { border-color: var(--rust); }
        .fh-read-row { display: grid; grid-template-columns: 64px 1fr; gap: 10px; align-items: baseline; }
        .fh-read-k { font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
        .fh-fn { font-family: var(--font-mono), monospace; font-size: .86rem; color: var(--rust-deep); }
        .fh-read-go { justify-self: end; font-weight: 700; font-size: .84rem; color: var(--rust-deep); }
        @media (max-width: 640px) { .fh-diagram { grid-template-columns: 56px 1fr; } .fh-label { display: none; } .fh-model { width: 30px; height: 30px; left: calc(50% - 15px); top: -15px; } .fh-row { grid-template-columns: 22px 1fr; } .fh-tool { grid-template-columns: 26px 1fr auto; } .fh-line { display: none; } }
        .ft-about { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 28px; align-items: start; padding-top: 44px; padding-bottom: 44px; border-top: 1px solid var(--line); scroll-margin-top: 90px; }
        .ft-photo { width: 112px; height: 112px; border-radius: 50%; object-fit: cover; border: 3px solid var(--bg); box-shadow: 0 0 0 1px var(--line), 0 14px 28px -16px rgba(28,28,30,.5); }
        .ft-about-h { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -.04em; line-height: 1.1; color: var(--ink); margin: 8px 0 12px; }
        .ft-about-p { max-width: 62ch; font-size: 1rem; line-height: 1.6; color: var(--sec); } .ft-about-p + .ft-about-p { margin-top: 8px; }
        .ft-about-p b { color: var(--ink); }
        .ft-about-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
        .ft-about-links .btn { color: var(--bg); } .ft-about-links .btn.ghost { color: var(--ink); }
        @media (max-width: 560px) { .ft-about { grid-template-columns: minmax(0, 1fr); gap: 16px; } .ft-photo { width: 84px; height: 84px; } }
        .ft-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; padding-top: 26px; padding-bottom: 18px; border-top: 1px solid var(--line); }
        .ft-brand { display: flex; align-items: center; gap: 10px; color: var(--ink) !important; }
        .ft-name { font-weight: 800; font-size: 1.15rem; letter-spacing: -.03em; } .ft-name b { color: var(--rust); }
        .ft-role { font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
        .ft-nav { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: .88rem; } .ft-nav a:hover { color: var(--rust-deep); }
        .ft-social { display: flex; gap: 8px; }
        .ft-social a { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; border: 1px solid var(--line); color: var(--sec); background: var(--bg); transition: all .3s var(--ease); }
        .ft-social a:hover { color: var(--rust-deep); border-color: var(--rust); transform: translateY(-2px); }
        .ft-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; font-size: .8rem; color: var(--muted); padding-bottom: 10px; }
        .ft-meta a:hover { color: var(--rust-deep); }
        .ft-word { font-size: clamp(4rem, 17vw, 16rem); font-weight: 800; letter-spacing: -.065em; line-height: .78; color: var(--ink); opacity: .07; text-align: center; white-space: nowrap; margin-top: 18px; transform: translateY(14%); user-select: none; }
        .ft-word span { color: var(--rust); opacity: 1; }
      `}</style>
    </footer>
  );
}
