import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTable {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () => 'table w-full caption-bottom text-sm border-collapse ' + this.class()
  );
}
