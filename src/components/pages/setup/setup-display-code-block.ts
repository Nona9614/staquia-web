import Component, { escape } from "../../component.ts";
import CodeBlock from "../../shared/code-block.ts";
import { setupDefaults, type SetupValues } from "../../../data/setup.ts";
import { bindings } from "../../../services/setup.service.ts";
import { SetupApp } from "../../../contract.ts";

/**
 * The code generated from the Setup App values.
 *
 * @remarks Every value lives in a `SetupApp.bind` element (see `contract.ts`) so the script can update it.
 */
export default class SetupDisplayCodeBlock extends Component {
  readonly values: Readonly<SetupValues>;

  /** @param values - The values the code renders with, the defaults by default. */
  constructor(values: Readonly<SetupValues> = setupDefaults) {
    super();
    this.values = values;
  }

  render(): string {
    const values = bindings(this.values);
    const bound = (key: string, kind = "") => `<span${kind ? ` class="${kind}"` : ""} ${SetupApp.bind.attr(key)}>${escape(values[key]!)}</span>`;
    // Placeholders like __ln__ are highlighted as identifiers (or inside strings), then replaced by bound values.
    // Rust chars ('__rust_zero__') are not char literals for the highlighter, so they are colored as strings here.
    const bind = (html: string) =>
      html
        .replace(/'<span class="variable">__(rust_\w+)__<\/span>'/g, (_, key: string) => `<span class="string">'${bound(key)}'</span>`)
        .replace(/<span class="(?:variable|constant)">__([\wϰ-]+)__<\/span>/gu, (_, key: string) => bound(key, "number"))
        .replace(/__([\wϰ-]+)__/gu, (_, key: string) => bound(key));
    const resilience = `
      // System resilience:
      // lmax = __lmax__ (overflow above this length)
      // lϰ = __lϰ__ (threshold at this length)
      // hmax = __hmax__ (halvings per digit)
      // __gap__ moves fit into the same gap`;
    const presetCode = new CodeBlock(
      "setup-display-preset",
      "javascript",
      `
      import Staquia from "staquia";
      ${resilience}
      const system = Staquia.__js_preset__({ ln: __ln__, lz: __lz__, fϰ: __fϰ__ });
      `,
      {
        transform: bind,
        rust: `
      use staquia::{Options, Staquia};
      ${resilience}
      let system = Staquia::create_with_options(Options {
          ln: __ln__,
          lz: __lz__,
          threshold: __rust_threshold__,
          ..Options::__rust_preset__()
      })?;
      `,
      },
    );
    // A preset shows its method, a custom range `Staquia.create` with every character
    const preset = this.values.preset !== "";
    return `
    <div ${SetupApp.mode.attr("preset")}${preset ? "" : " hidden"}>${presetCode}</div>
    <div ${SetupApp.mode.attr("range")}${preset ? " hidden" : ""}>${new CodeBlock(
      "setup-display",
      "javascript",
      `
      import Staquia from "staquia";
      ${resilience}
      const system = Staquia.create(
        "__zero__", // zero
        "__first__", // first
        "__last__", // last
        __ln__, // ln
        __lz__, // lz
        __fϰ__, // fϰ
      );
      `,
      {
        transform: bind,
        rust: `
      use staquia::Staquia;
      ${resilience}
      let system = Staquia::create(
          '__rust_zero__', // zero
          '__rust_first__', // first
          '__rust_last__', // last
          __ln__, // ln
          __lz__, // lz
          __rust_threshold__, // fϰ
      )?;
      `,
      },
    )}</div>`;
  }
}
