import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableRow {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () =>
      'table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ' +
      this.class()
  );
}
