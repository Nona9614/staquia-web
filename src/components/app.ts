import Component from "./component.ts";
import Header from "./layout/header.ts";
import Navigator from "./layout/navigator.ts";
import Content from "./layout/content.ts";
import { pages, type Page } from "../types/page.ts";

/** The whole page body, rendered at build time into `index.html`. */
export default class App extends Component {
  readonly current: Page;

  /** @param current - The page visible in the HTML before the script runs. */
  constructor(current: Page = pages[0]) {
    super();
    this.current = current;
  }

  render(): string {
    return `${new Header()}${new Navigator(this.current)}${new Content(this.current)}`;
  }
}
