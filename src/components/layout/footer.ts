import Component from "../component.ts";
import { neighbours, title } from "../../services/pages.service.ts";
import type { Page } from "../../types/page.ts";

/** The previous/next links at the end of a page. */
export default class Footer extends Component {
  readonly page: Page;

  /** @param page - The page this footer belongs to. */
  constructor(page: Page) {
    super();
    this.page = page;
  }

  #button(page: Page | undefined, direction: "previous" | "next"): string {
    if (!page) return "";
    return `
  <a href="#${page}" class="footer__button footer__button__${direction}">
    <span class="footer__content">${direction}</span>
    <span class="footer__name">${title(page)}</span>
  </a>`;
  }

  render(): string {
    const { previous, next } = neighbours(this.page);
    return `
<footer class="footer">${this.#button(previous, "previous")}${this.#button(next, "next")}
</footer>`;
  }
}
