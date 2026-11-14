import Component from "../component.ts";
import Footer from "./footer.ts";
import GetStarted from "../pages/get-started/get-started.ts";
import Introduction from "../pages/introduction/introduction.ts";
import StringComparison from "../pages/string-comparison/string-comparison.ts";
import NumberSystem from "../pages/number-system/number-system.ts";
import Positions from "../pages/positions/positions.ts";
import Reinsertions from "../pages/reinsertions/reinsertions.ts";
import Segments from "../pages/segments/segments.ts";
import Maths from "../pages/maths/maths.ts";
import ErrorHandling from "../pages/error-handling/error-handling.ts";
import Example from "../pages/example/example.ts";
import WhyStaquia from "../pages/why-staquia/why-staquia.ts";
import Database from "../pages/database/database.ts";
import Setup from "../pages/setup/setup.ts";
import { pages, type Page } from "../../types/page.ts";
import { Navigation } from "../../contract.ts";

/** The component of each page. */
const views: Record<Page, new () => Component> = {
  "get-started": GetStarted,
  introduction: Introduction,
  "why-staquia": WhyStaquia,
  strings: StringComparison,
  "number-system": NumberSystem,
  positions: Positions,
  reinsertions: Reinsertions,
  segments: Segments,
  maths: Maths,
  "error-handling": ErrorHandling,
  example: Example,
  database: Database,
  setup: Setup,
};

/**
 * The scrollable content with every page.
 *
 * @remarks
 * All pages are in the HTML, each one in a `<section id="<page>">`; only the current one is visible.
 * The script switches pages by toggling the `hidden` attribute.
 */
export default class Content extends Component {
  readonly current: Page;

  /** @param current - The page visible in the HTML. */
  constructor(current: Page) {
    super();
    this.current = current;
  }

  #page(page: Page): string {
    const View = views[page];
    return `
<section id="${page}" class="${Navigation.section.name}" ${Navigation.page.attr(page)}${page === this.current ? "" : " hidden"}>
  ${new View()}
  <hr class="divider" />
  ${new Footer(page)}
</section>`;
  }

  render(): string {
    return `
<div class="${Navigation.content.name}">${pages.map((page) => this.#page(page)).join("")}
</div>`;
  }
}
