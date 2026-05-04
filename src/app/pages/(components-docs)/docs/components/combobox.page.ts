import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltCombobox } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { COMBOBOX_SNIPPET } from '../../../../lib/snippets';
import { COMBOBOX_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-combobox-demo',
  standalone: true,
  imports: [VoltCombobox, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Combobox</h1>
        <p class="text-base text-muted-foreground mt-2">
          Searchable select input with a custom option template.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 flex justify-center">
          <div class="w-full max-w-xs">
            <volt-combobox
              [(value)]="framework"
              [items]="frameworks"
              placeholder="Select framework"
            >
              <ng-template let-item>{{ item }}</ng-template>
            </volt-combobox>
          </div>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add combobox"
        description="Copy this code to your project. The component uses ng-primitives/combobox."
      />
    </div>
  `,
})
export default class ComboboxDemo {
  readonly code = COMBOBOX_SNIPPET;
  readonly usage = COMBOBOX_USAGE;
  readonly framework = signal('');
  readonly frameworks = ['Angular', 'React', 'Vue', 'Svelte'];
}
