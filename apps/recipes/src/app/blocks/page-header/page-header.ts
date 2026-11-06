import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  VoltBreadcrumbItem,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
  VoltBreadcrumbs,
  VoltNativeBreadcrumbLink,
  VoltNativeButton,
} from 'volt';

export interface Crumb {
  readonly label: string;
  /** Omit on the last crumb: it renders as the current page. */
  readonly href?: string;
}

export interface HeaderAction {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
}

/**
 * Page header for dashboards, settings, admin screens and detail pages: breadcrumbs, the page
 * title, an optional description, then actions.
 *
 * The title is the page's `h1`. Actions are data, not projected markup: every entry becomes a real
 * button that emits `(action)` with its `id`, so a header cannot be copied with decorative buttons.
 * The `primary` action is solid and sits last (it stays nearest the content on narrow screens); the
 * `secondary` ones are outlined. Below the `md` container width the title stacks over the actions,
 * and the actions share the row.
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBreadcrumbs,
    VoltBreadcrumbList,
    VoltBreadcrumbItem,
    VoltNativeBreadcrumbLink,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    VoltNativeButton,
  ],
  host: { class: 'block' },
  template: `
    <header class="@container border-b border-border pb-5">
      @if (breadcrumbs().length) {
        <volt-breadcrumbs ariaLabel="Breadcrumb" class="mb-3 block">
          <volt-breadcrumb-list>
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
              <volt-breadcrumb-item>
                @if (last || !crumb.href) {
                  <volt-breadcrumb-page>{{ crumb.label }}</volt-breadcrumb-page>
                } @else {
                  <a voltBreadcrumbLink [href]="crumb.href">{{ crumb.label }}</a>
                }
              </volt-breadcrumb-item>
              @if (!last) {
                <volt-breadcrumb-separator />
              }
            }
          </volt-breadcrumb-list>
        </volt-breadcrumbs>
      }

      <div class="flex flex-col gap-4 @2xl:flex-row @2xl:items-start @2xl:justify-between">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight text-foreground @2xl:text-3xl">
            {{ title() }}
          </h1>
          @if (description()) {
            <p class="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
              {{ description() }}
            </p>
          }
        </div>

        @if (primary() || secondary().length) {
          <div class="flex flex-wrap items-center gap-2 @2xl:shrink-0 @2xl:justify-end">
            @for (item of secondary(); track item.id) {
              <button
                voltButton
                variant="outline"
                type="button"
                [disabled]="item.disabled ?? false"
                (click)="action.emit(item.id)"
              >
                {{ item.label }}
              </button>
            }
            @if (primary(); as main) {
              <button
                voltButton
                type="button"
                [disabled]="main.disabled ?? false"
                (click)="action.emit(main.id)"
              >
                {{ main.label }}
              </button>
            }
          </div>
        }
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input('Projects');
  readonly description = input<string | null>('Everything your team is shipping, in one place.');
  readonly breadcrumbs = input<readonly Crumb[]>([
    { label: 'Home', href: '#home' },
    { label: 'Workspace', href: '#workspace' },
    { label: 'Projects' },
  ]);
  readonly primary = input<HeaderAction | null>({ id: 'create', label: 'New project' });
  readonly secondary = input<readonly HeaderAction[]>([
    { id: 'export', label: 'Export' },
    { id: 'share', label: 'Share' },
  ]);

  /** The `id` of the action that was pressed. */
  readonly action = output<string>();
}
