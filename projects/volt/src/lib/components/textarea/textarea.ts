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
import { NgpTextarea } from 'ng-primitives/textarea';
import { cva, type VariantProps } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex w-full rounded-md text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-border bg-background focus-visible:ring-ring',
        filled: 'bg-muted border-transparent focus-visible:ring-ring focus-visible:bg-background',
        ghost: 'bg-transparent border-transparent focus-visible:ring-ring focus-visible:bg-muted',
      },
      size: {
        sm: 'min-h-[60px] px-4 py-2 text-sm',
        md: 'min-h-[80px] px-4 py-2 text-sm',
        lg: 'min-h-[120px] px-6 py-3 text-base',
      },
      state: {
        default: '',
        error: 'border-error focus-visible:ring-error placeholder:text-error/70',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;

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
      [attr.aria-invalid]="state() === 'error' ? 'true' : null"
      [style.resize]="resize()"
      [attr.rows]="rows()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onTouched()"
    ></textarea>
  `,
})
export class VoltTextarea implements ControlValueAccessor {
  readonly id = input('');
  readonly name = input('');
  readonly placeholder = input('');
  readonly variant = input<TextareaVariants['variant']>('default');
  readonly size = input<TextareaVariants['size']>('md');
  readonly state = input<TextareaVariants['state']>('default');
  readonly resize = input<'none' | 'vertical' | 'horizontal' | 'both'>('vertical');
  readonly rows = input<number>(3);
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
