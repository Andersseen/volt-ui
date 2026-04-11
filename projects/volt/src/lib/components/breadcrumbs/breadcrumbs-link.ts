import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpBreadcrumbLink } from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumb-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbLink],
  template: `
    <a ngpBreadcrumbLink [href]="href()" class="transition-colors hover:text-foreground">
      <ng-content />
    </a>
  `,
})
export class VoltBreadcrumbLink {
  readonly href = input<string>('#');
}
