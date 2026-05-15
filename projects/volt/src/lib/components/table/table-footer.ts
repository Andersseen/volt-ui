import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableFooter {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () =>
      'table-footer-group border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ' + this.class()
  );
}
