import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang } from "../../shared/lang.ts";
import StaquiaList from "../../shared/staquia-list.ts";

export default class DragAndDrop extends Component {
  render(): string {
    return `
<article id="page-drag-and-drop">
  <h2>Drag and Drop</h2>
  <section class="text-block">
    <p>
      A sortable list in a page needs one thing from Staquia after a drop: the item's <b>new neighbors</b>. The library gives the
      moved item its new position, and that item is the <b>only row to save</b>. Try it, every drop writes one row:
    </p>
  </section>
  ${new StaquiaList({ caption: "Rows written by your drops" })}
  <section class="text-block">
    <h3>With SortableJS</h3>
    <p>
      <a href="https://sortablejs.github.io/Sortable/">SortableJS</a> moves the element in the page and calls <code>onEnd</code>.
      The neighbors of the moved element are its new previous and next items: pass their ids to
      ${lang("<code>list.move</code>", { rust: "<code>list.move_to</code>" })}${lang("", { rust: " in your server" })}.
    </p>
  </section>
  ${new CodeBlock("drag-and-drop-sortable", "javascript", `
    import Sortable from "sortablejs";
    import Staquia, { LexicalList } from "staquia";

    // rows: SELECT * FROM tasks ORDER BY position
    const list = new LexicalList(Staquia.ascii());
    list.set(rows);

    const idOf = (element) => (element ? Number(element.dataset.id) : undefined);

    Sortable.create(document.querySelector("#tasks"), {
      onEnd({ item }) {
        const id = idOf(item);
        const previous = idOf(item.previousElementSibling);
        const next = idOf(item.nextElementSibling);

        let moved = list.move(id, previous, next);
        if (!moved.ok && moved.error.type === "position") {
          // The gap is full (rare): space the positions again, save them, and retry
          const rebalanced = list.rebalance();
          if (rebalanced.ok) saveAll(rebalanced.value[0]);
          moved = list.move(id, previous, next);
        }
        if (moved.ok) save(moved.value); // One row: UPDATE tasks SET position = ... WHERE id = ...
      },
    });
  `, { rust: `
    // The page sends { id, previous, next } after a drop (with SortableJS like in the JavaScript sample),
    // and the server keeps the list and saves the position
    use staquia::{LexicalError, LexicalList};

    fn on_drop(
        list: &mut LexicalList<Task>,
        id: u32,
        previous: Option<u32>,
        next: Option<u32>,
    ) -> Result<(), staquia::Error<u32>> {
        match list.move_to(&id, previous.as_ref(), next.as_ref()) {
            Ok(moved) => save(moved.value()), // One row: UPDATE tasks SET position = $1 WHERE id = $2
            Err(LexicalError::Position(_)) => {
                // The gap is full (rare): space the positions again, save them, and retry
                for item in list.rebalance()? {
                    save(item.value());
                }
                save(list.move_to(&id, previous.as_ref(), next.as_ref())?.value());
            }
            Err(error) => return Err(error.into()),
        }
        Ok(())
    }
  ` })}
  <section class="text-block">
    <h3>Other libraries</h3>
    <p>
      Any drag and drop library works the same way: find the moved item and its new neighbors, then move it in the list.
    </p>
    <ul>
      <li>
        <b><a href="https://dndkit.com/">dnd-kit</a> (React):</b> in <code>onDragEnd</code>, apply <code>arrayMove</code> to your
        array and read the items before and after the moved one in the new array.
      </li>
      <li>
        <b>The HTML drag and drop API:</b> on <code>drop</code>, the item you drop onto and the side you drop it on (before or after)
        give the neighbors.
      </li>
      <li><b>Keyboard sorting</b> (move up or down): the new neighbors are the item two places up, or the next two down.</li>
    </ul>
    ${new Note(`
      <b>Show the move right away.</b> The new position is known before anything is saved, so the page can show the new order at
      once and save the one row in the background. If saving fails, load the rows again: <code>set</code> rebuilds the list from
      the database order.
    `)}
    <p>
      Saving the position, concurrent users and restoring deleted items are explained in the ${new Link("database")} chapter.
    </p>
  </section>
</article>`;
  }
}
