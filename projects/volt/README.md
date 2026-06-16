# @voltui/components

Accessible Angular components built on top of ng-primitives, with Volt UI themes and standalone
imports.

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
import { Component } from '@angular/core';
import { VoltButton, VoltSlider } from '@voltui/components';

@Component({
  selector: 'app-example',
  imports: [VoltButton, VoltSlider],
  template: `
    <volt-button>Save</volt-button>
    <volt-slider [value]="10" [min]="0" [max]="24" />
  `,
})
export class ExampleComponent {}
```

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
