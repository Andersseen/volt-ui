import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { NgpTabList, provideTabListState } from 'ng-primitives/tabs';
import { cn } from '../../utils';

@Component({
  selector: 'volt-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [provideTabListState(), provideRovingFocusGroupState()],
  host: {
    '[class]': 'classes()',
  },
  hostDirectives: [NgpTabList],
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
