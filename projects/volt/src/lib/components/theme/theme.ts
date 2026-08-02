import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type VoltThemeColor = 'volt' | 'ember' | 'sage' | 'dusk' | 'glacier';
export type VoltThemeStyle = 'sharp' | 'soft' | 'brutal' | 'ghost' | 'retro';

export interface VoltThemeOptions {
  color?: VoltThemeColor;
  style?: VoltThemeStyle;
  dark?: boolean;
}

function getDocument(doc?: Document): Document | null {
  if (doc) {
    return doc;
  }

  return typeof document !== 'undefined' ? document : null;
}

export function applyVoltTheme(options: VoltThemeOptions = {}, doc?: Document): void {
  const activeDocument = getDocument(doc);
  if (!activeDocument) {
    return;
  }

  const root = activeDocument.documentElement;

  if (options.color) {
    root.setAttribute('data-color', options.color);
  }

  if (options.style) {
    root.setAttribute('data-style', options.style);
  }

  if (options.dark !== undefined) {
    root.classList.toggle('dark', options.dark);
    root.style.colorScheme = options.dark ? 'dark' : 'light';
  }
}

export function provideVoltTheme(options: VoltThemeOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      // Reads the platform-provided Document (the domino-backed document on
      // the server, the real one in the browser) instead of the global
      // `document`, which is undefined during SSR — without this, an SSR
      // app never gets data-color/data-style/.dark in the server-rendered
      // HTML, causing a themed-then-unthemed flash before hydration.
      applyVoltTheme(options, inject(DOCUMENT));
    }),
  ]);
}
