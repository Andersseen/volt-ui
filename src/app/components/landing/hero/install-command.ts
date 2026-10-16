import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MoveEnterDirective, MoveTapDirective } from 'angular-movement';
import { LmnCheckIcon, LmnCopyIcon, LmnTerminalIcon } from 'lumen-icons';
import { VoltButton, VoltCard } from 'volt';
import { injectAppI18n } from '../../../i18n/i18n';
import { TAP_PRESS } from '../../../lib/motion';

/** The install command the hero advertises and its copy button writes to the clipboard. */
export const INSTALL_COMMAND = 'npx @voltui/cli add button dialog form-field';

/** The install command on a card, with a copy button that confirms for a moment. */
@Component({
  selector: 'app-install-command',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCard,
    MoveEnterDirective,
    MoveTapDirective,
    LmnCheckIcon,
    LmnCopyIcon,
    LmnTerminalIcon,
  ],
  host: { class: 'block' },
  template: `
    <volt-card
      class="flex max-w-xl items-center gap-2 bg-background/70 p-2 pl-4 text-left shadow-xl shadow-black/5 backdrop-blur"
    >
      <lmn-terminal [size]="16" class="shrink-0 text-primary" />
      <code class="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm">{{ command }}</code>
      <volt-button
        variant="ghost"
        size="icon"
        class="shrink-0"
        [moveWhileTap]="press"
        [aria-label]="copied() ? t('landing.hero.copied') : t('landing.hero.copyCommand')"
        (click)="copy()"
      >
        @if (copied()) {
          <lmn-check moveEnter="bounce-in" [size]="16" class="text-success" />
        } @else {
          <lmn-copy [size]="16" />
        }
      </volt-button>
    </volt-card>
  `,
})
export class InstallCommand {
  protected readonly t = injectAppI18n().t;
  protected readonly command = INSTALL_COMMAND;
  protected readonly press = TAP_PRESS;
  readonly copied = signal(false);

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1800);
  }
}
