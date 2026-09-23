import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpSearchClear } from 'ng-primitives/search';
import { forwardAttributesFromHost, forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/**
 * Clear button for `<volt-search>`. Usually icon-only: give it a name with `aria-label`, which is
 * applied to the native `<button>` together with `class`.
 */
@Component({
  selector: 'volt-search-clear',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpButton, NgpSearchClear],
  template: `
    <button
      ngpButton
      ngpSearchClear
      type="button"
      [class]="classes()"
      [attr.aria-label]="ariaLabel() || null"
    >
      <ng-content />
    </button>
  `,
})
export class VoltSearchClear {
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors data-[empty]:hidden data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
    forwardAttributesFromHost('aria-label');
  }
}
