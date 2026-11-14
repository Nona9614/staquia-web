import { pages, type Page } from "../types/page.ts";

/** The page currently shown. */
class PagesStore {
  current: Page = pages[0];
}

export default new PagesStore();
