/** The languages the code samples are written in. */
export type Language = "javascript" | "typescript" | "rust" | "html" | "bash" | "sql";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (kind: string, text: string) => `<span class="${kind}">${escapeHtml(text)}</span>`;

/** Keywords that change the flow of the code (purple in VS Code). */
const control = new Set(["import", "from", "export", "default", "return", "if", "else", "switch", "case", "break", "for", "of", "in", "while", "await", "async", "throw", "try", "catch"]);
/** Declaration and value keywords (blue in VS Code). */
const keywords = new Set([
  "const", "let", "var", "function", "new", "class", "extends", "implements", "interface", "type", "typeof",
  "instanceof", "true", "false", "null", "undefined", "this", "void",
]);
/** Built-in types, colored like any other type. */
const primitives = new Set(["number", "string", "boolean", "bigint", "symbol", "object", "any", "unknown", "never"]);

/**
 * JavaScript and TypeScript, with the token kinds of VS Code (semantic highlighting):
 * `control`, `keyword`, `type`, `interface`, `function`, `variable`, `constant` (names declared with `const`),
 * `property`, `string`, `number`, `comment` and `bracket-<depth>` (bracket pair colorization).
 *
 * @remarks
 * It is not a parser: it follows the declarations of the sample itself (`const`, `let`, `interface`, `type`)
 * to color their names everywhere, and uses the next and previous tokens for everything else.
 */
function script(code: string): string {
  const token = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$ϰ][\w$ϰ]*)|([()[\]{}])|(=>)|([^])/gu;
  const constants = new Set<string>();
  const interfaces = new Set<string>();
  const types = new Set<string>();
  /** The declaration being read: names until `=`, `;`, `of` or `in` belong to it. */
  let declaring: "constant" | "variable" | "interface" | "type" | undefined;
  let depth = 0;
  let previous = "";
  let html = "";

  for (const match of code.matchAll(token)) {
    const [text, comment, string, number, word, bracket, arrow] = match;
    const rest = code.slice(match.index + text.length);
    if (comment) html += span("comment", text);
    else if (string) html += span("string", text);
    else if (number) html += span("number", text);
    else if (arrow) html += span("keyword", text);
    else if (bracket) {
      if ("([{".includes(text)) html += span(`bracket-${depth++ % 3}`, text);
      else html += span(`bracket-${(depth = Math.max(0, depth - 1)) % 3}`, text);
    } else if (word) {
      let kind: string;
      if (previous === ".") kind = /^\s*\(/.test(rest) ? "function" : "property";
      else if (control.has(word)) kind = "control";
      else if (keywords.has(word)) kind = "keyword";
      else if (primitives.has(word)) kind = "type";
      else if (declaring === "interface") kind = "interface";
      else if (declaring === "type") kind = "type";
      else if (interfaces.has(word)) kind = "interface";
      else if (types.has(word) || /^[A-Z]/.test(word)) kind = "type";
      else if (/^\s*\??:(?!:)/.test(rest) && declaring === undefined) kind = "property";
      else if (/^\s*\(/.test(rest)) kind = "function";
      else if (declaring === "constant" || constants.has(word)) kind = "constant";
      else kind = "variable";

      // Remember the names declared by the sample
      if (declaring === "constant" && kind === "constant") constants.add(word);
      else if (declaring === "interface") interfaces.add(word);
      else if (declaring === "type") types.add(word);
      html += span(kind, word);

      if (word === "const") declaring = "constant";
      else if (word === "let" || word === "var") declaring = "variable";
      else if (word === "interface" && previous !== ".") declaring = "interface";
      else if (word === "type" && kind === "keyword" && /^\s+[A-Z]/.test(rest)) declaring = "type";
      else if (declaring === "interface" || declaring === "type") declaring = undefined;
      else if (word === "of" || word === "in") declaring = undefined;
    } else {
      if (text === "=" || text === ";" || text === ":") declaring = declaring === "interface" || declaring === "type" ? declaring : undefined;
      html += escapeHtml(text);
    }
    if (!/^\s$/.test(text)) previous = text;
  }
  return html;
}

/** Rust keywords that change the flow of the code (purple in VS Code), `?` included. */
const rustControl = new Set(["use", "return", "if", "else", "match", "for", "in", "while", "loop", "break", "continue", "await", "async"]);
/** Rust declaration and value keywords (blue in VS Code). */
const rustKeywords = new Set([
  "let", "mut", "fn", "struct", "enum", "impl", "trait", "type", "pub", "const", "static", "mod", "crate", "self",
  "Self", "super", "where", "as", "ref", "move", "dyn", "true", "false", "unsafe",
]);
/** Rust built-in types, colored like any other type. */
const rustPrimitives = new Set([
  "u8", "u16", "u32", "u64", "u128", "usize", "i8", "i16", "i32", "i64", "i128", "isize", "f32", "f64", "bool",
  "char", "str",
]);
/** The enum variants of the prelude. */
const rustVariants = new Set(["Some", "None", "Ok", "Err"]);

/**
 * Rust, with the token kinds of VS Code (rust-analyzer semantic highlighting) mapped to the classes of `script`:
 * `type` (types and modules), `interface` (traits, in the C# color), `constant` (enum variants and `CONSTANTS`),
 * `function` (functions and macros), `variable` (bindings, fields and parameters), `control` (`?` included).
 *
 * @remarks
 * Like `script`, it is not a parser: the traits are the names after `impl` or `trait` in the sample (and `Item`),
 * everything else is decided by the neighbor tokens.
 */
function rust(code: string): string {
  const token = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(b?"(?:[^"\\]|\\.)*"|b?'(?:[^'\\\n]|\\.)')|(\b\d[\d_]*(?:\.\d[\d_]*)?(?:[ui](?:8|16|32|64|128|size)|f32|f64)?\b)|([A-Za-z_][\w]*!?)|([()[\]{}])|([^])/gu;
  const traits = new Set(["Item"]);
  for (const [, name] of code.matchAll(/\b(?:impl|trait)\s+(?:<[^>]*>\s*)?([A-Z]\w*)/g)) traits.add(name!);
  let depth = 0;
  let previous = "";
  /** The word before the previous `::`, to tell `Enum::Variant` from `Type::function`. */
  let path = "";
  let html = "";

  for (const match of code.matchAll(token)) {
    const [text, comment, string, number, word, bracket] = match;
    const rest = code.slice(match.index + text.length);
    if (comment) html += span("comment", text);
    else if (string) html += span("string", text);
    else if (number) html += span("number", text);
    else if (bracket) {
      if ("([{".includes(text)) html += span(`bracket-${depth++ % 3}`, text);
      else html += span(`bracket-${(depth = Math.max(0, depth - 1)) % 3}`, text);
    } else if (word) {
      let kind: string;
      const afterPath = previous === "::";
      if (word.endsWith("!")) kind = "function";
      // `impl Trait for Type` declares, it is not a loop
      else if (word === "for" && /\bimpl\b[^{;]*$/.test(code.slice(0, match.index))) kind = "keyword";
      else if (rustControl.has(word)) kind = "control";
      else if (rustKeywords.has(word)) kind = "keyword";
      else if (rustPrimitives.has(word)) kind = "type";
      else if (previous === "fn") kind = "function";
      else if (previous === ".") kind = /^\s*\(/.test(rest) ? "function" : "variable";
      else if (/^\s*::/.test(rest)) kind = traits.has(word) ? "interface" : "type";
      else if (/^[A-Z][A-Z\d_]+$/.test(word) || rustVariants.has(word)) kind = "constant";
      else if (/^[A-Z]/.test(word)) {
        if (afterPath && /^[A-Z]/.test(path)) kind = "constant";
        else kind = traits.has(word) ? "interface" : "type";
      } else if (/^\s*\(/.test(rest)) kind = "function";
      else kind = "variable";
      html += span(kind, word);
      if (/^\s*::/.test(rest)) path = word;
    } else {
      html += text === "?" ? span("control", text) : escapeHtml(text);
    }
    if (!/^\s$/.test(text)) previous = text === ":" && previous === ":" ? "::" : text;
  }
  return html;
}

/** Shell: comments and the command name of each line. */
function bash(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      if (line.trimStart().startsWith("#")) return span("comment", line);
      const [, command = "", rest = ""] = line.match(/^(\S*)([\s\S]*)$/) ?? [];
      return (command ? span("command", command) : "") + escapeHtml(rest);
    })
    .join("\n");
}

/** HTML: comments, tags, attributes and their values. */
function html(code: string): string {
  const token = /(<!--[\s\S]*?-->)|(<\/?)([\w-]+)|("[^"]*")|([\w-]+)(?==)|(\/?>)|([^])/g;
  let out = "";
  for (const [text, comment, open, tag, string, attribute, close] of code.matchAll(token)) {
    if (comment) out += span("comment", text);
    else if (open) out += span("symbol", open) + span("tag", tag!);
    else if (string) out += span("string", text);
    else if (attribute) out += span("attribute", text);
    else if (close) out += span("symbol", text);
    else out += escapeHtml(text);
  }
  return out;
}

/** SQL: comments, strings and uppercase keywords. */
function sql(code: string): string {
  const token = /(--[^\n]*)|("[^"]*"|'[^']*')|(\b[A-Z][A-Z_]+\b)|([^])/g;
  let out = "";
  for (const [text, comment, string, keyword] of code.matchAll(token)) {
    if (comment) out += span("comment", text);
    else if (string) out += span("string", text);
    else if (keyword) out += span("keyword", text);
    else out += escapeHtml(text);
  }
  return out;
}

/**
 * Highlights a code sample, returning HTML where every token is a `<span>` with its kind as class.
 *
 * @remarks The text content of the result is always the original code, so it can be copied as is.
 *
 * @param code - The plain code.
 * @param language - The language of the code.
 */
export function highlight(code: string, language: Language): string {
  switch (language) {
    case "javascript":
    case "typescript":
      return script(code);
    case "rust":
      return rust(code);
    case "bash":
      return bash(code);
    case "html":
      return html(code);
    case "sql":
      return sql(code);
  }
}

/**
 * Removes the common indentation and the surrounding blank lines of a code sample written inside a template literal.
 *
 * @param code - The indented code.
 */
export function dedent(code: string): string {
  const lines = code.replace(/^\s*\n|\n\s*$/g, "").split("\n");
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length));
  return lines.map((line) => line.slice(indent)).join("\n");
}
