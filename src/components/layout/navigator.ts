import Component from "../component.ts";
import { defaultViewBox, navigatorIcons } from "./navigator-icons.ts";
import { hashFor, shortTitle, title } from "../../services/pages.service.ts";
import { pages, type Page } from "../../types/page.ts";
import { Navigation } from "../../contract.ts";

/**
 * The side navigation with a link per page.
 *
 * @remarks The script marks the current page by moving `Navigation.current` between the links.
 */
export default class Navigator extends Component {
  readonly current: Page;

  /** @param current - The page marked as current in the HTML. */
  constructor(current: Page) {
    super();
    this.current = current;
  }

  #item(page: Page): string {
    const current = page === this.current ? ` ${Navigation.current.attr}` : "";
    const entry = navigatorIcons[page];
    const icon = typeof entry === "string" ? { d: entry, viewBox: defaultViewBox } : entry;
    return `
    <li class="nav__item" title="${title(page)}">
      <a class="${Navigation.link.name}" href="${hashFor(page)}" ${Navigation.page.attr(page)}${current}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" aria-hidden="true">
          <path fill="currentcolor" d="${icon.d}"></path>
        </svg>
        ${this.#label(page)}
      </a>
    </li>`;
  }

  /**
   * The label of a link. Pages with a short title render both: CSS shows the one that fits the
   * navigator width, and `display: none` keeps the other one out of the accessibility tree too.
   */
  #label(page: Page): string {
    const full = title(page);
    const short = shortTitle(page);
    if (!short) return `<span class="nav__item__text">${full}</span>`;
    return `<span class="nav__item__text nav__item__text--full">${full}</span><span class="nav__item__text nav__item__text--short">${short}</span>`;
  }

  render(): string {
    return `
<nav id="navigator" class="nav">
  <ul class="nav__list">${pages.map((page) => this.#item(page)).join("")}
  </ul>
</nav>`;
  }
}
