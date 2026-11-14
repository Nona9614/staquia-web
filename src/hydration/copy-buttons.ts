import { CopyButton } from "../contract.ts";

/** How long the "copied" note stays before going back to the idle text. */
const NOTE_DURATION = 1200;

/**
 * Hydrates the copy buttons. A single listener handles every `CopyButton.target` button,
 * copying the text of the element whose id is in the attribute.
 */
export function hydrateCopyButtons(): void {
  const { target, note, text } = CopyButton;
  const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

  document.addEventListener("click", async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>(target.selector);
    if (!button) return;
    const source = document.getElementById(button.dataset[target.key]!);
    const label = button.querySelector<HTMLElement>(note.selector);
    if (!source) return;

    let result: string;
    try {
      await navigator.clipboard.writeText(source.textContent ?? "");
      result = text.copied;
    } catch {
      result = text.failed;
    }

    if (!label) return;
    label.textContent = result;
    clearTimeout(timers.get(button));
    timers.set(
      button,
      setTimeout(() => (label.textContent = text.idle), NOTE_DURATION),
    );
  });
}
