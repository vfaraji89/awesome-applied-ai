"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mark } from "./mark";
import { site } from "@/lib/site";
import { courses } from "@/data/courses";
import { terms } from "@/data/dictionary";
import { problems } from "@/data/problems";
import { fRoles, skills } from "@/data/framework";

gsap.registerPlugin(useGSAP);

/* The footer, after vfaraji89.github.io: one abacus rod through every part of the site,
   a red bead resting on the newest station that slides to whichever one you point at,
   then the brand row and the big wooden wordmark. */
const STOPS = [
  { href: "/learn/", verb: "Learn", sub: "Free animated courses", n: `${courses.length} courses` },
  { href: "/jargon/", verb: "Speak", sub: "The words, in plain language", n: `${terms.length} terms` },
  { href: "/architecture/", verb: "Design", sub: "Layers of an AI system", n: "6 layers" },
  { href: "/tools/", verb: "Build", sub: "The daily stack and the map", n: "30 + 133 tools" },
  { href: "/roles/", verb: "Grow", sub: "Roles, skills and levels", n: `${fRoles.length} roles · ${skills.length} skills` },
  { href: "/problems/", verb: "Solve", sub: "Common problems, answered", n: `${problems.length} problems` },
  { href: "/market/", verb: "Track", sub: "What the market asks for", n: "Updated daily" },
];

const GH = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>;
const LI = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>;
const X = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>;

export function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState(STOPS.length - 1);
  const { contextSafe } = useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".jr-stop", { y: 18, autoAlpha: 0, stagger: .06, duration: .6, ease: "power3.out" });
      gsap.from(".wm-bead", { x: () => gsap.utils.random(120, 360), duration: 1.1, ease: "back.out(1.6)", stagger: .07, delay: .2 });
    });
    return () => mm.revert();
  }, { scope: root });
  const move = contextSafe((i: number) => {
    setOn(i);
    const stop = root.current?.querySelectorAll<HTMLElement>(".jr-stop")[i];
    const track = root.current?.querySelector<HTMLElement>(".jr-track");
    if (!stop || !track) return;
    const x = stop.getBoundingClientRect().left - track.getBoundingClientRect().left + 20;
    gsap.to(".jr-bead", { x, duration: .7, ease: "back.out(1.7)" });
  });
  const slide = contextSafe((e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, { x: `+=${e.currentTarget.dataset.dir === "l" ? -60 : 60}`, duration: .6, ease: "back.out(2)", onComplete() { this.targets()[0].dataset.dir = this.targets()[0].dataset.dir === "l" ? "r" : "l"; } });
  });

  return (
    <footer className="ft" ref={root}>
      <div className="wrap ft-journey">
        <span className="kicker">Through the site</span>
        <h2 className="ft-title">From the first question to agents in production<span className="dot">.</span></h2>
        <div className="jr-track" onMouseLeave={() => move(STOPS.length - 1)}>
          <span className="jr-rail" aria-hidden="true" />
          <span className="jr-bead" aria-hidden="true" ref={(el) => { if (el && !el.dataset.set) { el.dataset.set = "1"; requestAnimationFrame(() => move(STOPS.length - 1)); } }} />
          <ol className="jr-stops">
            {STOPS.map((s, i) => (
              <li key={s.href} className={`jr-stop${i === on ? " is-on" : ""}`} onMouseEnter={() => move(i)} onFocus={() => move(i)}>
                <Link href={s.href}>
                  <span className="jr-num mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="jr-verb">{s.verb}</span>
                  <span className="jr-sub">{s.sub}</span>
                  <span className="jr-n">{s.n}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="wrap ft-inner">
        <div className="ft-top">
          <Link href="/" className="ft-brand" aria-label="Applied AI, home">
            <Mark size={30} />
            <span className="ft-name">Applied AI<b>.</b></span>
            <span className="ft-role">awesome-applied-ai</span>
          </Link>
          <div className="ft-social">
            <a href={site.repo} target="_blank" rel="noopener" aria-label="GitHub">{GH}</a>
            <a href={site.author.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">{LI}</a>
            <a href="https://x.com/vfaraji89" target="_blank" rel="noopener" aria-label="X">{X}</a>
          </div>
        </div>
        <div className="ft-meta">
          <span>Curated by <a href={site.author.site}>Vahid Faraji</a></span>
          <span className="sep">·</span><span>Free and open source</span>
          <span className="sep">·</span><span>Istanbul, Türkiye</span>
          <span className="ft-end">
            <a href={site.repo} target="_blank" rel="noopener">Contribute on GitHub</a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top ↑</a>
          </span>
        </div>
      </div>

      <div className="wm" aria-hidden="true">
        <div className="wm-frame">
          <span className="wm-post l" /><span className="wm-post r" />
          <div className="wm-word">applied ai<span className="wm-dot" /></div>
          <div className="wm-rod">
            {[4.5, 12, 19.5].map((x) => <span key={x} className="wm-bead red" style={{ left: `${x}%` }} onMouseEnter={slide} />)}
          </div>
          <div className="wm-rod">
            {[4.5, 12].map((x) => <span key={x} className="wm-bead ink" style={{ left: `${x}%` }} onMouseEnter={slide} />)}
            <span className="wm-bead white" style={{ left: "88%" }} onMouseEnter={slide} data-dir="l" />
          </div>
        </div>
      </div>

      <style>{`
        .ft { border-top: 1px solid var(--line); background: linear-gradient(var(--paper), var(--bg) 60%); color: var(--sec); margin-top: 40px; }
        .ft a { text-decoration: none; color: inherit; }
        .ft-journey { padding-top: 64px; padding-bottom: 44px; border-bottom: 1px solid var(--line); }
        .ft-title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; letter-spacing: -.03em; line-height: 1.1; color: var(--ink); margin: 6px 0 40px; }
        .jr-track { position: relative; }
        .jr-rail { position: absolute; left: 0; right: 0; top: 22px; height: 4px; border-radius: 4px; background: var(--rod); }
        .jr-bead { position: absolute; top: 14px; left: 0; width: 20px; height: 20px; border-radius: 50%; z-index: 1; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); box-shadow: 0 0 0 4px var(--paper), 0 6px 10px -4px rgba(224,48,30,.5); }
        .jr-stops { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(${STOPS.length}, minmax(0, 1fr)); gap: 14px; position: relative; }
        .jr-stop a { display: flex; flex-direction: column; gap: 3px; padding-top: 56px; outline: none; }
        .jr-num { font-size: .7rem; color: var(--muted); letter-spacing: .1em; }
        .jr-verb { font-size: 1rem; font-weight: 700; color: var(--ink); letter-spacing: -.01em; transition: color .3s; }
        .jr-sub { font-size: .8rem; line-height: 1.4; }
        .jr-n { font-family: var(--font-mono), monospace; font-size: .7rem; color: var(--muted); margin-top: 4px; }
        .jr-stop.is-on .jr-verb { color: var(--rust-deep); } .jr-stop.is-on .jr-num { color: var(--rust); }
        .jr-stop a:focus-visible .jr-verb { outline: 2px solid var(--rust); outline-offset: 3px; }
        @media (max-width: 860px) {
          .jr-stops { grid-template-columns: 1fr 1fr; row-gap: 18px; } .jr-rail, .jr-bead { display: none; } .jr-stop a { padding-top: 0; }
        }
        .ft-inner { padding-top: 28px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 18px; font-size: .9rem; }
        .ft-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .ft-brand { display: flex; align-items: center; gap: 10px; color: var(--ink) !important; }
        .ft-name { font-weight: 800; font-size: 1.15rem; letter-spacing: -.03em; } .ft-name b { color: var(--rust); }
        .ft-role { font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
        .ft-social { display: flex; gap: 8px; }
        .ft-social a { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; border: 1px solid var(--line); color: var(--sec); transition: all .3s var(--ease); }
        .ft-social a:hover { color: var(--rust-deep); border-color: var(--rust); transform: translateY(-2px); }
        .ft-meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: .82rem; color: var(--muted); }
        .ft-meta a:hover, .ft-end a:hover { color: var(--rust-deep); }
        .ft-end { margin-left: auto; display: flex; gap: 16px; }
        .wm { position: relative; overflow: hidden; user-select: none; border-top: 1px solid rgba(224,48,30,.1); background: linear-gradient(180deg, var(--bg), var(--paper)); padding: 3.5vw 3vw 3vw; }
        .wm-frame { position: relative; padding: 1vw 7vw 2.2vw; }
        .wm-post { position: absolute; top: 0; bottom: 0; width: clamp(10px, 1.4vw, 22px); border-radius: 999px; background: var(--dowel); box-shadow: 0 18px 26px -18px rgba(60,40,20,.55); z-index: 2; }
        .wm-post.l { left: 2.5vw; } .wm-post.r { right: 2.5vw; }
        .wm-word { font-size: clamp(3.4rem, 15vw, 15rem); font-weight: 800; letter-spacing: -.06em; line-height: .9; color: var(--ink); display: flex; align-items: flex-end; }
        .wm-dot { display: inline-block; width: .16em; height: .16em; border-radius: 50%; margin: 0 0 .12em .04em; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .wm-rod { position: relative; height: clamp(22px, 3.4vw, 48px); margin-top: 1vw; }
        .wm-rod::before { content: ""; position: absolute; left: -5vw; right: -5vw; top: 50%; height: clamp(4px, .5vw, 8px); transform: translateY(-50%); border-radius: 9px; background: var(--rod); }
        .wm-bead { position: absolute; top: 0; width: clamp(22px, 3.4vw, 48px); height: clamp(22px, 3.4vw, 48px); border-radius: 50%; cursor: grab; box-shadow: inset -4px -5px 9px -4px rgba(0,0,0,.18), 0 10px 14px -10px rgba(40,20,10,.5); }
        .wm-bead.red { background: radial-gradient(circle at 34% 28%, #ff8f80, #e0301e 42%, #9e1a0c); }
        .wm-bead.ink { background: radial-gradient(circle at 34% 28%, #6a6a70, #1c1c1e 45%, #000); }
        .wm-bead.white { background: radial-gradient(circle at 34% 28%, #fff, #f4f1ee 40%, #d9d3cd); }
      `}</style>
    </footer>
  );
}
