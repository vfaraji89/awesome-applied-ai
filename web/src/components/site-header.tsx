"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Mark } from "./mark";
import { nav } from "@/lib/site";
import { FitIcon } from "./fit-icon";
import { T, TH, LangPicker, useT } from "@/i18n/lang";

/** A hairline rod under the bar; its bead glides with reading progress, easing toward the
 *  scroll position each frame so it never jumps. Same motion as the portfolio. */
function BeadRod() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rod = ref.current;
    if (!rod || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cur = 0, goal = 0, raf = 0;
    const step = () => {
      cur += (goal - cur) * 0.14;
      if (Math.abs(goal - cur) < 0.0005) cur = goal;
      rod.style.setProperty("--p", cur.toFixed(4));
      raf = cur !== goal ? requestAnimationFrame(step) : 0;
    };
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      goal = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      rod.classList.toggle("on", window.scrollY > 40 && max > window.innerHeight * 0.5);
      if (!raf) raf = requestAnimationFrame(step);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="bead-rod" aria-hidden="true"><i /></div>;
}

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const t = useT();
  // one section lights up: the one whose match is the longest prefix (/market/conferences/ is Events, not Market)
  const best = nav.map((n) => ({ id: n.id, len: Math.max(0, ...n.match.filter((m) => path.startsWith(m)).map((m) => m.length)) })).sort((a, b) => b.len - a.len)[0];
  const active = best && best.len > 0 ? best.id : null;
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Applied AI, Simplified, home">
          <Mark />
          <span>Applied AI<span className="dot">.</span></span>
          <small>SIMPLIFIED</small>
        </Link>
        <nav className="nav" aria-label="Sections">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={n.id === active ? "page" : undefined}>
              <T k={`sec.${n.id}.label`}>{n.label}</T>
            </Link>
          ))}
          <a href="#about"><T k="ab.kicker">About</T></a>
        </nav>
        <Link href="/fit/" className="hdr-fit" aria-current={path.startsWith("/fit/") ? "page" : undefined} title={t("hdr.fit_title", "Paste your CV and see how ready you are for applied AI roles")}>
          <FitIcon /><span><TH k="hdr.fit">Role <em>fit</em></TH></span>
        </Link>
        <LangPicker />
      </div>
      <BeadRod />
    </header>
  );
}
