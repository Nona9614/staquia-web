import type Staquia from "staquia";
import type { IPositionResult } from "staquia";
import type { Example } from "../data/examples.ts";

/** An item of the sortable list example. */
export interface ListItem extends Example {
  id: number;
  position: string;
}

/**
 * Creates a new item, without position yet, from a random example.
 *
 * @param id - The id of the new item.
 * @param examples - The pool of examples.
 * @param random - A number from `0` (inclusive) to `1` (exclusive), like `Math.random()`.
 */
export function createItem(id: number, examples: readonly Example[], random: number): ListItem {
  return { id, position: "", ...examples[Math.floor(random * examples.length)]! };
}

/**
 * Creates items stacked one after another, the first one at the system `start` position.
 *
 * @param system - The number system that generates the positions.
 * @param examples - The pool of examples, used in order and repeated if needed.
 * @param count - How many items to create.
 */
export function stack(system: Staquia, examples: readonly Example[], count: number): ListItem[] {
  const items: ListItem[] = [];
  let reference: IPositionResult = system.start();
  for (let id = 0; id < count; id++) {
    if (!reference.ok) throw reference.error;
    items.push({ id, position: reference.value.toString(), ...examples[id % examples.length]! });
    reference = system.next(reference);
  }
  return items;
}
