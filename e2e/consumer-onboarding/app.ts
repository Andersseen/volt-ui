import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsFormRecipe } from './settings-form/settings-form';
import { DataTableRecipe } from './data-table/data-table';
import { AdminDashboardLayout } from './admin-dashboard/admin-dashboard';
import { ContactMap } from './contact-map/contact-map';

/**
 * A disposable consumer app made only of Recipes compositions copied the way the Recipes pages say:
 * each folder next to this file is a composition's files, unchanged except for the distribution
 * transform (scripts/check-consumer.mjs writes them). Package mode imports @voltui/components;
 * CLI-copy mode imports ../ui/<component>, copied by the installed CLI.
 *
 *   settings application   patterns/settings-form   forms, validation, async save, recovery
 *   application shell      layouts/admin-dashboard  sidebar layout and supporting components
 *   data-oriented page     patterns/data-table      sort, filter, pagination, states
 *   marketing block        blocks/contact-map       with its supporting data file
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SettingsFormRecipe, DataTableRecipe, AdminDashboardLayout, ContactMap],
  template: `
    <main class="space-y-16 p-6">
      <section aria-label="Settings application"><app-settings-form-recipe /></section>
      <section aria-label="Data page"><app-data-table-recipe /></section>
      <section aria-label="Application shell" class="h-[640px] overflow-hidden border">
        <app-admin-dashboard-layout />
      </section>
      <section aria-label="Marketing block"><app-contact-map /></section>
    </main>
  `,
})
export class App {}
