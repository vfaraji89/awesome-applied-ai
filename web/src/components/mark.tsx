import { useId } from "react";

/* The Applied AI mark, minimal: the frame is the harness, the red bead is the model inside it,
   and the line out through the wall to the small block is a tool call. On the site the call
   travels out to the tool and back: on hover by default, all the time with spin. */
export function Mark({ size = 30, spin = false }: { size?: number; spin?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`mk${spin ? " mk-spin" : ""}`}>
      <defs>
        <radialGradient id={id} cx=".34" cy=".3" r=".75">
          <stop offset="0" stopColor="#ff9d8f" /><stop offset=".45" stopColor="#e0301e" /><stop offset="1" stopColor="#9e1a0c" />
        </radialGradient>
      </defs>
      <rect x="1.6" y="3.6" width="15.4" height="16.8" rx="4.6" fill="var(--bg, #fff)" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.4 12h7.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect className="mk-tool" x="19.2" y="9.6" width="4.2" height="4.8" rx="1.3" fill="currentColor" />
      <circle className="mk-call" cx="13" cy="12" r="1.25" fill="#e0301e" />
      <circle cx="9.3" cy="12" r="3.3" fill={`url(#${id})`} />
    </svg>
  );
}
