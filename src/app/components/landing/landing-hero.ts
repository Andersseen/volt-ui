import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MoveEnterDirective,
  MoveHoverDirective,
  MoveLoopDirective,
  MoveTapDirective,
} from 'angular-movement';
import {
  LmnArrowRightIcon,
  LmnCheckIcon,
  LmnCopyIcon,
  LmnSparklesIcon,
  LmnTerminalIcon,
} from 'lumen-icons';
import {
  VoltBadge,
  VoltButton,
  VoltCheckbox,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSlider,
  VoltSwitch,
} from 'volt';
import { HOVER_LIFT, TAP_PRESS } from '../../lib/motion';

/** The install command the hero advertises and its copy button writes to the clipboard. */
export const INSTALL_COMMAND = 'npx @voltui/cli add button dialog form-field';

/**
 * Landing hero: the value proposition, the two primary journeys, the install command,
 * and a showcase panel built from real Volt components.
 *
 * The entrance stays a CSS animation — see the note next to `.reveal-up`. What
 * angular-movement adds here is the pointer layer: hover, press and the live-status
 * pulse, none of which can exist before hydration anyway.
 */
@Component({
  selector: 'app-landing-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MoveEnterDirective,
    MoveHoverDirective,
    MoveTapDirective,
    MoveLoopDirective,
    VoltBadge,
    VoltButton,
    VoltCheckbox,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSlider,
    VoltSwitch,
    LmnArrowRightIcon,
    LmnCheckIcon,
    LmnCopyIcon,
    LmnSparklesIcon,
    LmnTerminalIcon,
  ],
  template: `
    <section class="hero-surface relative overflow-hidden border-b border-border/60">
      <div class="hero-grid pointer-events-none absolute inset-0"></div>

      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div class="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <!-- min-w-0 lets this grid column shrink below the install command's
               intrinsic width so the <code> truncates instead of overflowing. -->
          <div class="min-w-0">
            <volt-badge
              variant="outline"
              class="reveal-up border-primary/30 bg-background/85 px-3 py-1.5 text-primary shadow-sm backdrop-blur"
            >
              <span
                moveLoop="pulse"
                [moveDuration]="1800"
                class="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-success"
              ></span>
              Volt UI 1.0.0 for Angular 21
            </volt-badge>

            <h1
              class="reveal-up reveal-delay-1 mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-normal text-foreground sm:text-5xl lg:text-6xl xl:text-[4.4rem]"
            >
              Ship Angular interfaces from components you can own.
            </h1>

            <p
              class="reveal-up reveal-delay-2 mt-6 max-w-xl text-balance text-lg leading-8 text-muted-foreground"
            >
              Copy polished, accessible Angular source into your app. Keep the speed of a component
              library, with the control of code that belongs to your product.
            </p>

            <div class="reveal-up reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <volt-button
                routerLink="/docs/introduction"
                size="lg"
                class="group w-full min-w-44 sm:w-auto"
                [moveWhileHover]="lift"
                [moveWhileTap]="press"
              >
                Start building
                <lmn-arrow-right
                  slot="trailing"
                  [size]="16"
                  class="transition-transform group-hover:translate-x-1"
                />
              </volt-button>
              <volt-button
                routerLink="/create-theme"
                size="lg"
                variant="outline"
                class="w-full min-w-44 bg-background/80 backdrop-blur sm:w-auto"
                [moveWhileHover]="lift"
                [moveWhileTap]="press"
              >
                <lmn-sparkles slot="leading" [size]="16" class="text-primary" />
                Try the theme studio
              </volt-button>
            </div>

            <div
              class="reveal-up reveal-delay-4 mt-7 flex max-w-xl items-center gap-2 rounded-lg border border-border/70 bg-background/90 p-2 pl-4 text-left shadow-xl shadow-black/5 backdrop-blur"
            >
              <lmn-terminal [size]="16" class="shrink-0 text-primary" />
              <code class="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm">
                {{ installCommand }}
              </code>
              <volt-button
                variant="ghost"
                size="icon"
                class="shrink-0"
                [moveWhileTap]="press"
                [attr.aria-label]="copied() ? 'Command copied' : 'Copy install command'"
                (click)="copyInstallCommand()"
              >
                <span class="sr-only">
                  {{ copied() ? 'Command copied' : 'Copy install command' }}
                </span>
                @if (copied()) {
                  <lmn-check moveEnter="bounce-in" [size]="16" class="text-success" />
                } @else {
                  <lmn-copy [size]="16" />
                }
              </volt-button>
            </div>
          </div>

          <!-- Real Volt components, not a mockup: whatever theme preset the visitor
               picks in the header re-skins this panel live. -->
          <div class="hero-showcase reveal-up reveal-delay-3 min-w-0">
            <div
              class="rounded-xl border border-border/70 bg-surface/80 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6"
            >
              <div class="mb-5 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">Project settings</p>
                  <p class="mt-0.5 truncate text-xs text-muted-foreground">
                    Built with Volt UI components
                  </p>
                </div>
                <volt-badge variant="secondary" class="shrink-0 font-mono text-[10px]">
                  live
                </volt-badge>
              </div>

              <div class="space-y-5">
                <volt-form-field>
                  <volt-label>Workspace name</volt-label>
                  <volt-input value="Acme Design System" />
                </volt-form-field>

                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-sm font-medium">Public theme</p>
                    <p class="mt-0.5 text-xs text-muted-foreground">Anyone can preview it</p>
                  </div>
                  <volt-switch [checked]="true" aria-label="Public theme" />
                </div>

                <div>
                  <div class="mb-2 flex items-center justify-between text-sm">
                    <span class="font-medium">Border radius</span>
                    <span class="font-mono text-xs text-muted-foreground">0.5rem</span>
                  </div>
                  <volt-slider [value]="45" [min]="0" [max]="100" ariaLabel="Border radius" />
                </div>

                <volt-progress [value]="82">
                  <volt-progress-label class="text-sm">Migration progress</volt-progress-label>
                  <volt-progress-value class="text-sm">82%</volt-progress-value>
                </volt-progress>

                <div class="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                  <volt-button size="sm" [moveWhileTap]="press">Save changes</volt-button>
                  <volt-button size="sm" variant="outline" [moveWhileTap]="press">
                    Reset
                  </volt-button>
                  <div class="flex items-center gap-2 pl-1">
                    <volt-checkbox [checked]="true" aria-label="Auto-sync tokens" />
                    <span class="text-xs text-muted-foreground">Auto-sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-surface {
      background: var(--background);
    }

    .hero-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 58%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 58%, transparent) 1px,
          transparent 1px
        );
      background-size: 44px 44px;
      mask-image: linear-gradient(to bottom, black 20%, transparent 92%);
    }

    /* The showcase is a real component composition in normal flow, so it survives
       every breakpoint instead of being hidden below a desktop-only cutoff. */
    .hero-showcase {
      perspective: 1400px;
    }

    @media (min-width: 1024px) {
      .hero-showcase > div {
        transform: rotateY(-4deg) rotateX(2deg);
        transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .hero-showcase:hover > div {
        transform: rotateY(0deg) rotateX(0deg);
      }
    }

    /*
     * The hero is above the fold on every viewport, so its entrance has to start at
     * first paint. A CSS animation ships with the server-rendered stylesheet and does
     * exactly that; a JavaScript entrance cannot run until hydration, by which point
     * the visitor has already seen the final state and would watch it blink out.
     */
    .reveal-up {
      animation: reveal-up 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .reveal-delay-1 {
      animation-delay: 80ms;
    }

    .reveal-delay-2 {
      animation-delay: 160ms;
    }

    .reveal-delay-3 {
      animation-delay: 240ms;
    }

    .reveal-delay-4 {
      animation-delay: 320ms;
    }

    @keyframes reveal-up {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-up {
        animation: none;
      }

      .hero-showcase > div,
      .hero-showcase:hover > div {
        transform: none;
        transition: none;
      }
    }
  `,
})
export class LandingHero {
  protected readonly copied = signal(false);
  protected readonly installCommand = INSTALL_COMMAND;
  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;

  async copyInstallCommand(): Promise<void> {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1800);
  }
}
