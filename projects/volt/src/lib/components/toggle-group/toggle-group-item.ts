import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgpToggleGroupItem, provideToggleGroupItemState } from 'ng-primitives/toggle-group';
import { toggleGroupItemVariants, type ToggleGroupItemVariants } from './variants';

@Component({
  selector: 'volt-toggle-group-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideToggleGroupItemState()],
  imports: [NgpToggleGroupItem],
  host: {
    class: 'inline-flex',
  },
  template: `
    <button
      ngpToggleGroupItem
      [ngpToggleGroupItemValue]="value()"
      [ngpToggleGroupItemDisabled]="disabled()"
      [class]="classes()"
      type="button"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggleGroupItem {
  readonly value = input.required<string>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<ToggleGroupItemVariants['variant']>('default');
  readonly size = input<ToggleGroupItemVariants['size']>('md');

  protected readonly classes = computed(() =>
    toggleGroupItemVariants({ variant: this.variant(), size: this.size() })
  );
}
