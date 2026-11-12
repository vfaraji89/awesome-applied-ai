"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mark } from "./mark";
import { site } from "@/lib/site";
import { structure } from "@/lib/structure";

gsap.registerPlugin(useGSAP);

/* The footer is the logo, drawn large. The box is the harness, the red bead inside is the model,
   and each of the six sections is a tool it can call. Every few seconds the model calls the next
   one: the bead lines up with it, a call runs out along the wire, the section lights up and
   answers. Point at a section to call it yourself. */
const LI = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>;
const X = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>;

export function SiteFooter() {
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
      .to(".fh-model", { y, duration: .45, ease: "back.out(1.6)" })
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
          <span className="kicker">The whole site, as an agent would see it</span>
          <h2 className="fh-title">One harness, six tools<span className="dot">.</span></h2>
          <p className="muted">The box is the harness, the red bead is the model, and every section is a tool it can call. Point at one to call it.</p>
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
                  <b>{s.label}</b>
                  <span className="fh-line">{s.line}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="wrap ft-inner">
        <Link href="/" className="ft-brand" aria-label="Applied AI, home">
          <Mark size={30} spin />
          <span className="ft-name">Applied AI<b>.</b></span>
          <span className="ft-role">awesome-applied-ai</span>
        </Link>
        <nav className="ft-nav" aria-label="Footer">
          {structure.flatMap((s) => s.pages.filter((p) => !p.soon && !p.href.includes("#"))).filter((p, i, a) => a.findIndex((q) => q.href === p.href) === i).map((p) => <Link key={p.href} href={p.href}>{p.label}</Link>)}
        </nav>
        <div className="ft-social">
          <a href={site.author.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">{LI}</a>
          <a href="https://x.com/vfaraji89" target="_blank" rel="noopener" aria-label="X">{X}</a>
        </div>
      </div>
      <div className="wrap ft-meta">
        <span>© {new Date().getFullYear()} <a href={site.author.site}>Vahid Faraji</a> · Istanbul, Türkiye · The companion to <i>{site.author.book}</i>, a book in progress · All rights reserved</span>
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top ↑</a>
      </div>
      <div className="ft-word" aria-hidden="true">applied ai<span>.</span></div>

      <style>{`
        .ft { border-top: 1px solid var(--line); background: var(--paper); color: var(--sec); margin-top: 40px; overflow: hidden; }
        .ft a { text-decoration: none; color: inherit; }
        .fh { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 48px; padding-top: 72px; padding-bottom: 56px; align-items: center; }
        @media (max-width: 900px) { .fh { grid-template-columns: 1fr; gap: 28px; } }
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
        .fh-tool { display: grid; grid-template-columns: 34px auto 1fr; gap: 12px; align-items: baseline; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); transition: border-color .3s, box-shadow .3s, background .3s; }
        .fh-row.on .fh-tool { border-color: var(--rust); box-shadow: 0 0 0 4px var(--mark); }
        .fh-n { font-size: .7rem; color: var(--muted); letter-spacing: .1em; } .fh-row.on .fh-n { color: var(--rust); }
        .fh-tool b { color: var(--ink); font-size: 1rem; white-space: nowrap; }
        .fh-line { font-size: .84rem; color: var(--sec); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media (max-width: 640px) { .fh-diagram { grid-template-columns: 56px 1fr; } .fh-label { display: none; } .fh-model { width: 30px; height: 30px; left: calc(50% - 15px); top: -15px; } .fh-row { grid-template-columns: 22px 1fr; } .fh-tool { grid-template-columns: 26px 1fr; } .fh-line { display: none; } }
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
