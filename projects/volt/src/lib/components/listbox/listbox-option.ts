import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgpListboxOption } from 'ng-primitives/listbox';
import { listboxOptionVariants, type ListboxOptionVariants } from './variants';

@Component({
  selector: 'volt-listbox-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpListboxOption,
      inputs: ['id', 'ngpListboxOptionValue: value', 'ngpListboxOptionDisabled: disabled'],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.aria-selected]': 'listboxOption.selected() ? "true" : "false"',
  },
  template: `<ng-content />`,
})
export class VoltListboxOption<T = unknown> {
  protected readonly listboxOption = inject<NgpListboxOption<T>>(NgpListboxOption);

  readonly id = input<string>();
  readonly value = input.required<T>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inset = input<ListboxOptionVariants['inset']>(false);

  protected readonly classes = computed(() => listboxOptionVariants({ inset: this.inset() }));
}
