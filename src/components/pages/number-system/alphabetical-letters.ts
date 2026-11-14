import Component, { escape } from "../../component.ts";
import { alphabet } from "../../../data/app.ts";

/** The alphabetical set with the value of each letter. */
export default class AlphabeticalLetters extends Component {
  render(): string {
    const letters = alphabet
      .map((letter, index) => `<li><span>${escape(letter)}</span><span>&nbsp;→&nbsp;</span><span class="teal">${index}</span></li>`)
      .join("\n    ");
    return `
<section class="letters">
  <h3 class="subtitle">This is how the <span style="font-weight: bolder;">set</span> looks like</h3>
  <ul class="letters__body">
    ${letters}
  </ul>
</section>`;
  }
}
