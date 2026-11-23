import { CodeLanguage, type CodeLanguageName, type ExtraCodeLanguage } from "../../contract.ts";

/** The default language, and the fallback of the content without a variant for the chosen one. */
const [fallback] = CodeLanguage.values;

/**
 * Wraps HTML that is shown only for these code languages.
 *
 * @param languages - The languages the content belongs to.
 * @param html - The content.
 * @param tag - The wrapper element: `span` for text inside a paragraph, `div` for blocks.
 */
export function only(languages: CodeLanguageName | readonly CodeLanguageName[], html: string, tag: "span" | "div" = "div"): string {
  const list = typeof languages === "string" ? [languages] : languages;
  return `<${tag} ${CodeLanguage.variant.attr(list.join(" "))}>${html}</${tag}>`;
}

/**
 * The same text for each code language, e.g. an API name inside a paragraph:
 * `lang("<code>move</code>", { rust: "<code>move_to</code>" })`.
 *
 * @param javascript - The HTML for JavaScript, also shown for the languages without their own variant.
 * @param variants - The HTML for other languages.
 * @param tag - The wrapper element of each variant.
 */
export function lang(javascript: string, variants: Partial<Record<ExtraCodeLanguage, string>>, tag: "span" | "div" = "span"): string {
  const own = Object.keys(variants) as ExtraCodeLanguage[];
  const rest = CodeLanguage.values.filter((language) => !(own as readonly string[]).includes(language));
  return only(rest, javascript, tag) + own.map((language) => only(language, variants[language]!, tag)).join("");
}

/**
 * The languages a default-language variant stands for: itself and every language without its own variant.
 *
 * @param own - The languages that have their own variant.
 */
export function fallbackFor(own: readonly CodeLanguageName[]): CodeLanguageName[] {
  return CodeLanguage.values.filter((language) => language === fallback || !own.includes(language));
}
