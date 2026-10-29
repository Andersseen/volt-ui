import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  VoltButton,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltInput,
  VoltSearch,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';
import { LmnSearchIcon } from 'lumen-icons';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { entriesOf, groupsOf, type CatalogEntry, type CatalogKind } from '../../lib/catalog';
import { CatalogCard } from '../catalog-card';
import { CatalogKinds } from './catalog-kinds';
import {
  EMPTY_QUERY,
  isFiltered,
  readQuery,
  selectEntries,
  toParams,
  type CatalogQuery,
  type CatalogSort,
} from './catalog-query';

/**
 * One catalog listing — blocks, layouts or recipes — that stays usable however long it grows.
 *
 * A single long scroll stops working once a catalog has more than a handful of entries: the
 * visitor arrives with a need ("a pricing table", "something with a switch") and should get to
 * it without reading every card. So the listing answers three questions in order — which
 * catalog do I want, what kind of thing, which one — with the kinds explainer, the category
 * chips and a search that also matches the Volt atoms an entry is built from.
 *
 * The query lives in the URL, not in component state: a filtered view can be shared, survives
 * a reload, works with the back button and is rendered by the server exactly as the browser will
 * show it. This component only reads the URL and writes it back.
 *
 * With no search and the catalog order, entries stay grouped under their category headings —
 * the overview. Any search, a category or the A–Z sort flattens them into one result grid.
 */
@Component({
  selector: 'app-catalog-browser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CatalogCard,
    CatalogKinds,
    LmnSearchIcon,
    VoltButton,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltInput,
    VoltSearch,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  host: { class: 'block' },
  template: `
    <div class="space-y-10">
      <header class="max-w-3xl">
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{{ t(titleKey()) }}</h1>
        <p class="mt-4 text-lg leading-8 text-muted-foreground">{{ t(ledeKey()) }}</p>
      </header>

      <app-catalog-kinds [current]="kind()" />

      <div class="space-y-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <volt-search class="relative flex-1">
            <lmn-search
              [size]="16"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <volt-input
              type="search"
              class="h-11 pl-9"
              [value]="query().text"
              (valueChange)="update({ text: $event })"
              [placeholder]="t('recipes.browser.searchPlaceholder')"
              [aria-label]="t('recipes.browser.searchLabel')"
            />
          </volt-search>

          @if (groups().length) {
            <volt-toggle-group
              type="single"
              [allowDeselection]="false"
              [value]="[query().sort]"
              (valueChange)="sortBy($event)"
              [attr.aria-label]="t('recipes.browser.sortLabel')"
              class="self-start lg:self-auto"
            >
              <volt-toggle-group-item value="category" size="sm">
                {{ t('recipes.browser.sortCategory') }}
              </volt-toggle-group-item>
              <volt-toggle-group-item value="name" size="sm">
                {{ t('recipes.browser.sortName') }}
              </volt-toggle-group-item>
            </volt-toggle-group>
          }
        </div>

        @if (groups().length) {
          <volt-toggle-group
            type="single"
            [allowDeselection]="false"
            [value]="[query().group || 'all']"
            (valueChange)="filterBy($event)"
            [attr.aria-label]="t('recipes.browser.categories')"
            class="chips -mx-4 flex justify-start gap-1.5 overflow-x-auto border-0 bg-transparent px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            <volt-toggle-group-item value="all" size="sm" class="chip">
              {{ t('recipes.browser.all') }}
              <span class="count">{{ entries().length }}</span>
            </volt-toggle-group-item>
            @for (group of groups(); track group.id) {
              <volt-toggle-group-item [value]="group.id" size="sm" class="chip">
                {{ t(group.labelKey) }}
                <span class="count">{{ counts()[group.id] }}</span>
              </volt-toggle-group-item>
            }
          </volt-toggle-group>
        }

        <div class="flex min-h-9 items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground" aria-live="polite">
            {{
              t('recipes.browser.showing', {
                shown: results().length,
                total: entries().length,
              })
            }}
          </p>
          @if (filtered()) {
            <volt-button variant="ghost" size="sm" (click)="clear()">
              {{ t('recipes.browser.clear') }}
            </volt-button>
          }
        </div>
      </div>

      @if (results().length === 0) {
        <volt-empty-state class="rounded-xl border border-dashed border-border py-16">
          <volt-empty-state-title>{{ t('recipes.browser.emptyTitle') }}</volt-empty-state-title>
          <volt-empty-state-description>
            {{ t('recipes.browser.emptyBody') }}
          </volt-empty-state-description>
          <volt-button variant="outline" size="sm" class="mt-4" (click)="clear()">
            {{ t('recipes.browser.clear') }}
          </volt-button>
        </volt-empty-state>
      } @else if (sections()) {
        @for (section of sections()!; track section.id) {
          <section class="space-y-5" [attr.aria-labelledby]="'group-' + section.id">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-3">
              <h2 [id]="'group-' + section.id" class="text-xl font-semibold tracking-tight">
                {{ t(section.labelKey) }}
              </h2>
              <span class="text-sm tabular-nums text-muted-foreground">
                {{ section.entries.length }}
              </span>
            </div>
            <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              @for (entry of section.entries; track entry.id) {
                <app-catalog-card [entry]="entry" />
              }
            </div>
          </section>
        }
      } @else {
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (entry of results(); track entry.id) {
            <app-catalog-card [entry]="entry" [showGroup]="true" />
          }
        </div>
      }

      <ng-content />
    </div>
  `,
  styles: `
    /* Chips rather than a segmented bar: categories wrap onto as many lines as they need. */
    .chips .chip {
      flex-shrink: 0;
      border: 1px solid var(--border);
      border-radius: 9999px;
      padding-inline: 0.85rem;
    }
    .chips .chip[data-selected] {
      border-color: var(--primary);
    }
    .count {
      margin-left: 0.4rem;
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      opacity: 0.65;
    }
  `,
})
export class CatalogBrowser {
  private readonly translations = injectAppI18n();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly t = this.translations.t;

  readonly kind = input.required<CatalogKind>();
  readonly titleKey = input.required<PlainTranslationKey>();
  readonly ledeKey = input.required<PlainTranslationKey>();

  protected readonly entries = computed(() => entriesOf(this.kind()));
  protected readonly groups = computed(() => groupsOf(this.kind()));

  private readonly params = toSignal(this.route.queryParamMap);

  protected readonly query = computed((): CatalogQuery => {
    const params = this.params();
    return params ? readQuery(params, this.groups()) : EMPTY_QUERY;
  });
  protected readonly filtered = computed(() => isFiltered(this.query()));

  protected readonly results = computed(() =>
    selectEntries(this.entries(), this.query(), entry => this.describe(entry))
  );

  protected readonly counts = computed(() => {
    const counts: Record<string, number> = {};
    for (const entry of this.entries()) {
      if (entry.groupId) counts[entry.groupId] = (counts[entry.groupId] ?? 0) + 1;
    }
    return counts;
  });

  /** The grouped overview, or `null` when the results should be one flat grid. */
  protected readonly sections = computed(() => {
    const query = this.query();
    if (this.filtered() || query.sort !== 'category' || this.groups().length === 0) return null;
    return this.groups().map(group => ({
      ...group,
      entries: this.results().filter(entry => entry.groupId === group.id),
    }));
  });

  protected update(change: Partial<CatalogQuery>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toParams({ ...this.query(), ...change }),
      // Typing should not leave one history entry per keystroke.
      replaceUrl: change.text !== undefined,
    });
  }

  protected filterBy(value: readonly string[]): void {
    const group = value[0];
    if (group) this.update({ group: group === 'all' ? '' : group });
  }

  protected sortBy(value: readonly string[]): void {
    const sort = value[0] as CatalogSort | undefined;
    if (sort) this.update({ sort });
  }

  protected clear(): void {
    this.update({ text: '', group: '' });
  }

  private describe(entry: CatalogEntry) {
    return {
      name: this.t(entry.nameKey),
      summary: entry.summaryKey ? this.t(entry.summaryKey) : '',
      group: entry.groupKey ? this.t(entry.groupKey) : '',
    };
  }
}
