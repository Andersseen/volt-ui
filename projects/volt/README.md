# @voltui/components

Angular UI atoms — buttons, inputs, cards, badges, alerts, overlays — built on signals, Tailwind
CSS v4 and ng-primitives. They stay out of the way of your product's own layout and design.

This package is one of Volt's two first-class workflows: import components from npm and receive
fixes through semver updates. Prefer owning the source? `npx @voltui/cli add button` copies the
same components into your project.

## Installation

```bash
npm install @voltui/components
```

Import the theme CSS once in your global stylesheet:

```css
@import '@voltui/components/themes.css';
```

Add the theme provider during application bootstrap:

```typescript
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [provideVoltTheme({ color: 'volt', style: 'sharp', dark: false })],
});
```

## Usage

```typescript
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltCard,
  VoltCardContent,
  VoltInput,
  VoltNativeButton,
  VoltToastService,
} from '@voltui/components';

@Component({
  selector: 'app-example',
  imports: [RouterLink, VoltCard, VoltCardContent, VoltInput, VoltNativeButton],
  template: `
    <volt-card>
      <volt-card-content class="p-4 space-y-3">
        <volt-input size="sm" class="w-40" aria-label="Project name" />
        <button voltButton (click)="save()">Save</button>
        <a voltButton variant="outline" routerLink="/docs">Docs</a>
      </volt-card-content>
    </volt-card>
  `,
})
export class ExampleComponent {
  private readonly toast = inject(VoltToastService);

  save() {
    this.toast.success('Saved');
  }
}
```

`class` on any component is merged with `cn()` over the defaults and applied to the element that
paints it, so `<volt-card-content class="p-4">` replaces the default padding.

## Tailwind CSS v4

Volt UI ships critical layout styles inside the Angular components. Apps using Tailwind CSS v4 do
not need to scan `node_modules/@voltui/components` with `@source` for components to render
correctly.

Your app can still use Tailwind normally for its own templates:

```css
@import 'tailwindcss';
@import '@voltui/components/themes.css';
```

## Themes

Available theme colors: `volt`, `ember`, `sage`, `dusk`, `glacier`.

Available styles: `sharp`, `soft`, `brutal`, `ghost`, `retro`.

```typescript
provideVoltTheme({ color: 'ember', style: 'soft', dark: true });
```

## Links

- Documentation: https://volt-ui.pages.dev
- Package: https://www.npmjs.com/package/@voltui/components
