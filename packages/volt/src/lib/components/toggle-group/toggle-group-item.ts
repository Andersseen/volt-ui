import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import {
  injectRovingFocusGroupState,
  NgpRovingFocusItemStateToken,
} from 'ng-primitives/roving-focus';
import {
  injectToggleGroupState,
  NgpToggleGroupItem,
  provideToggleGroupItemState,
} from 'ng-primitives/toggle-group';
import { toggleGroupItemVariants, type ToggleGroupItemVariants } from './variants';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toggle-group-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideToggleGroupItemState()],
  imports: [NgpToggleGroupItem],
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <button
      ngpToggleGroupItem
      [ngpToggleGroupItemValue]="value()"
      [ngpToggleGroupItemDisabled]="isDisabled()"
      [class]="classes()"
      [attr.aria-label]="ariaLabel() || null"
      type="button"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggleGroupItem {
  readonly class = input<string>('');

  protected readonly hostClasses = computed(() => cn('inline-flex', this.class()));

  private readonly toggleGroupState = injectToggleGroupState();

  readonly value = input.required<string>();
  /** Accessible name — required for an icon-only item. Lands on the native button. */

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<ToggleGroupItemVariants['variant']>('default');
  readonly size = input<ToggleGroupItemVariants['size']>('md');
  protected readonly isDisabled = computed(
    () => this.disabled() || this.toggleGroupState().disabled()
  );

  /**
   * Classes for the inner `<button>`, merged over the variant's (`class` styles the host). Use it to
   * reshape the button itself: `buttonClass="h-auto p-0"` for a full-bleed thumbnail option.
   */
  readonly buttonClass = input<string>('');

  protected readonly classes = computed(() =>
    cn(toggleGroupItemVariants({ variant: this.variant(), size: this.size() }), this.buttonClass())
  );

  private readonly rovingGroup = injectRovingFocusGroupState({ optional: true });
  private readonly rovingItem = viewChild.required(NgpToggleGroupItem, {
    read: NgpRovingFocusItemStateToken,
  });

  constructor() {
    forwardAttributesFromHost('aria-label');

    // A single group is a radiogroup, and Tab enters a radiogroup on its checked radio. ng-primitives
    // seeds the tab stop on the first item whatever is selected, so the selected item claims it. This
    // only moves the tab stop, never focus, and only when the selection changes: arrowing through the
    // items without selecting still moves the tab stop with focus.
    effect(() => {
      const group = this.toggleGroupState();
      if (!group || group.type() !== 'single' || !group.isSelected(this.value())) return;
      const item = this.rovingItem()();
      const roving = this.rovingGroup();
      if (item && roving) untracked(() => roving.setTabStop(item.id()));
    });
  }
}
