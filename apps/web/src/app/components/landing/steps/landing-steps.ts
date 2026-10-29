import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LmnArrowRightIcon } from 'lumen-icons';
import { VoltButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { LandingSectionHeader } from '@shared/components/section-header';
import { StepItem } from './step-item';
import { STEPS } from './steps';
import { StepsIndex } from './steps-index';

/**
 * The workflow as steps beside a pinned index, and the scroll-spy that keeps them in sync.
 *
 * Below `lg` the index is hidden and the steps simply stack: the section reads top to bottom
 * without it, so nothing depends on the scroll-spy running.
 */
@Component({
  selector: 'app-landing-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, VoltButton, LmnArrowRightIcon, LandingSectionHeader, StepItem, StepsIndex],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <app-landing-section-header
        [eyebrow]="t('landing.workflow.eyebrow')"
        [title]="t('landing.workflow.title')"
        [lede]="t('landing.workflow.subtitle')"
      />

      <div class="mt-16 grid gap-12 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <app-steps-index
          class="sticky top-24 hidden self-start lg:block"
          [steps]="steps"
          [active]="active()"
          (selected)="goTo($event)"
        />

        <ol class="space-y-10 lg:space-y-16">
          @for (step of steps; track step.id; let i = $index) {
            <li [id]="'step-' + step.id" [attr.data-step]="step.id" class="scroll-mt-28">
              <app-step-item class="step-curve" [step]="step" [position]="i + 1" />
            </li>
          }
        </ol>
      </div>

      <div class="mt-16 lg:pl-[17rem]">
        <volt-button
          variant="outline"
          size="lg"
          class="group"
          [routerLink]="path('/docs/introduction')"
        >
          {{ t('landing.workflow.install') }}
          <lmn-arrow-right
            slot="trailing"
            [size]="16"
            class="transition-transform group-hover:translate-x-1"
          />
        </volt-button>
      </div>
    </section>
  `,
  styles: `
    /*
     * The steps ride a curve: a card arrives tilted back from below, lies flat while it is
     * read, and tips away as it leaves — like cards on a turning wheel. Keep the card opaque
     * throughout: fading its text with the scroll transform made it unreadable at entry/exit.
     * Scroll-driven CSS tracks the scrollbar without JavaScript; static where unsupported.
     */
    @supports (animation-timeline: view()) {
      .step-curve {
        transform-origin: 50% 50%;
        animation: step-curve linear both;
        animation-timeline: view();
        animation-range: entry 0% exit 100%;
      }
    }

    @keyframes step-curve {
      0% {
        transform: perspective(1400px) translateY(80px) rotateX(22deg) scale(0.92);
      }
      35%,
      60% {
        opacity: 1;
        transform: perspective(1400px) translateY(0) rotateX(0) scale(1);
      }
      100% {
        transform: perspective(1400px) translateY(-60px) rotateX(-18deg) scale(0.94);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .step-curve {
        animation: none;
      }
    }
  `,
})
export class LandingSteps {
  private readonly translations = injectAppI18n();
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
  protected readonly steps = STEPS;

  readonly active = signal(STEPS[0].id);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // A step counts as current while it crosses a band in the middle of the viewport.
      const spy = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset['step'];
            if (entry.isIntersecting && id) {
              this.active.set(id);
            }
          }
        },
        { rootMargin: '-45% 0px -50% 0px' }
      );

      for (const element of this.host.nativeElement.querySelectorAll('[data-step]')) {
        spy.observe(element);
      }

      destroyRef.onDestroy(() => spy.disconnect());
    });
  }

  goTo(id: string): void {
    const reduce = this.document.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    this.document
      .getElementById(`step-${id}`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    this.active.set(id);
  }
}
