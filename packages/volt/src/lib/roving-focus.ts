import { inject, InjectionToken, type Provider } from '@angular/core';
import {
  ngpRovingFocusGroup,
  NgpRovingFocusGroupStateToken,
  provideRovingFocusGroupState,
  type NgpRovingFocusGroupProps,
} from 'ng-primitives/roving-focus';

/**
 * What the nearest Volt composite above an element does with its roving-focus group:
 * `'shared'` (a toolbar, whose descendants join its single tab stop) or `'owned'` (tabs,
 * toggle group, radio group: the arrow keys belong to its own items only).
 */
export type VoltRovingScope = 'shared' | 'owned';

export const VOLT_ROVING_SCOPE = new InjectionToken<VoltRovingScope>('VoltRovingScope');

/**
 * Providers for a composite that owns the arrow keys of its own items.
 *
 * ng-primitives roving-focus groups inherit by default: a toggle group or radio group placed in
 * a tab panel registered its items with the tabset's group, so they had no tab stop of their own
 * and ArrowRight on one of them moved to the next tab. `inherit: false` on both the state
 * provider and `ngpRovingFocusGroup()` is the supported way to opt out (ng-primitives' own menu
 * does the same); call {@link ownRovingFocusGroup} from the constructor to create the group.
 *
 * With `joinToolbar`, a composite whose nearest Volt ancestor is a toolbar keeps inheriting its
 * group, as the WAI-ARIA toolbar pattern expects (one tab stop, arrows across every control).
 */
export function provideOwnRovingFocusGroup({
  joinToolbar = false,
}: { joinToolbar?: boolean } = {}): Provider[] {
  const shared = provideRovingFocusGroupState();
  const owned = provideRovingFocusGroupState({ inherit: false });
  return [
    {
      provide: NgpRovingFocusGroupStateToken,
      useFactory: () =>
        joinToolbar && joinsParentGroup() ? shared.useFactory() : owned.useFactory(),
    },
    { provide: VOLT_ROVING_SCOPE, useValue: 'owned' satisfies VoltRovingScope },
  ];
}

/**
 * Creates the composite's own roving-focus group, after its primitive (a host directive, so
 * constructed first) has resolved one. A composite that joins a toolbar keeps the inherited group.
 */
export function ownRovingFocusGroup(
  props: Omit<NgpRovingFocusGroupProps, 'inherit'>,
  { joinToolbar = false }: { joinToolbar?: boolean } = {}
): void {
  if (joinToolbar && joinsParentGroup()) return;
  ngpRovingFocusGroup({ ...props, inherit: false });
}

function joinsParentGroup(): boolean {
  return inject(VOLT_ROVING_SCOPE, { optional: true, skipSelf: true }) === 'shared';
}
