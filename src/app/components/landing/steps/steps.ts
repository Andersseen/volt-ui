import type { PlainTranslationKey } from '../../../i18n/i18n';

export interface Step {
  readonly id: string;
  readonly labelKey: PlainTranslationKey;
  readonly titleKey: PlainTranslationKey;
  readonly bodyKey: PlainTranslationKey;
  /** The file the code sample stands for, shown in the panel header. */
  readonly file: string;
  readonly code: string;
}

/** From install to an agent that writes Volt for you. Code samples are exhibits, not copy. */
export const STEPS: readonly Step[] = [
  {
    id: 'install',
    labelKey: 'landing.steps.install.label',
    titleKey: 'landing.steps.install.title',
    bodyKey: 'landing.steps.install.body',
    file: 'terminal',
    code: [
      '$ npx @voltui/cli init',
      '$ npx @voltui/cli add dialog form-field',
      '',
      '✓ dialog       src/app/ui/dialog',
      '✓ form-field   src/app/ui/form-field',
      '✓ button       src/app/ui/button   (dependency)',
    ].join('\n'),
  },
  {
    id: 'compose',
    labelKey: 'landing.steps.compose.label',
    titleKey: 'landing.steps.compose.title',
    bodyKey: 'landing.steps.compose.body',
    file: 'settings.page.html',
    code: [
      '<!-- imports: [UiFormField, UiLabel, UiInput, UiButton] -->',
      '<ui-form-field>',
      '  <ui-label>Workspace</ui-label>',
      '  <ui-input [(value)]="name" />',
      '</ui-form-field>',
      '',
      '<ui-button (click)="save()">Save</ui-button>',
    ].join('\n'),
  },
  {
    id: 'theme',
    labelKey: 'landing.steps.theme.label',
    titleKey: 'landing.steps.theme.title',
    bodyKey: 'landing.steps.theme.body',
    file: 'app.config.ts',
    code: [
      "import { provideVoltTheme } from '@voltui/components';",
      '',
      'export const appConfig: ApplicationConfig = {',
      '  providers: [',
      "    provideVoltTheme({ color: 'ember', style: 'soft', dark: false }),",
      '  ],',
      '};',
    ].join('\n'),
  },
  {
    id: 'own',
    labelKey: 'landing.steps.own.label',
    titleKey: 'landing.steps.own.title',
    bodyKey: 'landing.steps.own.body',
    file: 'ui/button/variants.ts',
    code: [
      "export const buttonVariants = cva('inline-flex items-center', {",
      '  variants: {',
      '    size: {',
      "      sm: 'h-8 px-3 text-sm',",
      "      md: 'h-10 px-4',",
      "      xl: 'h-14 px-8 text-lg', // yours now",
      '    },',
      '  },',
      '});',
    ].join('\n'),
  },
  {
    id: 'agents',
    labelKey: 'landing.steps.agents.label',
    titleKey: 'landing.steps.agents.title',
    bodyKey: 'landing.steps.agents.body',
    file: 'terminal',
    code: [
      '$ npx @voltui/agent claude',
      '',
      'Claude Code',
      '  created   .mcp.json',
      '  created   .claude/skills/volt-ui/SKILL.md',
      '  → Restart Claude Code for the MCP server and skill to load.',
    ].join('\n'),
  },
];
