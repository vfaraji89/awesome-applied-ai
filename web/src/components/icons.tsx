/* The site's icons (brand system D5): a 24px grid, 1.6 stroke, round ends, an ink line and one red
   bead each, drawn as a bead with its highlight, never a flat dot. Where the drawing allows, the bead
   sits on a rod. IconFrame puts one inside the abacus frame in miniature. */
const PATHS = {
  market: <><path d="M3.5 20h17" /><path d="M7 20v-6M12 20V8M17 20v-9" /><><circle cx="17" cy="8.6" r="2.4" fill="#e0301e" stroke="none" /><circle cx="16.25" cy="7.8" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  roles: <><circle cx="12" cy="8.2" r="3.2" /><path d="M5.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><path d="M14.5 3.6h5" /><><circle cx="19.5" cy="3.6" r="2.4" fill="#e0301e" stroke="none" /><circle cx="18.75" cy="2.8" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  people: <><circle cx="8.5" cy="9" r="2.6" /><circle cx="15.5" cy="9" r="2.6" /><path d="M3.5 19.5c.6-2.8 2.5-4.3 5-4.3s4.4 1.5 5 4.3M10.5 19.5c.6-2.8 2.5-4.3 5-4.3s4.4 1.5 5 4.3" /><path d="M5 4h14" /><><circle cx="12" cy="4" r="2.4" fill="#e0301e" stroke="none" /><circle cx="11.25" cy="3.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  events: <><path d="M3.5 7.5h17" /><path d="M5 7.5v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-11" /><path d="M5 4v6M19 4v6" /><path d="M9 14.5h2" /><><circle cx="15" cy="14.5" r="2.4" fill="#e0301e" stroke="none" /><circle cx="14.25" cy="13.7" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  architect: <><path d="M12 4 3.5 8.5 12 13l8.5-4.5z" /><path d="M3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5" /><><circle cx="12" cy="8.5" r="2.4" fill="#e0301e" stroke="none" /><circle cx="11.25" cy="7.7" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  tools: <><path d="M4 6.5h16M4 12h16M4 17.5h16" /><circle cx="9" cy="12" r="2.1" fill="currentColor" stroke="none" /><circle cx="14" cy="17.5" r="2.1" fill="currentColor" stroke="none" /><><circle cx="16" cy="6.5" r="2.4" fill="#e0301e" stroke="none" /><circle cx="15.25" cy="5.7" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  learn: <><path d="M4 5.5c2.7-.9 5.4-.6 8 1v13c-2.6-1.6-5.3-1.9-8-1z" /><path d="M20 5.5c-2.7-.9-5.4-.6-8 1v13c2.6-1.6 5.3-1.9 8-1z" /><path d="M14.5 10.5l3.5-1" /><><circle cx="18" cy="9.4" r="2.4" fill="#e0301e" stroke="none" /><circle cx="17.25" cy="8.6" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  docs: <><path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" /><path d="M14 3.5V8h4" /><path d="M9 12.5h6M9 16h6" /><><circle cx="12" cy="16" r="2.4" fill="#e0301e" stroke="none" /><circle cx="11.25" cy="15.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  jargon: <><path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4 3.5v-3.5h-.5a2 2 0 0 1-2-2z" /><path d="M8 10h8" /><><circle cx="13.5" cy="10" r="2.4" fill="#e0301e" stroke="none" /><circle cx="12.75" cy="9.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  certificates: <><circle cx="12" cy="9.5" r="5.2" /><path d="m8.8 14 -1.3 6.5L12 18l4.5 2.5L15.2 14" /><><circle cx="12" cy="9.5" r="2.4" fill="#e0301e" stroke="none" /><circle cx="11.25" cy="8.7" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  dataset: <><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /><><circle cx="16" cy="14.2" r="2.4" fill="#e0301e" stroke="none" /><circle cx="15.25" cy="13.399999999999999" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  fit: <><path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" /><path d="M14 3.5V8h4" /><path d="m9 13.5 2 2 4-4.5" /><><circle cx="18" cy="18" r="2.4" fill="#e0301e" stroke="none" /><circle cx="17.25" cy="17.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  filter: <><path d="M4 8h16M4 16h16" /><circle cx="15" cy="16" r="2.3" fill="currentColor" stroke="none" /><><circle cx="9" cy="8" r="2.4" fill="#e0301e" stroke="none" /><circle cx="8.25" cy="7.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /><><circle cx="10.5" cy="10.5" r="2.4" fill="#e0301e" stroke="none" /><circle cx="9.75" cy="9.7" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  external: <><path d="M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10" /><path d="M11 13l8-8M14 5h5v5" /><><circle cx="19" cy="5" r="2.4" fill="#e0301e" stroke="none" /><circle cx="18.25" cy="4.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
  addcal: <><path d="M3.5 7.5h17" /><path d="M5 7.5v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-11" /><path d="M5 4v6M19 4v6" /><path d="M12 11.5v6M9 14.5h6" /><><circle cx="19" cy="4" r="2.4" fill="#e0301e" stroke="none" /><circle cx="18.25" cy="3.2" r="0.8" fill="#ffb3a8" stroke="none" /></></>,
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, title }: { name: IconName; size?: number; title?: string }) {
  const sw = size <= 16 ? 1.9 : size <= 20 ? 1.75 : size >= 40 ? 1.4 : size >= 30 ? 1.5 : 1.6;
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {PATHS[name]}
    </svg>
  );
}

export function IconFrame({ name, size = 24 }: { name: IconName; size?: number }) {
  return <span className="ic-frame" aria-hidden="true"><Icon name={name} size={size} /></span>;
}
