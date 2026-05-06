import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { LISTBOX_SNIPPET } from '../../../../lib/snippets';
import { LISTBOX_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-listbox-demo',
  standalone: true,
  imports: [VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Listbox</h1>
        <p class="text-base text-muted-foreground mt-2">
          Accessible single or multiple selection list.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center"
        >
          <volt-listbox [(value)]="selected">
            <volt-listbox-section>
              <volt-listbox-header>Frameworks</volt-listbox-header>
              <volt-listbox-option value="angular">Angular</volt-listbox-option>
              <volt-listbox-option value="react">React</volt-listbox-option>
              <volt-listbox-option value="vue">Vue</volt-listbox-option>
            </volt-listbox-section>
          </volt-listbox>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add listbox"
        description="Copy this code to your project. The component uses ng-primitives/listbox."
      />
    </div>
  `,
})
export default class ListboxDemo {
  readonly code = LISTBOX_SNIPPET;
  readonly usage = LISTBOX_USAGE;
  readonly selected = signal(['angular']);
}
