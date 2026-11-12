/** "Skill map" -> "skill-map": page names share one key wherever they appear. Usable on the server and the client. */
export const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
