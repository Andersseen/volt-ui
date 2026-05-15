import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableCell {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () => 'table-cell p-4 align-middle [&:has([role=checkbox])]:pr-0 ' + this.class()
  );
}
