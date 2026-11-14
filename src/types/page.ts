/** Every documentation page, in reading order. Also used as the URL hash and the page section id. */
export const pages = [
  "get-started",
  "introduction",
  "why-staquia",
  "strings",
  "number-system",
  "positions",
  "reinsertions",
  "segments",
  "maths",
  "error-handling",
  "example",
  "database",
  "setup",
] as const;

/** A documentation page name. */
export type Page = (typeof pages)[number];
