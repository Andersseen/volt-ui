import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltBreadcrumbItem,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
  VoltBreadcrumbs,
  VoltNativeBreadcrumbLink,
} from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

/** Section › page, above the page title. */
@Component({
  selector: 'app-docs-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    VoltBreadcrumbs,
    VoltBreadcrumbList,
    VoltBreadcrumbItem,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    VoltNativeBreadcrumbLink,
  ],
  host: { class: 'block' },
  template: `
    <volt-breadcrumbs [ariaLabel]="t('ui.docs.breadcrumb')">
      <volt-breadcrumb-list class="text-xs">
        <volt-breadcrumb-item>
          <a voltBreadcrumbLink [routerLink]="sectionPath()">{{ section() }}</a>
        </volt-breadcrumb-item>
        @if (page(); as page) {
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item>
            <volt-breadcrumb-page>{{ page }}</volt-breadcrumb-page>
          </volt-breadcrumb-item>
        }
      </volt-breadcrumb-list>
    </volt-breadcrumbs>
  `,
})
export class DocsBreadcrumbs {
  readonly section = input.required<string>();
  /** Already localized. */
  readonly sectionPath = input.required<string>();
  readonly page = input<string>();

  protected readonly t = injectAppI18n().t;
}
