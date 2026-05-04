import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltNavSidebar } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { NAV_SIDEBAR_SNIPPET } from '../../../../lib/snippets';
import { NAV_SIDEBAR_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-nav-sidebar-demo',
  standalone: true,
  imports: [VoltNavSidebar, CodePanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Nav Sidebar</h1>
        <p class="text-base text-muted-foreground mt-2">
          A responsive documentation or app navigation sidebar shell.
        </p>
      </div>
      <div class="w-full h-px bg-border"></div>
      <app-code-panel title="Usage" [code]="usage" [tabbed]="true">
        <div class="p-8 border border-border rounded-lg bg-card/30 min-h-[300px]">
          <volt-nav-sidebar title="Settings" description="Workspace controls">
            <a class="block py-1 text-sm text-foreground" href="/docs/components/nav-sidebar"
              >Profile</a
            >
            <a class="block py-1 text-sm text-muted-foreground" href="/docs/components/nav-sidebar"
              >Billing</a
            >
            <a class="block py-1 text-sm text-muted-foreground" href="/docs/components/nav-sidebar"
              >Team</a
            >
          </volt-nav-sidebar>
        </div>
      </app-code-panel>
      <app-code-panel
        title="Component Source"
        [code]="code"
        cliCommand="npx github:Andersseen/volt-ui add nav-sidebar"
        description="Copy this code to your project."
      />
    </div>
  `,
})
export default class NavSidebarDemo {
  readonly code = NAV_SIDEBAR_SNIPPET;
  readonly usage = NAV_SIDEBAR_USAGE;
}
