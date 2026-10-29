import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VoltCard } from 'volt';
import { LmnFolderIcon, LmnGridIcon, LmnZapIcon } from 'lumen-icons';
import { injectAppI18n } from '@shared/i18n/i18n';
import { CATALOG_KINDS, entriesOf, listingPath, type CatalogKind } from '../../lib/catalog';

/**
 * The three catalogs side by side, each with one sentence on what it is for.
 *
 * The question a visitor brings is "which of these do I want?", and the three names alone do
 * not answer it: a block, a layout and a recipe can all contain a form. The difference is what
 * you get — a finished section, a bare structure, or behaviour over time — so that is what each
 * card says. The current catalog is marked rather than hidden, so the comparison stays whole.
 */
@Component({
  selector: 'app-catalog-kinds',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, VoltCard, LmnFolderIcon, LmnGridIcon, LmnZapIcon],
  host: { class: 'block' },
  template: `
    <nav [attr.aria-label]="t('recipes.kinds.heading')">
      <h2 class="text-sm font-medium text-muted-foreground">{{ t('recipes.kinds.heading') }}</h2>
      <ul class="mt-3 grid grid-cols-3 gap-2 md:gap-3">
        @for (kind of kinds(); track kind.id) {
          <li>
            <volt-card
              class="kind group relative flex h-full flex-col gap-2 p-3 transition-colors hover:border-primary/50 md:flex-row md:gap-3 md:p-4"
              [attr.data-current]="kind.id === current() ? '' : null"
            >
              <span
                class="badge flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              >
                @switch (kind.id) {
                  @case ('blocks') {
                    <lmn-grid [size]="16" />
                  }
                  @case ('layouts') {
                    <lmn-folder [size]="16" />
                  }
                  @case ('recipes') {
                    <lmn-zap [size]="16" />
                  }
                }
              </span>
              <span class="min-w-0">
                <span
                  class="flex flex-wrap items-center gap-x-2 text-sm font-medium text-foreground md:text-base"
                >
                  <a
                    [routerLink]="kind.path"
                    [attr.aria-current]="kind.id === current() ? 'page' : null"
                    class="stretched focus-visible:outline-none"
                    >{{ kind.title }}</a
                  >
                  <span class="text-xs font-normal tabular-nums text-muted-foreground">
                    {{ kind.count }}
                  </span>
                </span>
                <!-- On a phone the three names fit in a row; the sentences need the room of md. -->
                <span class="mt-1 hidden text-sm leading-6 text-muted-foreground md:block">
                  {{ kind.body }}
                </span>
              </span>
            </volt-card>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    /* The whole card is the link's target, without nesting markup inside an <a>. */
    .stretched::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
    }
    .stretched:focus-visible::after {
      box-shadow: 0 0 0 2px var(--ring);
    }

    .kind[data-current] {
      border-color: color-mix(in oklch, var(--primary) 60%, transparent);
      background: color-mix(in oklch, var(--primary) 6%, var(--card));
    }
    .kind[data-current] .badge {
      background: var(--primary);
      color: var(--primary-foreground);
    }
  `,
})
export class CatalogKinds {
  private readonly translations = injectAppI18n();
  protected readonly t = this.translations.t;

  readonly current = input.required<CatalogKind>();

  protected readonly kinds = computed(() =>
    CATALOG_KINDS.map(id => ({
      id,
      path: this.translations.path(listingPath(id)),
      title: id === 'recipes' ? this.t('recipes.title') : this.t(`gallery.${id}.title`),
      body: this.t(`recipes.kinds.${id}`),
      count: entriesOf(id).length,
    }))
  );
}
