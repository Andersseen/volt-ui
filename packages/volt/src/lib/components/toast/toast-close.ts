import { ChangeDetectionStrategy, Component, inject, output, computed, input } from '@angular/core';
import { NgpToast, NgpToastManager } from 'ng-primitives/toast';
import { cn } from '../../utils';

@Component({
  selector: 'volt-toast-close',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    role: 'button',
    tabindex: '0',
    '(click)': 'close()',
    '(keydown.enter)': 'close()',
    '(keydown.space)': 'close(); $event.preventDefault()',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
    <span class="sr-only">Close</span>
  `,
})
export class VoltToastClose {
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
      this.class()
    )
  );

  readonly closeChange = output<void>();
  private readonly toast = inject(NgpToast, { optional: true });
  private readonly toastManager = inject(NgpToastManager, { optional: true });

  protected close(): void {
    this.closeChange.emit();

    if (this.toast) {
      void this.toastManager?.dismiss(this.toast);
    }
  }
}
