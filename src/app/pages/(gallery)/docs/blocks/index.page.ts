import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlockThumbnail } from '../../../../components/block-thumbnail';
import { Reveal } from '../../../../components/reveal';
import { BLOCKS, UPCOMING_BLOCKS } from '../../../../lib/blocks-metadata';
import { MOTION } from '../../../../lib/motion';

@Component({
  selector: 'app-blocks-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BlockThumbnail, Reveal],
  template: `
    <div class="space-y-10">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Blocks</h1>
        <p class="mt-2 text-lg text-muted-foreground">
          Whole page sections built from Volt components, with the motion already wired. Every block
          is one file: copy it, rename it, and delete the parts you do not want.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <p class="text-sm font-medium">One file each</p>
          <p class="mt-1 text-xs text-muted-foreground">
            Template, styles and behaviour in a single standalone component.
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <p class="text-sm font-medium">No animation runtime</p>
          <p class="mt-1 text-xs text-muted-foreground">
            CSS and a pointer handler. Nothing to add to your bundle.
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <p class="text-sm font-medium">Theme-aware</p>
          <p class="mt-1 text-xs text-muted-foreground">
            Built on tokens, so every preset and dark mode come along.
          </p>
        </div>
      </div>

      <div class="h-px w-full bg-border"></div>

      <div class="grid gap-5 lg:grid-cols-2">
        @for (block of blocks; track block.slug; let i = $index) {
          <a
            [routerLink]="block.path"
            [appReveal]="(i % 2) * stagger"
            class="group flex flex-col overflow-hidden rounded-xl border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 motion-safe:hover:-translate-y-1"
          >
            <div class="thumb relative h-48 overflow-hidden border-b border-border bg-background">
              <app-block-thumbnail [slug]="block.slug" />
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between gap-2">
                <h2 class="font-medium group-hover:text-primary">{{ block.label }}</h2>
                <span class="text-xs text-muted-foreground">{{ block.atoms.length }} atoms</span>
              </div>
              <p class="mt-1.5 text-sm text-muted-foreground">{{ block.tagline }}</p>
            </div>
          </a>
        }
      </div>

      <section class="space-y-4">
        <div class="flex items-baseline gap-3">
          <h2 class="text-lg font-semibold">Coming soon</h2>
          <span class="text-sm text-muted-foreground">
            Four more sections, then the set is complete.
          </span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          @for (block of upcoming; track block.label) {
            <div
              class="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-muted-foreground"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-foreground/70">{{ block.label }}</p>
                <span
                  class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium leading-none"
                >
                  Soon
                </span>
              </div>
              <p class="mt-1.5 text-sm">{{ block.tagline }}</p>
            </div>
          }
        </div>
        <p class="text-sm text-muted-foreground">
          Missing one you need?
          <a
            href="https://github.com/andersseen/volt-ui/issues/new"
            target="_blank"
            rel="noreferrer"
            class="text-primary underline-offset-4 hover:underline"
          >
            Open an issue
          </a>
          and it goes to the front of the queue.
        </p>
      </section>
    </div>
  `,
  styles: `
    /* Fades the crop line at the bottom of the thumbnail, so a block that is taller than
       the frame reads as continuing rather than as cut off. */
    .thumb::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent 62%, var(--background));
    }
  `,
})
export default class BlocksIndexPage {
  protected readonly blocks = BLOCKS;
  protected readonly upcoming = UPCOMING_BLOCKS;
  protected readonly stagger = MOTION.stagger;
}
