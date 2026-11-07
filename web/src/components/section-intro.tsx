import Link from "next/link";
import { structure } from "@/lib/structure";

/* The top of every section page: its number in the site's order, its title, its line,
   and the pages inside it as chips. */
export function SectionIntro({ id, h1, lead }: { id: string; h1?: React.ReactNode; lead?: string }) {
  const s = structure.find((x) => x.id === id)!;
  return (
    <div className="si">
      <span className="kicker"><span className="si-n">{s.n}</span> {s.title}</span>
      <h1 style={{ marginTop: 12 }}>{h1 ?? s.title}<span className="dot">.</span></h1>
      <p className="lead" style={{ marginTop: 16 }}>{lead ?? s.line}</p>
      {s.pages.length > 1 && (
        <nav className="si-pages" aria-label={`${s.label} pages`}>
          {s.pages.map((p) => <Link key={p.href} href={p.href} className="chip">{p.label}{p.soon && <span className="si-soon">soon</span>}</Link>)}
        </nav>
      )}
      <style>{`
        .si-n { display: inline-grid; place-items: center; min-width: 26px; height: 20px; padding: 0 6px; border-radius: 6px; background: var(--rust); color: #fff; margin-right: 6px; }
        .si-pages { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
        .si-soon { margin-left: 6px; font-family: var(--font-mono), monospace; font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
      `}</style>
    </div>
  );
}

/* For pages inside a section: "03 AI-native architect / Architecture", linking back to the section. */
export function Crumb({ id, page }: { id: string; page: string }) {
  const s = structure.find((x) => x.id === id)!;
  return (
    <span className="kicker crumb">
      <span style={{ display: "inline-grid", placeItems: "center", minWidth: 26, height: 20, padding: "0 6px", borderRadius: 6, background: "var(--rust)", color: "#fff", marginRight: 6 }}>{s.n}</span>
      <Link href={s.href} style={{ color: "inherit" }}>{s.title}</Link> / {page}
    </span>
  );
}
