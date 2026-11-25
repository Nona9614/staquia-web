import type { CodeLanguageName } from "../contract.ts";
import { version } from "./app.ts";

/** The places of the library in one code language. */
export interface LanguageLinks {
  /** The documented version, for the install instructions. */
  version: string;
  /** The API reference. */
  api: string;
  /** The package page in the registry of the language. */
  package: string;
  /** The source code, when it has its own repository (otherwise the JavaScript one is shown). */
  repository?: string;
}

/**
 * The library in each code language. Typed by `CodeLanguageName`, so adding a language to `CodeLanguage` in
 * `contract.ts` fails the build until its entry is here.
 */
export const languages: Readonly<Record<CodeLanguageName, Readonly<LanguageLinks>>> = {
  javascript: {
    version,
    api: "api/index.html",
    package: "https://www.npmjs.com/package/staquia",
    repository: "https://github.com/Nona9614/staquia-js",
  },
  rust: {
    // `rust/Cargo.toml`; docs.rs and crates.io answer once the crate is published
    version: "0.2.0",
    api: "https://docs.rs/staquia",
    package: "https://crates.io/crates/staquia",
    repository: "https://github.com/Nona9614/staquia-rust",
  },
};
