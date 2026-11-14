import Component from "../../component.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import Boxes, { type BoxItem, type BoxModifier } from "../../shared/boxes.ts";

/** A reinsertion step: `"an:reinserted"` is a colored box, anything else a plain one. */
const boxes = (...values: string[]) =>
  new Boxes(
    "sequence",
    values.map((value): BoxItem => {
      const [text, modifier] = value.split(":");
      return modifier ? [text!, modifier as BoxModifier] : text!;
    }),
  );

export default class Reinsertions extends Component {
  render(): string {
    return `
<article id="page-reinsertions">
  <h2>Reinsertions</h2>
  <section class="text-block">
    <p>
      Moving an item that is already in a list to a new place will be called a <span class="teal">reinsertion</span>. As the
      ${new Link("positions")} chapter showed, it is not as easy as it looks.
    </p>
    <p>
      The goal is to <b>avoid rewriting</b> the positions of the other items. It is the same problem when a new item is inserted
      in a specific place, or when a deleted item is recovered with its original <span class="teal">position</span>.
    </p>
    <p>
      Start with numbers: what value fits between <code>1</code> and <code>2</code>?
      <br />
      The average <code>1.5</code>. The new item takes that position and it is already between its neighbors, nothing else
      changes.
      <br />
      This is the basic principle of the <i class="teal">reinsertion algorithm</i> and how it <b>avoids rewriting</b> the list.
    </p>
  </section>
  <section class="text-block">
    <p>Now the same with the letters of the ${new Link("positions")} chapter:</p>
    ${boxes("a", "b", "c:reinserted")}
    <p>Move <span class="teal">c</span> between <span class="teal">a</span> and <span class="teal">b</span>.</p>
    ${boxes("a", "c:reinserted", "b")}
    <p>
      Using what was learned in ${new Link("strings")}, the position of <span class="teal">c</span> can change to
      <span class="teal">an</span>, a value between <span class="teal">a</span> and <span class="teal">b</span>.
    </p>
    ${boxes("a", "an:reinserted", "b")}
    <p>
      The reinsertions can continue, always taking the middle of the gap, until there are no more letters <i>in between</i>:
    </p>
    ${boxes("a:invalid", "aa:invalid", "ab", "ad", "ag", "an", "b")}
    <p>
      To continue, add zeroes <b>to the right</b> until every position has the same number of digits, so
      <span class="teal">a</span> becomes <span class="teal">a!!</span> and <span class="teal">aa</span> becomes
      <span class="teal">aa!</span>. Zeroes on the right never change the order (just like <code>1.5</code> and
      <code>1.50</code>), and now there is room to take the <i>average <span class="azure">weight</span></i> again.
    </p>
    ${boxes("a!!:invalid", "aa!:invalid", "ab!", "ad!", "ag!", "an!", "b!!")}
    <p>
      The value between <span class="teal">a!!</span> and <span class="teal">aa!</span> is <span class="teal">a!n</span>, and
      it can be used as the new position.
    </p>
    ${boxes("a!!", "a!n:reinserted", "aa!", "ab!", "ad!", "ag!", "an!", "b!!")}
    <p>
      The <span class="teal">reinsertion</span> cycle can start again <span class="azure">safely</span> 🔄.
      <br />
      Notice that the position got one digit longer to make room. This is very important in the ${new Link("maths")} chapter.
    </p>
  </section>
  <section class="text-block">
    <p>
      Most of the time, though, items are not reinserted but <b>stacked</b>: added at the start or the end of the list. Those
      don't need to take the middle of a gap at all.
    </p>
    <p>
      That's why a <i class="azure">Staquia position</i> is divided into ${new Link("segments")}: one to stack items without
      making them longer, and one for the reinsertions.
    </p>
  </section>
  ${new Note(`
    These examples use single letters to keep them short, so they run out of room after only <code>5</code> reinsertions.
    Real positions have many more digits, the ${new Link("maths")} chapter shows exactly how many reinsertions fit.`)}
  ${new Note(`
    This is only the basic idea, so don't worry if the positions Staquia generates look different. Two improvements are applied:
    <ul>
      <li>
        Trailing zeroes are dropped when they are not needed, so the positions stay short and the <span class="teal">string</span>
        comparison stays fast.
      </li>
      <li>
        A position is divided into ${new Link("segments")}, so the <span class="teal">reinsertion algorithm</span> is only used when
        it is really needed.
      </li>
    </ul>`)}
</article>`;
  }
}
