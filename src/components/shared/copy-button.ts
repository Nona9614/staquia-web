import Component from "../component.ts";
import { CopyButton as Contract } from "../../contract.ts";

/**
 * A button that copies the text of another element.
 *
 * @remarks The script finds it by `CopyButton.target` and copies the element with that id.
 */
export default class CopyButton extends Component {
  readonly target: string;

  /** @param target - The id of the element to copy. */
  constructor(target: string) {
    super();
    this.target = target;
  }

  render(): string {
    return `
<button type="button" class="copy-button" ${Contract.target.attr(this.target)}>
  <span class="${Contract.note.name}">${Contract.text.idle}</span>
  <i>📄</i>
</button>`;
  }
}
