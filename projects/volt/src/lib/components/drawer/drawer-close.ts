import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgpDialogRef } from 'ng-primitives/dialog';

@Component({
  selector: 'volt-drawer-close',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted cursor-pointer',
    '(click)': 'close()',
  },
  template: `<ng-content />`,
})
export class VoltDrawerClose {
  private readonly dialogRef = inject(NgpDialogRef);

  close(): void {
    this.dialogRef.close();
  }
}
