import { ChangeDetectionStrategy, Component, input, output, model } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'volt-switch',
  imports: [NgpSwitch, NgpSwitchThumb],
  template: `
    <button
      ngpSwitch
      [ngpSwitchChecked]="checked()"
      [ngpSwitchDisabled]="disabled()"
      (ngpSwitchCheckedChange)="checked.set($event); checkedChange.emit($event)"
      class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:bg-primary data-[checked=false]:bg-muted-foreground/20"
    >
      <span
        ngpSwitchThumb
        class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[checked=true]:translate-x-4 data-[checked=false]:translate-x-0"
      ></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoltSwitch {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();
}
