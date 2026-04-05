import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltSeparator } from 'volt';
import { CodePanel } from '../../../components/code-panel';
import { SEPARATOR_SNIPPET } from '../../../lib/snippets';

@Component({
  selector: 'app-separator-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSeparator, CodePanel],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Separator</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Visually or semantically separates content.
        </p>
      </div>

      <div
        class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div
          class="relative z-10 w-full max-w-md bg-background p-6 rounded-lg shadow-sm border border-border/50"
        >
          <div class="space-y-1">
            <h4 class="text-sm font-medium leading-none">Volt UI Core</h4>
            <p class="text-sm text-muted-foreground">An open-source UI component library.</p>
          </div>
          <volt-separator class="my-4"></volt-separator>
          <div class="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <volt-separator orientation="vertical"></volt-separator>
            <div>Docs</div>
            <volt-separator orientation="vertical"></volt-separator>
            <div>Source</div>
          </div>
        </div>
      </div>

      <!-- Source Code Section -->
      <app-code-panel
        title="Component Source"
        [code]="separatorCode"
        cliCommand="npx github:Andersseen/volt-ui add separator"
        description="Copy this code to your project. The component uses ng-primitives/separator."
      />
    </div>
  `,
})
export default class SeparatorDemo {
  readonly separatorCode = SEPARATOR_SNIPPET;
}
