import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'volt-nav-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile slot: consumer provides the trigger button -->
    <div class="w-full md:hidden">
      <ng-content select="[slot=mobile-trigger]" />
    </div>

    <!-- Desktop aside -->
    <aside
      class="hidden md:flex w-full md:w-64 flex-shrink-0 md:sticky md:top-24 flex-col gap-2"
      [attr.aria-label]="label() || title()"
    >
      @if (title()) {
        <h4 class="font-medium text-sm mt-2 text-foreground">{{ title() }}</h4>
      }
      @if (description()) {
        <p class="text-xs text-muted-foreground">{{ description() }}</p>
      }
      <ng-content />
    </aside>
  `,
})
export class VoltNavSidebar {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly label = input<string>('');
}
