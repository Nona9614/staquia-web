import Emitter from "./emitter.ts";
import type { Page } from "../types/page.ts";
import type { SetupValues } from "../data/setup.ts";

/** Triggered after the current page changes (the URL hash is the source of truth). */
export const pageChanged = new Emitter<Page>();

/** Triggered after the Setup App values change. */
export const setupChanged = new Emitter<Readonly<SetupValues>>();
