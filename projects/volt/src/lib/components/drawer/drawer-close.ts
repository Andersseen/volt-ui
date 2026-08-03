import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgpDialogRef } from 'ng-primitives/dialog';

@Component({
  selector: 'volt-drawer-close',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
    role: 'button',
    tabindex: '0',
    '(click)': 'close()',
    '(keydown.enter)': 'close()',
    '(keydown.space)': 'close(); $event.preventDefault()',
  },
  template: `
    <ng-content />
    <span class="sr-only">Close</span>
  `,
})
export class VoltDrawerClose {
  private readonly dialogRef = inject(NgpDialogRef);

  close(): void {
    this.dialogRef.close();
  }
}
