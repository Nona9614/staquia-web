import Component from "../../component.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang } from "../../shared/lang.ts";

export default class Comparison extends Component {
  render(): string {
    return `
<article id="page-comparison">
  <h2>Comparison</h2>
  <section class="text-block">
    <p>
      Keeping the order of a list in a database is an old problem with several known answers. This chapter compares them by how
      they are designed, and measures Staquia itself with a script anyone can run.
    </p>
    <h3>The approaches</h3>
  </section>
  <div class="table__container">
    <table class="table">
      <thead>
        <tr><th></th><th>Rows per move</th><th>Key length</th><th>Warns before running out</th><th>Keeps the list</th></tr>
      </thead>
      <tbody>
        <tr><td><b>Staquia</b></td><td>1</td><td><b>Bounded</b> (20 by default), appends never grow it</td><td><b>Yes</b>: threshold, then overflow</td><td>Yes, <code>LexicalList</code></td></tr>
        <tr><td>Integer index (<code>0, 1, 2…</code>)</td><td>Every row in between</td><td>Fixed</td><td>Never runs out</td><td>No</td></tr>
        <tr><td>Gaps (<code>1000, 2000…</code>) and floats</td><td>1, until a gap is used up</td><td>Fixed, a <code>double</code> halves about 50 times per gap</td><td>No, items silently tie</td><td>No</td></tr>
        <tr><td>Fractional indexing (e.g. <code>generateKeyBetween</code>)</td><td>1</td><td><b>Unbounded</b>, grows at the ends and in busy gaps</td><td>No</td><td>No, only key functions</td></tr>
        <tr><td>LexoRank (Jira style)</td><td>1, plus rebalances by buckets</td><td>Grows until a rebalance</td><td>No</td><td>No</td></tr>
        <tr><td>CRDTs (LSEQ, Logoot, Yjs…)</td><td>1</td><td>Grows with every edit</td><td>No</td><td>Yes, the whole document in memory</td></tr>
      </tbody>
    </table>
  </div>
  <section class="text-block">
    <h3>Staquia, measured</h3>
    <p>
      <code>scripts/key-lengths.mjs</code> (in the repository of this site, <code>node scripts/key-lengths.mjs</code>) measures every
      preset with a seeded random generator, so it always prints the same numbers: the longest position after <b>10,000 appends</b>,
      after <b>10,000 moves to random places</b>, and how many moves fit into <b>the same gap</b> before the list asks for a rebalance.
    </p>
  </section>
  <div class="table__container">
    <table class="table">
      <thead>
        <tr><th>Preset</th><th>After 10,000 appends</th><th>After 10,000 random moves</th><th>Rebalances needed</th><th>Moves into one gap</th></tr>
      </thead>
      <tbody>
        <tr><td><code>default</code></td><td>6</td><td>6</td><td>0</td><td>121</td></tr>
        <tr><td><code>ascii</code></td><td>6</td><td>7</td><td>0</td><td>77</td></tr>
        <tr><td><code>${lang("urlSafe", { rust: "url_safe" })}</code></td><td>6</td><td>7</td><td>0</td><td>66</td></tr>
        <tr><td><code>base36</code></td><td>6</td><td>7</td><td>0</td><td>66</td></tr>
        <tr><td><code>alphabet</code></td><td>6</td><td>8</td><td>0</td><td>55</td></tr>
      </tbody>
    </table>
  </div>
  <section class="text-block">
    <p>
      Appending never makes positions longer: <span class="n">N</span> works like an integer, so the next position just adds one to
      it. Moves into the same gap are the worst case, and even then the list warns at the threshold, long before positions reach
      their maximum length. The numbers of each system are in the ${new Link("setup", "Setup App")} and the formulas in the
      ${new Link("maths")} chapter.
    </p>
    <h3>When not to use Staquia</h3>
    <ul>
      <li>
        <b>Peer to peer editing without a server</b>, offline first: two people moving items into the same gap at the same time get
        the same position, and the conflict is solved when the rows reach the database (see the ${new Link("database")} chapter).
        Without a central database, a CRDT avoids that coordination.
      </li>
      <li><b>Lists sorted by a field</b> like a date or a name: sort by that field, there is no manual order to keep.</li>
      <li><b>Small lists saved whole</b>, like a short array in a JSON column: saving the array is simpler.</li>
    </ul>
    ${new Note(`
      <b>Coming from another approach?</b> Load your rows sorted by their old key and pass them to
      ${lang("<code>list.set(rows, { untrusted: true })</code>", { rust: "<code>list.set_untrusted(rows)</code>" })} with an empty
      position: every row gets a Staquia position in the same order, and you save them once. The ${new Link("database")} chapter shows
      the migration.
    `)}
  </section>
</article>`;
  }
}
