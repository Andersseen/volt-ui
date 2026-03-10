import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge } from 'volt';

@Component({
  selector: 'app-badge-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Badge</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Displays a badge or a component that looks like a badge.
        </p>
      </div>

      <div class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]">
        <!-- subtle grid background -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div class="relative z-10 flex flex-wrap gap-4 justify-center items-center">
          <volt-badge variant="solid">Solid</volt-badge>
          <volt-badge variant="secondary">Secondary</volt-badge>
          <volt-badge variant="outline">Outline</volt-badge>
          <volt-badge variant="destructive">Destructive</volt-badge>
        </div>
      </div>
    </div>
  `
})
export class BadgeDemo {}
