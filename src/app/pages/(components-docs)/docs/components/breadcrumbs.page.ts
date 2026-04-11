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
import { BREADCRUMBS_SNIPPET } from '../../../../lib/snippets';

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
  ],
  templateUrl: './breadcrumbs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbsDemo {
  readonly breadcrumbsCode = BREADCRUMBS_SNIPPET;
}
