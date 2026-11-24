import Staquia, { LexicalList, type LexicalError } from "staquia";
import type { ListItem } from "../services/items.service.ts";

/** The outcome of an operation over the list: the items whose position changed, or why it failed. */
export type ListChange = { ok: true; affected: ListItem[]; rebalanced: boolean } | { ok: false; error: LexicalError };

/**
 * The data of a sortable list example: a `LexicalList` and the objects it keeps in sync.
 *
 * @remarks Every method only changes the data. Telling the DOM what changed is the caller's job.
 */
export default class ListStore {
  readonly #list: LexicalList<number, ListItem>;
  readonly #items = new Map<number, ListItem>();

  /** @param system - The number system that generates the positions. */
  constructor(system: Staquia) {
    this.#list = new LexicalList<number, ListItem>(system);
  }

  /** Gets an item by id. */
  get(id: number): ListItem | undefined {
    return this.#items.get(id);
  }

  /** The id for a new item. */
  nextId(): number {
    let max = -1;
    for (const id of this.#items.keys()) if (id > max) max = id;
    return max + 1;
  }

  /**
   * Loads items that are expected to be sorted by position.
   * If they are not, they are loaded as untrusted: sorted and repaired.
   */
  load(items: ListItem[]): ListChange {
    let result = this.#list.set(items);
    if (!result.ok && result.error.type !== "invalid-id" && result.error.type !== "duplicate-id") {
      result = this.#list.set(items, { untrusted: true });
    }
    if (!result.ok) return result;
    this.#items.clear();
    for (const item of items) this.#items.set(item.id, item);
    return { ok: true, affected: this.#objects(result.value[0]), rebalanced: false };
  }

  /** Stacks a new item at the end. */
  add(item: ListItem): ListChange {
    const result = this.#list.push(item);
    if (!result.ok) return result;
    this.#items.set(item.id, item);
    return { ok: true, affected: [item], rebalanced: false };
  }

  /**
   * Moves an item between two neighbors. When there is no room left (threshold or overflow)
   * the positions are spaced again keeping the order, and the move is retried.
   *
   * @param id - The moved item.
   * @param previousId - The new previous neighbor, `undefined` for the start.
   * @param nextId - The new next neighbor, `undefined` for the end.
   */
  move(id: number, previousId: number | undefined, nextId: number | undefined): ListChange {
    const first = this.#list.move(id, previousId, nextId);
    if (first.ok) return { ok: true, affected: [this.#items.get(id)!], rebalanced: false };
    if (first.error.type !== "position") return first;

    const rebalanced = this.#list.rebalance();
    if (!rebalanced.ok) return rebalanced;
    const second = this.#list.move(id, previousId, nextId);
    if (!second.ok) return second;

    const affected = new Set(this.#objects(rebalanced.value[0]));
    affected.add(this.#items.get(id)!);
    return { ok: true, affected: [...affected], rebalanced: true };
  }

  /** The ids in list order. */
  order(): number[] {
    const result = this.#list.toArray();
    return result.ok ? result.value.map((item) => item.id) : [];
  }

  /** Maps list items to the objects they wrap. */
  #objects(items: readonly { id: number }[]): ListItem[] {
    return items.map((item) => this.#items.get(item.id)).filter((item): item is ListItem => item !== undefined);
  }
}
