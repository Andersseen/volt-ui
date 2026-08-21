import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsPageShell } from '../components/docs-page-shell';
import type { DocsSidebarGroup } from '../components/docs-sidebar-nav';
import { Translations } from '../i18n/translations';

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
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  /*
   * Keys rather than resolved text, so this can be a plain field. It used to be a computed
   * because the labels had to be rebuilt on a language change; now nothing here holds text
   * and the sidebar resolves each key as it renders.
   */
  protected readonly groups: DocsSidebarGroup[] = [
    {
      links: [
        { path: '/docs/introduction', labelKey: 'guide.introduction' },
        { path: '/docs/themes', labelKey: 'guide.themes' },
        { path: '/docs/customization', labelKey: 'guide.customization' },
        { path: '/docs/versioning', labelKey: 'guide.versioning' },
        { path: '/docs/roadmap', labelKey: 'guide.roadmap' },
        { path: '/docs/migration-notes', labelKey: 'guide.migration' },
      ],
    },
    {
      headingKey: 'guide.aiTools',
      links: [
        { path: '/docs/mcp', labelKey: 'guide.aiIntegration' },
        { path: '/docs/ai-skill', labelKey: 'guide.localSkill' },
        { path: '/docs/ai-mcp', labelKey: 'guide.mcpServer' },
        { path: '/docs/ai-prompt', labelKey: 'guide.promptReference' },
      ],
    },
  ];
}
