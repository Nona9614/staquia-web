/** What happened to the list, to compare how many rows each approach writes. */
export type WriteEvent =
  | { kind: "add"; text: string }
  | { kind: "move"; text: string; from: number; to: number; written: number }
  | { kind: "rebalance"; text: string; from: number; to: number; written: number };

/** The rows written by one event, with Staquia and with an integer index column. */
export interface Writes {
  staquia: number;
  index: number;
  message: string;
}

/**
 * Rows an integer index (`0, 1, 2…`) rewrites when an item moves: the item and every item it passes.
 *
 * @param from - The old index of the item.
 * @param to - The new index of the item.
 */
export function indexWrites(from: number, to: number): number {
  return Math.abs(to - from) + 1;
}

/**
 * Counts the rows written by an event and describes it.
 *
 * @param event - What happened.
 */
export function countWrites(event: WriteEvent): Writes {
  switch (event.kind) {
    case "add":
      return { staquia: 1, index: 1, message: `${event.text} was stacked at the end: one row for both.` };
    case "move":
      return {
        staquia: event.written,
        index: indexWrites(event.from, event.to),
        message: `${event.text} moved: only its own row was written.`,
      };
    case "rebalance":
      return {
        staquia: event.written,
        index: indexWrites(event.from, event.to),
        message: `${event.text} moved into a full gap: the threshold was reached, so the positions were spaced again (${event.written} rows) and the move retried.`,
      };
  }
}
