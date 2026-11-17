import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import { GUIDE_SIDEBAR } from '../lib/docs-sidebar';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell
      [title]="t('guide.title')"
      [browseLabel]="t('guide.browse')"
      [description]="t('guide.description')"
      [groups]="groups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class DocsLayout {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  /** Shared with the Doqs pages (`doqs/doq-host-layout.ts`), so both list every guide. */
  protected readonly groups = GUIDE_SIDEBAR;
}
