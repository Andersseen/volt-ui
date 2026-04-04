import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltCheckbox, VoltLabel } from 'volt';
import { CopyButton } from '../../../components/copy-button';
import { CHECKBOX_SNIPPET } from '../../../lib/snippets';

@Component({
  selector: 'app-checkbox-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCheckbox, VoltLabel, CopyButton],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Checkbox</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A control that allows the user to toggle between checked and not checked.
        </p>
      </div>

      <div
        class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div
          class="relative z-10 flex items-center space-x-3 bg-background p-6 rounded-lg shadow-sm border border-border/50"
        >
          <volt-checkbox id="terms"></volt-checkbox>
          <div class="grid gap-1.5 leading-none">
            <volt-label
              htmlFor="terms"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center cursor-pointer"
            >
              Accept terms and conditions
            </volt-label>
            <p class="text-sm text-muted-foreground">
              You agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <!-- Source Code Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-lg">Component Source</h3>
          <app-copy-button [code]="checkboxCode" />
        </div>
        <div class="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
          <pre class="p-4 text-sm overflow-x-auto"><code class="language-typescript">{{ checkboxCode }}</code></pre>
        </div>
        <p class="text-sm text-muted-foreground">
          Copy this code to your project. The component uses 
          <code class="px-1 py-0.5 bg-muted rounded text-xs">ng-primitives/checkbox</code>.
        </p>
      </div>
    </div>
  `,
})
export class CheckboxDemo {
  readonly checkboxCode = CHECKBOX_SNIPPET;
}
