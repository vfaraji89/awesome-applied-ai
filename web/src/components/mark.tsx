export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
      <circle cx="7.5" cy="8" r="1.9" fill="#e0301e" />
      <circle cx="15.5" cy="12" r="1.9" fill="currentColor" />
      <circle cx="9" cy="16" r="1.9" fill="currentColor" />
    </svg>
  );
}
