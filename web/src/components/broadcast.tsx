"use client";
/* Site-wide reveal (styles in globals.css): frames below the fold open from the centre to the
   edges as they scroll in, one after another in a row; chip rows pop from the middle outwards,
   rows inside a frame once it has opened. Re-runs on every page change. Anything already on
   screen is left alone, and so is the hero (it has its own entrance); nothing moves with
   reduced motion.
   A closed frame is clipped to nothing, and browsers disagree on whether a clipped element is
   "visible" (Safari on iPhone never says so, which left frames shut). So frames are not watched
   with IntersectionObserver: their layout box, which the clip does not change, is checked on
   scroll, and a frame opens a little before it reaches the screen. */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FRAMES = ".frame, .mi-prof, .mi-cat, .src-p";
const CHIPS = ".chip, .src-chip";
// frames that run their own entrance, or sit in a sticky or fixed bar, are left alone
const SKIP = ".mi-card, .itk, .cc, .ds, .rise, .home-hero, .site-header, .site-footer, header, footer, nav, [hidden]"; // .cc, .ds: the docs animate their own pages

export function Broadcast() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;
    const strip = (el: HTMLElement) => { el.classList.remove("bc-wait", "bc-open", "bc-chip", "bc-pop"); el.style.removeProperty("--bc-d"); };
    const timers: ReturnType<typeof setTimeout>[] = [];
    const popRow = (row: Element, delay: number) => {
      const list = [...row.querySelectorAll<HTMLElement>(":scope > .bc-chip")], mid = (list.length - 1) / 2;
      list.forEach((c, i) => { const d = delay + Math.abs(i - mid) * 40; c.style.setProperty("--bc-d", `${d}ms`); c.classList.add("bc-pop"); timers.push(setTimeout(() => strip(c), d + 700)); });
    };

    // what is waiting
    let frames = [...document.querySelectorAll<HTMLElement>(`main ${FRAMES.split(", ").join(", main ")}`)]
      .filter((el) => below(el) && !el.closest(SKIP) && !el.parentElement?.closest(FRAMES));
    frames.forEach((el) => el.classList.add("bc-wait"));
    const rowSet = new Set<Element>();
    document.querySelectorAll<HTMLElement>(`main ${CHIPS.split(", ").join(", main ")}`).forEach((c) => {
      if (!below(c) || c.closest(SKIP)) return;
      c.classList.add("bc-chip"); rowSet.add(c.parentElement!);
    });
    let rows = [...rowSet].filter((r) => !r.closest(".bc-wait"));

    // open whatever has come within reach of the screen; every box is read before anything is written
    let raf = 0;
    const check = () => {
      raf = 0;
      const reach = window.innerHeight * 1.05;
      const boxes = new Map(frames.map((el) => [el, el.getBoundingClientRect()] as const));
      const due = frames.filter((el) => { const r = boxes.get(el)!; return r.top < reach && r.bottom > 0; });
      const dueRows = rows.filter((r) => r.getBoundingClientRect().top < reach);
      if (due.length) {
        frames = frames.filter((el) => !due.includes(el));
        due.sort((a, b) => { const ra = boxes.get(a)!, rb = boxes.get(b)!; return ra.top - rb.top || ra.left - rb.left; })
          .forEach((el, i) => {
            const d = Math.min(i, 4) * 80;
            el.style.setProperty("--bc-d", `${d}ms`); el.classList.add("bc-open"); el.classList.remove("bc-wait");
            new Set([...el.querySelectorAll(".bc-chip")].map((c) => c.parentElement!)).forEach((row) => popRow(row, d + 380));
            timers.push(setTimeout(() => strip(el), 1100 + d)); // give hover lifts their full box back
          });
      }
      if (dueRows.length) { rows = rows.filter((r) => !dueRows.includes(r)); dueRows.forEach((r) => popRow(r, 60)); }
      if (!frames.length && !rows.length) stop();
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    function stop() { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      stop(); if (raf) cancelAnimationFrame(raf); timers.forEach(clearTimeout);
      document.querySelectorAll<HTMLElement>(".bc-wait, .bc-open, .bc-chip, .bc-pop").forEach(strip);
    };
  }, [path]);
  return null;
}
