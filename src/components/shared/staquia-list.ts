import Staquia from "staquia";
import Component, { escape } from "../component.ts";
import { examples, exampleSystem, initialItemsCount, type ExampleSystem } from "../../data/examples.ts";
import { stack, type ListItem } from "../../services/items.service.ts";
import { StaquiaList as Contract } from "../../contract.ts";

/** Options of a `<staquia-list>`. */
export interface StaquiaListOptions {
  /** The number system of the list, the main example system by default. */
  system?: Readonly<ExampleSystem>;
  /** How many items the list starts with. */
  count?: number;
  /** A caption above the write counter. */
  caption?: string;
}

/**
 * The markup of the `<staquia-list>` custom element: a sortable list where every item shows its position,
 * and a counter comparing the rows written by Staquia with the rows an integer index would write.
 *
 * @remarks
 * The items are rendered at build time so the list is visible before (and without) the script.
 * The element definition (in `hydration/`) takes over this light DOM when it upgrades: it reads the
 * system from its attribute, the items from their `id`/`position` attributes, and clones the
 * `<template>` for new ones.
 */
export default class StaquiaList extends Component {
  readonly system: Readonly<ExampleSystem>;
  readonly items: readonly ListItem[];
  readonly caption: string;

  /** @param options - The list options. */
  constructor(options: StaquiaListOptions = {}) {
    super();
    this.system = options.system ?? exampleSystem;
    this.caption = options.caption ?? "Rows written to the database";
    const { zero, first, last, ln, lz, fϰ } = this.system;
    this.items = stack(Staquia.create(zero, first, last, ln, lz, fϰ), examples, options.count ?? initialItemsCount);
  }

  /** Renders one item; with no item it renders the empty shape used by the `<template>`. */
  static item(item?: ListItem): string {
    const data = item ? ` ${Contract.id.attr(item.id)} ${Contract.position.attr(item.position)}` : "";
    const { text, emoji, position } = Contract.fields;
    return `
<li class="${Contract.item.name}"${data}>
  <div class="sortable-box sortable__item">
    <span class="sortable__item__header" ${Contract.field.attr(text)}>${item ? escape(item.text) : ""}</span>
    <i ${Contract.field.attr(emoji)}>${item ? escape(item.emoji) : ""}</i>
    <span class="sortable__item__footer" ${Contract.field.attr(position)}>${item ? escape(item.position) : ""}</span>
  </div>
</li>`;
  }

  /** The table comparing the rows written by Staquia and by an integer index. */
  #counter(): string {
    const { count, counts } = Contract;
    return `
  <div class="writes" aria-live="polite">
    <table class="writes__table">
      <caption>${escape(this.caption)}</caption>
      <thead>
        <tr><th></th><th>Staquia</th><th>Integer index</th></tr>
      </thead>
      <tbody>
        <tr><th>Last change</th><td ${count.attr(counts.lastStaquia)}>0</td><td ${count.attr(counts.lastIndex)}>0</td></tr>
        <tr><th>Total</th><td ${count.attr(counts.totalStaquia)}>0</td><td ${count.attr(counts.totalIndex)}>0</td></tr>
      </tbody>
    </table>
    <p class="writes__message" ${count.attr(counts.message)}>Drag an item or add a new one.</p>
  </div>`;
  }

  render(): string {
    return `
<${Contract.tag} class="sortable-items__container" ${Contract.system.attr(JSON.stringify(this.system))}>
  <ul class="${Contract.list.name}">
    <li class="sortable__adder__container">
      <button type="button" ${Contract.action.attr(Contract.actions.add)} aria-label="add" class="sortable-box sortable__adder">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z"></path>
        </svg>
      </button>
    </li>
    ${this.items.map((item) => StaquiaList.item(item)).join("")}
  </ul>${this.#counter()}
  <template>${StaquiaList.item()}</template>
</${Contract.tag}>`;
  }
}
