import Link from "next/link";
import { structure } from "@/lib/structure";
import { T } from "@/i18n/lang";

/* The hero's seven steps, in the site's order, on one wooden rod; a red bead walks along them. */
export function LearnPath() {
  return (
    <div className="lp">
      <div className="lp-rod" aria-hidden="true"><span className="lp-bead" /></div>
      <ol className="lp-steps">
        {structure.map((s, i) => (
          <li key={s.id} style={{ ["--i" as string]: i }}>
            <Link href={`#${s.id}`} className="lp-step">
              <span className="lp-dot" />
              <span className="mono lp-n">{s.n}</span>
              <b><T k={`sec.${s.id}.label`}>{s.label}</T></b>
            </Link>
          </li>
        ))}
      </ol>
      <style>{`
        .lp { position: relative; margin-top: 44px; }
        .lp-rod { position: absolute; left: 0; right: 0; top: 7px; height: 4px; border-radius: 4px; background: var(--rod); }
        .lp-bead { position: absolute; top: -7px; left: 0; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); box-shadow: 0 4px 8px -3px rgba(158,26,12,.6); animation: lp-walk 12s var(--ease) infinite; }
        @keyframes lp-walk {
          0%, 6% { left: 0; } 13%, 19% { left: calc(100% / 7); } 26%, 32% { left: calc(200% / 7); } 39%, 45% { left: calc(300% / 7); }
          52%, 58% { left: calc(400% / 7); } 65%, 71% { left: calc(500% / 7); } 78%, 90% { left: calc(600% / 7); } 100% { left: 0; }
        }
        .lp-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
        .lp-step { display: flex; flex-direction: column; gap: 2px; padding-top: 26px; text-decoration: none; position: relative; animation: rise .7s var(--ease) both; animation-delay: calc(var(--i) * 90ms + 200ms); }
        .lp-dot { position: absolute; top: 2px; left: 0; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
        .lp-n { font-size: .72rem; color: var(--rust-deep); letter-spacing: .1em; }
        .lp-step b { font-size: 1rem; line-height: 1.2; } .lp-step:hover b { color: var(--rust-deep); }
        @media (max-width: 760px) { .lp-steps { grid-template-columns: 1fr 1fr; row-gap: 14px; } .lp-rod { display: none; } .lp-step { padding: 0 0 0 24px; } }
        @media (prefers-reduced-motion: reduce) { .lp-bead { animation: none; } }
      `}</style>
    </div>
  );
}
