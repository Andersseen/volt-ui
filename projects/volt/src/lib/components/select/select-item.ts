import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpSelectOption } from 'ng-primitives/select';

@Component({
  selector: 'volt-select-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelectOption],
  styles: [
    `
      [ngpSelectOption] {
        box-sizing: border-box;
        position: relative;
        display: flex;
        width: 100%;
        cursor: pointer;
        user-select: none;
        align-items: center;
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0.375rem 0.5rem 0.375rem 2rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        outline: none;
        transition-property: color, background-color;
        transition-duration: 150ms;
      }

      [ngpSelectOption]:focus,
      [ngpSelectOption][data-highlighted],
      [ngpSelectOption][data-active] {
        background: var(--muted, oklch(0.96 0.004 265));
        color: var(--muted-foreground, oklch(0.55 0.012 265));
      }

      [ngpSelectOption][aria-disabled='true'],
      [ngpSelectOption][data-disabled] {
        pointer-events: none;
        opacity: 0.5;
      }

      [ngpSelectOption] > span {
        position: absolute;
        left: 0.5rem;
        display: flex;
        height: 0.875rem;
        width: 0.875rem;
        align-items: center;
        justify-content: center;
      }

      [ngpSelectOption] svg {
        display: none;
        height: 1rem;
        width: 1rem;
      }

      [ngpSelectOption][data-selected] svg,
      [ngpSelectOption][aria-selected='true'] svg {
        display: block;
      }
    `,
  ],
  template: `
    <div
      ngpSelectOption
      [ngpSelectOptionValue]="value()"
      [ngpSelectOptionDisabled]="disabled()"
      class="group relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-muted focus:text-muted-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 transition-colors"
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
}
