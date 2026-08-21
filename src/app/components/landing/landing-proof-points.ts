import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations, type TranslationKey } from '../../i18n/translations';
import { SITE_STATS } from '../../lib/generated/site-stats';
import { MOTION } from '../../lib/motion';
import { Reveal } from '../reveal';

/** The four headline numbers under the hero. All of them come from the repo itself. */
interface ProofPoint {
  readonly value: string;
  /** Typed, so a renamed key breaks the build rather than one language's page. */
  readonly key: TranslationKey;
}

@Component({
  selector: 'app-landing-proof-points',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal],
  template: `
    <section class="border-b border-border/60 bg-background">
      <div
        class="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border/60 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6"
      >
        @for (proof of proofPoints; track proof.key; let i = $index) {
          <div [appReveal]="i * stagger" class="px-4 py-7 sm:px-6">
            <p class="text-3xl font-semibold tracking-normal">{{ proof.value }}</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ t(proof.key) }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class LandingProofPoints {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  protected readonly stagger = MOTION.stagger;

  // Derived from the repo by scripts/generate-site-stats.mjs, never hand-edited.
  protected readonly proofPoints: readonly ProofPoint[] = [
    { value: `${SITE_STATS.components}`, key: 'landing.proof.components' },
    { value: `${SITE_STATS.tests}`, key: 'landing.proof.tests' },
    { value: `${SITE_STATS.themeCombos}`, key: 'landing.proof.themes' },
    { value: '0', key: 'landing.proof.ngModules' },
  ];
}
