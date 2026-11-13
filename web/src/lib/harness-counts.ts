import market from "@/data/market.json";
import { tools } from "@/data/tools";
import { fRoles, skills } from "@/data/framework";
import { layers } from "@/data/layers";
import { problems } from "@/data/problems";
import { certs, courses } from "@/data/certificates";
import { docs } from "@/data/docs";
import jargon from "@/data/content/jargon.json";
import { signals } from "@/lib/tool-signals";

/** The numbers the footer's harness shows next to each section. Computed on the server at build
 *  time and passed down, so the client footer never ships the data files themselves. */
export type HarnessCounts = Record<string, Record<string, number>>;

export function harnessCounts(): HarnessCounts {
  return {
    market: { n: market.totals.openNow, all: market.totals.allTime },
    roles: { n: fRoles.length, s: skills.length },
    architect: { n: layers.length, p: problems.length },
    tools: { n: tools.length, e: tools.filter((t) => signals(t).isNew).length },
    certificates: { n: certs.length, c: courses.length },
    docs: { n: docs.filter((d) => d.status === "live").length, j: jargon.terms.length },
    contribute: {},
  };
}
