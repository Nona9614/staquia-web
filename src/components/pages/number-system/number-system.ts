import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import AlphabeticalLetters from "./alphabetical-letters.ts";

export default class NumberSystem extends Component {
  render(): string {
    return `
<article id="page-number-system">
  <h2>Number System</h2>
  <section class="text-block">
    <p>
      To take advantage of string comparison, Staquia builds a <b class="azure">lexicographic</b> <b>number system</b>: a system
      where the digits are characters. Using characters instead of <code>0</code> to <code>9</code> gives a much bigger
      <b>set</b> of digits, so big numbers can be written with very few characters.
    </p>
    <p>A Staquia number system follows these rules, or better said, <a href="https://en.wikipedia.org/wiki/Axiom">axioms</a>:</p>
    <ul class="list">
      <li class="list__item">It has a zero digit called <code>zero</code>.</li>
      <li class="list__item">It has a first digit called <code>first</code> and a last digit called <code>last</code>.</li>
      <li class="list__item">Their unicode values must be <code>zero</code> &lt; <code>first</code> &lt; <code>last</code>.</li>
      <li class="list__item">
        The digits are the <code>zero</code> plus every character from <code>first</code> to <code>last</code>, so the set
        contains at least <b>3</b> digits.
      </li>
      <li class="list__item">
        The number of digits, <b>including the zero</b>, is the <code>base</code> of the system:
        <code style="text-wrap: nowrap;">b = (last - first) + 2</code>
      </li>
      <li class="list__item list__item--invalid"><span class="ichor">No</span> negative numbers exist.</li>
      <li class="list__item">
        The <code>middle</code> digit is the one in the middle of the set, rounded upwards:
        <code style="text-wrap: nowrap;">middle = ceil((first + last - 1) / 2)</code>
      </li>
    </ul>
  </section>
  ${new AlphabeticalLetters()}
  <section class="text-block">
    <p>
      With <code>!</code> as the zero and the letters from <code>a</code> to <code>z</code>, this is a base <code>27</code>
      system and its <code>middle</code> digit is <code>m</code>. A word is just a number written with these digits:
    </p>
  </section>
  ${new CodeBlock("number-system-txurn", "javascript", `
    // t = 20, x = 24, u = 21, r = 18 and n = 14, so "txurn" is the number
    // 20 × 27⁴ + 24 × 27³ + 21 × 27² + 18 × 27¹ + 14 × 27⁰ = 11 117 021
    // Eight digits in base 10, only five in base 27
    let number = "txurn";
  `, { rust: `
    // t = 20, x = 24, u = 21, r = 18 and n = 14, so "txurn" is the number
    // 20 × 27⁴ + 24 × 27³ + 21 × 27² + 18 × 27¹ + 14 × 27⁰ = 11 117 021
    // Eight digits in base 10, only five in base 27
    let number = "txurn";
  ` })}
  <section class="text-block">
    <p>
      If this doesn't make sense yet, don't worry. Keep reading, the next chapter shows how these numbers are used as
      ${new Link("positions")}.
    </p>
  </section>
  ${new Note(`
    For simplicity, all the next examples use this alphabetical system. Real applications use a much wider range of characters.
    <br />
    <br />
    For example, the default system of <span class="azure">Staquia</span> uses:
    <ul>
      <li><code>!</code> (<code>\\u0021</code>) as the <code>zero</code></li>
      <li><code>°</code> (<code>\\u00B0</code>) as the <code>first</code> digit</li>
      <li><code>ұ</code> (<code>\\u04B1</code>) as the <code>last</code> digit</li>
    </ul>
    That is a base <code>1027</code> system.`)}
</article>`;
  }
}
