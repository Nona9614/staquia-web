import { setupDefaults, type SetupValues } from "../data/setup.ts";

/** The values of the Setup App. */
class SetupStore {
  #values: SetupValues = { ...setupDefaults };

  get values(): Readonly<SetupValues> {
    return this.#values;
  }

  /** Replaces the values (always with a copy, so callers can't mutate the store). */
  set(values: Readonly<SetupValues>): void {
    this.#values = { ...values };
  }

  /** Goes back to the default values. */
  reset(): void {
    this.#values = { ...setupDefaults };
  }
}

export default new SetupStore();
