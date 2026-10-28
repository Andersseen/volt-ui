import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltCard, VoltCardContent } from 'volt';

/** One pillar on a Volt card: position, heading and explanation, with a visual projected beside. */
@Component({
  selector: 'app-pillar-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard, VoltCardContent],
  host: { class: 'block' },
  template: `
    <volt-card class="rounded-2xl shadow-xl shadow-black/5">
      <volt-card-content
        class="grid min-h-[22rem] gap-8 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
      >
        <div>
          <span class="font-mono text-sm text-primary">0{{ position() }} / 0{{ total() }}</span>
          <h3 class="landing-display mt-4 text-balance text-3xl font-bold sm:text-4xl">
            {{ title() }}
          </h3>
          <p class="mt-4 max-w-md text-base leading-7 text-muted-foreground">{{ body() }}</p>
        </div>
        <div class="min-w-0"><ng-content /></div>
      </volt-card-content>
    </volt-card>
  `,
})
export class PillarCard {
  /** 1-based. */
  readonly position = input.required<number>();
  readonly total = input.required<number>();
  readonly title = input.required<string>();
  readonly body = input.required<string>();
}
