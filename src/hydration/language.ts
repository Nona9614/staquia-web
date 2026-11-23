import { CodeLanguage, Navigation, type CodeLanguageName } from "../contract.ts";

const isLanguage = (value: string | null | undefined): value is CodeLanguageName =>
  (CodeLanguage.values as readonly string[]).includes(value ?? "");

/** The language on `<html>` (written by the boot script from the stored choice), or the default. */
function current(): CodeLanguageName {
  const value = document.documentElement.getAttribute(CodeLanguage.root.name);
  return isLanguage(value) ? value : CodeLanguage.values[0];
}

/** Shows the chosen language in every switch. */
function sync(language: CodeLanguageName): void {
  for (const select of document.querySelectorAll<HTMLSelectElement>(CodeLanguage.switch.selector)) select.value = language;
}

/**
 * Hydrates the code language switches: choosing a language in any of them shows every sample in it, stores the
 * choice for the next visits and keeps the code block of the switch where it was on the screen.
 */
export function hydrateLanguage(): void {
  sync(current());
  document.addEventListener("change", (event) => {
    const select = event.target as HTMLSelectElement | null;
    if (!select?.matches(CodeLanguage.switch.selector)) return;
    const language = select.value;
    if (!isLanguage(language) || language === current()) return;

    // The samples above may change their height: keep this block still
    const block = select.closest(CodeLanguage.block.selector);
    const content = document.querySelector(Navigation.content.selector);
    const before = block?.getBoundingClientRect().top;

    if (language === CodeLanguage.values[0]) document.documentElement.removeAttribute(CodeLanguage.root.name);
    else document.documentElement.setAttribute(CodeLanguage.root.name, language);
    sync(language);
    try {
      localStorage.setItem(CodeLanguage.storage, language);
    } catch {
      // Storage blocked (private mode, disabled site data): the choice lasts until the page is closed
    }

    if (block && content && before !== undefined) content.scrollTop += block.getBoundingClientRect().top - before;
    // The switch of the variant now shown takes the focus, this one may be hidden
    const visible = [...(block?.querySelectorAll<HTMLSelectElement>(CodeLanguage.switch.selector) ?? [])].find((other) => other.offsetParent !== null);
    visible?.focus({ preventScroll: true });
  });
}
