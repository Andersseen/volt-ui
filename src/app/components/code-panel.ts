import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyButton } from './copy-button';

@Component({
  selector: 'app-code-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, CopyButton],
  template: `
    <div class="space-y-3">
      <!-- Header with title and copy button -->
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">{{ title() }}</h3>
        <app-copy-button [code]="code()" />
      </div>

      <!-- CLI Command -->
      @if (cliCommand()) {
        <div class="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <span class="text-sm text-muted-foreground">Install via CLI:</span>
          <code class="text-sm font-mono text-foreground">{{ cliCommand() }}</code>
          <button
            type="button"
            (click)="copyCliCommand()"
            class="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            @if (cliCopied()) {
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
                class="text-green-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span class="text-green-600">Copied!</span>
            } @else {
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
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>Copy</span>
            }
          </button>
        </div>
      }

      <!-- Code Block with fixed height and scroll -->
      <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
        <div class="absolute top-0 right-0 p-2 z-10">
          <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">TypeScript</span>
        </div>
        <vertex-editor
          [attr.value]="code()"
          [attr.language]="'typescript'"
          [attr.theme]="editorTheme()"
          lineNumbers="true"
          readonly="true"
          style="display: block; height: 400px; overflow: auto;"
        ></vertex-editor>
      </div>

      <!-- Description slot -->
      @if (description()) {
        <p class="text-sm text-muted-foreground">{{ description() }}</p>
      }
    </div>
  `,
})
export class CodePanel implements OnInit {
  readonly title = input<string>('Component Source');
  readonly code = input.required<string>();
  readonly cliCommand = input<string>('');
  readonly description = input<string>('');

  cliCopied = signal(false);
  editorTheme = signal<'light' | 'dark'>('light');

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.editorTheme.set(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      this.editorTheme.set(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  async copyCliCommand() {
    if (!this.cliCommand()) return;

    try {
      await navigator.clipboard.writeText(this.cliCommand());
      this.cliCopied.set(true);
      setTimeout(() => this.cliCopied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
