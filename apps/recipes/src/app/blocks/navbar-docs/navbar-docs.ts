import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LmnGithubIcon, LmnSearchIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltBreadcrumbItem,
  VoltBreadcrumbLink,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbs,
  VoltBreadcrumbSeparator,
  VoltInput,
  VoltNativeButton,
  VoltSearch,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
} from 'volt';

interface Section {
  readonly label: string;
  readonly href: string;
}

/**
 * A documentation header: brand and version, the section tabs, where you are, and search.
 *
 * Two rows rather than one long bar. The top row is the product (brand, version, search, source);
 * the second is the place (sections and the breadcrumb trail). On a narrow container the section
 * tabs scroll sideways inside their own row instead of wrapping, and the breadcrumb keeps only its
 * last two crumbs, so the header never grows taller than two lines.
 *
 * The reading-progress hairline under it is pure CSS: a scroll-driven animation
 * (`animation-timeline: scroll(root)`) in browsers that have one, nothing at all in the others or
 * under reduced motion. No scroll listener, nothing to clean up, and the server renders it as is.
 */
@Component({
  selector: 'app-navbar-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltBreadcrumbs,
    VoltBreadcrumbList,
    VoltBreadcrumbItem,
    VoltBreadcrumbLink,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    VoltInput,
    VoltNativeButton,
    VoltSearch,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    LmnGithubIcon,
    LmnSearchIcon,
  ],
  template: `
    <header class="@container relative border-b border-border bg-background/90 backdrop-blur">
      <div class="flex h-14 items-center gap-3 px-4 @3xl:px-6">
        <a
          href="#"
          class="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          aria-label="Acme Docs home"
        >
          <span
            class="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            aria-hidden="true"
            >A</span
          >
          <span class="hidden @sm:inline">Acme Docs</span>
        </a>

        <!-- volt-select's class styles its trigger; the wrapper owns width and visibility. -->
        <div class="hidden w-28 shrink-0 @lg:block">
          <volt-select
            aria-label="Documentation version"
            [value]="version()"
            (valueChange)="pickVersion($event)"
          >
            <volt-select-content>
              @for (option of versions; track option) {
                <volt-select-item [value]="option">{{ option }}</volt-select-item>
              }
            </volt-select-content>
          </volt-select>
        </div>

        <volt-search class="relative ml-auto min-w-0 flex-1 @md:max-w-xs">
          <lmn-search
            [size]="16"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <volt-input
            type="search"
            size="sm"
            class="pl-9"
            placeholder="Search the docs"
            ariaLabel="Search the docs"
          />
        </volt-search>

        <a
          voltButton
          variant="ghost"
          size="icon"
          href="https://github.com"
          target="_blank"
          rel="noopener"
          aria-label="Source on GitHub"
        >
          <lmn-github [size]="20" />
        </a>
      </div>

      <div class="flex items-center gap-4 px-4 pb-2 @3xl:px-6">
        <nav aria-label="Sections" class="sections -mx-1 flex min-w-0 gap-1 overflow-x-auto px-1">
          @for (section of sections; track section.href) {
            <a
              voltButton
              variant="ghost"
              size="sm"
              [href]="section.href"
              [attr.aria-current]="section.href === current ? 'page' : null"
              [class]="
                section.href === current
                  ? 'shrink-0 bg-muted text-foreground'
                  : 'shrink-0 font-normal text-muted-foreground'
              "
              >{{ section.label }}</a
            >
          }
        </nav>

        <volt-breadcrumbs class="ml-auto hidden min-w-0 @2xl:block">
          <volt-breadcrumb-list class="flex-nowrap">
            <volt-breadcrumb-item class="hidden @5xl:inline-flex">
              <volt-breadcrumb-link href="#">Docs</volt-breadcrumb-link>
            </volt-breadcrumb-item>
            <volt-breadcrumb-separator class="hidden @5xl:inline-flex" />
            <volt-breadcrumb-item>
              <volt-breadcrumb-link href="#">Components</volt-breadcrumb-link>
            </volt-breadcrumb-item>
            <volt-breadcrumb-separator />
            <volt-breadcrumb-item class="min-w-0">
              <volt-breadcrumb-page class="truncate">Date picker</volt-breadcrumb-page>
            </volt-breadcrumb-item>
          </volt-breadcrumb-list>
        </volt-breadcrumbs>

        <volt-badge variant="secondary" class="hidden shrink-0 @md:inline-flex">
          Updated 2 days ago
        </volt-badge>
      </div>

      <span class="progress" aria-hidden="true"></span>
    </header>
  `,
  styles: `
    .sections {
      scrollbar-width: none;
    }

    .progress {
      position: absolute;
      inset-inline: 0;
      bottom: -1px;
      height: 2px;
      background: var(--primary);
      transform: scaleX(0);
      transform-origin: left;
      opacity: 0;
    }

    @supports (animation-timeline: scroll()) {
      @media (prefers-reduced-motion: no-preference) {
        .progress {
          opacity: 1;
          animation: read linear both;
          animation-timeline: scroll(root);
        }
      }
    }

    @keyframes read {
      to {
        transform: scaleX(1);
      }
    }
  `,
})
export class NavbarDocs {
  protected readonly versions = ['v2.4', 'v2.3', 'v1.x'];
  protected readonly version = signal('v2.4');

  protected pickVersion(value: unknown): void {
    if (typeof value === 'string') this.version.set(value);
  }

  protected readonly current = '#components';
  protected readonly sections: readonly Section[] = [
    { label: 'Guides', href: '#guides' },
    { label: 'Components', href: '#components' },
    { label: 'API', href: '#api' },
    { label: 'Examples', href: '#examples' },
    { label: 'Changelog', href: '#changelog' },
  ];
}
