import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VoltSeparator } from 'volt';

export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

const DEFAULT_LINKS: readonly FooterLink[] = [
  { label: 'Docs', href: '#docs' },
  { label: 'Changelog', href: '#changelog' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
];

const DEFAULT_SOCIAL: readonly FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'Mastodon', href: 'https://mastodon.social/' },
];

/**
 * Compact footer for minimal product sites, documentation and web apps: one row on wide containers,
 * wrapping into stacked groups on narrow ones. There is no newsletter and no sitemap — if you need
 * those, use the sitemap footer.
 *
 * Links are plain anchors in labelled navigations, so they work with no JavaScript and with any
 * router (`routerLink` on the same element). `social` links open in the same tab by default; pass
 * `external` links through `rel="noopener"` if you change that. The year is computed, so the line
 * cannot go stale.
 */
@Component({
  selector: 'app-footer-compact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSeparator],
  host: { class: 'block' },
  template: `
    <footer class="@container bg-background">
      <volt-separator />
      <div
        class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 @2xl:flex-row @2xl:items-center @2xl:justify-between"
      >
        <p class="text-sm text-muted-foreground">
          <span class="font-medium text-foreground">{{ brand() }}</span>
          <span aria-hidden="true"> · </span>
          © {{ year }} {{ owner() }}
        </p>

        <div class="flex flex-col gap-3 @lg:flex-row @lg:flex-wrap @lg:items-center @lg:gap-6">
          @if (links().length) {
            <nav aria-label="Footer">
              <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                @for (link of links(); track link.href) {
                  <li>
                    <a
                      class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      [href]="link.href"
                      >{{ link.label }}</a
                    >
                  </li>
                }
              </ul>
            </nav>
          }
          @if (social().length) {
            <nav aria-label="Social">
              <ul class="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                @for (link of social(); track link.href) {
                  <li>
                    <a
                      class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      [href]="link.href"
                      rel="noopener"
                      >{{ link.label }}</a
                    >
                  </li>
                }
              </ul>
            </nav>
          }
        </div>
      </div>
    </footer>
  `,
})
export class FooterCompact {
  readonly brand = input('Acme');
  readonly owner = input('Acme, Inc.');
  readonly links = input<readonly FooterLink[]>(DEFAULT_LINKS);
  readonly social = input<readonly FooterLink[]>(DEFAULT_SOCIAL);

  protected readonly year = new Date().getFullYear();
}
