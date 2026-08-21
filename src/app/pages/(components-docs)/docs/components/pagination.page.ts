import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  VoltPagination,
  VoltPaginationPrevious,
  VoltPaginationButton,
  VoltPaginationNext,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { PAGINATION_SNIPPET } from '../../../../lib/snippets';
import { PAGINATION_USAGE } from '../../../../lib/snippets/usage';
import { PAGINATION_API } from '../../../../lib/api-reference.generated';
import { Translations } from '../../../../i18n/translations';

@Component({
  selector: 'app-pagination-demo',
  standalone: true,
  imports: [
    VoltPagination,
    VoltPaginationPrevious,
    VoltPaginationButton,
    VoltPaginationNext,
    CodePanel,
    ApiReference,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          {{ t('components.pagination.title') }}
        </h1>
        <p class="text-base text-muted-foreground mt-2">
          {{ t('components.pagination.description') }}
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-pagination [(page)]="page" [pageCount]="5">
            <volt-pagination-previous />
            <volt-pagination-button [page]="1" />
            <volt-pagination-button [page]="2" />
            <volt-pagination-button [page]="3" />
            <volt-pagination-next />
          </volt-pagination>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{{ t('ui.api.title') }}</h3>
        <app-api-reference [data]="paginationApi" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add pagination"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'ng-primitives/pagination' })"
      />
    </div>
  `,
})
export default class PaginationDemo {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly paginationApi = PAGINATION_API;
  readonly code = PAGINATION_SNIPPET;
  readonly usage = PAGINATION_USAGE;
  readonly page = signal(2);
}
