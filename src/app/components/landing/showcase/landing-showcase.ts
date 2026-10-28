import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LmnArrowLeftIcon, LmnArrowRightIcon } from 'lumen-icons';
import { VoltButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { LandingSectionHeader } from '../section-header';
import { FEATURED_COMPONENTS } from './featured';
import { ShowcaseCard } from './showcase-card';

/**
 * A carousel of live component miniatures.
 *
 * The track is a native horizontal scroller with scroll snapping, so touch, trackpad and
 * keyboard scrolling all work without this code; the previous/next buttons only add a
 * one-card step and disable themselves at either end.
 */
@Component({
  selector: 'app-landing-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    VoltButton,
    LmnArrowLeftIcon,
    LmnArrowRightIcon,
    LandingSectionHeader,
    ShowcaseCard,
  ],
  template: `
    <section class="py-20 sm:py-28">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <app-landing-section-header
          [eyebrow]="t('landing.showcase.eyebrow')"
          [title]="t('landing.showcase.title')"
          [lede]="t('landing.showcase.subtitle')"
        />
        <div class="flex shrink-0 gap-2">
          <volt-button
            variant="outline"
            size="icon"
            [disabled]="atStart()"
            [aria-label]="t('landing.showcase.previous')"
            (click)="step(-1)"
          >
            <lmn-arrow-left [size]="20" />
          </volt-button>
          <volt-button
            variant="outline"
            size="icon"
            [disabled]="atEnd()"
            [aria-label]="t('landing.showcase.next')"
            (click)="step(1)"
          >
            <lmn-arrow-right [size]="20" />
          </volt-button>
        </div>
      </div>

      <ul
        #track
        tabindex="0"
        [attr.aria-label]="t('landing.showcase.eyebrow')"
        class="track mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-6"
      >
        @for (component of components; track component.name) {
          <li class="w-[85%] shrink-0 snap-start sm:w-[22rem]">
            <app-showcase-card class="h-full" [component]="component" />
          </li>
        }
      </ul>

      <div class="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <volt-button variant="outline" [routerLink]="path('/docs/components')">
          {{ t('catalog.browse') }}
        </volt-button>
      </div>
    </section>
  `,
  styles: `
    /* One edge for padding and snapping, aligned with the page's max-w-7xl content column. */
    .track {
      --edge: 1rem;
      padding-inline: var(--edge);
      scroll-padding-inline: var(--edge);
      /* The arrows, swipe and trackpad all scroll it; a scrollbar under the cards is noise. */
      scrollbar-width: none;
    }

    .track::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 640px) {
      .track {
        --edge: 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      .track {
        --edge: max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem));
      }
    }

    .track:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 4px;
    }

    @media (prefers-reduced-motion: reduce) {
      .track {
        scroll-behavior: auto;
      }
    }
  `,
})
export class LandingShowcase {
  private readonly translations = injectAppI18n();
  private readonly document = inject(DOCUMENT);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
  protected readonly components = FEATURED_COMPONENTS;

  readonly atStart = signal(true);
  readonly atEnd = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const track = this.track().nativeElement;
      const update = () => {
        this.atStart.set(track.scrollLeft <= 1);
        this.atEnd.set(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
      };
      update();
      track.addEventListener('scroll', update, { passive: true });
      this.document.defaultView?.addEventListener('resize', update);
      destroyRef.onDestroy(() => {
        track.removeEventListener('scroll', update);
        this.document.defaultView?.removeEventListener('resize', update);
      });
    });
  }

  /** Scroll by one card in `direction` (-1 back, 1 forward). */
  step(direction: -1 | 1): void {
    const track = this.track().nativeElement;
    const card = track.querySelector('li');
    const gap = 20;
    track.scrollBy({ left: direction * ((card?.clientWidth ?? 320) + gap), behavior: 'smooth' });
  }
}
