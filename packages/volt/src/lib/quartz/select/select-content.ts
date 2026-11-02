import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SelectListboxDirective } from '@quartz-headless/primitives';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/*
 * The popup panel. Quartz positions the first element of the template it is given and sets its
 * width to the trigger's, so this host element is the panel (and the `listbox`), not an inner
 * `div` as in the ng-primitives version. `class` is merged over the defaults with `cn()`.
 */
@Component({
  selector: 'volt-select-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SelectListboxDirective],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <div class="p-1 w-full flex flex-col">
      <ng-content />
    </div>
  `,
})
export class VoltSelectContent {
  /** Classes for the panel, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'block z-50 w-full overflow-hidden rounded-md border border-border bg-surface text-surface-foreground shadow-md animate-in fade-in-80 zoom-in-95',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }
}
