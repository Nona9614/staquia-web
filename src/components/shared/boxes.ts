import Component, { escape } from "../component.ts";

/**
 * What a row of boxes is for, which decides its size:
 * - `showcase`: a few big boxes where the comparison is the lesson (`a < ab < b`, `d + a = e`).
 * - `sequence`: a row of up to 8 boxes that must fit a phone without scrolling (the reinsertion steps).
 */
export type BoxesVariant = "showcase" | "sequence";

/** The colors a box can have, besides the default one. */
export type BoxModifier = "reinserted" | "invalid" | "number";

/** A box (`"a"`, or `["an", "reinserted"]` for a colored one), or an operator between boxes (`{ symbol: "+" }`). */
export type BoxItem = string | readonly [text: string, modifier: BoxModifier] | { symbol: string };

/** A row of letter boxes illustrating positions. */
export default class Boxes extends Component {
  readonly variant: BoxesVariant;
  readonly items: readonly BoxItem[];

  /**
   * @param variant - What the row is for, see `BoxesVariant`.
   * @param items - The boxes and operators, in order. The texts are escaped.
   */
  constructor(variant: BoxesVariant, items: readonly BoxItem[]) {
    super();
    this.variant = variant;
    this.items = items;
  }

  #item(item: BoxItem): string {
    if (typeof item === "string") return `<div class="box">${escape(item)}</div>`;
    if ("symbol" in item) return `<div class="box-symbol">${escape(item.symbol)}</div>`;
    const [text, modifier] = item;
    return `<div class="box box--${modifier}">${escape(text)}</div>`;
  }

  render(): string {
    return `<div class="box-container box-container--${this.variant}">${this.items.map((item) => this.#item(item)).join("")}</div>`;
  }
}
