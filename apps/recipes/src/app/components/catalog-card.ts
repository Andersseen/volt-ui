import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnFolderIcon, LmnZapIcon } from 'lumen-icons';
import { VoltBadge, VoltCard, VoltCardDescription, VoltCardHeader, VoltCardTitle } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { BlockThumbnail } from './block-thumbnail';
import type { CatalogEntry } from '../lib/catalog';

/**
 * One entry on a listing or the home page.
 *
 * The card is a `volt-card` with a stretched link, not one big `<a>`: a thumbnail is a live render
 * that contains real anchors, and an `<a>` inside an `<a>` is invalid HTML the parser silently
 * rewrites, which desynchronises the DOM from the server's and breaks hydration. Stretching the
 * title's link over the card keeps it one click target with a short accessible name.
 */
@Component({
  selector: 'app-catalog-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    BlockThumbnail,
    VoltBadge,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    LmnFolderIcon,
    LmnZapIcon,
  ],
  host: { class: 'block min-w-0' },
  template: `
    <volt-card
      class="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 motion-safe:hover:-translate-y-1"
    >
      @if (entry().kind === 'blocks') {
        <div
          class="thumb relative aspect-[16/9] overflow-hidden border-b border-border bg-background"
        >
          <app-block-thumbnail [slug]="entry().slug" />
        </div>
      }
      <volt-card-header class="flex-1 p-4">
        @if (entry().kind !== 'blocks') {
          <span
            class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden="true"
          >
            @if (entry().kind === 'layouts') {
              <lmn-folder [size]="16" />
            } @else {
              <lmn-zap [size]="16" />
            }
          </span>
        }
        @if (group()) {
          <p class="text-xs font-medium uppercase tracking-wider text-primary">{{ group() }}</p>
        }
        <div class="flex items-center justify-between gap-2">
          <volt-card-title class="text-base font-medium leading-snug group-hover:text-primary">
            <a [routerLink]="path()" class="stretched">{{ name() }}</a>
          </volt-card-title>
          @if (entry().atoms.length > 0) {
            <volt-badge variant="outline">
              {{ t('gallery.atoms', { count: entry().atoms.length }) }}
            </volt-badge>
          }
        </div>
        @if (summary()) {
          <volt-card-description>{{ summary() }}</volt-card-description>
        }
      </volt-card-header>
    </volt-card>
  `,
  styles: `
    .stretched::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    /* Fades the crop line at the bottom of the thumbnail, so a block taller than the frame
       reads as continuing rather than as cut off. */
    .thumb::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent 62%, var(--background));
    }
  `,
})
export class CatalogCard {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly entry = input.required<CatalogEntry>();
  /** Name the entry's category above its title — for a flat list, where no heading does. */
  readonly showGroup = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly path = computed(() => this.translations.path(this.entry().path));
  protected readonly name = computed(() => this.t(this.entry().nameKey));
  protected readonly group = computed(() => {
    const { groupKey } = this.entry();
    return this.showGroup() && groupKey ? this.t(groupKey) : '';
  });
  protected readonly summary = computed(() => {
    const { summaryKey } = this.entry();
    return summaryKey ? this.t(summaryKey) : '';
  });
}
