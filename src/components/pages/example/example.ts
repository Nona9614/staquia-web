import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";

export default class Example extends Component {
  render(): string {
    return `
<article id="page-example">
  <h2>Example</h2>
  <section class="text-block">
    <p>
      You now know how the algorithm works. This chapter shows how to use it in an application, building the market list of the
      ${new Link("introduction")} chapter.
    </p>
    <p>
      You could call <code>next</code>, <code>previous</code> and <code>core</code> yourself, but Staquia includes a
      <code>LexicalList</code>: a list that keeps the order of your objects and their positions in sync, and tells you exactly
      which items must be saved.
    </p>
    <h3>Creating the list</h3>
    <p>First, the ${new Link("number-system")} and the list. Any object with an <code>id</code> and a <code>position</code> field works:</p>
  </section>
  ${new CodeBlock("example-create", "typescript", `
    import Staquia, { LexicalList } from "staquia";

    interface MarketItem {
      id: number;
      text: string;
      emoji: string;
      position: string;
    }

    const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
    const list = new LexicalList<number, MarketItem>(system);

    // Your own objects by id, to save them after each operation
    const items = new Map<number, MarketItem>();
  `)}
  <section class="text-block">
    <h3>Loading the items</h3>
    <p>
      <code>set</code> loads the items stored in your database, <b>already sorted by position</b>. Their order is verified with one
      comparison per item, and it fails with a <code>"not-ordered"</code> error if they are not sorted.
    </p>
  </section>
  ${new CodeBlock("example-load", "javascript", `
    // SELECT * FROM market ORDER BY position
    const loaded = list.set(rows);
    if (loaded.ok) {
      for (const row of rows) items.set(row.id, row);
    } else {
      console.error(loaded.error.type);
    }
  `)}
  <section class="text-block">
    <p>
      If the items can't be trusted (repeated, empty or invalid positions), the <code>untrusted</code> option sorts and repairs
      them. It returns the items whose position changed, the only ones that need to be saved:
    </p>
  </section>
  ${new CodeBlock("example-load-untrusted", "javascript", `
    const repaired = list.set(rows, { untrusted: true });
    if (repaired.ok) {
      const [affected] = repaired.value;
      // Save only the affected items
    }
  `)}
  <section class="text-block">
    <h3>Adding items</h3>
    <p>
      <code>push</code> stacks an item at the end and <code>unshift</code> at the start, using the segment
      <span class="n">N</span>. The <code>position</code> field of your object is updated, so the object itself can be saved:
    </p>
  </section>
  ${new CodeBlock("example-add", "javascript", `
    const bread = { id: 14, text: "Bread", emoji: "🍞", position: "" };
    const added = list.push(bread);
    if (added.ok) {
      items.set(bread.id, bread);
      save(bread); // bread.position is now set
    }
  `)}
  <section class="text-block">
    <h3>Moving items</h3>
    <p>
      When a drag and drop ends, your drag and drop library tells you where the item was dropped. Pass the ids of its new
      neighbors to <code>move</code>: <code>undefined</code> as the previous one moves it to the start, and as the next one to the
      end. Only the moved item gets a new position.
    </p>
  </section>
  ${new CodeBlock("example-move", "javascript", `
    function onDrop(id, previousId, nextId) {
      const moved = list.move(id, previousId, nextId);
      if (moved.ok) save(items.get(id)); // The only item that changed
    }
  `)}
  <section class="text-block">
    <p>
      <code>move</code> checks that both neighbors are next to each other, so a stale or wrong drop fails with a
      <code>"not-adjacent"</code> or <code>"not-found"</code> error instead of breaking the order.
    </p>
    <h3>Spacing the positions again</h3>
    <p>
      After many moves into the same gap the ${new Link("maths", "threshold")} is reached, and the move fails with a
      <code>"position"</code> error. <code>sort</code> spaces every position again keeping the current order, and returns the
      affected items:
    </p>
  </section>
  ${new CodeBlock("example-rebalance", "javascript", `
    function onDrop(id, previousId, nextId) {
      let moved = list.move(id, previousId, nextId);
      if (!moved.ok && moved.error.type === "position") {
        // Keep the current order and space the positions again
        const sorted = list.sort((a, b) => (a.position.less(b.position) ? -1 : 1));
        if (sorted.ok) {
          const [affected] = sorted.value;
          saveAll(affected.map((item) => items.get(item.id)));
        }
        moved = list.move(id, previousId, nextId);
      }
      if (moved.ok) save(items.get(id));
    }
  `)}
  <section class="text-block">
    <p>
      Rebalancing rewrites many positions, but it happens rarely: only when one gap received dozens of moves. Every other
      operation writes a single item.
    </p>
    <h3>Storing the positions</h3>
    <p>
      The positions go to a text column with a binary collation, and every operation above saves one row. The
      ${new Link("database")} chapter shows the table, the queries, concurrent users and how to restore deleted items.
    </p>
  </section>
  ${new Note(`
    You never need to sort your array or rewrite the list. Your database (or any <code>sort</code> by the
    <span class="teal">position</span> field) gives the order back, and every move writes one row.`)}
</article>`;
  }
}
