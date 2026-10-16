import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AsyncDataApp } from './async-data';
import '../styles.css';

bootstrapApplication(AsyncDataApp, {
  providers: [provideZonelessChangeDetection(), provideRouter([{ path: '**', children: [] }])],
}).catch(error => console.error(error));
