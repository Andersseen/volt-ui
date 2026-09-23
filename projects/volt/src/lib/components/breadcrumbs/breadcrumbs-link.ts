import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { NgpBreadcrumbLink } from 'ng-primitives/breadcrumbs';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-breadcrumb-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbLink],
  template: `
    <a ngpBreadcrumbLink [href]="href()" [class]="classes()">
      <ng-content />
    </a>
  `,
})
export class VoltBreadcrumbLink {
  readonly href = input<string>('#');
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('transition-colors hover:text-foreground', this.class())
  );

  constructor() {
    forwardClassFromHost();
  }
}
