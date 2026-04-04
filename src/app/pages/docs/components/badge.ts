import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge } from 'volt';
import { CopyButton } from '../../../components/copy-button';
import { BADGE_SNIPPET } from '../../../lib/snippets';

@Component({
  selector: 'app-badge-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, CopyButton],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Badge</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Displays a badge or a component that looks like a badge.
        </p>
      </div>

      <div
        class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div class="relative z-10 flex flex-wrap gap-4 justify-center items-center">
          <volt-badge variant="solid">Solid</volt-badge>
          <volt-badge variant="secondary">Secondary</volt-badge>
          <volt-badge variant="outline">Outline</volt-badge>
          <volt-badge variant="destructive">Destructive</volt-badge>
        </div>
      </div>

      <!-- Source Code Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-lg">Component Source</h3>
          <app-copy-button [code]="badgeCode" />
        </div>
        <div class="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
          <pre class="p-4 text-sm overflow-x-auto"><code class="language-typescript">{{ badgeCode }}</code></pre>
        </div>
        <p class="text-sm text-muted-foreground">
          Copy this code to your project. The component uses 
          <code class="px-1 py-0.5 bg-muted rounded text-xs">class-variance-authority</code>.
        </p>
      </div>
    </div>
  `,
})
export class BadgeDemo {
  readonly badgeCode = BADGE_SNIPPET;
}
