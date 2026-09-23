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
import { NgpInput } from 'ng-primitives/input';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormControlState } from '../../form-control-state';
import { forwardAttributesFromHost, forwardClassFromHost } from '../../host-forwarding';
import { inputVariants, type InputVariants } from './variants';
import { cn } from '../../utils';

const HOST_CLASSES = 'block w-full';

/**
 * Text input bound with `[(value)]`, `formControl` or `ngModel`.
 *
 * The host is a full-width block wrapper. `class`, `id` and `aria-label` belong to the native
 * `<input>`: they are applied there and removed from the host.
 */
@Component({
  selector: 'volt-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpInput],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltInput),
      multi: true,
    },
  ],
  host: {
    class: HOST_CLASSES,
  },
  template: `
    <input
      ngpInput
      [id]="controlId()"
      [type]="type()"
      [name]="name()"
      [placeholder]="placeholder()"
      [autocomplete]="autocomplete()"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [readonly]="readonly()"
      [required]="required()"
      [disabled]="isDisabled()"
      [value]="value()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.data-size]="size()"
      [class]="classes()"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
})
export class VoltInput implements ControlValueAccessor {
  protected readonly formControlState = injectFormControlState();

  readonly id = input('');
  readonly type = input('text');
  readonly name = input('');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly ariaLabel = input('');
  /** Same as `ariaLabel`, for the attribute spelling consumers write naturally. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `ariaLabel` (1.0) already owns the camelCase name
  readonly ariaLabelAttribute = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly value = model('');
  readonly size = input<InputVariants['size']>('md');
  /** Visual state. `error` also sets `aria-invalid`; an invalid touched form control implies it. */
  readonly state = input<InputVariants['state']>('default');
  /** Classes for the native `<input>`, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** A generated id keeps `<volt-label>` / FormField associations working without one. */
  private readonly generatedId = uniqueId('volt-input');
  protected readonly controlId = computed(() => this.id() || this.generatedId);

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly classes = computed(() =>
    cn(inputVariants({ size: this.size(), state: this.state() }), this.class())
  );

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    forwardClassFromHost(HOST_CLASSES);
    forwardAttributesFromHost('id', 'aria-label');
  }

  /** Not a `computed`: Forms' touched/invalid flags are not signals. */
  protected invalid(): boolean {
    return this.state() === 'error' || this.formControlState.invalid();
  }

  protected onInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
