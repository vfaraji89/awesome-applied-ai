export type Instrument = {
  id: string;
  href: string;
  name: string;
  lede: string;
  does: string;
};

export const instruments: Instrument[] = [
  {
    id: "nomogram",
    href: "/nomogram/",
    name: "The nomogram",
    lede: "The six governing relations of the stack, on one chart.",
    does: "Drag two scales, read the third.",
  },
  {
    id: "window",
    href: "/window/",
    name: "The window",
    lede: "The gap between the tokens you buy and the tokens the model reads.",
    does: "Repartition the prompt, watch the two come apart.",
  },
  {
    id: "cache",
    href: "/cache/",
    name: "Cache economics",
    lede: "When a prompt cache pays for itself, and when it never does.",
    does: "Set the hit rate, compare four providers.",
  },
];
