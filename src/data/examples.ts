/** Market items used by the sortable list example. */
export interface Example {
  text: string;
  emoji: string;
}

export const examples: readonly Example[] = [
  { text: "Milk", emoji: "🥛" },
  { text: "Lettuce", emoji: "🥬" },
  { text: "Meat", emoji: "🥩" },
  { text: "Banana", emoji: "🍌" },
  { text: "Choco", emoji: "🍫" },
  { text: "Apple", emoji: "🍎" },
  { text: "Candy", emoji: "🍬" },
  { text: "Aubergine", emoji: "🍆" },
  { text: "Watermelon", emoji: "🍉" },
  { text: "Meat Bone", emoji: "🍖" },
  { text: "Soda", emoji: "🥤" },
  { text: "Mate", emoji: "🧉" },
  { text: "Popcorn", emoji: "🍿" },
  { text: "Bread", emoji: "🍞" },
];

/** The settings of a number system, as passed to `Staquia.create`. */
export interface ExampleSystem {
  zero: string;
  first: string;
  last: string;
  ln: number;
  lz: number;
  fϰ: number;
}

/** The number system of the main sortable list example. */
export const exampleSystem: Readonly<ExampleSystem> = {
  zero: "!",
  first: "a",
  last: "z",
  ln: 4,
  lz: 12,
  fϰ: 0.15,
};

/** How many items the main example list starts with. */
export const initialItemsCount = 10;

/**
 * A tiny number system for the playground: only 8 to 10 moves fit into the same gap,
 * so the threshold and the rebalance can be seen after a few drags.
 */
export const playgroundSystem: Readonly<ExampleSystem> = {
  zero: "!",
  first: "a",
  last: "z",
  ln: 2,
  lz: 3,
  fϰ: 0.15,
};

/** How many items the playground starts with. */
export const playgroundItemsCount = 5;
