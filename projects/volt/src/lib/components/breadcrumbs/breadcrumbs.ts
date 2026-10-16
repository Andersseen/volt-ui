import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpBreadcrumbs } from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbs],
  template: `<nav ngpBreadcrumbs [attr.aria-label]="ariaLabel()"><ng-content /></nav>`,
})
export class VoltBreadcrumbs {
  /** The landmark's accessible name. Pass a translated string on a localized site. */
  readonly ariaLabel = input('breadcrumb');
}
