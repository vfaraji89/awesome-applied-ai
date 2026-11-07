import Link from "next/link";

/* The hero's three steps on a wooden rod; a red bead walks from one to the next. */
const STEPS = [
  { n: "01", t: "Learn the words", d: "Jargon in plain language", href: "/jargon/" },
  { n: "02", t: "See the stack", d: "Six layers, one request", href: "/architecture/" },
  { n: "03", t: "Solve the problems", d: "What breaks, and the fix", href: "/problems/" },
];
export function LearnPath() {
  return (
    <div className="lp">
      <div className="lp-rod" aria-hidden="true"><span className="lp-bead" /></div>
      <ol className="lp-steps">
        {STEPS.map((s, i) => (
          <li key={s.n} style={{ ["--i" as string]: i }}>
            <Link href={s.href} className="lp-step">
              <span className="lp-dot" />
              <span className="mono lp-n">{s.n}</span>
              <b>{s.t}</b>
              <span className="muted">{s.d}</span>
            </Link>
          </li>
        ))}
      </ol>
      <style>{`
        .lp { position: relative; margin-top: 40px; }
        .lp-rod { position: absolute; left: 7px; right: 7px; top: 7px; height: 4px; border-radius: 4px; background: var(--rod); }
        .lp-bead { position: absolute; top: -7px; left: 0; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); box-shadow: 0 4px 8px -3px rgba(158,26,12,.6); animation: lp-walk 7.5s var(--ease) infinite; }
        @keyframes lp-walk { 0%,8% { left: 0; } 30%,41% { left: calc(50% - 9px); } 63%,92% { left: calc(100% - 18px); } 100% { left: 0; } }
        .lp-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .lp-steps li:nth-child(2) { text-align: center; } .lp-steps li:nth-child(3) { text-align: right; }
        .lp-step { display: inline-flex; flex-direction: column; gap: 2px; padding-top: 26px; text-decoration: none; position: relative; animation: rise .7s var(--ease) both; animation-delay: calc(var(--i) * 120ms + 200ms); }
        .lp-dot { position: absolute; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #fff, #f1ede8 45%, #d6cfc7); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
        .lp-steps li:nth-child(1) .lp-dot { left: 0; } .lp-steps li:nth-child(2) .lp-dot { left: calc(50% - 7px); } .lp-steps li:nth-child(3) .lp-dot { right: 0; }
        .lp-n { font-size: .72rem; color: var(--rust-deep); letter-spacing: .1em; }
        .lp-step b { font-size: 1.05rem; } .lp-step:hover b { color: var(--rust-deep); }
        .lp-step .muted { font-size: .88rem; }
        @media (max-width: 640px) { .lp-steps { grid-template-columns: 1fr; } .lp-steps li { text-align: left !important; } .lp-rod { display: none; } .lp-dot { left: 0 !important; right: auto !important; } .lp-step { padding: 0 0 0 26px; } }
      `}</style>
    </div>
  );
}
