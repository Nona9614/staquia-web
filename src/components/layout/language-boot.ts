import Component from "../component.ts";
import { CodeLanguage } from "../../contract.ts";

/**
 * First in the body: the CSS that hides the content of the other code languages, generated from
 * `CodeLanguage.values` (so a new language needs no CSS), and a tiny blocking script that applies the language
 * before the page is painted, so the default samples never flash: the one of the link (`#view=...&lang=rust`)
 * first, stored as the new choice, then the stored one. `hydration/language.ts` runs later.
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
    const known = JSON.stringify(values);
    const key = JSON.stringify(storage);
    // Storage can be blocked (private mode): the link's language still applies, it just isn't remembered
    const script =
      `(function(){var l=null,m=/(?:^#|&)lang=([^&]*)/.exec(location.hash);` +
      `try{l=localStorage.getItem(${key})}catch(e){}` +
      `if(m&&${known}.indexOf(m[1])>=0){l=m[1];try{localStorage.setItem(${key},l)}catch(e){}}` +
      `if(${known}.indexOf(l)>0)document.documentElement.setAttribute(${JSON.stringify(root.name)},l)})();`;
    return `<style>\n${css}\n</style><script>${script}</script>`;
  }
}
