export interface RawJob {
  source: string;
  id: string;
  company: string;
  title: string;
  location: string;
  remote: boolean;
  posted: string; // ISO date
  url: string;
  text: string; // plain description, used for tagging only, never stored
}

/** What is kept per posting: only what the market summary needs. No URL, description or company. */
export interface Job {
  key: string; // hash of source and posting id, for de-duplication only
  source: string;
  title: string; // normalised
  role: string;
  seniority: string;
  remote: boolean;
  skills: string[];
  tools: string[];
  tasks?: string[]; // what the job asks people to do (taxonomy TASKS ids)
  posted?: string; // the board's own publish date, when it gives one
  firstSeen: string;
  lastSeen: string;
}
