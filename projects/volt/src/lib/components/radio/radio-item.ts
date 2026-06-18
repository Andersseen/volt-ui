import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpRadioItem, NgpRadioIndicator } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpRadioItem, NgpRadioIndicator],
  host: {
    class: 'flex items-center gap-[var(--spacing-gap)]',
  },
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: var(--spacing-gap, 0.5rem);
      }

      [ngpRadioItem] {
        box-sizing: border-box;
        position: relative;
        display: flex;
        height: 1rem;
        width: 1rem;
        flex-shrink: 0;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border, oklch(0.92 0.006 265));
        border-radius: var(--radius-full, 9999px);
        background: var(--background, oklch(1 0 0));
        transition-property: color, background-color, border-color, outline-color, box-shadow;
        transition-duration: 150ms;
      }

      [ngpRadioItem][data-checked] {
        border-color: var(--primary, oklch(0.6 0.22 265));
      }

      [ngpRadioItem][data-disabled],
      [ngpRadioItem]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      [ngpRadioItem]:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow:
          0 0 0 2px var(--background, oklch(1 0 0)),
          0 0 0 4px var(--ring, oklch(0.6 0.22 265));
      }

      [ngpRadioIndicator] {
        display: none;
        align-items: center;
        justify-content: center;
      }

      [ngpRadioIndicator][data-checked] {
        display: flex;
      }

      [ngpRadioIndicator] > span {
        height: 0.625rem;
        width: 0.625rem;
        border-radius: var(--radius-full, 9999px);
        background: var(--primary, oklch(0.6 0.22 265));
      }
    `,
  ],
  template: `
    <button
      ngpRadioItem
      [ngpRadioItemValue]="value()"
      [ngpRadioItemDisabled]="disabled()"
      class="peer relative flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-[var(--primary)] data-[checked]:bg-[var(--background)]"
    >
      <span ngpRadioIndicator class="items-center justify-center hidden data-[checked]:flex">
        <span class="h-2.5 w-2.5 rounded-full bg-[var(--primary)]"></span>
      </span>
    </button>
    <span
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
    >
      <ng-content />
    </span>
  `,
})
export class VoltRadioItem {
  readonly value = input.required<string>();
  readonly disabled = input<boolean>(false);
}
