import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  injectToggleGroupState,
  NgpToggleGroupItem,
  provideToggleGroupItemState,
} from 'ng-primitives/toggle-group';
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
      [ngpToggleGroupItemDisabled]="isDisabled()"
      [class]="classes()"
      type="button"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggleGroupItem {
  private readonly toggleGroupState = injectToggleGroupState();

  readonly value = input.required<string>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<ToggleGroupItemVariants['variant']>('default');
  readonly size = input<ToggleGroupItemVariants['size']>('md');
  protected readonly isDisabled = computed(
    () => this.disabled() || this.toggleGroupState().disabled()
  );

  protected readonly classes = computed(() =>
    toggleGroupItemVariants({ variant: this.variant(), size: this.size() })
  );
}
