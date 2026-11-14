import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import Boxes from "../../shared/boxes.ts";

export default class Segments extends Component {
  render(): string {
    return `
<article id="page-segments">
  <h2>Segments</h2>
  <section class="text-block">
    <p>
      The ${new Link("reinsertions")} algorithm makes positions longer each time it is used. But most of the time items are just
      <b>stacked</b> at the start or the end of a list, and that shouldn't make positions longer.
    </p>
    <p>
      So a Staquia position is divided into two <span class="teal">segments</span>, one for each job. It looks like
      <span class="n">nnnnn</span><span class="z">z…</span>: the first <code>ln</code> characters are the segment
      <span class="n">N</span> and the rest is the segment <span class="z">Z</span>.
    </p>
  </section>
  ${new CodeBlock("segments-shape", "javascript", `
    import Staquia from "staquia";

    // The alphabet: zero "!", digits "a" to "z", ln = 5, lz = 15
    const system = Staquia.create("!", "a", "z", 5, 15, 0.15);

    // The first position: N is the middle digit repeated, Z is a zero
    const start = system.start(); // "mmmmm!" → N = "mmmmm", Z = "!"
  `)}
  <section class="text-block">
    <h3>Segment <span class="n">N</span></h3>
    <p>
      The segment <span class="n">N</span> has a <b>fixed length</b> (<code>ln</code>, <code>5</code> by default) and works like a
      short integer. Stacking an item after another one is just adding <code>1</code>, and stacking it before is subtracting
      <code>1</code>, so the position never gets longer.
    </p>
    <p>
      For instance, <code>1</code> in this system is <span class="teal">a</span>. Moving forward one position from
      <span class="teal">d</span> looks like this:
    </p>
    ${new Boxes("showcase", ["d", { symbol: "+" }, ["a", "number"], { symbol: "=" }, "e"])}
    <p>And moving backwards is subtracting <code>1</code>:</p>
    ${new Boxes("showcase", ["d", { symbol: "-" }, ["a", "number"], { symbol: "=" }, "c"])}
    <p>With unicode values it would look like this:</p>
  </section>
  ${new CodeBlock("segment-n-arithmetic", "javascript", `
    // The unicode number of "d"
    let d = "d".charCodeAt(0);
    // Add 1 and turn it back into a string
    let e = String.fromCharCode(d + 1);
    console.log(e); // "e", the next character after "d"
    // Subtract 1 and turn it back into a string
    let c = String.fromCharCode(d - 1);
    console.log(c); // "c", the previous character before "d"
  `)}
  <section class="text-block">
    <p>Staquia does the same over the whole segment, carrying to the next digit when needed:</p>
  </section>
  ${new CodeBlock("segment-n-staquia", "javascript", `
    system.next(start); // "mmmmn!"
    system.previous(start); // "mmmml!"

    // The start is the middle of N, so there is room to stack on both sides
    system.next(system.forge("!!!!a")); // "!!!!b!"
  `)}
  <section class="text-block">
    <p>
      Since <span class="n">N</span> has a fixed length, it has a last value (<span class="teal">zzzzz</span>) and a first one
      (<span class="teal">!!!!!</span>). Stacking past them fails with an <code class="ichor">OverflowError</code>, see
      ${new Link("error-handling")}.
    </p>
    <p>
      When a shorter string is turned into a position with <code>forge</code>, <span class="n">N</span> is completed with zeroes
      <b>to the right</b>: <span class="teal">d</span> becomes <span class="teal">d!!!!</span>. As the ${new Link("reinsertions")}
      chapter showed, zeroes on the right keep the order of the strings.
    </p>
  </section>
  <section class="text-block">
    <h3>Segment <span class="z">Z</span></h3>
    <p>This is the segment where the <span class="teal">reinsertion algorithm</span> is used.</p>
    <p>
      Its length is <b>flexible</b>, up to <code>lz</code> digits (<code>15</code> by default). It grows when there is no room left
      between two positions, and shrinks when its trailing zeroes can be dropped.
    </p>
    <p>
      The <i>average weight</i> of two numbers is their sum divided by <code>2</code>, rounding upwards:
    </p>
    ${new Boxes("showcase", ["a", { symbol: "+" }, "z", { symbol: "/" }, ["2", "number"], { symbol: "=" }, "n"])}
    <p>With unicode values:</p>
  </section>
  ${new CodeBlock("segment-z-average", "javascript", `
    let a = "a".charCodeAt(0);
    let z = "z".charCodeAt(0);
    // Sum both values, divide them by 2 and round upwards
    let average = Math.ceil((a + z) / 2);
    console.log(String.fromCharCode(average)); // "n", the middle of "a" and "z"
  `)}
  <section class="text-block">
    <p>
      In Staquia the function that finds a position between two others is <code>core</code>. When <span class="n">N</span> still
      has room between them it is used first, and only adjacent positions need <span class="z">Z</span>:
    </p>
  </section>
  ${new CodeBlock("segment-z-core", "javascript", `
    // There is room in N between "a!!!!!" and "b!!!!!"
    system.core(system.forge("a"), system.forge("b")); // "ammmn!"

    // "mmmmm!" and "mmmmn!" are adjacent, Z takes the middle
    system.core(start, system.next(start)); // "mmmmmn"
  `)}
  <section class="text-block">
    <h3>Summary</h3>
    <p>
      <span class="n">N</span> stacks items fast and without growing, <span class="z">Z</span> makes room for the reinsertions.
      But how do you choose the best ${new Link("number-system")} for your needs? The next chapter, ${new Link("maths")}, shows how
      to measure it.
    </p>
  </section>
  ${new Note(`
    The default <span class="teal">Staquia</span> ${new Link("number-system")} uses:
    <ul>
      <li><code>5</code> digits for the segment <span class="n">N</span></li>
      <li>Up to <code>15</code> digits for the segment <span class="z">Z</span></li>
    </ul>`)}
</article>`;
  }
}
