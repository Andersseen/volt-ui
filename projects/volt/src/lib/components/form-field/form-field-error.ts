import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpError } from 'ng-primitives/form-field';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

/** Validation message, announced assertively. `class` styles the text. */
@Component({
  selector: 'volt-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpError],
  template: `
    <span ngpError role="alert" aria-live="assertive" [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class VoltError {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('text-error text-sm font-medium', this.class()));

  constructor() {
    forwardClassFromHost();
  }
}
