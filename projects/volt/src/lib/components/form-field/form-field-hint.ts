import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpDescription } from 'ng-primitives/form-field';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/** Field description, referenced by the control's `aria-describedby`. `class` styles the text. */
@Component({
  selector: 'volt-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpDescription],
  template: `
    <span ngpDescription [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class VoltHint {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-sm text-muted-foreground', this.class()));

  constructor() {
    forwardClassFromHost();
  }
}
