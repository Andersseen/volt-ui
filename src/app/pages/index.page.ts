import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LandingCta } from '../components/landing/landing-cta';
import { LandingFeatures } from '../components/landing/landing-features';
import { LandingHero } from '../components/landing/landing-hero';
import { LandingProofPoints } from '../components/landing/landing-proof-points';
import { LandingWorkflow } from '../components/landing/landing-workflow';

/**
 * The landing page is a running order, nothing more. Each section owns its own copy,
 * data and motion in `src/app/components/landing/`, so a change to one of them never
 * means reading — or re-testing — the other four.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LandingHero, LandingProofPoints, LandingFeatures, LandingWorkflow, LandingCta],
  template: `
    <main class="relative z-10 overflow-hidden">
      <app-landing-hero />
      <app-landing-proof-points />
      <app-landing-features />
      <app-landing-workflow />
      <app-landing-cta />
    </main>
  `,
})
export default class Home {}
