import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'volt-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSwitch, NgpSwitchThumb],
  template: `
    <button
      ngpSwitch
      [ngpSwitchChecked]="checked()"
      [ngpSwitchDisabled]="disabled()"
      (ngpSwitchCheckedChange)="checked.set($event)"
      class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 bg-muted-foreground/20 data-[checked]:bg-primary"
    >
      <span
        ngpSwitchThumb
        class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-0 data-[checked]:translate-x-4"
      ></span>
    </button>
  `,
})
export class VoltSwitch {
  readonly checked = model(false);
  readonly disabled = input(false);
}
