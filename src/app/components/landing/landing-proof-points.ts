import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_STATS } from '../../lib/generated/site-stats';
import { MOTION } from '../../lib/motion';
import { Reveal } from '../reveal';

/** The four headline numbers under the hero. All of them come from the repo itself. */
@Component({
  selector: 'app-landing-proof-points',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  template: `
    <section class="border-b border-border/60 bg-background">
      <div
        class="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border/60 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6"
      >
        @for (proof of proofPoints; track proof.label; let i = $index) {
          <div [appReveal]="i * stagger" class="px-4 py-7 sm:px-6">
            <p class="text-3xl font-semibold tracking-normal">{{ proof.value }}</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ proof.label }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class LandingProofPoints {
  protected readonly stagger = MOTION.stagger;

  // Derived from the repo by scripts/generate-site-stats.mjs, never hand-edited.
  protected readonly proofPoints = [
    { value: `${SITE_STATS.components}`, label: 'documented components' },
    { value: `${SITE_STATS.tests}`, label: 'automated tests' },
    { value: `${SITE_STATS.themeCombos}`, label: 'theme combinations' },
    { value: '0', label: 'NgModules required' },
  ];
}
