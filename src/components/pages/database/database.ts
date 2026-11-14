import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";

export default class Database extends Component {
  render(): string {
    return `
<article id="page-database">
  <h2>Database</h2>
  <section class="text-block">
    <p>
      Staquia was made for lists that live in a database. A position is a plain string with a known maximum length, so the database
      can store it, index it and sort it on its own. These are the benefits, and how to set it up.
    </p>
    <h3>Why it fits a database</h3>
    <ul>
      <li><b>One <code>UPDATE</code> per move.</b> No renumbering, no long transactions, no locks over the whole list.</li>
      <li>
        <b>Sorted by an index.</b> <code>ORDER BY position</code> reads the rows straight from an index, no recursive queries or
        sorting in your application.
      </li>
      <li>
        <b>Moves don't collide.</b> Two users moving items in different places of the list write different rows, so they never
        block or overwrite each other.
      </li>
      <li>
        <b>Easy to synchronize.</b> A change is just <i>"this row now has this position"</i>. Offline changes can be sent later in any
        order, and the last value of each row wins.
      </li>
      <li>
        <b>Bounded size.</b> A position never has more than <code>l<sub>max</sub> = l<sub>n</sub> + l<sub>z</sub></code> characters
        (<code>20</code> by default), so the column and its index have a predictable size.
      </li>
    </ul>
    <h3>The table</h3>
    <p>
      Store the position in a text column and index it together with the list it belongs to. The database must compare the positions
      <b>byte by byte</b> (a binary collation), otherwise its order won't match the library order: many collations ignore symbols like
      the <code>!</code> zero, or the letter case.
    </p>
  </section>
  ${new CodeBlock("database-table", "sql", `
    -- PostgreSQL
    CREATE TABLE tasks (
      id       serial PRIMARY KEY,
      list_id  integer NOT NULL,
      title    text NOT NULL,
      position varchar(20) COLLATE "POSIX" NOT NULL,
      -- Two rows of the same list can't share a position (checked at the end of each transaction)
      CONSTRAINT tasks_position UNIQUE (list_id, position) DEFERRABLE INITIALLY DEFERRED
    );
  `)}
  <section class="text-block">
    <p>
      The unique constraint also creates the index used by <code>ORDER BY</code>. It is <code>DEFERRABLE</code> because a rebalance
      updates many rows in one transaction, and a new position may be equal to an old one that is updated a moment later.
    </p>
    <div class="table__container">
      <table class="table">
        <thead>
          <tr><th>Database</th><th>Binary collation</th></tr>
        </thead>
        <tbody>
          <tr><td>PostgreSQL</td><td><code>COLLATE "POSIX"</code> or <code>COLLATE "C"</code></td></tr>
          <tr><td>MySQL</td><td><code>utf8mb4_bin</code></td></tr>
          <tr><td>SQL Server</td><td><code>Latin1_General_100_BIN2_UTF8</code> (or any <code>_BIN2</code> collation)</td></tr>
          <tr><td>SQLite</td><td><code>BINARY</code> (the default)</td></tr>
          <tr><td>MongoDB</td><td>The default string comparison, without a <code>collation</code> option</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      UTF-8 bytes keep the order of the unicode values, and JavaScript compares the same values as long as the digits are in the
      Basic Multilingual Plane (up to <code>U+FFFF</code>). That's why the library and the database always agree. Each of those
      characters takes at most <code>3</code> bytes, so a default position takes at most <code>60</code> bytes.
    </p>
    <h3>Reading</h3>
  </section>
  ${new CodeBlock("database-read", "javascript", `
    // SELECT * FROM tasks WHERE list_id = $1 ORDER BY position
    const rows = await db.query(sql, [listId]);

    const list = new LexicalList(system);
    const loaded = list.set(rows); // Verifies the order with one comparison per row
  `)}
  <section class="text-block">
    <p>
      If the collation is not binary, <code>set</code> fails with a <code>"not-ordered"</code> error instead of building a wrong list.
      Fix the collation: the <code>untrusted</code> option would hide the problem and rewrite positions on every load.
    </p>
    <h3>Writing</h3>
    <p>Every operation of the list tells you which rows to save. In the usual case it is exactly one:</p>
  </section>
  ${new CodeBlock("database-write", "sql", `
    -- Add an item (list.push or list.unshift gave it a position)
    INSERT INTO tasks (list_id, title, position) VALUES ($1, $2, $3);

    -- Move an item (list.move changed only its position)
    UPDATE tasks SET position = $1 WHERE id = $2;

    -- Delete an item: nothing else changes
    DELETE FROM tasks WHERE id = $1;
  `)}
  <section class="text-block">
    <h3>Rebalancing</h3>
    <p>
      When many moves land in the same gap, a move fails with a <code>"position"</code> error (see ${new Link("maths")}). Space the
      positions again with <code>sort</code> and save the affected rows in <b>one transaction</b>:
    </p>
  </section>
  ${new CodeBlock("database-rebalance", "javascript", `
    const sorted = list.sort((a, b) => (a.position.less(b.position) ? -1 : 1));
    if (sorted.ok) {
      const [affected] = sorted.value;
      await db.transaction(async (tx) => {
        for (const item of affected) {
          await tx.query("UPDATE tasks SET position = $1 WHERE id = $2", [item.position.toString(), item.id]);
        }
      });
    }
  `)}
  <section class="text-block">
    <h3>Restoring deleted items</h3>
    <p>
      With a <i>soft delete</i> (a <code>deleted_at</code> column) the item keeps its position, so restoring it puts it back exactly
      where it was, with a single write. If another item took the same position meanwhile, the unique constraint rejects the restore:
      load the rows together with the restored one using the <code>untrusted</code> option (see below). The restored item gets a new
      position right after the other one, and it is the only row to save.
    </p>
    <h3>Concurrent users</h3>
    <p>
      Two users dropping two different items into the <b>same gap</b> at the same time can calculate the same position. The unique
      constraint makes the second write fail, so that client reloads the list and repeats the move with the new neighbors.
    </p>
    <p>
      Without the constraint (or when merging old offline data), the duplicates reach the list. A normal <code>set</code> refuses them
      with a <code>"not-ordered"</code> error, and <code>set(rows, { untrusted: true })</code> repairs them: the first row keeps its
      position and the others get new positions right after it. Only the repaired rows are returned to be saved.
    </p>
    <h3>Validating on the server</h3>
    <p>
      Positions coming from the browser are user input. Before storing one, rebuild it on the server with <code>forge</code>: a
      character that is not a digit of the system fails with an <code>InvalidCharacterError</code>, and a position that is too long
      fails with an <code>OverflowError</code>. Always use parameterized queries.
    </p>
  </section>
  ${new CodeBlock("database-validate", "javascript", `
    const forged = system.forge(request.body.position);
    if (!forged.ok && !(forged.error instanceof ThresholdReachedError)) {
      return reply.status(400).send("Invalid position");
    }
  `)}
  ${new Note(`
    The same applies to any storage that sorts strings: a key-value store with ordered keys, an index in the browser
    (<code>IndexedDB</code>), or a plain <code>array.sort()</code> by the <code>position</code> field. See ${new Link("example")} for the
    application side.`)}
</article>`;
  }
}
