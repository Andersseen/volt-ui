import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableBody {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () => 'table-row-group [&_tr:last-child]:border-0 ' + this.class()
  );
}
