import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';
import { COMPONENT_GROUPS } from '../lib/component-metadata';
import { Translations } from '../i18n/translations';

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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  /*
   * A plain field again, now that the labels are keys: nothing here holds text, so there
   * is nothing to rebuild when the language changes — the sidebar resolves each key as it
   * renders.
   */
  readonly groups: DocsSidebarGroup[] = [
    {
      links: [{ path: '/docs/components', labelKey: 'catalog.all', exact: true }],
    },
    ...COMPONENT_GROUPS.map(group => ({
      headingKey: group.titleKey,
      links: group.components.map(component => ({
        path: component.path,
        labelKey: component.shortLabelKey ?? component.labelKey,
        stability: component.stability,
      })),
    })),
  ];
}
