import type { Doc } from "@/data/docs";
import { T } from "@/i18n/lang";
import { stack } from "@/data/stack";

/* A course cover from the brand kit only: paper and dot grid, wooden posts and rods,
   red and white beads, the tool's logo on a white bead, Vahid Sora and Geist Mono.
   The red beads count the pages that are written; on hover they slide along the rod. */
export function DocCover({ course, index }: { course: Doc; index: number }) {
  const logo = stack.flatMap((g) => g.tools).find((t) => t.name === course.logo);
  const total = course.pages.length || 6;
  const ready = course.status === "live" ? course.pages.length : 0;
  return (
    <div className="cv" aria-hidden="true">
      <span className="cv-post l" /><span className="cv-post r" />
      <div className="cv-rod top">
        {Array.from({ length: ready }).map((_, i) => <span key={`r${i}`} className="cv-b red" style={{ ["--k" as string]: i }} />)}
        <span className="cv-gap" />
        {Array.from({ length: Math.max(0, total - ready) }).map((_, i) => <span key={`w${i}`} className="cv-b white" style={{ ["--k" as string]: i }} />)}
      </div>
      <div className="cv-mid">
        <span className="cv-logo" dangerouslySetInnerHTML={{ __html: logo?.svg ?? "" }} />
        <div>
          <span className="cv-k"><T k="dc.doc">Doc</T> {String(index + 1).padStart(2, "0")} · {course.status === "live" ? <T k="dc.pages" vars={{ n: total }}>{"{n} pages"}</T> : <T k="ui.soon">soon</T>}</span>
          <b className="cv-t">{course.name}<span className="dot">.</span></b>
        </div>
      </div>
      <div className="cv-rod bottom"><span className="cv-b ink" /><span className="cv-b white" /><span className="cv-gap" /><span className="cv-b white" /></div>
      <style>{`
        .cv { position: relative; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: var(--paper); display: flex; flex-direction: column; justify-content: space-between; padding: 8% 9%; }
        .cv::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(28,28,30,.08) 1.2px, transparent 1.4px); background-size: 18px 18px; }
        .cv-post { position: absolute; top: 7%; bottom: 7%; width: 12px; border-radius: 999px; background: var(--dowel); box-shadow: 0 12px 18px -12px rgba(60,40,20,.5); z-index: 2; }
        .cv-post.l { left: 5%; } .cv-post.r { right: 5%; }
        .cv-rod { position: relative; z-index: 1; display: flex; align-items: center; gap: 4px; height: 22px; }
        .cv-rod::before { content: ""; position: absolute; left: -4%; right: -4%; top: 9px; height: 4px; border-radius: 4px; background: var(--rod); }
        .cv-gap { flex: 1; }
        .cv-b { position: relative; width: 22px; height: 22px; border-radius: 50%; flex: none; transition: transform .6s var(--spring); transition-delay: calc(var(--k, 0) * 40ms); }
        .cv-b.red { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .cv-b.white { background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
        .cv-b.ink { background: radial-gradient(circle at 34% 30%, #6a6a70, #1c1c1e 50%, #000); }
        a:hover .cv-rod.top .cv-b.red { transform: translateX(14px); }
        a:hover .cv-rod.bottom .cv-b.white:last-child { transform: translateX(-14px); }
        .cv-mid { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; }
        .cv-logo { width: 64px; height: 64px; flex: none; border-radius: 50%; display: grid; place-items: center; color: #1c1c1e; background: radial-gradient(circle at 34% 28%, #fff 0%, #f6f3f0 40%, #dcd6d0 100%); box-shadow: inset -4px -5px 9px -4px rgba(0,0,0,.16), 0 10px 16px -10px rgba(40,20,10,.5); transition: transform .6s var(--spring); }
        .cv-logo svg { width: 30px; height: 30px; }
        a:hover .cv-logo { transform: rotate(-12deg) scale(1.06); }
        .cv-k { display: block; font-family: var(--font-mono), monospace; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--rust-deep); }
        .cv-t { display: block; font-size: clamp(1.3rem, 2.4vw, 1.75rem); font-weight: 800; letter-spacing: -.035em; line-height: 1.05; margin-top: 4px; color: var(--ink); }
      `}</style>
    </div>
  );
}
