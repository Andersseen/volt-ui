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
import { EditorLoaderService } from '../services/editor-loader.service';
import { IconCheck, IconCopy } from '../icons';

@Component({
  selector: 'app-code-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, CopyButton, IconCheck, IconCopy],
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
              <icon-check class="w-[14px] h-[14px] text-green-600" />
              <span class="text-green-600">Copied!</span>
            } @else {
              <icon-copy class="w-[14px] h-[14px]" />
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
        @if (editorLoaded()) {
          <vertex-editor
            [attr.value]="code()"
            [attr.language]="'typescript'"
            [attr.theme]="editorTheme()"
            lineNumbers="true"
            readonly="true"
            style="display: block; height: 400px; overflow: auto;"
          ></vertex-editor>
        } @else {
          <div style="display: block; height: 400px;" class="flex items-center justify-center">
            <div class="animate-pulse text-muted-foreground">Loading editor...</div>
          </div>
        }
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
  editorLoaded = signal(false);

  private destroyRef = inject(DestroyRef);
  private editorLoader = inject(EditorLoaderService);

  async ngOnInit() {
    // Load editor script lazily
    await this.editorLoader.loadEditor();
    this.editorLoaded.set(true);

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
