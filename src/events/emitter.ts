/** A function that receives the value of an emitted event. */
export type Subscription<T> = (value: T) => void;

/**
 * A minimal typed event channel.
 *
 * @remarks Named `Emitter` (not `Event`) so it does not shadow the DOM `Event` type.
 */
export default class Emitter<T> {
  #subscriptions = new Set<Subscription<T>>();

  /**
   * Calls the subscription every time the event is triggered.
   *
   * @param subscription - The function to call.
   * @returns A function that cancels the subscription.
   */
  subscribe(subscription: Subscription<T>): () => void {
    this.#subscriptions.add(subscription);
    return () => this.#subscriptions.delete(subscription);
  }

  /**
   * Sends a value to every subscription.
   *
   * @param value - The value of the event.
   */
  trigger(value: T): void {
    for (const subscription of this.#subscriptions) subscription(value);
  }
}
