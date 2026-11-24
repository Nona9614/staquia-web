import setupStore from "../stores/setup.store.ts";
import { setupChanged } from "../events/app.events.ts";
import { applyPreset, bindings, changeField } from "../services/setup.service.ts";
import { SetupApp } from "../contract.ts";

/**
 * Hydrates the Setup App form: every input change goes through the `changeField` service, valid values
 * are stored, and `setupChanged` updates every `SetupApp.bind` element and the inputs that depend on the
 * changed one (`base` ↔ `last`/`first`).
 */
export function hydrateSetupApp(): void {
  const form = document.querySelector<HTMLFormElement>(SetupApp.form.selector);
  if (!form) return;
  const binds = document.querySelectorAll<HTMLElement>(SetupApp.bind.selector);
  const dependents = (["base", "last"] as const).map((name) => [name, form.elements.namedItem(name)] as const);
  // Every input, a preset changes all of them
  const inputs = (["zero", "first", "last", "base", "ln", "lz", "fϰ"] as const).map((name) => [name, form.elements.namedItem(name)] as const);
  const buttons = form.querySelectorAll<HTMLButtonElement>(SetupApp.preset.selector);
  const modes = document.querySelectorAll<HTMLElement>(SetupApp.mode.selector);

  // The preset buttons ("Default" is the form reset, handled below)
  for (const button of buttons) {
    if (button.type === "reset") continue;
    button.addEventListener("click", () => {
      const change = applyPreset(setupStore.values, button.dataset[SetupApp.preset.key]!);
      if (!change?.ok) return;
      for (const input of form.querySelectorAll("input")) {
        input.setCustomValidity("");
        input.removeAttribute("aria-invalid");
        input.title = "";
      }
      setupStore.set(change.values);
      for (const [name, input] of inputs) {
        if (input instanceof HTMLInputElement) input.value = String(change.values[name]);
      }
      setupChanged.trigger(setupStore.values);
    });
  }

  form.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    const change = changeField(setupStore.values, target.name, target.value);
    if (!change) return;

    target.setCustomValidity(change.ok ? "" : change.reason);
    target.title = change.ok ? "" : change.reason;
    if (!change.ok) {
      target.setAttribute("aria-invalid", "true");
      return;
    }
    target.removeAttribute("aria-invalid");
    setupStore.set(change.values);
    setupChanged.trigger(setupStore.values);
  });

  // The native reset puts every input back to its `value` attribute (the defaults) right after this event
  form.addEventListener("reset", () => {
    for (const input of form.querySelectorAll("input")) {
      input.setCustomValidity("");
      input.removeAttribute("aria-invalid");
      input.title = "";
    }
    setupStore.reset();
    setupChanged.trigger(setupStore.values);
  });

  setupChanged.subscribe((values) => {
    // Inputs that depend on others, without fighting the one being edited
    for (const [name, input] of dependents) {
      if (input instanceof HTMLInputElement && input !== document.activeElement) input.value = String(values[name]);
    }
    // The pressed preset and the code that matches it
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset[SetupApp.preset.key] === values.preset));
    for (const mode of modes) mode.hidden = (mode.getAttribute(SetupApp.mode.name) === "preset") !== (values.preset !== "");
    const bound = bindings(values);
    for (const element of binds) {
      const value = bound[element.dataset[SetupApp.bind.key]!];
      if (value !== undefined) element.textContent = String(value);
    }
  });
}
