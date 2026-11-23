import pkg from "staquia/package.json" with { type: "json" };

/** The documented library version, read from the installed `staquia` package. */
export const version: string = pkg.version;

/** The documented version of the Rust crate (`rust/Cargo.toml`). */
export const crateVersion = "0.1.0";

/** The 27 base alphabetical number system used along the documentation (`!` is zero). */
export const alphabet: readonly string[] = ["!", ..."abcdefghijklmnopqrstuvwxyz"];
