import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
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
    class: 'contents',
  },
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class VoltListboxOption<T = unknown> {
  readonly id = input<string>();
  readonly value = input.required<T>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inset = input<ListboxOptionVariants['inset']>(false);

  protected readonly classes = computed(() => listboxOptionVariants({ inset: this.inset() }));
}
