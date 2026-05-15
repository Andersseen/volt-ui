import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'volt-resizable-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltResizablePanel {
  readonly class = input<string>('');

  protected readonly classes = computed(
    () => 'flex-1 min-w-0 min-h-0 overflow-auto ' + this.class()
  );
}
