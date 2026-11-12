import type { Tool } from "@/lib/types";
import content from "./content/tools.json";

// Edited in the content Google Sheet (tab: tools) and synced into content/tools.json.
// See CONTENT.md.
export const tools = content as Tool[];

export const toolsByLayer = (layer: string) =>
  tools.filter((t) => t.layer === layer);
