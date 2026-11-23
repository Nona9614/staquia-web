import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang } from "../../shared/lang.ts";

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
    <p>
      First, the ${new Link("number-system")} and the list. ${lang("Any object with an <code>id</code> and a <code>position</code> field works:", { rust:
      "Any type that implements the <code>Item</code> trait works: its id, its stored position, and how it receives a new one:" })}
    </p>
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
  `, { rust: `
    use staquia::{Item, LexicalList, Position, Staquia};

    struct MarketItem {
        id: u32,
        text: String,
        emoji: String,
        position: String,
    }

    impl Item for MarketItem {
        type Id = u32;
        fn id(&self) -> &u32 { &self.id }
        fn position(&self) -> &str { &self.position }
        fn set_position(&mut self, position: &Position) { self.position = position.to_string(); }
    }

    let system = Staquia::create('!', 'a', 'z', 5, 15, 0.15)?;

    // The list owns your values: find(&id) gives them back after each operation
    let mut list: LexicalList<MarketItem> = LexicalList::new(system);
  ` })}
  <section class="text-block">
    <h3>Loading the items</h3>
    <p>
      <code>set</code> loads the items stored in your database, <b>already sorted by position</b>. Their order is verified with one
      comparison per item, and it fails with a ${lang(`<code>"not-ordered"</code>`, { rust: "<code>NotOrdered</code>" })} error if they are not sorted.
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
  `, { rust: `
    // SELECT * FROM market ORDER BY position
    if let Err(rejected) = list.set(rows) {
        eprintln!("{}", rejected.error);
    }
  ` })}
  <section class="text-block">
    <p>
      If the items can't be trusted (repeated, empty or invalid positions), ${lang("the <code>untrusted</code> option", { rust: "<code>set_untrusted</code>" })} sorts and repairs
      them. It returns the items whose position changed, the only ones that need to be saved:
    </p>
  </section>
  ${new CodeBlock("example-load-untrusted", "javascript", `
    const repaired = list.set(rows, { untrusted: true });
    if (repaired.ok) {
      const [affected] = repaired.value;
      // Save only the affected items
    }
  `, { rust: `
    for item in list.set_untrusted(rows)? {
        save(item.value()); // Save only the affected items
    }
  ` })}
  <section class="text-block">
    <h3>Adding items</h3>
    <p>
      <code>push</code> stacks an item at the end and <code>unshift</code> at the start, using the segment
      <span class="n">N</span>. ${lang("The <code>position</code> field of your object is updated, so the object itself can be saved:", { rust:
      "Your value receives its position through <code>set_position</code>, so the value itself can be saved:" })}
    </p>
  </section>
  ${new CodeBlock("example-add", "javascript", `
    const bread = { id: 14, text: "Bread", emoji: "🍞", position: "" };
    const added = list.push(bread);
    if (added.ok) {
      items.set(bread.id, bread);
      save(bread); // bread.position is now set
    }
  `, { rust: `
    let bread = MarketItem { id: 14, text: "Bread".into(), emoji: "🍞".into(), position: String::new() };
    let added = list.push(bread)?;
    save(added.value()); // Its position is now set
  ` })}
  <section class="text-block">
    <h3>Moving items</h3>
    <p>
      When a drag and drop ends, your drag and drop library tells you where the item was dropped. Pass the ids of its new
      neighbors to ${lang("<code>move</code>", { rust: "<code>move_to</code>" })}: ${lang("<code>undefined</code>", { rust: "<code>None</code>" })} as the previous one moves it to the start, and as the next one to the
      end. Only the moved item gets a new position.
    </p>
  </section>
  ${new CodeBlock("example-move", "javascript", `
    function onDrop(id, previousId, nextId) {
      const moved = list.move(id, previousId, nextId);
      if (moved.ok) save(items.get(id)); // The only item that changed
    }
  `, { rust: `
    fn on_drop(
        list: &mut LexicalList<MarketItem>,
        id: u32,
        previous: Option<&u32>,
        next: Option<&u32>,
    ) -> Result<(), staquia::Error<u32>> {
        let moved = list.move_to(&id, previous, next)?;
        save(moved.value()); // The only item that changed
        Ok(())
    }
  ` })}
  <section class="text-block">
    <p>
      ${lang("<code>move</code>", { rust: "<code>move_to</code>" })} checks that both neighbors are next to each other, so a stale or wrong drop fails with a
      ${lang(`<code>"not-adjacent"</code> or <code>"not-found"</code>`, { rust: "<code>NotAdjacent</code> or <code>NotFound</code>" })} error instead of breaking the order.
    </p>
    <h3>Spacing the positions again</h3>
    <p>
      After many moves into the same gap the ${new Link("maths", "threshold")} is reached, and the move fails with a
      ${lang(`<code>"position"</code>`, { rust: "<code>LexicalError::Position</code>" })} error. ${lang("<code>sort</code>", { rust: "<code>rebalance</code>" })} spaces every position again keeping the current order, and returns the
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
  `, { rust: `
    use staquia::LexicalError;

    fn on_drop(
        list: &mut LexicalList<MarketItem>,
        id: u32,
        previous: Option<&u32>,
        next: Option<&u32>,
    ) -> Result<(), staquia::Error<u32>> {
        match list.move_to(&id, previous, next) {
            Ok(moved) => save(moved.value()), // The only item that changed
            Err(LexicalError::Position(_)) => {
                // Keep the current order and space the positions again
                for item in list.rebalance()? {
                    save(item.value());
                }
                save(list.move_to(&id, previous, next)?.value());
            }
            Err(error) => return Err(error.into()),
        }
        Ok(())
    }
  ` })}
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
