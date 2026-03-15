import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltTooltip, VoltTooltipContent } from 'volt';
import { VoltButton } from 'volt';

@Component({
  selector: 'app-tooltip-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltTooltip, VoltTooltipContent, VoltButton],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Tooltip</h1>
        <p class="text-base text-muted-foreground mt-2">
          A popup that displays information related to an element when the element receives keyboard
          focus or the mouse hovers over it.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">Example</h2>
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center min-h-[300px]"
        >
          <volt-button variant="outline" [voltTooltip]="myTooltip" placement="top" [offset]="8">
            Hover me
          </volt-button>

          <ng-template #myTooltip>
            <volt-tooltip-content>Add to library</volt-tooltip-content>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class TooltipDemo {}
