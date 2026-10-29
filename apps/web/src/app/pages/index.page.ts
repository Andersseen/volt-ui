import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LandingCta } from '../components/landing/landing-cta';
import { LandingHero } from '../components/landing/hero/landing-hero';
import { LandingPillars } from '../components/landing/pillars/landing-pillars';
import { LandingPlayground } from '../components/landing/playground/landing-playground';
import { LandingProofPoints } from '../components/landing/landing-proof-points';
import { LandingRecipes } from '../components/landing/recipes/landing-recipes';
import { LandingShowcase } from '../components/landing/showcase/landing-showcase';
import { LandingSteps } from '../components/landing/steps/landing-steps';

/**
 * The landing page is a running order, nothing more. Each section owns its own copy,
 * data and motion in `src/app/components/landing/`, so a change to one of them never
 * means reading — or re-testing — the others.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LandingHero,
    LandingProofPoints,
    LandingPillars,
    LandingShowcase,
    LandingPlayground,
    LandingSteps,
    LandingRecipes,
    LandingCta,
  ],
  template: `
    <!-- Ambient light: landing only, so documentation reads on a plain background. -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        class="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-[100%] bg-primary/20 opacity-50 mix-blend-screen blur-[120px]"
      ></div>
      <div
        class="absolute top-[60%] -right-[10%] h-[60%] w-[40%] rounded-[100%] bg-primary/20 opacity-30 mix-blend-screen blur-[120px]"
      ></div>
    </div>
    <div class="relative z-10 overflow-x-clip">
      <app-landing-hero />
      <app-landing-proof-points />
      <app-landing-pillars />
      <app-landing-showcase />
      <app-landing-playground />
      <app-landing-steps />
      <app-landing-recipes />
      <app-landing-cta />
    </div>
  `,
})
export default class Home {}
