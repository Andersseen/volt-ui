import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';
import { cn } from '../../utils';
import { NgpButton } from 'ng-primitives/button';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { buttonVariants, type ButtonVariants } from './variants';

/** An ARIA state value: booleans become `"true"` / `"false"`, `null`/`undefined` omit the attribute. */
type AriaValue = string | boolean | null | undefined;

const toAriaString = (value: AriaValue): string | null =>
  value === null || value === undefined ? null : String(value);

const FORWARDED_ARIA = [
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-expanded',
  'aria-pressed',
  'aria-controls',
  'aria-haspopup',
];

/**
 * Renders a native `<button>` inside the `volt-button` host.
 *
 * The ARIA attributes most often written on a button — `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-expanded`, `aria-pressed`, `aria-controls`, `aria-haspopup` — are
 * inputs, applied to the native button and removed from the host. Bind them as `aria-expanded` /
 * `[aria-expanded]`, not `[attr.aria-expanded]` (that targets the host).
 *
 * For links styled as buttons, or full control of every attribute, use `voltButton` on the native
 * element instead: `<a voltButton routerLink="/docs">`.
 *
 * `class` styles the native button. For 1.x compatibility Angular also leaves a static `class` on
 * the host, where layout utilities such as `ml-auto` keep working.
 */
@Component({
  selector: 'volt-button',
  imports: [NgpButton],
  template: `
    <button
      ngpButton
      [type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-expanded]="ariaExpanded()"
      [attr.aria-pressed]="ariaPressed()"
      [attr.aria-controls]="ariaControls() || null"
      [attr.aria-haspopup]="ariaHaspopup()"
    >
      <ng-content select="[slot=leading]" />
      <ng-content />
      <ng-content select="[slot=trailing]" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly class = input<string>('');
  /** @deprecated Use `class` — both are merged into the native button. Kept for 1.x. */
  readonly customClass = input<string>('');

  readonly ariaLabel = input<string | null | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null | undefined>(undefined, {
    alias: 'aria-labelledby',
  });
  readonly ariaDescribedby = input<string | null | undefined>(undefined, {
    alias: 'aria-describedby',
  });
  readonly ariaExpanded = input<string | null, AriaValue>(null, {
    alias: 'aria-expanded',
    transform: toAriaString,
  });
  readonly ariaPressed = input<string | null, AriaValue>(null, {
    alias: 'aria-pressed',
    transform: toAriaString,
  });
  readonly ariaControls = input<string | null | undefined>(undefined, { alias: 'aria-controls' });
  readonly ariaHaspopup = input<string | null, AriaValue>(null, {
    alias: 'aria-haspopup',
    transform: toAriaString,
  });

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.size() }),
      this.class(),
      this.customClass()
    )
  );

  constructor() {
    forwardAttributesFromHost(...FORWARDED_ARIA);
  }
}
