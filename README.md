# Staquia documentation site

The intro and guide site of [Staquia](../javascript), published at <https://nona9614.github.io/staquia-js/> next to the TypeDoc API reference.

It is plain TypeScript with no framework. Every page is rendered to HTML **at build time**, and the final site is a single `index.html` with the CSS and JS inlined, plus the font.

## Commands

| Command              | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `pnpm dev`           | Dev server with live reload                                          |
| `pnpm build`         | Type-check and build into `dist/` (doesn't publish anything)         |
| `pnpm run export`    | `build`, then copy the site to **both** places below                 |
| `pnpm export:web`    | `build`, then copy only to `~/web/staquia/`                          |
| `pnpm export:docs`   | `build`, then copy only to `../javascript/docs/`                     |

The project uses **pnpm only** (for its supply-chain checks and because it doesn't run dependencies' install scripts unless allowed). Install with `pnpm install --frozen-lockfile`; don't add a `package-lock.json`.

## Publishing

There are two outputs, written by [`scripts/export.mjs`](scripts/export.mjs):

| Target                  | For                                         | Served at                                   |
| ----------------------- | ------------------------------------------- | ------------------------------------------- |
| `../javascript/docs/`   | GitHub Pages (published from `master`)      | `https://nona9614.github.io/staquia-js/`    |
| `~/web/staquia/`        | My local web server, to try it before pushing | `/staquia/` on the local server           |

The usual flow:

1. `pnpm export:web` and check the site on the local server.
2. `pnpm export:docs`, then commit and push `javascript/docs` (the export never commits).

Only the site's own files are replaced in a target: `index.html`, `favicon.ico` and `assets/`. Everything else is left untouched, like the TypeDoc reference in `docs/api/` (generated with `pnpm run doc` in `../javascript`) and `docs/.nojekyll`. The local copy also gets a copy of `docs/api/`, so the API link works there too.

All URLs are relative (`base: "./"`), so the same build works under any folder.

## How it works

```
build time                                   browser
──────────                                   ───────
components/  ──render()──▶ index.html ──▶ hydration/ attaches behavior
   (strings)    (prerender plugin)        (inline <script type="module">)
```

- **Prerender** ([`vite.config.ts`](vite.config.ts)): `new App().render()` replaces `<!--app-->` in `index.html`. Every page is in the HTML as a `<section id="<page>" hidden>`; navigating is toggling `hidden` from the URL hash.
- **Inline** ([`vite.config.ts`](vite.config.ts)): the built CSS and JS are moved into `<style>` and `<script type="module">`. The build **fails** if a dynamic `import()` creates a second JS chunk. The script is deferred, so the DOM is ready when it runs.
- **Hydration** ([`src/hydration/`](src/hydration)): attaches behavior to the prerendered HTML. That covers navigation, copy buttons, the Setup App and the `<staquia-list>` custom element (SortableJS + `LexicalList`).

### Folders

| Folder / file        | Contains                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `src/components/`    | Build time only: classes whose `render()` returns HTML. They never touch the DOM.             |
| `src/hydration/`     | Runtime, DOM only: read, listen and write. `hydrate()` in `index.ts` is the entry point.      |
| `src/services/`      | Pure logic, used by both sides (page titles, setup math, highlighting, write counts…).        |
| `src/stores/`        | Data, with methods that only change that data (current page, setup values, the demo list).    |
| `src/events/`        | `Emitter` and the app events (`pageChanged`, `setupChanged`).                                 |
| `src/data/`, `types/`| Constants (examples, setup defaults, short nav titles) and the page list.                     |
| `src/contract.ts`    | Every class, `data-*` attribute, id and text shared by components and hydration, defined once.|
| `src/style.css`      | The single stylesheet (see below).                                                            |

### Rules worth remembering

- **Shared names go through the contract.** If a component writes a class or `data-*` attribute that hydration queries, define it in `contract.ts`: components use `.attr()`/`.name`, hydration uses `.selector`/`.is()`/`.key`. `style.css` can't import it, so keep CSS class names in sync by hand.
- **Code samples are plain text.** `new CodeBlock(id, language, code)` highlights it at build time with VS Code Dark+ colors (interfaces in the C# color). Ids must be unique on the whole site.
- **Write the docs from real outputs.** Positions, counts and limits shown on the pages were measured with the library; re-check them when the library changes.

## Styles

The custom property names follow one convention, documented at the top of [`src/style.css`](src/style.css):

| Prefix                                  | Meaning                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| `--palette-*`                           | Raw colors, the same in both themes                       |
| `--color-*`                             | Themed colors, set once per theme                         |
| `--color-<component>-<part>[-<state>]`  | Colors of one component                                   |
| `--color-code-*`                        | Code sample colors                                        |
| `--shadow-*`, `--size-*`, `--font-size-*`, `--line-height-*` | Shadows, layout, typography          |
| `--box-*`                               | Local to a row of letter boxes                            |

Visual decisions to keep:

- No greens and no pure red: teal is the main accent, errors use the ichor red, N is violet and Z orange.
- Text colors reach at least 4.5:1 against their background in both themes; colored box fills use one deep shade with light text.
- Letter boxes follow the theme and are sized by purpose (`showcase`, `sequence`, grid), relative to the content column.
- The narrow navigator shows one-word labels (`data/pages.ts`), switched by a container query on its own width.

## Adding a page

1. Add its name to `pages` in [`src/types/page.ts`](src/types/page.ts) (the order is the reading order).
2. Create its component in `src/components/pages/<name>/` and register it in [`layout/content.ts`](src/components/layout/content.ts).
3. Add its icon in [`layout/navigator-icons.ts`](src/components/layout/navigator-icons.ts): a path in the `0 -960 960 960` box, or `{ d, viewBox }` for an icon drawn in another box.
4. If its title doesn't fit the narrow navigator, add a one-word title in [`src/data/pages.ts`](src/data/pages.ts).

The navigator, the previous/next footer and the URL hash all follow automatically.
