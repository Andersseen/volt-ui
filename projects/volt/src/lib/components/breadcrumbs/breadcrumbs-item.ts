import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpBreadcrumbItem } from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumb-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbItem],
  template: `
    <li ngpBreadcrumbItem class="inline-flex items-center gap-1.5">
      <ng-content />
    </li>
  `,
})
export class VoltBreadcrumbItem {}
