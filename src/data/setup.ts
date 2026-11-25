/** The presets of the library; an empty string is a custom range. */
export type PresetName = "default" | "ascii" | "urlSafe" | "base36" | "alphabet";

/** A preset of the library, as the Setup App shows it. */
export interface Preset {
  name: PresetName;
  /** The button text. */
  label: string;
  /** The JavaScript method (`Staquia.<js>()`) and the Rust one (`Staquia::<rust>()`, `Options::<rust>()`). */
  js: string;
  rust: string;
  /** Its characters: the zero, the first and the last digit, and the base. */
  zero: string;
  first: string;
  last: string;
  base: number;
  /** The characters when they are a set, not a range. */
  set?: string;
  /** When to pick it. */
  description: string;
}

/** The presets in the order of the buttons: the plain ASCII one first, the familiar on-ramp. */
export const presets: readonly Readonly<Preset>[] = Object.freeze([
  { name: "default", label: "Default", js: "default", rust: "default", zero: "!", first: "°", last: "ұ", base: 1027, description: "The shortest positions in characters, the best general choice for databases." },
  { name: "ascii", label: "ASCII", js: "ascii", rust: "ascii", zero: "!", first: "#", last: "~", base: 90, set: "!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~", description: "Plain ASCII without ' \\ and `: the most compact per byte, nothing to escape in JSON, SQL or logs." },
  { name: "urlSafe", label: "URL Safe", js: "urlSafe", rust: "url_safe", zero: "-", first: "0", last: "z", base: 64, set: "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz", description: "The URL safe base64 characters in code order: positions go in URLs, file names and HTML ids as they are." },
  { name: "base36", label: "Base 36", js: "base36", rust: "base36", zero: "0", first: "1", last: "z", base: 36, set: "0123456789abcdefghijklmnopqrstuvwxyz", description: "Digits and lowercase letters only: safe with case insensitive collations (MySQL) and alphanumeric keys." },
  { name: "alphabet", label: "Alphabet", js: "alphabet", rust: "alphabet", zero: "!", first: "a", last: "z", base: 27, description: "Readable positions like mmmmm!, the system of every example of this documentation." },
]);

/** The values of the Setup App form. */
export interface SetupValues {
  /** The selected preset, or an empty string for a custom range. */
  preset: PresetName | "";
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
  preset: "default",
  base: 1027,
  ln: 5,
  lz: 15,
  zero: "!",
  first: "°",
  last: "ұ",
  fϰ: 0.15,
});
