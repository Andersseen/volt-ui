import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltPagination,
  VoltPaginationPrevious,
  VoltPaginationButton,
  VoltPaginationNext,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { PAGINATION_SNIPPET } from '../../../../lib/snippets';
import { PAGINATION_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-pagination-demo',
  standalone: true,
  imports: [
    VoltPagination,
    VoltPaginationPrevious,
    VoltPaginationButton,
    VoltPaginationNext,
    CodePanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Pagination</h1>
        <p class="text-base text-muted-foreground mt-2">
          Pagination controls with previous, next, and page buttons.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
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
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add pagination"
        description="Copy this code to your project. The component uses ng-primitives/pagination."
      />
    </div>
  `,
})
export default class PaginationDemo {
  readonly code = PAGINATION_SNIPPET;
  readonly usage = PAGINATION_USAGE;
  readonly page = signal(2);
}
