import Component from "../../component.ts";
import Link from "../../shared/link.ts";
import Note from "../../shared/note.ts";
import { lang } from "../../shared/lang.ts";
import StaquiaList from "../../shared/staquia-list.ts";
import { playgroundSystem, playgroundItemsCount } from "../../../data/examples.ts";

export default class Maths extends Component {
  render(): string {
    return `
<article id="page-maths">
  <h2>Maths</h2>
  <section class="text-block">
    <p>
      The ${new Link("segments")} chapter ended with a question: <i>how do you choose the best ${new Link("number-system")} for
      your needs?</i> The answer is <span class="teal">maths</span>!
      <br />
      As said all along the documentation, <span class="teal">positions</span> are just <span class="teal">numbers</span>, so it
      is possible to calculate exactly how much they can take.
    </p>
    <h3>Halves and Cakes</h3>
    <p>First, how many times can a gap be split in half before it runs out of room?</p>
    <p>
      Suppose you have a cake 🎂 cut in <code>16</code> equal slices, let's call this number <code>b</code>. You organize a race,
      and each competitor that reaches the goal gets half of the slices you have left. But the last slice is always yours.
    </p>
  </section>
  <section class="race-list__container">
    <div class="race-list">
      <div class="title">Competitors</div>
      <hr />
      <ul>
        <li>1st place gets <code>8</code> slices</li>
        <li>2nd place gets <code>4</code> slices</li>
        <li>3rd place gets <code>2</code> slices</li>
        <li>4th place gets <code>1</code> slice</li>
        <li>The last slice is yours 😋</li>
      </ul>
    </div>
  </section>
  <section class="text-block">
    <p>
      The cake lasted <code>4</code> places, since a slice can't be cut again. That limit will be called
      <code>h<sub>max</sub></code>, and it is calculated as <code>h<sub>max</sub> = ceil(log<sub>2</sub>(b))</code>.
    </p>
    <p>
      Each digit of <span class="z">Z</span> is a cake with <code>b</code> slices (the base of the system), and the slice you keep
      is the neighbor that already has that position. When <code>b</code> is not a power of <code>2</code> the halves can't be
      exact, so depending on the direction of the moves a digit lasts between <code>floor(log<sub>2</sub>(b))</code> and
      <code>ceil(log<sub>2</sub>(b))</code> halvings.
    </p>
  </section>
  <section class="text-block">
    <h3>Calculating the length</h3>
    <p>
      The length <code>l</code> of a position is the fixed length of the segment <span class="n">N</span>
      (<code>l<sub>n</sub></code>) plus the current length of the segment <span class="z">Z</span> (<code>Δl</code>):
      <br />
      <code>l = l<sub>n</sub> + Δl</code>
    </p>
    <p>
      The maximum length <code>l<sub>max</sub></code> is the length of <span class="n">N</span> plus the maximum length of
      <span class="z">Z</span> (<code>l<sub>z</sub></code>):
      <br />
      <code>l<sub>max</sub> = l<sub>n</sub> + l<sub>z</sub></code>
    </p>
  </section>
  <section class="text-block">
    <h3>Overflow</h3>
    <p>
      There is an <span class="teal">overflow</span> when there is no valid position to return: a generated position is longer
      than the maximum (<code>l &gt; l<sub>max</sub></code>), or <span class="n">N</span> is already at its last value for
      <code>next</code> (or its first one for <code>previous</code>). <span class="teal">Staquia</span> returns ${lang(`an
      <code class="ichor">OverflowError</code>`, { rust: `a <code class="ichor">PositionError::Overflow</code> (or
      <code class="ichor">EdgeReached</code> for <span class="n">N</span>)` })} so you can handle it.
    </p>
  </section>
  <section class="text-block">
    <h3>Threshold</h3>
    <p>
      Waiting for the overflow would be too late, so a <b>threshold</b> gives an early <span class="warn">warning</span>. It is
      set with the <span class="azure">factor kappa</span> (<code>fϰ</code>), a value from <code>0</code> to <code>1</code>:
      <br />
      <code>l<sub>ϰ</sub> = ceil((1 - fϰ) l<sub>max</sub>)</code>
    </p>
    <p>
      When a position's length <b>reaches</b> <code>l<sub>ϰ</sub></code>, the result fails with a
      ${lang(`<code class="ichor">ThresholdReachedError</code>`, { rust: `<code class="ichor">PositionError::ThresholdReached</code>` })}. The position is still valid and comes inside the error, but it is time
      to space the positions again (see ${new Link("error-handling")}).
    </p>
    <p>By default the <i class="teal">factor kappa</i> is <code>0.15</code>.</p>
  </section>
  <section class="text-block">
    <h3>How many moves fit in the same gap?</h3>
    <p>
      This is the number that really matters. Stacking with <span class="n">N</span> never makes positions longer, and moving
      items to <b>different</b> places doesn't add up either: <span class="z">Z</span> only grows when items are moved again and
      again into the <b>same gap</b>.
    </p>
    <p>
      Positions start with one digit in <span class="z">Z</span>, and the threshold is reached at <code>l<sub>ϰ</sub></code>, so
      <code>l<sub>ϰ</sub> - l<sub>n</sub> - 1</code> digits of <span class="z">Z</span> can be split before the warning. With
      the halvings of each digit, the moves into the same gap are between:
      <br />
      <code>floor(log<sub>2</sub>(b)) (l<sub>ϰ</sub> - l<sub>n</sub> - 1)</code> and
      <code>ceil(log<sub>2</sub>(b)) (l<sub>ϰ</sub> - l<sub>n</sub> - 1)</code>
    </p>
  </section>
  <section class="text-block">
    <h3>Playground</h3>
    <p>
      The list below uses a tiny system on purpose: the alphabet with <code>l<sub>n</sub> = 2</code> and
      <code>l<sub>z</sub> = 3</code>, so <code>l<sub>max</sub> = 5</code>, <code>l<sub>ϰ</sub> = ceil(0.85 × 5) = 5</code>, and only
      <code>4 (5 - 2 - 1) = 8</code> to <code>5 (5 - 2 - 1) = 10</code> moves fit into the same gap.
    </p>
    <p>
      Keep dropping items <b>right after the first one</b>. Each drop takes the middle of the same shrinking gap, so the position
      gets longer. When the threshold is reached, the list spaces every position again (the rows written jump for that move) and
      the cycle starts over. Stacking with the <b>+</b> button never makes positions longer.
    </p>
  </section>
  ${new StaquiaList({ system: playgroundSystem, count: playgroundItemsCount, caption: "Rows written in this playground" })}
  <section class="text-block">
    <h3>Example: the alphabet as a number system</h3>
    <p>
      The system used all along has the base <code>b = 27</code>, with the default lengths <code>l<sub>n</sub> = 5</code> and
      <code>l<sub>z</sub> = 15</code>. So:
    </p>
    <ul>
      <li><code>h<sub>max</sub> = ceil(log<sub>2</sub>(27)) = 5</code> halvings per digit at most.</li>
      <li>
        <code>l<sub>max</sub> = l<sub>n</sub> + l<sub>z</sub> = 5 + 15 = 20</code>, an
        <span class="azure">overflow</span> happens with positions longer than <code>20</code> characters.
      </li>
      <li>
        <code>l<sub>ϰ</sub> = ceil((1 - 0.15) 20) = 17</code>, the <span class="azure">threshold</span> is reached by positions
        with <code>17</code> characters.
      </li>
      <li>
        <code>4 (17 - 5 - 1) = 44</code> to <code>5 (17 - 5 - 1) = 55</code> moves fit into the same gap before the threshold.
      </li>
    </ul>
    <p>
      The default system has the base <code>1027</code>, so the same gap takes <code>110</code> to <code>121</code> moves. You
      can try other values in the ${new Link("setup", "Setup App")}.
    </p>
  </section>
  ${new Note(`
    Bigger is not always better! <code>h<sub>max</sub></code> grows with a
    <a href="https://en.wikipedia.org/wiki/Logarithm">logarithm</a>: fast at the start and very slowly later. A system with the
    base <code>b = 129</code> and another one with <code>b = 256</code> both have an <code>h<sub>max</sub></code> of
    <code>8</code>. Doubling the base adds only one halving per digit, while a longer <span class="z">Z</span> adds
    <code>h<sub>max</sub></code> halvings per digit.`)}
  ${new Note(`
    In maths and physics the "<span class="teal">Δ</span>" symbol is called <span class="teal">delta</span>, and it is used for
    values that change.`)}
  ${new Note(`
    Personally, I think this is the most challenging topic, and I tried my best to keep it simple. Take your time and read it as
    many times as you need before moving on.`)}
</article>`;
  }
}
