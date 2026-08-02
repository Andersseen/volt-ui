import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltBreadcrumbs,
  VoltBreadcrumbList,
  VoltBreadcrumbItem,
  VoltBreadcrumbLink,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
} from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { BREADCRUMBS_SNIPPET } from '../../../../lib/snippets';
import { BREADCRUMBS_USAGE } from '../../../../lib/snippets/usage';
import { BREADCRUMBS_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-breadcrumbs-demo',
  standalone: true,
  imports: [
    VoltBreadcrumbs,
    VoltBreadcrumbList,
    VoltBreadcrumbItem,
    VoltBreadcrumbLink,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    CodePanel,
    ApiReference,
  ],
  templateUrl: './breadcrumbs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbsDemo {
  readonly breadcrumbsApi = BREADCRUMBS_API;
  readonly breadcrumbsCode = BREADCRUMBS_SNIPPET;
  readonly breadcrumbsUsage = BREADCRUMBS_USAGE;
}
