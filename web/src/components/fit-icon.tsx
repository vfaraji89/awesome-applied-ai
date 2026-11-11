/* The fit-check icon, shared with vfaraji89.github.io: a job description whose rows are
   scored with beads, and a check. The beads slide along their rods on hover. */
export function FitIcon({ size = 20 }: { size?: number }) {
  return (
    <svg className="fit-ic" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M5.5 2.75h9l3.75 3.75v6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 2.75v18.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8.5h7M8 12.5h7M8 16.5h3.5" stroke="currentColor" strokeOpacity="0.32" strokeWidth="1.1" strokeLinecap="round" />
      <circle className="fb fb-1" cx="9.25" cy="8.5" r="1.55" fill="currentColor" />
      <circle className="fb fb-2" cx="11.5" cy="12.5" r="1.55" fill="currentColor" />
      <circle cx="17.75" cy="17.75" r="4" fill="var(--rust)" />
      <path d="M15.9 17.8l1.3 1.3 2.5-2.7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
