import Component from "../component.ts";
import { CodeLanguage } from "../../contract.ts";

/**
 * The `<select>` of the code language, one option per `CodeLanguage.values`.
 *
 * @remarks
 * Every switch of the page chooses the language of every sample: the script sets `CodeLanguage.root` on `<html>`
 * and the generated CSS shows the `CodeLanguage.variant` elements of that language. The default language is
 * selected here, the script selects the stored one.
 */
export default class LanguageSwitch extends Component {
  readonly short: boolean;

  /** @param short - Shows the short names ("JS"), for the header. */
  constructor(short = false) {
    super();
    this.short = short;
  }

  render(): string {
    const [fallback] = CodeLanguage.values;
    const options = CodeLanguage.values
      .map((language) => {
        const [full, short] = CodeLanguage.labels[language];
        return `<option value="${language}"${language === fallback ? " selected" : ""}>${this.short ? short : full}</option>`;
      })
      .join("");
    return `<select class="${CodeLanguage.switch.name}" aria-label="Code language">${options}</select>`;
  }
}
