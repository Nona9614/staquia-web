import { hydrateNavigation } from "./navigation.ts";
import { hydrateCopyButtons } from "./copy-buttons.ts";
import { hydrateSetupApp } from "./setup-app.ts";
import { hydrateLanguage } from "./language.ts";
import StaquiaListElement from "./staquia-list.element.ts";
import { StaquiaList } from "../contract.ts";

/**
 * Attaches the behavior to the HTML rendered at build time.
 *
 * @remarks
 * Hydration only reads the DOM, listens to it and writes to it. The decisions live in `services/`,
 * the data in `stores/` and the communication in `events/`.
 */
export function hydrate(): void {
  hydrateNavigation();
  hydrateCopyButtons();
  hydrateSetupApp();
  hydrateLanguage();
  // Upgrades the <staquia-list> elements already in the HTML
  customElements.define(StaquiaList.tag, StaquiaListElement);
}
