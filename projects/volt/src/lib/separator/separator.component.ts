import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'volt-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSeparator],
  template: `
    <div
      ngpSeparator
      [ngpSeparatorOrientation]="orientation()"
      role="separator"
      [class]="classes()"
    ></div>
  `,
})
export class VoltSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  protected readonly classes = computed(() => {
    const base = 'shrink-0 bg-border';
    return this.orientation() === 'vertical' ? `${base} w-px h-full` : `${base} h-px w-full`;
  });
}
