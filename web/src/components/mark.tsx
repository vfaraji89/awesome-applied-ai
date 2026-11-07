/* The Applied AI mark: the vfaraji89 abacus, beads climbing to a red bead at the top right. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <circle className="mk-b mk-1" cx="7.5" cy="16" r="1.9" fill="currentColor" />
      <circle className="mk-b mk-2" cx="12" cy="12" r="1.9" fill="currentColor" />
      <circle className="mk-b mk-3" cx="16.5" cy="8" r="2.2" fill="#e0301e" />
    </svg>
  );
}
