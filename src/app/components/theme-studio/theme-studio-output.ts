import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
} from 'volt';
import { CodeEditor } from '../code-editor';
import { CopyButton } from '../copy-button';
import { ThemeStudioStore } from '../../services/theme-studio-store';

/** The exported stylesheet, ready to paste into a Volt theme preset. */
@Component({
  selector: 'app-theme-studio-output',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeEditor,
    CopyButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
  ],
  template: `
    <volt-card
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/25"
    >
      <volt-card-header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <volt-card-title>Generated CSS</volt-card-title>
            <volt-card-description
              >Paste this into a Volt theme preset or app stylesheet.</volt-card-description
            >
          </div>
          <app-copy-button [code]="store.generatedCss()" />
        </div>
      </volt-card-header>
      <volt-card-content>
        <div class="overflow-hidden rounded-xl border border-border/70 bg-muted/30">
          <app-code-editor [code]="store.generatedCss()" language="css" height="420px" />
        </div>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioOutput {
  protected readonly store = inject(ThemeStudioStore);
}
