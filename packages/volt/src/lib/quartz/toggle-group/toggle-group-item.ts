import {
  type AfterViewChecked,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ToggleItemDirective } from '@quartz-headless/primitives';
import {
  toggleGroupItemVariants,
  type ToggleGroupItemVariants,
} from '../../components/toggle-group/variants';
import { injectAttributeWriter } from '../../quartz-attributes';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { cn } from '../../utils';
import { VoltToggleGroup } from './toggle-group';

/* Quartz Headless backend for `volt-toggle-group-item`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-toggle-group-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleItemDirective],
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <button
      #control
      [qzToggleItem]="value()"
      [qzToggleItemDisabled]="disabled()"
      [class]="classes()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.data-selected]="pressed() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      type="button"
    >
      <ng-content />
    </button>
  `,
})
export class VoltToggleGroupItem implements AfterViewChecked {
  readonly class = input<string>('');

  protected readonly hostClasses = computed(() => cn('inline-flex', this.class()));

  private readonly group = inject(VoltToggleGroup);
  private readonly writeAttributes = injectAttributeWriter();
  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');

  readonly value = input.required<string>();
  /** Accessible name — required for an icon-only item. Lands on the native button. */

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<ToggleGroupItemVariants['variant']>('default');
  readonly size = input<ToggleGroupItemVariants['size']>('md');
  protected readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
  protected readonly pressed = computed(() => this.group.isPressed(this.value()));

  protected readonly classes = computed(() =>
    toggleGroupItemVariants({ variant: this.variant(), size: this.size() })
  );

  constructor() {
    forwardAttributesFromHost('aria-label');
  }

  /*
   * Quartz's `id` (a process-wide counter, so server and browser disagree; Volt's item has no id), `role` and `aria-pressed` are host bindings a template binding cannot beat.
   * Volt's contract is the ng-primitives one: a single-select group is a set of radios
   * (`role="radio"` + `aria-checked`); a multi-select group is independent toggle buttons
   * (`aria-pressed`). Written after Quartz's bindings so the prerendered HTML already has them.
   */
  ngAfterViewChecked(): void {
    const pressed = String(this.pressed());
    const single = this.group.type() === 'single';
    this.writeAttributes(this.control().nativeElement, {
      id: null,
      role: single ? 'radio' : null,
      'aria-checked': single ? pressed : null,
      'aria-pressed': single ? null : pressed,
    });
  }
}
