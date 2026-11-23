import Component from "../../component.ts";
import ApiButton from "../../shared/api-button.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang, only } from "../../shared/lang.ts";
import SetupApp from "./setup-app.ts";
import SetupDisplayCodeBlock from "./setup-display-code-block.ts";

export default class Setup extends Component {
  render(): string {
    return `
<article id="page-setup">
  <h2>Setup</h2>
  <section class="text-block">
    <p>If you came this far in the documentation, a big thank you for taking the time to read everything 🎉❗</p>
    <p>Before choosing your own characters, keep in mind:</p>
    <ul>
      <li>
        The digits are compared by their <span class="azure">unicode</span> value, so use characters from the
        <a href="https://en.wikipedia.org/wiki/Plane_(Unicode)#Basic_Multilingual_Plane">Basic Multilingual Plane</a>
        (up to <code>U+FFFF</code>). That way JavaScript, UTF-8 and UTF-16 compare them in the same order.
      </li>
      <li>
        Avoid control characters <i>(like the <span class="azure">escape command <code>\\u001B</code></span>)</i>. If you can, use
        the unicode <a href="https://en.wikipedia.org/wiki/Private_Use_Areas">PUA</a> section.
      </li>
      <li>
        Positions read from outside with <code>forge</code> are validated, any character that is not a digit of your system fails
        with an <code class="ichor">InvalidCharacterError</code> (see ${new Link("error-handling")}).
      </li>
    </ul>
    <p>
      That validation is not a security measure, though. Staquia, or any library running in the <b>frontend</b>,
      <span class="ichor">cannot prevent</span> someone from changing a string to a <span class="ichor">malicious command</span>
      while it is sent to your server. <b>Always check</b> in your <b>backend</b> that a position <b>uses only the expected
      characters</b> before storing it, avoid attacks like
      <a href="https://www.w3schools.com/sql/sql_injection.asp">SQL Injection</a> with parameterized queries or a trusted
      <a href="https://stackoverflow.com/questions/1279613/what-is-an-orm-how-does-it-work-and-how-should-i-use-one">ORM</a>, or
      move your entire <span class="azure">Staquia</span> logic to the <b>backend</b>. Take the
      <span class="teal">cybersecurity</span> of your site seriously,
      <em><span class="ichor">bad security</span> = <span class="gold">money loss</span> 💸!</em>
    </p>
    <p>
      With that in mind, use the <span class="azure">Setup App</span> below to find the values that fit your application best.
      The formulas are explained in the ${new Link("maths")} chapter.
    </p>
  </section>
  ${new SetupApp()}
  <section class="text-block">
    <p>This is the <code>javascript</code> code for your number system:</p>
  </section>
  ${new SetupDisplayCodeBlock()}
  ${only("rust", `${new Note(`
    <b>In Rust, <code>ln + lz</code> can be at most <code>32</code></b> (<code>staquia::MAX_LENGTH</code>), and
    <code>Staquia::create</code> returns a <code>CreateError</code> above it. A Rust <code>Position</code> keeps its digits in a
    fixed array of <code>32</code> instead of a heap allocated string: it is a small <code>Copy</code> value (<code>84</code>
    bytes) that never allocates, which keeps creating and comparing positions cheap.
    <br />
    <br />
    <code>32</code> is more than real lists need:
    <ul>
      <li>The default system uses <code>20</code> (<code>ln = 5</code>, <code>lz = 15</code>), so it already has room to spare.</li>
      <li>
        <span class="n">N</span> never runs out in practice: with <code>ln = 5</code> the default system stacks about
        <code>5.7 × 10<sup>14</sup></code> items in each direction.
      </li>
      <li>
        A longer <span class="z">Z</span> only allows more moves into the <b>same gap</b>: <code>121</code> with the default
        <code>20</code>, <code>242</code> with <code>32</code>. Any limit is reached at some point, and then the list is rebalanced,
        which is a single transaction that keeps the order.
      </li>
      <li>
        Every digit is stored in your database and its index: a digit takes up to <code>3</code> bytes in UTF-8 (<code>2</code>
        with the default digits), so a position of <code>32</code> digits can take <code>96</code> bytes.
      </li>
    </ul>
    Only a very small base (a few digits) gains much from longer positions, and a bigger base is the better fix there.
    The sliders above go further because the JavaScript library has no fixed array.`)}`)}
  ${new Note(`
    Changing the configuration of a system that already has stored positions changes the meaning of their digits. To migrate
    them, read the rows sorted by their old position, clear their positions and load them into a list of the new system with
    ${lang("the <code>untrusted</code> option", { rust: "<code>set_untrusted</code>" })}: every row gets a new position keeping the same order.`)}
  <section class="text-block">
    <h3>Thank you and Summary</h3>
    <p>
      I can't thank you enough for reading this far! For deeper information about the classes and functions, or to see the actual
      code, go to the ${new ApiButton()} documentation.
    </p>
  </section>
</article>`;
  }
}
