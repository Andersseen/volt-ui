import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { Demo } from './demo';

bootstrapApplication(Demo, {
  providers: [provideZonelessChangeDetection(), provideClientHydration()],
}).catch(e => console.error(e));
