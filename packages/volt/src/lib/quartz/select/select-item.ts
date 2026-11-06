import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { SelectOptionDirective } from '@quartz-headless/primitives';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/*
 * `data-selected` / `data-active` / `data-disabled` are written here, so the classes (and any
 * consumer CSS) never depend on Quartz's `data-qz-*`. Hovering an item focuses it, as the
 * ng-primitives one does, which is what lights up `focus:bg-muted`.
 */
@Component({
  selector: 'volt-select-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectOptionDirective],
  template: `
    <div
      #option="qzSelectOption"
      [qzSelectOption]="value()"
      [qzSelectOptionDisabled]="disabled()"
      [attr.data-selected]="option.selected() ? '' : null"
      [attr.data-active]="option.highlighted() ? '' : null"
      [attr.data-disabled]="disabled() ? '' : null"
      (pointerenter)="focusOnHover(option.element(), option.optionDisabled())"
      [class]="classes()"
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 hidden group-data-[selected]:block"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <ng-content />
    </div>
  `,
})
export class VoltSelectItem {
  readonly value = input<unknown>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Classes for the inner element, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'group relative flex w-full cursor-pointer select-none items-center rounded-sm py-item-y pl-8 pr-2 text-sm outline-none focus:bg-muted focus:text-muted-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 transition-colors',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }

  protected focusOnHover(element: HTMLElement, disabled: boolean): void {
    if (!disabled) element.focus({ preventScroll: true });
  }
}
