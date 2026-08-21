import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
      [groups]="groups()"
    >
      <router-outlet />
    </app-docs-page-shell>
  `,
})
export default class DocsLayout {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  /*
   * A computed rather than a field. The labels have to be rebuilt when the language
   * changes, and a field would capture whichever language happened to be active the first
   * time the shell was created — which, for a shell that survives navigation, is the one
   * the visitor arrived in and never the one they switched to.
   */
  protected readonly groups = computed<DocsSidebarGroup[]>(() => [
    {
      links: [
        { path: '/docs/introduction', label: this.t('guide.introduction') },
        { path: '/docs/themes', label: this.t('guide.themes') },
        { path: '/docs/customization', label: this.t('guide.customization') },
        { path: '/docs/versioning', label: this.t('guide.versioning') },
        { path: '/docs/roadmap', label: this.t('guide.roadmap') },
        { path: '/docs/migration-notes', label: this.t('guide.migration') },
      ],
    },
    {
      heading: this.t('guide.aiTools'),
      links: [
        { path: '/docs/mcp', label: this.t('guide.aiIntegration') },
        { path: '/docs/ai-skill', label: this.t('guide.localSkill') },
        { path: '/docs/ai-mcp', label: this.t('guide.mcpServer') },
        { path: '/docs/ai-prompt', label: this.t('guide.promptReference') },
      ],
    },
  ]);
}
