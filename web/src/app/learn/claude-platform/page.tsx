import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeApiCourse } from "@/components/claude-api-course";
import { CourseTrailerPlayer } from "@/components/remotion/players";
import { courses } from "@/data/courses";

export const metadata: Metadata = { title: "How your app talks to Claude", description: "Claude Platform, a free animated course: requests, SDKs, cloud options, pages, limits and receipts, in plain words." };

export default function ClaudePlatform() {
  const ci = courses.findIndex((c) => c.id === "claude-platform");
  return (
    <section className="section">
      <div className="wrap">
        <Link href="/learn/" className="count" style={{ textDecoration: "none" }}>← All courses</Link>
        <div className="frame" style={{ marginTop: 18, padding: 12 }}><CourseTrailerPlayer title={courses[ci].name} lessons={courses[ci].lessons} /></div>
        <div className="kicker" style={{ marginTop: 26 }}>Free course · {courses[ci].lessons.length} lessons</div>
        <h1 style={{ marginTop: 12 }}>How your app talks to Claude<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Everything about the Claude Platform, from the first request to the receipt that comes back. Each lesson is one idea, an everyday comparison, a short animation and a hint you can use today. No coding background needed, free for everyone.</p>
        <div style={{ marginTop: 34 }}><ClaudeApiCourse /></div>
        <p className="count" style={{ marginTop: 34 }}>Written from the official <a href="https://platform.claude.com/docs/en/api/overview">Claude API overview</a>. Version strings and limits change, so check the docs before you build.</p>
      </div>
    </section>
  );
}
