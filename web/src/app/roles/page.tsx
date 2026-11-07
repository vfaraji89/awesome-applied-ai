import type { Metadata } from "next";
import Link from "next/link";
import { roles } from "@/data/roles";
import { tools } from "@/data/tools";
import { layers } from "@/data/layers";
import { problems } from "@/data/problems";

export const metadata: Metadata = { title: "Roles", description: "Applied AI roles: what each one owns, the layers it works on and the tools it reaches for." };

export default function Roles() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="kicker">Applied AI roles</span>
        <h1 style={{ marginTop: 12 }}>Who builds it<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Six roles you will see in applied AI hiring. Each owns a different slice of the system; together they cover all six layers.</p>
        <div className="grid grid-2" style={{ marginTop: 36, gap: 22 }}>
          {roles.map((r, i) => {
            const ts = r.tools.map((id) => tools.find((t) => t.id === id)).filter(Boolean);
            const pr = problems.filter((p) => r.layers.includes(p.layer)).slice(0, 3);
            return (
              <article key={r.id} id={r.id} className="frame rise" style={{ ["--i" as string]: i }}>
                <span className="mono count">{String(i + 1).padStart(2, "0")}</span>
                <h2 style={{ marginTop: 6 }}>{r.name}<span className="dot">.</span></h2>
                <p className="lead" style={{ marginTop: 8, fontSize: "1.05rem" }}>{r.oneLine}</p>
                <div className="kicker" style={{ marginTop: 18 }}>Owns</div>
                <ul className="owns">{r.owns.map((o) => <li key={o}><span className="bead" />{o}</li>)}</ul>
                <div className="kicker" style={{ marginTop: 16 }}>Layers</div>
                <div className="chips" style={{ marginTop: 8 }}>
                  {r.layers.map((l) => <Link key={l} href={`/architecture/#${l}`} className="chip">{layers.find((x) => x.id === l)?.name}</Link>)}
                </div>
                <div className="kicker" style={{ marginTop: 16 }}>Reaches for</div>
                <div className="chips" style={{ marginTop: 8 }}>
                  {ts.map((t) => t && <a key={t.id} href={t.url} target="_blank" rel="noreferrer" className="chip"><span className="bead white" style={{ width: 10, height: 10 }} />{t.name}</a>)}
                </div>
                {pr.length > 0 && (
                  <>
                    <div className="kicker" style={{ marginTop: 16 }}>Problems to practise</div>
                    <ul className="owns">{pr.map((p) => <li key={p.id}><span className="bead white" /><Link href={`/problems/${p.id}/`}>{p.title}</Link></li>)}</ul>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <style>{`
        .owns { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; }
        .owns li { display: flex; gap: 10px; align-items: center; } .owns .bead { width: 10px; height: 10px; }
        .owns a { text-decoration: none; } .owns a:hover { color: var(--rust-deep); }
      `}</style>
    </section>
  );
}
