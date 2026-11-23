import Component from "../component.ts";
import { CodeLanguage } from "../../contract.ts";

/**
 * The global code language `<select>`, in the header: one option per `CodeLanguage.values`.
 *
 * @remarks
 * The script sets `CodeLanguage.root` on `<html>` and the generated CSS (`layout/language-boot.ts`) shows the
 * `CodeLanguage.variant` elements of that language: code samples, text and links. The default language is
 * selected here, the script selects the stored one. Options show the short names, the header is narrow on phones.
 */
export default class LanguageSwitch extends Component {
  render(): string {
    const [fallback] = CodeLanguage.values;
    const options = CodeLanguage.values
      .map((language) => {
        const [full, short] = CodeLanguage.labels[language];
        return `<option value="${language}" label="${short}"${language === fallback ? " selected" : ""}>${full}</option>`;
      })
      .join("");
    return `<select class="${CodeLanguage.switch.name}" aria-label="Code language">${options}</select>`;
  }
}
