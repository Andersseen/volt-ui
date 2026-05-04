import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltToggleGroup, VoltToggleGroupItem } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { TOGGLE_GROUP_SNIPPET } from '../../../../lib/snippets';
import { TOGGLE_GROUP_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-toggle-group-demo',
  standalone: true,
  imports: [VoltToggleGroup, VoltToggleGroupItem, CodePanel],
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
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add toggle-group"
        description="Copy this code to your project. The component uses ng-primitives/toggle-group."
      />
    </div>
  `,
})
export default class ToggleGroupDemo {
  readonly code = TOGGLE_GROUP_SNIPPET;
  readonly usage = TOGGLE_GROUP_USAGE;
  readonly value = signal(['bold']);
}
