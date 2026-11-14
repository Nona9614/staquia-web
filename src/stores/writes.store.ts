import type { Writes } from "../services/writes.service.ts";

/** The rows written by the last event and in total, with Staquia and with an integer index. */
export default class WritesStore {
  last: Readonly<Writes> | undefined;
  total = { staquia: 0, index: 0 };

  /** Adds the writes of an event. */
  record(writes: Readonly<Writes>): void {
    this.last = writes;
    this.total = { staquia: this.total.staquia + writes.staquia, index: this.total.index + writes.index };
  }
}
