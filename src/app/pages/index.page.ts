import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardHeader,
  VoltCheckbox,
  VoltInput,
  VoltProgress,
  VoltSwitch,
} from 'volt';
import {
  LmnArrowRightIcon,
  LmnCheckIcon,
  LmnCopyIcon,
  LmnGithubIcon,
  LmnGridIcon,
  LmnPackageIcon,
  LmnShieldIcon,
  LmnSparklesIcon,
  LmnTerminalIcon,
  LmnZapIcon,
} from 'lumen-icons';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    VoltAvatar,
    VoltAvatarFallback,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardHeader,
    VoltCheckbox,
    VoltInput,
    VoltProgress,
    VoltSwitch,
    LmnArrowRightIcon,
    LmnCheckIcon,
    LmnCopyIcon,
    LmnGithubIcon,
    LmnGridIcon,
    LmnPackageIcon,
    LmnShieldIcon,
    LmnSparklesIcon,
    LmnTerminalIcon,
    LmnZapIcon,
  ],
  template: `
    <main class="relative z-10 overflow-hidden">
      <section class="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
        <div class="hero-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem]"></div>
        <div
          class="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]"
        ></div>

        <div class="mx-auto max-w-4xl text-center">
          <volt-badge
            variant="outline"
            class="reveal-up rounded-full border-primary/25 bg-background/80 px-3.5 py-1.5 text-primary shadow-sm backdrop-blur"
          >
            <span class="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            Volt UI 0.7 · Built for Angular 21
          </volt-badge>

          <h1
            class="reveal-up reveal-delay-1 mt-7 text-balance text-5xl font-bold tracking-[-0.055em] sm:text-7xl lg:text-[5.5rem] lg:leading-[0.98]"
          >
            Angular components
            <span class="electric-text">you actually own.</span>
          </h1>

          <p
            class="reveal-up reveal-delay-2 mx-auto mt-7 max-w-2xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            Accessible, themeable building blocks powered by ng-primitives and Tailwind CSS. Copy
            the source, shape the API, and ship without fighting your component library.
          </p>

          <div
            class="reveal-up reveal-delay-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <volt-button
              routerLink="/docs/introduction"
              size="lg"
              class="group min-w-40 rounded-full shadow-lg shadow-primary/20"
            >
              Start building
              <lmn-arrow-right
                slot="trailing"
                [size]="16"
                class="transition-transform group-hover:translate-x-1"
              />
            </volt-button>
            <volt-button
              routerLink="/docs/components"
              size="lg"
              variant="outline"
              class="min-w-40 rounded-full bg-background/70 backdrop-blur"
            >
              Explore components
            </volt-button>
          </div>

          <div
            class="reveal-up reveal-delay-4 mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-xl border border-border/70 bg-surface/85 p-2 pl-4 text-left shadow-lg shadow-black/5 backdrop-blur-xl"
          >
            <lmn-terminal [size]="16" class="shrink-0 text-primary" />
            <code class="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm"
              >npx &#64;voltui/cli add button dialog form-field</code
            >
            <volt-button
              variant="ghost"
              size="icon"
              class="shrink-0"
              [attr.aria-label]="copied() ? 'Command copied' : 'Copy install command'"
              (click)="copyInstallCommand()"
            >
              @if (copied()) {
                <lmn-check [size]="16" class="text-success" />
              } @else {
                <lmn-copy [size]="16" />
              }
            </volt-button>
          </div>
        </div>

        <div class="reveal-up reveal-delay-4 relative mx-auto mt-16 max-w-6xl lg:mt-20">
          <div
            class="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-r from-primary/15 via-transparent to-primary/10 blur-2xl"
          ></div>
          <div
            class="showcase-shell overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-2xl shadow-black/10 backdrop-blur-xl"
          >
            <div
              class="flex items-center justify-between border-b border-border/60 bg-muted/35 px-4 py-3"
            >
              <div class="flex items-center gap-1.5" aria-hidden="true">
                <span class="h-2.5 w-2.5 rounded-full bg-destructive/70"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-warning/80"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-success/70"></span>
              </div>
              <span class="font-mono text-[11px] text-muted-foreground"
                >your-app/settings.component.ts</span
              >
              <volt-badge variant="secondary" class="text-[10px]">Live components</volt-badge>
            </div>

            <div class="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div class="border-b border-border/60 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div class="mb-6 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold">Workspace settings</p>
                    <p class="mt-1 text-xs text-muted-foreground">Manage your public profile.</p>
                  </div>
                  <volt-avatar class="h-9 w-9">
                    <volt-avatar-fallback>VU</volt-avatar-fallback>
                  </volt-avatar>
                </div>

                <div class="space-y-5">
                  <label for="workspace-name" class="block space-y-2">
                    <span class="text-xs font-medium">Workspace name</span>
                    <volt-input
                      id="workspace-name"
                      value="Volt Studio"
                      aria-label="Workspace name"
                    />
                  </label>
                  <div
                    class="flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 p-3.5"
                  >
                    <div>
                      <p class="text-sm font-medium">Public profile</p>
                      <p class="mt-0.5 text-xs text-muted-foreground">Visible to your community.</p>
                    </div>
                    <volt-switch [checked]="true" aria-label="Public profile" />
                  </div>
                  <div class="flex items-center gap-3">
                    <volt-checkbox id="product-updates" [checked]="true" />
                    <label for="product-updates" class="text-sm">Send product updates</label>
                  </div>
                  <volt-button class="w-full">Save workspace</volt-button>
                </div>
              </div>

              <div class="bg-muted/15 p-5 sm:p-7">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold">Release readiness</p>
                    <p class="mt-1 text-xs text-muted-foreground">Component system health</p>
                  </div>
                  <volt-badge variant="outline" class="border-success/35 text-success"
                    >On track</volt-badge
                  >
                </div>

                <div class="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
                  @for (stat of showcaseStats; track stat.label) {
                    <div class="rounded-xl border border-border/60 bg-surface p-3 sm:p-4">
                      <p class="text-xl font-semibold tracking-tight sm:text-2xl">
                        {{ stat.value }}
                      </p>
                      <p class="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                        {{ stat.label }}
                      </p>
                    </div>
                  }
                </div>

                <div class="mt-6 rounded-xl border border-border/60 bg-surface p-4">
                  <div class="mb-3 flex items-center justify-between text-xs">
                    <span class="font-medium">Accessible interactions</span>
                    <span class="font-mono text-muted-foreground">92%</span>
                  </div>
                  <volt-progress [value]="92" />
                </div>

                <div class="mt-4 space-y-2">
                  @for (item of readiness; track item) {
                    <div
                      class="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-sm hover:border-border/60 hover:bg-surface"
                    >
                      <span
                        class="grid h-5 w-5 place-items-center rounded-full bg-success/10 text-success"
                      >
                        <lmn-check [size]="12" />
                      </span>
                      <span>{{ item }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-y border-border/60 bg-muted/20">
        <div
          class="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border/60 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6"
        >
          @for (proof of proofPoints; track proof.label) {
            <div class="px-4 py-7 text-center sm:px-6">
              <p class="text-2xl font-semibold tracking-tight">{{ proof.value }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ proof.label }}</p>
            </div>
          }
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div class="max-w-2xl">
          <volt-badge variant="outline" class="mb-5 rounded-full">Why Volt UI</volt-badge>
          <h2 class="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            A component system that stays out of your way.
          </h2>
          <p class="mt-5 text-lg leading-8 text-muted-foreground">
            Start with production-ready behavior, then make every detail yours. No opaque theme
            engine and no vendor lock-in.
          </p>
        </div>

        <div class="mt-12 grid gap-4 md:grid-cols-3">
          @for (feature of features; track feature.title) {
            <volt-card class="feature-card group h-full border-border/70 bg-surface/70">
              <volt-card-header>
                <div
                  class="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-transform group-hover:-translate-y-1"
                >
                  @switch (feature.icon) {
                    @case ('package') {
                      <lmn-package [size]="20" />
                    }
                    @case ('shield') {
                      <lmn-shield [size]="20" />
                    }
                    @default {
                      <lmn-sparkles [size]="20" />
                    }
                  }
                </div>
                <h3 class="text-lg font-semibold tracking-tight">{{ feature.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">
                  {{ feature.description }}
                </p>
              </volt-card-header>
              <volt-card-content>
                <span class="font-mono text-xs text-primary">{{ feature.detail }}</span>
              </volt-card-content>
            </volt-card>
          }
        </div>
      </section>

      <section class="border-y border-border/60 bg-foreground text-background">
        <div
          class="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28"
        >
          <div>
            <volt-badge
              variant="outline"
              class="border-background/20 bg-background/10 text-background"
            >
              <lmn-zap [size]="12" class="mr-1.5" />
              One command. Your source.
            </volt-badge>
            <h2 class="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Copy components into your project, not another black box.
            </h2>
            <p class="mt-5 max-w-xl text-lg leading-8 text-background/65">
              The CLI resolves component dependencies, adapts selectors, and leaves readable Angular
              source in your repository.
            </p>
            <volt-button
              routerLink="/docs/introduction"
              variant="outline"
              size="lg"
              class="mt-8 rounded-full border-background/20 bg-background text-foreground hover:bg-background/90"
            >
              Read the installation guide
              <lmn-arrow-right slot="trailing" [size]="16" />
            </volt-button>
          </div>

          <div
            class="overflow-hidden rounded-2xl border border-background/15 bg-black/40 shadow-2xl"
          >
            <div class="flex items-center gap-2 border-b border-background/10 px-4 py-3">
              <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-amber-300"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span class="ml-auto font-mono text-[10px] text-background/40">terminal</span>
            </div>
            <div class="space-y-4 p-5 font-mono text-xs sm:p-7 sm:text-sm">
              <p><span class="text-emerald-400">➜</span> npx &#64;voltui/cli init</p>
              <p class="text-background/50">✓ Tailwind tokens configured</p>
              <p><span class="text-emerald-400">➜</span> npx &#64;voltui/cli add dialog</p>
              <div class="space-y-1 border-l border-background/15 pl-4 text-background/55">
                <p>create src/app/ui/dialog/dialog.ts</p>
                <p>create src/app/ui/button/button.ts</p>
                <p>update src/app/ui/index.ts</p>
              </div>
              <p class="text-primary">✓ Components are yours. Start building.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div
          class="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary px-6 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-12 sm:py-20"
        >
          <div class="cta-grid pointer-events-none absolute inset-0 opacity-20"></div>
          <lmn-grid [size]="24" class="relative mx-auto mb-6" />
          <h2 class="relative text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Build the Angular interface you wanted.
          </h2>
          <p class="relative mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/75">
            Explore 40+ components, accessible layouts, five color systems, and an AI-ready
            development workflow.
          </p>
          <div class="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <volt-button
              routerLink="/docs/components"
              variant="outline"
              size="lg"
              class="rounded-full border-primary-foreground/30 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Browse components
            </volt-button>
            <a
              href="https://github.com/Andersseen/volt-ui"
              target="_blank"
              rel="noreferrer"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-primary-foreground/10"
            >
              <lmn-github [size]="16" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: `
    .hero-grid,
    .cta-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        );
      background-size: 48px 48px;
      mask-image: linear-gradient(to bottom, black, transparent 90%);
    }

    .cta-grid {
      background-image:
        linear-gradient(to right, currentColor 1px, transparent 1px),
        linear-gradient(to bottom, currentColor 1px, transparent 1px);
      mask-image: radial-gradient(circle at center, black, transparent 75%);
    }

    .electric-text {
      display: block;
      color: transparent;
      background: linear-gradient(115deg, var(--primary), oklch(0.72 0.18 300), var(--primary));
      background-size: 200% auto;
      background-clip: text;
      animation: electric-shift 7s linear infinite;
    }

    .showcase-shell {
      transform: perspective(1400px) rotateX(1.5deg);
      transform-origin: center top;
    }

    .feature-card {
      transition:
        transform 220ms ease,
        border-color 220ms ease,
        box-shadow 220ms ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: color-mix(in oklch, var(--primary) 35%, var(--border));
      box-shadow: 0 20px 45px -30px color-mix(in oklch, var(--primary) 45%, transparent);
    }

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

    @keyframes electric-shift {
      to {
        background-position: 200% center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-up,
      .electric-text {
        animation: none;
      }

      .feature-card {
        transition: none;
      }
    }
  `,
})
export default class Home {
  protected readonly copied = signal(false);

  protected readonly showcaseStats = [
    { value: '41', label: 'components' },
    { value: '213', label: 'tests passing' },
    { value: '5×5', label: 'theme presets' },
  ];

  protected readonly readiness = [
    'Keyboard interactions verified',
    'Reactive Forms connected',
    'Theme tokens synchronized',
  ];

  protected readonly proofPoints = [
    { value: '41', label: 'documented components' },
    { value: '213', label: 'automated tests' },
    { value: '0', label: 'NgModules required' },
    { value: '100%', label: 'source ownership' },
  ];

  protected readonly features = [
    {
      icon: 'package',
      title: 'Own the source',
      description:
        'The CLI copies readable standalone components directly into your application. Change every line when your product needs it.',
      detail: 'npx @voltui/cli add',
    },
    {
      icon: 'shield',
      title: 'Behavior built in',
      description:
        'ng-primitives handles focus, keyboard navigation, overlays, and ARIA contracts while Volt UI handles the product-ready design.',
      detail: 'WAI-ARIA · CVA · zoneless',
    },
    {
      icon: 'sparkles',
      title: 'Designed as a system',
      description:
        'Semantic Tailwind tokens, color presets, and style presets let one component set adapt to a complete visual language.',
      detail: '5 colors × 5 styles',
    },
  ];

  protected async copyInstallCommand(): Promise<void> {
    await navigator.clipboard.writeText('npx @voltui/cli add button dialog form-field');
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1800);
  }
}
