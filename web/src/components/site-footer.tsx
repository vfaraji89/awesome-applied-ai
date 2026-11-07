import Link from "next/link";
import { Mark } from "./mark";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Mark size={24} />
          <span>Curated by <a href={site.author.site}><b>{site.author.name}</b></a>. Open source on <a href={site.repo}>GitHub</a>.</span>
        </div>
        <nav aria-label="Footer">
          {nav.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          <a href={site.author.linkedin}>LinkedIn</a>
        </nav>
      </div>
    </footer>
  );
}
