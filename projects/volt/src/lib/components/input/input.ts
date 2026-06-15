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
    class: 'block w-full',
    '[attr.id]': 'null',
  },
  template: `
    <input
      ngpInput
      [id]="id()"
      [type]="type()"
      [name]="name()"
      [placeholder]="placeholder()"
      [autocomplete]="autocomplete()"
      [readonly]="readonly()"
      [required]="required()"
      [disabled]="isDisabled()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onTouched()"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    />
  `,
})
export class VoltInput implements ControlValueAccessor {
  readonly id = input('');
  readonly type = input('text');
  readonly name = input('');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly value = model('');

  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });

  private readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

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
