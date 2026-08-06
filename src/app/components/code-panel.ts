import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { VoltTabs, VoltTabsContent, VoltTabsList, VoltTabsTrigger } from 'volt';
import { LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import { CodeEditor } from './code-editor';
import { CopyButton } from './copy-button';

@Component({
  selector: 'app-code-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CodeEditor,
    CopyButton,
    LmnCheckIcon,
    LmnCopyIcon,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
  ],
  template: `
    <div class="space-y-3">
      <!-- Header with title and copy button -->
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">{{ title() }}</h3>
        @if (!tabbed() || activeTab() === 'code') {
          <app-copy-button [code]="code()" />
        }
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
              <lmn-check [size]="14" class="text-success" />
              <span class="text-success">Copied!</span>
            } @else {
              <lmn-copy [size]="14" />
              <span>Copy</span>
            }
          </button>
        </div>
      }

      @if (tabbed()) {
        <volt-tabs [value]="activeTab()" (valueChange)="onTabChange($event)">
          <volt-tabs-list class="grid w-full grid-cols-2">
            <volt-tabs-trigger value="preview">Preview</volt-tabs-trigger>
            <volt-tabs-trigger value="code">Code</volt-tabs-trigger>
          </volt-tabs-list>

          <volt-tabs-content value="preview">
            <!-- Grid + min-height rather than a fixed height: short demos stay
                 vertically centered, tall ones grow the box instead of hiding
                 their overflow behind an inner scrollbar. -->
            <div
              class="grid min-h-[400px] w-full items-center overflow-x-auto rounded-lg border border-border bg-background/50 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] p-6"
            >
              <!-- [&>*]:mx-auto centers demos that constrain their own width
                   (max-w-md and friends) without shrinking full-width demos.
                   min-w-0 stops a wide demo from stretching the whole frame on
                   mobile — the demo's own scroll container handles it instead. -->
              <div class="w-full min-w-0 [&>*]:mx-auto">
                <ng-content />
              </div>
            </div>
          </volt-tabs-content>

          <volt-tabs-content value="code">
            <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div class="absolute top-0 right-0 p-2 z-10">
                <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded"
                  >TypeScript</span
                >
              </div>
              <app-code-editor [code]="code()" />
            </div>
          </volt-tabs-content>
        </volt-tabs>
      } @else {
        <!-- Code Block with fixed height and scroll -->
        <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
          <div class="absolute top-0 right-0 p-2 z-10">
            <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">TypeScript</span>
          </div>
          <app-code-editor [code]="code()" />
        </div>
      }

      <!-- Description slot -->
      @if (description()) {
        <p class="text-sm text-muted-foreground">{{ description() }}</p>
      }
    </div>
  `,
})
export class CodePanel {
  readonly title = input<string>('Component Source');
  readonly code = input.required<string>();
  readonly cliCommand = input<string>('');
  readonly description = input<string>('');
  readonly tabbed = input<boolean>(false);

  cliCopied = signal(false);
  activeTab = signal<'preview' | 'code'>('preview');

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

  onTabChange(value: string | undefined) {
    if (value === 'preview' || value === 'code') {
      this.activeTab.set(value);
    }
  }
}
