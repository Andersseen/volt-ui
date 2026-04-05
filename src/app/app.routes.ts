import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((m) => m.Home),
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs-layout').then((m) => m.DocsLayout),
    children: [
      { path: '', redirectTo: 'introduction', pathMatch: 'full' },
      {
        path: 'introduction',
        loadComponent: () => import('./pages/docs/introduction/introduction').then((m) => m.IntroductionPage),
      },
      {
        path: 'themes',
        loadComponent: () => import('./pages/docs/introduction/themes').then((m) => m.ThemesPage),
      },
      {
        path: 'components',
        loadComponent: () => import('./pages/docs/components-index').then((m) => m.ComponentsIndexPage),
      },
      {
        path: 'mcp',
        loadComponent: () => import('./pages/docs/mcp').then((m) => m.McpDocsPage),
      },
      // Individual component docs
      {
        path: 'button',
        loadComponent: () => import('./pages/docs/components/button').then((m) => m.ButtonDemo),
      },
      {
        path: 'badge',
        loadComponent: () => import('./pages/docs/components/badge').then((m) => m.BadgeDemo),
      },
      {
        path: 'card',
        loadComponent: () => import('./pages/docs/components/card').then((m) => m.CardDemo),
      },
      {
        path: 'input',
        loadComponent: () => import('./pages/docs/components/input').then((m) => m.InputDemo),
      },
      {
        path: 'checkbox',
        loadComponent: () => import('./pages/docs/components/checkbox').then((m) => m.CheckboxDemo),
      },
      {
        path: 'switch',
        loadComponent: () => import('./pages/docs/components/switch').then((m) => m.SwitchDemo),
      },
      {
        path: 'avatar',
        loadComponent: () => import('./pages/docs/components/avatar').then((m) => m.AvatarDemo),
      },
      {
        path: 'separator',
        loadComponent: () =>
          import('./pages/docs/components/separator').then((m) => m.SeparatorDemo),
      },
      {
        path: 'accordion',
        loadComponent: () =>
          import('./pages/docs/components/accordion').then((m) => m.AccordionDemo),
      },
      {
        path: 'tabs',
        loadComponent: () => import('./pages/docs/components/tabs').then((m) => m.TabsDemo),
      },
      {
        path: 'select',
        loadComponent: () => import('./pages/docs/components/select').then((m) => m.SelectDemo),
      },
      {
        path: 'radio',
        loadComponent: () => import('./pages/docs/components/radio').then((m) => m.RadioDemo),
      },
      {
        path: 'toggle',
        loadComponent: () => import('./pages/docs/components/toggle').then((m) => m.ToggleDemo),
      },
      {
        path: 'tooltip',
        loadComponent: () => import('./pages/docs/components/tooltip').then((m) => m.TooltipDemo),
      },
      {
        path: 'navigation-menu',
        loadComponent: () =>
          import('./pages/docs/components/navigation-menu').then((m) => m.NavigationMenuDemo),
      },
      {
        path: 'dialog',
        loadComponent: () =>
          import('./pages/docs/components/dialog').then((m) => m.DialogDemo),
      },
    ],
  },
];
