"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./mark";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const path = usePathname() ?? "/";
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="awesome-applied-ai, home">
          <Mark />
          <span>Applied AI<span className="dot">.</span></span>
          <small>AWESOME-APPLIED-AI</small>
        </Link>
        <nav className="nav" aria-label="Sections">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
