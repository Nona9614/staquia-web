import Component from "../../component.ts";
import Link from "../../shared/link.ts";

export default class Positions extends Component {
  render(): string {
    return `
<article id="page-positions">
  <h2>Positions</h2>
  <section class="text-block">
    <p>
      This chapter starts with something that may sound obvious: <span class="teal">numbers</span> exist to count and enumerate
      things. Before you say <i>"Isn't that obvious!"</i>, it is mentioned to not forget how powerful they are for <b>sorting</b>.
    </p>
    <p>
      Whenever you need a list, <span class="teal">numbers</span> are there to give each item its <i class="teal">position</i>.
    </p>
    <p>
      So, with the ${new Link("number-system")} from the previous chapter, from now on our <span class="teal">numbers</span> will
      also be called <span class="teal">positions</span>. You may have done this before without noticing, like in a market list:
    </p>
  </section>
  <section class="market-list__container">
    <div class="market-list">
      <div class="title">To buy in the market</div>
      <ol class="list" type="a">
        <li>🥛 Milk</li>
        <li>🥩 Meat</li>
        <li>🍞 Bread</li>
      </ol>
    </div>
  </section>
  <section class="text-block">
    <p>
      In this list the letters work like numbers to <b>sort</b> the items. Adding an item at the end is easy, it takes the next
      letter. But what if an item must be <i>prioritized</i> over another one?
      <br />
      Then the <span class="teal">positions</span> must be reassigned and the items reordered.
    </p>
    <p>The next chapter, ${new Link("reinsertions")}, shows why that is more complex than it sounds.</p>
  </section>
</article>`;
  }
}
