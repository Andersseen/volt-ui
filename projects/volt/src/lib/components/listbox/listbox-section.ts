import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpListboxSection } from 'ng-primitives/listbox';

@Component({
  selector: 'volt-listbox-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpListboxSection],
  host: {
    class: 'grid gap-1',
  },
  template: `<ng-content />`,
})
export class VoltListboxSection {}
