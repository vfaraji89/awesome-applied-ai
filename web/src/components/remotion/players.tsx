"use client";
import { Player } from "@remotion/player";
import { CourseTrailer, LessonCard } from "./course-trailer";

export function CourseTrailerPlayer({ title, lessons }: { title: string; lessons: string[] }) {
  const frames = 40 + lessons.length * 42 + 90;
  return (
    <Player component={CourseTrailer} inputProps={{ title, lessons }} durationInFrames={frames} fps={30}
      compositionWidth={1280} compositionHeight={600} autoPlay loop muted controls={false} clickToPlay={false}
      acknowledgeRemotionLicense style={{ width: "100%", borderRadius: 16, overflow: "hidden" }} />
  );
}

export function LessonCardPlayer(p: { n: number; total: number; title: string; analogy: string }) {
  const frames = Math.max(150, 40 + Math.ceil(p.analogy.split(" ").length * 1.6) + 60);
  return (
    <Player key={p.n} component={LessonCard} inputProps={p} durationInFrames={frames} fps={30}
      compositionWidth={1280} compositionHeight={460} autoPlay muted controls={false} clickToPlay={false}
      acknowledgeRemotionLicense style={{ width: "100%", borderRadius: 14, overflow: "hidden" }} />
  );
}
