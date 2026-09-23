import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Placement } from '@floating-ui/dom';
import { NgpSelect, NgpSelectPortal, provideSelectState } from 'ng-primitives/select';
import type { NgpFlipInput } from 'ng-primitives/portal';
import { injectFormControlState } from '../../form-control-state';
import { forwardAttributesFromHost, forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

const HOST_CLASSES = 'block w-full';

/**
 * Custom select with a native `<button>` trigger. `class` and `aria-label` belong to the trigger:
 * they are applied there and removed from the host, which stays a full-width block.
 */
@Component({
  selector: 'volt-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: HOST_CLASSES,
  },
  imports: [NgpSelect, NgpSelectPortal],
  providers: [
    provideSelectState(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltSelect),
      multi: true,
    },
  ],
  template: `
    <button
      ngpSelect
      type="button"
      [ngpSelectDropdownPlacement]="dropdownPlacement()"
      [ngpSelectValue]="value()"
      [ngpSelectDisabled]="isDisabled()"
      [ngpSelectMultiple]="multiple()"
      [ngpSelectCompareWith]="compareWith()"
      [ngpSelectDropdownContainer]="container()"
      [ngpSelectDropdownFlip]="flip()"
      [ngpSelectScrollToOption]="scrollToOption()"
      [ngpSelectOptions]="allOptions()"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [attr.aria-invalid]="formControlState.invalid() ? 'true' : null"
      (ngpSelectValueChange)="onValueChange($event)"
      (blur)="onTouched()"
      [class]="triggerClasses()"
    >
      <span class="block text-left truncate flex-1 pointer-events-none">
        @if (value(); as selected) {
          {{ displayValue(selected) }}
        } @else {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
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

    <ng-template ngpSelectPortal>
      <ng-content />
    </ng-template>
  `,
})
export class VoltSelect implements ControlValueAccessor {
  protected readonly formControlState = injectFormControlState();

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
  readonly dropdownPlacement = input<Placement>('bottom-start');
  readonly container = input<string | HTMLElement | null>('body');
  readonly flip = input<NgpFlipInput, NgpFlipInput>(true, {
    transform: (value: NgpFlipInput) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    },
  });
  readonly scrollToOption = input<((index: number) => void) | undefined>(undefined);
  readonly allOptions = input<unknown[] | undefined>(undefined);
  readonly displayWith = input<(value: unknown) => string>(value => String(value));

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly triggerClasses = computed(() =>
    cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      this.class()
    )
  );

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    forwardClassFromHost(HOST_CLASSES);
    forwardAttributesFromHost('aria-label');
  }

  protected onValueChange(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected displayValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(item => this.displayWith()(item)).join(', ');
    }

    return this.displayWith()(value);
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
