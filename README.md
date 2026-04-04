# Volt UI

An Angular UI component library inspired by shadcn/ui, built on top of [ng-primitives](https://ng-primitives.dev).

## Features

- 🎨 **Fully customizable** - Copy components directly into your project and modify them
- ♿ **Accessible** - Built on ng-primitives with proper ARIA attributes
- 🎯 **Angular v21** - Uses zoneless change detection and standalone components
- 💅 **Tailwind CSS** - Styled with Tailwind CSS v4
- 📦 **TypeScript** - Fully typed with TypeScript
- 🌙 **Dark mode** - Built-in dark mode support

## Quick Start

### Using the CLI (like shadcn)

1. **Initialize volt/ui in your project:**
```bash
node cli/bin/volt init
```

2. **Add components:**
```bash
node cli/bin/volt add button
node cli/bin/volt add card
node cli/bin/volt add navigation-menu
```

3. **Use in your components:**
```typescript
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: `<ui-button variant="solid">Click me</ui-button>`
})
export class MyComponent {}
```

### Copy from Demo

Each component demo page includes a **"Copy code"** button that copies the full component source code to your clipboard. Simply:

1. Visit the component demo page
2. Click "Copy code" 
3. Paste into your project's `ui/` folder
4. Customize as needed

## Available Components

- [Button](./src/app/pages/docs/components/button.ts)
- [Badge](./src/app/pages/docs/components/badge.ts)
- [Card](./src/app/pages/docs/components/card.ts)
- [Input](./src/app/pages/docs/components/input.ts)
- [Checkbox](./src/app/pages/docs/components/checkbox.ts)
- [Switch](./src/app/pages/docs/components/switch.ts)
- [Select](./src/app/pages/docs/components/select.ts)
- [Tabs](./src/app/pages/docs/components/tabs.ts)
- [Accordion](./src/app/pages/docs/components/accordion.ts)
- [Navigation Menu](./src/app/pages/docs/components/navigation-menu.ts)
- [Tooltip](./src/app/pages/docs/components/tooltip.ts)
- [Avatar](./src/app/pages/docs/components/avatar.ts)
- [Radio](./src/app/pages/docs/components/radio.ts)
- [Toggle](./src/app/pages/docs/components/toggle.ts)
- [Separator](./src/app/pages/docs/components/separator.ts)

See all components in the [live demo](https://volt-ui.pages.dev).

## Dependencies

Components require:

```bash
npm install ng-primitives class-variance-authority
```

## Development

This project uses Angular CLI v21 with zoneless change detection.

### Start development server

```bash
pnpm start
```

### Build

```bash
pnpm build
```

### Build library

```bash
npx ng build volt
```

## Architecture

- **Standalone components** - No NgModules required
- **Zoneless change detection** - Uses signals for reactivity
- **Host directives** - ng-primitives applied via hostDirectives
- **CVA (class-variance-authority)** - For component variants
- **Signals** - input(), output(), model(), computed()

## Deploy to Cloudflare Pages

```bash
pnpm run deploy
```

## License

MIT
