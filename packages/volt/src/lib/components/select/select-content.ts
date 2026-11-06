import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpSelectDropdown } from 'ng-primitives/select';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';
import { VoltThemeInherit } from '../theme/theme-scope';

@Component({
  selector: 'volt-select-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelectDropdown, VoltThemeInherit],
  template: `
    <div ngpSelectDropdown voltThemeInherit [class]="classes()">
      <div class="p-1 w-full flex flex-col">
        <ng-content />
      </div>
    </div>
  `,
})
export class VoltSelectContent {
  /** Classes for the inner element, merged over the defaults with `cn()`. */
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'absolute block z-50 min-w-[var(--ngp-select-width)] max-w-[var(--ngp-select-width)] w-full overflow-hidden rounded-md border-(length:--border-width) border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }
}
