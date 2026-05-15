import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableHead {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () =>
      'table-cell h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ' +
      this.class()
  );
}
