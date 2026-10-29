import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';
import { alertVariants, type AlertVariants } from './variants';

/** Live-region role for an alert. `null` (the default) renders static content with no role. */
export type AlertRole = 'alert' | 'status' | null;

/**
 * A feedback panel: optional `[slot=icon]`, `<volt-alert-title>`, `<volt-alert-description>` and an
 * optional `[slot=action]`.
 *
 * **Announcements.** By default an alert has no role: content present when the page renders is read
 * in document order like any other text, and a permanent banner that shouts on every page load is
 * worse than none. Opt in when the alert *appears* in response to something:
 *
 * - `role="status"` — polite: announced after the user's current task (saved, synced, reconnected).
 * - `role="alert"` — assertive: interrupts (the payment failed, the session is about to expire).
 *
 * A live region is only announced when its content changes after it is in the DOM, so render the
 * `<volt-alert>` up front and change its content, or accept that some screen readers will skip it.
 */
@Component({
  selector: 'volt-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
    '[attr.data-variant]': 'variant()',
  },
  template: `
    <ng-content select="[slot=icon]" />
    <div class="grid min-w-0 flex-1 gap-1">
      <ng-content />
    </div>
    <ng-content select="[slot=action]" />
  `,
})
export class VoltAlert {
  readonly variant = input<AlertVariants['variant']>('default');
  readonly role = input<AlertRole>(null);
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(alertVariants({ variant: this.variant() }), this.class())
  );
}
