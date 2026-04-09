import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IconAccordion,
  IconArrowRight,
  IconAvatar,
  IconBadge,
  IconBold,
  IconButton,
  IconCard,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconComponents,
  IconCopy,
  IconExternalLink,
  IconGithub,
  IconHome,
  IconInput,
  IconItalic,
  IconMail,
  IconMenu,
  IconMoon,
  IconMoreVertical,
  IconNavigation,
  IconPaperclip,
  IconPlus,
  IconRadio,
  IconSearch,
  IconSelect,
  IconSeparator,
  IconSettings,
  IconSmile,
  IconSparkles,
  IconSun,
  IconSwitch,
  IconTabs,
  IconToggle,
  IconTooltip,
} from '../../icons';

@Component({
  selector: 'app-docs-icons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconAccordion,
    IconArrowRight,
    IconAvatar,
    IconBadge,
    IconBold,
    IconButton,
    IconCard,
    IconCheck,
    IconCheckbox,
    IconChevronDown,
    IconChevronRight,
    IconClose,
    IconComponents,
    IconCopy,
    IconExternalLink,
    IconGithub,
    IconHome,
    IconInput,
    IconItalic,
    IconMail,
    IconMenu,
    IconMoon,
    IconMoreVertical,
    IconNavigation,
    IconPaperclip,
    IconPlus,
    IconRadio,
    IconSearch,
    IconSelect,
    IconSeparator,
    IconSettings,
    IconSmile,
    IconSparkles,
    IconSun,
    IconSwitch,
    IconTabs,
    IconToggle,
    IconTooltip,
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4 w-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Icons</h1>
      <p class="text-lg text-muted-foreground mb-2">
        39 icons as standalone Angular components. Tree-shakeable — only what you import gets
        bundled.
      </p>
      <p class="text-sm text-muted-foreground mb-8">
        All icons inherit
        <code class="font-mono bg-muted px-1 py-0.5 rounded text-xs">currentColor</code>
        and respond to Tailwind text utilities.
      </p>

      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        @for (icon of icons; track icon.name) {
          <div
            class="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30 cursor-default"
          >
            <div class="text-foreground flex items-center justify-center h-6 w-6">
              @switch (icon.name) {
                @case ('icon-accordion') {
                  <icon-accordion />
                }
                @case ('icon-arrow-right') {
                  <icon-arrow-right />
                }
                @case ('icon-avatar') {
                  <icon-avatar />
                }
                @case ('icon-badge') {
                  <icon-badge />
                }
                @case ('icon-bold') {
                  <icon-bold />
                }
                @case ('icon-button') {
                  <icon-button />
                }
                @case ('icon-card') {
                  <icon-card />
                }
                @case ('icon-check') {
                  <icon-check />
                }
                @case ('icon-checkbox') {
                  <icon-checkbox />
                }
                @case ('icon-chevron-down') {
                  <icon-chevron-down />
                }
                @case ('icon-chevron-right') {
                  <icon-chevron-right />
                }
                @case ('icon-close') {
                  <icon-close />
                }
                @case ('icon-components') {
                  <icon-components />
                }
                @case ('icon-copy') {
                  <icon-copy />
                }
                @case ('icon-external-link') {
                  <icon-external-link />
                }
                @case ('icon-github') {
                  <icon-github />
                }
                @case ('icon-home') {
                  <icon-home />
                }
                @case ('icon-input') {
                  <icon-input />
                }
                @case ('icon-italic') {
                  <icon-italic />
                }
                @case ('icon-mail') {
                  <icon-mail />
                }
                @case ('icon-menu') {
                  <icon-menu />
                }
                @case ('icon-moon') {
                  <icon-moon />
                }
                @case ('icon-more-vertical') {
                  <icon-more-vertical />
                }
                @case ('icon-navigation') {
                  <icon-navigation />
                }
                @case ('icon-paperclip') {
                  <icon-paperclip />
                }
                @case ('icon-plus') {
                  <icon-plus />
                }
                @case ('icon-radio') {
                  <icon-radio />
                }
                @case ('icon-search') {
                  <icon-search />
                }
                @case ('icon-select') {
                  <icon-select />
                }
                @case ('icon-separator') {
                  <icon-separator />
                }
                @case ('icon-settings') {
                  <icon-settings />
                }
                @case ('icon-smile') {
                  <icon-smile />
                }
                @case ('icon-sparkles') {
                  <icon-sparkles />
                }
                @case ('icon-sun') {
                  <icon-sun />
                }
                @case ('icon-switch') {
                  <icon-switch />
                }
                @case ('icon-tabs') {
                  <icon-tabs />
                }
                @case ('icon-toggle') {
                  <icon-toggle />
                }
                @case ('icon-tooltip') {
                  <icon-tooltip />
                }
              }
            </div>
            <span
              class="text-[10px] text-center text-muted-foreground group-hover:text-foreground font-mono leading-tight break-all"
            >
              {{ icon.name }}
            </span>
          </div>
        }
      </div>

      <div class="mt-12 space-y-3">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-sm text-muted-foreground">Import only the icons you need:</p>
        <pre
          class="rounded-lg border border-border bg-muted/50 p-4 text-sm font-mono overflow-x-auto text-foreground"
        ><code>import &#123; IconHome, IconSettings &#125; from 'src/app/icons';</code></pre>
        <pre
          class="rounded-lg border border-border bg-muted/50 p-4 text-sm font-mono overflow-x-auto text-foreground"
        ><code>&lt;icon-home class="h-4 w-4" /&gt;</code></pre>
      </div>
    </div>
  `,
})
export default class DocsIcons {
  readonly icons = [
    { name: 'icon-accordion' },
    { name: 'icon-arrow-right' },
    { name: 'icon-avatar' },
    { name: 'icon-badge' },
    { name: 'icon-bold' },
    { name: 'icon-button' },
    { name: 'icon-card' },
    { name: 'icon-check' },
    { name: 'icon-checkbox' },
    { name: 'icon-chevron-down' },
    { name: 'icon-chevron-right' },
    { name: 'icon-close' },
    { name: 'icon-components' },
    { name: 'icon-copy' },
    { name: 'icon-external-link' },
    { name: 'icon-github' },
    { name: 'icon-home' },
    { name: 'icon-input' },
    { name: 'icon-italic' },
    { name: 'icon-mail' },
    { name: 'icon-menu' },
    { name: 'icon-moon' },
    { name: 'icon-more-vertical' },
    { name: 'icon-navigation' },
    { name: 'icon-paperclip' },
    { name: 'icon-plus' },
    { name: 'icon-radio' },
    { name: 'icon-search' },
    { name: 'icon-select' },
    { name: 'icon-separator' },
    { name: 'icon-settings' },
    { name: 'icon-smile' },
    { name: 'icon-sparkles' },
    { name: 'icon-sun' },
    { name: 'icon-switch' },
    { name: 'icon-tabs' },
    { name: 'icon-toggle' },
    { name: 'icon-tooltip' },
  ];
}
