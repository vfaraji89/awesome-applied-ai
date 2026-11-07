import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeApiCourse } from "@/components/claude-api-course";
import { CourseCover } from "@/components/course-cover";
import { courses } from "@/data/courses";

export const metadata: Metadata = { title: "Claude Platform", description: "A free animated course on the Claude Platform: how your app talks to Claude, in plain words." };

export default function ClaudePlatform() {
  const ci = courses.findIndex((c) => c.id === "claude-platform");
  return (
    <section className="section">
      <div className="wrap">
        <Link href="/learn/" className="count" style={{ textDecoration: "none" }}>← All courses</Link>
        <div style={{ marginTop: 18, maxWidth: 560 }}><CourseCover course={courses[ci]} index={ci} /></div>
        <div className="kicker" style={{ marginTop: 26 }}>Free course · {courses[ci].lessons.length} lessons</div>
        <h1 style={{ marginTop: 12 }}>Claude Platform, animated<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>How your app talks to Claude, explained with everyday comparisons and one short animation per lesson. No coding background needed. Every lesson is free.</p>
        <div style={{ marginTop: 34 }}><ClaudeApiCourse /></div>
        <p className="count" style={{ marginTop: 34 }}>Written from the official <a href="https://platform.claude.com/docs/en/api/overview">Claude API overview</a>. Version strings and limits change, so check the docs before you build.</p>
      </div>
    </section>
  );
}
