/** The languages the code samples are written in. */
export type Language = "javascript" | "typescript" | "html" | "bash" | "sql";

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
