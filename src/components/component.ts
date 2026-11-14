/**
 * A build-time component: it only knows how to turn itself into an HTML string.
 *
 * @remarks
 * Components never touch the DOM, stores or events. They run once at build time and the
 * result is written into `index.html`. `toString` lets a component be interpolated
 * directly in a template literal: `${new Link("setup")}`.
 */
export default abstract class Component {
  /** Returns the HTML of this component. */
  abstract render(): string;

  toString(): string {
    return this.render();
  }
}

/**
 * Escapes a dynamic value so it can be safely placed as HTML text or inside a quoted attribute.
 *
 * @param value - The value to escape.
 */
export function escape(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
