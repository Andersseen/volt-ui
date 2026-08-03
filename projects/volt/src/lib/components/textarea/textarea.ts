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
import { injectFormControlState } from '../../form-control-state';
import { textareaVariants, type TextareaVariants } from './variants';

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
      [id]="id()"
      [name]="name()"
      [placeholder]="placeholder()"
      [readonly]="readonly()"
      [required]="required()"
      [disabled]="isDisabled()"
      [class]="classes()"
      [attr.aria-invalid]="state() === 'error' || formControlState.invalid() ? 'true' : null"
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

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly classes = computed(() =>
    textareaVariants({
      variant: this.variant(),
      size: this.size(),
      state: this.state(),
    })
  );

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
