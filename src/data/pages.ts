import type { Page } from "../types/page.ts";

/**
 * One-word titles for the narrow navigator, for the pages whose title doesn't fit it.
 * The other pages use their full title everywhere.
 */
export const shortTitles: Partial<Record<Page, string>> = {
  "get-started": "Start",
  introduction: "Intro",
  "why-staquia": "Why",
  "number-system": "Numbers",
  reinsertions: "Reinsert",
  "error-handling": "Errors",
  comparison: "Compare",
  "drag-and-drop": "Drag",
};

/** Full titles for the pages whose id doesn't give them (every word of the id is capitalized otherwise). */
export const titles: Partial<Record<Page, string>> = {
  "drag-and-drop": "Drag and Drop",
};
