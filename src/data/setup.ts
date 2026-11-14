/** The values of the Setup App form. */
export interface SetupValues {
  base: number;
  ln: number;
  lz: number;
  zero: string;
  first: string;
  last: string;
  fϰ: number;
}

/** The values the Setup App starts with (and resets to). */
export const setupDefaults: Readonly<SetupValues> = Object.freeze({
  base: 1027,
  ln: 5,
  lz: 15,
  zero: "!",
  first: "°",
  last: "ұ",
  fϰ: 0.15,
});
