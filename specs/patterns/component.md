# Pattern — Component Anatomy (copy these, don't invent)

Two canonical shapes exist in this library. Copy the matching one.
Extracted from real source at v0.4.0 (`button`, `checkbox`) — if the real file differs,
**the real file wins**; update this pattern doc.

## Shape A — Styled component with CVA variants (reference: `button`)

Used when the component has visual variants (variant/size/etc.).

### `variants.ts`

```ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground shadow-sm data-[hover]:bg-primary/90',
        outline: 'border border-input bg-background shadow-sm data-[hover]:bg-accent',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 rounded-md px-4 text-sm',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

Rules: Tailwind semantic utilities only (`bg-primary`, not `var(--...)` or hex colors);
interaction states via ng-primitives data attributes (`data-[hover]:`, `data-[press]:`,
`data-[disabled]:`, `data-[checked]:`); export name is `<name>Variants` + a
`VariantProps` type.

### `<name>.ts`

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { cn } from '../../utils';
import { buttonVariants, type ButtonVariants } from './variants';

@Component({
  selector: 'volt-button',
  imports: [NgpButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button ngpButton [type]="type()" [disabled]="disabled()" [class]="classes()">
      <ng-content select="[slot=leading]" />
      <ng-content />
      <ng-content select="[slot=trailing]" />
    </button>
  `,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.class())
  );
}
```

### `index.ts`

```ts
export * from './button';
export * from './variants';
```

## Shape B — Form control with ControlValueAccessor (reference: `checkbox`)

Used for anything bindable with `[formControl]` / `ngModel`. Key points, all present in
`projects/volt/src/lib/components/checkbox/checkbox.ts` (read it before writing one):

```ts
@Component({
  selector: 'volt-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpCheckbox],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VoltCheckbox), multi: true },
  ],
  template: ` ...ngpCheckbox button with (blur)="onTouched()"... `,
})
export class VoltCheckbox implements ControlValueAccessor {
  readonly checked = model(false); // two-way state = model()
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  // Forms-driven disabled is SEPARATE from the input, then combined:
  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onCheckedChange(value: boolean): void {
    this.checked.set(value);
    this.onChange(value); // user interaction → notify forms
  }

  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
```

Non-negotiables for Shape B:

1. `NG_VALUE_ACCESSOR` provider with `forwardRef`.
2. `disabled` input AND `setDisabledState` compose via `computed()` — never overwrite
   one with the other.
3. `writeValue` must NOT call `onChange` (no feedback loops).
4. Template wires `(blur)` (or equivalent) to `onTouched`.
5. Disabled state is passed to the ng-primitives directive
   (`[ngpCheckboxDisabled]="isDisabled()"`), not just styled.

## Checklist for any new/edited component

- [ ] File set: `index.ts`, `<name>.ts`, `variants.ts` (Shape A only), `<name>.spec.ts`.
- [ ] Selector `volt-<name>`, class `Volt<Name>`.
- [ ] Ripple effects done (GUARDRAILS.md "Required ripple effects": public-api,
      snippets ×2, demo page, `pnpm manifest`, COMPONENT_STATUS.md).
- [ ] Tests follow `specs/patterns/form-control-tests.md` or overlay pattern.
- [ ] `pnpm typecheck && pnpm lint && pnpm vitest --run <spec> && pnpm build:lib` green.
