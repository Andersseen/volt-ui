import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home'),
  },
  // Getting Started
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs-layout'),
    children: [
      { path: '', redirectTo: 'introduction', pathMatch: 'full' },
      {
        path: 'introduction',
        loadComponent: () => import('./pages/docs/introduction/introduction'),
      },
      {
        path: 'themes',
        loadComponent: () => import('./pages/docs/introduction/themes'),
      },
      {
        path: 'mcp',
        loadComponent: () => import('./pages/docs/mcp'),
      },
    ],
  },
  // Components section — own layout + sidebar
  {
    path: 'docs/components',
    loadComponent: () => import('./pages/docs/components-layout'),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/docs/components-index'),
      },
      {
        path: 'accordion',
        loadComponent: () => import('./pages/docs/components/accordion'),
      },
      {
        path: 'avatar',
        loadComponent: () => import('./pages/docs/components/avatar'),
      },
      {
        path: 'badge',
        loadComponent: () => import('./pages/docs/components/badge'),
      },
      {
        path: 'button',
        loadComponent: () => import('./pages/docs/components/button'),
      },
      {
        path: 'card',
        loadComponent: () => import('./pages/docs/components/card'),
      },
      {
        path: 'checkbox',
        loadComponent: () => import('./pages/docs/components/checkbox'),
      },
      {
        path: 'dialog',
        loadComponent: () => import('./pages/docs/components/dialog'),
      },
      {
        path: 'input',
        loadComponent: () => import('./pages/docs/components/input'),
      },
      {
        path: 'navigation-menu',
        loadComponent: () => import('./pages/docs/components/navigation-menu'),
      },
      {
        path: 'radio',
        loadComponent: () => import('./pages/docs/components/radio'),
      },
      {
        path: 'select',
        loadComponent: () => import('./pages/docs/components/select'),
      },
      {
        path: 'separator',
        loadComponent: () => import('./pages/docs/components/separator'),
      },
      {
        path: 'switch',
        loadComponent: () => import('./pages/docs/components/switch'),
      },
      {
        path: 'tabs',
        loadComponent: () => import('./pages/docs/components/tabs'),
      },
      {
        path: 'toggle',
        loadComponent: () => import('./pages/docs/components/toggle'),
      },
      {
        path: 'tooltip',
        loadComponent: () => import('./pages/docs/components/tooltip'),
      },
    ],
  },
  // Icons section — single page, no layout wrapper needed
  {
    path: 'docs/icons',
    loadComponent: () => import('./pages/docs/icons'),
  },
  // Layouts section — own layout + sidebar
  {
    path: 'docs/layouts',
    loadComponent: () => import('./pages/docs/layouts-layout'),
    children: [
      { path: '', redirectTo: 'sidebar', pathMatch: 'full' },
      {
        path: 'sidebar',
        loadComponent: () => import('./pages/docs/layouts/sidebar'),
      },
    ],
  },
];
