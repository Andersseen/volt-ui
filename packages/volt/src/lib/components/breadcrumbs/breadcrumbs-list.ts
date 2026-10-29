import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgpBreadcrumbList } from 'ng-primitives/breadcrumbs';
import { forwardClassFromHost } from '../../host-forwarding';
import { cn } from '../../utils';

@Component({
  selector: 'volt-breadcrumb-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbList],
  template: `
    <ol ngpBreadcrumbList [class]="classes()">
      <ng-content />
    </ol>
  `,
})
export class VoltBreadcrumbList {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      this.class()
    )
  );

  constructor() {
    forwardClassFromHost();
  }
}
