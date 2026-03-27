import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { NgpTabset } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTabset],
  template: `
    <div
      ngpTabset
      [ngpTabsetValue]="value()"
      [ngpTabsetOrientation]="orientation()"
      [ngpTabsetActivateOnFocus]="activateOnFocus()"
      (ngpTabsetValueChange)="onValueChange($event)"
      class="w-full block"
    >
      <ng-content />
    </div>
  `,
})
export class VoltTabs {
  readonly value = model<string | undefined>(undefined);
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly activateOnFocus = input<boolean>(true);
  readonly valueChange = output<string | undefined>();

  protected onValueChange(event: string | undefined): void {
    this.value.set(event);
    this.valueChange.emit(event);
  }
}
