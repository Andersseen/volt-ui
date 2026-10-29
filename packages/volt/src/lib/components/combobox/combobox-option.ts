import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
} from '@angular/core';
import { NgpComboboxOption } from 'ng-primitives/combobox';
import { cn } from '../../utils';

@Component({
  selector: 'volt-combobox-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpComboboxOption],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <div
      ngpComboboxOption
      [ngpComboboxOptionValue]="value()"
      [ngpComboboxOptionDisabled]="disabled()"
      [ngpComboboxOptionIndex]="index()"
      (ngpComboboxOptionActivated)="activated.emit()"
      class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-surface-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <ng-content />
    </div>
  `,
})
export class VoltComboboxOption {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('contents', this.class()));

  readonly value = input.required<unknown>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly index = input<number | undefined>();
  readonly activated = output<void>();
}
