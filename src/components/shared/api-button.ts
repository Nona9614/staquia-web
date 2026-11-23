import Component from "../component.ts";
import { lang } from "./lang.ts";

/** A link to the API documentation of the chosen language: TypeDoc (served from `api/` next to this page) or docs.rs. */
export default class ApiButton extends Component {
  render(): string {
    // No whitespace inside the link: a space there would render inside the button, not between it and the next word
    const link = (href: string) => `<a class="api-button" href="${href}"><i aria-hidden="true">📚</i><span class="api-button__text">API</span></a>`;
    return lang(link("api/index.html"), { rust: link("https://docs.rs/staquia") });
  }
}
