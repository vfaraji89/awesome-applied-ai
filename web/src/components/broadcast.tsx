"use client";
/* Site-wide reveal (styles in globals.css): frames below the fold open from the centre to the
   edges as they scroll in, one after another in a row; chip rows pop from the middle outwards,
   rows inside a frame once it has opened. Re-runs on every page change. Anything already on
   screen is left alone; nothing moves with reduced motion.
   Chrome measures a target's visibility through its own clip-path, so a closed frame reports no
   visible area: frames are watched at threshold 0 (any overlap counts). */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FRAMES = ".frame, .mi-prof, .mi-cat, .src-p";
const CHIPS = ".chip, .src-chip";
// frames that run their own entrance, or sit in a sticky or fixed bar, are left alone
const SKIP = ".mi-card, .itk, .site-header, .site-footer, header, footer, nav, [hidden]";

export function Broadcast() {
  const path = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;
    const strip = (el: HTMLElement) => { el.classList.remove("bc-wait", "bc-open", "bc-chip", "bc-pop"); el.style.removeProperty("--bc-d"); };
    const timers: ReturnType<typeof setTimeout>[] = [];
    const popRow = (row: Element, delay: number) => {
      const list = [...row.querySelectorAll<HTMLElement>(":scope > .bc-chip")], mid = (list.length - 1) / 2;
      list.forEach((c, i) => { const d = delay + Math.abs(i - mid) * 50; c.style.setProperty("--bc-d", `${d}ms`); c.classList.add("bc-pop"); timers.push(setTimeout(() => strip(c), d + 800)); });
    };
    const cio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { cio.unobserve(e.target); popRow(e.target, 100); } }), { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    const fio = new IntersectionObserver((es) => {
      es.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
        .sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.top - rb.top || ra.left - rb.left; })
        .forEach((el, i) => {
          fio.unobserve(el);
          const d = Math.min(i, 5) * 110;
          el.style.setProperty("--bc-d", `${d}ms`); el.classList.add("bc-open"); el.classList.remove("bc-wait");
          new Set([...el.querySelectorAll(".bc-chip")].map((c) => c.parentElement!)).forEach((row) => popRow(row, d + 600));
          timers.push(setTimeout(() => strip(el), 1600 + d)); // give hover lifts and shadows their full box back
        });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    const frames = [...document.querySelectorAll<HTMLElement>(`main ${FRAMES.split(", ").join(", main ")}`)]
      .filter((el) => below(el) && !el.closest(SKIP) && !el.parentElement?.closest(FRAMES));
    frames.forEach((el) => { el.classList.add("bc-wait"); fio.observe(el); });
    const rows = new Set<Element>();
    document.querySelectorAll<HTMLElement>(`main ${CHIPS.split(", ").join(", main ")}`).forEach((c) => {
      if (!below(c) || c.closest(SKIP)) return;
      c.classList.add("bc-chip"); rows.add(c.parentElement!);
    });
    rows.forEach((row) => { if (!row.closest(".bc-wait")) cio.observe(row); });
    return () => {
      fio.disconnect(); cio.disconnect(); timers.forEach(clearTimeout);
      document.querySelectorAll<HTMLElement>(".bc-wait, .bc-open, .bc-chip, .bc-pop").forEach(strip);
    };
  }, [path]);
  return null;
}
