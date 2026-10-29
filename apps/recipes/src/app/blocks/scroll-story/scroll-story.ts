import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltBadge, VoltCard } from 'volt';

export interface StoryStep {
  readonly title: string;
  readonly body: string;
  /** Short label for the step's marker; defaults to "01", "02", … */
  readonly marker?: string;
}

const DEFAULT_STEPS: readonly StoryStep[] = [
  {
    title: 'Describe the outcome',
    body: 'Start from what the visitor should be able to do, not from the screens. One sentence is enough.',
  },
  {
    title: 'Compose from real parts',
    body: 'Assemble the section from components that already handle focus, state and theming.',
  },
  {
    title: 'Check it in every theme',
    body: 'Semantic tokens mean the same markup holds up across presets, dark mode and your own palette.',
  },
  {
    title: 'Ship the source',
    body: 'Copy the file, change the words, keep the behaviour. Nothing to install but what you already use.',
  },
];

/**
 * A story told by stacking cards: each step slides up and settles over the previous one.
 *
 * Plain CSS, no observers and no library. Each card is `position: sticky` with a small
 * increasing offset, so the browser does the stacking and the page keeps its normal scroll —
 * there is nothing to trap and nothing to clean up.
 *
 * - Stacking only applies from the `md` width up, and only when the visitor has not asked for
 *   reduced motion. Below that, and under `prefers-reduced-motion: reduce`, the steps are an
 *   ordinary list, in reading order.
 * - The markup is a single ordered list in story order, so a screen reader and the tab order
 *   read the steps top to bottom whether or not they stack.
 * - Sticky needs every ancestor to leave `overflow` visible (or `clip`); wrap this in
 *   `overflow-hidden` and the cards will stop stacking. Use `overflow-clip` if you need to
 *   round the corners of a wrapper.
 */
@Component({
  selector: 'app-scroll-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltCard],
  host: { class: 'block' },
  template: `
    <section class="bg-background px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-3xl">
        <div class="max-w-xl">
          <p class="text-sm font-medium uppercase tracking-wider text-primary">{{ eyebrow() }}</p>
          <h2 class="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {{ heading() }}
          </h2>
        </div>

        <ol class="mt-12 space-y-4 md:space-y-0">
          @for (step of steps(); track step.title; let i = $index) {
            <li class="step" [style.--i]="i">
              <volt-card class="flex gap-5 p-6 shadow-md sm:p-8" [class]="tone(i)">
                <volt-badge
                  variant="outline"
                  class="h-8 shrink-0 self-start font-mono tabular-nums"
                  aria-hidden="true"
                >
                  {{ step.marker ?? pad(i + 1) }}
                </volt-badge>
                <div>
                  <h3 class="text-xl font-semibold tracking-tight">
                    <span class="sr-only">Step {{ i + 1 }}: </span>{{ step.title }}
                  </h3>
                  <p class="mt-2 leading-7 text-muted-foreground">{{ step.body }}</p>
                </div>
              </volt-card>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
      .step {
        position: sticky;
        /* Clears a fixed header, then steps down 1rem per card so every edge stays visible. */
        top: calc(5rem + var(--i) * 1rem);
        /* Room to scroll through before the next card arrives. */
        padding-bottom: 40vh;
      }

      .step:last-child {
        padding-bottom: 0;
      }
    }
  `,
})
export class ScrollStory {
  readonly eyebrow = input('How it works');
  readonly heading = input('From idea to shipped section in four moves.');
  readonly steps = input<readonly StoryStep[]>(DEFAULT_STEPS);

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  /** Alternate cards sit a shade apart, so overlapping edges read as separate layers. */
  protected tone(index: number): string {
    return index % 2 === 0 ? 'bg-card' : 'bg-surface';
  }
}
