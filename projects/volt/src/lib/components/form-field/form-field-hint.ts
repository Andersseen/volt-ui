import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpDescription } from 'ng-primitives/form-field';

@Component({
  selector: 'volt-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpDescription],
  template: `
    <span ngpDescription class="text-sm text-muted-foreground">
      <ng-content />
    </span>
  `,
})
export class VoltHint {}
