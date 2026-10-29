import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

/**
 * A centred "nothing here" panel: optional `[slot=icon]`, `<volt-empty-state-title>`,
 * `<volt-empty-state-description>` and optional `[slot=actions]`.
 *
 * ```html
 * <volt-empty-state>
 *   <svg slot="icon" aria-hidden="true">…</svg>
 *   <volt-empty-state-title>No projects yet</volt-empty-state-title>
 *   <volt-empty-state-description>Create your first project to get started.</volt-empty-state-description>
 *   <div slot="actions"><button voltButton>Create project</button></div>
 * </volt-empty-state>
 * ```
 *
 * It is content, not a notification: it has no role and is not a live region, because an empty
 * list is rarely an event worth interrupting for. It is also not an error — pair it with
 * `<volt-alert>` when the list is empty *because* a request failed. Everything is optional.
 */
@Component({
  selector: 'volt-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content select="[slot=icon]" />
    <div class="grid min-w-0 max-w-md gap-1">
      <ng-content />
    </div>
    <ng-content select="[slot=actions]" />
  `,
})
export class VoltEmptyState {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'flex w-full min-w-0 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border px-6 py-10 text-center text-foreground [&>[slot=icon]]:size-10 [&>[slot=icon]]:shrink-0 [&>[slot=icon]]:text-muted-foreground [&>[slot=actions]]:flex [&>[slot=actions]]:flex-wrap [&>[slot=actions]]:justify-center [&>[slot=actions]]:gap-2',
      this.class()
    )
  );
}
