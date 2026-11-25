import Component from "../component.ts";

/** A link to the first chapter of the documentation. */
export default class DocsButton extends Component {
  render(): string {
    // No whitespace inside the link: a space there would render inside the button, not between it and the next word
    return `<a class="doc-button" href="#view=introduction"><span aria-hidden="true">📖</span><span>Docs</span></a>`;
  }
}
