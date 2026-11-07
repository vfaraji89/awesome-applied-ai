import { useId } from "react";

/* The Applied AI mark. The tile is the harness, the lines filling it are the context,
   and the red bead riding the ring on the corner is the agent loop. On the site the bead
   travels the ring: on hover by default, all the time with spin. */
export function Mark({ size = 30, spin = false }: { size?: number; spin?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`mk${spin ? " mk-spin" : ""}`}>
      <defs>
        <radialGradient id={id} cx=".34" cy=".3" r=".75">
          <stop offset="0" stopColor="#ff9d8f" /><stop offset=".45" stopColor="#e0301e" /><stop offset="1" stopColor="#9e1a0c" />
        </radialGradient>
      </defs>
      <rect x="1.8" y="5.2" width="17" height="17" rx="4.5" fill="var(--bg, #fff)" stroke="currentColor" strokeWidth="1.8" />
      <path className="mk-ctx" d="M5.6 11.2h9M5.6 14.7h6.6M5.6 18.2h3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17.6" cy="6.4" r="4.4" fill="var(--bg, #fff)" stroke="currentColor" strokeWidth="1.4" />
      <g className="mk-loop"><circle cx="20.71" cy="3.29" r="2.5" fill={`url(#${id})`} stroke="var(--bg, #fff)" strokeWidth="1" /></g>
    </svg>
  );
}
