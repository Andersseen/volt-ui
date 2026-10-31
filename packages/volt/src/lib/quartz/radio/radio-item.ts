import {
  afterNextRender,
  type AfterViewChecked,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { RadioDirective } from '@quartz-headless/primitives';
import { injectAttributeWriter } from '../../quartz-attributes';
import { forwardAttributesFromHost } from '../../host-forwarding';
import { VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';
import { VoltRadioGroup } from './radio-group';

/* Quartz Headless backend for `volt-radio-item`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-radio-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RadioDirective],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <button
      #control
      [qzRadio]="value()"
      [qzRadioDisabled]="disabled()"
      [attr.aria-label]="ariaLabel() || ariaLabelAttribute() || null"
      [attr.aria-labelledby]="hasInlineLabel() ? labelId : null"
      [attr.data-checked]="checked() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      class="peer relative flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-background transition-colors hover:bg-accent hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-background data-[disabled]:hover:border-input data-[disabled]:opacity-50 data-[checked]:border-primary"
    >
      <span
        class="items-center justify-center hidden data-[checked]:flex"
        [attr.data-checked]="checked() ? '' : null"
        [attr.data-disabled]="isDisabled() ? '' : null"
      >
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
export class VoltRadioItem implements AfterViewChecked {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex items-center gap-2', this.class()));

  private readonly group = inject(VoltRadioGroup);
  private readonly ids = inject(VoltQuartzIds);
  private readonly writeAttributes = injectAttributeWriter();
  protected readonly labelId = this.ids.generate('volt-radio-label');
  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');

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
  protected readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
  protected readonly checked = computed(() => this.group.isSelected(this.value()));

  /*
   * Quartz's own `id` (`qz-radio-N`, a process-wide counter, so it differs between server and
   * browser) is a host binding that a template binding cannot beat. Volt's id is written after it,
   * or the attribute removed when none was given, exactly as ng-primitives leaves it. The id must
   * be on the button: that is what an external `<label for>` resolves to.
   */
  ngAfterViewChecked(): void {
    this.writeAttributes(this.control().nativeElement, { id: this.id() || null });
  }
}
