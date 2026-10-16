import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LandingCta } from '../components/landing/landing-cta';
import { LandingHero } from '../components/landing/landing-hero';
import { LandingPillars } from '../components/landing/pillars/landing-pillars';
import { LandingPlayground } from '../components/landing/playground/landing-playground';
import { LandingProofPoints } from '../components/landing/landing-proof-points';
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
    LandingCta,
  ],
  template: `
    <main class="relative z-10 overflow-x-clip">
      <app-landing-hero />
      <app-landing-proof-points />
      <app-landing-pillars />
      <app-landing-showcase />
      <app-landing-playground />
      <app-landing-steps />
      <app-landing-cta />
    </main>
  `,
})
export default class Home {}
