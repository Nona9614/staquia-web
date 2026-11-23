import Component from "../component.ts";
import { CodeLanguage } from "../../contract.ts";

/**
 * The global code language switch, in the header: one option per `CodeLanguage.values`.
 *
 * @remarks
 * It is two `<select>`s kept in sync by the script, the full names for wide screens and the short ones for
 * phones; the CSS shows one of them (no script needed, so no label flashes). The script sets
 * `CodeLanguage.root` on `<html>` and the generated CSS (`layout/language-boot.ts`) shows the
 * `CodeLanguage.variant` elements of that language: code samples, text and links.
 */
export default class LanguageSwitch extends Component {
  render(): string {
    const [fallback] = CodeLanguage.values;
    const select = (variant: "full" | "short", index: 0 | 1) => {
      const options = CodeLanguage.values
        .map((language) => `<option value="${language}"${language === fallback ? " selected" : ""}>${CodeLanguage.labels[language][index]}</option>`)
        .join("");
      return `<select class="${CodeLanguage.switch.name} ${CodeLanguage.switch.name}--${variant}" aria-label="Code language">${options}</select>`;
    };
    return select("full", 0) + select("short", 1);
  }
}
