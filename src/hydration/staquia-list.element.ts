import Staquia from "staquia";
import Sortable from "sortablejs";
import ListStore, { type ListChange } from "../stores/list.store.ts";
import WritesStore from "../stores/writes.store.ts";
import { createItem, type ListItem } from "../services/items.service.ts";
import { countWrites, type WriteEvent } from "../services/writes.service.ts";
import { examples, exampleSystem, type ExampleSystem } from "../data/examples.ts";
import { StaquiaList } from "../contract.ts";

const { list: listClass, item: itemClass, id, position, field, fields, action, actions, system, written, count, counts } = StaquiaList;

/** An item element (the "add" button is not an item, it has no id). */
const ITEM = itemClass.selector + id.selector;

/** How long the written items stay highlighted. */
const WRITTEN_DURATION = 900;

/**
 * `<staquia-list>`: a sortable list where every item shows its Staquia position.
 *
 * @remarks
 * It upgrades the light DOM rendered at build time: the system is read from its attribute, the items
 * from their `id` and `position` attributes, and new items are cloned from its `<template>`. SortableJS
 * moves the elements, a `LexicalList` (in the `ListStore`) gives the moved item its new position, and
 * the counter compares the rows written with the rows an integer index would write.
 */
export default class StaquiaListElement extends HTMLElement {
  #store?: ListStore;
  #writes = new WritesStore();
  #sortable?: Sortable;
  #list?: HTMLUListElement;
  #template?: HTMLTemplateElement;

  connectedCallback(): void {
    // Already hydrated (the element was moved in the DOM)
    if (this.#store) return;
    const list = this.querySelector<HTMLUListElement>(listClass.selector);
    const template = this.querySelector<HTMLTemplateElement>("template");
    if (!list || !template) return;
    this.#list = list;
    this.#template = template;

    const { zero, first, last, ln, lz, fϰ } = this.#system();
    this.#store = new ListStore(Staquia.create(zero, first, last, ln, lz, fϰ));
    const loaded = this.#store.load(this.#read());
    if (!loaded.ok) {
      console.error(`${StaquiaList.tag}: the items could not be loaded`, loaded.error);
      return;
    }
    this.#apply(loaded);

    this.#sortable = Sortable.create(list, {
      draggable: ITEM,
      animation: 150,
      easing: "cubic-bezier(1, 0, 0, 1)",
      // Never drop an item before the "add" button
      onMove: (event) => event.related.matches(ITEM),
      onEnd: (event) => {
        if (event.oldDraggableIndex === undefined || event.newDraggableIndex === undefined) return;
        if (event.oldDraggableIndex === event.newDraggableIndex) return;
        this.#drop(event.item, event.oldDraggableIndex, event.newDraggableIndex);
      },
    });

    this.querySelector(action.is(actions.add))?.addEventListener("click", this.#add);
  }

  disconnectedCallback(): void {
    if (this.isConnected) return;
    this.#sortable?.destroy();
    this.#sortable = undefined;
    this.querySelector(action.is(actions.add))?.removeEventListener("click", this.#add);
    this.#store = undefined;
  }

  /** The number system from the element attribute, the main example system if it is missing or invalid. */
  #system(): Readonly<ExampleSystem> {
    try {
      const value = this.dataset[system.key];
      return value ? (JSON.parse(value) as ExampleSystem) : exampleSystem;
    } catch {
      return exampleSystem;
    }
  }

  /** Writes a field of an item element. */
  #write(element: Element, name: keyof typeof fields, value: string): void {
    const target = element.querySelector(field.is(fields[name]));
    if (target) target.textContent = value;
  }

  /** Reads a field of an item element. */
  #field(element: Element, name: keyof typeof fields): string {
    return element.querySelector(field.is(fields[name]))?.textContent ?? "";
  }

  /** Reads the items rendered in the HTML, in order. */
  #read(): ListItem[] {
    return [...this.#list!.querySelectorAll<HTMLElement>(ITEM)].map((element) => ({
      id: Number(element.dataset[id.key]),
      position: element.dataset[position.key] ?? "",
      text: this.#field(element, "text"),
      emoji: this.#field(element, "emoji"),
    }));
  }

  /** Gets the id of an item element, `undefined` for anything else (like the "add" button). */
  #id(element: Element | null): number | undefined {
    return element instanceof HTMLElement && element.matches(ITEM) ? Number(element.dataset[id.key]) : undefined;
  }

  /** Gives the dropped item its new position from its new neighbors. */
  #drop(element: HTMLElement, from: number, to: number): void {
    const moved = this.#id(element);
    if (moved === undefined) return;
    const change = this.#store!.move(moved, this.#id(element.previousElementSibling), this.#id(element.nextElementSibling));
    if (!change.ok) {
      console.error(`${StaquiaList.tag}: the item could not be moved`, change.error);
      this.#restore();
      return;
    }
    this.#apply(change);
    const text = this.#store!.get(moved)?.text ?? "";
    const kind = change.rebalanced ? "rebalance" : "move";
    this.#count({ kind, text, from, to, written: change.affected.length });
  }

  /** Stacks a new random item at the end. */
  #add = (): void => {
    const store = this.#store!;
    const item = createItem(store.nextId(), examples, Math.random());
    const change = store.add(item);
    if (!change.ok) {
      console.error(`${StaquiaList.tag}: the item could not be added`, change.error);
      return;
    }
    const fragment = this.#template!.content.cloneNode(true) as DocumentFragment;
    const element = fragment.querySelector<HTMLElement>(itemClass.selector)!;
    element.dataset[id.key] = String(item.id);
    this.#write(element, "text", item.text);
    this.#write(element, "emoji", item.emoji);
    this.#list!.append(fragment);
    this.#apply(change);
    this.#count({ kind: "add", text: item.text });
  };

  /** Shows the new positions of the affected items and highlights them for a moment. */
  #apply(change: Extract<ListChange, { ok: true }>): void {
    for (const item of change.affected) {
      const element = this.#list!.querySelector<HTMLElement>(itemClass.selector + id.is(item.id));
      if (!element) continue;
      element.dataset[position.key] = item.position;
      this.#write(element, "position", item.position);
      element.classList.remove(written.name);
      // Restarts the highlight animation
      void element.offsetWidth;
      element.classList.add(written.name);
      setTimeout(() => element.classList.remove(written.name), WRITTEN_DURATION);
    }
  }

  /** Records the writes of an event and shows them in the counter. */
  #count(event: WriteEvent): void {
    this.#writes.record(countWrites(event));
    const { last, total } = this.#writes;
    const values: Record<string, string | number> = {
      [counts.message]: last!.message,
      [counts.lastStaquia]: last!.staquia,
      [counts.lastIndex]: last!.index,
      [counts.totalStaquia]: total.staquia,
      [counts.totalIndex]: total.index,
    };
    for (const element of this.querySelectorAll<HTMLElement>(count.selector)) {
      const value = values[element.dataset[count.key]!];
      if (value !== undefined) element.textContent = String(value);
    }
  }

  /** Puts the elements back in the order of the list (after a failed move). */
  #restore(): void {
    const elements = new Map([...this.#list!.querySelectorAll<HTMLElement>(ITEM)].map((element) => [Number(element.dataset[id.key]), element]));
    for (const itemId of this.#store!.order()) {
      const element = elements.get(itemId);
      if (element) this.#list!.append(element);
    }
  }
}
