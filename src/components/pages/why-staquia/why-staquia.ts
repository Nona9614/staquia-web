import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang } from "../../shared/lang.ts";

const good = (text: string) => `<span class="verdict--good">${text}</span>`;
const bad = (text: string) => `<span class="verdict--bad">${text}</span>`;

export default class WhyStaquia extends Component {
  render(): string {
    return `
<article id="page-why-staquia">
  <h2>Why Staquia?</h2>
  <section class="text-block">
    <p>
      Every list that users can reorder has to <b>store its order</b> somewhere. There are several common ways to do it, and they all
      look fine with five items on a developer's machine. The differences appear with long lists, a real database, offline users
      and items moved many times into the same place.
    </p>
    <h3>The usual approaches</h3>
  </section>
  <div class="table__container">
    <table class="table table--wide">
      <thead>
        <tr>
          <th>Approach</th>
          <th>Rows written per move</th>
          <th>Moves into the same gap</th>
          <th>When it runs out</th>
          <th>Sorted by the database</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Integer index</b><br /><code>0, 1, 2…</code></td>
          <td>${bad("Every item between the old and the new place")}, about a third of the list on average (35 rows in a list of 100)</td>
          <td>Unlimited</td>
          <td>Never, it just keeps rewriting</td>
          <td>${good("Yes")}</td>
        </tr>
        <tr>
          <td><b>Gaps</b><br /><code>1000, 2000…</code></td>
          <td>${good("1")}, until a gap is full</td>
          <td>${bad("9")} with gaps of <code>1000</code></td>
          <td>${bad("The whole list must be renumbered")}</td>
          <td>${good("Yes")}</td>
        </tr>
        <tr>
          <td><b>Floats</b><br /><code>1.5, 1.25…</code></td>
          <td>${good("1")}</td>
          <td>${bad("52")}</td>
          <td>${bad("Silently")}: the middle value equals a neighbor and two items share a position</td>
          <td>${good("Yes")}</td>
        </tr>
        <tr>
          <td><b>Linked rows</b><br /><code>previous</code> / <code>next</code> columns</td>
          <td>${bad("3 to 5")}: the item and its old and new neighbors</td>
          <td>Unlimited</td>
          <td>Never, but one broken link breaks the whole order</td>
          <td>${bad("No")}, the chain must be followed (a recursive query)</td>
        </tr>
        <tr>
          <td><b>Other fractional keys</b><br />strings between strings</td>
          <td>${good("1")}</td>
          <td>Depends on the library</td>
          <td>Usually never: ${bad("keys keep growing")} without a limit or a warning</td>
          <td>${good("Yes")}</td>
        </tr>
        <tr>
          <td><b class="azure">Staquia</b></td>
          <td>${good("1")}, and only rarely a rebalance of the affected rows</td>
          <td>${good("Known in advance")}: 110 to 121 by default, configurable</td>
          <td>${good("Warns first")} (threshold), then fails with an error, never silently</td>
          <td>${good("Yes")}, with a binary collation</td>
        </tr>
      </tbody>
    </table>
  </div>
  <section class="text-block">
    <p>
      The numbers are not estimates: they were measured. Splitting the same gap of two floats works <code>52</code> times, a gap of
      <code>1000</code> works <code>9</code> times, and moving a random item in a list of <code>100</code> with an integer index rewrites
      <code>35</code> rows on average.
    </p>
    <h3>What makes Staquia different</h3>
    <h4>1. One write per change</h4>
    <p>
      Moving, inserting or restoring an item writes <b>one row</b>. And you don't have to guess which one: the
      <code>LexicalList</code> returns the affected items of every operation, the only ones that need to be saved.
    </p>
    <h4>2. Stacking is free</h4>
    <p>
      Most changes are not moves but items added at the start or the end. The segment <span class="n">N</span> handles them like a
      counter, so <b>stacked positions never get longer</b>. The alphabet system stacks <code>7 174 453</code> items in each direction
      before <span class="n">N</span> runs out, the default system about <code>5.7 × 10<sup>14</sup></code>. See ${new Link("segments")}.
    </p>
    <h4>3. Predictable limits, with a warning</h4>
    <p>
      Positions only grow when items are moved again and again into the <b>same gap</b>, and you can calculate how many moves fit
      before it happens. A <span class="warn">threshold</span> warns you before the limit, so you can space the positions again
      while there is still room. Nothing is ever lost silently. See ${new Link("maths")}, where you can also watch it happen.
    </p>
    <h4>4. Errors are values</h4>
    <p>
      Nothing is thrown. Every operation returns a <code>Result</code> that you check in the same place, and a failed list operation
      leaves the list and your objects exactly as they were. See ${new Link("error-handling")}.
    </p>
  </section>
  ${new CodeBlock("why-result", "javascript", `
    const moved = list.move(id, previousId, nextId);
    if (moved.ok) save(item); // One row
    else if (moved.error.type === "position") rebalance(); // Rare, and you decide when
  `, { rust: `
    match list.move_to(&id, previous, next) {
        Ok(moved) => save(moved.value()), // One row
        Err(LexicalError::Position(_)) => rebalance(list)?, // Rare, and you decide when
        Err(error) => return Err(error.into()),
    }
  ` })}
  <section class="text-block">
    <h4>5. Your own alphabet</h4>
    <p>
      You choose the digits. Plain ASCII letters for positions that travel in URLs, or a large range of unicode characters for
      shorter positions. Different systems can live in the same application, and positions can be migrated from one configuration to
      another keeping their order. Try it in the ${new Link("setup", "Setup App")}.
    </p>
    <h4>6. Made for databases</h4>
    <p>
      Positions are plain strings with a <b>known maximum length</b>. The database sorts them with a normal index, every move is a
      single <code>UPDATE</code>, and moves in different places never touch the same rows. See the ${new Link("database")} chapter.
    </p>
    <h4>7. Light</h4>
    <p>
      ${lang(`Zero dependencies, a single ES module, and positions are plain data objects: they keep no reference to the system or the list,
      so nothing stays alive longer than you need it.`, { rust: `Zero dependencies and no <code>unsafe</code> code. Positions are small <code>Copy</code> values on the stack: they
      keep no reference to the system or the list, and creating one never allocates.` })}
    </p>
    <h3>When Staquia is not the right tool</h3>
    <ul>
      <li>The list is <b>never reordered</b> by hand: an auto increment id or a timestamp is enough.</li>
      <li>
        The order comes from the data (a date, a name, a price): sort by that field instead.
      </li>
      <li>
        The whole list is always saved at once (a small array inside one document or a local file): just store the array in order.
      </li>
    </ul>
  </section>
  ${new Note(`
    Staquia keeps the <b>order</b>, not the meaning of the items. Two users moving two items into the same gap at the same time
    can get the same position, the ${new Link("database")} chapter shows how to detect it and how the list repairs it.`)}
</article>`;
  }
}
