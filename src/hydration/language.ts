import { CodeLanguage, Navigation, type CodeLanguageName } from "../contract.ts";

const isLanguage = (value: string | null | undefined): value is CodeLanguageName =>
  (CodeLanguage.values as readonly string[]).includes(value ?? "");

/** The language on `<html>` (written by the boot script from the stored choice), or the default. */
function current(): CodeLanguageName {
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
 * Hydrates the global code language `<select>`: choosing a language shows every sample, text and link of it,
 * stores the choice for the next visits and keeps the reading position (the content above may change height).
 */
export function hydrateLanguage(): void {
  const select = document.querySelector<HTMLSelectElement>(CodeLanguage.switch.selector);
  if (!select) return;
  select.value = current();
  select.addEventListener("change", () => {
    const language = select.value;
    if (!isLanguage(language) || language === current()) return;

    const content = document.querySelector(Navigation.content.selector);
    const target = content ? anchor(content) : undefined;
    const before = target?.getBoundingClientRect().top;

    if (language === CodeLanguage.values[0]) document.documentElement.removeAttribute(CodeLanguage.root.name);
    else document.documentElement.setAttribute(CodeLanguage.root.name, language);
    try {
      localStorage.setItem(CodeLanguage.storage, language);
    } catch {
      // Storage blocked (private mode, disabled site data): the choice lasts until the page is closed
    }

    if (content && target && before !== undefined) content.scrollTop += target.getBoundingClientRect().top - before;
  });
}
