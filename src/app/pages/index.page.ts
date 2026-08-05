import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardHeader,
  VoltCheckbox,
  VoltInput,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
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
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardHeader,
    VoltCheckbox,
    VoltInput,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
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
      <section class="hero-surface relative border-b border-border/60">
        <div class="hero-grid pointer-events-none absolute inset-0"></div>
        <div class="product-scene pointer-events-none absolute inset-0" aria-hidden="true">
          <div class="scene-panel scene-panel-main">
            <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-success"></span>
                <span class="font-mono text-[10px] uppercase text-muted-foreground">
                  release board
                </span>
              </div>
              <span class="font-mono text-[10px] text-primary">v0.8.3</span>
            </div>
            <div class="space-y-4 p-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-foreground">Component audit</p>
                  <p class="mt-1 text-xs text-muted-foreground">API, a11y and theme coverage</p>
                </div>
                <span
                  class="rounded-md border border-success/30 px-2 py-1 text-[10px] text-success"
                >
                  ready
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2">
                @for (stat of showcaseStats; track stat.label) {
                  <div class="rounded-md border border-border/60 bg-background/80 p-3">
                    <p class="text-xl font-semibold tracking-tight">{{ stat.value }}</p>
                    <p class="mt-1 text-[10px] text-muted-foreground">{{ stat.label }}</p>
                  </div>
                }
              </div>

              <div class="rounded-md border border-border/60 bg-background/80 p-3">
                <div class="mb-2 flex items-center justify-between text-xs">
                  <span class="font-medium">Release confidence</span>
                  <span class="font-mono text-primary">96%</span>
                </div>
                <div class="h-2 overflow-hidden rounded-md bg-secondary">
                  <div class="h-full w-[96%] rounded-md bg-primary"></div>
                </div>
              </div>

              <div class="space-y-2">
                @for (item of readiness; track item) {
                  <div class="flex items-center gap-2 rounded-md bg-muted/45 px-3 py-2 text-xs">
                    <span
                      class="grid h-5 w-5 place-items-center rounded-md bg-success/10 text-success"
                    >
                      <lmn-check [size]="12" />
                    </span>
                    <span>{{ item }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="scene-panel scene-panel-code">
            <div class="border-b border-white/10 px-4 py-3 font-mono text-[10px] text-white/55">
              terminal
            </div>
            <div class="space-y-3 p-4 font-mono text-xs text-white">
              <p><span class="text-success">></span> npx &#64;voltui/cli add dialog</p>
              <p class="text-white/55">created ui/dialog.ts</p>
              <p class="text-white/55">created ui/button.ts</p>
              <p class="text-primary">source copied into your app</p>
            </div>
          </div>

          <div class="scene-panel scene-panel-form">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold">Workspace</p>
                <p class="mt-1 text-xs text-muted-foreground">Owned source, live tokens</p>
              </div>
              <span class="rounded-md bg-primary/10 px-2 py-1 text-[10px] text-primary">
                Angular 21
              </span>
            </div>
            <div class="space-y-3">
              <div class="h-9 rounded-md border border-input bg-background"></div>
              <div class="flex items-center justify-between rounded-md border border-border/70 p-3">
                <span class="text-xs">Public theme preview</span>
                <span class="h-5 w-9 rounded-md bg-primary"></span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="h-4 w-4 rounded-md border border-primary bg-primary"></span>
                Forms ready
              </div>
            </div>
          </div>
        </div>

        <div
          class="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-end px-4 pb-10 pt-20 sm:px-6 lg:pb-12 lg:pt-28"
        >
          <div class="max-w-4xl pb-12 sm:pb-16 lg:pb-20">
            <volt-badge
              variant="outline"
              class="reveal-up border-primary/30 bg-background/85 px-3 py-1.5 text-primary shadow-sm backdrop-blur"
            >
              <span class="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
              Volt UI 0.8.3 for Angular 21
            </volt-badge>

            <h1
              class="reveal-up reveal-delay-1 mt-7 max-w-4xl text-balance text-5xl font-bold leading-[1.02] tracking-normal text-foreground sm:text-7xl lg:text-[5.7rem]"
            >
              Ship Angular interfaces from components you can own.
            </h1>

            <p
              class="reveal-up reveal-delay-2 mt-7 max-w-2xl text-balance text-lg leading-8 text-muted-foreground sm:text-xl"
            >
              Copy polished, accessible Angular source into your app. Keep the speed of a component
              library, with the control of code that belongs to your product.
            </p>

            <div class="reveal-up reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
              <volt-button routerLink="/docs/introduction" size="lg" class="group min-w-44">
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
                class="min-w-44 bg-background/80 backdrop-blur"
              >
                Browse components
              </volt-button>
            </div>

            <div
              class="reveal-up reveal-delay-4 mt-7 flex max-w-2xl items-center gap-2 rounded-lg border border-border/70 bg-background/90 p-2 pl-4 text-left shadow-xl shadow-black/5 backdrop-blur"
            >
              <lmn-terminal [size]="16" class="shrink-0 text-primary" />
              <code class="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm">
                npx &#64;voltui/cli add button dialog form-field
              </code>
              <volt-button
                variant="ghost"
                size="icon"
                class="shrink-0"
                [attr.aria-label]="copied() ? 'Command copied' : 'Copy install command'"
                (click)="copyInstallCommand()"
              >
                <span class="sr-only">
                  {{ copied() ? 'Command copied' : 'Copy install command' }}
                </span>
                @if (copied()) {
                  <lmn-check [size]="16" class="text-success" />
                } @else {
                  <lmn-copy [size]="16" />
                }
              </volt-button>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-border/60 bg-background">
        <div
          class="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border/60 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6"
        >
          @for (proof of proofPoints; track proof.label) {
            <div class="px-4 py-7 sm:px-6">
              <p class="text-3xl font-semibold tracking-normal">{{ proof.value }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ proof.label }}</p>
            </div>
          }
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <volt-badge variant="outline" class="mb-5">Built for ownership</volt-badge>
            <h2 class="text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              Production behavior first. Product taste next.
            </h2>
          </div>
          <p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
            Volt UI starts with ng-primitives for focus, overlays, ARIA and forms, then wraps it in
            Angular signals, Tailwind tokens, and copyable source you can reshape.
          </p>
        </div>

        <div class="mt-12 grid gap-4 md:grid-cols-3">
          @for (feature of features; track feature.title) {
            <volt-card class="feature-card h-full border-border/70 bg-surface/70">
              <volt-card-header>
                <div
                  class="mb-5 grid h-11 w-11 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-primary"
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
                <h3 class="text-lg font-semibold tracking-normal">{{ feature.title }}</h3>
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

      <section class="border-y border-border/60 bg-muted/35">
        <div
          class="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-28"
        >
          <div class="max-w-xl">
            <volt-badge variant="outline">
              <lmn-zap [size]="12" class="mr-1.5" />
              One command. Your source.
            </volt-badge>
            <h2 class="mt-6 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              A workflow that ends in editable Angular, not vendor lock-in.
            </h2>
            <p class="mt-5 text-lg leading-8 text-muted-foreground">
              The CLI resolves component dependencies, writes readable files, and keeps selectors
              consistent with the source-first workflow.
            </p>
            <volt-button routerLink="/docs/introduction" variant="outline" size="lg" class="mt-8">
              Read the installation guide
              <lmn-arrow-right slot="trailing" [size]="16" />
            </volt-button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div
              class="rounded-lg border border-border/70 bg-background p-5 shadow-xl shadow-black/5"
            >
              <div class="mb-4 flex items-center justify-between">
                <p class="font-mono text-xs text-muted-foreground">app/ui/button.ts</p>
                <span class="rounded-md bg-success/10 px-2 py-1 text-[10px] text-success">
                  copied
                </span>
              </div>
              <div class="space-y-2 font-mono text-xs">
                <p><span class="text-primary">export</span> class UiButton {{ '{' }}</p>
                <p class="pl-4 text-muted-foreground">readonly variant = input(...)</p>
                <p class="pl-4 text-muted-foreground">readonly size = input(...)</p>
                <p>{{ '}' }}</p>
              </div>
            </div>

            <div
              class="rounded-lg border border-border/70 bg-background p-5 shadow-xl shadow-black/5"
            >
              <p class="text-sm font-semibold">Theme preview</p>
              <p class="mt-1 text-xs text-muted-foreground">Five color systems, five styles.</p>
              <div class="mt-5 grid grid-cols-5 gap-2">
                @for (swatch of swatches; track swatch) {
                  <span [class]="swatch"></span>
                }
              </div>
              <div
                class="mt-5 flex items-center justify-between rounded-md border border-border/70 p-3"
              >
                <span class="text-xs">Dark mode ready</span>
                <volt-switch [checked]="true" aria-label="Dark mode ready" />
              </div>
            </div>

            <div
              class="rounded-lg border border-border/70 bg-background p-5 shadow-xl shadow-black/5 sm:col-span-2"
            >
              <div class="mb-3 flex items-center justify-between">
                <volt-progress [value]="92" class="w-full">
                  <volt-progress-label>Accessible interactions</volt-progress-label>
                  <volt-progress-value>92%</volt-progress-value>
                </volt-progress>
              </div>
              <div class="grid gap-3 pt-3 sm:grid-cols-3">
                <label for="landing-workspace" class="space-y-2">
                  <span class="text-xs font-medium">Workspace</span>
                  <volt-input id="landing-workspace" value="Volt Studio" />
                </label>
                <div class="flex items-end gap-3 pb-2">
                  <volt-checkbox id="landing-owned-source" [checked]="true" />
                  <label for="landing-owned-source" class="text-sm">Owned source</label>
                </div>
                <div class="flex items-end justify-end">
                  <volt-button class="w-full sm:w-auto">Save UI</volt-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div
          class="grid gap-8 rounded-lg border border-border/70 bg-foreground p-6 text-background shadow-2xl shadow-black/15 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div>
            <lmn-grid [size]="24" class="mb-6" />
            <h2 class="max-w-2xl text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              Build the Angular interface you wanted.
            </h2>
            <p class="mt-5 max-w-2xl text-lg text-background/70">
              Explore 40+ components, accessible layouts, theme presets, and an AI-ready workflow.
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <volt-button
              routerLink="/docs/components"
              variant="outline"
              size="lg"
              class="border-background/25 bg-background text-foreground hover:bg-background/90"
            >
              Browse components
            </volt-button>
            <a
              href="https://github.com/Andersseen/volt-ui"
              target="_blank"
              rel="noreferrer"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-background/25 px-5 text-sm font-medium transition-colors hover:bg-background/10"
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

    .product-scene {
      opacity: 0.82;
    }

    .scene-panel {
      position: absolute;
      border: 1px solid color-mix(in oklch, var(--border) 72%, transparent);
      border-radius: 8px;
      background: color-mix(in oklch, var(--background) 86%, transparent);
      box-shadow: 0 30px 80px -55px color-mix(in oklch, var(--foreground) 45%, transparent);
      backdrop-filter: blur(18px);
    }

    .scene-panel-main {
      right: max(1rem, calc((100vw - 80rem) / 2));
      top: 7rem;
      width: min(34rem, 42vw);
    }

    .scene-panel-code {
      right: max(2rem, calc((100vw - 76rem) / 2 + 25rem));
      bottom: 5rem;
      width: min(25rem, 34vw);
      background: color-mix(in oklch, black 74%, var(--primary) 26%);
    }

    .scene-panel-form {
      right: max(1rem, calc((100vw - 80rem) / 2 + 4rem));
      bottom: 2.5rem;
      width: min(23rem, 32vw);
      padding: 1.25rem;
    }

    .feature-card {
      transition:
        transform 220ms ease,
        border-color 220ms ease,
        box-shadow 220ms ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: color-mix(in oklch, var(--primary) 34%, var(--border));
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

    @media (max-width: 900px) {
      .product-scene {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-up {
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
    { value: '264', label: 'tests passing' },
    { value: '25', label: 'theme combos' },
  ];

  protected readonly readiness = [
    'Keyboard paths covered',
    'Reactive Forms connected',
    'Portal controls exposed',
    'AI docs synchronized',
  ];

  protected readonly proofPoints = [
    { value: '41', label: 'documented components' },
    { value: '264', label: 'automated tests' },
    { value: '0', label: 'NgModules required' },
    { value: '100%', label: 'source ownership' },
  ];

  protected readonly swatches = [
    'h-9 rounded-md border border-border bg-primary',
    'h-9 rounded-md border border-border bg-success',
    'h-9 rounded-md border border-border bg-warning',
    'h-9 rounded-md border border-border bg-accent',
    'h-9 rounded-md border border-border bg-secondary',
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
        'ng-primitives handles focus, keyboard navigation, overlays, and ARIA contracts while Volt UI handles product-ready styling.',
      detail: 'WAI-ARIA - CVA - zoneless',
    },
    {
      icon: 'sparkles',
      title: 'Designed as a system',
      description:
        'Semantic Tailwind tokens, color presets, and style presets let one component set adapt to a complete visual language.',
      detail: '5 colors - 5 styles',
    },
  ];

  protected async copyInstallCommand(): Promise<void> {
    await navigator.clipboard.writeText('npx @voltui/cli add button dialog form-field');
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1800);
  }
}
