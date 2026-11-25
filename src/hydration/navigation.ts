import pagesStore from "../stores/pages.store.ts";
import { pageChanged } from "../events/app.events.ts";
import { documentTitle, hashFor, parseHash } from "../services/pages.service.ts";
import { currentLanguage, isLanguage } from "./language.ts";
import { Navigation } from "../contract.ts";

/**
 * Hydrates the page navigation. Every page is already in the HTML, so showing one is toggling
 * `hidden` on the page sections and `Navigation.current` on the navigator links. The URL hash is the source of truth.
 */
export function hydrateNavigation(): void {
  const { section, link, page: name, content, current } = Navigation;
  const sections = document.querySelectorAll<HTMLElement>(section.selector + name.selector);
  const links = document.querySelectorAll<HTMLAnchorElement>(link.selector + name.selector);
  const container = document.querySelector<HTMLElement>(content.selector);
  const site = document.title;

  pageChanged.subscribe((page) => {
    for (const element of sections) element.hidden = element.dataset[name.key] !== page;
    for (const element of links) {
      if (element.dataset[name.key] === page) element.setAttribute(current.name, current.value);
      else element.removeAttribute(current.name);
    }
    container?.scrollTo({ top: 0, left: 0 });
    document.title = documentTitle(page, site);
  });

  const show = () => {
    const { page, lang } = parseHash(location.hash);
    pagesStore.current = page;
    pageChanged.trigger(page);
    // Links in the site name only the page (and old links like #setup): the address gets the current language
    // too, so it can be shared. A link with a known language keeps it (the language script applies it); an
    // unknown one is replaced by the current language.
    if (location.hash && !isLanguage(lang)) history.replaceState(null, "", hashFor(page, currentLanguage()));
  };

  window.addEventListener("hashchange", show);
  show();
}
