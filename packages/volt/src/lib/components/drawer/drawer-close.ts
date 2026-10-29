import { Component, ChangeDetectionStrategy, inject, computed, input } from '@angular/core';
import { NgpDialogRef } from 'ng-primitives/dialog';
import { cn } from '../../utils';

@Component({
  selector: 'volt-drawer-close',
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
    <ng-content />
    <span class="sr-only">{{ label() }}</span>
  `,
})
export class VoltDrawerClose {
  readonly class = input<string>('');
  /** Accessible name for the icon-only button. Pass a translated string on a localized site. */
  readonly label = input('Close');

  protected readonly classes = computed(() =>
    cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
      this.class()
    )
  );

  private readonly dialogRef = inject(NgpDialogRef);

  close(): void {
    this.dialogRef.close();
  }
}
