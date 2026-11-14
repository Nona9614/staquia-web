/**
 * The contract between rendering (`components/`, build time) and hydration (`hydration/`, runtime).
 *
 * @remarks
 * Every class, attribute, id and text that the HTML writes and the script later queries is defined
 * here once. Components use the render helpers (`attr`, `name`), hydration uses the query helpers
 * (`selector`, `is`, `key`), so renaming one of them updates both sides.
 * `style.css` can't import this module, keep its class names in sync by hand.
 */

/** A CSS class shared by both sides. */
export interface ClassName<N extends string = string> {
  /** The class name, for `class="..."`. */
  readonly name: N;
  /** The selector, `.<name>`. */
  readonly selector: `.${N}`;
}

/** A `data-*` attribute shared by both sides. */
export interface DataAttribute<K extends string = string> {
  /** The attribute name, `data-<key>`. */
  readonly name: `data-${K}`;
  /** The `element.dataset` key. */
  readonly key: K;
  /** Selects any element with the attribute, `[data-<key>]`. */
  readonly selector: `[data-${K}]`;
  /** Renders the attribute with a value, `data-<key>="<value>"` (the value is escaped). */
  attr(value: string | number): string;
  /** Selects the elements with that exact value, `[data-<key>="<value>"]`. */
  is(value: string | number): string;
}

/** An element id shared by both sides. */
export interface ElementId<I extends string = string> {
  /** The id, for `id="..."`. */
  readonly name: I;
  /** The selector, `#<id>`. */
  readonly selector: `#${I}`;
}

const quote = (value: string | number) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
// For selectors: the value goes inside double quotes, so only `"` and `\` need escaping
const literal = (value: string | number) => String(value).replace(/["\\]/g, "\\$&");

function className<N extends string>(name: N): ClassName<N> {
  return { name, selector: `.${name}` };
}

/** @param key - A single lowercase word, so the attribute and the `dataset` key are the same. */
function data<K extends string>(key: K): DataAttribute<K> {
  return {
    name: `data-${key}`,
    key,
    selector: `[data-${key}]`,
    attr: (value) => `data-${key}="${quote(value)}"`,
    is: (value) => `[data-${key}="${literal(value)}"]`,
  };
}

function id<I extends string>(name: I): ElementId<I> {
  return { name, selector: `#${name}` };
}

/** Pages and the navigator: every page is a section in the HTML, the script shows one at a time. */
export const Navigation = {
  /** The scrollable container of every page. */
  content: className("content"),
  /** A page section, it also has the `page` attribute and its id is the page name. */
  section: className("page"),
  /** A navigator link, it also has the `page` attribute. */
  link: className("nav__link"),
  /** The page name of a section or a navigator link. */
  page: data("page"),
  /** Marks the navigator link of the current page. */
  current: { name: "aria-current", value: "page", attr: `aria-current="page"` },
} as const;

/** The copy buttons of the code blocks. */
export const CopyButton = {
  /** On the button: the id of the element whose text is copied. */
  target: data("copy"),
  /** The text inside the button that tells what happened. */
  note: className("copy-button__note"),
  /** The texts of the note. */
  text: { idle: "Copy Code", copied: "Content Copied", failed: "Copy Failed" },
} as const;

/** The Setup App form and the values shown around the page. */
export const SetupApp = {
  /** The form, its inputs are named after the `SetupValues` keys. */
  form: id("setup-calculator"),
  /** An element showing a value from the `bindings` service, the attribute value is its key. */
  bind: data("bind"),
} as const;

/** The `<staquia-list>` custom element and its light DOM. */
export const StaquiaList = {
  /** The custom element tag name. */
  tag: "staquia-list",
  /** The list of items (the first child is the "add" button, not an item). */
  list: className("sortable-items__list"),
  /** An item, it also has the `id` and `position` attributes (the `<template>` copy has none yet). */
  item: className("sortable__item__container"),
  /** The id of an item. */
  id: data("id"),
  /** The position of an item. */
  position: data("position"),
  /** A part of an item that shows one of its fields. */
  field: data("field"),
  /** The fields an item shows. */
  fields: { text: "text", emoji: "emoji", position: "position" },
  /** A button that runs an action of the list. */
  action: data("action"),
  /** The actions of the list. */
  actions: { add: "add" },
  /** On the element: the number system of the list, as JSON of `ExampleSystem`. */
  system: data("system"),
  /** Added for a moment to the items whose position was just written. */
  written: className("sortable__item--written"),
  /** An element of the write counter, the attribute value is one of `counts`. */
  count: data("count"),
  /** The values of the write counter. */
  counts: {
    message: "message",
    lastStaquia: "last-staquia",
    lastIndex: "last-index",
    totalStaquia: "total-staquia",
    totalIndex: "total-index",
  },
} as const;
