# Volt UI - AI Context

## Project Identity

**Volt UI** is an Angular v21 component library inspired by shadcn/ui, built on top of ng-primitives for accessibility primitives.

## Core Architecture

### Framework Stack
- **Angular v21** with zoneless change detection
- **TypeScript** with strict types
- **Tailwind CSS v4** for styling
- **ng-primitives** for accessible component primitives
- **class-variance-authority (CVA)** for component variants

### Design Principles
1. **Standalone Components** - No NgModules, use `imports` array
2. **Zoneless Reactivity** - Use signals: `input()`, `output()`, `model()`, `computed()`
3. **Accessibility First** - Leverage ng-primitives for ARIA and keyboard navigation
4. **Type-Safe Variants** - CVA for variant definitions with full TypeScript support
5. **Host Directives** - Apply ng-primitives via `hostDirectives`
6. **Copy-Paste Friendly** - Components live in your codebase, fully customizable

## Naming Conventions

| Context | Selector | Class Name | Example |
|---------|----------|------------|---------|
| Source (Library) | `volt-*` | `Volt*` | `volt-button` / `VoltButton` |
| CLI Output | `ui-*` | `Ui*` | `ui-button` / `UiButton` |

## Component List

### Form Controls
- **button** - Button with variants (solid, outline, ghost, link, destructive)
- **input** - Text input field
- **textarea** - Multi-line text input
- **checkbox** - Checkbox with indeterminate state
- **radio** - Radio group and items
- **switch** - Toggle switch
- **toggle** - Toggle button (pressed state)
- **select** - Dropdown select with content, items, label, separator

### Layout
- **card** - Card container (card, header, title, description, content, footer)
- **separator** - Visual divider (horizontal/vertical)

### Navigation
- **tabs** - Tabbed interface (tabs, list, trigger, content)
- **accordion** - Collapsible panels
- **navigation-menu** - Navigation with dropdowns

### Display
- **badge** - Label/badge component
- **avatar** - User avatar (avatar, image, fallback)
- **tooltip** - Floating tooltip
- **form-field** - Form wrapper (field, label, hint, error)

## Component Patterns

### CVA Pattern (for variants)
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm'
      }
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md'
    }
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

### Signal Input Pattern
```typescript
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  
  protected readonly classes = computed(() => 
    buttonVariants({ variant: this.variant(), size: this.size() })
  );
}
```

### Host Directive Pattern
```typescript
@Component({
  selector: 'volt-button',
  imports: [NgpButton],  // ng-primitive directive
  template: `<button ngpButton [class]="classes()">...</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Simple Host Class Pattern
```typescript
@Component({
  selector: 'volt-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rounded-xl border border-border bg-surface shadow-sm' },
  template: `<ng-content />`
})
export class VoltCard {}
```

## CLI Usage

### Initialize
```bash
node /path/to/volt-ui/cli/bin/volt init [target-dir]
```
Default target: `./src/app/ui`

### Add Component
```bash
node /path/to/volt-ui/cli/bin/volt add <component-name> [target-dir]
```

Transformations applied:
- `volt-*` → `ui-*` selectors
- `Volt*` → `Ui*` class names
- Imports updated to local paths

### List Components
```bash
node /path/to/volt-ui/cli/bin/volt list
```

## Theme System

### Theme Colors
- `volt` (default) - Blue-purple
- `ember` - Warm orange-red
- `sage` - Green
- `dusk` - Purple
- `glacier` - Cool blue

### Theme Styles
- `sharp` (default) - Moderate radius
- `soft` - Larger radius
- `brutal` - No radius, heavy borders
- `ghost` - Minimal, transparent
- `retro` - Classic aesthetic

### Applying Themes

Via provider (app.config.ts):
```typescript
import { provideVoltTheme } from 'volt/theme';

export const appConfig = {
  providers: [
    provideVoltTheme({ 
      color: 'ember', 
      style: 'soft', 
      dark: false 
    })
  ]
};
```

Dynamically:
```typescript
import { applyVoltTheme } from 'volt/theme';

applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });
```

## CSS Variables

### Core Variables
```css
--color-background, --color-foreground
--color-surface, --color-surface-foreground
--color-primary, --color-primary-foreground
--color-destructive, --color-destructive-foreground
--color-muted, --color-muted-foreground
--color-border, --color-ring, --color-input
--radius-sm, --radius-md, --radius-lg, --radius-xl
```

## Usage Examples

### Button
```typescript
import { UiButton } from './ui/button';
```
```html
<ui-button variant="solid" size="lg">Submit</ui-button>
<ui-button variant="outline" size="sm">Cancel</ui-button>
<ui-button variant="destructive">Delete</ui-button>
<ui-button variant="ghost" size="icon">✕</ui-button>
```

### Card
```typescript
import { UiCard, UiCardHeader, UiCardTitle, UiCardDescription, UiCardContent, UiCardFooter } from './ui/card';
```
```html
<ui-card>
  <ui-card-header>
    <ui-card-title>Title</ui-card-title>
    <ui-card-description>Description</ui-card-description>
  </ui-card-header>
  <ui-card-content>Content</ui-card-content>
  <ui-card-footer>
    <ui-button variant="outline">Cancel</ui-button>
    <ui-button>Save</ui-button>
  </ui-card-footer>
</ui-card>
```

### Form Field
```typescript
import { UiFormField, UiFormFieldLabel, UiFormFieldHint, UiFormFieldError } from './ui/form-field';
import { UiInput } from './ui/input';
```
```html
<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input type="email" placeholder="you@example.com" />
  <ui-form-field-hint>We'll never share your email</ui-form-field-hint>
</ui-form-field>
```

### Tabs
```typescript
import { UiTabs, UiTabsList, UiTabsTrigger, UiTabsContent } from './ui/tabs';
```
```html
<ui-tabs value="account">
  <ui-tabs-list>
    <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
    <ui-tabs-trigger value="settings">Settings</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="account">Account content</ui-tabs-content>
  <ui-tabs-content value="settings">Settings content</ui-tabs-content>
</ui-tabs>
```

## Dependencies

User projects must install:
```bash
npm install ng-primitives class-variance-authority
```

## File Locations

### Source Components
```
projects/volt/src/lib/
├── button/
│   ├── button.ts
│   └── index.ts
├── card/
│   ├── card.component.ts
│   └── index.ts
└── ...
```

### Themes
```
projects/volt/src/themes/
├── core.css
├── colors/
│   ├── volt.css
│   ├── ember.css
│   └── ...
└── styles/
    ├── sharp.css
    ├── soft.css
    └── ...
```

### Public API
```
projects/volt/src/public-api.ts
```

## Best Practices

1. **Always use OnPush** change detection strategy
2. **Use signal inputs** instead of @Input decorators
3. **Use computed()** for derived state and class combinations
4. **Use ng-primitives** for accessibility (NgpButton, NgpCheckbox, etc.)
5. **Keep components composable** with `<ng-content>`
6. **Use CVA** for all variant definitions
7. **Prefix library selectors** with `volt-` (CLI transforms to `ui-`)
8. **Test with @testing-library/angular** and Vitest

## Common Tasks

### Adding a New Component
1. Create folder: `projects/volt/src/lib/<name>/`
2. Create component with `Volt*` class and `volt-*` selector
3. Create `index.ts` with exports
4. Add to `public-api.ts`
5. Add to CLI's components map in `cli/bin/volt`

### Creating Component Variants
Use CVA with explicit variant types:
```typescript
variants: {
  variant: {
    solid: '...',
    outline: '...'
  }
}
```

### Handling Component State
Use ng-primitives data attributes in CSS:
```css
.data-hover\:bg-primary\/90[data-hover] { }
.data-press\:scale-\[0\.98\][data-press] { }
.data-disabled\:opacity-50[data-disabled] { }
```
