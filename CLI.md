# Volt UI CLI

A CLI for adding Volt UI components to your Angular project, similar to shadcn/ui.

## Installation

### Local (from this repo)

```bash
# Use directly from the repo
node cli/bin/volt add button

# Or install globally
npm link
volt add button
```

### Usage

#### Initialize volt/ui in your project

```bash
volt init [target-dir]
```

This creates a `ui` folder with the necessary structure.

#### Add a component

```bash
volt add <component-name> [target-dir]
```

Example:

```bash
volt add button              # Adds to ./src/app/ui/button
volt add card ./components   # Adds to ./components/card
```

#### List available components

```bash
volt list
```

## Available Components

- `button` - Button component with variants
- `badge` - Badge component
- `card` - Card with header, content, footer
- `input` - Input field component
- `textarea` - Textarea component
- `checkbox` - Checkbox component
- `switch` - Switch/toggle component
- `radio` - Radio group component
- `select` - Select dropdown component
- `tabs` - Tabs component
- `accordion` - Accordion component
- `avatar` - Avatar component
- `separator` - Separator component
- `tooltip` - Tooltip component
- `navigation-menu` - Navigation menu component
- `form-field` - Form field wrapper
- `toggle` - Toggle button component

## How it works

When you run `volt add button`:

1. The component files are copied from `projects/volt/src/lib/button/` to your project's `ui/button/` folder
2. All selectors are transformed from `volt-*` to `ui-*` (e.g., `volt-button` → `ui-button`)
3. All class names are transformed from `VoltXxx` to `UiXxx` (e.g., `VoltButton` → `UiButton`)
4. Imports are updated to work locally

## Usage in your components

After adding a component:

```typescript
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: ` <ui-button variant="solid">Click me</ui-button> `,
})
export class MyComponent {}
```

## Dependencies

Components require these dependencies in your project:

```bash
npm install ng-primitives class-variance-authority
```

## Component Source Code

Each component demo page includes a "Copy code" button that lets you copy the full source code of the component directly to your clipboard. This makes it easy to:

1. Copy the component source
2. Paste it into your project
3. Customize it as needed

## Differences from npm package

- **No npm registry required** - Components are copied directly as source files
- **Full customization** - You own the code and can modify it freely
- **Tree-shakeable** - Only included components are bundled
- **No version conflicts** - Each project has its own copy
