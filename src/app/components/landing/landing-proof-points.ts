import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { SITE_STATS } from '../../lib/generated/site-stats';
import { MOTION } from '@shared/lib/motion';
import { CountUp } from '../count-up';
import { Reveal } from '@shared/components/reveal';

/** The four headline numbers under the hero. All of them come from the repo itself. */
interface ProofPoint {
  readonly value: number;
  /** Where the count starts: 0 counts up; a larger number counts down to a small one. */
  readonly from: number;
  /** Typed, so a renamed key breaks the build rather than one language's page. */
  readonly key: PlainTranslationKey;
}

@Component({
  selector: 'app-landing-proof-points',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountUp, Reveal],
  template: `
    <section class="border-b border-border/60 bg-background">
      <div
        class="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border/60 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6"
      >
        @for (proof of proofPoints; track proof.key; let i = $index) {
          <div [appReveal]="i * stagger" class="px-4 py-9 sm:px-6">
            <p class="landing-display text-4xl font-bold sm:text-5xl">
              <app-count-up [from]="proof.from" [to]="proof.value" />
            </p>
            <p class="mt-1 text-sm text-muted-foreground">{{ t(proof.key) }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class LandingProofPoints {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  protected readonly stagger = MOTION.stagger;

  // Derived from the repo by scripts/generate-site-stats.mjs, never hand-edited.
  protected readonly proofPoints: readonly ProofPoint[] = [
    { value: SITE_STATS.components, from: 0, key: 'landing.proof.components' },
    { value: SITE_STATS.tests, from: 0, key: 'landing.proof.tests' },
    { value: SITE_STATS.themeCombos, from: 0, key: 'landing.proof.themes' },
    // Counts down: "none" lands harder after watching a pile of them disappear.
    { value: 0, from: 120, key: 'landing.proof.ngModules' },
  ];
}
