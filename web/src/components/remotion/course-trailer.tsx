"use client";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/* Remotion compositions in the brand kit: paper, dot grid, wooden posts, rods and beads.
   They play in the page through @remotion/player, so there is no video file to download. */

const PAPER = "#fff6f4", INK = "#1c1c1e", RUST = "#e0301e", RUST_DEEP = "#b4200f";
const DOWEL = "linear-gradient(90deg,#b48a5c 0%,#d8bb94 24%,#f1e3cc 48%,#dcc29e 70%,#ad8455 100%)";
const ROD = "linear-gradient(180deg,#e9d8bd,#f4eadb 35%,#d2b48d 75%,#b8946a)";
const BEAD = { red: "radial-gradient(circle at 34% 30%,#ff9d8f,#e0301e 45%,#9e1a0c)", white: "radial-gradient(circle at 34% 30%,#fff,#f1ede8 45%,#d6cfc7)", ink: "radial-gradient(circle at 34% 30%,#6a6a70,#1c1c1e 50%,#000)" };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(28,28,30,.08) 1.6px, transparent 1.8px)", backgroundSize: "26px 26px" }} />
      <div style={{ position: "absolute", left: 46, top: 34, bottom: 34, width: 16, borderRadius: 99, background: DOWEL }} />
      <div style={{ position: "absolute", right: 46, top: 34, bottom: 34, width: 16, borderRadius: 99, background: DOWEL }} />
      {children}
    </AbsoluteFill>
  );
}

function Rod({ y, beads }: { y: number; beads: { x: number; c: keyof typeof BEAD; s?: number }[] }) {
  return (
    <>
      <div style={{ position: "absolute", left: 40, right: 40, top: y, height: 6, borderRadius: 6, background: ROD }} />
      {beads.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: y - 15, left: b.x, width: 36, height: 36, borderRadius: 99, background: BEAD[b.c], transform: `scale(${b.s ?? 1})`, boxShadow: "0 8px 12px -8px rgba(40,20,10,.5)" }} />
      ))}
    </>
  );
}

/** The course trailer: one bead slides across for each lesson while its title rises in. */
export function CourseTrailer({ title, lessons }: { title: string; lessons: string[] }) {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const intro = 40, per = 42;
  const idx = Math.max(-1, Math.min(lessons.length - 1, Math.floor((f - intro) / per)));
  const local = f - intro - idx * per;
  const span = width - 260;
  const beads = lessons.map((_, i) => {
    const done = i < idx || (i === idx && local >= 0);
    const t = i === idx ? spring({ frame: local, fps, config: { damping: 14 } }) : done ? 1 : 0;
    return { x: interpolate(t, [0, 1], [width - 120 - (lessons.length - i) * 40, 90 + i * 40]), c: (done ? "red" : "white") as keyof typeof BEAD, s: i === idx ? 1.12 : 1 };
  });
  const titleIn = spring({ frame: f, fps, config: { damping: 16 } });
  const end = f > intro + lessons.length * per;
  const endIn = spring({ frame: f - intro - lessons.length * per, fps, config: { damping: 16 } });
  return (
    <Frame>
      <Rod y={96} beads={beads} />
      <Rod y={520} beads={[{ x: 90, c: "ink" }, { x: 130, c: "white" }, { x: span + 100, c: "white" }]} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 170, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 30}px)` }}>
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 22, letterSpacing: ".12em", textTransform: "uppercase", color: RUST_DEEP }}>
          {end ? "Technical docs, in motion" : idx < 0 ? `${lessons.length} pages` : `Page ${String(idx + 1).padStart(2, "0")} of ${lessons.length}`}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.02, color: INK, marginTop: 14 }}>
          {title}<span style={{ color: RUST }}>.</span>
        </div>
        <div key={idx} style={{ fontSize: 36, fontWeight: 600, color: "#55555a", marginTop: 26, letterSpacing: "-.02em", opacity: end ? endIn : idx < 0 ? 0 : Math.min(1, local / 8), transform: `translateY(${idx < 0 || end ? 0 : Math.max(0, 14 - local * 2)}px)` }}>
          {end ? "One idea, one comparison, one animation at a time." : idx >= 0 ? lessons[idx] : ""}
        </div>
      </div>
    </Frame>
  );
}

/** A lesson opener: the lesson number counts in on beads, then the title and the comparison. */
export function LessonCard({ n, total, title, analogy }: { n: number; total: number; title: string; analogy: string }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beads = Array.from({ length: total }).map((_, i) => {
    const t = spring({ frame: f - i * 3, fps, config: { damping: 15 } });
    const on = i < n;
    return { x: on ? interpolate(t, [0, 1], [900 + i * 40, 90 + i * 40]) : 900 + i * 40, c: (on ? (i === n - 1 ? "red" : "ink") : "white") as keyof typeof BEAD };
  });
  const a = spring({ frame: f - 12, fps, config: { damping: 18 } });
  const b = spring({ frame: f - 30, fps, config: { damping: 18 } });
  const words = analogy.split(" ");
  const shown = Math.max(0, Math.floor((f - 40) / 1.6));
  return (
    <Frame>
      <Rod y={70} beads={beads} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 130 }}>
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 24, letterSpacing: ".12em", textTransform: "uppercase", color: RUST_DEEP, opacity: a }}>Page {String(n).padStart(2, "0")} of {total}</div>
        <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.04, color: INK, marginTop: 10, opacity: a, transform: `translateY(${(1 - a) * 26}px)` }}>{title}<span style={{ color: RUST }}>.</span></div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: 26, opacity: b }}>
          <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.4, color: "#55555a", maxWidth: 980 }}>
            {words.map((w, i) => <span key={i} style={{ opacity: i < shown ? 1 : 0.12, transition: "none" }}>{w} </span>)}
          </div>
        </div>
      </div>
    </Frame>
  );
}
