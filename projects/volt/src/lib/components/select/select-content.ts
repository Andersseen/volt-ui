import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpSelectDropdown } from 'ng-primitives/select';

@Component({
  selector: 'volt-select-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelectDropdown],
  styles: [
    `
      [ngpSelectDropdown] {
        position: absolute;
        z-index: 50;
        display: block;
        min-width: 8rem;
        overflow: hidden;
        border: 1px solid var(--border, oklch(0.92 0.006 265));
        border-radius: var(--radius-md, 0.375rem);
        background: var(--surface, oklch(1 0 0));
        color: var(--surface-foreground, oklch(0.14 0.006 265));
        box-shadow: var(--shadow-md, 0 4px 6px -1px oklch(0 0 0 / 0.1));
      }

      [ngpSelectDropdown] > div {
        display: flex;
        width: 100%;
        flex-direction: column;
        padding: 0.25rem;
      }
    `,
  ],
  template: `
    <div
      ngpSelectDropdown
      class="absolute block z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-surface-foreground shadow-md animate-in fade-in-80 zoom-in-95"
    >
      <div class="p-1 w-full flex flex-col">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltSelectContent {}
