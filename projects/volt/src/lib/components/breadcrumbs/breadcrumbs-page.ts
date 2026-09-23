import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpBreadcrumbPage } from 'ng-primitives/breadcrumbs';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-breadcrumb-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbPage],
  template: `
    <span ngpBreadcrumbPage [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class VoltBreadcrumbPage {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('font-normal text-foreground', this.class()));

  constructor() {
    forwardClassFromHost();
  }
}
