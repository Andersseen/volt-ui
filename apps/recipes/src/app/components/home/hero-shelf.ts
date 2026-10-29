import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VoltCard } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { BlockThumbnail } from '../block-thumbnail';

/** The three blocks on the shelf: route slug and the file a visitor would copy, left to right. */
const SHELF = [
  { slug: 'hero', file: 'hero-spotlight.ts', place: 'left' },
  { slug: 'pricing', file: 'pricing-tiers.ts', place: 'center' },
  { slug: 'bento', file: 'feature-bento.ts', place: 'right' },
] as const;

/**
 * Three real blocks fanned out under the headline, the middle one forward. Each is a live render
 * captioned with the file it is and linked to its page; under the pointer a block straightens up
 * and comes forward. Below `md` only the middle one is shown, flat.
 */
@Component({
  selector: 'app-hero-shelf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, VoltCard, BlockThumbnail],
  host: { class: 'block' },
  template: `
    <ul class="shelf">
      @for (block of shelf; track block.slug) {
        <li class="slot" [attr.data-place]="block.place">
          <volt-card
            class="window group relative overflow-hidden rounded-xl bg-background p-0 focus-within:ring-2 focus-within:ring-ring"
          >
            <div class="relative aspect-[16/10] overflow-hidden">
              <app-block-thumbnail [slug]="block.slug" />
            </div>
            <div
              class="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground"
            >
              <a
                [routerLink]="path('/blocks/' + block.slug)"
                class="stretched truncate group-hover:text-primary focus-visible:outline-none"
                >blocks/{{ block.file }}</a
              >
              <span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5"
                >→</span
              >
            </div>
          </volt-card>
        </li>
      }
    </ul>
  `,
  styles: `
    .shelf {
      display: grid;
    }

    .slot:not([data-place='center']) {
      display: none;
    }

    .window {
      box-shadow:
        0 0 0 1px color-mix(in oklch, var(--primary) 16%, transparent),
        0 30px 70px -30px color-mix(in oklch, var(--primary) 50%, transparent);
    }

    .stretched::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    @media (min-width: 768px) {
      .shelf {
        grid-template-columns: 1fr 1.25fr 1fr;
        align-items: start;
        perspective: 1600px;
      }

      .slot:not([data-place='center']) {
        display: block;
      }

      .slot {
        transition:
          transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
          z-index 0s;
      }

      .slot[data-place='left'] {
        z-index: 1;
        margin-right: -5%;
        transform: translateY(3.5rem) rotateY(16deg) scale(0.94);
        transform-origin: right center;
      }

      .slot[data-place='center'] {
        z-index: 2;
      }

      .slot[data-place='right'] {
        z-index: 1;
        margin-left: -5%;
        transform: translateY(3.5rem) rotateY(-16deg) scale(0.94);
        transform-origin: left center;
      }

      .slot:hover,
      .slot:focus-within {
        z-index: 3;
        transform: translateY(-0.5rem) scale(1.02);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .slot {
        transition: none;
      }
    }
  `,
})
export class HeroShelf {
  protected readonly path = injectAppI18n().path;
  protected readonly shelf = SHELF;
}
