import { structure } from "./structure";
export const site = {
  name: "awesome-applied-ai",
  title: "Applied AI, mapped",
  url: "https://vfaraji89.github.io/awesome-applied-ai",
  author: {
    name: "Vahid Faraji",
    site: "https://vfaraji89.github.io/",
    github: "https://github.com/vfaraji89",
    linkedin: "https://www.linkedin.com/in/vahid-faraji-jobehdar/",
    email: "vfaraji89@gmail.com",
    book: "Applied AI, Simplified",
  },
} as const;

export const nav = structure.map((s) => ({ id: s.id, href: s.href, label: s.label, match: s.match }));
