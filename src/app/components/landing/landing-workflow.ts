import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoveHoverDirective, MoveTapDirective } from 'angular-movement';
import { LmnArrowRightIcon, LmnZapIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltButton,
  VoltCheckbox,
  VoltInput,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSwitch,
} from 'volt';
import { HOVER_LIFT, HOVER_POP, MOTION, TAP_PRESS } from '../../lib/motion';
import { Reveal } from '../reveal';

/** "One command, your source" — the CLI story, shown next to what it produces. */
@Component({
  selector: 'app-landing-workflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Reveal,
    MoveHoverDirective,
    MoveTapDirective,
    VoltBadge,
    VoltButton,
    VoltCheckbox,
    VoltInput,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSwitch,
    LmnArrowRightIcon,
    LmnZapIcon,
  ],
  template: `
    <section class="border-y border-border/60 bg-muted/35">
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-28"
      >
        <div appReveal appRevealPreset="fade-right" class="max-w-xl">
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
          <volt-button
            routerLink="/docs/introduction"
            variant="outline"
            size="lg"
            class="mt-8"
            [moveWhileHover]="lift"
            [moveWhileTap]="press"
          >
            Read the installation guide
            <lmn-arrow-right slot="trailing" [size]="16" />
          </volt-button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            appReveal
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
            [appReveal]="stagger"
            class="rounded-lg border border-border/70 bg-background p-5 shadow-xl shadow-black/5"
          >
            <p class="text-sm font-semibold">Theme preview</p>
            <p class="mt-1 text-xs text-muted-foreground">Five color systems, five styles.</p>
            <div class="mt-5 grid grid-cols-5 gap-2">
              @for (swatch of swatches; track swatch.name) {
                <span
                  [moveWhileHover]="swatchPop"
                  class="theme-swatch h-9 rounded-md border border-border"
                  [attr.data-color]="swatch.name"
                  [attr.aria-label]="swatch.name + ' color preset'"
                ></span>
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
            [appReveal]="stagger * 2"
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
                <volt-button class="w-full sm:w-auto" [moveWhileTap]="press">Save UI</volt-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .theme-swatch {
      background: var(--swatch-primary);
    }

    .theme-swatch[data-color='volt'] {
      --swatch-primary: oklch(0.566 0.22 265);
    }

    .theme-swatch[data-color='ember'] {
      --swatch-primary: oklch(0.58 0.22 32);
    }

    .theme-swatch[data-color='sage'] {
      --swatch-primary: oklch(0.532 0.15 155);
    }

    .theme-swatch[data-color='dusk'] {
      --swatch-primary: oklch(0.55 0.2 295);
    }

    .theme-swatch[data-color='glacier'] {
      --swatch-primary: oklch(0.526 0.16 225);
    }
  `,
})
export class LandingWorkflow {
  protected readonly stagger = MOTION.stagger;

  protected readonly lift = HOVER_LIFT;
  protected readonly press = TAP_PRESS;
  protected readonly swatchPop = HOVER_POP;

  protected readonly swatches = [
    { name: 'volt' },
    { name: 'ember' },
    { name: 'sage' },
    { name: 'dusk' },
    { name: 'glacier' },
  ];
}
