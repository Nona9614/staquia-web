import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";

export default class ErrorHandling extends Component {
  render(): string {
    return `
<article id="page-error-handling">
  <h2>Error Handling</h2>
  <section class="text-block">
    <p>
      The ${new Link("maths")} chapter showed that a position can reach the <span class="warn">threshold</span> or cause an
      <span class="ichor">overflow</span>. Other things can fail too, like reading a position with characters that are not digits
      of the system.
    </p>
    <p>
      <span class="azure">Staquia</span> <b>never throws</b>. Every function that can fail returns a <code>Result</code>, so you
      decide what to do, in the same place where it happened, without stopping the application:
    </p>
  </section>
  ${new CodeBlock("result-type", "typescript", `
    // A Result is either a success with its value, or a failure with its error
    type Result<T, E> =
      | { ok: true; value: T }
      | { ok: false; error: E };
  `)}
  ${new CodeBlock("result-check", "javascript", `
    const result = system.next(system.forge("zzzzz"));
    if (result.ok) {
      result.value; // The position
    } else {
      result.error; // Why it failed
    }
  `)}
  <section class="text-block">
    <p>
      <code>next</code>, <code>previous</code> and <code>core</code> also accept a result, so calls can be chained without
      unwrapping each one. Once a result fails, its error is passed along and no new positions are created:
    </p>
  </section>
  ${new CodeBlock("result-chain", "javascript", `
    const result = system.next(system.next(system.start()));
    if (result.ok) console.log(result.value.toString()); // "mmmmo!"
  `)}
  <section class="text-block">
    <h3>Errors</h3>
    <p>Each kind of failure has its own error class:</p>
    <div class="table__container">
      <table class="table">
        <thead>
          <tr><th>Error</th><th>Returned by</th><th>Meaning</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code class="warn">ThresholdReachedError</code></td>
            <td>Position functions</td>
            <td>The position is valid but long, <code>error.position</code> contains it. Space the positions again soon.</td>
          </tr>
          <tr>
            <td><code class="ichor">OverflowError</code></td>
            <td>Position functions</td>
            <td>There is no valid position, <code>error.position</code> contains the one that failed.</td>
          </tr>
          <tr>
            <td><code class="ichor">SystemMismatchError</code></td>
            <td><code>next</code>, <code>previous</code>, <code>core</code></td>
            <td>The position was created by a system with a different configuration.</td>
          </tr>
          <tr>
            <td><code class="ichor">InvalidCharacterError</code></td>
            <td><code>forge</code></td>
            <td>The string has a character that is not a digit of the system, <code>error.index</code> tells which one.</td>
          </tr>
          <tr>
            <td><code class="ichor">LexicalError</code></td>
            <td><code>LexicalList</code></td>
            <td>An operation over a list failed, <code>error.type</code> tells the reason.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>Check them with <code>instanceof</code>:</p>
  </section>
  ${new CodeBlock("error-instanceof", "javascript", `
    import Staquia, { OverflowError, ThresholdReachedError } from "staquia";

    const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
    const result = system.core(previous, next);

    if (result.ok) {
      save(result.value.toString());
    } else if (result.error instanceof ThresholdReachedError) {
      // Still a valid position, use it and space the positions again soon
      save(result.error.position.toString());
    } else if (result.error instanceof OverflowError) {
      // There is no room left, space the positions again before inserting
    }
  `)}
  <section class="text-block">
    <p>To check a position you already have, the system exposes the same conditions as the errors:</p>
  </section>
  ${new CodeBlock("error-checks", "javascript", `
    system.isThresholdReached(position); // Its length reached lϰ
    system.hasOverflow(position); // Its length is bigger than ln + lz
  `)}
  <section class="text-block">
    <h3>List errors</h3>
    <p>
      A <code>LexicalList</code> (see ${new Link("example")}) returns a <code>LexicalError</code> with a <code>type</code> field.
      When any error is returned, neither the list nor your objects are changed.
    </p>
    <div class="table__container">
      <table class="table">
        <thead>
          <tr><th>Type</th><th>Reason</th></tr>
        </thead>
        <tbody>
          <tr><td><code>"not-found"</code></td><td>The item, or a neighbor passed to <code>move</code>, is not in the list.</td></tr>
          <tr><td><code>"not-adjacent"</code></td><td>The neighbors passed to <code>move</code> are not next to each other.</td></tr>
          <tr><td><code>"position"</code></td><td>A position could not be generated (threshold or overflow), or is empty or invalid.</td></tr>
          <tr><td><code>"invalid-id"</code></td><td>An item with a <code>null</code> or <code>undefined</code> id.</td></tr>
          <tr><td><code>"duplicate-id"</code></td><td>An item with an id that is already in the list.</td></tr>
          <tr><td><code>"not-ordered"</code></td><td><code>set</code> received items that are not sorted by position.</td></tr>
          <tr><td><code>"map-overflow"</code></td><td>The list structure is corrupted.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
  ${new Note(`
    There are no event handlers for the threshold or the overflow anymore (<code>onThresholdReached</code> and
    <code>onOverflow</code> were removed in <code>0.4.0</code>). Every failure is returned and checked synchronously.`)}
</article>`;
  }
}
