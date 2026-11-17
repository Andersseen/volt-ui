import type { DocsSidebarGroup } from '../components/docs/docs-nav-list';
import { COMPONENT_GROUPS } from './component-metadata';

/**
 * The two documentation sidebars of voltui.dev, in one place.
 *
 * Host pages and Doqs (Markdown) pages render the same navigation: a reader moving between
 * `/docs/versioning` (host) and `/docs/introduction` (Doqs) must not see the sidebar shrink to
 * the handful of pages that happen to be Markdown. Keys, not text: the sidebar resolves each one
 * in whatever language is on screen.
 */
export const GUIDE_SIDEBAR: readonly DocsSidebarGroup[] = [
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

export const COMPONENTS_SIDEBAR: readonly DocsSidebarGroup[] = [
  {
    links: [{ path: '/docs/components', labelKey: 'catalog.all', exact: true }],
  },
  ...COMPONENT_GROUPS.map(group => ({
    headingKey: group.titleKey,
    links: group.components.map(component => ({
      path: component.path,
      labelKey: component.shortLabelKey ?? component.labelKey,
      label: component.label,
      stability: component.stability,
    })),
  })),
];
