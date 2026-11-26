import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideVoltTheme } from '@voltui/components';
import { App } from './app';

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration(),
    provideRouter([]),
    provideVoltTheme({ color: 'volt', style: 'soft', dark: false }),
  ],
}).catch(e => console.error(e));
