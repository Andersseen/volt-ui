import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltCard } from 'volt';

/** A browser-like frame on a Volt card: three dots, the file the miniature stands for, and the body. */
@Component({
  selector: 'app-stage-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard],
  host: { class: 'block' },
  template: `
    <volt-card
      class="overflow-hidden rounded-xl border-border/80 bg-background/95 p-0 shadow-2xl shadow-black/20 backdrop-blur"
    >
      <div class="flex items-center gap-1.5 border-b border-border/70 bg-muted/50 px-3 py-2">
        <span class="h-2 w-2 rounded-full bg-destructive/60"></span>
        <span class="h-2 w-2 rounded-full bg-warning/70"></span>
        <span class="h-2 w-2 rounded-full bg-success/70"></span>
        <span class="ml-2 truncate font-mono text-[10px] text-muted-foreground">{{ file() }}</span>
      </div>
      <div class="relative overflow-hidden"><ng-content /></div>
    </volt-card>
  `,
})
export class StageWindow {
  readonly file = input.required<string>();
}
