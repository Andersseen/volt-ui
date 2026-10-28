import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpMeterTrack } from 'ng-primitives/meter';
import { cn } from '../../utils';

@Component({
  selector: 'volt-meter-track',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMeterTrack],
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltMeterTrack {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('relative block h-2 w-full overflow-hidden rounded-full bg-secondary', this.class())
  );
}
