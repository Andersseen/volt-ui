import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideVoltTheme } from '@voltui/components';
import { App } from './app';

export default (context: BootstrapContext) =>
  bootstrapApplication(
    App,
    {
      providers: [
        provideZonelessChangeDetection(),
        provideClientHydration(),
        provideServerRendering(),
        provideVoltTheme({ color: 'volt', style: 'sharp', dark: false }),
      ],
    },
    context
  );
