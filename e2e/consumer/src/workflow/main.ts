import '@angular/compiler';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AdminWorkflow } from './admin-workflow';
import '../styles.css';

bootstrapApplication(AdminWorkflow, {
  providers: [provideZonelessChangeDetection(), provideRouter([{ path: '**', children: [] }])],
}).catch(error => console.error(error));
