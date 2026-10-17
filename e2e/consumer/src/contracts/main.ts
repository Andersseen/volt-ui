import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ContractsHost } from './host';
import '../styles.css';

bootstrapApplication(ContractsHost, {
  providers: [provideZonelessChangeDetection()],
}).catch(error => console.error(error));
