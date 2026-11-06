import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';

// Every part merges its `class` input over the defaults with `cn()`, so
// `<volt-card-content class="p-3">` replaces `p-card pt-0` instead of competing with it.

@Component({
  selector: 'volt-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltCard {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'block rounded-xl border-(length:--border-width) border-border bg-card text-card-foreground shadow-sm',
      this.class()
    )
  );
}

@Component({
  selector: 'volt-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltCardHeader {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex flex-col gap-1.5 p-card', this.class()));
}

@Component({
  selector: 'volt-card-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltCardTitle {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-lg font-semibold leading-none tracking-tight', this.class())
  );
}

@Component({
  selector: 'volt-card-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltCardDescription {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn('block text-sm text-muted-foreground', this.class())
  );
}

@Component({
  selector: 'volt-card-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltCardContent {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('block p-card pt-0', this.class()));
}

@Component({
  selector: 'volt-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class VoltCardFooter {
  readonly class = input<string>('');

  protected readonly classes = computed(() => cn('flex items-center p-card pt-0', this.class()));
}
