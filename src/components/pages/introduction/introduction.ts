import Component from "../../component.ts";
import Link from "../../shared/link.ts";

export default class Introduction extends Component {
  render(): string {
    return `
<article id="page-introduction">
  <h2 class="article__title">Introduction</h2>
  <section class="text-block">
    <p>This project was created to solve the <b>reinsertion problem</b> in lists.</p>
    <p>
      Imagine a list where the items can change their order: tasks, a kanban board, a playlist, the rows of a table. It has
      <i>A</i>, <i>B</i> and <i>C</i> with the positions <i>1</i>, <i>2</i> and <i>3</i>. When <i>A</i> moves between <i>B</i> and
      <i>C</i>, the positions of <b>every item</b> in between must be rewritten to store the new order. And that is not the only
      thing to worry about:
    </p>
  </section>
  <ul class="questions">
    <li><b>Performance issues</b> with very long lists: a random move rewrites about a third of the list.</li>
    <li>Which items must be updated after a move, and which ones can stay as they are?</li>
    <li>Each move becomes many writes in the <i>database</i>, one per shifted item.</li>
    <li>
      When <b>recovering a deleted item</b>, its old position may be taken now, so it needs a new one and the list must be sorted
      again.
    </li>
    <li>
      If the user works offline, or many users edit the same list, every change must be <b>synchronized</b>, and the more items
      each move touches, the more conflicts appear.
    </li>
  </ul>
  <section class="text-block">
    <p>This is what <b class="azure">Staquia</b> was created for!</p>
    <p>
      Each item stores a short <span class="teal">position</span> string. When an item moves, <b>only its own position</b>
      changes: one move, one write. You already saw it in the list of ${new Link("get-started")}.
    </p>
    <p>
      There are other ways to get <i>"a value between two values"</i>, so the next chapter, ${new Link("why-staquia")}, compares
      them. After that, the chapters explain how Staquia works, starting with how a string can keep an order:
      ${new Link("strings")}.
    </p>
  </section>
</article>`;
  }
}
