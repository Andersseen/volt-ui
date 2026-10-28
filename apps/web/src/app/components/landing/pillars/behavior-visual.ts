import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge } from 'volt';
import { CodeWindow } from '../code-window';

/** The keyboard and ARIA contract every overlay and composite arrives with. */
@Component({
  selector: 'app-behavior-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeWindow, VoltBadge],
  template: `
    <app-code-window>
      <div class="font-mono">
        <div class="flex flex-wrap gap-2">
          @for (key of keys; track key) {
            <volt-badge variant="outline" class="rounded-md px-2.5 py-1 font-mono">{{
              key
            }}</volt-badge>
          }
        </div>
        <div class="mt-5 space-y-2 border-t border-border/60 pt-4">
          @for (attr of attributes; track attr.name) {
            <p class="truncate">
              <span class="text-primary">{{ attr.name }}</span
              >=<span class="text-muted-foreground">"{{ attr.value }}"</span>
            </p>
          }
        </div>
      </div>
    </app-code-window>
  `,
})
export class BehaviorVisual {
  protected readonly keys = ['Tab', '↑', '↓', 'Enter', 'Esc'];
  protected readonly attributes = [
    { name: 'role', value: 'dialog' },
    { name: 'aria-modal', value: 'true' },
    { name: 'aria-expanded', value: 'false' },
    { name: 'aria-describedby', value: 'volt-hint-1' },
  ];
}
