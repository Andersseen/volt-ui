import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VoltBadge, VoltNativeButton, VoltSidebarGroup, VoltSidebarItem } from 'volt';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import type { ComponentStability } from '../../lib/component-metadata';
import { STORYBOOK_URL } from '@shared/lib/storybook';

/*
 * Keys, not text. Most sidebars on the site are built from a static catalog const, which has no
 * injector and so can never call `t` — carrying the key lets the component that renders the
 * label resolve it in whatever language is on screen, including after a switch with no reload.
 */
export interface DocsSidebarLink {
  path: string;
  labelKey?: PlainTranslationKey;
  /** Locale-invariant label (a component name) for entries whose Glossa key does not exist yet. */
  label?: string;
  exact?: boolean;
  stability?: ComponentStability;
}

export interface DocsSidebarGroup {
  headingKey?: PlainTranslationKey;
  /** Locale-invariant heading, same caveat as `DocsSidebarLink.label`. */
  heading?: string;
  links: DocsSidebarLink[];
}

/**
 * The docs navigation as Volt sidebar groups and items. Used in the pinned sidebar and in the
 * mobile drawer. Only non-stable entries carry a badge: on a row-per-component list, a `stable`
 * badge on nearly every row is noise that hides the two that matter.
 */
@Component({
  selector: 'app-docs-nav-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltNativeButton, VoltSidebarGroup, VoltSidebarItem],
  host: { class: 'block', '(click)': 'onClick($event)' },
  template: `
    @for (group of groups(); track $index) {
      <volt-sidebar-group class="mb-6" [label]="heading(group)">
        @for (link of group.links; track link.path) {
          <volt-sidebar-item
            class="h-8 rounded-md px-3 text-[13px]"
            [routerLink]="path(link.path)"
            [label]="label(link)"
            [exact]="link.exact ?? false"
          >
            @if (link.stability && link.stability !== 'stable') {
              <volt-badge
                slot="trailing"
                [variant]="link.stability === 'beta' ? 'info' : 'warning'"
                class="px-1.5 py-0 text-[10px]"
              >
                {{ stabilityLabel(link.stability) }}
              </volt-badge>
            }
          </volt-sidebar-item>
        }
      </volt-sidebar-group>
    }

    <!-- Outside \`groups\` on purpose: it leaves the site, so it must not become the pager's next page. -->
    <div class="mt-2 border-t border-border/60 pt-4">
      <a
        voltButton
        variant="ghost"
        size="sm"
        [href]="storybookUrl"
        target="_blank"
        rel="noopener"
        class="w-full justify-between px-3 text-[13px] font-normal text-muted-foreground"
      >
        <span
          >{{ t('nav.storybook') }}<span class="sr-only"> {{ t('nav.externalLink') }}</span></span
        >
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  `,
})
export class DocsNavList {
  readonly groups = input.required<readonly DocsSidebarGroup[]>();
  /** A link was followed — the drawer closes on it. */
  readonly navigated = output<void>();

  private readonly translations = injectAppI18n();
  protected readonly t = this.translations.t;
  protected readonly storybookUrl = STORYBOOK_URL;
  /** Every sidebar link on the site passes through here, so one call keeps them all in locale. */
  protected readonly path = this.translations.path;

  protected heading(group: DocsSidebarGroup): string | undefined {
    return group.headingKey ? this.t(group.headingKey) : group.heading;
  }

  protected label(link: DocsSidebarLink): string {
    return link.labelKey ? this.t(link.labelKey) : (link.label ?? '');
  }

  protected stabilityLabel(stability: ComponentStability): string {
    return stability === 'experimental'
      ? this.t('catalog.stability.experimentalShort')
      : this.t(`catalog.stability.${stability}`);
  }

  protected onClick(event: Event): void {
    if ((event.target as HTMLElement | null)?.closest('a')) {
      this.navigated.emit();
    }
  }
}
