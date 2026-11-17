import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import { COMPONENTS_SIDEBAR } from '../lib/docs-sidebar';
import { injectAppI18n } from '@shared/i18n/i18n';

@Component({
  selector: 'app-components-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DocsPageShell],
  template: `
    <app-docs-page-shell
      [title]="t('components.index.title')"
      [browseLabel]="t('catalog.browse')"
      [groups]="groups"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class ComponentsLayout {
  private readonly translations = injectAppI18n();

  protected readonly t = this.translations.t;

  /** Shared with the Doqs pages (`doqs/doq-host-layout.ts`), so both list every component. */
  readonly groups = COMPONENTS_SIDEBAR;
}
