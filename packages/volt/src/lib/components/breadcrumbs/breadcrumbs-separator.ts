import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpBreadcrumbSeparator } from 'ng-primitives/breadcrumbs';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-breadcrumb-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbSeparator],
  template: `
    <li ngpBreadcrumbSeparator aria-hidden="true" [class]="classes()">
      <ng-content>
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
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </ng-content>
    </li>
  `,
})
export class VoltBreadcrumbSeparator {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('[&>svg]:w-3.5 [&>svg]:h-3.5', this.class()));

  constructor() {
    forwardClassFromHost();
  }
}
