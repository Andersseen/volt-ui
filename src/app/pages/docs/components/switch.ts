import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltSwitch, VoltLabel } from 'volt';

@Component({
  selector: 'app-switch-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSwitch, VoltLabel],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Switch</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A control that allows the user to toggle between checked and not checked.
        </p>
      </div>

      <div class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]">
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div class="relative z-10 flex items-center space-x-3 bg-background p-6 rounded-lg shadow-sm border border-border/50">
          <button volt-switch id="airplane-mode"></button>
          <label volt-label for="airplane-mode" class="cursor-pointer">Airplane Mode</label>
        </div>
      </div>
    </div>
  `
})
export class SwitchDemo {}
