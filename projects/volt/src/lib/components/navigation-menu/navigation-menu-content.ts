import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import {
  NgpNavigationMenuContent,
  provideNavigationMenuContentState,
} from 'ng-primitives/navigation-menu';
import { cn } from '../../utils';

@Component({
  selector: 'volt-navigation-menu-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuContentState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuContent,
      inputs: [
        'ngpNavigationMenuContentOrientation: orientation',
        'ngpNavigationMenuContentWrap: wrap',
      ],
    },
  ],
  template: `<ng-content />`,
})
export class VoltNavigationMenuContent {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'fixed z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-md hidden data-[open]:block',
      this.class()
    )
  );

  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly wrap = input<boolean, unknown>(false, { transform: booleanAttribute });
}
