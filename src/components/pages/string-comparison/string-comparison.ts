import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import Boxes from "../../shared/boxes.ts";

export default class StringComparison extends Component {
  render(): string {
    return `
<article class="article" id="page-string-comparison">
  <h2 class="article__title">Strings and Comparison</h2>
  <section class="text-block">
    <p>
      This algorithm relies on how programming languages <b>compare strings</b>. Each character has a number in the
      <a href="https://en.wikipedia.org/wiki/Unicode">Unicode</a> standard, and two characters are compared by those numbers.
      They are usually written in <a href="https://en.wikipedia.org/wiki/Hexadecimal">hexadecimal</a>, like the
      <a href="https://www.w3schools.com/colors/colors_hexadecimal.asp"><span class="ichor">R</span><span class="teal">G</span><span class="azure">B</span></a>
      colors.
    </p>
  </section>
  ${new CodeBlock("string-comparison", "javascript", String.raw`
    // "a" is the unicode character "a", its number is 0x61
    let a = "a";
    // "z" is the unicode character "z", its number is 0x7A
    let z = "z";
    // Prints true, as 0x61 < 0x7A
    console.log(a < z);
  `)}
  <section class="text-block">
    <p>
      So <code>a</code> and <code>z</code> can be treated as numbers. They will become the digits of a ${new Link("number-system")},
      and their place in it is decided by their unicode number. From now on that value will be called their
      <i class="azure">weight</i>.
    </p>
    <p>
      When a string has many characters, they are compared one by one, <b>left to right</b>, and the <b>first different
      character</b> decides which string is bigger. The rest of the string doesn't matter.
    </p>
    <p>
      Comparing <span class="teal">a</span> and <span class="teal">ab</span>, the first character is the same <b>"a"</b>, so the
      next one is checked. <i>a</i> has no second character, and a missing character weighs less than any character, so
      <span class="teal">ab</span> is bigger. But <span class="teal">b</span> is bigger than <span class="teal">ab</span>,
      because its first character <i>b</i> already weighs more than <i>a</i>.
    </p>
  </section>
  ${new Boxes("showcase", ["a", { symbol: "<" }, "ab", { symbol: "<" }, "b"])}
  <section class="text-block">
    <p>The next chapter shows how all of this is used to create a ${new Link("number-system")}.</p>
  </section>
  ${new Note(`When comparing <i>strings</i>, <span class="azure">the length is not important, the position of each character is</span>.`)}
  ${new Note(`
    Databases compare strings too, but many of them ignore symbols or the letter case by default. Positions must be compared
    <b>byte by byte</b> (a binary collation) so the database order matches the library order. The ${new Link("database")}
    chapter shows how.`)}
</article>`;
  }
}
