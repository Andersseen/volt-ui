import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-table-caption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltTableCaption {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () => 'table-caption mt-4 text-sm text-muted-foreground ' + this.class()
  );
}
