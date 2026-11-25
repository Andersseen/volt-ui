import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { RouterLink } from '@angular/router';
import { Prose } from '@shared/components/prose';

/*
 * Keys, not prose. The sequence is the point of this page, so the item that says why it
 * is next has to say it in the reader's language too.
 */
interface RoadmapItem {
  order: number;
  titleKey: PlainTranslationKey;
  scope: 'Library' | 'Docs site';
  status: 'Next' | 'Planned' | 'Exploring';
  summaryKey: PlainTranslationKey;
  detailKeys: readonly PlainTranslationKey[];
}

@Component({
  selector: 'app-roadmap-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.roadmapPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2"><app-prose key="guide.roadmapPage.lede" /></p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- How to read this -->
      <div class="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
        <h2 class="font-medium">{{ t('guide.roadmapPage.howToTitle') }}</h2>
        <p class="text-sm text-muted-foreground"><app-prose key="guide.roadmapPage.howToBody" /></p>
        <p class="text-sm text-muted-foreground">{{ t('guide.roadmapPage.semverNote') }}</p>
      </div>

      <!-- Ordered items. An <ol> because the sequence is the commitment, so it has to
           reach screen readers too — the numbered badge alone is decoration. -->
      <ol class="space-y-4">
        @for (item of items; track item.order) {
          <li class="p-5 rounded-lg border border-border bg-muted/30 space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                aria-hidden="true"
              >
                {{ item.order }}
              </span>
              <h2 class="text-xl font-semibold tracking-tight">{{ t(item.titleKey) }}</h2>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium leading-none"
                [class]="statusClass(item.status)"
              >
                <span class="sr-only">{{ t('guide.roadmapPage.statusLabel') }}</span>
                {{ statusLabel(item.status) }}
              </span>
              <span
                class="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium leading-none text-muted-foreground"
              >
                <span class="sr-only">{{ t('guide.roadmapPage.scopeLabel') }}</span>
                {{ scopeLabel(item.scope) }}
              </span>
            </div>

            <p class="text-muted-foreground">{{ t(item.summaryKey) }}</p>

            <ul class="space-y-1.5 border-l border-border/50 ml-1 pl-4">
              @for (detailKey of item.detailKeys; track detailKey) {
                <li class="text-sm text-muted-foreground"><app-prose [key]="detailKey" /></li>
              }
            </ul>
          </li>
        }
      </ol>

      <!-- Why this order -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.roadmapPage.v2.whyTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.roadmapPage.v2.whyBody') }}</p>
        <p class="text-muted-foreground">{{ t('guide.roadmapPage.v2.whyOrder') }}</p>
      </div>

      <!-- Earlier items, deferred: said here rather than quietly dropped -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.roadmapPage.v2.deferredTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.roadmapPage.v2.deferredBody') }}</p>
      </div>

      <!-- What is not changing -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.roadmapPage.notChangingTitle') }}
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">{{ t('guide.roadmapPage.copyInTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.roadmapPage.copyInBody') }}
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">{{ t('guide.roadmapPage.apiTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ t('guide.roadmapPage.apiBody') }}</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">{{ t('guide.roadmapPage.themingTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.roadmapPage.v2.themingBody') }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        {{ t('guide.roadmapPage.feedback') }}
      </div>
    </div>
  `,
})
export default class RoadmapPage {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;

  // The post-1.0 sequence of specs/v2 (plans 01–05). The headless layer and the Tailwind-free
  // distribution of the 1.0 roadmap are deferred (specs/v2/SDD.md D01, D02) and said so below.
  readonly items: RoadmapItem[] = [
    {
      order: 1,
      titleKey: 'guide.roadmapPage.v2.items.trust.title',
      scope: 'Library',
      status: 'Next',
      summaryKey: 'guide.roadmapPage.v2.items.trust.summary',
      detailKeys: [
        'guide.roadmapPage.v2.items.trust.details.d1',
        'guide.roadmapPage.v2.items.trust.details.d2',
        'guide.roadmapPage.v2.items.trust.details.d3',
      ],
    },
    {
      order: 2,
      titleKey: 'guide.roadmapPage.v2.items.composition.title',
      scope: 'Library',
      status: 'Planned',
      summaryKey: 'guide.roadmapPage.v2.items.composition.summary',
      detailKeys: [
        'guide.roadmapPage.v2.items.composition.details.d1',
        'guide.roadmapPage.v2.items.composition.details.d2',
        'guide.roadmapPage.v2.items.composition.details.d3',
      ],
    },
    {
      order: 3,
      titleKey: 'guide.roadmapPage.v2.items.updates.title',
      scope: 'Library',
      status: 'Planned',
      summaryKey: 'guide.roadmapPage.v2.items.updates.summary',
      detailKeys: [
        'guide.roadmapPage.v2.items.updates.details.d1',
        'guide.roadmapPage.v2.items.updates.details.d2',
        'guide.roadmapPage.v2.items.updates.details.d3',
      ],
    },
  ];

  protected statusLabel(status: RoadmapItem['status']): string {
    return this.t(
      `guide.roadmapPage.statuses.${status.toLowerCase() as Lowercase<RoadmapItem['status']>}`
    );
  }

  protected scopeLabel(scope: RoadmapItem['scope']): string {
    return this.t(
      scope === 'Library' ? 'guide.roadmapPage.scopes.library' : 'guide.roadmapPage.scopes.docs'
    );
  }

  protected statusClass(status: RoadmapItem['status']): string {
    switch (status) {
      case 'Next':
        return 'bg-success/15 text-success';
      case 'Planned':
        return 'bg-info/15 text-info';
      case 'Exploring':
        return 'bg-warning/20 text-warning';
    }
  }
}
