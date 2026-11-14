"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { T, TH } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { Mark } from "./mark";
import { StatBroadcast, type Stat } from "./stat-broadcast";
import { site } from "@/lib/site";
import { structure, type SubPage } from "@/lib/structure";

/* The footer, in three parts: who makes the site (a short bio and the numbers behind it, played
   like the home page's broadcast tiles), the whole site in five groups of links, and one quiet
   bar for the brand and the legal lines. On a phone the groups fold into rows you tap open.
   Every number below is one the portfolio already states; nothing here is estimated. */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const GROUPS: { id: string; en: string; sections: string[] }[] = [
  { id: "g_market", en: "Market and roles", sections: ["market", "roles"] },
  { id: "g_people", en: "People and events", sections: ["people", "events"] },
  { id: "g_build", en: "Architect and tools", sections: ["architect", "tools"] },
  { id: "g_learn", en: "Learn", sections: ["docs"] },
];

function pagesOf(ids: string[]): SubPage[] {
  const seen = new Set<string>();
  return structure.filter((s) => ids.includes(s.id)).flatMap((s) => s.pages)
    .filter((p) => !p.soon && !p.href.includes("#") && !seen.has(p.href) && !!seen.add(p.href));
}

const LI = <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>;
const X = <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>;
const GH = <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>;

export function SiteFooter() {
  const groups = useRef<HTMLDivElement>(null);
  // the groups are open in the page (so every link is there without script); a phone folds them
  useEffect(() => {
    const fold = () => {
      const narrow = matchMedia("(max-width: 720px)").matches;
      groups.current?.querySelectorAll("details").forEach((d) => { d.open = !narrow; });
    };
    fold();
    const mq = matchMedia("(max-width: 720px)");
    mq.addEventListener("change", fold);
    return () => mq.removeEventListener("change", fold);
  }, []);

  // on a wide screen the groups stay open: their titles are labels, not switches
  const keepOpen = (e: React.MouseEvent) => { if (!matchMedia("(max-width: 720px)").matches) e.preventDefault(); };

  const stats: Stat[] = [
    { n: "8+4", label: <T k="ab.s_years">years, industry + research</T>, note: "8 years in industry, 4 in research", href: site.author.site, hot: true },
    { n: "95%", label: <T k="ab.s_acc">agent accuracy</T>, note: "An MCP multi-agent system over 14K+ positions", href: `${site.author.site}#work` },
    { n: "60%", label: <T k="ab.s_work">less manual work</T>, note: "Kariyer.net, for 200+ colleagues", href: `${site.author.site}#work` },
    { n: "3+1", label: <T k="ab.s_pubs">papers + patent</T>, note: "ACM and arXiv papers; one patent pending", href: `${site.author.site}#research` },
  ];
  const sitePages: { href: string; k: string; en: string; ext?: boolean }[] = [
    { href: "/contribute/", k: "sec.contribute.label", en: "Feedback" },
    { href: "/privacy.html", k: "ft.privacy", en: "Privacy", ext: true },
    { href: "/terms.html", k: "ft.terms", en: "Terms and disclaimer", ext: true },
  ];

  return (
    <footer className="ft">
      {/* 1 who makes this */}
      <section className="wrap ft-me" id="about" aria-labelledby="ft-me-h">
        <div className="ft-me-head">
          <img className="ft-photo" src={`${BASE}/vahid.jpg`} alt="" width={88} height={88} loading="lazy" />
          <div>
            <span className="kicker"><T k="ab.kicker">About</T></span>
            <h2 id="ft-me-h" className="ft-me-name">Vahid Faraji<span className="dot">.</span></h2>
            <p className="ft-me-role mono"><T k="ab.role">Senior Applied AI Specialist · Istanbul</T></p>
          </div>
        </div>
        <p className="ft-me-bio"><TH k="ab.bio">I build workflows, data pipelines and agents that teams use every day: I write the spec, build the tools the agent calls, and measure whether it actually helps. This site is the companion to <i>Applied AI, Simplified</i>, the book I&apos;m writing.</TH></p>
        <div className="ft-me-stats"><StatBroadcast items={stats} /></div>
        <div className="ft-me-go">
          <a className="btn" href={site.author.site}><T k="ab.portfolio">My portfolio</T> →</a>
          <a className="btn ghost" href={`${site.author.site}fit.html`}><T k="ab.fit">How I fit your role</T></a>
        </div>
      </section>

      {/* 2 the site, grouped */}
      <nav className="wrap ft-groups" ref={groups} aria-label="Footer">
        {GROUPS.map((g) => (
          <details key={g.id} className="ft-g" open>
            <summary onClick={keepOpen}><i aria-hidden="true" /><T k={`ft.${g.id}`}>{g.en}</T></summary>
            <ul>{pagesOf(g.sections).map((p) => <li key={p.href}><Link href={p.href}><T k={`page.${slug(p.label)}`}>{p.label}</T></Link></li>)}</ul>
          </details>
        ))}
        <details className="ft-g" open>
          <summary onClick={keepOpen}><i aria-hidden="true" /><T k="ft.g_site">This site</T></summary>
          <ul>
            {sitePages.map((p) => <li key={p.href}>{p.ext ? <a href={p.href}><T k={p.k}>{p.en}</T></a> : <Link href={p.href}><T k={p.k}>{p.en}</T></Link>}</li>)}
            <li><a href={`${BASE}/llms.txt`}>llms.txt</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); try { localStorage.removeItem("vf-consent"); } catch { /* ignore */ } window.dispatchEvent(new Event("vf:consent-reset")); }}><T k="ft.consent">Analytics choice</T></a></li>
          </ul>
        </details>
      </nav>

      {/* 3 the bar */}
      <div className="wrap ft-bar">
        <Link href="/" className="ft-brand" aria-label="Applied AI, Simplified, home">
          <Mark size={26} spin />
          <span className="ft-name">Applied AI<b>.</b></span>
          <span className="ft-role">Simplified</span>
        </Link>
        <div className="ft-social">
          <a href={site.author.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">{LI}</a>
          <a href="https://x.com/vfaraji89" target="_blank" rel="noopener" aria-label="X">{X}</a>
          <a href={site.author.github} target="_blank" rel="noopener" aria-label="GitHub">{GH}</a>
          <a className="ft-top" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Back to top">↑</a>
        </div>
      </div>
      <div className="wrap ft-legal">
        <p>© {new Date().getFullYear()} Vahid Faraji · <TH k="ft.meta">Istanbul, Türkiye · The companion to <i>{site.author.book}</i>, a book in progress · All rights reserved</TH></p>
        <p><T k="ft.indep">Independent and non-commercial, made to help people understand applied AI. Not affiliated with, sponsored or endorsed by any company named here; no one pays to be listed. Names and logos belong to their owners.</T></p>
      </div>

      <style>{`
        .ft { border-top: 1px solid var(--line); background: var(--paper); color: var(--sec); margin-top: 40px; }
        .ft a { text-decoration: none; color: inherit; }

        .ft-me { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); grid-template-areas: "head stats" "bio stats" "go stats"; gap: 14px 56px; align-items: start; padding-top: 64px; padding-bottom: 56px; scroll-margin-top: 90px; }
        .ft-me-head { grid-area: head; display: flex; align-items: center; gap: 18px; }
        .ft-photo { flex: none; width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 3px solid var(--bg); outline: 1px solid var(--line); outline-offset: 0; }
        .ft-me-name { margin: 8px 0 4px; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; color: var(--ink); }
        .ft-me-role { margin: 0; font-size: .72rem; letter-spacing: .06em; color: var(--muted); }
        .ft-me-bio { grid-area: bio; margin: 0; max-width: 52ch; font-size: 1rem; line-height: 1.6; }
        .ft-me-stats { grid-area: stats; align-self: center; }
        .ft-me-stats .sb { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ft-me-go { grid-area: go; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
        .ft-me-go .btn { color: var(--bg); } .ft-me-go .btn.ghost { color: var(--ink); }

        .ft-groups { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 28px; padding-top: 40px; padding-bottom: 40px; border-top: 1px solid var(--line); }
        .ft-g summary { display: flex; align-items: center; gap: 9px; list-style: none; cursor: default; font-weight: 800; font-size: .92rem; color: var(--ink); letter-spacing: -.01em; }
        .ft-g summary::-webkit-details-marker { display: none; }
        .ft-g summary i { flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--bead-red); }
        .ft-g ul { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 9px; }
        .ft-g a { font-size: .88rem; line-height: 1.35; transition: color .2s; }
        .ft-g a:hover { color: var(--rust-deep); }

        .ft-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding-top: 22px; padding-bottom: 14px; border-top: 1px solid var(--line); }
        .ft-brand { display: flex; align-items: center; gap: 10px; color: var(--ink) !important; }
        .ft-name { font-weight: 800; font-size: 1.1rem; letter-spacing: -.03em; } .ft-name b { color: var(--rust); }
        .ft-role { font-family: var(--font-mono), monospace; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
        .ft-social { display: flex; gap: 8px; }
        .ft-social a { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; color: var(--sec); background: var(--bead-white); outline: 1px solid rgba(28, 28, 30, .08); outline-offset: -1px; transition: color .25s, transform .3s var(--ease); }
        .ft-social a:hover { color: var(--rust-deep); transform: translateY(-2px); }
        .ft-social .ft-top { font-weight: 800; color: var(--ink); }
        .ft-legal { display: grid; gap: 6px; padding-bottom: 28px; font-size: .74rem; line-height: 1.5; color: var(--muted); }
        .ft-legal p { margin: 0; max-width: 90ch; }

        @media (max-width: 960px) {
          .ft-me { grid-template-columns: minmax(0, 1fr); grid-template-areas: "head" "bio" "stats" "go"; gap: 18px; padding-top: 48px; padding-bottom: 40px; }
          .ft-groups { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        /* a phone: the groups fold into rows, each opened with a tap; bigger targets everywhere */
        @media (max-width: 720px) {
          .ft-photo { width: 72px; height: 72px; }
          .ft-me-go { display: grid; grid-template-columns: minmax(0, 1fr); }
          .ft-me-go .btn { justify-content: center; text-align: center; }
          .ft-groups { grid-template-columns: minmax(0, 1fr); gap: 0; padding-top: 8px; padding-bottom: 8px; }
          .ft-g { border-bottom: 1px solid var(--line); }
          .ft-g:last-child { border-bottom: 0; }
          .ft-g summary { cursor: pointer; min-height: 52px; font-size: 1rem; }
          .ft-g summary::after { content: ""; margin-left: auto; width: 8px; height: 8px; border-right: 2px solid var(--muted); border-bottom: 2px solid var(--muted); transform: rotate(45deg) translateY(-3px); transition: transform .3s var(--ease); }
          .ft-g[open] summary::after { transform: rotate(-135deg) translateY(-1px); }
          .ft-g ul { grid-template-columns: 1fr 1fr; gap: 0 16px; margin: 0 0 14px; }
          .ft-g a { display: block; padding: 9px 0; font-size: .92rem; }
          .ft-bar { justify-content: center; flex-direction: column; gap: 14px; padding-top: 24px; }
          .ft-legal { text-align: center; justify-items: center; }
        }
      `}</style>
    </footer>
  );
}
