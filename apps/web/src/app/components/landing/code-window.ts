import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltCard, VoltCardContent, VoltCardHeader } from 'volt';

/**
 * A code or terminal sample on a Volt card: an optional file name in the header, monospace body.
 *
 * The body is projected, so callers decide whether it is a `<pre>`, a list of files or a
 * terminal transcript.
 */
@Component({
  selector: 'app-code-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard, VoltCardContent, VoltCardHeader],
  host: { class: 'block min-w-0' },
  template: `
    <volt-card class="overflow-hidden shadow-xl shadow-black/5">
      @if (file()) {
        <volt-card-header
          class="flex-row items-center justify-between border-b border-border px-4 py-2.5"
        >
          <span class="truncate font-mono text-xs text-muted-foreground">{{ file() }}</span>
        </volt-card-header>
      }
      <volt-card-content class="overflow-x-auto p-5 font-mono text-xs leading-6 sm:text-sm">
        <ng-content />
      </volt-card-content>
    </volt-card>
  `,
})
export class CodeWindow {
  /** The file the sample stands for, shown in the header. Omit for a bare panel. */
  readonly file = input<string>();
}
