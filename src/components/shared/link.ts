import Component, { escape } from "../component.ts";
import { title } from "../../services/pages.service.ts";
import type { Page } from "../../types/page.ts";

/** An inline link to another documentation page. */
export default class Link extends Component {
  readonly page: Page;
  readonly text: string | undefined;

  /**
   * @param page - The target page.
   * @param text - The link text, the page title by default.
   */
  constructor(page: Page, text?: string) {
    super();
    this.page = page;
    this.text = text;
  }

  render(): string {
    return `<a class="link" href="#${this.page}">${escape(this.text ?? title(this.page))}</a>`;
  }
}
