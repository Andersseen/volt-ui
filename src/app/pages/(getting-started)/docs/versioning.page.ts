import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { RouterLink } from '@angular/router';
import { Prose } from '../../../components/prose';

@Component({
  selector: 'app-versioning-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.versioningPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">
          <app-prose key="guide.versioningPage.lede" />
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Semver promise -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.versioningPage.semverTitle') }}
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium"><app-prose key="guide.versioningPage.majorLabel" /></h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.versioningPage.majorBody') }}
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium"><app-prose key="guide.versioningPage.minorLabel" /></h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.versioningPage.minorBody') }}
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium"><app-prose key="guide.versioningPage.patchLabel" /></h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.versioningPage.patchBody') }}
            </p>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('guide.versioningPage.frozenSurface') }}</p>
      </div>

      <!-- Status labels -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.versioningPage.labelsTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.versioningPage.labelsLede" /></p>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-success">{{ t('guide.versioningPage.stableTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.versioningPage.stableBody') }}
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-info">{{ t('guide.versioningPage.betaTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.versioningPage.betaBody') }}
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-warning">{{ t('guide.versioningPage.expTitle') }}</h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('guide.versioningPage.expBody') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Angular support policy -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.versioningPage.angularTitle') }}
        </h2>
        <p class="text-muted-foreground"><app-prose key="guide.versioningPage.angularLede" /></p>
        <p class="text-muted-foreground">{{ t('guide.versioningPage.angularNote') }}</p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        <app-prose key="guide.versioningPage.seeAlso" />
      </div>
    </div>
  `,
})
export default class VersioningPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
}
