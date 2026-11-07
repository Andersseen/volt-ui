import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  NgpDatePickerCellRender,
  NgpDatePickerRowRender,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePickerGrid,
  VoltDatePickerLabel,
  VoltDateRangePicker,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltNativeButton,
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuContentItem,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
  VoltSpinner,
  type VoltNavigationMenuLayout,
  type VoltNavigationMenuVariant,
} from '@voltui/components';

/**
 * Navigation menu presentation: `?variant=pill&layout=contained` in the hash query picks the
 * combination, so each browser test loads exactly one (`#nav-variants?variant=pill`).
 */
@Component({
  selector: 'app-nav-variants',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuList,
    VoltNavigationMenuItem,
    VoltNavigationMenuLink,
    VoltNavigationMenuTrigger,
    VoltNavigationMenuContent,
    VoltNavigationMenuContentItem,
  ],
  template: `
    <div class="flex justify-center p-4">
      <volt-navigation-menu aria-label="Primary" [variant]="variant" [layout]="layout">
        <volt-navigation-menu-list>
          <volt-navigation-menu-item value="home">
            <a voltNavigationMenuLink href="#nav-variants" [active]="current() === 'home'">Home</a>
          </volt-navigation-menu-item>
          <volt-navigation-menu-item value="docs">
            <a voltNavigationMenuLink href="#nav-variants" [active]="current() === 'docs'">Docs</a>
          </volt-navigation-menu-item>
          <volt-navigation-menu-item value="products">
            <volt-navigation-menu-trigger [content]="productsTpl"
              >Products</volt-navigation-menu-trigger
            >
            <ng-template #productsTpl>
              <volt-navigation-menu-content>
                <volt-navigation-menu-content-item>
                  <a href="#nav-variants">Analytics</a>
                </volt-navigation-menu-content-item>
                <volt-navigation-menu-content-item>
                  <a href="#nav-variants">Reports</a>
                </volt-navigation-menu-content-item>
              </volt-navigation-menu-content>
            </ng-template>
          </volt-navigation-menu-item>
          <volt-navigation-menu-item value="beta">
            <a voltNavigationMenuLink href="#nav-variants" disabled>Beta</a>
          </volt-navigation-menu-item>
        </volt-navigation-menu-list>
      </volt-navigation-menu>
    </div>
    <button type="button" id="move-current" (click)="current.set('home')">Go home</button>
  `,
})
export class NavVariantsFixture {
  private readonly params = new URLSearchParams(location.hash.split('?')[1] ?? '');
  protected readonly variant = (this.params.get('variant') ??
    'subtle') as VoltNavigationMenuVariant;
  protected readonly layout = (this.params.get('layout') ?? 'inline') as VoltNavigationMenuLayout;
  protected readonly current = signal('docs');
}

/** A range picker opened on a fixed month far from "today", with a blocked day. */
@Component({
  selector: 'app-date-range',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltDateRangePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    VoltDatePickerLabel,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
  ],
  template: `
    <volt-date-range-picker
      [(startDate)]="start"
      [(endDate)]="end"
      [(focusedDate)]="focused"
      [dateDisabled]="blocked"
      [min]="min"
    >
      <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
      <volt-date-picker-grid>
        <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
          <volt-date-picker-cell *ngpDatePickerCellRender="let day">
            <volt-date-picker-date-button>{{ day.getDate() }}</volt-date-picker-date-button>
          </volt-date-picker-cell>
        </div>
      </volt-date-picker-grid>
    </volt-date-range-picker>
    <p id="range">{{ start()?.getDate() ?? '-' }}..{{ end()?.getDate() ?? '-' }}</p>
  `,
})
export class DateRangeFixture {
  protected readonly start = signal<Date | undefined>(new Date(2031, 2, 10));
  protected readonly end = signal<Date | undefined>(new Date(2031, 2, 13));
  protected readonly focused = signal<Date | undefined>(undefined);
  /** Nothing before the 3rd; the 20th is unavailable. */
  protected readonly min = new Date(2031, 2, 3);
  protected readonly blocked = (date: Date): boolean =>
    date.getFullYear() === 2031 && date.getMonth() === 2 && date.getDate() === 20;
  protected readonly label = () =>
    (this.focused() ?? new Date()).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/** Spinner modes and sizes, and Empty State compositions, including untranslatable long text. */
@Component({
  selector: 'app-feedback-stable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltSpinner,
    VoltNativeButton,
    VoltEmptyState,
    VoltEmptyStateTitle,
    VoltEmptyStateDescription,
  ],
  template: `
    <section aria-label="Spinners" class="flex items-center gap-4 text-primary">
      <volt-spinner size="sm" data-testid="sm" />
      <volt-spinner size="md" data-testid="md" />
      <volt-spinner size="lg" data-testid="lg" />
      <volt-spinner label="Loading results" data-testid="status" />
      <button voltButton type="button" disabled data-testid="busy-button">
        <volt-spinner size="sm" />
        Saving…
      </button>
    </section>

    <section aria-label="Empty states" class="mt-6 grid gap-4">
      <volt-empty-state data-testid="full">
        <svg
          slot="icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
        <volt-empty-state-title>No projects yet</volt-empty-state-title>
        <volt-empty-state-description>Create your first project.</volt-empty-state-description>
        <div slot="actions">
          <button voltButton type="button">Create project</button>
          <button voltButton type="button" variant="outline">Import</button>
        </div>
      </volt-empty-state>
      <volt-empty-state data-testid="long">
        <volt-empty-state-title
          >Keine_Einträge_in_dieser_Projektsammlungsübersichtsseite_vorhanden</volt-empty-state-title
        >
        <volt-empty-state-description
          >Überraschenderweise_gibt_es_hier_noch_keine_Einträge_in_dieser_Sammlung_und_auch_keine_Filter</volt-empty-state-description
        >
      </volt-empty-state>
      <volt-empty-state data-testid="title-only">
        <volt-empty-state-title>Nothing here</volt-empty-state-title>
      </volt-empty-state>
    </section>
  `,
})
export class FeedbackStableFixture {}
