import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  signal,
  afterNextRender,
  Injector,
} from '@angular/core';
import { VoltTabs, VoltTabsContent, VoltTabsList, VoltTabsTrigger } from 'volt';
import { IconCheck, IconCopy } from '../icons';
import { EditorLoaderService } from '../services/editor-loader.service';
import { CopyButton } from './copy-button';

@Component({
  selector: 'app-code-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    CopyButton,
    IconCheck,
    IconCopy,
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
              <icon-check class="w-[14px] h-[14px] text-green-600" />
              <span class="text-green-600">Copied!</span>
            } @else {
              <icon-copy class="w-[14px] h-[14px]" />
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
            <div class="rounded-lg border border-border bg-muted/20 p-6">
              <ng-content />
            </div>
          </volt-tabs-content>

          <volt-tabs-content value="code">
            <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div class="absolute top-0 right-0 p-2 z-10">
                <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded"
                  >TypeScript</span
                >
              </div>
              @if (editorLoaded()) {
                <vertex-editor
                  [attr.value]="code()"
                  [attr.language]="'typescript'"
                  [attr.theme]="editorTheme()"
                  [attr.readonly]="editorReady() ? 'true' : null"
                  lineNumbers="true"
                  style="display: block; height: 400px; overflow: auto;"
                ></vertex-editor>
              } @else {
                <div
                  style="display: block; height: 400px;"
                  class="flex items-center justify-center"
                >
                  <div class="animate-pulse text-muted-foreground">Loading editor...</div>
                </div>
              }
            </div>
          </volt-tabs-content>
        </volt-tabs>
      } @else {
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
              [attr.readonly]="editorReady() ? 'true' : null"
              lineNumbers="true"
              style="display: block; height: 400px; overflow: auto;"
            ></vertex-editor>
          } @else {
            <div style="display: block; height: 400px;" class="flex items-center justify-center">
              <div class="animate-pulse text-muted-foreground">Loading editor...</div>
            </div>
          }
        </div>
      }

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
  readonly tabbed = input<boolean>(false);

  cliCopied = signal(false);
  editorTheme = signal<'light' | 'dark'>('light');
  editorLoaded = signal(false);
  editorReady = signal(false);
  activeTab = signal<'preview' | 'code'>('preview');

  private destroyRef = inject(DestroyRef);
  private editorLoader = inject(EditorLoaderService);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Load editor script lazily
    await this.editorLoader.loadEditor();
    this.editorLoaded.set(true);

    // Set readonly after the editor DOM element has connected and initialized its CodeMirror view.
    // vertex-editor's editable effect only fires when editorView is non-null, which is after
    // connectedCallback — afterNextRender guarantees we're past that point.
    afterNextRender(() => this.editorReady.set(true), { injector: this.injector });

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

  onTabChange(value: string | undefined) {
    if (value === 'preview' || value === 'code') {
      this.activeTab.set(value);
    }
  }
}
