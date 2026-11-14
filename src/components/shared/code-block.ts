import Component, { escape } from "../component.ts";
import CopyButton from "./copy-button.ts";
import { dedent, highlight, type Language } from "../../services/highlight.service.ts";

/** A highlighted code sample with a copy button. */
export default class CodeBlock extends Component {
  readonly id: string;
  readonly language: Language;
  readonly html: string;

  /**
   * @param id - A document-wide unique id for the code (used by the copy button).
   * @param language - The language of the code.
   * @param code - The plain code, indentation shared by every line is removed.
   * @param transform - Optional change over the highlighted HTML, e.g. to add `data-bind` elements.
   */
  constructor(id: string, language: Language, code: string, transform?: (html: string) => string) {
    super();
    this.id = id;
    this.language = language;
    const html = highlight(dedent(code), language);
    this.html = transform ? transform(html) : html;
  }

  render(): string {
    return `
<section class="code-block code-block__${this.language}">
  <div class="code-block__display">
    <menu class="code-block__menu">
      <span class="title">${this.language}</span>
      <div class="filler"></div>
      ${new CopyButton(this.id)}
    </menu>
    <pre id="${escape(this.id)}" class="code-block__text"><code>${this.html}</code></pre>
  </div>
</section>`;
  }
}
