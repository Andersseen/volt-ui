import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs-layout.component').then(m => m.DocsLayoutComponent),
    children: [
      { path: '', redirectTo: 'installation', pathMatch: 'full' },
      { path: 'installation', loadComponent: () => import('./pages/docs/installation.component').then(m => m.InstallationDocsComponent) },
      { path: 'button', loadComponent: () => import('./pages/docs/components/button.component').then(m => m.ButtonDemoComponent) },
      { path: 'badge', loadComponent: () => import('./pages/docs/components/badge.component').then(m => m.BadgeDemoComponent) },
      { path: 'card', loadComponent: () => import('./pages/docs/components/card.component').then(m => m.CardDemoComponent) },
      { path: 'input', loadComponent: () => import('./pages/docs/components/input.component').then(m => m.InputDemoComponent) },
      { path: 'checkbox', loadComponent: () => import('./pages/docs/components/checkbox.component').then(m => m.CheckboxDemoComponent) },
      { path: 'switch', loadComponent: () => import('./pages/docs/components/switch.component').then(m => m.SwitchDemoComponent) },
      { path: 'avatar', loadComponent: () => import('./pages/docs/components/avatar.component').then(m => m.AvatarDemoComponent) },
      { path: 'separator', loadComponent: () => import('./pages/docs/components/separator.component').then(m => m.SeparatorDemoComponent) },
      { path: 'accordion', loadComponent: () => import('./pages/docs/components/accordion.component').then(m => m.AccordionDemoComponent) },
      { path: 'tabs', loadComponent: () => import('./pages/docs/components/tabs.component').then(m => m.TabsDemoComponent) },
      { path: 'select', loadComponent: () => import('./pages/docs/components/select.component').then(m => m.SelectDemoComponent) },
    ]
  }
];
