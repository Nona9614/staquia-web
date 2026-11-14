// Copies the built site (dist/) to where it is published.
//
//   node scripts/export.mjs          → every target
//   node scripts/export.mjs docs     → only the GitHub Pages docs folder
//   node scripts/export.mjs web      → only the local web server folder
//
// Only the files of the site are replaced in a target (SITE_FILES). Everything else in it is left
// untouched, like the TypeDoc reference in `docs/api` or `.nojekyll`.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";

const root = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const dist = path.join(root, "dist");
const docs = path.resolve(root, "../javascript/docs");

/** What the build produces: the only entries removed and replaced in a target. */
const SITE_FILES = ["index.html", "favicon.ico", "assets"];

/** Where the site is published. */
const targets = {
  /** GitHub Pages serves this folder (https://nona9614.github.io/staquia-js/), next to the TypeDoc `api/`. */
  docs: { dir: docs },
  /** The local web server, to try everything before pushing. It also gets the TypeDoc reference so the API link works. */
  web: { dir: path.join(os.homedir(), "web", "staquia"), extra: [{ from: path.join(docs, "api"), to: "api" }] },
};

function fail(message) {
  console.error(`export: ${message}`);
  process.exit(1);
}

const selected = process.argv.slice(2);
for (const name of selected) if (!(name in targets)) fail(`unknown target "${name}", use: ${Object.keys(targets).join(", ")}`);
if (!fs.existsSync(path.join(dist, "index.html"))) fail("dist/index.html is missing, run the build first");

for (const [name, target] of Object.entries(targets)) {
  if (selected.length && !selected.includes(name)) continue;
  const dir = path.resolve(target.dir);
  // Never write to a filesystem root or the home folder itself
  if (dir === path.parse(dir).root || dir === os.homedir()) fail(`refusing to write to ${dir}`);

  fs.mkdirSync(dir, { recursive: true });
  for (const entry of SITE_FILES) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
    const source = path.join(dist, entry);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(dir, entry), { recursive: true });
  }
  for (const extra of target.extra ?? []) {
    if (!fs.existsSync(extra.from)) {
      console.warn(`export: ${extra.from} doesn't exist, skipped`);
      continue;
    }
    fs.rmSync(path.join(dir, extra.to), { recursive: true, force: true });
    fs.cpSync(extra.from, path.join(dir, extra.to), { recursive: true });
  }
  console.log(`export: ${name} → ${dir}`);
}
