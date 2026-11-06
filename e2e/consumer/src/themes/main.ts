import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ThemeGallery } from './gallery';
import './themes.css';

bootstrapApplication(ThemeGallery, {
  providers: [provideZonelessChangeDetection()],
}).catch(error => console.error(error));
