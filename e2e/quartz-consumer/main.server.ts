import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { Demo } from './demo';

export default (context: BootstrapContext) =>
  bootstrapApplication(
    Demo,
    {
      providers: [
        provideZonelessChangeDetection(),
        provideClientHydration(),
        provideServerRendering(),
      ],
    },
    context
  );
