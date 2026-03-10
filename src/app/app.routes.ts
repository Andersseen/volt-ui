import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then(m => m.Home)
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs-layout').then(m => m.DocsLayout),
    children: [
      { path: '', redirectTo: 'installation', pathMatch: 'full' },
      { path: 'installation', loadComponent: () => import('./pages/docs/installation').then(m => m.InstallationDocs) },
      { path: 'button', loadComponent: () => import('./pages/docs/components/button').then(m => m.ButtonDemo) },
      { path: 'badge', loadComponent: () => import('./pages/docs/components/badge').then(m => m.BadgeDemo) },
      { path: 'card', loadComponent: () => import('./pages/docs/components/card').then(m => m.CardDemo) },
      { path: 'input', loadComponent: () => import('./pages/docs/components/input').then(m => m.InputDemo) },
      { path: 'checkbox', loadComponent: () => import('./pages/docs/components/checkbox').then(m => m.CheckboxDemo) },
      { path: 'switch', loadComponent: () => import('./pages/docs/components/switch').then(m => m.SwitchDemo) },
      { path: 'avatar', loadComponent: () => import('./pages/docs/components/avatar').then(m => m.AvatarDemo) },
      { path: 'separator', loadComponent: () => import('./pages/docs/components/separator').then(m => m.SeparatorDemo) },
      { path: 'accordion', loadComponent: () => import('./pages/docs/components/accordion').then(m => m.AccordionDemo) },
      { path: 'tabs', loadComponent: () => import('./pages/docs/components/tabs').then(m => m.TabsDemo) },
      { path: 'select', loadComponent: () => import('./pages/docs/components/select').then(m => m.SelectDemo) },
    ]
  }
];
