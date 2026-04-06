# Volt UI - GitHub Copilot Instructions

## Project Context

Volt UI is an Angular v21 component library inspired by shadcn/ui, built on top of ng-primitives for accessibility primitives.

### Key Technologies

- Angular v21 with zoneless change detection
- ng-primitives (accessible component primitives)
- Tailwind CSS v4
- class-variance-authority (CVA) for variants
- TypeScript with strict types
- Signals for reactivity

## Component Conventions

### Library Source (projects/volt/src/lib/)

```typescript
// Selector: volt-*
// Class: Volt*
@Component({
  selector: 'volt-button',
  imports: [NgpButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
}
```

### User Project (after CLI)

```typescript
// Selector: ui-*
// Class: Ui*
import { UiButton } from './ui/button';

@Component({
  imports: [UiButton],
})
export class MyComponent {}
```

## Available Components

| Component       | Import Path          | Selector                                                                                                                     | Key Inputs                       |
| --------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Button          | ./ui/button          | ui-button                                                                                                                    | variant, size, disabled          |
| Badge           | ./ui/badge           | ui-badge                                                                                                                     | variant                          |
| Card            | ./ui/card            | ui-card, ui-card-header, ui-card-title, ui-card-description, ui-card-content, ui-card-footer                                 | -                                |
| Input           | ./ui/input           | ui-input                                                                                                                     | disabled, placeholder            |
| Textarea        | ./ui/textarea        | ui-textarea                                                                                                                  | rows, disabled                   |
| Checkbox        | ./ui/checkbox        | ui-checkbox                                                                                                                  | checked, disabled, indeterminate |
| Radio           | ./ui/radio           | ui-radio-group, ui-radio-item                                                                                                | value, disabled                  |
| Switch          | ./ui/switch          | ui-switch                                                                                                                    | checked, disabled                |
| Toggle          | ./ui/toggle          | ui-toggle                                                                                                                    | pressed, disabled                |
| Select          | ./ui/select          | ui-select, ui-select-content, ui-select-item, ui-select-label, ui-select-separator                                           | value, placeholder, disabled     |
| Tabs            | ./ui/tabs            | ui-tabs, ui-tabs-list, ui-tabs-trigger, ui-tabs-content                                                                      | value                            |
| Accordion       | ./ui/accordion       | ui-accordion, ui-accordion-item, ui-accordion-trigger, ui-accordion-content                                                  | type, collapsible                |
| Avatar          | ./ui/avatar          | ui-avatar, ui-avatar-image, ui-avatar-fallback                                                                               | src, alt, delayMs                |
| Separator       | ./ui/separator       | ui-separator                                                                                                                 | orientation                      |
| Tooltip         | ./ui/tooltip         | ui-tooltip, ui-tooltip-content                                                                                               | content, side, align             |
| Navigation Menu | ./ui/navigation-menu | ui-navigation-menu, ui-navigation-menu-list, ui-navigation-menu-item, ui-navigation-menu-trigger, ui-navigation-menu-content | value                            |
| Form Field      | ./ui/form-field      | ui-form-field, ui-form-field-label, ui-form-field-hint, ui-form-field-error                                                  | -                                |

## Button Variants

```typescript
variant: 'solid' | 'outline' | 'ghost' | 'link' | 'destructive'
size: 'sm' | 'md' | 'lg' | 'icon'

// Usage
<ui-button variant="solid" size="md">Click me</ui-button>
<ui-button variant="outline" size="sm">Cancel</ui-button>
<ui-button variant="destructive" size="lg">Delete</ui-button>
```

## Card Pattern

```typescript
import { UiCard, UiCardHeader, UiCardTitle, UiCardDescription, UiCardContent, UiCardFooter } from './ui/card';

@Component({
  imports: [UiCard, UiCardHeader, UiCardTitle, UiCardDescription, UiCardContent, UiCardFooter, UiButton]
})
```

```html
<ui-card>
  <ui-card-header>
    <ui-card-title>Card Title</ui-card-title>
    <ui-card-description>Card description text</ui-card-description>
  </ui-card-header>
  <ui-card-content>
    <p>Main content goes here</p>
  </ui-card-content>
  <ui-card-footer>
    <ui-button variant="outline">Cancel</ui-button>
    <ui-button>Save</ui-button>
  </ui-card-footer>
</ui-card>
```

## Form Field Pattern

```typescript
import { UiFormField, UiFormFieldLabel, UiFormFieldHint, UiFormFieldError } from './ui/form-field';
import { UiInput } from './ui/input';
```

```html
<ui-form-field>
  <ui-form-field-label>Email</ui-form-field-label>
  <ui-input type="email" placeholder="Enter email" />
  <ui-form-field-hint>We'll never share your email</ui-form-field-hint>
  <ui-form-field-error>Email is required</ui-form-field-error>
</ui-form-field>
```

## Tabs Pattern

```typescript
import { UiTabs, UiTabsList, UiTabsTrigger, UiTabsContent } from './ui/tabs';
```

```html
<ui-tabs value="account">
  <ui-tabs-list>
    <ui-tabs-trigger value="account">Account</ui-tabs-trigger>
    <ui-tabs-trigger value="password">Password</ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="account">Account settings</ui-tabs-content>
  <ui-tabs-content value="password">Password settings</ui-tabs-content>
</ui-tabs>
```

## Theme System

```typescript
import { provideVoltTheme, applyVoltTheme } from 'volt/theme';

// In app.config.ts
providers: [
  provideVoltTheme({
    color: 'ember', // 'volt' | 'ember' | 'sage' | 'dusk' | 'glacier'
    style: 'soft', // 'sharp' | 'soft' | 'brutal' | 'ghost' | 'retro'
    dark: false,
  }),
];

// Or dynamically
applyVoltTheme({ color: 'dusk', style: 'brutal', dark: true });
```

## CLI Commands

```bash
# Initialize Volt UI in project
node cli/bin/volt init

# Add component
node cli/bin/volt add button

# Add to custom directory
node cli/bin/volt add card ./src/components/ui

# List available components
node cli/bin/volt list
```

## Code Generation Guidelines

When generating code with Volt UI:

1. Use standalone components with `imports` array
2. Use OnPush change detection
3. Import Volt UI components from `./ui/<component>`
4. Use signal inputs for component properties
5. Apply appropriate variants using CVA patterns
6. Use ng-primitives directives for accessibility
7. Include proper TypeScript types

## Example: Complete Component

```typescript
import { Component } from '@angular/core';
import { UiButton } from './ui/button';
import { UiCard, UiCardHeader, UiCardTitle, UiCardContent, UiCardFooter } from './ui/card';
import { UiInput } from './ui/input';
import { UiFormField, UiFormFieldLabel } from './ui/form-field';

@Component({
  selector: 'app-login-form',
  imports: [
    UiButton,
    UiCard,
    UiCardHeader,
    UiCardTitle,
    UiCardContent,
    UiCardFooter,
    UiInput,
    UiFormField,
    UiFormFieldLabel,
  ],
  template: `
    <ui-card class="w-full max-w-md">
      <ui-card-header>
        <ui-card-title>Login</ui-card-title>
      </ui-card-header>
      <ui-card-content class="space-y-4">
        <ui-form-field>
          <ui-form-field-label>Email</ui-form-field-label>
          <ui-input type="email" placeholder="you@example.com" />
        </ui-form-field>
        <ui-form-field>
          <ui-form-field-label>Password</ui-form-field-label>
          <ui-input type="password" />
        </ui-form-field>
      </ui-card-content>
      <ui-card-footer class="flex justify-end gap-2">
        <ui-button variant="outline">Cancel</ui-button>
        <ui-button>Sign In</ui-button>
      </ui-card-footer>
    </ui-card>
  `,
})
export class LoginFormComponent {}
```

## Common Patterns

### Loading State

```html
<ui-button [disabled]="isLoading()">
  @if (isLoading()) {
  <span class="animate-spin">⟳</span>
  } Submit
</ui-button>
```

### Icon Button

```html
<ui-button size="icon" variant="ghost">
  <svg>...</svg>
</ui-button>
```

### Disabled State

```html
<ui-button [disabled]="form.invalid">Submit</ui-button>
```

### Responsive Layout

```html
<ui-card class="w-full max-w-sm md:max-w-md lg:max-w-lg">
  <!-- content -->
</ui-card>
```
