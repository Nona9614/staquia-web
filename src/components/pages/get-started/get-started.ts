import Component from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import Link from "../../shared/link.ts";
import DocsButton from "../../shared/docs-button.ts";
import ApiButton from "../../shared/api-button.ts";
import StaquiaList from "../../shared/staquia-list.ts";
import { version } from "../../../data/app.ts";
import { languages } from "../../../data/languages.ts";
import { lang, only } from "../../shared/lang.ts";

export default class GetStarted extends Component {
  render(): string {
    return `
<article id="page-get-started">
  <h1>Reorder anything. <span class="azure">Save one row.</span></h1>
  <section class="text-block" style="text-align: center;">
    <p>
      <span class="azure">Staquia</span> gives every item of a list a short <span class="teal">position</span> string. Sort by it and
      you get the order back. Move an item and <b>only that item</b> changes, its neighbors are never touched.
    </p>
    <p>Try it: drag the items, add new ones, and compare the rows each approach would write.</p>
  </section>
  ${new StaquiaList()}
  <section class="text-block">
    <p>
      The text at the bottom of each item is its <b>position</b>. Sort the positions as plain strings and you get exactly the order you
      see. With an <i>integer index</i> column (<code>0, 1, 2…</code>) every item between the old and the new place must be rewritten,
      Staquia only rewrites the moved one.
    </p>
    <p>
      Why not floats, gaps like <code>1000, 2000…</code> or another library? See ${new Link("why-staquia")}. Storing it? See the
      ${new Link("database")} chapter.
    </p>
  </section>
  <section class="text-block">
    <h3>Install</h3>
  </section>
  ${new CodeBlock("install-npm", "bash", `
    # Install it with npm (or pnpm, yarn...)
    npm install staquia@${version}
  `, { rust: { language: "bash", code: `
    # Add the crate to Cargo.toml
    cargo add staquia@${languages.rust.version}
  ` } })}
  ${only("javascript", `
  <section class="text-block">
    <p>The library has <b>zero dependencies</b> and is shipped as an <b>ES module</b>. In the browser you can also import it directly from a CDN:</p>
  </section>
  ${new CodeBlock("install-cdn", "html", `
    <script type="module">
      import Staquia, { LexicalList } from "https://cdn.jsdelivr.net/npm/staquia@${version}/+esm";
    </script>
  `)}`)}
  ${only("rust", `
  <section class="text-block">
    <p>
      The crate has <b>zero dependencies</b> and no <code>unsafe</code> code. It creates <b>the same positions</b> as the
      JavaScript library, so a Rust server and a JavaScript app can share the same rows.
    </p>
  </section>`)}
  <section class="text-block">
    <h3>Quick start</h3>
    <p>
      Give each item a <span class="teal">position</span> and let a <code>LexicalList</code> keep them in sync${lang("", { rust: ` (your type
      implements the <code>Item</code> trait)` })}:
    </p>
  </section>
  ${new CodeBlock("quick-start", "javascript", `
    import Staquia, { LexicalList } from "staquia";

    // The default number system, ready for production
    const system = Staquia.default();
    const list = new LexicalList(system);

    // Any object with an "id" and a "position" field
    const milk = { id: 1, text: "Milk", position: "" };
    const meat = { id: 2, text: "Meat", position: "" };
    const bread = { id: 3, text: "Bread", position: "" };
    list.push(milk);
    list.push(meat);
    list.push(bread);

    // Move the bread between the milk and the meat
    const moved = list.move(3, 1, 2);
    if (moved.ok) {
      // Only bread.position changed, save only that item
    }
  `, { rust: `
    use staquia::{Item, LexicalList, Position, Staquia};

    // Any type with an id and a position field
    struct Product {
        id: u32,
        text: String,
        position: String,
    }

    impl Item for Product {
        type Id = u32;
        fn id(&self) -> &u32 { &self.id }
        fn position(&self) -> &str { &self.position }
        fn set_position(&mut self, position: &Position) { self.position = position.to_string(); }
    }

    fn main() -> Result<(), staquia::Error<u32>> {
        // The default number system, ready for production
        let system = Staquia::default();
        let mut list = LexicalList::new(system);

        list.push(Product { id: 1, text: "Milk".into(), position: String::new() })?;
        list.push(Product { id: 2, text: "Meat".into(), position: String::new() })?;
        list.push(Product { id: 3, text: "Bread".into(), position: String::new() })?;

        // Move the bread between the milk and the meat
        let moved = list.move_to(&3, Some(&1), Some(&2))?;
        // Only the bread's position changed, save only that item
        println!("{}", moved.value().position);
        Ok(())
    }
  ` })}
  <section class="text-block">
    <p>
      To understand how it works, continue with the ${new Link("introduction")} chapter or open the ${new DocsButton()} from here.
      Tune the number system for your app with the ${new Link("setup", "Setup App")}, and for every class and function check the
      ${new ApiButton()} reference.
    </p>
  </section>
</article>`;
  }
}
