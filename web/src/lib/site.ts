export const site = {
  name: "awesome-applied-ai",
  title: "Applied AI, mapped",
  url: "https://vfaraji89.github.io/awesome-applied-ai",
  repo: "https://github.com/vfaraji89/awesome-applied-ai",
  author: {
    name: "Vahid Faraji",
    site: "https://vfaraji89.github.io/",
    github: "https://github.com/vfaraji89",
    linkedin: "https://www.linkedin.com/in/vahid-faraji-jobehdar/",
  },
} as const;

export const nav = [
  { href: "/learn/", label: "Learn" },
  { href: "/jargon/", label: "Jargon" },
  { href: "/architecture/", label: "Architecture" },
  { href: "/tools/", label: "Tools" },
  { href: "/roles/", label: "Roles" },
  { href: "/problems/", label: "Problems" },
] as const;
