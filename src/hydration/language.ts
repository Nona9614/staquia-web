import { CodeLanguage, Navigation, type CodeLanguageName } from "../contract.ts";
import pagesStore from "../stores/pages.store.ts";
import { hashFor, parseHash } from "../services/pages.service.ts";

export const isLanguage = (value: string | null | undefined): value is CodeLanguageName =>
  (CodeLanguage.values as readonly string[]).includes(value ?? "");

/** The language on `<html>` (written by the boot script from the link or the stored choice), or the default. */
export function currentLanguage(): CodeLanguageName {
  const value = document.documentElement.getAttribute(CodeLanguage.root.name);
  return isLanguage(value) ? value : CodeLanguage.values[0];
}

/**
 * The element at the top of the content that stays visible in every language: content of one language is
 * replaced, so its closest container shared by all of them is used.
 */
function anchor(content: Element): Element | undefined {
  const box = content.getBoundingClientRect();
  let element = document.elementFromPoint(box.left + box.width / 2, box.top + 1);
  while (element) {
    const variant = element.closest(CodeLanguage.variant.selector);
    if (!variant) break;
    element = variant.parentElement;
  }
  return element && element !== content && content.contains(element) ? element : undefined;
}

/**
 * Hydrates the global code language `<select>`s (full and short names, kept in sync): choosing a language shows every sample, text and link of it,
 * stores the choice for the next visits and keeps the reading position (the content above may change height).
 */
export function hydrateLanguage(): void {
  const selects = [...document.querySelectorAll<HTMLSelectElement>(CodeLanguage.switch.selector)];
  const sync = (language: CodeLanguageName) => selects.forEach((select) => (select.value = language));
  sync(currentLanguage());
  document.addEventListener("change", (event) => {
    const select = event.target as HTMLSelectElement;
    if (!selects.includes(select)) return;
    const language = select.value;
    if (!isLanguage(language) || language === currentLanguage()) return;
    sync(language);

    const content = document.querySelector(Navigation.content.selector);
    const target = content ? anchor(content) : undefined;
    const before = target?.getBoundingClientRect().top;

    apply(language);
    // The address keeps the page and the language, so a copied link opens both (no new history entry)
    history.replaceState(null, "", hashFor(pagesStore.current, language));

    if (content && target && before !== undefined) content.scrollTop += target.getBoundingClientRect().top - before;
  });

  // A link to another language of the site (`#view=...&lang=rust`) while it is open
  window.addEventListener("hashchange", () => {
    const language = parseHash(location.hash).lang;
    if (!isLanguage(language) || language === currentLanguage()) return;
    sync(language);
    apply(language);
  });
}

/** Shows a code language and stores it as the choice for the next visits. */
function apply(language: CodeLanguageName): void {
  if (language === CodeLanguage.values[0]) document.documentElement.removeAttribute(CodeLanguage.root.name);
  else document.documentElement.setAttribute(CodeLanguage.root.name, language);
  try {
    localStorage.setItem(CodeLanguage.storage, language);
  } catch {
    // Storage blocked (private mode, disabled site data): the choice lasts until the page is closed
  }
}
