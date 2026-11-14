import { defineConfig, type Plugin } from "vite";
import App from "./src/components/app.ts";

/**
 * Renders the component tree into `index.html` at build time (and on every dev request).
 *
 * @remarks
 * Vite restarts the dev server when a file imported by this config changes,
 * so editing a component refreshes the page.
 */
function prerender(): Plugin {
  return {
    name: "prerender",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes("<!--app-->")) throw new Error("index.html is missing the <!--app--> placeholder");
        return html.replace("<!--app-->", () => new App().render());
      },
    },
  };
}

/** Escapes a string to be used literally inside a regular expression. */
const literal = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Joins a relative URL to a directory of the bundle, e.g. `assets` + `./font.woff2` = `assets/font.woff2`. */
function join(directory: string, url: string): string {
  const parts = directory === "." ? [] : directory.split("/");
  for (const part of url.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  }
  return parts.join("/");
}

/**
 * Inlines the built CSS and JS into `index.html`, so the page is a single request.
 *
 * @remarks
 * Other assets (the font) stay as files. As the CSS moves from `assets/` to the page root,
 * its relative `url()`s are rewritten to stay relative to the page.
 */
function inline(): Plugin {
  return {
    name: "inline",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const page = bundle["index.html"];
      if (!page || page.type !== "asset") return;
      let html = String(page.source);

      for (const [fileName, file] of Object.entries(bundle)) {
        const href = `(?:\\./|/)?${literal(fileName)}`;
        if (file.type === "asset" && fileName.endsWith(".css")) {
          const directory = fileName.includes("/") ? fileName.slice(0, fileName.lastIndexOf("/")) : ".";
          const css = String(file.source)
            .replace(/url\((["']?)(?!data:|https?:|\/|#)([^"')]+)\1\)/g, (_, quote: string, url: string) => `url(${quote}./${join(directory, url)}${quote})`)
            .replace(/<\/style/gi, "<\\/style");
          const tag = new RegExp(`<link[^>]*href="${href}"[^>]*>`);
          if (!tag.test(html)) continue;
          html = html.replace(tag, () => `<style>\n${css}</style>`);
          delete bundle[fileName];
        } else if (file.type === "chunk" && file.isEntry) {
          const code = file.code.replace(/<\/script/gi, "<\\/script");
          const tag = new RegExp(`<script[^>]*src="${href}"[^>]*></script>`);
          if (!tag.test(html)) continue;
          html = html.replace(tag, () => `<script type="module">\n${code}</script>`);
          delete bundle[fileName];
        }
      }

      // A dynamic import() would leave a chunk the page has to fetch, the page must be a single file
      const leftovers = Object.values(bundle).filter((file) => file.type === "chunk");
      if (leftovers.length) {
        this.error(`Only the entry script can be inlined, remove the dynamic imports of: ${leftovers.map((file) => file.fileName).join(", ")}`);
      }

      page.source = html;
    },
  };
}

export default defineConfig({
  // Relative URLs: the site is served from https://nona9614.github.io/staquia-js/
  base: "./",
  plugins: [prerender(), inline()],
  build: {
    // A single inlined script has nothing to preload
    modulePreload: false,
  },
});
