import Component, { escape } from "../component.ts";
import CopyButton from "./copy-button.ts";
import { CodeLanguage, type CodeLanguageName, type ExtraCodeLanguage } from "../../contract.ts";
import { fallbackFor, only } from "./lang.ts";
import { dedent, highlight, type Language } from "../../services/highlight.service.ts";

/** A variant of a code block: code in its code language, or `{ language, code }` for another syntax (e.g. bash). */
export type VariantSource = string | { language: Language; code: string };

/**
 * The optional parts of a code block: the same sample for other code languages (`rust`, ...), which adds the
 * language switch, and a transform of the HTML.
 */
export type CodeBlockOptions = Partial<Record<ExtraCodeLanguage, VariantSource>> & {
  /** A change over the highlighted HTML of every variant, e.g. to add `data-bind` elements. */
  transform?: (html: string, language: Language) => string;
};

/** One language of a code block. */
interface Variant {
  id: string;
  /** The code language it is shown for. */
  for: CodeLanguageName;
  language: Language;
  html: string;
}

/** A highlighted code sample with a copy button, optionally in several code languages with a switch. */
export default class CodeBlock extends Component {
  readonly variants: readonly Variant[];

  /**
   * @param id - A document-wide unique id for the code (used by the copy button), other variants add `--<language>`.
   * @param language - The language of the code.
   * @param code - The plain code, indentation shared by every line is removed.
   * @param options - The variants of the other code languages and a transform of the HTML.
   */
  constructor(id: string, language: Language, code: string, options: CodeBlockOptions = {}) {
    super();
    const variant = (target: CodeLanguageName, source: VariantSource): Variant => {
      // Every code language is also a highlighter language (tsc fails here for a language without one)
      const own: Language = target === CodeLanguage.values[0] ? language : target;
      const [syntax, code] = typeof source === "string" ? [own, source] : [source.language, source.code];
      const html = highlight(dedent(code), syntax);
      return {
        id: target === CodeLanguage.values[0] ? id : `${id}--${target}`,
        for: target,
        language: syntax,
        html: options.transform ? options.transform(html, syntax) : html,
      };
    };
    this.variants = [
      variant(CodeLanguage.values[0], code),
      ...CodeLanguage.values.slice(1).flatMap((target) => {
        const source = options[target as ExtraCodeLanguage];
        return source === undefined ? [] : [variant(target, source)];
      }),
    ];
  }

  render(): string {
    const switchable = this.variants.length > 1;
    const own = this.variants.slice(1).map((variant) => variant.for);
    const displays = this.variants.map((variant, index) => {
      const languages = index === 0 ? fallbackFor(own) : [variant.for];
      // A JavaScript sample shown because the chosen language has none of its own says so (SQL or HTML are shared)
      const fallback = /^(java|type)script$/.test(variant.language)
        ? languages
            .filter((language) => language !== CodeLanguage.values[0])
            .map((language) => only(language, ` · no ${CodeLanguage.labels[language][0]} sample yet`, "span"))
            .join("")
        : "";
      const title = `<span class="title">${variant.language}${fallback}</span>`;
      const attribute = switchable ? ` ${CodeLanguage.variant.attr(languages.join(" "))}` : "";
      return `
  <div class="code-block__display code-block__${variant.language}"${attribute}>
    <menu class="code-block__menu">
      ${title}
      <div class="filler"></div>
      ${new CopyButton(variant.id)}
    </menu>
    <pre id="${escape(variant.id)}" class="code-block__text"><code>${variant.html}</code></pre>
  </div>`;
    });
    return `
<section class="${CodeLanguage.block.name}">${displays.join("")}
</section>`;
  }
}
