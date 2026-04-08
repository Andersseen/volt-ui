import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';

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
  }
}

export function provideVoltTheme(options: VoltThemeOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      applyVoltTheme(options);
    }),
  ]);
}
