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
import { injectAppI18n } from '../../../../i18n/i18n';

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
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  readonly breadcrumbsApi = BREADCRUMBS_API;
  readonly breadcrumbsCode = BREADCRUMBS_SNIPPET;
  readonly breadcrumbsUsage = BREADCRUMBS_USAGE;
}
