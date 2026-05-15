import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableHeader {
  readonly class = input<string>('');

  protected readonly classes = computed(() => 'table-header-group [&_tr]:border-b ' + this.class());
}
