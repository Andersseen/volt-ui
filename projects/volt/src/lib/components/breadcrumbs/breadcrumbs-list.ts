import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpBreadcrumbList } from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumb-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbList],
  template: `
    <ol
      ngpBreadcrumbList
      class="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5"
    >
      <ng-content />
    </ol>
  `,
})
export class VoltBreadcrumbList {}
