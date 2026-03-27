import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTooltip } from 'ng-primitives/tooltip';

@Component({
  selector: 'volt-tooltip-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTooltip],
  template: `
    <div
      ngpTooltip
      class="absolute z-50 max-w-xs select-none overflow-hidden rounded-[var(--radius-sm)] bg-[var(--foreground)] px-3 py-1.5 text-xs leading-tight font-[var(--font-weight-label)] text-[var(--background)] shadow-[var(--shadow-md)] animate-in fade-in-0 zoom-in-95"
    >
      <ng-content />
    </div>
  `,
})
export class VoltTooltipContent {}
