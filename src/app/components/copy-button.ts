import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import { injectAppI18n } from '../i18n/i18n';

@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LmnCheckIcon, LmnCopyIcon],
  template: `
    <button
      type="button"
      (click)="copyToClipboard()"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      [class.border-success]="copied()"
      [class.bg-success]="copied()"
      [class.text-success-foreground]="copied()"
    >
      @if (copied()) {
        <lmn-check [size]="14" />
        <span>{{ t('ui.copy.copied') }}</span>
      } @else {
        <lmn-copy [size]="14" />
        <span>{{ t('ui.copy.code') }}</span>
      }
    </button>
  `,
})
export class CopyButton {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

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
