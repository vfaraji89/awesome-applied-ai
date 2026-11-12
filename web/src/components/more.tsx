"use client";
import { useState, type ReactNode } from "react";
import { track } from "@/lib/track";

/** Short first, the rest on request: the children stay in the page (for search and
 *  screen readers) and open with a smooth height change. */
export function More({ children, label = "Read more", less = "Show less" }: { children: ReactNode; label?: string; less?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`more${open ? " open" : ""}`}>
      <div className="more-body" aria-hidden={!open} inert={!open || undefined}><div>{children}</div></div>
      <button type="button" className="more-btn" aria-expanded={open} onClick={() => setOpen((o) => { if (!o) track("more_open", { label, page: location.pathname }); return !o; })}>
        {open ? less : label}<span aria-hidden="true">{open ? "↑" : "↓"}</span>
      </button>
    </div>
  );
}
