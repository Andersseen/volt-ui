import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpBreadcrumbItem } from 'ng-primitives/breadcrumbs';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-breadcrumb-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbItem],
  template: `
    <li ngpBreadcrumbItem [class]="classes()">
      <ng-content />
    </li>
  `,
})
export class VoltBreadcrumbItem {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('inline-flex items-center gap-1.5', this.class()));

  constructor() {
    forwardClassFromHost();
  }
}
