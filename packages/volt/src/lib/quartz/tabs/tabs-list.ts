import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TabListDirective } from '@quartz-headless/primitives';
import { cn } from '../../utils';

/* Quartz Headless backend for `volt-tabs-list`; same public contract as the ng-primitives one. */
@Component({
  selector: 'volt-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [TabListDirective],
  template: ` <ng-content /> `,
})
export class VoltTabsList {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      this.class()
    )
  );
}
