import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltButton } from 'volt';

@Component({
  selector: 'app-button-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltButton],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Button</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Displays a button or a component that looks like a button.
        </p>
      </div>

      <div class="border rounded-xl border-border/50 p-6 md:p-10 flex items-center justify-center bg-background/50 relative overflow-hidden">
        <!-- subtle grid background -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div class="relative z-10 flex flex-wrap gap-4 items-center">
          <button volt-button variant="solid">Solid Button</button>

          <button volt-button variant="outline">Outline</button>
          <button volt-button variant="ghost">Ghost</button>
          <button volt-button variant="link">Link</button>
          <button volt-button variant="destructive">Destructive</button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-semibold text-lg">Sizes</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <button volt-button size="sm">Small (sm)</button>
          <button volt-button size="md">Default (md)</button>
          <button volt-button size="lg">Large (lg)</button>
          <button volt-button size="icon" aria-label="Icon">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ButtonDemo {}
