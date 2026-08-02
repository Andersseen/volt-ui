import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltToggleGroup, VoltToggleGroupItem } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { TOGGLE_GROUP_SNIPPET } from '../../../../lib/snippets';
import { TOGGLE_GROUP_USAGE } from '../../../../lib/snippets/usage';
import { TOGGLE_GROUP_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-toggle-group-demo',
  standalone: true,
  imports: [VoltToggleGroup, VoltToggleGroupItem, CodePanel, ApiReference],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Toggle Group</h1>
        <p class="text-base text-muted-foreground mt-2">
          A grouped set of toggles for single or multiple selection.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-toggle-group [(value)]="value">
            <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
            <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
            <volt-toggle-group-item value="code">Code</volt-toggle-group-item>
          </volt-toggle-group>
        </div>
      </app-code-panel>
      <!-- API Reference -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">API Reference</h3>
        <app-api-reference [data]="toggleGroupApi" />
      </div>

      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx @voltui/cli add toggle-group"
        description="Copy this code to your project. The component uses ng-primitives/toggle-group."
      />
    </div>
  `,
})
export default class ToggleGroupDemo {
  readonly toggleGroupApi = TOGGLE_GROUP_API;
  readonly code = TOGGLE_GROUP_SNIPPET;
  readonly usage = TOGGLE_GROUP_USAGE;
  readonly value = signal(['bold']);
}
