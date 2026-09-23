import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpTextarea } from 'ng-primitives/textarea';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormControlState } from '../../form-control-state';
import { forwardAttributesFromHost, forwardClassFromHost } from '../../host-forwarding';
import { textareaVariants, type TextareaVariants } from './variants';
import { cn } from '../../utils';

/**
 * Multi-line text input bound with `[(value)]`, `formControl` or `ngModel`.
 *
 * `class`, `id` and `aria-label` belong to the native `<textarea>`: they are applied there and
 * removed from the host.
 */
@Component({
  selector: 'volt-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTextarea],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VoltTextarea),
      multi: true,
    },
  ],
  template: `
    <textarea
      ngpTextarea
      [id]="controlId()"
      [name]="name()"
      [placeholder]="placeholder()"
      [readonly]="readonly()"
      [required]="required()"
      [disabled]="isDisabled()"
      [class]="classes()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [style.resize]="resize()"
      [attr.rows]="rows()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onTouched()"
    ></textarea>
  `,
})
export class VoltTextarea implements ControlValueAccessor {
  protected readonly formControlState = injectFormControlState();

  readonly id = input('');
  readonly name = input('');
  readonly placeholder = input('');
  readonly variant = input<TextareaVariants['variant']>('default');
  readonly size = input<TextareaVariants['size']>('md');
  readonly state = input<TextareaVariants['state']>('default');
  readonly resize = input<'none' | 'vertical' | 'horizontal' | 'both'>('vertical');
  readonly rows = input<number, number>(3, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly value = model('');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Classes for the native `<textarea>`, merged over the variants with `cn()`. */
  readonly class = input<string>('');

  /** A generated id keeps `<volt-label>` / FormField associations working without one. */
  private readonly generatedId = uniqueId('volt-textarea');
  protected readonly controlId = computed(() => this.id() || this.generatedId);

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly classes = computed(() =>
    cn(
      textareaVariants({
        variant: this.variant(),
        size: this.size(),
        state: this.state(),
      }),
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
    forwardAttributesFromHost('id', 'aria-label');
  }

  /** Not a `computed`: Forms' touched/invalid flags are not signals. */
  protected invalid(): boolean {
    return this.state() === 'error' || this.formControlState.invalid();
  }

  protected onInput(event: Event): void {
    const nextValue = (event.target as HTMLTextAreaElement).value;
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
