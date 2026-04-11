import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpBreadcrumbPage } from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumb-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbPage],
  template: `
    <span ngpBreadcrumbPage class="font-normal text-foreground">
      <ng-content />
    </span>
  `,
})
export class VoltBreadcrumbPage {}
