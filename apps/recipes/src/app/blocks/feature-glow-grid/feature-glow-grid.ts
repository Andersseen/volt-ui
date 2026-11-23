import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import {
  LmnDatabaseIcon,
  LmnGlobeIcon,
  LmnLockIcon,
  LmnRefreshCwIcon,
  LmnTerminalIcon,
  LmnZapIcon,
} from 'lumen-icons';
import { VoltCard, VoltCardDescription, VoltCardTitle } from 'volt';

type Icon = 'zap' | 'lock' | 'globe' | 'database' | 'terminal' | 'refresh';

interface Feature {
  readonly icon: Icon;
  readonly title: string;
  readonly body: string;
}

/**
 * Six features in a grid whose borders light up around the pointer — one light shared by every card.
 *
 * Each card draws a radial gradient at `--x`/`--y` in its own coordinates, clipped to a 1px border
 * by a mask. On pointer move the grid writes each card's offset from the pointer, so a card next to
 * the one you are on catches the edge of the same light; that continuity is what makes six boxes
 * read as one surface. Writes are batched into one animation frame, and the light fades out when the
 * pointer leaves.
 *
 * It only reacts to a pointer, so it never moves on its own — nothing to switch off under reduced
 * motion, and on touch there is simply no glow.
 */
@Component({
  selector: 'app-feature-glow-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltCardTitle,
    VoltCardDescription,
    LmnZapIcon,
    LmnLockIcon,
    LmnGlobeIcon,
    LmnDatabaseIcon,
    LmnTerminalIcon,
    LmnRefreshCwIcon,
  ],
  template: `
    <section class="@container bg-background px-4 py-20 @3xl:px-6 @3xl:py-24">
      <div class="mx-auto max-w-5xl">
        <div class="max-w-2xl">
          <p class="text-sm font-medium text-primary">Platform</p>
          <h2 class="mt-2 text-balance text-3xl font-bold tracking-tight @2xl:text-4xl">
            Everything a backend needs, nothing it does not
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            Six primitives that compose. Start with one, add the rest when you need them.
          </p>
        </div>

        <ul
          class="grid mt-12 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3"
          (pointermove)="track($event)"
          (pointerleave)="fade()"
        >
          @for (feature of features; track feature.title) {
            <li>
              <volt-card class="glow relative h-full p-6 shadow-none">
                <span
                  class="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  @switch (feature.icon) {
                    @case ('zap') {
                      <lmn-zap [size]="20" />
                    }
                    @case ('lock') {
                      <lmn-lock [size]="20" />
                    }
                    @case ('globe') {
                      <lmn-globe [size]="20" />
                    }
                    @case ('database') {
                      <lmn-database [size]="20" />
                    }
                    @case ('terminal') {
                      <lmn-terminal [size]="20" />
                    }
                    @case ('refresh') {
                      <lmn-refresh-cw [size]="20" />
                    }
                  }
                </span>
                <volt-card-title class="text-base">
                  <h3>{{ feature.title }}</h3>
                </volt-card-title>
                <volt-card-description class="mt-2 leading-6">{{
                  feature.body
                }}</volt-card-description>
              </volt-card>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .glow::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      pointer-events: none;
      opacity: var(--on, 0);
      transition: opacity 300ms ease;
      background: radial-gradient(
        320px circle at var(--x, 50%) var(--y, 50%),
        var(--primary),
        transparent 65%
      );
      mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      mask-composite: exclude;
      -webkit-mask:
        linear-gradient(black, black) content-box,
        linear-gradient(black, black);
      -webkit-mask-composite: xor;
    }
  `,
})
export class FeatureGlowGrid {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private frame = 0;
  private pointer: { x: number; y: number } | null = null;

  protected readonly features: readonly Feature[] = [
    {
      icon: 'zap',
      title: 'Edge functions',
      body: 'Run code in 300 cities, cold start under 5 ms.',
    },
    { icon: 'lock', title: 'Auth', body: 'Passkeys, SSO and magic links behind one call.' },
    { icon: 'database', title: 'Postgres', body: 'Branch the database with every pull request.' },
    { icon: 'globe', title: 'Global cache', body: 'Invalidate by tag, everywhere, in a second.' },
    { icon: 'refresh', title: 'Queues', body: 'Retries, back-off and dead letters by default.' },
    { icon: 'terminal', title: 'CLI', body: 'Every dashboard action is one command away.' },
  ];

  constructor() {
    // The frame only exists in a browser; on the server this.frame stays 0.
    inject(DestroyRef).onDestroy(() => {
      if (this.frame) cancelAnimationFrame(this.frame);
    });
  }

  protected track(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    this.pointer = { x: event.clientX, y: event.clientY };
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const pointer = this.pointer;
      if (!pointer) return;
      for (const card of this.cards()) {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--x', `${Math.round(pointer.x - box.left)}px`);
        card.style.setProperty('--y', `${Math.round(pointer.y - box.top)}px`);
        card.style.setProperty('--on', '1');
      }
    });
  }

  protected fade(): void {
    this.pointer = null;
    for (const card of this.cards()) card.style.setProperty('--on', '0');
  }

  private cards(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.glow'));
  }
}
