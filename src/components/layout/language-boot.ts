import Component from "../component.ts";
import { CodeLanguage } from "../../contract.ts";

/**
 * First in the body: the CSS that hides the content of the other code languages, generated from
 * `CodeLanguage.values` (so a new language needs no CSS), and a tiny blocking script that applies the stored
 * language before the page is painted, so the default samples never flash. `hydration/language.ts` runs later.
 */
export default class LanguageBoot extends Component {
  render(): string {
    const { root, variant, storage, values } = CodeLanguage;
    const [fallback, ...others] = values;
    // No attribute on <html> is the default language
    const hide = (selector: string, language: string) => `${selector} ${variant.selector}:not([${variant.name}~="${language}"])`;
    const selectors = [
      hide(`:root:not(${root.selector})`, fallback),
      ...others.map((language) => hide(`:root${root.is(language)}`, language)),
    ];
    const css = `${selectors.join(",\n")} {\n  display: none !important;\n}`;
    const script = `try{var l=localStorage.getItem(${JSON.stringify(storage)});if(${JSON.stringify(values)}.indexOf(l)>0)document.documentElement.setAttribute(${JSON.stringify(root.name)},l)}catch(e){}`;
    return `<style>\n${css}\n</style><script>${script}</script>`;
  }
}
