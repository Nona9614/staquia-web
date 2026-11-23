import Component from "../component.ts";
import { perLanguage } from "./lang.ts";
import { languages } from "../../data/languages.ts";

/** A link to the API reference of the chosen code language (`data/languages.ts`). */
export default class ApiButton extends Component {
  render(): string {
    // No whitespace inside the link: a space there would render inside the button, not between it and the next word
    return perLanguage(
      (language) => `<a class="api-button" href="${languages[language].api}"><i aria-hidden="true">📚</i><span class="api-button__text">API</span></a>`,
    );
  }
}
