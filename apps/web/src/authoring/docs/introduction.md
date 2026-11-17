---
title: 'Introduction'
description: 'Volt UI is a collection of reusable, accessible Angular components inspired by shadcn/ui. Install the package, or copy the source into your project and make it your own.'
group: 'Getting Started'
order: 1
---

The components are built on [ng-primitives](https://ng-primitives.dev). An experimental second entry point, `@voltui/components/quartz`, runs nine of them (Accordion, Checkbox, Listbox, Radio, Select, Switch, Tabs, Toggle and Toggle Group) on Quartz Headless with the same selectors and inputs. It ships with `@voltui/components` from 1.4.1 on.

## AI Tools for Consumers

Volt UI ships with three complementary ways to give AI assistants full context about its components, selectors, and conventions.

- [Agent Skills](/docs/ai-skill) — Focused playbooks for Claude Code, Codex and OpenCode: when to use Volt, which component fits, how to compose it.
- [MCP Server](/docs/ai-mcp) — Hosted MCP tools for listing components, getting examples, and generating CLI commands.
- [Prompt Reference](/docs/ai-prompt) — A single-file prompt to paste into any LLM chat for correct selectors and examples.

## Installation Options

There are three ways to use Volt UI components in your project:

### Option 1: npm package

Install the library directly from npm and import components in your project.

```bash
npm install @voltui/components
```

```css
@import '@voltui/components/themes.css';
```

Then import: `from '@voltui/components'`.

### Option 2: CLI (shadcn-style)

Copy component source files into your project with ui-* prefix. Full customization.

```bash
npx @voltui/cli init
npx @voltui/cli add button card input
```

Use `--dry-run` to preview files and `--force` to overwrite edited components.

### Option 3: Copy & Paste

Browse component demos and copy the source code directly. Full control over the implementation. [Browse Components](/docs/components)

## Naming Conventions

Volt UI uses different prefixes for library source and CLI-generated output.

| Context        | Selector               | Class name | Import path            |
| -------------- | ---------------------- | ---------- | ---------------------- |
| Library source | `volt-*` / `[voltXxx]` | `VoltXxx`  | `'@voltui/components'` |
| CLI output     | `ui-*` / `[uiXxx]`     | `UiXxx`    | `'./ui/<component>'`   |

## Prerequisites

Before using Volt UI components, ensure you have the following dependencies installed:

### npm package

Runtime dependencies are included automatically. Import the theme CSS once in your global stylesheet.

```bash
npm install @voltui/components
```

### CLI / Copy & Paste — runtime deps

```bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
```

### Tailwind CSS v4

Volt components ship critical layout CSS, so npm consumers do not need an `@source` directive for `node_modules`.

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

## Theme System

Volt UI provides semantic Tailwind tokens via CSS custom properties. Configure the theme in your app config.

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [
    provideVoltTheme({
      color: 'volt', // volt | ember | sage | dusk | glacier
      style: 'sharp', // sharp | soft | brutal | ghost | retro
      density: 'comfortable', // compact | comfortable | spacious
      dark: false,
    }),
  ],
});
```

## Project Structure

When using the CLI, components are added to your project's ui folder:

```text
src/app/
  ui/
    button/
      button.ts
      index.ts
    card/
      card.ts
      index.ts
    ...
```

## Usage

After adding a component, import and use it in your Angular components:

```ts
import { Component } from '@angular/core';
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: '<ui-button variant="solid">Click me</ui-button>',
})
export class MyComponent {}
```

## Overlay Components

Dialog, drawer, popover, tooltip, and dropdown-menu use an attribute-directive trigger that references an `<ng-template>` containing the overlay content.

```html
<button [uiDialog]="dialogTpl">Open Dialog</button>

<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Confirm</h2>
    <p uiDialogDescription>Are you sure?</p>
    <ui-button (click)="close()">Confirm</ui-button>
  </div>
</ng-template>
```

## Component Catalog

Components marked **stable** have a settled API, tests that assert their own behavior, and documented usage. **Beta** marks recent additions whose API may still change in a minor release. The full policy is in [Versioning & stability](/docs/versioning).

::demo[component-catalog]

## Next Steps

- [Themes](/docs/themes) — Learn how to customize colors, typography, and dark mode.
- [Components](/docs/components) — Explore all available components with examples and source code.
- [AI Integration](/docs/mcp) — Configure the MCP server and IDE snippets for Claude, Cursor, Copilot, and more.
