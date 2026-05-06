import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodePanel } from '../../../../components/code-panel';
import { SEARCH_SNIPPET } from '../../../../lib/snippets';
import { VoltInput, VoltSearch, VoltSearchClear } from 'volt';

@Component({
  selector: 'app-search-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodePanel, VoltInput, VoltSearch, VoltSearchClear],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Search</h1>
        <p class="mt-2 text-muted-foreground">
          Search field wrapper with a clear action powered by ng-primitives.
        </p>
      </div>

      <app-code-panel title="Usage" [code]="usageCode" [tabbed]="true">
        <volt-search class="flex max-w-md items-center gap-2">
          <volt-input type="search" placeholder="Search components..." class="flex-1" />
          <volt-search-clear>Clear</volt-search-clear>
        </volt-search>
      </app-code-panel>

      <app-code-panel
        title="Component Source"
        [code]="sourceCode"
        cliCommand="npx github:Andersseen/volt-ui add search"
      />
    </div>
  `,
})
export default class SearchPage {
  readonly sourceCode = SEARCH_SNIPPET;
  readonly usageCode = `import { Component } from '@angular/core';
import { VoltInput, VoltSearch, VoltSearchClear } from 'volt';

@Component({
  imports: [VoltInput, VoltSearch, VoltSearchClear],
  template: \`
    <volt-search class="flex items-center gap-2">
      <volt-input type="search" placeholder="Search..." />
      <volt-search-clear>Clear</volt-search-clear>
    </volt-search>
  \`,
})
export class MyComponent {}`;
}
