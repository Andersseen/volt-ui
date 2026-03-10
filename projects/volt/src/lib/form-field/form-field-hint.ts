import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDescription } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-hint',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpDescription],
  host: {
    class: 'text-sm text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltHint {}
