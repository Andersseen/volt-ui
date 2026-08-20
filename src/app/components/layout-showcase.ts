import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LayoutMetadata } from '../lib/layouts-metadata';
import { CodePanel } from './code-panel';

/**
 * The frame every layout page shares.
 *
 * Deliberately the same shape as `BlockShowcase`, with one difference that carries the
 * whole distinction between the two tabs: this one leads with the structure in words
 * rather than with what moves. A layout is chosen by whether its arrangement matches the
 * screen you have to build, so that is what the page has to answer first.
 */
@Component({
  selector: 'app-layout-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CodePanel],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ layout().label }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ layout().tagline }}</p>
      </div>

      <div class="overflow-hidden rounded-xl border border-border">
        <ng-content />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">The arrangement</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ layout().structure }}</p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <h2 class="text-sm font-medium">Assembled from</h2>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            @for (atom of layout().atoms; track atom.name) {
              <li>
                <a
                  [routerLink]="atom.path"
                  class="inline-flex rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {{ atom.name }}
                </a>
              </li>
            }
          </ul>
        </div>
      </div>

      <app-code-panel
        title="Layout source"
        [code]="code()"
        description="The arrangement, with the sample data kept in plain arrays at the bottom. Swap those for yours and the template stops being an example."
      />

      <div class="rounded-lg border border-border bg-muted/30 p-4">
        <p class="text-sm text-muted-foreground">
          Layouts stay unbranded on purpose: no gradients, no logos, no stock photography, and
          nothing fetched from a third party. If you want a section that is finished rather than a
          shape to fill,
          <a routerLink="/docs/blocks" class="text-primary underline-offset-4 hover:underline">
            the blocks gallery
          </a>
          is the other tab.
        </p>
      </div>
    </div>
  `,
})
export class LayoutShowcase {
  readonly layout = input.required<LayoutMetadata>();
  readonly code = input.required<string>();
}
