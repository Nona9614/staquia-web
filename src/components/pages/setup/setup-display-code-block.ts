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
    // Placeholders like __ln__ are highlighted as identifiers (or inside strings), then replaced by bound values
    const bind = (html: string) =>
      html
        .replace(/<span class="(?:variable|constant)">__([\wϰ-]+)__<\/span>/gu, (_, key: string) => `<span class="number" ${SetupApp.bind.attr(key)}>${escape(values[key]!)}</span>`)
        .replace(/__([\wϰ-]+)__/gu, (_, key: string) => `<span ${SetupApp.bind.attr(key)}>${escape(values[key]!)}</span>`);

    return `${new CodeBlock(
      "setup-display",
      "javascript",
      `
      import Staquia from "staquia";

      // System resilience:
      // lmax = __lmax__ (overflow above this length)
      // lϰ = __lϰ__ (threshold at this length)
      // hmax = __hmax__ (halvings per digit)
      // __gap-min__ to __gap-max__ moves fit into the same gap
      const system = Staquia.create(
        "__zero__", // zero
        "__first__", // first
        "__last__", // last
        __ln__, // ln
        __lz__, // lz
        __fϰ__, // fϰ
      );
      `,
      bind,
    )}`;
  }
}
