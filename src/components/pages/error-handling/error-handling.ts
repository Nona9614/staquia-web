import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang, only } from "../../shared/lang.ts";

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
  `, { rust: `
    // The Result of the standard library: a success with its value, or a failure with its error
    enum Result<T, E> {
        Ok(T),
        Err(E),
    }
  ` })}
  ${new CodeBlock("result-check", "javascript", `
    const result = system.next(system.forge("zzzzz"));
    if (result.ok) {
      result.value; // The position
    } else {
      result.error; // Why it failed
    }
  `, { rust: `
    match system.next(&system.forge("zzzzz")?) {
        Ok(position) => println!("{position}"), // The position
        Err(error) => println!("{error}"), // Why it failed
    }
  ` })}
  <section class="text-block">
    ${lang(`<p>
      <code>next</code>, <code>previous</code> and <code>core</code> also accept a result, so calls can be chained without
      unwrapping each one. Once a result fails, its error is passed along and no new positions are created:
    </p>`, { rust: `<p>
      The <code>?</code> operator chains the calls without unwrapping each one. Once a call fails, its error is returned and no
      new positions are created:
    </p>` }, "div")}
  </section>
  ${new CodeBlock("result-chain", "javascript", `
    const result = system.next(system.next(system.start()));
    if (result.ok) console.log(result.value.toString()); // "mmmmo!"
  `, { rust: `
    let position = system.next(&system.next(&system.start()?)?)?;
    println!("{position}"); // "mmmmo!"
  ` })}
  <section class="text-block">
    <h3>Errors</h3>
    ${only("javascript", `<p>Each kind of failure has its own error class:</p>
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
    <p>Check them with <code>instanceof</code>:</p>`)}
    ${only("rust", `<p>Each kind of failure is a variant of an error enum:</p>
    <div class="table__container">
      <table class="table">
        <thead>
          <tr><th>Error</th><th>Returned by</th><th>Meaning</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>PositionError::</code><br /><code class="warn">ThresholdReached</code></td>
            <td>Position functions</td>
            <td>The position is valid but long, its <code>position</code> field contains it. Space the positions again soon.</td>
          </tr>
          <tr>
            <td><code>PositionError::</code><br /><code class="ichor">Overflow</code></td>
            <td>Position functions</td>
            <td>There is no valid position, its <code>position</code> field contains the one that failed (<code>length</code> digits long, above the <code>limit</code> of the system).</td>
          </tr>
          <tr>
            <td><code>PositionError::</code><br /><code class="ichor">EdgeReached</code></td>
            <td><code>next</code>, <code>previous</code></td>
            <td><span class="n">N</span> is already its last (or first) value, <code>direction</code> tells which.</td>
          </tr>
          <tr>
            <td><code>PositionError::</code><br /><code class="ichor">SystemMismatch</code></td>
            <td><code>next</code>, <code>previous</code>, <code>core</code></td>
            <td>The position was created by a system with a different configuration.</td>
          </tr>
          <tr>
            <td><code>PositionError::</code><br /><code class="ichor">InvalidCharacter</code></td>
            <td><code>forge</code></td>
            <td>The string has a character that is not a digit of the system, <code>index</code> tells which one.</td>
          </tr>
          <tr>
            <td><code class="ichor">CreateError</code></td>
            <td><code>Staquia::create</code></td>
            <td>The configuration of the system is not valid.</td>
          </tr>
          <tr>
            <td><code class="ichor">LexicalError</code></td>
            <td><code>LexicalList</code></td>
            <td>An operation over a list failed, the variant tells the reason.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      <code>staquia::Error</code> combines all of them with <code>From</code> implementations, so <code>?</code> works with every
      operation in the same function. Match the ones you handle:
    </p>`)}
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
  `, { rust: `
    use staquia::{PositionError, Staquia};

    let system = Staquia::create('!', 'a', 'z', 5, 15, 0.15)?;

    match system.core(&previous, &next) {
        Ok(position) => save(&position.to_string()),
        Err(PositionError::ThresholdReached { position, .. }) => {
            // Still a valid position, use it and space the positions again soon
            save(&position.to_string());
        }
        Err(error) if error.is_overflow() => {
            // There is no room left, space the positions again before inserting
        }
        Err(error) => return Err(error.into()),
    }
  ` })}
  <section class="text-block">
    <p>To check a position you already have, the system exposes the same conditions as the errors:</p>
  </section>
  ${new CodeBlock("error-checks", "javascript", `
    system.isThresholdReached(position); // Its length reached lϰ
    system.hasOverflow(position); // Its length is bigger than ln + lz
  `, { rust: `
    system.is_threshold_reached(&position); // Its length reached lϰ
    system.has_overflow(&position); // Its length is bigger than ln + lz
  ` })}
  <section class="text-block">
    <h3>List errors</h3>
    <p>
      A <code>LexicalList</code> (see ${new Link("example")}) returns a <code>LexicalError</code>
      ${lang("with a <code>type</code> field", { rust: "whose variant tells the reason" })}. When any error is returned, neither the list nor
      your ${lang("objects", { rust: "values" })} are changed.
    </p>
    ${only("javascript", `<div class="table__container">
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
    </div>`)}
    ${only("rust", `<div class="table__container">
      <table class="table">
        <thead>
          <tr><th>Variant</th><th>Reason</th></tr>
        </thead>
        <tbody>
          <tr><td><code>NotFound(id)</code></td><td>The item, or a neighbor passed to <code>move_to</code>, is not in the list.</td></tr>
          <tr><td><code>NotAdjacent { previous, next }</code></td><td>The neighbors passed to <code>move_to</code> are not next to each other.</td></tr>
          <tr><td><code>MissingNeighbors(id)</code></td><td><code>move_to</code> received no neighbor.</td></tr>
          <tr><td><code>SelfNeighbor(id)</code></td><td><code>move_to</code> received the item itself as a neighbor.</td></tr>
          <tr><td><code>Position(error)</code></td><td>A position could not be generated (threshold or overflow).</td></tr>
          <tr><td><code>DuplicateId(id)</code></td><td>An item with an id that is already in the list.</td></tr>
          <tr><td><code>InvalidPosition { id, reason }</code></td><td><code>set</code> received an item with an empty or invalid position.</td></tr>
          <tr><td><code>NotOrdered { index, previous, id }</code></td><td><code>set</code> received items that are not sorted by position.</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      <code>push</code>, <code>unshift</code>, <code>set</code> and <code>set_untrusted</code> take your values, so when they fail
      they return a <code>Rejected</code>: the error and your values given back (<code>into_value()</code>), for example to retry
      after a <code>rebalance()</code>.
    </p>`)}
  </section>
  ${only("javascript", `${new Note(`
    There are no event handlers for the threshold or the overflow anymore (<code>onThresholdReached</code> and
    <code>onOverflow</code> were removed in <code>0.5.0</code>). Every failure is returned and checked synchronously.`)}`)}
</article>`;
  }
}
