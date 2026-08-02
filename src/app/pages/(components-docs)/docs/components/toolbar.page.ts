import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltToolbar, VoltToggle, VoltButton } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOOLBAR_SNIPPET } from '../../../../lib/snippets';
import { TOOLBAR_USAGE } from '../../../../lib/snippets/usage';
import { TOOLBAR_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-toolbar-demo',
  standalone: true,
  imports: [VoltToolbar, VoltToggle, VoltButton, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Toolbar</h1>
        <p class="text-base text-muted-foreground mt-2">
          Grouped controls with toolbar semantics and roving focus.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-toolbar>
            <volt-toggle>Bold</volt-toggle>
            <volt-toggle>Italic</volt-toggle>
            <volt-button size="sm" variant="outline">Save</volt-button>
          </volt-toolbar>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">API Reference</h3>
        <app-api-reference [data]="toolbarApi" />
      </div>

      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx @voltui/cli add toolbar"
        description="Copy this code to your project. The component uses ng-primitives/toolbar."
      />
    </div>
  `,
})
export default class ToolbarDemo {
  readonly toolbarApi = TOOLBAR_API;
  readonly code = TOOLBAR_SNIPPET;
  readonly usage = TOOLBAR_USAGE;
}
