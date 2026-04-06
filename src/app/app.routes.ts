import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home'),
  },
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
        path: 'components',
        loadComponent: () => import('./pages/docs/components-index'),
      },
      {
        path: 'mcp',
        loadComponent: () => import('./pages/docs/mcp'),
      },
      // Individual component docs - using new folder structure
      {
        path: 'button',
        loadComponent: () => import('./pages/docs/components/button'),
      },
      {
        path: 'badge',
        loadComponent: () => import('./pages/docs/components/badge'),
      },
      {
        path: 'card',
        loadComponent: () => import('./pages/docs/components/card'),
      },
      {
        path: 'input',
        loadComponent: () => import('./pages/docs/components/input'),
      },
      {
        path: 'checkbox',
        loadComponent: () => import('./pages/docs/components/checkbox'),
      },
      {
        path: 'switch',
        loadComponent: () => import('./pages/docs/components/switch'),
      },
      {
        path: 'avatar',
        loadComponent: () => import('./pages/docs/components/avatar'),
      },
      {
        path: 'separator',
        loadComponent: () => import('./pages/docs/components/separator'),
      },
      {
        path: 'accordion',
        loadComponent: () => import('./pages/docs/components/accordion'),
      },
      {
        path: 'tabs',
        loadComponent: () => import('./pages/docs/components/tabs'),
      },
      {
        path: 'select',
        loadComponent: () => import('./pages/docs/components/select'),
      },
      {
        path: 'radio',
        loadComponent: () => import('./pages/docs/components/radio'),
      },
      {
        path: 'toggle',
        loadComponent: () => import('./pages/docs/components/toggle'),
      },
      {
        path: 'tooltip',
        loadComponent: () => import('./pages/docs/components/tooltip'),
      },
      {
        path: 'navigation-menu',
        loadComponent: () => import('./pages/docs/components/navigation-menu'),
      },
      {
        path: 'dialog',
        loadComponent: () => import('./pages/docs/components/dialog'),
      },
    ],
  },
];
