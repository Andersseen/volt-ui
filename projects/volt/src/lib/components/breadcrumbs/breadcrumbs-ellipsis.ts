import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpBreadcrumbEllipsis } from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumb-ellipsis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbEllipsis],
  host: { class: 'inline-flex items-center' },
  template: `
    <span ngpBreadcrumbEllipsis class="flex h-9 w-9 items-center justify-center" aria-label="More">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    </span>
  `,
})
export class VoltBreadcrumbEllipsis {}
