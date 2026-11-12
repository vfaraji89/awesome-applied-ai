"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./mark";
import { nav } from "@/lib/site";
import { FitIcon } from "./fit-icon";
import { T, TH, LangPicker, useT } from "@/i18n/lang";

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const t = useT();
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
            <Link key={n.href} href={n.href} aria-current={n.match.some((m) => path.startsWith(m)) ? "page" : undefined}>
              <T k={`sec.${n.id}.label`}>{n.label}</T>
            </Link>
          ))}
        </nav>
        <Link href="/fit/" className="hdr-fit" aria-current={path.startsWith("/fit/") ? "page" : undefined} title={t("hdr.fit_title", "Paste your CV, see which applied AI role you fit")}>
          <FitIcon /><span><TH k="hdr.fit">Role <em>fit</em></TH></span>
        </Link>
        <LangPicker />
      </div>
    </header>
  );
}
