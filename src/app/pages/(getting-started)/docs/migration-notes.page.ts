import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Translations } from '../../../i18n/translations';
import { RouterLink } from '@angular/router';
import { Prose } from '../../../components/prose';

@Component({
  selector: 'app-migration-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Prose, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('guide.migrationPage.title') }}</h1>
        <p class="text-lg text-muted-foreground mt-2">
          <app-prose key="guide.migrationPage.lede" />
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Actionable breaking changes -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.migrationPage.actionTitle') }}
        </h2>

        <div class="space-y-3 p-4 rounded-lg border border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted">0.4.0</span>
            <h3 class="font-medium"><app-prose key="guide.migrationPage.buttonTypeTitle" /></h3>
          </div>
          <p class="text-sm text-muted-foreground">
            <app-prose key="guide.migrationPage.buttonTypeBody" />
          </p>
          <div class="p-3 rounded-md bg-muted/30 font-mono text-xs">
            &lt;volt-button type="submit"&gt;Save&lt;/volt-button&gt;
            <span class="text-muted-foreground">&nbsp;&nbsp;// was implicit, now required</span>
          </div>
        </div>

        <div class="space-y-3 p-4 rounded-lg border border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted">0.2.0</span>
            <h3 class="font-medium"><app-prose key="guide.migrationPage.booleanTitle" /></h3>
          </div>
          <p class="text-sm text-muted-foreground">
            <app-prose key="guide.migrationPage.booleanBody" />
          </p>
        </div>
      </div>

      <!-- Additive / non-breaking, but worth knowing about -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.migrationPage.additiveTitle') }}
        </h2>
        <p class="text-muted-foreground">{{ t('guide.migrationPage.additiveLede') }}</p>

        <div class="space-y-3 p-4 rounded-lg border border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted">0.7.0</span>
            <h3 class="font-medium">{{ t('guide.migrationPage.formsTitle') }}</h3>
          </div>
          <p class="text-sm text-muted-foreground">
            <app-prose key="guide.migrationPage.formsBody" />
          </p>
        </div>
      </div>

      <!-- Internal fixes with no consumer action -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ t('guide.migrationPage.internalTitle') }}
        </h2>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li><app-prose key="guide.migrationPage.selectFix" /></li>
          <li><app-prose key="guide.migrationPage.menuFix" /></li>
        </ul>
      </div>

      <div class="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        <app-prose key="guide.migrationPage.footer" />
      </div>
    </div>
  `,
})
export default class MigrationNotesPage {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;
  protected readonly path = this.translations.path;
}
