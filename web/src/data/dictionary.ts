import type { Field, Term } from "@/lib/types";
import content from "./content/jargon.json";

// Edited in the content Google Sheet (tabs: jargon, jargon_fields) and synced into
// content/jargon.json. See CONTENT.md.
export const fields = content.fields as Field[];
export const terms = content.terms as Term[];
