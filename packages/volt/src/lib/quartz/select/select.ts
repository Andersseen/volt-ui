import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { OverlayPlacement } from '@quartz-headless/core';
import { SelectDirective, SelectTriggerDirective } from '@quartz-headless/primitives';
import { injectFormControlState } from '../../form-control-state';
import { forwardAttributesFromHost, forwardClassFromHost } from '../../host-forwarding';
import { overrideQuartzInput, VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';

const HOST_CLASSES = 'block w-full';

/*
 * Quartz Headless backend for `volt-select`; same selectors, inputs, model and Forms contract as
 * the ng-primitives one. `class` and `aria-label` belong to the trigger, as there.
 *
 * Volt's `value` is the scalar in single mode and an array in `multiple` mode, `undefined` when
 * empty. Quartz keeps two models (`value`, `values`) and `null` for empty; they meet here and only
 * here. Quartz's `*ChangeCommitted` outputs fire once per genuine user change and never for a
 * programmatic write, so a value written by Forms or by `[(value)]` is not echoed back.
 *
 * Not carried over, so a template that uses them fails to compile instead of silently doing
 * nothing (see docs/headless-backends.md): `container` (Quartz's popup always lives in its own
 * body-level layer), `scrollToOption` and `allOptions` (virtual scrolling: Quartz's options are
 * the rendered DOM).
 *
 * The popup's template is declared here and handed to Quartz through `content`, a signal input
 * that a host directive cannot be bound to, hence `overrideQuartzInput`.
 */
@Component({
  selector: 'volt-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: HOST_CLASSES,
  },
  hostDirectives: [
    {
      directive: SelectDirective,
      inputs: ['multiple', 'disabled', 'compareWith', 'placement: dropdownPlacement', 'flip'],
    },
  ],
  imports: [SelectTriggerDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltSelect),
      multi: true,
    },
  ],
  template: `
    <!-- eslint-disable @angular-eslint/template/role-has-required-aria -- qzSelectTrigger binds aria-expanded and aria-controls -->
    <button
      qzSelectTrigger
      role="combobox"
      [attr.id]="triggerId"
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      [attr.data-open]="select.isOpen() ? '' : null"
      [attr.data-multiple]="multiple() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      [attr.data-placeholder]="isEmpty() ? '' : null"
      [class]="triggerClasses()"
    >
      <span class="block text-left truncate flex-1 pointer-events-none">
        @if (isEmpty()) {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
        } @else {
          {{ displayValue(value()) }}
        }
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4 opacity-50 shrink-0 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
    <!-- eslint-enable @angular-eslint/template/role-has-required-aria -->

    <ng-template #popup>
      <ng-content />
    </ng-template>
  `,
})
export class VoltSelect implements ControlValueAccessor {
  protected readonly select = inject<SelectDirective<unknown>>(SelectDirective, { self: true });
  protected readonly formControlState = injectFormControlState();
  /** Quartz numbers trigger ids with a module-level counter; this one is application-scoped. */
  protected readonly triggerId = inject(VoltQuartzIds).generate('volt-select-trigger');

  readonly placeholder = input('Select an option');
  readonly ariaLabel = input('');
  /** Same as `ariaLabel`, for the attribute spelling consumers write naturally. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `ariaLabel` (1.0) already owns the camelCase name
  readonly ariaLabelAttribute = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Classes for the trigger button, merged over the defaults with `cn()`. */
  readonly class = input<string>('');
  readonly value = model<unknown>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>(Object.is);
  readonly dropdownPlacement = input<OverlayPlacement>('bottom-start');
  /** `true` / `false` or their string spellings; ng-primitives' flip option objects are not supported. */
  readonly flip = input<boolean | string, boolean | string>(true, {
    transform: (value: boolean | string) => (typeof value === 'string' ? value !== 'false' : value),
  });
  readonly displayWith = input<(value: unknown) => string>(value => String(value));

  private readonly popup = viewChild.required<TemplateRef<unknown>>('popup');

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly isEmpty = computed(() => {
    const value = this.value();
    return value === undefined || value === null || (Array.isArray(value) && value.length === 0);
  });

  protected readonly triggerClasses = computed(() =>
    cn(
      'flex h-control-md w-full items-center justify-between rounded-md border-(length:--volt-control-border-width) border-input bg-background px-inset-sm py-2 text-sm ring-offset-background cursor-pointer placeholder:text-muted-foreground focus:outline-none focus:ring-(length:--ring-width) focus:ring-ring focus:ring-offset-(length:--ring-offset-width) disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      this.class()
    )
  );

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    forwardClassFromHost(HOST_CLASSES);
    forwardAttributesFromHost('aria-label');

    overrideQuartzInput(
      this.select,
      'content',
      computed(() => this.popup())
    );

    effect(() => {
      const value = this.value();
      const multiple = this.multiple();
      untracked(() => {
        if (multiple) this.select.values.set(this.toArray(value));
        else this.select.value.set(Array.isArray(value) ? (value[0] ?? null) : (value ?? null));
      });
    });
    effect(() => this.select.setFormDisabled(this.controlDisabled()));

    this.select.valueChangeCommitted.subscribe(value => this.commit(value));
    this.select.valuesChangeCommitted.subscribe(values => this.commit([...values]));
    this.select.touched.subscribe(() => this.onTouched());
  }

  protected displayValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(item => this.displayWith()(item)).join(', ');
    }

    return this.displayWith()(value);
  }

  private commit(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
  }

  private toArray(value: unknown): unknown[] {
    if (Array.isArray(value)) return [...value];
    return value === undefined || value === null ? [] : [value];
  }

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
