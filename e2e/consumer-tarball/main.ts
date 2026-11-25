import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideVoltTheme } from '@voltui/components';
import { App } from './app';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration(),
    provideVoltTheme({ color: 'volt', style: 'sharp', dark: false }),
  ],
}).catch(e => console.error(e));
