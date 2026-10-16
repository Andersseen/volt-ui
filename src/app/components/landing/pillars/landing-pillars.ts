import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectAppI18n, type PlainTranslationKey } from '../../../i18n/i18n';
import { LandingSectionHeader } from '../section-header';
import { AgentVisual } from './agent-visual';
import { BehaviorVisual } from './behavior-visual';
import { PillarCard } from './pillar-card';
import { SourceVisual } from './source-visual';
import { SystemVisual } from './system-visual';

interface Pillar {
  readonly visual: 'source' | 'behavior' | 'system' | 'agent';
  /** Typed, so a renamed key breaks the build rather than the Spanish page. */
  readonly titleKey: PlainTranslationKey;
  readonly bodyKey: PlainTranslationKey;
}

/**
 * The four reasons to pick Volt, as cards that stack while the page scrolls.
 *
 * The stacking is `position: sticky` with a growing top offset: no scroll listener, so it
 * works in the server-rendered page and costs nothing on the main thread. On short viewports
 * and under reduced motion the cards simply flow as a list.
 */
@Component({
  selector: 'app-landing-pillars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LandingSectionHeader,
    PillarCard,
    SourceVisual,
    BehaviorVisual,
    SystemVisual,
    AgentVisual,
  ],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <app-landing-section-header
        [eyebrow]="t('landing.features.eyebrow')"
        [title]="t('landing.features.title')"
        [lede]="t('landing.features.subtitle')"
      />

      <ol class="mt-14 space-y-6 sm:mt-20">
        @for (pillar of pillars; track pillar.visual; let i = $index) {
          <li class="pillar" [style.--i]="i">
            <app-pillar-card
              [position]="i + 1"
              [total]="pillars.length"
              [title]="t(pillar.titleKey)"
              [body]="t(pillar.bodyKey)"
            >
              @switch (pillar.visual) {
                @case ('source') {
                  <app-source-visual />
                }
                @case ('behavior') {
                  <app-behavior-visual />
                }
                @case ('system') {
                  <app-system-visual />
                }
                @case ('agent') {
                  <app-agent-visual />
                }
              }
            </app-pillar-card>
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    /* Each card pins a little lower than the one before, so the stack shows its edges. */
    .pillar {
      position: sticky;
      top: calc(5.5rem + var(--i) * 1.25rem);
    }

    @media (max-height: 640px), (prefers-reduced-motion: reduce) {
      .pillar {
        position: static;
      }
    }
  `,
})
export class LandingPillars {
  protected readonly t = injectAppI18n().t;

  protected readonly pillars: readonly Pillar[] = [
    {
      visual: 'source',
      titleKey: 'landing.features.ownTitle',
      bodyKey: 'landing.features.ownBody',
    },
    {
      visual: 'behavior',
      titleKey: 'landing.features.behaviorTitle',
      bodyKey: 'landing.features.behaviorBody',
    },
    {
      visual: 'system',
      titleKey: 'landing.features.systemTitle',
      bodyKey: 'landing.features.systemBody',
    },
    { visual: 'agent', titleKey: 'landing.pillars.aiTitle', bodyKey: 'landing.pillars.aiBody' },
  ];
}
