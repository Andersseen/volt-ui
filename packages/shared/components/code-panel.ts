import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  VoltNativeButton,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';
import { createDistribution, type DistributionMode } from '../lib/distribution';
import { VOLT_NAMES } from '../lib/volt-names.generated';
import { LmnCheckIcon, LmnCopyIcon } from 'lumen-icons';
import { CodeEditor } from './code-editor';
import { CopyButton } from './copy-button';
import { injectAppI18n } from '../i18n/i18n';

@Component({
  selector: 'app-code-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNativeButton,
    CommonModule,
    CodeEditor,
    CopyButton,
    LmnCheckIcon,
    LmnCopyIcon,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  template: `
    <div class="space-y-3">
      <!-- Header with title and copy button -->
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-lg">{{ heading() }}</h2>
        @if (!tabbed() || activeTab() === 'code') {
          <app-copy-button [code]="shownCode()" />
        }
      </div>
      <!-- Package or CLI copy: the code shown and the code copied are the same text. -->
      @if (distribution()) {
        <volt-toggle-group
          type="single"
          [allowDeselection]="false"
          [value]="[mode()]"
          (valueChange)="onModeChange($event)"
          [attr.aria-label]="t('ui.codePanel.modeLabel')"
        >
          <volt-toggle-group-item value="package" size="sm">{{
            t('ui.codePanel.modePackage')
          }}</volt-toggle-group-item>
          <volt-toggle-group-item value="copy" size="sm">{{
            t('ui.codePanel.modeCopy')
          }}</volt-toggle-group-item>
        </volt-toggle-group>
      }

      <!-- CLI Command -->
      @if (shownCliCommand()) {
        <div class="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <span class="text-sm text-muted-foreground">{{ t('ui.codePanel.installCli') }}</span>
          <code class="text-sm font-mono text-foreground">{{ shownCliCommand() }}</code>
          <button
            voltButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="copyCliCommand()"
            class="ml-auto h-7 gap-1 px-2 text-muted-foreground"
          >
            @if (cliCopied()) {
              <lmn-check [size]="14" class="text-success" />
              <span class="text-success">{{ t('ui.copy.copied') }}</span>
            } @else {
              <lmn-copy [size]="14" />
              <span>{{ t('ui.copy.action') }}</span>
            }
          </button>
        </div>
      }

      @if (tabbed()) {
        <volt-tabs [value]="activeTab()" (valueChange)="onTabChange($event)">
          <volt-tabs-list class="grid w-full grid-cols-2">
            <volt-tabs-trigger value="preview">{{ t('ui.codePanel.preview') }}</volt-tabs-trigger>
            <volt-tabs-trigger value="code">{{ t('ui.codePanel.code') }}</volt-tabs-trigger>
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
              <div class="w-full min-w-0 [&>*]:mx-auto" data-toc-ignore>
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
              <app-code-editor [code]="shownCode()" [ariaLabel]="heading()" />
            </div>
          </volt-tabs-content>
        </volt-tabs>
      } @else {
        <!-- Code Block with fixed height and scroll -->
        <div class="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
          <div class="absolute top-0 right-0 p-2 z-10">
            <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">TypeScript</span>
          </div>
          <app-code-editor [code]="shownCode()" [ariaLabel]="heading()" />
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
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  /*
   * Display text, not a key: the caller already holds `t`, and the sentences these panels
   * carry are mostly one shared parameterised note rather than one string per page. An
   * empty title means "the usual one", so the forty pages that show component source do
   * not each repeat it.
   */
  readonly title = input<string>('');
  readonly code = input.required<string>();
  readonly cliCommand = input<string>('');
  readonly description = input<string>('');
  readonly tabbed = input<boolean>(false);
  /**
   * The code is a complete consumer example in package mode (`@voltui/components`): offer the
   * CLI-copy version too (`Ui*`, `ui-*`, `./ui/<component>` imports), produced by the same
   * transform scripts/check-examples.mjs compiles, with the `volt add` command for it.
   */
  readonly distribution = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly mode = signal<DistributionMode>('package');
  private readonly transform = createDistribution(VOLT_NAMES);
  /** What the editor shows and what the copy button writes to the clipboard: one value. */
  protected readonly shownCode = computed(() =>
    this.distribution() ? this.transform.sourceFor(this.code(), this.mode()) : this.code()
  );
  protected readonly shownCliCommand = computed(() =>
    this.distribution() && this.mode() === 'copy'
      ? (this.transform.cliAddCommand(this.code()) ?? this.cliCommand())
      : this.cliCommand()
  );

  protected readonly heading = computed(
    () => this.title() || this.t('ui.codePanel.componentSource')
  );

  cliCopied = signal(false);
  activeTab = signal<'preview' | 'code'>('preview');

  async copyCliCommand() {
    const command = this.shownCliCommand();
    if (!command) return;

    try {
      await navigator.clipboard.writeText(command);
      this.cliCopied.set(true);
      setTimeout(() => this.cliCopied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  onModeChange(value: string[]) {
    const [next] = value;
    if (next === 'package' || next === 'copy') this.mode.set(next);
  }

  onTabChange(value: string | undefined) {
    if (value === 'preview' || value === 'code') {
      this.activeTab.set(value);
    }
  }
}
