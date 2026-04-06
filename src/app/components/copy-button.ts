import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconCopy, IconCheck } from '../icons';

@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconCopy, IconCheck],
  template: `
    <button
      type="button"
      (click)="copyToClipboard()"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      [class.text-green-600]="copied()"
      [class.border-green-200]="copied()"
      [class.bg-green-50]="copied()"
      [class.dark:bg-green-950]="copied()"
    >
      @if (copied()) {
        <icon-check class="w-[14px] h-[14px]" />
        <span>Copied!</span>
      } @else {
        <icon-copy />
        <span>Copy code</span>
      }
    </button>
  `,
})
export class CopyButton {
  readonly code = input.required<string>();
  readonly copied = signal(false);

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
