import pagesStore from "../stores/pages.store.ts";
import { pageChanged } from "../events/app.events.ts";
import { documentTitle, pageFromHash } from "../services/pages.service.ts";
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
    pagesStore.current = pageFromHash(location.hash);
    pageChanged.trigger(pagesStore.current);
  };

  window.addEventListener("hashchange", show);
  show();
}
