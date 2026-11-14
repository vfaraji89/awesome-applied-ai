import Link from "next/link";
import { T } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { ROLE_PAGES, type BannerKind } from "@/data/roles-pages";

/* The foot of each Roles & skills page: the other three pages, one step away. */
export function RolesNav({ here }: { here: BannerKind }) {
  return (
    <section className="section" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <span className="kicker"><T k="rn.k">More in roles and skills</T></span>
        <div className="grid grid-3" style={{ marginTop: 14 }}>
          {ROLE_PAGES.filter((p) => p.kind !== here).map((p) => (
            <Link key={p.href} href={p.href} className="frame rn-card">
              <span className="count">{String(ROLE_PAGES.indexOf(p) + 1).padStart(2, "0")}</span>
              <b><T k={`page.${slug(p.label)}`}>{p.label}</T> →</b>
              <span className="muted"><T k={`note.${slug(p.label)}`}>{p.note}</T></span>
            </Link>
          ))}
        </div>
        <style>{`.rn-card { display: grid; gap: 4px; } .rn-card b { font-size: 1.1rem; } .rn-card:hover b { color: var(--rust-deep); } .rn-card .muted { font-size: .88rem; }`}</style>
      </div>
    </section>
  );
}
