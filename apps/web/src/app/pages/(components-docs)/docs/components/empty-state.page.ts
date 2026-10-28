import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltNativeButton,
} from 'volt';
import { CodePanel } from '@shared/components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { EMPTY_STATE_SNIPPET } from '../../../../lib/snippets/index';
import { EMPTY_STATE_USAGE } from '../../../../lib/snippets/usage';
import { EMPTY_STATE_API } from '../../../../lib/api-reference.generated';
import { injectAppI18n } from '@shared/i18n/i18n';

// The heading is the component name, which is identical in every locale. Switch it to
// t('components.emptyState.title') and add a description once those keys exist in Glossa —
// see specs/plans/v1.2.md "Glossa keys pending".
@Component({
  selector: 'app-empty-state-demo',
  standalone: true,
  imports: [
    VoltEmptyState,
    VoltEmptyStateTitle,
    VoltEmptyStateDescription,
    VoltNativeButton,
    CodePanel,
    ApiReference,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Empty State</h1>

      <app-code-panel [title]="t('ui.codePanel.usage')" [code]="usage" [tabbed]="true">
        <div class="grid gap-4 p-6 md:p-10 border border-border/50 rounded-xl bg-background/50">
          <volt-empty-state>
            <svg
              slot="icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            </svg>
            <volt-empty-state-title>No projects yet</volt-empty-state-title>
            <volt-empty-state-description
              >Create your first project to get started.</volt-empty-state-description
            >
            <div slot="actions">
              <button voltButton type="button">Create project</button>
            </div>
          </volt-empty-state>

          <volt-empty-state>
            <volt-empty-state-title>No matches for “invoices”</volt-empty-state-title>
            <div slot="actions">
              <button voltButton variant="outline" type="button">Clear search</button>
            </div>
          </volt-empty-state>
        </div>
      </app-code-panel>

      <div class="space-y-3">
        <h2 class="text-lg font-semibold">{{ t('ui.api.title') }}</h2>
        <app-api-reference [data]="api" />
      </div>

      <app-code-panel
        [code]="code"
        cliCommand="npx @voltui/cli add empty-state"
        [description]="t('ui.codePanel.copyNoteDep', { dep: 'class-variance-authority' })"
      />
    </div>
  `,
})
export default class EmptyStateDemo {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly api = EMPTY_STATE_API;
  readonly code = EMPTY_STATE_SNIPPET;
  readonly usage = EMPTY_STATE_USAGE;
}
