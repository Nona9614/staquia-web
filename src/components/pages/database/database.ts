import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang, only } from "../../shared/lang.ts";

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
      UTF-8 bytes keep the order of the unicode values, ${lang("and JavaScript compares the same values as long as the digits are in the", { rust:
      "Rust compares strings by those same bytes, and the systems only use digits of the" })}
      Basic Multilingual Plane (up to <code>U+FFFF</code>)${lang("", { rust: ", where JavaScript agrees too" })}. That's why the library and the database always agree. Each of those
      characters takes at most <code>3</code> bytes, so a default position takes at most <code>60</code> bytes.
    </p>
    <h3>With an ORM</h3>
    <p>
      Declare the position as a plain string of at most <code>20</code> characters. Most ORMs can't describe the binary collation
      or a <code>DEFERRABLE</code> unique constraint in their schema, so those two go in a SQL migration:
    </p>
  </section>
  ${new CodeBlock("database-orm", "sql", `
    -- The part of the migration the ORM can't write (PostgreSQL)
    ALTER TABLE tasks ALTER COLUMN position TYPE varchar(20) COLLATE "POSIX";
    ALTER TABLE tasks ADD CONSTRAINT tasks_position UNIQUE (list_id, position) DEFERRABLE INITIALLY DEFERRED;
  `)}
  ${only("javascript", `
  <section class="text-block">
    <h4><a href="https://www.prisma.io/docs/orm/prisma-migrate">Prisma</a></h4>
    <p>
      The schema declares the column; create the migration with <code>prisma migrate dev --create-only</code>, add the two lines
      above to its SQL, then apply it with <code>prisma migrate dev</code>.
    </p>
  </section>
  ${new CodeBlock("database-prisma-schema", "prisma", `
    model Task {
      id       Int    @id @default(autoincrement())
      listId   Int    @map("list_id")
      title    String
      // The collation and the unique constraint are added in the migration SQL
      position String @db.VarChar(20)

      @@map("tasks")
    }
  `)}
  ${new CodeBlock("database-prisma-queries", "javascript", `
    // Read the list in its order and load it
    const rows = await prisma.task.findMany({ where: { listId }, orderBy: { position: "asc" } });
    list.set(rows);

    // After a move, save the only row that changed
    const moved = list.move(id, previousId, nextId);
    if (moved.ok) {
      await prisma.task.update({ where: { id }, data: { position: moved.value.position.toString() } });
    }
  `)}
  <section class="text-block">
    <h4><a href="https://orm.drizzle.team/docs/kit-custom-migrations">Drizzle</a></h4>
    <p>
      The table in TypeScript; the two lines above go in a custom migration made with
      <code>drizzle-kit generate --custom</code>.
    </p>
  </section>
  ${new CodeBlock("database-drizzle", "typescript", `
    import { asc, eq } from "drizzle-orm";
    import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

    export const tasks = pgTable("tasks", {
      id: serial("id").primaryKey(),
      listId: integer("list_id").notNull(),
      title: text("title").notNull(),
      position: varchar("position", { length: 20 }).notNull(),
    });

    // Read the list in its order and load it
    const rows = await db.select().from(tasks).where(eq(tasks.listId, listId)).orderBy(asc(tasks.position));
    list.set(rows);

    // After a move, save the only row that changed
    const moved = list.move(id, previousId, nextId);
    if (moved.ok) {
      await db.update(tasks).set({ position: moved.value.position.toString() }).where(eq(tasks.id, id));
    }
  `)}`)}
  ${only("rust", `
  <section class="text-block">
    <h4><a href="https://github.com/launchbadge/sqlx">SQLx</a></h4>
    <p>
      Its migrations are plain SQL, so the table above is the migration (<code>sqlx migrate add tasks</code>), and the position
      is a <code>String</code> field of your row type.
    </p>
  </section>
  ${new CodeBlock("database-sqlx", "rust", `
    #[derive(sqlx::FromRow)]
    struct Task {
        id: i32,
        list_id: i32,
        title: String,
        position: String,
    }

    // Read the list in its order and load it
    let rows: Vec<Task> = sqlx::query_as("SELECT id, list_id, title, position FROM tasks WHERE list_id = $1 ORDER BY position")
        .bind(list_id)
        .fetch_all(&pool)
        .await?;
    list.set(rows)?;

    // After a move, save the only row that changed
    let moved = list.move_to(&id, previous.as_ref(), next.as_ref())?;
    sqlx::query("UPDATE tasks SET position = $1 WHERE id = $2")
        .bind(&moved.value().position)
        .bind(id)
        .execute(&pool)
        .await?;
  `)}`)}
  <section class="text-block">
    <h3>Migrating an existing list</h3>
    <p>
      Coming from an integer index, gaps, floats, fractional indexing or LexoRank? Add the position column, read every list sorted by
      its old key, and load the rows with an empty position as untrusted: each one gets a Staquia position <b>in the same order</b>.
      Save them in one transaction, then drop the old column.
    </p>
  </section>
  ${new CodeBlock("database-migrate", "javascript", `
    // rows: SELECT * FROM tasks WHERE list_id = $1 ORDER BY old_order
    const list = new LexicalList(Staquia.ascii());
    const result = list.set(
      rows.map((row) => ({ ...row, position: "" })),
      { untrusted: true },
    );
    if (result.ok) {
      const [affected] = result.value; // Every row, in the old order
      await db.transaction(async (tx) => {
        for (const item of affected) {
          await tx.query("UPDATE tasks SET position = $1 WHERE id = $2", [item.position.toString(), item.id]);
        }
      });
    }
  `, { rust: `
    // rows: SELECT * FROM tasks WHERE list_id = $1 ORDER BY old_order
    let mut list = LexicalList::new(Staquia::ascii());
    let rows = rows.into_iter().map(|row| Task { position: String::new(), ..row }).collect();
    let mut tx = db.transaction()?;
    for item in list.set_untrusted(rows)? {
        // Every row, in the old order
        tx.execute("UPDATE tasks SET position = $1 WHERE id = $2", (item.position().to_string(), item.id()))?;
    }
    tx.commit()?;
  ` })}
  <section class="text-block">
    <h3>Reading</h3>
  </section>
  ${new CodeBlock("database-read", "javascript", `
    // SELECT * FROM tasks WHERE list_id = $1 ORDER BY position
    const rows = await db.query(sql, [listId]);

    const list = new LexicalList(system);
    const loaded = list.set(rows); // Verifies the order with one comparison per row
  `, { rust: `
    // SELECT * FROM tasks WHERE list_id = $1 ORDER BY position
    let rows: Vec<Task> = db.query(SQL, (list_id,))?;
    let mut list = LexicalList::new(system);
    list.set(rows)?; // Verifies the order with one comparison per row
  ` })}
  <section class="text-block">
    <p>
      If the collation is not binary, <code>set</code> fails with a ${lang(`<code>"not-ordered"</code>`, { rust: "<code>NotOrdered</code>" })} error instead of building a wrong list.
      Fix the collation: ${lang("the <code>untrusted</code> option", { rust: "<code>set_untrusted</code>" })} would hide the problem and rewrite positions on every load.
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
      When many moves land in the same gap, a move fails with a ${lang(`<code>"position"</code>`, { rust: "<code>LexicalError::Position</code>" })} error (see ${new Link("maths")}). Space the
      positions again with <code>rebalance</code> and save the affected rows in <b>one transaction</b>. It is all or nothing: if the
      system has no room for every item it returns the error and changes nothing, so there is never a half-written order to save:
    </p>
  </section>
  ${new CodeBlock("database-rebalance", "javascript", `
    const rebalanced = list.rebalance();
    if (rebalanced.ok) {
      const [affected] = rebalanced.value;
      await db.transaction(async (tx) => {
        for (const item of affected) {
          await tx.query("UPDATE tasks SET position = $1 WHERE id = $2", [item.position.toString(), item.id]);
        }
      });
    }
  `, { rust: `
    let mut tx = db.transaction()?;
    for item in list.rebalance()? {
        tx.execute("UPDATE tasks SET position = $1 WHERE id = $2", (item.position().to_string(), item.id()))?;
    }
    tx.commit()?;
  ` })}
  <section class="text-block">
    <h3>Restoring deleted items</h3>
    <p>
      With a <i>soft delete</i> (a <code>deleted_at</code> column) the item keeps its position, so restoring it puts it back exactly
      where it was, with a single write. If another item took the same position meanwhile, the unique constraint rejects the restore:
      load the rows together with the restored one using ${lang("the <code>untrusted</code> option", { rust: "<code>set_untrusted</code>" })} (see below). The restored item gets a new
      position right after the other one, and it is the only row to save.
    </p>
    <h3>Concurrent users</h3>
    <p>
      Two users dropping two different items into the <b>same gap</b> at the same time can calculate the same position. The unique
      constraint makes the second write fail, so that client reloads the list and repeats the move with the new neighbors.
    </p>
    <p>
      Without the constraint (or when merging old offline data), the duplicates reach the list. A normal <code>set</code> refuses them
      with a ${lang(`<code>"not-ordered"</code>`, { rust: "<code>NotOrdered</code>" })} error, and ${lang("<code>set(rows, { untrusted: true })</code>", { rust: "<code>set_untrusted(rows)</code>" })} repairs them: the first row keeps its
      position and the others get new positions right after it. Only the repaired rows are returned to be saved.
    </p>
    <h3>Validating on the server</h3>
    <p>
      Positions coming from the browser are user input. Before storing one, rebuild it on the server with <code>forge</code>: a
      character that is not a digit of the system fails with ${lang("an <code>InvalidCharacterError</code>", { rust: "<code>PositionError::InvalidCharacter</code>" })}, and a position that is too long
      fails with ${lang("an <code>OverflowError</code>", { rust: "<code>PositionError::Overflow</code>" })}. Always use parameterized queries.
    </p>
  </section>
  ${new CodeBlock("database-validate", "javascript", `
    const forged = system.forge(request.body.position);
    if (!forged.ok && !(forged.error instanceof ThresholdReachedError)) {
      return reply.status(400).send("Invalid position");
    }
  `, { rust: `
    match system.forge(&body.position) {
        // A position over the threshold is still valid
        Ok(_) | Err(PositionError::ThresholdReached { .. }) => {}
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    }
  ` })}
  ${new Note(`
    The same applies to any storage that sorts strings: a key-value store with ordered keys, ${lang(`an index in the browser
    (<code>IndexedDB</code>), or a plain <code>array.sort()</code> by the <code>position</code> field.`, { rust: `a
    <code>BTreeMap</code> keyed by position, or a plain <code>sort_by</code> on the <code>position</code> field.` })} See ${new Link("example")} for the
    application side.`)}
</article>`;
  }
}
