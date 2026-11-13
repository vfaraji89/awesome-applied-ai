/* Section-aware extraction. A job ad mixes what the job is (responsibilities), what it asks of
   people (requirements, then nice-to-haves) and boilerplate (benefits, the company pitch, legal
   text). Reading them apart gives cleaner numbers: tasks come from the responsibilities, tools are
   split into required and preferred, and words in the benefits ("daily lunch", "learning budget")
   are not counted as skills or tools. Works on the plain text the sources produce; when an ad has
   no recognisable headings, the whole text is used, as before. */
import { skillsOf, toolsOf, tasksOf } from "./taxonomy";
import { techOf } from "./tech";

type Kind = "intro" | "do" | "need" | "nice" | "skip";
const HEADINGS: [Kind, RegExp][] = [
  ["do", /\b(what you('ll| will) (do|work on|own|build)|responsibilities|your (role|mission|impact)|in this role,? you|the role|day[- ]to[- ]day|what the job involves|key duties)\b/gi],
  ["need", /\b(requirements|qualifications|what you('ll)? (need|bring)|about you|you (have|bring|are)\b|who you are|must[- ]haves?|minimum qualifications|we('re| are) looking for|you should have|skills and experience)\b/gi],
  ["nice", /\b(nice[- ]to[- ]haves?|preferred( qualifications)?|bonus( points)?|it'?s a plus|ideally,? you|even better|extra credit)\b/gi],
  ["skip", /\b(benefits|perks|what we offer|compensation|salary range|pay range|about (us|the company|the team)|why join|our (values|culture)|equal (opportunity|employment)|eeo\b|privacy (notice|policy)|how to apply|interview process)\b/gi],
];

/** The part of an ad that is about the job itself: responsibilities, requirements and nice-to-haves,
 *  or the whole text when it has no headings. Used to judge what a non-AI job asks for. */
export function jobPart(text: string): string {
  const s = sections(text);
  return s.do.trim() || s.need.trim() ? `${s.do} ${s.need} ${s.nice}` : text;
}

/** Split the text at each heading phrase; a section runs until the next heading. */
export function sections(text: string): Record<Kind, string> {
  const marks: { at: number; kind: Kind }[] = [];
  for (const [kind, re] of HEADINGS) for (const m of text.matchAll(re)) marks.push({ at: m.index ?? 0, kind });
  marks.sort((a, b) => a.at - b.at);
  const out: Record<Kind, string> = { intro: "", do: "", need: "", nice: "", skip: "" };
  let from = 0, kind: Kind = "intro";
  for (const m of marks) {
    if (m.at - from < 1 && m.kind === kind) continue;
    out[kind] += " " + text.slice(from, m.at);
    from = m.at; kind = m.kind;
  }
  out[kind] += " " + text.slice(from);
  return out;
}

/** Years of experience asked for: the smallest "N+ years" in the requirements, capped at 20. */
export function yearsOf(text: string): number | undefined {
  const ys = [...text.matchAll(/\b(\d{1,2})\s*\+?\s*(?:-\s*\d{1,2}\s*)?(?:years?|yrs?)\b(?:\s+of)?(?:\s+\w+){0,4}?\s+(?:experience|industry|professional)/gi)]
    .map((m) => +m[1]).filter((n) => n > 0 && n <= 20);
  return ys.length ? Math.min(...ys) : undefined;
}

export interface Extracted { skills: string[]; tasks: string[]; tools: string[]; toolsPreferred: string[]; tech: string[]; years?: number; sectioned: boolean }

export function extract(title: string, text: string): Extracted {
  const s = sections(text);
  const sectioned = !!(s.do.trim() || s.need.trim());
  const core = sectioned ? `${title} ${s.intro} ${s.do} ${s.need}` : `${title} ${text}`;
  const all = sectioned ? `${core} ${s.nice}` : core;
  const required = toolsOf(core);
  const preferred = sectioned ? toolsOf(s.nice).filter((t) => !required.includes(t)) : [];
  return {
    skills: skillsOf(all),
    tasks: tasksOf(sectioned && s.do.trim() ? `${title} ${s.do}` : core),
    tools: [...required, ...preferred],
    toolsPreferred: preferred,
    tech: techOf(all),
    years: yearsOf(sectioned ? `${s.need} ${s.nice}` : text),
    sectioned,
  };
}
