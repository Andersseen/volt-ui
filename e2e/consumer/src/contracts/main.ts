import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { ContractsHost } from './host';
import '../styles.css';

bootstrapApplication(ContractsHost, {
  // Only the catalog needs a router (its sidebar item is a routerLink). Elsewhere it would react to
  // the hash navigation other fixtures rely on, so it is not provided there.
  providers: [
    provideZonelessChangeDetection(),
    ...(location.hash === '#catalog' ? [provideRouter([], withDisabledInitialNavigation())] : []),
  ],
}).catch(error => console.error(error));
