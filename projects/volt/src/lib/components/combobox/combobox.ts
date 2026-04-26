import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  model,
  TemplateRef,
} from '@angular/core';
import { NgpCombobox, NgpComboboxPortal } from 'ng-primitives/combobox';
import { VoltComboboxInput } from './combobox-input';
import { VoltComboboxButton } from './combobox-button';
import { VoltComboboxDropdown } from './combobox-dropdown';
import { VoltComboboxOption } from './combobox-option';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'volt-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltComboboxInput,
    VoltComboboxButton,
    VoltComboboxDropdown,
    VoltComboboxOption,
    NgTemplateOutlet,
    NgpComboboxPortal,
  ],
  host: {
    class: 'relative inline-flex w-full items-center gap-1',
  },
  hostDirectives: [
    {
      directive: NgpCombobox,
      inputs: [
        'ngpComboboxValue: value',
        'ngpComboboxMultiple: multiple',
        'ngpComboboxDisabled: disabled',
        'ngpComboboxAllowDeselect: allowDeselect',
        'ngpComboboxCompareWith: compareWith',
        'ngpComboboxDropdownPlacement: dropdownPlacement',
      ],
      outputs: ['ngpComboboxValueChange: valueChange', 'ngpComboboxOpenChange: openChange'],
    },
  ],
  template: `
    <input voltComboboxInput [attr.placeholder]="placeholder()" [attr.aria-expanded]="open()" />
    <volt-combobox-button aria-label="Toggle dropdown">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </volt-combobox-button>

    <ng-template ngpComboboxPortal>
      <volt-combobox-dropdown>
        @for (item of items(); track trackByFn()($index, item)) {
          <volt-combobox-option [value]="item" [index]="$index">
            <ng-container
              *ngTemplateOutlet="optionTemplate() || defaultTemplate; context: { $implicit: item }"
            />
          </volt-combobox-option>
        } @empty {
          <div class="px-2 py-1.5 text-sm text-muted-foreground">No results found.</div>
        }
      </volt-combobox-dropdown>
    </ng-template>

    <ng-template #defaultTemplate let-item>{{ item }}</ng-template>
  `,
})
export class VoltCombobox {
  readonly value = model<unknown>();
  readonly multiple = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly allowDeselect = input<boolean>(true);
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>();
  readonly dropdownPlacement = input<'top' | 'bottom' | 'left' | 'right'>('bottom');

  readonly items = input<unknown[]>([]);
  readonly placeholder = input<string>('Select...');
  readonly trackByFn = input<(index: number, item: unknown) => unknown>((_i, item) => item);
  readonly optionTemplate = contentChild<TemplateRef<unknown>>(TemplateRef);

  // This is a stub for aria-expanded; the real open state would require
  // injecting combobox state. For simplicity we leave it undefined.
  protected readonly open = () => false;
}
