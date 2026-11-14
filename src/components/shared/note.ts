import Component from "../component.ts";

/** A highlighted side note. */
export default class Note extends Component {
  readonly content: string;

  /** @param content - The note HTML. */
  constructor(content: string) {
    super();
    this.content = content;
  }

  render(): string {
    return `
<section class="note">
  <span class="note__start">Note:&nbsp;</span>${this.content}
</section>`;
  }
}
