import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'volt-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NgpSeparator,
      inputs: ['ngpSeparatorOrientation: orientation'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
  styles: [
    `
      :host {
        flex-shrink: 0;
        background: var(--border, oklch(0.92 0.006 265));
      }

      :host([data-orientation='vertical']) {
        width: 1px;
        height: 100%;
      }

      :host([data-orientation='horizontal']) {
        width: 100%;
        height: 1px;
      }
    `,
  ],
  template: ``,
})
export class VoltSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  protected readonly classes = computed(() => {
    const base = 'shrink-0 bg-border';
    return this.orientation() === 'vertical' ? `${base} w-px h-full` : `${base} h-px w-full`;
  });
}
