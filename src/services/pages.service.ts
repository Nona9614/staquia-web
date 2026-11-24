import { pages, type Page } from "../types/page.ts";
import { shortTitles, titles } from "../data/pages.ts";

/**
 * Transforms a page name into its title, e.g. `number-system` into `Number System`.
 *
 * @param page - The page to be transformed.
 */
export function title(page: Page): string {
  const custom = titles[page];
  if (custom) return custom;
  return page
    .split("-")
    .map((word) => word[0]!.toUpperCase() + word.substring(1))
    .join(" ");
}

/**
 * Gets the one-word title of a page for narrow spaces, if its full title doesn't fit there.
 *
 * @param page - The page.
 * @returns The short title, or `undefined` when the full title is already short.
 */
export function shortTitle(page: Page): string | undefined {
  return shortTitles[page];
}

/**
 * Checks if a string (like a URL hash without `#`) is a known page.
 *
 * @param value - The string to check.
 */
export function isPage(value: string): value is Page {
  return (pages as readonly string[]).includes(value);
}

/**
 * Gets the page a URL hash points to, the first page when the hash is empty or unknown.
 *
 * @param hash - The URL hash, with or without the leading `#`.
 */
export function pageFromHash(hash: string): Page {
  let value = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    value = decodeURIComponent(value);
  } catch {
    // A malformed escape sequence is just an unknown page
  }
  return isPage(value) ? value : pages[0];
}

/**
 * Gets the document title of a page: the site name alone for the first page, `<Page> · <site>` for the others.
 *
 * @param page - The current page.
 * @param site - The site name.
 */
export function documentTitle(page: Page, site: string): string {
  return page === pages[0] ? site : `${title(page)} · ${site}`;
}

/**
 * Gets the pages before and after a page in reading order.
 *
 * @param page - The reference page.
 */
export function neighbours(page: Page): { previous: Page | undefined; next: Page | undefined } {
  const index = pages.indexOf(page);
  return { previous: pages[index - 1], next: pages[index + 1] };
}
