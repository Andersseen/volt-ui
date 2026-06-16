import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressTrack,
  provideProgressState,
} from 'ng-primitives/progress';

@Component({
  selector: 'volt-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideProgressState()],
  hostDirectives: [
    {
      directive: NgpProgress,
      inputs: ['ngpProgressValue: value', 'ngpProgressMin: min', 'ngpProgressMax: max'],
    },
  ],
  host: {
    class: 'block w-full',
  },
  imports: [NgpProgressTrack, NgpProgressIndicator],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      [ngpProgressTrack] {
        position: relative;
        height: 0.5rem;
        width: 100%;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--secondary, oklch(0.96 0.004 265));
      }

      [ngpProgressIndicator] {
        height: 100%;
        border-radius: var(--radius-full, 9999px);
        background: var(--primary, oklch(0.6 0.22 265));
        transition: width 300ms ease-in-out;
      }
    `,
  ],
  template: `
    <div ngpProgressTrack class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        ngpProgressIndicator
        class="h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out"
      ></div>
    </div>
  `,
})
export class VoltProgress {
  readonly value = input<number | null, number | null>(null, {
    transform: numberAttribute as never,
  });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
}
