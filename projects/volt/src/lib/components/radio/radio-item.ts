import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectRadioGroupState, NgpRadioItem, NgpRadioIndicator } from 'ng-primitives/radio';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-radio-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpRadioItem, NgpRadioIndicator],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <button
      ngpRadioItem
      type="button"
      [ngpRadioItemValue]="value()"
      [ngpRadioItemDisabled]="isDisabled()"
      [attr.id]="id() || null"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [attr.aria-labelledby]="hasInlineLabel() ? labelId : null"
      class="peer relative flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[checked]:border-primary"
    >
      <span ngpRadioIndicator class="items-center justify-center hidden data-[checked]:flex">
        <span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
      </span>
    </button>
    <span
      #inlineLabel
      [id]="labelId"
      class="text-sm font-medium leading-none text-foreground peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:opacity-70 cursor-pointer"
    >
      <ng-content />
    </span>
  `,
})
export class VoltRadioItem {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex items-center gap-2', this.class()));

  private readonly radioGroupState = injectRadioGroupState<string>();
  protected readonly labelId = uniqueId('volt-radio-label');

  private readonly inlineLabel = viewChild<ElementRef<HTMLElement>>('inlineLabel');
  /**
   * The projected text names the radio. With none (an external `<label for>` or `aria-label`
   * does the naming), pointing `aria-labelledby` at the empty span would override both and
   * leave the radio unnamed.
   */
  protected readonly hasInlineLabel = signal(true);

  constructor() {
    forwardAttributesFromHost('id', 'aria-label');
    afterNextRender(() => {
      this.hasInlineLabel.set(!!this.inlineLabel()?.nativeElement.textContent?.trim());
    });
  }

  readonly value = input.required<string>();
  /** Goes on the radio button, so an external `<label for>` resolves to it, not to the host. */
  readonly id = input<string>();
  readonly ariaLabel = input('');
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors VoltCheckbox: `ariaLabel` owns the camelCase name
  readonly ariaLabelAttribute = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  protected readonly isDisabled = computed(
    () => this.disabled() || this.radioGroupState().disabled()
  );
}
