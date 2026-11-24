import { presets, type PresetName, type SetupValues } from "../data/setup.ts";

/** The values derived from a setup that tell how resilient the system is. */
export interface Resilience {
  /** Max position length: `lmax = ln + lz`. */
  lmax: number;
  /** Length that triggers the threshold: `lϰ = ceil((1 - fϰ) * lmax)`. */
  lϰ: number;
  /** Max halvings of one digit: `hmax = ceil(log2(base))`. */
  hmax: number;
  /**
   * How many times an item can be moved into the same gap before the threshold is reached.
   * The worst case is `floor(log2(base))` halvings per digit and the best `ceil(log2(base))`,
   * multiplied by the `lϰ - ln - 1` digits of `Z` that fit before the threshold.
   */
  gap: { min: number; max: number };
}

/** The result of applying a change: the new values, or why the change was rejected. */
export type SetupChange = { ok: true; values: SetupValues } | { ok: false; reason: string };

/** The highest unicode value allowed for a digit (the Basic Multilingual Plane). */
const MAX_CODE = 0xffff;

/** Checks the rules of a number system: `zero < first < last`, all inside the Basic Multilingual Plane. */
function verify(values: SetupValues): SetupChange {
  const zero = values.zero.codePointAt(0)!;
  const first = values.first.codePointAt(0)!;
  const last = values.last.codePointAt(0)!;
  if (last > MAX_CODE) return { ok: false, reason: "Use characters up to U+FFFF" };
  if (!(zero < first)) return { ok: false, reason: "zero must be smaller than first" };
  if (!(first < last)) return { ok: false, reason: "first must be smaller than last" };
  return { ok: true, values };
}

/**
 * Changes one of the characters (`zero`, `first` or `last`), keeping the base in sync.
 *
 * @param values - The current values.
 * @param key - The changed character.
 * @param text - The text of the input, only its first character is used.
 */
export function changeCharacter(values: Readonly<SetupValues>, key: "zero" | "first" | "last", text: string): SetupChange {
  const code = text.codePointAt(0);
  if (code === undefined) return { ok: false, reason: `${key} can't be empty` };
  if (code > MAX_CODE) return { ok: false, reason: "Use characters up to U+FFFF" };
  // Editing a character leaves the preset: the system is a custom range
  const next: SetupValues = { ...values, preset: "", [key]: String.fromCodePoint(code) };
  next.base = next.last.codePointAt(0)! - next.first.codePointAt(0)! + 2;
  return verify(next);
}

/**
 * Changes the base, moving the `last` character to match it: `last = first + base - 2`.
 *
 * @param values - The current values.
 * @param base - The new base.
 */
export function changeBase(values: Readonly<SetupValues>, base: number): SetupChange {
  if (!Number.isInteger(base) || base < 3) return { ok: false, reason: "The base must be 3 or bigger" };
  const last = values.first.codePointAt(0)! + base - 2;
  if (last > MAX_CODE) return { ok: false, reason: "Use characters up to U+FFFF" };
  return verify({ ...values, preset: "", base, last: String.fromCodePoint(last) });
}

/**
 * Changes one of the numeric settings.
 *
 * @param values - The current values.
 * @param key - The changed setting.
 * @param value - The new value.
 */
export function changeNumber(values: Readonly<SetupValues>, key: "ln" | "lz" | "fϰ", value: number): SetupChange {
  if (!Number.isFinite(value)) return { ok: false, reason: `${key} must be a number` };
  return { ok: true, values: { ...values, [key]: value } };
}

/**
 * Selects a preset: its characters and base, with the default lengths (`ln = 5`, `lz = 15`, `fϰ = 0.15`).
 *
 * @param values - The current values.
 * @param name - The preset name.
 * @returns The change, or `undefined` if there is no such preset.
 */
export function applyPreset(values: Readonly<SetupValues>, name: string): SetupChange | undefined {
  const preset = presets.find((preset) => preset.name === name);
  if (!preset) return undefined;
  const { zero, first, last, base } = preset;
  return { ok: true, values: { ...values, preset: preset.name, zero, first, last, base, ln: 5, lz: 15, fϰ: 0.15 } };
}

/** The preset of the values, if any. */
const presetOf = (name: PresetName | "") => presets.find((preset) => preset.name === name);

/** The names of the Setup App inputs, the same as the `SetupValues` keys. */
export type SetupField = keyof SetupValues;

/**
 * Applies the raw value of a Setup App input, choosing the right change for the field.
 *
 * @param values - The current values.
 * @param field - The input name.
 * @param raw - The input value, as text.
 * @returns The change, or `undefined` if the name is not a setup field.
 */
export function changeField(values: Readonly<SetupValues>, field: string, raw: string): SetupChange | undefined {
  switch (field) {
    case "zero":
    case "first":
    case "last":
      return changeCharacter(values, field, raw);
    case "base":
      return changeBase(values, Number(raw));
    case "ln":
    case "lz":
    case "fϰ":
      return changeNumber(values, field, Number(raw));
    default:
      return undefined;
  }
}

/**
 * Gets every value shown by a `[data-bind="<key>"]` element: the setup values and their resilience.
 *
 * @param values - The setup values.
 */
export function bindings(values: Readonly<SetupValues>): Record<string, string | number> {
  const { lmax, lϰ, hmax, gap } = resilience(values);
  return {
    ...values,
    lmax,
    lϰ,
    hmax,
    "gap-min": gap.min,
    "gap-max": gap.max,
    // The Rust sample: char literals and an f64 literal
    rust_zero: rustChar(values.zero),
    rust_first: rustChar(values.first),
    rust_last: rustChar(values.last),
    rust_threshold: Number.isInteger(values.fϰ) ? values.fϰ.toFixed(1) : String(values.fϰ),
    // The preset: its methods for the code, and what it is for
    js_preset: presetOf(values.preset)?.js ?? "default",
    rust_preset: presetOf(values.preset)?.rust ?? "default",
    "preset-label": presetOf(values.preset)?.label ?? "Custom range",
    "preset-description":
      presetOf(values.preset)?.description ??
      `Every character from '${values.first}' to '${values.last}', and '${values.zero}' as the zero.`,
  };
}

/** The inside of a Rust char literal: `'` and `\` are escaped. */
const rustChar = (character: string) => character.replace(/['\\]/g, "\\$&");

/**
 * Calculates the resilience values of a setup.
 *
 * @param values - The setup values.
 */
export function resilience(values: Pick<SetupValues, "base" | "ln" | "lz" | "fϰ">): Resilience {
  const lmax = values.ln + values.lz;
  const lϰ = Math.ceil((1 - values.fϰ) * lmax);
  const log = Math.log2(values.base);
  const digits = Math.max(0, lϰ - values.ln - 1);
  return {
    lmax,
    lϰ,
    hmax: Math.ceil(log),
    gap: { min: Math.floor(log) * digits, max: Math.ceil(log) * digits },
  };
}
