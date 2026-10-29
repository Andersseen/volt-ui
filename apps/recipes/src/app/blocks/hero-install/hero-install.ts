import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LmnArrowRightIcon, LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import { VoltButton, VoltToggleGroup, VoltToggleGroupItem } from 'volt';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface HeroFact {
  readonly value: string;
  readonly label: string;
}

const MANAGERS: readonly PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

const DEFAULT_FACTS: readonly HeroFact[] = [
  { value: '0', label: 'runtime deps' },
  { value: 'SSR', label: 'zoneless ready' },
  { value: '4 kB', label: 'gzipped' },
];

/** How long the copy button says "Copied" before it goes back to being a copy button. */
const COPIED_FOR_MS = 1800;

/**
 * Library hero whose last step is the install itself.
 *
 * The visitor arrives wanting to know two things: what this is, and how to get it. The
 * headline answers the first; the command answers the second, in their own package manager,
 * one click from the clipboard. Three facts underneath carry the claims a developer checks
 * before installing anything, so they never have to scroll for them.
 *
 * The command is derived from the selected manager rather than stored per manager, so a
 * package rename is one input, not four strings. The ribbons behind the headline are CSS
 * only: they start at first paint from the server-rendered stylesheet and stop entirely
 * under `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-hero-install',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltToggleGroup,
    VoltToggleGroupItem,
    LmnArrowRightIcon,
    LmnCheckIcon,
    LmnCopyIcon,
  ],
  host: { class: 'block' },
  template: `
    <section
      class="@container relative isolate overflow-hidden bg-background px-4 py-20 @2xl:px-6 @2xl:py-28"
    >
      <div class="ribbon ribbon-a pointer-events-none absolute" aria-hidden="true"></div>
      <div class="ribbon ribbon-b pointer-events-none absolute" aria-hidden="true"></div>

      <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <p
          class="rise inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3.5 py-1.5 text-sm text-foreground backdrop-blur"
        >
          <span class="status h-2 w-2 rounded-full bg-success" aria-hidden="true"></span>
          {{ eyebrow() }}
        </p>

        <h1
          class="rise mt-7 text-balance text-4xl font-bold leading-[1.02] tracking-tight text-foreground @3xl:text-6xl"
        >
          {{ headline() }}
          <span class="accent">{{ accent() }}</span>
        </h1>

        <p class="rise mt-6 max-w-xl text-balance text-lg leading-8 text-muted-foreground">
          {{ description() }}
        </p>

        <div class="rise mt-9 flex w-full flex-col gap-3 @md:w-auto @md:flex-row">
          <volt-button size="lg" class="group w-full min-w-44 @md:w-auto" (click)="primary.emit()">
            {{ primaryLabel() }}
            <lmn-arrow-right
              slot="trailing"
              [size]="16"
              class="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </volt-button>
          <volt-button
            variant="outline"
            size="lg"
            class="w-full min-w-44 @md:w-auto"
            (click)="secondary.emit()"
          >
            {{ secondaryLabel() }}
          </volt-button>
        </div>

        <!-- The install, in the visitor's own package manager. -->
        <div
          class="rise mt-10 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card/90 text-left shadow-lg backdrop-blur"
        >
          <div class="border-b border-border px-2 py-1.5">
            <volt-toggle-group
              type="single"
              [allowDeselection]="false"
              [value]="[manager()]"
              (valueChange)="choose($event)"
              aria-label="Package manager"
            >
              @for (option of managers; track option) {
                <volt-toggle-group-item [value]="option" size="sm" class="font-mono">
                  {{ option }}
                </volt-toggle-group-item>
              }
            </volt-toggle-group>
          </div>
          <div class="flex items-center gap-3 px-4 py-3.5">
            <code class="flex-1 truncate font-mono text-sm text-foreground">
              <span class="select-none text-muted-foreground" aria-hidden="true">$ </span
              >{{ command() }}
            </code>
            <volt-button
              variant="ghost"
              size="icon"
              [aria-label]="copied() ? 'Copied' : 'Copy install command'"
              (click)="copy()"
            >
              @if (copied()) {
                <lmn-check [size]="16" class="text-success" />
              } @else {
                <lmn-copy [size]="16" />
              }
            </volt-button>
          </div>
        </div>
        <!-- Announced once per copy; the icon swap alone says nothing to a screen reader. -->
        <p class="sr-only" aria-live="polite">{{ copied() ? 'Install command copied' : '' }}</p>

        @if (facts().length) {
          <dl
            class="rise mt-12 grid w-full max-w-xl divide-x divide-border"
            [style.grid-template-columns]="'repeat(' + facts().length + ', minmax(0, 1fr))'"
          >
            @for (fact of facts(); track fact.label) {
              <div class="flex flex-col-reverse items-center gap-1 px-2">
                <dt class="text-xs text-muted-foreground @md:text-sm">{{ fact.label }}</dt>
                <dd class="text-2xl font-bold tracking-tight text-foreground @md:text-3xl">
                  {{ fact.value }}
                </dd>
              </div>
            }
          </dl>
        }
      </div>
    </section>
  `,
  styles: `
    /* Two long, blurred bands crossing behind the headline. One is the brand colour, the
       other a cooler partner, so the wash reads as light rather than as a coloured box. */
    .ribbon {
      left: -25%;
      height: 9rem;
      width: 150%;
      border-radius: 9999px;
      filter: blur(48px);
      opacity: 0.45;
    }

    .ribbon-a {
      top: 38%;
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in oklch, var(--primary) 70%, transparent) 45%,
        transparent
      );
      transform: rotate(-14deg);
    }

    .ribbon-b {
      top: 52%;
      height: 6rem;
      background: linear-gradient(
        90deg,
        transparent 10%,
        color-mix(in oklch, var(--info) 45%, transparent) 60%,
        transparent
      );
      transform: rotate(9deg);
    }

    /* The second word of the headline carries the brand: a gradient clipped to the glyphs. */
    .accent {
      background: linear-gradient(
        100deg,
        var(--primary),
        color-mix(in oklch, var(--primary) 45%, var(--foreground))
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    @media (prefers-reduced-motion: no-preference) {
      .ribbon-a {
        animation: sway-a 14s ease-in-out infinite alternate;
      }
      .ribbon-b {
        animation: sway-b 18s ease-in-out infinite alternate;
      }
      .status {
        animation: pulse 2.4s ease-in-out infinite;
      }
      .rise {
        animation: rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .rise:nth-child(2) {
        animation-delay: 80ms;
      }
      .rise:nth-child(3) {
        animation-delay: 160ms;
      }
      .rise:nth-child(4) {
        animation-delay: 240ms;
      }
      .rise:nth-child(n + 5) {
        animation-delay: 320ms;
      }
    }

    @keyframes sway-a {
      to {
        transform: rotate(-8deg) translate3d(4%, -12%, 0);
      }
    }

    @keyframes sway-b {
      to {
        transform: rotate(4deg) translate3d(-5%, 10%, 0);
      }
    }

    @keyframes pulse {
      50% {
        opacity: 0.35;
      }
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
    }
  `,
})
export class HeroInstall {
  readonly eyebrow = input('v1.4 · Angular 21 and 22');
  readonly headline = input('Motion for Angular that follows your');
  /** The last word of the headline, drawn in the brand gradient. */
  readonly accent = input('state.');
  readonly description = input(
    'Start with one attribute. Coordinate enter, exit and state changes when your interface needs more — native browser animations, zero runtime dependencies.'
  );
  readonly primaryLabel = input('Get started');
  readonly secondaryLabel = input('Explore demos');
  readonly packageName = input('your-library');
  readonly facts = input<readonly HeroFact[]>(DEFAULT_FACTS);

  readonly primary = output<void>();
  readonly secondary = output<void>();
  /** The exact command that reached the clipboard. */
  readonly copiedCommand = output<string>();

  protected readonly managers = MANAGERS;
  protected readonly manager = signal<PackageManager>('npm');
  protected readonly copied = signal(false);

  protected readonly command = computed(() => {
    const manager = this.manager();
    const verb = manager === 'npm' ? 'install' : 'add';
    return `${manager} ${verb} ${this.packageName()}`;
  });

  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected choose(value: readonly string[]): void {
    const next = value[0] as PackageManager | undefined;
    if (next) this.manager.set(next);
  }

  protected async copy(): Promise<void> {
    const command = this.command();
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // No clipboard (insecure context, denied permission): the command is still on screen
      // to select by hand, so there is nothing to report as copied.
      return;
    }

    this.copiedCommand.emit(command);
    this.copied.set(true);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set(false), COPIED_FOR_MS);
  }
}
