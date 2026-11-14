import Component, { escape } from "../../component.ts";
import { setupDefaults, type SetupValues } from "../../../data/setup.ts";
import { SetupApp as Contract } from "../../../contract.ts";

/**
 * The Setup App form.
 *
 * @remarks
 * Every input has a `name` equal to its `SetupValues` key so the script can read, sync and reset them.
 * Live values are shown in `SetupApp.bind` elements (see `contract.ts`).
 */
export default class SetupApp extends Component {
  readonly values: Readonly<SetupValues>;

  /** @param values - The values the form renders with, the defaults by default. */
  constructor(values: Readonly<SetupValues> = setupDefaults) {
    super();
    this.values = values;
  }

  #character(name: "zero" | "first" | "last"): string {
    return `
    <label for="setup-${name}">
      <span>${name}</span>
      <input id="setup-${name}" name="${name}" type="text" value="${escape(this.values[name])}" />
    </label>`;
  }

  #slider(name: "base" | "ln" | "lz" | "fϰ", min: number, max: number, step?: number): string {
    return `
    <label for="setup-${name}"> ${name} = <span ${Contract.bind.attr(name)}>${this.values[name]}</span> </label>
    <input id="setup-${name}" name="${name}" type="range" min="${min}" max="${max}"${step ? ` step="${step}"` : ""} value="${this.values[name]}" />`;
  }

  render(): string {
    return `
<form id="${Contract.form.name}" class="setup-calculator">
  <div class="setup-calculator__characters">${this.#character("zero")}${this.#character("first")}${this.#character("last")}
  </div>
  <div class="setup-calculator__sliders">${this.#slider("base", 4, 1537)}${this.#slider("ln", 4, 18)}${this.#slider("lz", 8, 38)}${this.#slider("fϰ", 0.1, 0.85, 0.05)}
  </div>
  <menu class="setup-calculator__menu">
    <button type="reset" class="setup-calculator__reset">Reset Defaults</button>
  </menu>
</form>`;
  }
}
