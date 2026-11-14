/* The four pages of the Roles & skills section, each with its own interactive banner. */
export type BannerKind = "families" | "matrix" | "skills" | "tasks";
export const ROLE_PAGES: { kind: BannerKind; label: string; href: string; note: string }[] = [
  { kind: "families", label: "Role families", href: "/roles/families/", note: "Titles, tasks, stack and growth path" },
  { kind: "matrix", label: "Skills matrix", href: "/roles/matrix/", note: "Twelve skills, scored aware to expert" },
  { kind: "skills", label: "Skill map", href: "/skills/", note: "Which skills travel together, and which one opens the most doors" },
  { kind: "tasks", label: "Tasks", href: "/roles/tasks/", note: "What each role does day to day" },
];
